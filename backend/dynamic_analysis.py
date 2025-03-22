import requests
import time
import json
import sys

# Replace with your Hybrid Analysis API key
API_KEY = '6v2vb34gd18482e19lbbpdw6e336a71fn76qoqeqb727c0c4xpqnf9e2c790b44e'
UPLOAD_URL = "https://www.hybrid-analysis.com/api/v2/submit/file"
REPORT_URL_TEMPLATE = "https://www.hybrid-analysis.com/api/v2/report/{job_id}/summary"

headers = {
    "User-Agent": "Falcon Sandbox",
    "api-key": API_KEY,
    "accept": "application/json",
}

def upload_file(file_path):
    """Upload a file to Hybrid Analysis for scanning."""
    environment_id = 110  # Set to Windows 7 (64-bit) as an example.

    with open(file_path, "rb") as file:
        files = {"file": file}
        data = {"environment_id": environment_id}
        
        response = requests.post(UPLOAD_URL, headers=headers, files=files, data=data)
        
        # Check if upload was successful (201 Created)
        if response.status_code == 201:
            data = response.json()
            job_id = data.get("job_id")
            #print(f"File uploaded successfully. Job ID: {job_id}")
            return job_id
        else:
            print("Failed to upload file.")
            print("Status Code:", response.status_code)
            print("Response:", response.text)
            return None

def get_report(job_id):
    """Retrieve the analysis report based on the job ID."""
    report_url = REPORT_URL_TEMPLATE.format(job_id=job_id)
    
    while True:
        response = requests.get(report_url, headers=headers)
        
        if response.status_code == 200:
            report = response.json()
            if report and report.get("verdict") != "pending":
                return report
            else:
                #print("Report still processing, waiting 30 seconds...")
                time.sleep(30)
        else:
            print("Error fetching report:", response.status_code, response.text)
            break

def structure_analysis_features(report):
    """Structure specific features from the analysis report into a JSON format."""
    features = {
        "verdict" : report.get("verdict", []),
        "malware_percentage": report.get("threatscore", 0),
        "process_behavior": report.get("processes", []),
        "network_activity": report.get("network", {}).get("traffic", []),
        "file_system_modifications": report.get("filesystem", {}).get("modifications", []),
        "behavioral_indicators": report.get("threatscore", "Not Available"),
        "dumped_artifacts": report.get("dropped_files", []),
        "persistence_mechanisms": report.get("persistence", []),
        "system_calls": report.get("system", {}).get("calls", []),
        "memory_analysis": report.get("memory", {}).get("summary", "Not Available"),
        "registry_modifications": report.get("registry", {}).get("modifications", []),
        "pdf_reader_exploitation": report.get("pdf", {}).get("exploit", "Not Available"),
        "exploitation_techniques": report.get("exploits", []),
        "user_interface_input_simulation": report.get("user_interactions", [])
    }
    return features

def display_analysis_features(features):
    """Pretty-print the structured features."""
    #print("\n--- Dynamic Analysis Features ---")
    print(json.dumps(features, indent=4))

def analyze_pdf(file_path):
    """Main function to upload PDF, retrieve analysis report, and display features."""
    job_id = upload_file(file_path)
    if job_id:
        report = get_report(job_id)
        if report:
            features = structure_analysis_features(report)
            display_analysis_features(features)
        else:
            print("Failed to retrieve report.")
    else:
        print("File analysis failed.")
def display_malware_info(report):
    """Print the verdict, classification, and percentage of malware from the analysis report."""
    verdict = report.get("verdict", "Not Available")
    classification = report.get("classification", "Not Available")
    malware_percentage = report.get("threatscore", "Not Available")

    print("\n--- Malware Analysis Summary ---")
    print(f"Verdict: {verdict}")
    print(f"Classification: {classification}")
    print(f"Malware Percentage: {malware_percentage}%")

# Example usage
file_path = sys.argv[1]
analyze_pdf(file_path)
