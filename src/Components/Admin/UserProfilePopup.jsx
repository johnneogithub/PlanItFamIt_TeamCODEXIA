import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { crud } from '../../Config/firebase';
import { FaUser, FaEnvelope, FaCalendarAlt, FaVenusMars, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaCommentDots, FaClock } from 'react-icons/fa';
import defaultProfilePic from '../Assets/icon_you.png';
import { motion } from 'framer-motion';
import './UserProfilePopupStyle.css';

const UserProfilePopup = ({ user, onClose }) => {
  const [personalDetails, setPersonalDetails] = useState({
    name: '',
    location: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
  });
  const [profilePic, setProfilePic] = useState(defaultProfilePic);
  const [appointmentData, setAppointmentData] = useState(null);
  const [remark, setRemark] = useState('');
  const [remarkTimestamp, setRemarkTimestamp] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const userRef = doc(crud, 'users', user.id);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        if (data.profilePicture) {
          setProfilePic(data.profilePicture);
        }

        setPersonalDetails({
          name: `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim(),
          location: data.location || '',
          phone: data.phone || '',
          email: data.email || '',
          age: data.age ? `${data.age} years old` : '',
          gender: data.gender || '',
        });

        // Set appointment data
        if (data.appointmentData) {
          setAppointmentData(data.appointmentData);
          setRemark(data.appointmentData.remark || '');
          setRemarkTimestamp(data.appointmentData.remarkTimestamp || null);
          setMessage(data.appointmentData.message || '');
        }

        if (data.appointmentHistory) {
          setAppointmentHistory(data.appointmentHistory);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
      case 'completed': return 'bg-blue';
      case 'rejected': return 'bg-danger';
      case 'remarked': return 'bg-info';
      default: return 'bg-warning';
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string && typeof string === 'string' ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };

  if (isLoading) {
    return (
      <div className="user-profile-popup">
        <div className="popup-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-popup" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <button className="close-popup" onClick={onClose}>&times;</button>
        
        <div className="row">
          <div className="col-lg-4">
            <div className="card profile-card shadow">
              <div className="card-body text-center">
                <motion.div 
                  className="profile-picture-container"
                  initial={false}
                  animate={{ scale: 1 }}
                >
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="profile-image"
                    onError={(e) => {
                      e.target.src = defaultProfilePic;
                      e.target.onerror = null;
                    }}
                  />
                </motion.div>
                <h3 className="mt-3 mb-2">{personalDetails.name || 'User'}</h3>
                <p className="text-muted">{personalDetails.email}</p>
              </div>
            </div>
            
            <div className="card mt-4 remark-card shadow">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title m-0">Appointment Remark</h4>
                </div>
                {remark ? (
                  <div>
                    <p>{remark}</p>
                    {remarkTimestamp && (
                      <small className="text-muted">
                        Added on: {new Date(remarkTimestamp).toLocaleString()}
                      </small>
                    )}
                  </div>
                ) : (
                  <p>No remark available</p>
                )}
              </div>
            </div>
            
            <div className="card mt-4 history-card shadow">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title m-0">Appointment History</h4>
                </div>
                {appointmentHistory.length > 0 ? (
                  <div className="appointment-history-list">
                    {appointmentHistory.slice(0, 3).map((appointment, index) => (
                      <div key={index} className="appointment-history-item mb-3 p-3 border rounded">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold">{appointment.appointmentType || 'General Appointment'}</span>
                          <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                            {capitalizeFirstLetter(appointment.status || 'pending')}
                          </span>
                        </div>
                        <div className="text-muted small">
                          <div><strong>Date:</strong> {appointment.date || 'N/A'}</div>
                          <div><strong>Time:</strong> {appointment.time || 'N/A'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No appointment history available</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-lg-8">
            <div className="card details-card shadow">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title m-0">Personal Details</h4>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="detail-item-profile">
                      <FaUser className="detail-icon" />
                      <div className="ms-3">
                        <h6 className="mb-0 text-muted">Name</h6>
                        <p className="mb-0 fw-bold">{personalDetails.name || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="detail-item-profile">
                      <FaEnvelope className="detail-icon" />
                      <div className="ms-3">
                        <h6 className="mb-0 text-muted">Email</h6>
                        <p className="mb-0 fw-bold">{personalDetails.email || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="detail-item-profile">
                      <FaMapMarkerAlt className="detail-icon" />
                      <div className="ms-3">
                        <h6 className="mb-0 text-muted">Location</h6>
                        <p className="mb-0 fw-bold">{personalDetails.location || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="detail-item-profile">
                      <FaPhone className="detail-icon" />
                      <div className="ms-3">
                        <h6 className="mb-0 text-muted">Phone</h6>
                        <p className="mb-0 fw-bold">{personalDetails.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="detail-item-profile">
                      <FaCalendarAlt className="detail-icon" />
                      <div className="ms-3">
                        <h6 className="mb-0 text-muted">Age</h6>
                        <p className="mb-0 fw-bold">{personalDetails.age || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="detail-item-profile">
                      <FaVenusMars className="detail-icon" />
                      <div className="ms-3">
                        <h6 className="mb-0 text-muted">Gender</h6>
                        <p className="mb-0 fw-bold">{personalDetails.gender || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mt-4 appointment-card shadow">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title">Appointment Status</h4>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Pricing Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointmentData ? (
                        <tr>
                          <td>{appointmentData.name || 'N/A'}</td>
                          <td>{appointmentData.date || 'N/A'}</td>
                          <td>{appointmentData.time || 'N/A'}</td>
                          <td>{formatPricingType(appointmentData.selectedPricingType) || 'N/A'}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(appointmentData.status)}`}>
                              {capitalizeFirstLetter(appointmentData.status || 'pending')}
                            </span>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">No appointment data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {appointmentData?.selectedServices && appointmentData.selectedServices.length > 0 && (
                  <div className="mt-4">
                    <h5>Selected Services</h5>
                    <div className="selected-services-list">
                      {appointmentData.selectedServices.map((service, index) => (
                        <div key={index} className="service-item-user p-3 border rounded mb-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">{service.name || 'Unnamed Service'}</h6>
                            <span className="badge bg-primary">
                              ₱{(service[appointmentData.selectedPricingType] || 0).toLocaleString()}
                            </span>
                          </div>
                          {service.isPackage && service.components && (
                            <div className="mt-2">
                              <small className="text-muted">Package Components:</small>
                              <ul className="list-unstyled ms-3">
                                {service.components.map((component, idx) => (
                                  <li key={idx} className="d-flex justify-content-between">
                                    <span>{component.name || 'Unnamed Component'}</span>
                                    <span>₱{(component[appointmentData.selectedPricingType] || 0).toLocaleString()}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="total-amount p-2 bg-light rounded">
                        <strong>Total Amount: </strong>
                        <span>₱{calculateTotal(appointmentData.selectedServices, appointmentData.selectedPricingType)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {message && (
                  <div className="mt-3">
                    <h5>Additional Message:</h5>
                    <p>{message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatPricingType(type) {
  switch (type) {
    case 'withoutPH':
      return 'Without PhilHealth';
    case 'PHBenefit':
      return 'PhilHealth Benefit';
    case 'withPH':
      return 'With PhilHealth';
    default:
      return type;
  }
}

function calculateTotal(services, pricingType) {
  if (!services || !pricingType) return 0;
  return services.reduce((total, service) => total + (service[pricingType] || 0), 0).toLocaleString();
}

export default UserProfilePopup; 