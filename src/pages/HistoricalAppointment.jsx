import React, { useState, useEffect } from 'react';
import { FaFileDownload, FaEye, FaCommentDots } from 'react-icons/fa';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { crud } from '../Config/firebase';
import { getAuth } from 'firebase/auth';
import Navbar from '../Components/Global/Navbar_Main';
import './HistoricalAppointmentStyle.css';

const HistoricalAppointment = () => {
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    if (auth.currentUser) {
      fetchAppointmentsWithFiles(auth.currentUser.uid);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchAppointmentsWithFiles = async (userId) => {
    try {
      setIsLoading(true);
      const userRef = doc(crud, `users/${userId}`);
      const docSnap = await getDoc(userRef);
      
      let allAppointments = [];
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.appointmentHistory) {
          const appointmentsWithFiles = userData.appointmentHistory.filter(app => 
            app.importedFile || app.importedFiles
          ).map(app => ({
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

        const seenRecords = new Set();

        const mergedRecords = allAppointments
          .filter(record => {
            if (!record.date || !record.time) return false;
            
            const key = `${record.date}_${record.time}`;
            if (seenRecords.has(key)) {
              const existingRecord = allAppointments.find(r => 
                `${r.date}_${r.time}` === key
              );
              if (existingRecord && record.importedFiles) {
                existingRecord.importedFiles = [
                  ...(existingRecord.importedFiles || []),
                  ...record.importedFiles
                ];
              }
              return false;
            }
            seenRecords.add(key);
            return true;
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        const deduplicatedRecords = mergedRecords.map(record => {
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

        console.log('Final Merged Records:', deduplicatedRecords); 
        setAppointments(deduplicatedRecords);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilePreview = (file) => {
    setSelectedFile(file);
    setShowFileModal(true);
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
      <Navbar/>
    <div className="historical-appointment-container">
      <h2>Historical Records</h2>
      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="appointment-list">
          {appointments.length === 0 ? (
            <div className="no-records">No historical records found.</div>
          ) : (
            appointments.map((appointment, index) => (
              <div key={index} className="appointment-item">
                <div className="appointment-header">
                  <h3>{appointment.appointmentType || 'General Checkup'}</h3>
                  <span className="appointment-date">
                    Date: {formatDate(appointment.date)}
                  </span>
                </div>
                
                <div className="file-section">
                  {appointment.importedFile && (
                    <div className="file-preview-card">
                      <FaFileDownload className="file-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                      <div className="file-info">
                        <span>{appointment.importedFile.name}</span>
                        <div className="file-actions">
                          <button 
                            className="btn btn-preview"
                            onClick={() => handleFilePreview(appointment.importedFile)}
                            style={{ 
                              backgroundColor: 'rgb(197, 87, 219)',
                              borderColor: 'rgb(197, 87, 219)',
                              color: 'white'
                            }}
                          >
                            <FaEye style={{ color: 'white' }} /> Preview
                          </button>
                          <button 
                            className="btn btn-download"
                            onClick={() => handleDownload(
                              appointment.importedFile.url, 
                              appointment.importedFile.name
                            )}
                            style={{ 
                              backgroundColor: 'rgb(197, 87, 219)',
                              borderColor: 'rgb(197, 87, 219)',
                              color: 'white'
                            }}
                          >
                            <FaFileDownload style={{ color: 'white' }} /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {appointment.importedFiles && appointment.importedFiles.length > 0 && (
                    <div className="multiple-files-section">
                      {appointment.importedFiles.map((file, fileIndex) => (
                        <div key={fileIndex} className="file-preview-card">
                          <FaFileDownload className="file-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                          <div className="file-info">
                            <span>{file.name}</span>
                            <small className="file-date">
                              Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                            </small>
                            <div className="file-actions">
                              <button 
                                className="btn btn-preview"
                                onClick={() => handleFilePreview(file)}
                                style={{ 
                                  backgroundColor: 'rgb(197, 87, 219)',
                                  borderColor: 'rgb(197, 87, 219)',
                                  color: 'white'
                                }}
                              >
                                <FaEye style={{ color: 'white' }} /> Preview
                              </button>
                              <button 
                                className="btn btn-download"
                                onClick={() => handleDownload(file.url, file.name)}
                                style={{ 
                                  backgroundColor: 'rgb(197, 87, 219)',
                                  borderColor: 'rgb(197, 87, 219)',
                                  color: 'white'
                                }}
                              >
                                <FaFileDownload style={{ color: 'white' }} /> Download
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

      {showFileModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedFile?.name}</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowFileModal(false)}
                  ></button>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => handleDownload(selectedFile?.url, selectedFile?.name)}
                    style={{ 
                      backgroundColor: 'rgb(197, 87, 219)', 
                      borderColor: 'rgb(197, 87, 219)',
                      color: 'white'
                    }}
                  >
                    Download
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowFileModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
    </>
  );
};

export default HistoricalAppointment; 