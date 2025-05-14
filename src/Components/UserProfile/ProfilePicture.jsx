import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCamera } from 'react-icons/fa';
import defaultProfilePic from '../../Components/Assets/icon_you.png';

const ProfilePicture = ({ src, isLoading, isUploading, onFileChange }) => {
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
        width: '150px',
        height: '150px',
        margin: '0 auto',
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="profile-image-wrapper"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        {isLoading ? (
          <div className="jrg-spinner" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
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
        )}
        
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
              <div className="jrg-spinner" role="status">
                <span className="visually-hidden">Uploading...</span>
              </div>
            ) : (
              <>
                <FaCamera className="camera-icon" style={{ fontSize: '1.5rem' }} />
                <span style={{ fontSize: '0.9rem' }}>Change Photo</span>
              </>
            )}
          </label>
        </motion.div>
      </motion.div>
      
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

export default ProfilePicture; 