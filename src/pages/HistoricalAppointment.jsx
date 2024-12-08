import React, { useState, useEffect } from 'react';
import { FaFileDownload, FaEye, FaCommentDots, FaArrowLeft } from 'react-icons/fa';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { crud } from '../Config/firebase';
import { getAuth } from 'firebase/auth';
import Navbar from '../Components/Global/Navbar_Main';
import './HistoricalAppointmentStyle.css';
import { useHistory } from 'react-router-dom';

const HistoricalAppointment = () => {
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();
  const history = useHistory();

  useEffect(() => {
    if (auth.currentUser) {
      fetchAllUserData(auth.currentUser.uid);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchAllUserData = async (userId) => {
    try {
      setIsLoading(true);
      const userRef = doc(crud, `users/${userId}`);
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
        setAppointments([]);
        return;
      }

      const userData = docSnap.data();
      let allAppointments = [];

      if (userData.appointmentHistory) {
        const appointmentsWithFiles = userData.appointmentHistory
          .filter(app => app.importedFile || app.importedFiles)
          .map(app => ({
            ...app,
            importedFiles: app.importedFile ? [app.importedFile] : app.importedFiles
          }));
        allAppointments.push(...appointmentsWithFiles);
      }

      if (userData.medicalRecords) {
        const medicalRecords = userData.medicalRecords.map(record => ({
          date: record.appointmentDate,
          time: record.appointmentTime,
          appointmentType: record.appointmentType,
          importedFiles: [{
            name: record.fileName,
            url: record.fileUrl,
            type: record.fileType,
            uploadedAt: record.uploadedAt,
            uploadedBy: record.uploadedBy
          }],
          source: 'medicalRecords'
        }));
        allAppointments.push(...medicalRecords);
      }

      const processedRecords = mergeAndDeduplicateRecords(allAppointments);
      setAppointments(processedRecords);

    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const mergeAndDeduplicateRecords = (records) => {
    const seenRecords = new Map();

    records.forEach(record => {
      if (!record.date || !record.time) return;
      
      const key = `${record.date}_${record.time}`;
      if (seenRecords.has(key)) {
        const existing = seenRecords.get(key);
        existing.importedFiles = [
          ...(existing.importedFiles || []),
          ...(record.importedFiles || [])
        ];
      } else {
        seenRecords.set(key, record);
      }
    });

    const finalRecords = Array.from(seenRecords.values()).map(record => {
      if (record.importedFiles) {
        const seenUrls = new Set();
        record.importedFiles = record.importedFiles.filter(file => {
          if (!file || !file.url || seenUrls.has(file.url)) return false;
          seenUrls.add(file.url);
          return true;
        });
      }
      return record;
    });

    return finalRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleFilePreview = (file) => {
    history.push({
      pathname: '/image-preview',
      state: { imageUrl: file.url }
    });
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Navbar />
      <div className="historical-appointment-container">
        <button 
          className="btn btn-back" 
          onClick={() => history.goBack()}
        >
          <FaArrowLeft /> Back
        </button>
        <h2 className="title">Historical Records</h2>
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your records...</p>
          </div>
        ) : (
          <div className="appointment-list">
            {appointments.length === 0 ? (
              <div className="no-records">No historical records found.</div>
            ) : (
              appointments.map((appointment, index) => (
                <div key={index} className="appointment-card">
                  <div className="appointment-header">
                    <h3>{appointment.appointmentType || 'General Checkup'}</h3>
                    <span className="appointment-date">
                      {formatDate(appointment.date)}
                    </span>
                  </div>
                  <div className="file-section">
                    {appointment.importedFile && (
                      <div className="file-preview-card">
                        <FaFileDownload className="file-icon" />
                        <div className="file-info">
                          <span className="file-name">{appointment.importedFile.name}</span>
                          <div className="file-actions">
                            <button 
                              className="btn btn-preview"
                              onClick={() => handleFilePreview(appointment.importedFile)}
                            >
                              <FaEye /> Preview
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {appointment.importedFiles && appointment.importedFiles.length > 0 && (
                      <div className="multiple-files-section">
                        {appointment.importedFiles.map((file, fileIndex) => (
                          <div key={fileIndex} className="file-preview-card">
                            <FaFileDownload className="file-icon" />
                            <div className="file-info">
                              <span className="file-name">{file.name}</span>
                              <small className="file-date">
                                Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                              </small>
                              <div className="file-actions">
                                <button 
                                  className="btn btn-preview"
                                  onClick={() => handleFilePreview(file)}
                                >
                                  <FaEye /> Preview
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {appointment.remark && (
                    <div className="remark-section">
                      <FaCommentDots />
                      <div>
                        <strong>Remark:</strong>
                        <p>{appointment.remark}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default HistoricalAppointment; 