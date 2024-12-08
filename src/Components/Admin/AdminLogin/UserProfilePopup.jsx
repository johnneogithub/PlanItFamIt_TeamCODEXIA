import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaCalendarAlt, FaVenusMars, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './UserProfilePopup.css';
import defaultProfilePic from '../../Assets/icon_you.png';

function UserProfilePopup({ user, onClose, selectedPricingType }) {
  const [showAdditionalMessage, setShowAdditionalMessage] = useState(true);

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

  const formatPricingType = (pricingType) => {
    switch (pricingType) {
      case 'hourly': return 'Hourly';
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return 'Unknown';
    }
  };

  const calculateTotal = (services, pricingType) => {
    return services.reduce((total, service) => total + (service[selectedPricingType] || 0), 0);
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
                    <img
                      src={user.profilePicture || defaultProfilePic}
                      className="profile-image rounded-circle"
                      alt="Profile"
                      onError={(e) => {
                        e.target.src = defaultProfilePic;
                      }}
                    />
                  </div>
                  <h3 className="mb-2">{user.firstName} {user.lastName || 'User'}</h3>
                  <p className="text-muted">{user.email}</p>
                </div>
              </div>
              <div className="card mt-4 remark-card shadow">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title m-0">Appointment Remark</h4>
                    {user.appointment && user.appointment.remark && (
                      <span className="badge bg-danger">New!</span>
                    )}
                  </div>
                  {user.appointment && user.appointment.remark ? (
                    <>
                      <p>{user.appointment.remark}</p>
                      {user.appointment.remarkTimestamp && (
                        <small className="text-muted">
                          Added on: {new Date(user.appointment.remarkTimestamp).toLocaleString()}
                        </small>
                      )}
                    </>
                  ) : (
                    <p>No remark available</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="card mt-4 details-card shadow">
                <div className="card-body">
                  <h4 className="card-title mb-4">Personal Details</h4>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="detail-item d-flex align-items-center">
                        <FaUser className="detail-icon" />
                        <div className="ms-3">
                          <h6 className="mb-0 text-muted">Name</h6>
                          <p className="mb-0 fw-bold">{user.firstName} {user.lastName || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="detail-item d-flex align-items-center">
                        <FaEnvelope className="detail-icon" />
                        <div className="ms-3">
                          <h6 className="mb-0 text-muted">Email</h6>
                          <p className="mb-0 fw-bold">{user.email || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="detail-item d-flex align-items-center">
                        <FaCalendarAlt className="detail-icon" />
                        <div className="ms-3">
                          <h6 className="mb-0 text-muted">Age</h6>
                          <p className="mb-0 fw-bold">{user.age || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="detail-item d-flex align-items-center">
                        <FaVenusMars className="detail-icon" />
                        <div className="ms-3">
                          <h6 className="mb-0 text-muted">Gender</h6>
                          <p className="mb-0 fw-bold">{user.gender || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="detail-item d-flex align-items-center">
                        <FaPhone className="detail-icon" />
                        <div className="ms-3">
                          <h6 className="mb-0 text-muted">Phone</h6>
                          <p className="mb-0 fw-bold">{user.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="detail-item d-flex align-items-center">
                        <FaMapMarkerAlt className="detail-icon" />
                        <div className="ms-3">
                          <h6 className="mb-0 text-muted">Location</h6>
                          <p className="mb-0 fw-bold">{user.location || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {user.appointment && (
                <div className="card mt-4 appointment-card shadow">
                  <div className="card-body">
                    <h4 className="card-title mb-4">Appointment Status</h4>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Pricing Type</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{user.appointment.name || 'N/A'}</td>
                            <td>{user.appointment.appointmentType || 'N/A'}</td>
                            <td>{user.appointment.date || 'N/A'}</td>
                            <td>{user.appointment.time || 'N/A'}</td>
                            <td>{formatPricingType(user.appointment.selectedPricingType) || 'N/A'}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(user.appointment.status)}`}>
                                {capitalizeFirstLetter(user.appointment.status || 'pending')}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {user.appointment.selectedServices && user.appointment.selectedServices.length > 0 && (
                      <div className="mt-4">
                        <h5>Selected Services</h5>
                        <div className="selected-services-list">
                          {user.appointment.selectedServices.map((service, index) => (
                            <div key={index} className="service-item-user p-3 border rounded mb-2">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">{service.name || 'Unnamed Service'}</h6>
                                <span className="badge bg-primary">
                                  ₱{(service[user.appointment.selectedPricingType] || 0).toLocaleString()}
                                </span>
                              </div>
                              {service.isPackage && service.components && (
                                <div className="mt-2">
                                  <small className="text-muted">Package Components:</small>
                                  <ul className="list-unstyled ms-3">
                                    {service.components.map((component, idx) => (
                                      <li key={idx} className="d-flex justify-content-between">
                                        <span>{component.name || 'Unnamed Component'}</span>
                                        <span>₱{(component[user.appointment.selectedPricingType] || 0).toLocaleString()}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                          <div className="total-amount p-2 bg-light rounded">
                            <strong>Total Amount: </strong>
                            <span>₱{calculateTotal(user.appointment.selectedServices, user.appointment.selectedPricingType)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {showAdditionalMessage && user.appointment.message && (
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
    </div>

  );
}

export default UserProfilePopup;
