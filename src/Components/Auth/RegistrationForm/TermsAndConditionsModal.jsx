// TermsAndConditionsModal.jsx
import React from 'react';
import Modal from 'react-modal';
import './TermsAndConditionsModal.css';

const TermsAndConditionsModal = ({ isOpen, onClose, onAgree }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Terms and Conditions"
      style={{
        overlay: {
          backgroundColor: 'rgba(82, 127, 239, 0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        content: {
          position: 'relative',
          width: '90%',
          maxWidth: '800px',
          height: 'auto',
          maxHeight: '85vh',
          margin: '0',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          border: 'none',
          background: '#ffffff',
          inset: 'auto',
          transform: 'none'
        },
      }}
    >
      <div className="terms-container">
        <div className="terms-header">
          <div className="header-icon svg-background">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M14,10H2V12H14V10M14,6H2V8H14V6M2,16H10V14H2V16M21.5,11.5L23,13L16,20L11.5,15.5L13,14L16,17L21.5,11.5Z" />
            </svg>
          </div>
          <div className="header-text">
            <h2>Terms and Conditions</h2>
            <p className="last-updated">PlanItFamIt Terms of Service</p>
          </div>
        </div>

        <div className="terms-content">
          <p className="welcome-text">Welcome to PlanItFamIt! By registering, you agree to the following terms:</p>
          
          <div className="terms-section">
            <h3>Usage of PlanItFamIt</h3>
            <p>PlanItFamIt is a web app designed for family planning, provided by Team CODEXIA from Gordon College, in partnership with St. Margaret Lying In Clinic.</p>
          </div>

          <div className="terms-section">
            <h3>Intellectual Property</h3>
            <p>The code for this application is proprietary and protected by copyright law. Any unauthorized reproduction or distribution is punishable by law.</p>
          </div>
          
          <div className="terms-section">
            <h3>Limitations and Accuracy</h3>
            <ul>
              <li>Ovulation predictions by PlanItFamIt's machine learning model have a 98% accuracy rate, but are subject to possible inaccuracies.</li>
              <li>Information from the PlanItAssistant (AI Chatbot) is kept up-to-date but should not replace professional medical advice.</li>
              <li>We strongly recommend seeking professional assistance for critical family planning decisions.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>User Responsibilities</h3>
            <p>As a user of PlanItFamIt, you agree to:</p>
            <ul>
              <li>Provide accurate and truthful information to the best of your knowledge.</li>
              <li>Use the application in a responsible and respectful manner.</li>
              <li>Respect the intellectual property rights of PlanItFamIt and its developers.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>Limitation of Liability</h3>
            <p>PlanItFamIt and its developers are not liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the application or any information provided herein.</p>
          </div>

          <div className="terms-section">
            <h3>Privacy and Data Security</h3>
            <p>We are committed to protecting your privacy and ensuring the security of your personal information. By using PlanItFamIt, you consent to the collection, use, and disclosure of your information as described in our Privacy Policy.</p>
          </div>

          <div className="terms-section">
            <h3>Contact Information</h3>
            <p>If you have any questions or concerns about these terms and conditions, please contact us at [Contact Email or Address].</p>
          </div>
        </div>

        <div className="button-container">
          <button className="decline-button" onClick={onClose}>
            Decline
          </button>
          <button className="agree-button" onClick={() => { onAgree(); onClose(); }}>
            Accept
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TermsAndConditionsModal;
