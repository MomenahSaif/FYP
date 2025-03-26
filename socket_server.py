import sys
import os
import socket
import subprocess
import threading
import datetime

# Define the directory to store received PDFs
SAVE_DIR = r"C:\Users\momen\Desktop\Federated\pdf files"
PYTHON_EXECUTABLE = r"C:\Users\momen\Desktop\Federated\venv\Scripts\python.exe"



# Ensure the directory exists
os.makedirs(SAVE_DIR, exist_ok=True)
FLAG_FILE = "global_model_flag.txt"

def run_script(script_name):
    """Runs a script and prints its output in real-time."""
    process = subprocess.Popen(
        [PYTHON_EXECUTABLE, "-u", script_name],  # Use the correct Python executable
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )

    # Print output in real-time
    for line in process.stdout:
        print(f"[{script_name}] {line.strip()}")
        sys.stdout.flush()
        # Check for model update message
        if script_name == "testserver.py" and "Global model updated and saved." in line:
            with open(FLAG_FILE, "w") as f:
                f.write("1")  # Save flag as "1"

    for line in process.stderr:
        print(f"[{script_name} - ERROR] {line.strip()}")

def start_flower_testing():
    """Runs the required commands before starting the server."""
    try:
        # Change directory
        os.chdir(r"C:\Users\momen\Desktop\Federated\\Flower\Testing")

        # Start testserver.py, client1.py, and client2.py in separate threads
        scripts = ["testserver.py", "client1.py", "client2.py"]
        threads = []
        for script in scripts:
            t = threading.Thread(target=run_script, args=(script,))
            t.start()
            threads.append(t)

        # Wait for all threads to complete (optional)
        for t in threads:
            t.join()

    except Exception as e:
        print(f"[!] Error starting Flower/Testing scripts: {e}")

def receive_pdf_and_send_result(port=5000):
    host_ip = "0.0.0.0"  # Listen on all available interfaces

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.bind((host_ip, port))
        server_socket.listen(5)  # Allow up to 5 pending connections
        print(f"[*] Waiting for connections on port {port}...")

        while True:  # Keep server running to handle multiple PDFs
            conn, addr = server_socket.accept()
            threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()

def check_model_update():
    """Check if the global model flag file exists and contains '1'."""
    if not os.path.exists(FLAG_FILE):  # Ensure file exists
        return False  # Assume no update if the file is missing

    try:
        with open(FLAG_FILE, "r") as f:
            return f.read().strip() == "1"
    except Exception as e:
        print(f"[!] Error reading flag file: {e}")
        return False

def handle_client(conn, addr):
    """Handles a single client connection for PDF reception and analysis."""
    with conn:
        print(f"[+] Connected by {addr}")

        # 🔹 Read filename correctly (until newline)
        filename_bytes = b""
        while True:
            chunk = conn.recv(1)  # Read byte-by-byte
            if chunk == b"\n":  # Stop at newline
                break
            filename_bytes += chunk

        filename = filename_bytes.decode().strip()  # Decode safely
        print(f"[*] Receiving file: {filename}")

        # Ensure filename is safe (remove full path, keep only filename)
        filename = os.path.basename(filename)

        # Define the correct save path
        pdf_path = os.path.join(SAVE_DIR, filename)
        print(f"[*] Saving file to: {pdf_path}")

        # Save the received PDF file
        with open(pdf_path, "wb") as file:
            while True:
                data = conn.recv(4096)
                if not data:  # Connection closed or no more data
                    print("[+] File fully received.")
                    break
                file.write(data)

        print("[+] File received. Running analysis...")

        # Run userinput.py and pass the file path
        try:
            result = subprocess.run(
                [PYTHON_EXECUTABLE, "userinput.py", pdf_path],
                stdout=subprocess.PIPE,  # Capture output
                stderr=subprocess.PIPE,
                text=True
            )

             
            output_lines = result.stdout.strip().split("\n")
            request_message = ""
            analysis_result = ""
            for line in output_lines:
                if "Request sent to" in line:  
                    request_message = line.strip()  # Capture request message
                if "Final Prediction" in line:  
                    analysis_result = line.strip()  # Capture prediction

            # If no valid prediction was found, set an error message
            if not analysis_result:
                analysis_result = f"[!] Error: userinput.py did not return a valid prediction.\nStderr: {result.stderr.strip()}"

            # Combine request message and prediction result
            final_output = f"{request_message}\n{analysis_result}" if request_message else analysis_result
            #print(final_output)

        except Exception as e:
            final_output = f"[!] Exception: {e}"


        # Read and reset flag in one operation
        date_info = "None"
        if check_model_update():
            date_info = datetime.date.today().strftime("%Y-%m-%d")
            with open(FLAG_FILE, "w") as f:
                f.write("0")  # Reset flag after reading

        response = f"{final_output}\nDate: {date_info}"
        print(response)
        try:
            conn.sendall(response.encode())
            conn.shutdown(socket.SHUT_WR)
        except socket.error as e:
            print(f"[!] Socket error while sending response: {e}")




if __name__ == "__main__":
    flower_thread = threading.Thread(target=start_flower_testing, daemon=True)  # Run as a background thread
    flower_thread.start()

    receive_pdf_and_send_result()  # Run socket server
