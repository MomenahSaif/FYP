import React, { useState } from 'react';
import LoginForm from './LoginForm';
import '../styles/Login.css';

const LoginSignupContainer = ({ closePopup, onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState(''); // Added state for FirstName
  const [lastName, setLastName] = useState('');  // Added state for LastName

  const toggleForm = () => {
    setIsSignup(!isSignup);
    // Reset form fields when toggling
    setEmail('');
    setPassword('');
    setFirstName(''); // Reset FirstName
    setLastName('');  // Reset LastName
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userData = {
      email,
      password,
      ...(isSignup && { firstName, lastName }) // Include names only for signup
    };
    if (isSignup && (!firstName || !lastName || !email || !password)) {
      alert("First name, last name, email, and password are required.");
      return;
    }
    try {
      await onLoginSuccess(userData, isSignup);
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="overlay">
      <div className="login-signup-container">
        {/* Left section with welcome message and toggle button */}
        <div className="triangle-section">
          <h1>{isSignup ? "Welcome to Sign Up" : "Welcome Back"}</h1>
          <p>
            {isSignup 
              ? "Already have an account? Log in to continue." 
              : "Don't have an account? Sign up now!"
            }
          </p>

          <div className="button-container">
            <button 
              className="toggle-button" 
              onClick={toggleForm}
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </div>
        </div>

        {/* Right section with login/signup form */}
        <div className="login-section">
          <h2>{isSignup ? "Sign Up" : "Login"}</h2>

          <LoginForm
            isSignup={isSignup}
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            FirstName={firstName}        // Pass FirstName state
            LastName={lastName}          // Pass LastName state
            setFirstName={setFirstName}  // Pass setFirstName setter
            setLastName={setLastName}    // Pass setLastName setter
            onSubmit={handleSubmit}
          />

          <button className="close-popup" onClick={closePopup}>
            X
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupContainer;
