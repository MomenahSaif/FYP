import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";
import { IoMdClose } from "react-icons/io";

const Admin = () => {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(true);
  const [totalFiles, setTotalFiles] = useState(0);
  const [maliciousCount, setMaliciousCount] = useState(0);
  const [benignCount, setBenignCount] = useState(0);
  const [latestUpdate, setLatestUpdate] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/detection-stats") // Adjust if Flask runs on a different port
      .then((response) => response.json())
      .then((data) => {
        setTotalFiles(data.total_files);
        setMaliciousCount(data.malicious_count);
        setBenignCount(data.benign_count);
        setLatestUpdate(data.latest_update);
        setRecords(
          data.records.map(record => ({
            ...record,
            predicted_model: record.predicted_model === "client1" ? "Client Model 1" :
                             record.predicted_model === "client2" ? "Client Model 2" :
                             record.predicted_model  // Keep it unchanged for other values
          }))
        );
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleViewMore = () => {
    navigate("/admin/allrecords");
  };

  return (
    <>
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div className="stats-container">
        {/* Total Files Uploaded */}
        <div className="stat-box">
          <div className="stat-icon-container upload-icon-container">
            <img src="https://cdn-icons-png.flaticon.com/512/725/725008.png" alt="File Upload Icon" className="stat-icon" />
          </div>
          <p>Total Files Uploaded</p>
          <h2>{totalFiles}</h2>
        </div>

        {/* Malicious Files Detected */}
        <div className="stat-box">
          <div className="stat-icon-container danger-icon-container">
            <img src="https://cdn-icons-png.flaticon.com/512/814/814389.png" alt="Danger Icon" className="stat-icon" />
          </div>
          <p>Malicious Files Detected</p>
          <h2>{maliciousCount}</h2>
        </div>

        {/* Benign Files Detected */}
        <div className="stat-box">
          <div className="stat-icon-container benign-icon-container">
            <img src="https://cdn-icons-png.flaticon.com/512/2258/2258843.png" alt="Document Icon" className="stat-icon" />
          </div>
          <p>Benign Files Detected</p>
          <h2>{benignCount}</h2>
        </div>
      </div>

      {latestUpdate && showNotification && (
        <div className="notification-container">
          <img src="https://cdn-icons-png.flaticon.com/512/2645/2645890.png" alt="Notification Icon" className="notification-icon" />
          <span className="notification-date"><strong>{latestUpdate}</strong></span>
          <span className="notification-message">Global Model was Updated</span>
          <IoMdClose className="notification-close" onClick={() => setShowNotification(false)} />
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>User Email</th>
              <th>Activity</th>
              <th>Status</th>
              <th>Predicted By Model</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index}>
                <td>{record.timestamp}</td>
                <td>{record.user_email}</td>
                <td>Uploaded a File</td>
                <td className={record.static_verdict === "Malicious" ? "malicious" : "benign"}>
                  {record.static_verdict}
                </td>
                <td>{record.predicted_model}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="view-more" onClick={handleViewMore}>View more</p>
      </div>
    </>
  );
};

export default Admin;
