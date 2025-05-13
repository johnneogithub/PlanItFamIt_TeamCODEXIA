import React from 'react';
import { Link } from 'react-router-dom';
import { FaThLarge, FaEye } from 'react-icons/fa';

const AppointmentStatus = ({ appointmentData, user, personalDetails, profilePic, appointmentHistory, onViewRemark }) => {
  const formatPricingType = (type) => {
    switch (type) {
      case 'withoutPH': return 'Without PhilHealth';
      case 'PHBenefit': return 'PhilHealth Benefit';
      case 'withPH': return 'With PhilHealth';
      default: return type;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'jrg-badge completed';
      case 'rejected': return 'jrg-badge rejected';
      case 'approved': return 'jrg-badge approved';
      default: return 'jrg-badge pending';
    }
  };

  const calculateTotal = (services, pricingType) => {
    if (!services || !pricingType) return 0;
    return services.reduce((total, service) => total + (service[pricingType] || 0), 0).toLocaleString();
  };

  const capitalizeFirstLetter = (string) => {
    return string && typeof string === 'string' ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };

  return (
    <div className="jrg-appointment-card shadow">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="card-title">Appointment Status</h4>
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
        <div className="table-responsive">
          <table className="jrg-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Remark</th>
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
                  <td>
                    {appointmentData.remark ? (
                      <button 
                        className="jrg-btn-outline-primary display-flex display items-center justify-content-center"
                        onClick={() => onViewRemark(appointmentData.remark)}
                      >
                        <FaEye className="" />
                      </button>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{formatPricingType(appointmentData.selectedPricingType) || 'N/A'}</td>
                  <td>
                    <span className={getStatusBadgeClass(appointmentData.status)}>
                      {capitalizeFirstLetter(appointmentData.status || 'pending')}
                    </span>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No appointment data available</td>
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
                <div key={index} className="jrg-service-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">{service.name || 'Unnamed Service'}</h6>
                    <span className="jrg-badge completed">
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

        {appointmentData?.message && (
          <div className="mt-3">
            <h5>Additional Message:</h5>
            <p>{appointmentData.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentStatus;