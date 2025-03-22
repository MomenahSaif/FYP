import React from 'react';

const LoginForm = ({
  isSignup,
  email,
  password,
  setEmail,
  setPassword,
  FirstName,
  LastName,
  setFirstName,
  setLastName,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit}>
      {isSignup && (
        <div className="input-group">
          <input 
            type="text" 
            placeholder="First Name" 
            value={FirstName} 
            onChange={(e) => setFirstName(e.target.value)} 
          />
        </div>
      )}
      {isSignup && (
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Last Name" 
            value={LastName} 
            onChange={(e) => setLastName(e.target.value)} 
          />
        </div>
      )}
      <div className="input-group">
        <input 
          type="email" 
          placeholder="Enter Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>
      <div className="input-group">
        <input 
          type="password" 
          placeholder="Enter Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>
      {isSignup && (
        <div className="input-group">
          <input 
            type="password" 
            placeholder="Confirm Password" 
            required
          />
        </div>
      )}
      <button type="submit" className="signin-button">
        {isSignup ? "Sign Up" : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
