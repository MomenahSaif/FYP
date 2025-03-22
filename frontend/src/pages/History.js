import React, { useEffect, useState } from 'react';
import '../styles/History.css';

const ActivityDashboard = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/user/history", { credentials: "include" })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }
        return response.json();
      })
      .then(data => {
        setActivities(data);
        setFilteredActivities(data.slice(0, 10)); // Initially show only 10 records
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching activity history:", error);
        setLoading(false);
      });
  }, []);

  // Function to filter activities
  const filterActivities = (type) => {
    const now = new Date();
    let filtered = [];

    switch (type) {
      case "last7days":
        filtered = activities.filter(activity => {
          const activityDate = new Date(activity.date);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return activityDate >= sevenDaysAgo && activityDate <= now;
        });
        break;

      case "today":
        filtered = activities.filter(activity => {
          const activityDate = new Date(activity.date);
          return activityDate.toDateString() === now.toDateString();
        });
        break;

      case "all":
        setShowAll(true);
        filtered = activities; // Show all records
        break;

      case "lastMonth":
        filtered = activities.filter(activity => {
          const activityDate = new Date(activity.date);
          const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          return activityDate >= firstDayOfLastMonth && activityDate <= lastDayOfLastMonth;
        });
        break;

      default:
        filtered = activities.slice(0, 10); // Show only 10 records initially
        setShowAll(false);
    }

    setFilteredActivities(filtered);
  };

  return (
    <div>
      <h3>Activities</h3>
      <div className="filters">
        <button onClick={() => filterActivities("last7days")}>Last 7 Days</button>
        <button onClick={() => filterActivities("today")}>Today</button>
        <button onClick={() => filterActivities("all")}>All</button>
        <button onClick={() => filterActivities("lastMonth")}>Last Month</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="activity-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>File Type</th>
              <th>Analysis Type</th>
              <th>Status</th>
              <th>Results</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <tr key={index}>
                  <td>{activity.date}</td>
                  <td>{activity.fileType}</td>
                  <td>{activity.analysisType}</td>
                  <td className={`status ${activity.status.toLowerCase()}`}>{activity.status}</td>
                  <td>
                    <button 
                      className="view-results-button" 
                      onClick={() => window.open(activity.resultLink, '_blank')}
                    >
                      View Results
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No activity found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ActivityDashboard;
