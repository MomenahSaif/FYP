import json

def calculate_threat_score(static_result, dynamic_result):
    threat_score = 0
    
    # Ensure static_result and dynamic_result are dictionaries
    static_result = static_result or {}  # Default to empty dict if None
    dynamic_result = dynamic_result or {}  # Default to empty dict if None
    
    static_score = 0
    dynamic_score = 0

    # Static Analysis Indicators
    if static_result.get("Object Count", 0) > 100:  # High number of objects
        static_score += 5
    if static_result.get("Streams") == "Yes":
        static_score += 3
    if static_result.get("Embedded Files") == "Yes":
        static_score += 10
    if static_result.get("XREF Table") == "Yes":
        static_score += 2
    if static_result.get("Javascript Embedded") == "Yes":
        static_score += 20
    if static_result.get("Action Triggers") == "Yes":
        static_score += 10
    if static_result.get("Suspicious URLs") == "Yes":
        static_score += 15
    if static_result.get("PDF Version") in ["%PDF-1.4", "%PDF-1.5"]:  # Older versions can be exploited
        static_score += 5
    if static_result.get("Unusual Content") and isinstance(static_result["Unusual Content"], list) and static_result["Unusual Content"][0] != 0:
        static_score += 10
    if static_result.get("Invisible Text") == "Yes":
        static_score += 8
    if static_result.get("Suspicious Object References") == "Yes":
        static_score += 10

    # Trailer Dictionary Indicators
    trailer_dict = static_result.get("Trailer Dictionary", [])
    if isinstance(trailer_dict, list):  # Ensure it's a list
        for entry in trailer_dict:
            if isinstance(entry, dict):  # Ensure entry is a dict
                if entry.get("Author") == "<PDFObjRef:14>":
                    static_score += 5
                if entry.get("CreationDate") and entry.get("ModDate") and entry["CreationDate"] == entry["ModDate"]:
                    static_score += 5 

    # Dynamic Analysis Indicators
    if dynamic_result.get("verdict") == "malicious":
        dynamic_score += 40
    if isinstance(dynamic_result.get("process_behavior"), list) and len(dynamic_result["process_behavior"]) > 2:
        dynamic_score += 10
    if isinstance(dynamic_result.get("registry_modifications"), list) and len(dynamic_result["registry_modifications"]) > 0:
        dynamic_score += 10
    if isinstance(dynamic_result.get("file_system_modifications"), list) and len(dynamic_result["file_system_modifications"]) > 0:
        dynamic_score += 10
    if dynamic_result.get("pdf_reader_exploitation") == "Available":
        dynamic_score += 20
    if isinstance(dynamic_result.get("exploitation_techniques"), list) and len(dynamic_result["exploitation_techniques"]) > 0:
        dynamic_score += 15
    if isinstance(dynamic_result.get("user_interface_input_simulation"), list) and len(dynamic_result["user_interface_input_simulation"]) > 0:
        dynamic_score += 10

    # Final Threat Score Calculation
    threat_score = static_score + dynamic_score

    # If both static and dynamic scores are 0, force threat score to 0
    #if static_score == 0 or dynamic_score == 0:
        #threat_score = 0

    # Determine if malicious
    is_malicious = threat_score >= 50
    print("\n\n\n\nThreat Score:", threat_score)
    print("static_score:", static_score)
    print("dynamic_score:", dynamic_score)
    
    return {
        "threatscore": threat_score,#"Malicious" if is_malicious else "Safe"
        "class":"Malicious" if is_malicious else "Safe"
    }
