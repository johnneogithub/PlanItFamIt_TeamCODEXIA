import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaCalendarAlt, FaVenusMars, FaPhone, FaMapMarkerAlt, FaEdit, FaCamera } from 'react-icons/fa';
import defaultProfilePic from '../../Components/Assets/icon_you.png';

export const ProfilePicture = ({ src, isLoading, isUploading, onFileChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleLocalFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <motion.div 
      className="jrg-profile-image-container"
      initial={false}
      animate={{ scale: isHovered ? 1.02 : 1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '125px',
        height: '125px',
        margin: '0 auto',
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {isLoading ? (
        <div 
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid rgb(197, 87, 219)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            position: 'absolute',
            zIndex: 2
          }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative'
          }}
        >
          <img
            src={src}
            alt="Profile"
            className="jrg-profile-image"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%'
            }}
            onError={(e) => {
              e.target.src = defaultProfilePic;
              e.target.onerror = null;
            }}
          />
          
          <motion.div 
            className="jrg-profile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
          >
            <label 
              htmlFor="profile-upload" 
              className="jrg-upload-button"
              style={{
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isUploading ? (
                <div 
                  style={{
                    width: '30px',
                    height: '30px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid rgb(197, 87, 219)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
              ) : (
                <>
                  <FaCamera className="camera-icon" style={{ fontSize: '1.5rem' }} />
                  <span style={{ fontSize: '0.9rem' }}>Change Photo</span>
                </>
              )}
            </label>
          </motion.div>
        </motion.div>
      )}
      
      <input
        type="file"
        id="profile-upload"
        accept="image/*"
        onChange={handleLocalFileChange}
        style={{ display: 'none' }}
      />
    </motion.div>
  );
};

export const PersonalDetails = ({ 
  personalDetails, 
  isEditing, 
  editedDetails, 
  handleEdit, 
  handleChange, 
  handleSave, 
  handleCancel,
  profilePic,
  isLoadingProfile,
  isUploading,
  onFileChange,
  email
}) => {
  return (
    <div className="jrg-details-card shadow">
      <div className="card-body">
        <div className="text-center mb-4">
          <ProfilePicture
            src={profilePic}
            isLoading={isLoadingProfile}
            isUploading={isUploading}
            onFileChange={onFileChange}
          />
          <h3 className="mt-3 mb-1">{personalDetails.name || 'User'}</h3>
          <p className="text-muted">{personalDetails.email || email}</p>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
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
        <div className="row g-3">
          {isEditing ? (
            <>
              <div className="col-md-6">
                <DetailItem icon={<FaUser />} label="Name" value={personalDetails.name} />
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
              <div className="col-md-6">
                <DetailItem 
                  icon={<FaVenusMars />} 
                  label="Gender" 
                  isEditing={true}
                  name="gender"
                  value={editedDetails.gender}
                  onChange={handleChange}
                />
              </div>
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
              <div className="col-md-6">
                <DetailItem icon={<FaVenusMars />} label="Gender" value={personalDetails.gender || 'Not provided'} />
              </div>
            </>
          )}
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