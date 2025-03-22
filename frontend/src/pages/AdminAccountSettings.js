import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../styles/AdminAccountSettings.css';

const AdminAccountSettings = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [userInfo, setUserInfo] = useState({
    firstname: '',
    lastname: '',
    email: '',
    profileImage: ''
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/user-info', {
      method: 'GET',
      credentials: 'include'
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          setUserInfo(data); // Ensure profileImage is set
        }
      })
      .catch((error) => {
        console.error('Error fetching user info:', error);
      });
  }, []);
  
  const handleEditClick = () => {
    navigate('/admin/AdminEdit'); // Navigate to /edit route
  };

  return (
    <div>
      <h1>Account Settings</h1>
      <div className="admin-profile-form-container">
        <div className="admin-profile-form">
          {/* Profile Icon */}
          <div className="admin-profile-icon">
  {userInfo.profileImage ? (
    <img src={`http://localhost:5000${userInfo.profileImage}`} alt="Profile" className="admin-profile-image" />
  ) : (
    <div className="admin-profile-image-placeholder">No Image</div>
  )}
</div>


          {/* Form Fields */}
          <div className="admin-form-group">
            <label className="admin-form-label">Fullname:</label>
            <div className="admin-name-fields">
              <input
                type="text"
                value={userInfo.firstname}
                placeholder="First Name"
                className="admin-input-field"
                readOnly
              />
              <input
                type="text"
                value={userInfo.lastname}
                placeholder="Last Name"
                className="admin-input-field"
                readOnly
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Email:</label>
            <input
              type="email"
              value={userInfo.email}
              placeholder="Email"
              className="admin-input-field"
              readOnly
            />
          </div>


          {/* Edit Button */}
          <button className="admin-edit-button" onClick={handleEditClick}>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAccountSettings;