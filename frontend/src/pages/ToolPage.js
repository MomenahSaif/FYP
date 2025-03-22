import React, { useState,useEffect } from 'react';
import axios from 'axios';  // For making API requests
import '../styles/ToolPage.css';
import { getSessionUser } from '../services/authService'; // Import function


const ToolPage = () => {
  const [attachedFile, setAttachedFile] = useState(null);
  const [analysisType, setAnalysisType] = useState('static');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState(''); // Store user email


  useEffect(() => {
    const fetchUserEmail = async () => {
      const email = await getSessionUser();
      console.log("Fetched Email:", email);  // Debugging line
      if (email) {
        setUserEmail(email);
      }
    };
    fetchUserEmail();
  }, []);
  
  const handleFileChange = (event) => {
    setAttachedFile(event.target.files[0]);
  };



  const handleSubmit = async () => {
    if (attachedFile) {
      setIsProcessing(true); // Start processing
  
      const formData = new FormData();
      formData.append('file', attachedFile);
      formData.append('analysisType', analysisType);
      formData.append('userEmail', userEmail); // Send user email to backend

      
  
      try {
        const response = await axios.post('http://127.0.0.1:5000/api/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
  
        // Replace spaces with underscores in the file name
        const sanitizedFileName = attachedFile.name.replace(/\s+/g, '_');

  // Encode the file path for inclusion in the Grafana URL
        const encodedFilePath = encodeURIComponent('./uploads/' + sanitizedFileName);

  // Get the current time and subtract 5 minutes for the time range
        const now = new Date();
        const fromTime = new Date(now.getTime() - 2 * 60 * 1000); 
        const toTime = now;

         //Format the time to ISO 8601 (UTC) for Grafana
        const formattedFrom = fromTime.toISOString();
        const formattedTo = toTime.toISOString();


        // Construct the Grafana URL with the dynamic time range and sanitized file path
        const grafanaLink = `http://localhost:3001/d/ae6hpb8ei19fkf/new?orgId=1&from=${formattedFrom}&to=${formattedTo}&timezone=browser&var-file_path=${encodedFilePath}`;
        

        window.open(grafanaLink, '_blank'); // Opens the link in a new tab

        alert(`Analysis is done. Grafana dashboard has appeared in a new tab`);
            // Reset processing state
        setIsProcessing(false);
      } catch (error) {
        console.error('Error during analysis ,Upload your pdf again');
  
        // Reset processing state on error
        setIsProcessing(false);
        alert('Error during analysis. ,Upload your pdf again');
      }
    }
  };
  
  

  return (
    <div>
      <h2 className="Text2">Seamless Malware Analysis and Detection</h2>
      <p className="Text3">Stay one step ahead of malwares!</p>
    
      <div className="upload-container">
        <h2 className="upload-title">Upload Your PDF</h2>
        <div className="file-upload-area">
          <label className="file-upload-btn">
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
            Browse PDF
          </label>
          {attachedFile && (
            <div className="file-name">
              Uploaded PDF: {attachedFile.name}
              <span className="remove-file" onClick={() => setAttachedFile(null)}> x</span>
            </div>
          )}
        </div>

        <div className="analysis-type">
          <p className="analysis-type-title">Select Analysis type:</p>
          <label>
            <input 
              type="radio" 
              value="static" 
              checked={analysisType === 'static'} 
              onChange={() => setAnalysisType('static')} 
            />
            Static Analysis
          </label>
          <label>
            <input 
              type="radio" 
              value="dynamic" 
              checked={analysisType === 'dynamic'} 
              onChange={() => setAnalysisType('dynamic')} 
            />
            Dynamic Analysis
          </label>
          <label>
            <input 
              type="radio" 
              value="both" 
              checked={analysisType === 'both'} 
              onChange={() => setAnalysisType('both')} 
            />
            Both
          </label>
        </div>

        <button 
          className="submit-btn" 
          onClick={handleSubmit}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Submit'}
        </button>

        {/*result && <div className="result">{typeof result === 'object' ? JSON.stringify(result) : result}</div>*/}
        </div>
    </div>
  );
};

export default ToolPage;