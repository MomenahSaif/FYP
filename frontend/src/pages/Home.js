import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginSignupContainer from '../components/LoginSignupContainer';
import logo from '../assets/Mylogo.jpg';
import { loginUser, signupUser } from '../services/authService.js';

const Home = () => {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showName, setShowName] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const nameTimer = setTimeout(() => {
      setShowName(true);
    }, 2000);

    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 3000);

    return () => {
      clearTimeout(nameTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  const handleLoginSuccess = async (userData, isSignup) => {
    try {
      if (isSignup) {
        await signupUser(userData);
      } else {
        const response = await loginUser(userData); // This now contains the email
        localStorage.setItem('userEmail', response.email); // Store email in localStorage
  
        if (response.email === "admin@gmail.com") {
          navigate('/admin'); // Redirect admin
        } else {
          navigate('/tool'); // Redirect normal users
        }
      }
      setShowLoginPopup(false);
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <div className="App">
      <div className="box-container">
        <img src={logo} alt="MalwareXplore Logo" className="logo" />
        {showName && (
          <h1 className="site-name">
            Malware<span className="highlight">X</span>plore
          </h1>
        )}
        {showContent && (
          <>
            <p className="subtext">Automated PDF Malware Analysis</p>
            <button className="cta-button" onClick={() => setShowLoginPopup(true)}>
              Continue
            </button>
          </>
        )}
      </div>

      <div className="shapes-container">
        <div className="shape small color1" id="shape1"></div>
      </div>

      {showLoginPopup && (
        <LoginSignupContainer 
          closePopup={() => setShowLoginPopup(false)} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}
    </div>
  );
};

export default Home;