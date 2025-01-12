import React, { useState } from 'react';
import { FaFile, FaImage, FaFileWord, FaFilePdf, FaFileAlt } from 'react-icons/fa';
import './MedicalPictureFiles.css';

const MedicalPictureFiles = ({ isOpen, onClose, files, patientName }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  if (!isOpen) return null;

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile />;
    if (fileType.includes('image')) return <FaImage />;
    if (fileType.includes('pdf')) return <FaFilePdf />;
    if (fileType.includes('word') || fileType.includes('msword')) return <FaFileWord />;
    if (fileType.includes('text')) return <FaFileAlt />;
    return <FaFile />;
  };

  const getFileTypeLabel = (fileType) => {
    if (!fileType) return 'File';
    if (fileType.includes('image')) return 'Image';
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('msword')) return 'Word';
    if (fileType.includes('text')) return 'Text';
    return 'File';
  };

  const filteredFiles = files.filter(file => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'images') return file.type?.includes('image');
    if (selectedFilter === 'documents') return !file.type?.includes('image');
    return true;
  });

  const sortedFiles = filteredFiles.sort((a, b) => 
    new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0)
  );

  console.log('Rendering files:', sortedFiles);

  return (
    <div className="medical-files-popup" onClick={(e) => {
      if (e.target.className === 'medical-files-popup') onClose();
    }}>
      <div className="medical-files-content">
        <div className="medical-files-header">
          <h4 className="medical-files-title">
            Medical Files - {patientName || 'Patient'}
          </h4>
            <button 
              className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('all')}
            >
            Files ({files.length})
            </button>

          <button className="medical-files-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="medical-files-body">
          {sortedFiles.length > 0 ? (
            <div className="medical-files-grid">
              {sortedFiles.map((file, index) => (
                <div key={index} className="medical-file-item">
                  <div className="file-header">
                    {getFileIcon(file.type)}
                    <span className="file-type-label">{getFileTypeLabel(file.type)}</span>
                    {file.status && (
                      <span className={`status-badge ${file.status}`}>
                        {file.status}
                      </span>
                    )}
                  </div>
                  
                  <div className="file-content">
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="medical-file-link"
                    >
                      {file.name || 'Unnamed File'}
                    </a>
                    
                    <div className="medical-file-info">
                      {file.uploadedAt && (
                        <div className="info-row">
                          <span className="info-label">Uploaded:</span>
                          <span className="info-value">
                            {new Date(file.uploadedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      {file.appointmentDate && (
                        <div className="info-row">
                          <span className="info-label">Date:</span>
                          <span className="info-value">
                            {file.appointmentDate} {file.appointmentTime}
                          </span>
                        </div>
                      )}
                      
                      {file.uploadedBy && (
                        <div className="info-row">
                          <span className="info-label">By:</span>
                          <span className="info-value">{file.uploadedBy.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="file-actions">
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="view-btn"
                    >
                      View File
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-files-message">
              <FaFile className="no-files-icon" />
              <p>No medical files found for this patient.</p>
            </div>
          )}
        </div>

        <div className="medical-files-footer">
          <div className="files-count">
            Total Files: {sortedFiles.length}
          </div>
          <button className="medical-files-close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalPictureFiles; 