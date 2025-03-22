import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { FaPen } from 'react-icons/fa'; // Importing the pencil icon from React Icons
import '../styles/Edit.css';

const Edit = () => {
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
    formData.append("firstname", document.querySelector('.name-fields input[placeholder="First Name"]').value);
    formData.append("lastname", document.querySelector('.name-fields input[placeholder="Last Name"]').value);
    formData.append("email", document.querySelector('.input-field[placeholder="Email"]').value);
    formData.append("currentPassword", document.querySelector('.input-field[placeholder="Current Password"]').value);
    formData.append("newPassword", document.querySelector('.input-field[placeholder="New Password"]').value);

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
            navigate("/account");  
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

    <div className="profile-form-container">
      <div className="profile-form">
        {/* Profile Image Section */}
        <div className="profile-icon">
          <label htmlFor="image-upload" className="profile-image-label">
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
              className="profile-image"
              style={{
                backgroundImage: profilePreview ? `url(${profilePreview})` : 'none',
                backgroundColor: profileImage ? 'transparent' : '#e0e0e0', // If no image, use gray color
                backgroundSize: 'cover',
              }}
            >
              {/* Edit Pencil Icon */}
              <FaPen className="edit-icon" />
            </div>
          </label>
        </div>

        {/* Form Fields */}
        <div className="form-group">
          <label className="form-label">Fullname:</label>
          <div className="name-fields">
            <input type="text" placeholder="First Name" className="input-field" />
            <input type="text" placeholder="Last Name" className="input-field" />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Email:</label>
          <input type="email" placeholder="Email" className="input-field" />
        </div>
        
        <div className="form-group">
          <label className="form-label">Current Password:</label>
          <input type="password" placeholder="Current Password" className="input-field" />
        </div>

        {/* New Password and Confirm Password fields */}
        <div className="form-group">
          <label className="form-label">New Password:</label>
          <input type="password" placeholder="New Password" className="input-field" />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password:</label>
          <input type="password" placeholder="Confirm Password" className="input-field" />
        </div>
        
        {/* Save and Cancel Buttons */}
        <div className="button-group">
          <button className="save-button" onClick={() => handleSaveClick('/account')}>Save</button>
          <button className="cancel-button" onClick={() => handleCancelClick('/account')}>Cancel</button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Edit;