import os
import re
import fitz  # PyMuPDF
import PyPDF2
from pdfminer.high_level import extract_text
from pdfminer.pdfparser import PDFSyntaxError
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfparser import PDFParser
from pdfminer.pdfpage import PDFPage
import json
import sys

def ensure_json_serializable(data):
    """Convert non-JSON-serializable data types into compatible formats."""
    if isinstance(data, bytes):
        return data.decode(errors='ignore')  # Convert bytes to string
    if isinstance(data, (list, tuple)):
        return [ensure_json_serializable(item) for item in data]
    if isinstance(data, dict):
        return {key: ensure_json_serializable(value) for key, value in data.items()}
    try:
        return str(data)  # Attempt conversion
    except Exception:
        return "<Non-Serializable Data>"

def extract_pdf_features(file_path):
    if not os.path.isfile(file_path):
        return {"error": f"File not found at {file_path}"}

    features = {}

    try:
        with open(file_path, 'rb') as file:
            try:
                extracted_text = extract_text(file_path)
            except Exception:
                extracted_text = ""  # Return empty string on error
            
            try:
                file.seek(0)
                parser = PDFParser(file)
                document = PDFDocument(parser)

                features["Object Count"] = sum(1 for _ in PDFPage.create_pages(document)) if document else 0

                file.seek(0)
                raw_content = file.read()
                
                features["Streams"] = "Yes" if b"stream" in raw_content else "No"
                features["Embedded Files"] = "Yes" if '/EmbeddedFiles' in document.catalog else "No"
                features["XREF Table"] = "Yes" if b"xref" in raw_content else "No"
                features["Trailer Dictionary"] = ensure_json_serializable(document.info) if document.info else ""
                features["Javascript Embedded"] = "Yes" if b"JavaScript" in raw_content else "No"
                features["Action Triggers"] = "Yes" if b"/OpenAction" in raw_content or b"/AA" in raw_content else "No"

                url_pattern = re.compile(r'https?://[^\s]+')
                urls = url_pattern.findall(extracted_text)
                features["Suspicious URLs"] = urls if urls else []

                file.seek(0)
                header = file.read(8)
                features["PDF Version"] = header.decode(errors='ignore').strip() if header else ""

                unusual_content = [page_num for page_num, page_text in enumerate(extracted_text.split("\f")) if len(page_text.strip()) < 50]
                features["Unusual Content"] = unusual_content if unusual_content else []

                invisible_found = any(not page_text.strip() for page_text in extracted_text.split("\f"))
                features["Invisible Text"] = "Yes" if invisible_found else "No"
                features["Suspicious Object References"] = "Yes" if b"/ObjStm" in raw_content else "No"
            
            except (PDFSyntaxError, Exception):
                pass  # Proceed to next extraction method

    except (PDFSyntaxError, Exception):
        try:
            pdf_document = fitz.open(file_path)
            features["Object Count"] = pdf_document.page_count if pdf_document else 0

            metadata = pdf_document.metadata
            features["Trailer Dictionary"] = ensure_json_serializable(metadata) if metadata else ""

            try:
                raw_content = pdf_document.write()
                features["Streams"] = "Yes" if b"stream" in raw_content else "No"
                features["Javascript Embedded"] = "Yes" if b"JavaScript" in raw_content else "No"
            except Exception:
                features["Streams"] = ""
                features["Javascript Embedded"] = ""
        
        except Exception:
            try:
                with open(file_path, 'rb') as pdf_file:
                    reader = PyPDF2.PdfReader(pdf_file)
                    num_pages = len(reader.pages)
                    features["Object Count"] = num_pages if num_pages else 0

                    metadata = reader.metadata
                    features["Trailer Dictionary"] = ensure_json_serializable(metadata) if metadata else ""

            except Exception:
                return {"error": f"Failed to process file {file_path}"}

    return features

def output_json(features):
    """Output the features in JSON format."""
    try:
        print(json.dumps(features, indent=4))
    except Exception:
        print(json.dumps({"error": "Failed to output JSON"}))

# Example usage
pdf_path = sys.argv[1]
features = extract_pdf_features(pdf_path)
output_json(features)
