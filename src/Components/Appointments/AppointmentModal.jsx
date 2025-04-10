import React from 'react';
import { FaCalendarAlt, FaClock, FaFileAlt, FaUser, FaTag, FaCommentAlt, FaPhone, FaEnvelope, FaHospital, FaUserMd, FaTimes } from 'react-icons/fa';
import './AppointmentModal.css'; 

const AppointmentModal = ({ 
  appointment, 
  onClose, 
  formatDate, 
  formatTime, 
  getStatusIcon, 
  formatPricingType,
  navigateToHistorical
}) => {
  if (!appointment) return null;

  return (
    <div className="appointment-modal">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header-history">
          <h2>Appointment Details</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-subheader">
          <p>View complete information about this appointment.</p>
        </div>
        
        <div className="modal-body">
          <div className="client-name-status">
            <h3>{appointment.name || 'N/A'}</h3>
            <div className="status-badge">
              {getStatusIcon(appointment.status)}
              <span>{appointment.status || 'Pending'}</span>
            </div>
          </div>
          
          <div className="appointment-details-history">
            <div className="detail-items-history">
              <FaCalendarAlt className="detail-icon" />
              <div className="detail-text">
                {formatDate(appointment.date)}
              </div>
            </div>
            
            <div className="detail-items-history">
              <FaClock className="detail-icon" />
              <div className="detail-text">
                {formatTime(appointment.time)}
              </div>
            </div>
            
            <div className="detail-items-history">
              <FaUser className="detail-icon" />
              <div className="detail-text">
                {appointment.name || 'N/A'}
              </div>
            </div>
            
            {appointment.email && (
              <div className="detail-items-history">
                <FaEnvelope className="detail-icon" />
                <div className="detail-text">
                  {appointment.email}
                </div>
              </div>
            )}
            
            {appointment.phone && (
              <div className="detail-items-history">
                <FaPhone className="detail-icon" />
                <div className="detail-text">
                  {appointment.phone}
                </div>
              </div>
            )}
            
            {appointment.selectedPricingType && (
              <div className="detail-items-history">
                <FaTag className="detail-icon" />
                <div className="detail-text">
                  With {formatPricingType(appointment.selectedPricingType)}
                </div>
              </div>
            )}
                {appointment?.selectedServices && appointment.selectedServices.length > 0 && (
                  <div className="mt-4">
                    <h5>Selected Services</h5>
                    <div className="selected-services-list">
                      {appointment.selectedServices.map((service, index) => (
                        <div key={index} className="service-item-user p-3 border rounded mb-2">
                          <div className="total justify-content-between align-items-center">
                            <h6 className="mb-0">{service.name || 'Unnamed Service'}</h6>
                            <span className="badge bg-primary">
                              ₱{(service[appointment.selectedPricingType] || 0).toLocaleString()}
                            </span>
                          </div>
                          {service.isPackage && service.components && (
                            <div className="mt-2">
                              <small className="text-muted">Package Components:</small>
                              <ul className="list-unstyled-modal ">
                                {service.components.map((component, idx) => (
                                  <li key={idx} className="total justify-content-between">
                                    <span>{component.name || 'Unnamed Component'}</span>
                                    <span>₱{(component[appointment.selectedPricingType] || 0).toLocaleString()}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="total-amount p-2 bg-light rounded">
                        <strong>Total Amount: </strong>
                        <span>₱{calculateTotal(appointment.selectedServices, appointment.selectedPricingType)}</span>
                      </div>
                    </div>
                  </div>
                )}
                
            {appointment.doctor && (
              <div className="detail-items-history">
                <FaUserMd className="detail-icon" />
                <div className="detail-text">
                  {appointment.doctor}
                </div>
              </div>
            )}
          </div>
          
          {(appointment.message || appointment.remark) && (
            <div className="notes-section">
              <h4>Notes</h4>
              <p>{appointment.message || appointment.remark}</p>
            </div>
          )}
          

          
          {appointment.importedFile && (
            <div className="imported-file-section">
              <h4>Imported File</h4>
              <button 
                className="view-file-btn"
                onClick={navigateToHistorical}
              >
                View in Historical Records
              </button>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
function calculateTotal(services, pricingType) {
  if (!services || !pricingType) return 0;
  return services.reduce((total, service) => total + (service[pricingType] || 0), 0).toLocaleString();
}
export default AppointmentModal;