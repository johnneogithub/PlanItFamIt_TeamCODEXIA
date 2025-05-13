import React from 'react';
import { Link } from 'react-router-dom';
import { FaThLarge, FaCheckCircle, FaTimesCircle, FaCommentDots, FaClock } from 'react-icons/fa';

const AppointmentHistory = ({ appointmentHistory, user, personalDetails, profilePic }) => {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <FaCheckCircle color="#0066ff" />;
      case 'rejected': return <FaTimesCircle color="#dc3545" />;
      case 'remarked': return <FaCommentDots color="#17a2b8" />;
      default: return <FaClock color="#ffc107" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'jrg-badge completed';
      case 'rejected': return 'jrg-badge rejected';
      case 'remarked': return 'jrg-badge remarked';
      default: return 'jrg-badge pending';
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string && typeof string === 'string' ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };

  return (
    <div className="jrg-remark-card shadow">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="card-title m-0">Appointment History</h4>
          <div className="d-flex align-items-center">
            <Link 
              to={`/AppointmentHistory/${user?.uid}`}
              className="jrg-btn-primary"
              state={{ 
                appointments: appointmentHistory.map(appointment => ({
                  id: appointment.id || '',
                  name: appointment.name || '',
                  date: appointment.date || '',
                  time: appointment.time || '',
                  status: appointment.status || 'pending',
                  message: appointment.message || '',
                  remark: appointment.remark || '',
                  selectedPricingType: appointment.selectedPricingType || '',
                  selectedServices: Array.isArray(appointment.selectedServices) ? appointment.selectedServices : [],
                  totalAmount: typeof appointment.totalAmount === 'number' ? appointment.totalAmount : 0,
                  completedAt: appointment.completedAt || null,
                  isCurrent: !!appointment.isCurrent
                })),
                userInfo: {
                  name: personalDetails.name || '',
                  email: personalDetails.email || '',
                  profilePic: profilePic || '',
                  userId: user?.uid || ''
                }
              }}
            >
              <div className="d-flex align-items-center">
                <FaThLarge className="me-2" />
                <span>View Appointment History</span>
              </div>
            </Link>
          </div>
        </div>
        
        {appointmentHistory.length > 0 ? (
          <div className="jrg-appointment-history-list">
            {appointmentHistory.filter(appointment => appointment.status !== 'pending').slice(0, 1).map((appointment, index) => {
              const appointmentDate = appointment.completedAt ? new Date(appointment.completedAt) : new Date();
              const formattedDate = appointmentDate.toLocaleDateString();
              const formattedTime = appointmentDate.toLocaleTimeString();

              return (
                <div 
                  key={index} 
                  className={`jrg-appointment-history-item ${appointment.isCurrent ? 'current-appointment' : ''}`}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span className="fw-bold">{appointment.appointmentType || 'General Appointment'}</span>
                      {appointment.isCurrent && (
                        <span className="jrg-badge remarked">Current</span>
                      )}
                    </div>
                    <span className={getStatusBadgeClass(appointment.status)}>
                      {capitalizeFirstLetter(appointment.status || 'pending')}
                    </span>
                  </div>
                  <div className="text-muted small">
                    <div><strong>Date:</strong> {appointment.date || 'N/A'}</div>
                    <div><strong>Time:</strong> {appointment.time || 'N/A'}</div>
                    {appointment.message && (
                      <div><strong>Message:</strong> {appointment.message}</div>
                    )}
                    {appointment.remark && (
                      <div className="mt-2">
                        <strong>Remark:</strong> {appointment.remark}
                      </div>
                    )}
                    <div className="mt-1 text-end">
                      <small className="text-muted">
                        {appointment.isCurrent ? 'Current Appointment' : 
                          `Updated: ${formattedDate} at ${formattedTime}`
                        }
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted">
            <p>No appointment history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentHistory; 