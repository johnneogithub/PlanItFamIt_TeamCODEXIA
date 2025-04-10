import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const NotificationBanner = ({ notifications }) => {
  if (notifications.length === 0) return null;
  
  return (
    <div className="notifications-banner">
      {notifications.map((notification, index) => (
        <div key={index} className="notification-item">
          <div className="notification-content">
            <FaCheckCircle className="notification-icon" />
            <span>{notification.message}</span>
          </div>
          <small className="notification-time">
            {new Date(notification.timestamp).toLocaleDateString()}
          </small>
        </div>
      ))}
    </div>
  );
};

export default NotificationBanner;