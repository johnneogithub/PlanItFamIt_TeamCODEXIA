import React, { useState } from 'react';
import './RemarkPopup.css';

function RemarkPopup({ onClose, onSubmit }) {
  const [remarkText, setRemarkText] = useState('');

  const handleSubmit = () => {
    onSubmit(remarkText);
    onClose();
  };

  return (
    <div className="remark-popup">
      <div className="remark-popup-content">
        <h4>Add Remark</h4>
        <textarea
          className="form-control mb-3"
          value={remarkText}
          onChange={(e) => setRemarkText(e.target.value)}
          placeholder="Enter your remark..."
          rows="4"
        />
        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
}

export default RemarkPopup;
