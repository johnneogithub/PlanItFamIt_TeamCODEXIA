import React from 'react';
import { FaUser, FaEnvelope, FaCalendarAlt, FaVenusMars, FaPhone, FaMapMarkerAlt, FaUserCircle } from 'react-icons/fa';
import './UserProfilePopup.css';

function UserProfilePopup({ user, onClose }) {
  const getIcon = (key) => {
    switch (key) {
      case 'name': return <FaUser className="detail-icon" />;
      case 'email': return <FaEnvelope className="detail-icon" />;
      case 'age': return <FaCalendarAlt className="detail-icon" />;
      case 'gender': return <FaVenusMars className="detail-icon" />;
      case 'phone': return <FaPhone className="detail-icon" />;
      case 'address': return <FaMapMarkerAlt className="detail-icon" />;
      default: return null;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'rejected': return 'bg-danger';
      case 'remarked': return 'bg-info';
      default: return 'bg-warning';
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string && typeof string === 'string' ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };

  return (
    <div className="user-profile-popup">
      <div className="user-profile-popup-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <div className="container my-5">
          <div className="row">
            <div className="col-lg-4">
              <div className="card profile-card shadow">
                <div className="card-body text-center">
                  <div className="profile-image-container mb-4">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        className="profile-image rounded-circle"
                        alt="Profile"
                      />
                    ) : (
                      <FaUserCircle className="profile-icon" size={150} />
                    )}
                  </div>
                  <h3 className="mb-2">{user.name || 'User'}</h3>
                  <p className="text-muted">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="card details-card shadow">
                <div className="card-body">
                  <h4 className="card-title mb-4">Personal Details</h4>
                  <div className="row">
                    {Object.entries(user).map(([key, value]) => {
                      if (['name', 'email', 'age', 'gender', 'phone', 'address'].includes(key)) {
                        return (
                          <div className="col-md-6 mb-3" key={key}>
                            <div className="detail-item d-flex align-items-center">
                              {getIcon(key)}
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">{capitalizeFirstLetter(key)}</h6>
                                <p className="mb-0 fw-bold">{value || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
              
              {user.appointment && (
                <div className="card mt-4 appointment-card shadow">
                  <div className="card-body">
                    <h4 className="card-title mb-4">Appointment Details</h4>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{user.appointment.appointmentType}</td>
                            <td>{user.appointment.date}</td>
                            <td>{user.appointment.time}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(user.appointment.status)}`}>
                                {capitalizeFirstLetter(user.appointment.status || 'pending')}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {user.appointment.message && (
                      <div className="mt-3">
                        <h5>Additional Message:</h5>
                        <p>{user.appointment.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <consol className="log"></consol>
    </div>

  );
}

export default UserProfilePopup;
