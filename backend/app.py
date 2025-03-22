from flask import Flask, request, jsonify,session
from flask_cors import CORS  # Import CORS
import sqlite3
import os
import re
from werkzeug.utils import secure_filename
import subprocess  
from elasticsearch import Elasticsearch
from elasticsearch.exceptions import ConnectionError
from datetime import datetime, timezone, timedelta
from urllib.parse import urlencode
from flask import send_from_directory
import mimetypes
import json
from static_rules import calculate_threat_score


app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Replace with a strong, secure key
CORS(app, supports_credentials=True,origins=['http://localhost:3000'])  # Enable CORS for all routes


ES_USERNAME = 'elastic'
ES_PASSWORD = 'l9dDXBoSC3I=kWRmDQao'
# Elasticsearch client setup
es = Elasticsearch(
    "https://localhost:9200",
    basic_auth=(ES_USERNAME, ES_PASSWORD),
    verify_certs=False  # Disable SSL verification if you're using self-signed certificates
)

# You can add a check to verify that the connection works
try:
    # Check if the cluster is available
    if es.ping():
        print("Connected to Elasticsearch!")
    else:
        print("Could not connect to Elasticsearch.")
except ConnectionError as e:
    print(f"Error connecting to Elasticsearch: {e}")


# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstname TEXT NOT NULL,
            lastname TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            picture_path TEXT DEFAULT NULL,
            uploaded_files TEXT DEFAULT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Call the function to initialize the database
init_db()

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    password = data.get('password')

    # Validate required fields
    if not all([first_name, last_name, email, password]):
        return jsonify({'error': 'First name, last name, email, and password are required.'}), 400

    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        
        # Insert user into the database
        cursor.execute('INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)', 
                       (first_name, last_name, email, password))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Signup successful!'}), 201

    except sqlite3.IntegrityError as e:
        if "UNIQUE" in str(e):
            return jsonify({'error': 'Email already exists. Please use a different email.'}), 400
        return jsonify({'error': 'Database error occurred.'}), 500

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to insert user.'}), 500



@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()

        # Check if the user exists
        cursor.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password))
        user = cursor.fetchone()

        if user:
            # Store the logged-in user's email in the session
            session['user_email'] = email

            return jsonify({"email": email, "message": "Login successful"}), 200
        else:
            return jsonify({'error': 'Invalid email or password.'}), 401
    except Exception as e:
        return jsonify({'error': 'Failed to login user.'}), 500
    finally:
        conn.close()
@app.route('/api/session', methods=['GET'])
def get_session_user():
    if 'user_email' in session:
        #print("Returning user email:", session['user_email'])  # Debugging
        return jsonify({"email": session['user_email']}), 200
    print("No user logged in")  # Debugging
    return jsonify({"error": "No user logged in"}), 401


@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_email', None)  # Remove the email from the session
    return jsonify({'message': 'Logged out successfully!'}), 200

@app.route("/api/user-info", methods=["GET"])
def user_info():
    if "user_email" not in session:
        return jsonify({"error": "Unauthorized access. Please log in first."}), 401

    email = session["user_email"]

    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()

        # Fetch user information including profile picture path
        cursor.execute("SELECT firstname, lastname, email, picture_path FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

        if user:
            # Extract profile image filename instead of absolute path
            profile_image_filename = None
            if user[3]:  # If there's a stored image path
                profile_image_filename = os.path.basename(user[3])  # Extract only the filename
            
            return jsonify({
                "firstname": user[0],
                "lastname": user[1],
                "email": user[2],
                "profileImage": f"/profile_pics/{profile_image_filename}" if profile_image_filename else None
            }), 200
        else:
            return jsonify({"error": "User not found."}), 404
    except Exception as e:
        return jsonify({"error": "Failed to fetch user information."}), 500
    finally:
        conn.close()
@app.route('/profile_pics/<path:filename>')
def serve_profile_picture(filename):
    return send_from_directory(app.config['UPLOAD_PIC'], filename)


UPLOAD_PIC = r"E:\FYP\Development\app-2\backend\profile_pics"
ALLOWED_EXT = {ext.lower().strip() for ext in {'jpeg', 'jpg', 'png', 'gif'}}


app.config['UPLOAD_PIC'] = UPLOAD_PIC

def allowed_files(filename):
    if '.' not in filename:
        print("❌ No file extension found!")
        return False

    ext = filename.rsplit('.', 1)[1].strip().lower()
    ext = ext.encode("utf-8").decode("utf-8")  # Normalize encoding

    if ext in ALLOWED_EXT:
        print("✅ File extension is allowed.")
        return True
    else:
        print(f"❌ File extension '{ext}' is NOT in {ALLOWED_EXT}")
        return False

@app.route('/api/edit-user', methods=['POST'])
def edit_user():
    print("Request Content-Type:", request.content_type)
    if 'user_email' not in session:
        return jsonify({'error': 'Unauthorized access. Please log in first.'}), 401

    email = session['user_email']
    firstname = request.form.get('firstname')
    lastname = request.form.get('lastname')
    new_email = request.form.get('email')
    current_password = request.form.get('currentPassword')
    new_password = request.form.get('newPassword')

    profile_image = request.files.get('profileImage')

    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()

        # Validate current password
        cursor.execute('SELECT password, picture_path FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()

        if not user or user[0] != current_password:
            return jsonify({'error': 'Incorrect current password.'}), 401

        # Ensure upload folder exists
        if not os.path.exists(app.config['UPLOAD_PIC']):
            os.makedirs(app.config['UPLOAD_PIC'])
            print(f"✅ Created upload folder: {app.config['UPLOAD_PIC']}")

        # Default to existing image path
        profile_image_path = user[1] if user[1] else None  

        if profile_image:
            print(f"✅ Received file: {profile_image.filename}")
            if not profile_image.filename:  # Check if filename is empty
                print("⚠️ ERROR: profile_image.filename is EMPTY!")
            else:
                print(f"✅ Checking file: {profile_image.filename}")

            print(f"🔍 Allowed extensions (DEBUG): {repr(ALLOWED_EXT)}")


            if allowed_files(profile_image.filename):
                print(f"✅ File is allowed: {profile_image.filename}")

                filename = secure_filename(email + "_" + profile_image.filename)  
                profile_image_path = os.path.join(app.config['UPLOAD_PIC'], filename)

                try:
                    print(f"📝 Attempting to save file at: {profile_image_path}")
                    profile_image.save(profile_image_path)
            
                    if os.path.exists(profile_image_path):
                     print(f"📂 File exists at {profile_image_path}")
                    else:
                     print("⚠️ ERROR: File does NOT exist after saving!")
        
                except Exception as e:
                    print(f"❌ Failed to save file: {e}")
            else:
                print(f"❌ File type not allowed: {profile_image.filename}")
        else:
            print("⚠️ No file uploaded!")

        print(f"📌 Final image path before DB update: {profile_image_path}")

        # Update user details in DB
        cursor.execute('''
            UPDATE users
            SET firstname = ?, lastname = ?, email = ?, password = ?, picture_path = ?
            WHERE email = ?
        ''', (firstname, lastname, new_email, 
              new_password if new_password else current_password, 
              profile_image_path if profile_image_path else user[1], email))

        conn.commit()
        print(f"📌 Updated DB with new image path: {profile_image_path}")

        # Confirm update
        cursor.execute("SELECT picture_path FROM users WHERE email = ?", (new_email,))
        updated_path = cursor.fetchone()
        print(f"Updated profile image path in DB: {updated_path}")

        session['user_email'] = new_email  
        return jsonify({'message': 'Profile updated successfully.', 'profileImage': profile_image_path}), 200

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': 'Failed to update profile.'}), 500

    finally:
        conn.close()



    
    #####################PDF Analysis#######################

# Set up the directory to store uploaded files
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf'}

# Check if the uploaded file is a valid PDF
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_static_result(result):
    # Parse the static analysis result string into a dictionary
    # Example assumes JSON-like static analysis output
    try:
        return json.loads(result)
    except json.JSONDecodeError:
        return {"error": "Invalid static analysis result format"}

def parse_dynamic_result(result):
    # Parse the dynamic analysis result string into a dictionary
    # Example assumes JSON-like dynamic analysis output
    try:
        return json.loads(result)
    except json.JSONDecodeError:
        return {"error": "Invalid dynamic analysis result format"}
def parse_result(result):
    try:
        return json.loads(result)
    except json.JSONDecodeError:
        return {"error": "Invalid rules result format"}

def store_analysis_result(file_path, analysis_type, static_result, dynamic_result,email,Federated_result):
    timestamp = datetime.now(timezone.utc).isoformat()
    user_email = email

    document = {
        "file_path": file_path,
        "user_email": user_email,  # Add user's full name
        "analysis_type": analysis_type,
        "timestamp": timestamp,
        "static_analysis": static_result if analysis_type in ['static', 'both'] else None,
        "dynamic_analysis": dynamic_result if analysis_type in ['dynamic', 'both'] else None,
    }

    try:
        # Store full analysis in 'pdf-analysis' index
        response = es.index(index="pdf-analysis", document=document)
        document_id = response['_id']
        get_response = es.get(index="pdf-analysis", id=document_id)
            
        # Calculate threat score using static_rules.py
        static_rules_result = calculate_threat_score(static_result, dynamic_result)
         
        print("Static Rules Result:", json.dumps(static_rules_result, indent=4))
        static_threatscore=static_rules_result["threatscore"]
        static_threatscore=static_threatscore/100
        #-----------------------Federated part------------------#
        # Extract Confidence Score (between 0 and 1, rounded to 1 decimal place)
        confidence_match = re.search(r'Confidence Score:\s*([\d.]+)', Federated_result)
        Federated_Score = round(float(confidence_match.group(1)), 1) if confidence_match else None

        if "Final Prediction: Benign" in Federated_result and Federated_Score is not None:
            Federated_Score = round(1.0 - Federated_Score, 1)

        print("\nnnnnnnnnnFederated score",Federated_Score)
        print("\nnnnnnnnnnthreatscore",static_threatscore)

        # Extract client name (e.g., "client2")
        model_match = re.search(r'Request sent to (\w+)', Federated_result)
        Federated_model_verdict = model_match.group(1) if model_match else "Unknown"

        # Extract date
        date_match = re.search(r'Date:\s*([\d-]+)', Federated_result)
        Global_model_update = date_match.group(1) if date_match else None
        #-----------------------Federated part------------------#
        # Weights
        weight_threat = 0.6  # 60% weight for Threat Score
        weight_ai = 0.4      # 40% weight for AI Confidence
        # Compute Weighted Score
        final_score = (weight_threat * static_threatscore) + (weight_ai * Federated_Score)
        # Make Final Decision
        classification = "Malicious" if final_score >= 0.7 else "Safe"
        print("\nnnClassification",final_score)



        detection_data = {
                "file_path": file_path,
                "user_email": user_email,  # Add user's full name
                "timestamp": timestamp,
                "Static_verdict": 1 if classification == "Malicious" else 0,
                "Federated_model_verdict":Federated_model_verdict,
                "Global_model_update": Global_model_update,
                "Threat_score":final_score * 100,
                "Remaining_score":(1-final_score) * 100,
                "Classification":final_score,
                "Remaining_class": 1- final_score

        }
        detection_response = es.index(index="detection", document=detection_data)

            # Verify the document was stored successfully in detection index
        detection_id = detection_response['_id']
        detection_get_response = es.get(index="detection", id=detection_id)
        if detection_get_response.get('found', False):
            print(f"Detection document successfully stored in Elasticsearch: {detection_get_response['_source']}")
        else:
            print("Detection document not found in Elasticsearch.")

        # Verify the document was stored successfully
        if get_response.get('found', False):
            print(f"\n\n\nDocument successfully stored in Elasticsearch: {get_response['_source']}")
        else:
            print(f"Document not found in Elasticsearch.")

        return document_id

    except Exception as e:
        print(f"Error storing analysis result in Elasticsearch: {e}")
        return None

@app.route('/api/analyze', methods=['POST'])
def analyze_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    email= request.form.get('userEmail')
    print("\n\n\n\nemail:",email)
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    analysis_type = request.form.get('analysisType')
    
    if not analysis_type:
        return jsonify({'error': 'Analysis type is required.'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        static_result, dynamic_result = None, None
        try:
            if analysis_type == 'static':
                static_result = parse_static_result(
                    subprocess.check_output(['python', 'static_analysis.py', filepath]).decode('utf-8')
                )
                Federated_result = subprocess.check_output(['python', 'socket_client.py', filepath]).decode('utf-8')
            elif analysis_type == 'dynamic':
                dynamic_result = parse_dynamic_result(
                    subprocess.check_output(['python', 'dynamic_analysis.py', filepath]).decode('utf-8')
                )
                Federated_result = subprocess.check_output(['python', 'socket_client.py', filepath]).decode('utf-8')
            elif analysis_type == 'both':
                static_result = parse_static_result(
                    subprocess.check_output(['python', 'static_analysis.py', filepath]).decode('utf-8')
                )                               
                dynamic_result = parse_dynamic_result(
                    subprocess.check_output(['python', 'dynamic_analysis.py', filepath]).decode('utf-8')
                )
                Federated_result = subprocess.check_output(['python', 'socket_client.py', filepath]).decode('utf-8')

            print(Federated_result)
            # Store the result in Elasticsearch and get the document ID
            document_id = store_analysis_result(filepath, analysis_type, static_result, dynamic_result,email,Federated_result)
            #print({'result': {'static': static_result, 'dynamic': dynamic_result}})
           
            return jsonify({'result': {'static': static_result, 'dynamic': dynamic_result}})
        
        except subprocess.CalledProcessError as e:
            return jsonify({'error': 'Error during analysis', 'message': str(e)}), 500

        except Exception as e:
            return jsonify({'error': 'An error occurred', 'message': str(e)}), 500

    return jsonify({'error': 'Invalid file format'}), 400


@app.route('/user/history', methods=['GET'])
def get_user_history():
    try:
        user_email = session.get("user_email")
        print("Session User Email:", user_email)  # Debugging line

        if not user_email:
            return jsonify({"error": "User not logged in"}), 401

        query = {
            "size": 50,  # Fetch the last 50 results
            "query": {
                "match": {"user_email": user_email}
            }
        }

        res = es.search(index="pdf-analysis", body=query)

        history = []
        for hit in res["hits"]["hits"]:
            timestamp_str = hit["_source"]["timestamp"]
            timestamp_dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))  # Convert string to datetime
            to_time = int(timestamp_dt.timestamp() * 1000)  # Convert to milliseconds
            from_time = int((timestamp_dt - timedelta(seconds=5)).timestamp() * 1000)  # 5 sec earlier

            # Construct Grafana URL
            grafana_base_url = "http://localhost:3001/d/befbzx7zyxt6oe/user"
            params = {
                "orgId": 1,
                "from": from_time,
                "to": to_time,
                "timezone": "browser",
                "var-user_email": user_email
            }
            grafana_link = f"{grafana_base_url}?{urlencode(params)}"

            history.append({
                "date": timestamp_str.split("T")[0],
                "fileType": "PDF",
                "analysisType": hit["_source"]["analysis_type"].capitalize() + " Analysis",
                "status": "Success",
                "resultLink": grafana_link  # Use Grafana URL
            })

        print(history)
        return jsonify(history)

    except Exception as e:
        print("Error in /user/history:", str(e))  # Debugging line
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@app.route('/api/detection-stats', methods=['GET'])
def get_detection_stats():
    index_name = "detection"

    # Get total number of documents
    total_files = es.count(index=index_name)["count"]

    # Count malicious and benign files
    query_malicious = {"query": {"term": {"Static_verdict": 1}}}
    query_benign = {"query": {"term": {"Static_verdict": 0}}}

    malicious_count = es.count(index=index_name, body=query_malicious)["count"]
    benign_count = es.count(index=index_name, body=query_benign)["count"]

    # Query for the latest 'Global_model_update' date
    query_latest_update = {
    "size": 1,
    "query": {"exists": {"field": "Global_model_update"}},
    "sort": [{"Global_model_update": {"order": "desc", "unmapped_type": "date"}}]           
    }
    response_update = es.search(index=index_name, body=query_latest_update)
    latest_update = None
    if response_update["hits"]["hits"]:
        latest_update = response_update["hits"]["hits"][0]["_source"].get("Global_model_update")

    # Fetch file records for the table
    query_records = {"size": 5, "sort": [{"timestamp": "desc"}]}
    response_records = es.search(index=index_name, body=query_records)
    records = [
        {
            "timestamp": hit["_source"].get("timestamp").split("T")[0],  # Extract only date
            "user_email": hit["_source"].get("user_email"),
            "static_verdict": "Malicious" if hit["_source"].get("Static_verdict") == 1 else "Safe",
            "predicted_model": hit["_source"].get("Federated_model_verdict", "Unknown"),
        }
        for hit in response_records["hits"]["hits"]
    ]

    return jsonify({
        "total_files": total_files,
        "malicious_count": malicious_count,
        "benign_count": benign_count,
        "latest_update": latest_update,
        "records": records
    })

@app.route("/api/records", methods=["GET"])
def get_records():
    index_name = "detection"
    query = {"size": 1000, "query": {"match_all": {}}}
    response = es.search(index=index_name, body=query)

    records = []
    for hit in response["hits"]["hits"]:
        source = hit["_source"]
        records.append({
            "timestamp": source["timestamp"].split("T")[0],  # Extract only date
            "useremail": source["user_email"],
            "activity": "Uploaded a File",
            "status": "Malicious" if source["Static_verdict"] == 1 else "Benign",
            "model": "Client Model 1" if source["Federated_model_verdict"] == "client1" else 
                     "Client Model 2" if source["Federated_model_verdict"] == "client2" else "Unknown"
        })

    return jsonify({"records": records})
if __name__ == '__main__':
    app.run(debug=True)