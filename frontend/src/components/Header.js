import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false); // State for modal
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    if (path === 'about') {
      setIsAboutUsOpen(true);
      navigate('/about'); // Change the route to '/about' when modal opens
    } else {
      navigate(path); // Navigate to other pages
      setSettingsOpen(false);
    }
  };

  const handleLogout = () => {
    // Clear authentication details (if stored in localStorage or sessionStorage)
    localStorage.removeItem('authToken'); // Example: Remove authentication token
    sessionStorage.removeItem('userSession'); // Example: Remove user session

      // Redirect user to the home/login page
    navigate('/'); // Change '/' to your login page route if needed


    // Close the settings dropdown
    setSettingsOpen(false);
  };

  const closeAboutUsModal = () => {
    setIsAboutUsOpen(false);
    navigate(-1); // Navigate back to the previous route when modal closes
  };

  useEffect(() => {
    // Close modal if the current location changes away from /about
    if (location.pathname !== '/about' && isAboutUsOpen) {
      setIsAboutUsOpen(false);
    }
  }, [location.pathname, isAboutUsOpen]);

  return (
    <header className="header">
      <div className="logo">
        Malware<span className="logo-highlight">X</span>plore
      </div>
      <div className="settings-icon-container">
        <img
          src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
          alt="User Settings"
          className="settings-icon"
          onClick={() => setSettingsOpen(!settingsOpen)}
        />
        {settingsOpen && (
          <div className="user-info-slider">
            <ul className="settings-options">
              <li onClick={() => handleNavigation('/tool')}>
                <img src="https://cdn-icons-png.flaticon.com/512/25/25694.png" alt="Home" className="menu-icon" />
                Home
              </li>
              <li onClick={() => handleNavigation('/account')}>
                <img src="https://cdn-icons-png.flaticon.com/512/7542/7542245.png" alt="Account" className="menu-icon" />
                Account Settings
              </li>
              <li onClick={() => handleNavigation('/history')}>
                <img src="https://cdn-icons-png.flaticon.com/512/15553/15553777.png" alt="History" className="menu-icon" />
                History
              </li>
              <li onClick={() => handleNavigation('about')}>
                <img src="https://cdn-icons-png.flaticon.com/512/181/181544.png" alt="About" className="menu-icon" />
                About Us
              </li>
              <li className="logout-option" onClick={handleLogout}>
                <img src="https://cdn-icons-png.flaticon.com/512/1828/1828479.png" alt="Logout" className="menu-icon" />
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;