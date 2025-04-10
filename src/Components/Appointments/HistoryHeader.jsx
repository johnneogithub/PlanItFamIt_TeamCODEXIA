import React from 'react';
import { FaArrowLeft, FaFileAlt } from 'react-icons/fa';

const HistoryHeader = ({ 
  userInfo, 
  appointmentsCount, 
  onGoBack, 
  onNavigateToHistorical 
}) => {
  return (
    <div className="history-header">
      <button 
        className="back-button"
        onClick={onGoBack}
      >
        <FaArrowLeft /> Back
      </button>
      <div className="header-title">
        <h2>Appointment History</h2>
        <span className="total-count">
          Completed: {appointmentsCount}
        </span>
        <button 
          className="historical-btn"
          onClick={onNavigateToHistorical}
        >
          <FaFileAlt className="me-2" />
          View Historical Records
        </button>
      </div>
      {userInfo?.name && (
        <div className="user-info">
          {userInfo.profilePic && (
            <img src={userInfo.profilePic} alt="Profile" className="profile-pic" />
          )}
          <div className="user-details">
            <h4>{userInfo.name}</h4>
            <p>{userInfo.email}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryHeader;