import React from 'react';
import '../styles/AboutUs.css';

const AboutUsPage = () => {
  return (
    <div className="about-us-page">
      {/* MalwareXplore logo/text outside the container */}
      
      <h1>About Us</h1>
      <div className="about-popup">
        
        <div className="popup-container">
          
          <div className="content">
            <h2>Who We Are</h2>
            <p>
              MalwareXplore is an innovative tool designed to help cybersecurity professionals in automating PDF malware analysis.
              We leverage advanced AI and machine learning algorithms to detect malicious behaviors in PDF files, integrating both static and dynamic analysis for accurate detection.
            </p>

            <h2>Our Mission</h2>
            <p>
              Our mission is to provide a seamless and powerful tool for malware analysts, making it easier to identify and prevent malware attacks in PDF files, reducing the time spent on manual analysis.
            </p>

            <h2>Features</h2>
            <ul>
              <li>Advanced AI-driven analysis</li>
              <li>Integrated static and dynamic analysis</li>
              <li>Easy-to-use interface for both admins and analysts</li>
              <li>Detailed reports for quick decision-making</li>
            </ul>

            <h4>
              Thank You for choosing MalwareXplore.
            </h4>


           
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
