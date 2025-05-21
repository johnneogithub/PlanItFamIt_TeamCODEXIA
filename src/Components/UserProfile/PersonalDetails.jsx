import React from 'react';
import { FaUser, FaEnvelope, FaCalendarAlt, FaVenusMars, FaPhone, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';
import './JRGUserProfileStyle.css';

const PersonalDetails = ({ 
  personalDetails, 
  isEditing, 
  editedDetails, 
  handleEdit, 
  handleChange, 
  handleSave, 
  handleCancel 
}) => {
  return (
    <div className="jrg-details-card shadow">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="card-title m-0">Personal Details</h4>
          <div>
            {!isEditing && (
              <button 
                className="jrg-btn-outline-primary btn-sm" 
                onClick={handleEdit}
              >
                <FaEdit className="me-2" /> Edit
              </button>
            )}
          </div>
        </div>
        <div className="row">
          {isEditing ? (
            <>
              <div className="col-md-6">
                <DetailItem  icon={<FaUser/>} label="Name" value={personalDetails.name} />
              </div>
              <div className="col-md-6">
                <DetailItem icon={<FaEnvelope />} label="Email" value={personalDetails.email} />
              </div>
              <div className="col-md-6">
                <DetailItem 
                  icon={<FaMapMarkerAlt />} 
                  label="Location" 
                  isEditing={true}
                  name="location"
                  value={editedDetails.location}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <DetailItem 
                  icon={<FaPhone />} 
                  label="Phone" 
                  isEditing={true}
                  name="phone"
                  value={editedDetails.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <DetailItem icon={<FaCalendarAlt />} label="Age" value={personalDetails.age} />
              </div>
              {/* <div className="col-md-6">
                <DetailItem icon={<FaVenusMars />} label="Gender" value="Female" />
              </div> */}
            </>
          ) : (
            <>
              <div className="col-md-6">
                <DetailItem icon={<FaUser />} label="Name" value={personalDetails.name} />
              </div>
              <div className="col-md-6">
                <DetailItem icon={<FaEnvelope />} label="Email" value={personalDetails.email} />
              </div>
              <div className="col-md-6">
                <DetailItem icon={<FaMapMarkerAlt />} label="Location" value={personalDetails.location} />
              </div>
              <div className="col-md-6">
                <DetailItem icon={<FaPhone />} label="Phone" value={personalDetails.phone} />
              </div>
              <div className="col-md-6">
                <DetailItem icon={<FaCalendarAlt />} label="Age" value={personalDetails.age} />
              </div>
              {/* <div className="col-md-6">
                <DetailItem icon={<FaVenusMars />} label="Gender" value="Female" />
              </div> */}
            </>
          )}
          {/* <div className="col-md-6">
                <DetailItem icon={<FaVenusMars />} label="Gender" value="Female" />
              </div> */}
        </div>
        {isEditing && (
          <div className="mt-4 d-flex gap-2">
            <button 
              className="jrg-btn-primary flex-grow-1" 
              onClick={handleSave}
            >
              Save Changes
            </button>
            <button 
              className="jrg-btn-outline-primary flex-grow-1" 
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value, isEditing, name, onChange, type = 'text' }) => {
  const iconStyle = { 
    color: 'rgb(197, 87, 219)',
    fontSize: '1.2rem'
  };

  return (
    <div className="jrg-detail-item-profile">
      <div className="d-flex align-items-center">
        {React.cloneElement(icon, { className: "jrg-detail-icon", style: iconStyle })}
        <div className="ms-3 flex-grow-1">
          <h6 className="mb-1 text-muted">{label}</h6>
          {isEditing ? (
            <input
              type="text"
              className="jrg-form-control"
              name={name}
              value={value || ''}
              onChange={onChange}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          ) : (
            <p className="mb-0 fw-bold">{value || 'Not provided'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails; 