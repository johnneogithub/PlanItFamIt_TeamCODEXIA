// ProfileWarningModal.jsx
import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../AuthContext';
import './ProfileWarningModal.css';

const ProfileWarningModal = ({ show, onClose }) => {
  const { currentUser } = useAuth();
  const [daysLeft, setDaysLeft] = useState(14);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!currentUser) return;
      
      const userRef = doc(db, 'users', currentUser.uid);
      
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          
          if (data.isProfileComplete === true) {
            setIsProfileComplete(true);
            onClose();
            return;
          }
          
          const profileComplete = Boolean(
            data.firstName?.trim() && 
            data.lastName?.trim() &&
            data.phone?.trim() && 
            data.age && 
            data.gender?.trim() && 
            data.location?.trim()
          );

          setIsProfileComplete(profileComplete);
          
          if (profileComplete) {
            updateDoc(userRef, {
              isProfileComplete: true
            }).catch(console.error);
            onClose();
          } else if (data.registrationDate && typeof data.registrationDate.toDate === 'function') {
            const registrationDate = data.registrationDate.toDate();
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - registrationDate);
            const diffDays = 14 - Math.floor(diffTime / (1000 * 60 * 60 * 24));
            setDaysLeft(Math.max(0, diffDays));
          }
        }
      });

      return () => unsubscribe();
    };

    if (currentUser) {
      checkProfileStatus();
    }
  }, [currentUser, onClose, db]);

  if (isProfileComplete || !show) {
    return null;
  }

  return (
    <>
      <div className="modal-backdrop-warning show" onClick={onClose}></div>
      <div className="profile-warning-modal show" tabIndex="-1" role="dialog">
        <div className="modal-dialog-warning" role="document">
          <div className="modal-content-warning">
            <div className="modal-header-warning">
              <h5 className="modal-title-warning">
                <i className="fas fa-exclamation-circle warning-icon"></i>
                Complete Your Profile
              </h5>
              <button type="button" className="close-button" onClick={onClose} aria-label="Close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body-warning">
              <div className="warning-message">
                <div className="days-counter">
                  <span className="days-number">{daysLeft}</span>
                  <span className="days-text">days left</span>
                </div>
                <p className="message-text">
                  Your profile is incomplete. Please update your details to ensure
                  uninterrupted access to all features.
                </p>
              </div>
            </div>
            <div className="modal-footer-warning">
              <button 
                type="button" 
                className="btn-complete-profile"
                onClick={() => (window.location.href = '/UserProfile')}
              >
                Complete Profile Now
              </button>
              <button 
                type="button" 
                className="btn-remind-later" 
                onClick={onClose}
              >
                Remind Me Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileWarningModal;
