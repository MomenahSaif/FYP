import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../styles/AccountSettings.css';

const AccountSettings = () => {
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
    navigate('/edit'); // Navigate to /edit route
  };

  return (
    <div>
      <h1>Account Settings</h1>
      <div className="profile-form-container">
        <div className="profile-form">
          {/* Profile Icon */}
          <div className="profile-icon">
  {userInfo.profileImage ? (
    <img src={`http://localhost:5000${userInfo.profileImage}`} alt="Profile" className="profile-image" />
  ) : (
    <div className="profile-image-placeholder">No Image</div>
  )}
</div>


          {/* Form Fields */}
          <div className="form-group">
            <label className="form-label">Fullname:</label>
            <div className="name-fields">
              <input
                type="text"
                value={userInfo.firstname}
                placeholder="First Name"
                className="input-field"
                readOnly
              />
              <input
                type="text"
                value={userInfo.lastname}
                placeholder="Last Name"
                className="input-field"
                readOnly
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email:</label>
            <input
              type="email"
              value={userInfo.email}
              placeholder="Email"
              className="input-field"
              readOnly
            />
          </div>


          {/* Edit Button */}
          <button className="edit-button" onClick={handleEditClick}>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;