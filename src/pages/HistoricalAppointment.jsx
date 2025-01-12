import React, { useState, useEffect, useCallback } from 'react';
import { FaFileDownload, FaEye, FaCommentDots, FaArrowLeft } from 'react-icons/fa';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { crud } from '../Config/firebase';
import { getAuth } from 'firebase/auth';
import Navbar from '../Components/Global/Navbar_Main';
import './HistoricalAppointmentStyle.css';
import { useHistory } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HistoricalAppointment = () => {
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const auth = getAuth();
  const history = useHistory();

  const checkForNewUpdates = useCallback(async (userId, currentAppointments) => {
    try {
      const lastVisitRef = doc(crud, `users/${userId}/metadata/lastVisit`);
      const lastVisitDoc = await getDoc(lastVisitRef);
      const lastVisitData = lastVisitDoc.data();
      const lastVisitTime = lastVisitData?.timestamp || 0;

      const hasUpdates = currentAppointments.some(appointment => {
        const appointmentTime = new Date(appointment.date).getTime();
        return appointmentTime > lastVisitTime;
      });

      if (hasUpdates) {
        setHasNewUpdates(true);
      }

      await setDoc(lastVisitRef, {
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  }, []);

  useEffect(() => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      localStorage.setItem(`lastViewedRecords_${userId}`, Date.now().toString());
      fetchAllUserData(userId);
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

      await checkForNewUpdates(userId, processedRecords);

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
    const fileUrl = file.url || file.fileUrl;
    if (fileUrl) {
      history.push({
        pathname: '/image-preview',
        state: { imageUrl: fileUrl }
      });
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    if (!fileUrl || !fileName) {
      console.error('File information is incomplete');
      return;
    }

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Failed to fetch file');
      
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

  useEffect(() => {
    return () => {
      setHasNewUpdates(false);
    };
  }, []);

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
                    {appointment.importedFiles && appointment.importedFiles.map((file, fileIndex) => (
                      <div key={fileIndex} className="file-preview-card">
                        <FaFileDownload className="file-icon" />
                        <div className="file-info">
                          <span className="file-name">{file.name || file.fileName}</span>
                          <div className="file-actions">
                            <button 
                              className="btn btn-preview"
                              onClick={() => handleFilePreview(file)}
                            >
                              <FaEye /> Preview
                            </button>
                          </div>
                          {file.uploadedAt && (
                            <small className="upload-date">
                              Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                            </small>
                          )}
                        </div>
                      </div>
                    ))}
                    {appointment.importedFile && !appointment.importedFiles?.some(f => f.url === appointment.importedFile.url) && (
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
                          {appointment.importedFile.uploadedAt && (
                            <small className="upload-date">
                              Uploaded: {new Date(appointment.importedFile.uploadedAt).toLocaleDateString()}
                            </small>
                          )}
                        </div>
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
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default HistoricalAppointment; 