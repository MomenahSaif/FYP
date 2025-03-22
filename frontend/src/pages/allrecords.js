import React, { useState, useEffect } from "react";
import "../styles/allrecords.css";

const AllRecords = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/records")
      .then(response => response.json())
      .then(data => setRecords(data.records))
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  // Filter records based on selected date and status
  let filteredRecords = records;

  if (selectedDate) {
    filteredRecords = filteredRecords.filter((record) => record.timestamp === selectedDate);
  }

  if (filterStatus !== "All") {
    filteredRecords = filteredRecords.filter((record) => record.status === filterStatus);
  }

  // Separate today's activities and earlier activities
  const todayDate = new Date().toISOString().split("T")[0];
  const todayActivities = filteredRecords.filter(record => record.timestamp === todayDate);
  const earlierActivities = filteredRecords.filter(record => record.timestamp !== todayDate);

  return (
    <>
      <h1 className="dashboard-title">All Records</h1>

      {/* Filters Row */}
      <div className="filter-container">
        <button className={filterStatus === "All" ? "active" : ""} onClick={() => setFilterStatus("All")}>All</button>
        <button className={filterStatus === "Malicious" ? "active malicious" : "malicious"} onClick={() => setFilterStatus("Malicious")}>Malicious</button>
        <button className={filterStatus === "Benign" ? "active benign" : "benign"} onClick={() => setFilterStatus("Benign")}>Benign</button>
        <input
          type="date"
          id="dateFilter"
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Today's Activities Table */}
      <div className="activity-section">
        <h2 className="section-title">Today's Activities</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Useremail</th>
                <th>Activity</th>
                <th>Status</th>
                <th>Predicted By Model</th>
              </tr>
            </thead>
            <tbody>
              {todayActivities.length > 0 ? (
                todayActivities.map((record, index) => (
                  <tr key={index}>
                    <td>{record.timestamp}</td>
                    <td>{record.useremail}</td>
                    <td>{record.activity}</td>
                    <td className={record.status.toLowerCase()}>{record.status}</td>
                    <td>{record.model}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="no-data">No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Earlier Activities Table */}
      <div className="activity-section">
        <h2 className="section-title">Earlier Activities</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Useremail</th>
                <th>Activity</th>
                <th>Status</th>
                <th>Predicted By Model</th>
              </tr>
            </thead>
            <tbody>
              {earlierActivities.length > 0 ? (
                earlierActivities.map((record, index) => (
                  <tr key={index}>
                    <td>{record.timestamp}</td>
                    <td>{record.useremail}</td>
                    <td>{record.activity}</td>
                    <td className={record.status.toLowerCase()}>{record.status}</td>
                    <td>{record.model}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="no-data">No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AllRecords;
