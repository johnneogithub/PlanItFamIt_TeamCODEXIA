import React from 'react';
import { FaCalendarAlt, FaClock, FaCommentDots, FaFileAlt } from 'react-icons/fa';

const AppointmentCard = ({ 
  appointment, 
  formatDate, 
  formatTime, 
  getStatusIcon, 
  onCardClick,
  navigateToHistorical
}) => {
  return (
    <div 
      className={`appointment-card ${appointment.status}`}
      onClick={() => onCardClick(appointment)}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-header">
        <h3>{appointment.appointmentType}</h3>
        <div className="status-badge-history">
          {getStatusIcon(appointment.status)}
          <span>{appointment.status || 'pending'}</span>
        </div>
      </div>
      
      <div className="card-body">
        <div className="appointment-info">
          <div className="info-item">
            <FaCalendarAlt />
            <span>{formatDate(appointment.date)}</span>
          </div>
          <div className="info-item">
            <FaClock />
            <span>{formatTime(appointment.time)}</span>
          </div>
        </div>

        {appointment.message && (
          <div className="message-section">
            <FaCommentDots />
            <p>{appointment.message}</p>
          </div>
        )}

        {appointment.remark && (
          <div className="remark-section">
            <FaCommentDots />
            <div>
              <strong>Remark:</strong>
              <p>{appointment.remark}</p>
            </div>
          </div>
        )}

        {appointment.importedFile && (
          <div className="imported-file-notification">
            <FaFileAlt className="file-icon" />
            <span>This appointment has an imported file</span>
            <button 
              className="btn btn-link view-file-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigateToHistorical();
              }}
            >
              View in Historical Records
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;