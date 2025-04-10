import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-small">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;