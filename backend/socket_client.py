import socket
import sys

def send_pdf_and_receive_result(pdf_path, vm_ip, port=5000):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
        client_socket.connect((vm_ip, port))
        print(f"[+] Connected to VM at {vm_ip}:{port}")

        # Send the filename first
        filename = pdf_path.split("\\")[-1]  # Use "\\" for Windows paths
        client_socket.sendall(filename.encode() + b"\n\n")

        # Send the PDF file in chunks
        try:
            with open(pdf_path, "rb") as file:
                while chunk := file.read(4096):
                    client_socket.sendall(chunk)

            client_socket.shutdown(socket.SHUT_WR)  # Signal that no more data will be sent
            print("[*] PDF sent. Waiting for result...")

            # Receive analysis result
            result = client_socket.recv(4096).decode()
            print("[+] Received Analysis Result:\n", result)

        except FileNotFoundError:
            print(f"[!] Error: File {pdf_path} not found.")

if __name__ == "__main__":
    """if len(sys.argv) < 3:
        print("Usage: python client.py <pdf_path> <vm_ip>")
        sys.exit(1)"""

    pdf_path = sys.argv[1]#r"E:\FYP\Development\app-2\backend\uploads\00e59658da4541befe4ab215eadf4c7ad920a05727ca5d5899dea99253d4e3c5.pdf"  # Get file path from command-line argument
    vm_ip = "192.168.1.105"  # VM IP passed as argument
    send_pdf_and_receive_result(pdf_path, vm_ip)
