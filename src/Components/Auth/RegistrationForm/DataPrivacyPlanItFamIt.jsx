// DataPrivacyPlanItFamIt.jsx
import React from 'react';
import Modal from 'react-modal';
import './DataPrivacyPlanItFamIt.css'; 

const DataPrivacyPlanItFamIt = ({ isOpen, onClose, onAgree }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Data Privacy Act of 2012"
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
      <div className="terms-container-privacy">
        <div className="terms-header-privacy">
          <div className="header-text">
            <h2>Data Privacy Act of 2012</h2>
          </div>
        </div>

        <div className="terms-content">
          <p>Welcome to PlanItFamIt! By using our application, you agree to comply with the Data Privacy Act of 2012 of the Philippines. This Act ensures the protection of your personal information and upholds your right to privacy.</p>
          
          <div className="terms-section">
            <h3>What is the Data Privacy Act of 2012?</h3>
            <p>The Data Privacy Act of 2012 (Republic Act No. 10173) is a Philippine law that aims to protect individual personal information in information and communications systems in both the government and the private sector. It establishes principles for the lawful processing of personal data, grants rights to data subjects, and imposes penalties for violations.</p>
          </div>

          <div className="terms-section">
            <h3>How Does It Affect You?</h3>
            <p>As a user of PlanItFamIt, your personal data will be collected, processed, and stored in accordance with the Data Privacy Act of 2012. This includes sensitive personal information related to your family planning activities.</p>
          </div>

          <div className="terms-section">
            <h3>Your Rights Under the Data Privacy Act</h3>
            <ul>
              <li><b>Right to be Informed:</b> You have the right to be informed about the collection and use of your personal data.</li>
              <li><b>Right to Access:</b> You can request access to your personal data and obtain a copy of it.</li>
              <li><b>Right to Rectify:</b> You have the right to request the correction of inaccurate or incomplete personal data.</li>
              <li><b>Right to Erasure or Blocking:</b> You can request the erasure or blocking of your personal data under certain conditions.</li>
              <li><b>Right to Data Portability:</b> You have the right to transfer your personal data to another service provider.</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>Our Commitment to Data Privacy</h3>
            <p>PlanItFamIt, in partnership with St. Margaret Lying In Clinic, is committed to protecting your personal information. We implement various security measures to ensure the confidentiality, integrity, and availability of your data.</p>
          </div>

          <div className="terms-section">
            <h3>Contact Information</h3>
            <p>If you have any questions or concerns about your data privacy, please contact us at [Contact Email or Address].</p>
          </div>
        </div>

        <div className="button-container">
          <button className="agree-button" onClick={() => { onAgree(); onClose(); }}>
            Agree and Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DataPrivacyPlanItFamIt;
