import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { FaPen } from 'react-icons/fa'; // Importing the pencil icon from React Icons
import '../styles/AdminEdit.css';

const AdminEdit = () => {
  const navigate = useNavigate(); // Initialize navigate function

  // State for handling profile image upload
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  // Handle image file upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
  
      // Display the image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result); // Store preview separately
      };
      reader.readAsDataURL(file);
    }
  };
  

  // Navigate to account settings when cancel is clicked
  const handleCancelClick = (path) => {
    navigate(path); // Navigate back to account settings page
  };

  // You can handle save functionality as needed, here's a placeholder function
  const handleSaveClick = async () => {
    console.log("Save button clicked!");

    const formData = new FormData();
    formData.append("firstname", document.querySelector('.admin-name-fields input[placeholder="First Name"]').value);
    formData.append("lastname", document.querySelector('.admin-name-fields input[placeholder="Last Name"]').value);
    formData.append("email", document.querySelector('.admin-input-field[placeholder="Email"]').value);
    formData.append("currentPassword", document.querySelector('.admin-input-field[placeholder="Current Password"]').value);
    formData.append("newPassword", document.querySelector('.admin-input-field[placeholder="New Password"]').value);

    if (profileImage) {
        formData.append("profileImage", profileImage);
    }

    try {
        const response = await fetch("http://localhost:5000/api/edit-user", {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Profile updated successfully!", data);

            // 🚀 **Navigate only after the request is completed**
            navigate("/admin/AdminAccountSettings");  
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error updating profile:", error);
    }
};

  

  return (
    <div>
      <h1>Edit Profile</h1>

    <div className="admin-profile-form-container">
      <div className="admin-profile-form">
        {/* Profile Image Section */}
        <div className="admin-profile-icon">
          <label htmlFor="image-upload" className="admin-profile-image-label">
          <input
  type="file"
  id="image-upload"
  accept="image/*"
  style={{ display: "none" }}  // Hide the input
  onChange={(event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      setProfileImage(file); // Ensure state updates

      // Display the image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }}
/>

            {/* Display uploaded image or default placeholder */}
            <div
              className="admin-profile-image"
              style={{
                backgroundImage: profilePreview ? `url(${profilePreview})` : 'none',
                backgroundColor: profileImage ? 'transparent' : '#e0e0e0', // If no image, use gray color
                backgroundSize: 'cover',
              }}
            >
              {/* Edit Pencil Icon */}
              <FaPen className="admin-edit-icon" />
            </div>
          </label>
        </div>

        {/* Form Fields */}
        <div className="admin-form-group">
          <label className="admin-form-label">Fullname:</label>
          <div className="admin-name-fields">
            <input type="text" placeholder="First Name" className="admin-input-field" />
            <input type="text" placeholder="Last Name" className="admin-input-field" />
          </div>
        </div>
        
        <div className="admin-form-group">
          <label className="admin-form-label">Email:</label>
          <input type="email" placeholder="Email" className="admin-input-field" />
        </div>
        
        <div className="admin-form-group">
          <label className="admin-form-label">Current Password:</label>
          <input type="password" placeholder="Current Password" className="admin-input-field" />
        </div>

        {/* New Password and Confirm Password fields */}
        <div className="admin-form-group">
          <label className="admin-form-label">New Password:</label>
          <input type="password" placeholder="New Password" className="admin-input-field" />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Confirm Password:</label>
          <input type="password" placeholder="Confirm Password" className="admin-input-field" />
        </div>
        
        {/* Save and Cancel Buttons */}
        <div className="admin-button-group">
          <button className="admin-save-button" onClick={() => handleSaveClick('/admin/AdminAccountSettings')}>Save</button>
          <button className="admin-cancel-button" onClick={() => handleCancelClick('/admin/AdminAccountSettings')}>Cancel</button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminEdit;