import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, orderBy, limit, getDoc, where, arrayUnion, updateDoc } from 'firebase/firestore';
import { db as crud, storage } from '../../Config/firebase';
import Sidebar from '../Global/Sidebar';
import './PatientsRecordStyle.css';
import { useLocation } from 'react-router-dom';
import { FaTrash, FaSearch, FaSort, FaFile, FaEye, FaFolder, FaTrashAlt, FaUser, FaUserCircle, FaEnvelope, FaCalendarAlt, FaPhone, FaMapMarkerAlt, FaVenusMars, FaClock, FaCloudUploadAlt, FaSpinner, FaTimes, FaImage, FaFileWord, FaFileImport, FaFileDownload } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function formatPricingType(type) {
  switch (type) {
    case 'withoutPH':
      return 'Without PhilHealth';
    case 'PHBenefit':
      return 'PhilHealth Benefit';
    case 'withPH':
      return 'With PhilHealth';
    default:
      return type || 'N/A';
  }
}

const validateFiles = (files) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'text/plain'];
  
  for (let file of files) {
    if (file.size > maxSize) {
      throw new Error(`File "${file.name}" exceeds 10MB size limit`);
    }
    if (!validTypes.includes(file.type)) {
      throw new Error(`File "${file.name}" has invalid type. Allowed types: PDF, DOC, DOCX, JPG, PNG, TXT`);
    }
  }
};

function PatientsRecord() {
  const [patientsRecords, setPatientsRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(12);
  const location = useLocation();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [groupedRecords, setGroupedRecords] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [selectedRecordForImport, setSelectedRecordForImport] = useState(null);
  const [importedFiles, setImportedFiles] = useState({});

  useEffect(() => {
    fetchRecords();

    if (location.state?.newRecord) {
      const newRecord = location.state.newRecord;
      setGroupedRecords(prevGroups => {
        const key = `${newRecord.name}_${newRecord.email}`;
        const updatedGroup = {
          ...prevGroups,
          [key]: [...(prevGroups[key] || []), newRecord]
        };
        toast.success('New record added successfully!');
        return updatedGroup;
      });
      
      if (newRecord.userId) {
        fetchMedicalRecords(newRecord.userId);
      }
    }
  }, [location]);

  const fetchRecords = async () => {
    setIsLoading(true);
    const firestore = getFirestore();
    try {
      const q = query(
        collection(firestore, 'patientsRecords'), 
        orderBy('date', sortOrder), 
        limit(100)
      );
      const recordsSnapshot = await getDocs(q);
      const recordsData = await Promise.all(recordsSnapshot.docs.map(async doc => {
        const data = doc.data();
        
        if (data.userId) {
          await fetchImportedFiles(data.userId);
        }

        const importedFile = importedFiles[`${data.date}_${data.time}`];
        
        return {
          id: doc.id,
          name: data.name || 'N/A',
          email: data.email || 'N/A',
          age: data.age || 'N/A',
          date: data.date ? new Date(data.date).toISOString() : null,
          time: data.time || 'N/A',
          selectedPricingType: data.selectedPricingType || 'N/A',
          selectedServices: data.selectedServices || [],
          message: data.message || 'N/A',
          importedFile: importedFile || null,
          status: data.status || 'completed',
          totalAmount: data.totalAmount || null,
          remark: data.remark || null,
          userId: data.userId
        };
      }));
      
      const grouped = recordsData.reduce((acc, record) => {
        const key = `${record.name}_${record.email}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(record);
        acc[key].sort((a, b) => new Date(b.date) - new Date(a.date));
        return acc;
      }, {});

      setGroupedRecords(grouped);
      setPatientsRecords(recordsData);
    } catch (error) {
      console.error("Error fetching patient records: ", error);
      toast.error("Failed to load patient records");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const firestore = getFirestore();
        await deleteDoc(doc(firestore, 'patientsRecords', id));
        setPatientsRecords(prev => prev.filter(record => record.id !== id));
      } catch (error) {
        console.error("Error deleting record: ", error);
        alert("Failed to delete the record. Please try again.");
      }
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedRecords = React.useMemo(() => {
    let sortableRecords = [...patientsRecords];
    if (sortConfig.key !== null) {
      sortableRecords.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableRecords;
  }, [patientsRecords, sortConfig]);

  const filteredRecords = sortedRecords.filter(record =>
    Object.values(record).some(value => 
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); 
  };

  const handleMessageClick = (record) => {
    setSelectedMessage(record);
  };

  const closeMessagePopup = () => {
    setSelectedMessage(null);
  };

  const handleFolderClick = (records) => {
    setSelectedFolder(records);
    setSelectedMessage(null); 
  };

  const handleFileClick = (record) => {
    setSelectedFile(record);
    setShowAppointmentModal(true);
  };

  const handleDeleteFolder = async (key, records, e) => {
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete all records for this patient?`)) {
      const firestore = getFirestore();
      try {
        await Promise.all(
          records.map(record => 
            deleteDoc(doc(firestore, 'patientsRecords', record.id))
          )
        );

        setGroupedRecords(prevGroups => {
          const newGroups = { ...prevGroups };
          delete newGroups[key];
          return newGroups;
        });

        toast.success('Folder and all records deleted successfully');
      } catch (error) {
        console.error("Error deleting folder: ", error);
        toast.error('Failed to delete folder');
      }
    }
  };

  const handleDeleteFile = async (record, e) => {
    e.stopPropagation(); 
    
    if (window.confirm('Are you sure you want to delete this record?')) {
      const firestore = getFirestore();
      try {
        await deleteDoc(doc(firestore, 'patientsRecords', record.id));

        const key = `${record.name}_${record.email}`;
        setGroupedRecords(prevGroups => {
          const newGroups = { ...prevGroups };
          newGroups[key] = newGroups[key].filter(r => r.id !== record.id);
          
          if (newGroups[key].length === 0) {
            delete newGroups[key];
          }
          
          return newGroups;
        });

        if (selectedFolder) {
          setSelectedFolder(prev => prev.filter(r => r.id !== record.id));
        }

        if (selectedFile?.id === record.id) {
          setSelectedFile(null);
        }

        toast.success('Record deleted successfully');
      } catch (error) {
        console.error("Error deleting record: ", error);
        toast.error('Failed to delete record');
      }
    }
  };

  const fetchUserProfile = async (record) => {
    const firestore = getFirestore();
    try {
      const userQuery = query(
        collection(firestore, 'users'),
        where('email', '==', record.email),
        limit(1)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setSelectedProfile({
          ...record,
          profilePicture: userData.profilePicture || null,
          phone: userData.phone || record.phone,
          location: userData.location || record.location,
          gender: userData.gender || record.gender
        });
      } else {
        setSelectedProfile(record);
      }
      setShowProfileModal(true);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setSelectedProfile(record);
      setShowProfileModal(true);
    }
  };

  const handleViewProfile = (record) => {
    fetchUserProfile(record);
  };

  const handleViewUserProfile = async (record) => {
    try {
      const userDoc = await getDoc(doc(crud, 'users', record.userId));
      if (userDoc.exists()) {
        setSelectedUserProfile({
          ...userDoc.data(),
          id: record.userId
        });
        setShowUserProfileModal(true);
      } else {
        toast.error("User profile not found");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
    }
  };

  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading patient records...</p>
    </div>
  );

  const handleImport = (record) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true; 
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt';
    
    input.onchange = async (event) => {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;

      try {
        validateFiles(files);

        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        const loadingToast = toast.loading(`Uploading ${files.length} file(s)...`);

        const storage = getStorage();
        const uploadedFiles = [];

        for (const file of files) {
          const storageRef = ref(storage, `appointments/${user.uid}/${record.id}/${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          
          uploadedFiles.push({
            name: file.name,
            url: downloadURL,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            uploadedBy: {
              uid: user.uid,
              email: user.email
            }
          });
        }

        await updateRecord(record, uploadedFiles);
      
        if (record.status === 'completed' || record.status === 'remarked') {
          await updateHistoricalRecord(record, uploadedFiles);
        }
        
        toast.dismiss(loadingToast);
        toast.success(`Successfully uploaded ${files.length} file(s)!`);

      } catch (error) {
        console.error('Error uploading files:', error);
        toast.error(`Error: ${error.message}`);
      }
    };
    input.click();
  };

  const updateRecord = async (record, uploadedFiles) => {
    try {
      setGroupedRecords(prevGroups => {
        const newGroups = { ...prevGroups };
        Object.keys(newGroups).forEach(key => {
          newGroups[key] = newGroups[key].map(r => 
            r.id === record.id 
              ? { 
                  ...r, 
                  importedFiles: [...(r.importedFiles || []), ...uploadedFiles]
                }
              : r
          );
        });
        return newGroups;
      });
      
      const firestore = getFirestore();
      const recordRef = doc(firestore, 'patientsRecords', record.id);
    
      const recordDoc = await getDoc(recordRef);
      const currentFiles = recordDoc.data()?.importedFiles || [];
      
      await updateDoc(recordRef, {
        importedFiles: [...currentFiles, ...uploadedFiles]
      });

      if (record.userId) {
        const userRef = doc(firestore, 'users', record.userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          let medicalRecords = userData.medicalRecords || [];
          
          const newRecords = uploadedFiles.map(file => ({
            fileName: file.name,
            fileUrl: file.url,
            fileType: file.type,
            uploadedAt: file.uploadedAt,
            uploadedBy: file.uploadedBy,
            appointmentDate: record.date,
            appointmentTime: record.time,
            appointmentType: record.appointmentType || 'General Checkup',
            status: record.status,
            patientName: record.name,
            patientEmail: record.email
          }));

          await updateDoc(userRef, { 
            medicalRecords: [...medicalRecords, ...newRecords]
          });
        }
      }

      console.log('Record updated successfully in database');
      
      if (record.userId) {
        await fetchMedicalRecords(record.userId);
      }
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  };

  const updateHistoricalRecord = async (record, uploadedFiles) => {
    try {
      const userRef = doc(crud, 'users', record.userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        let appointmentHistory = userData.appointmentHistory || [];
        
        appointmentHistory = appointmentHistory.map(appointment => {
          if (appointment.date === record.date && appointment.time === record.time) {
            return {
              ...appointment,
              importedFiles: [...(appointment.importedFiles || []), ...uploadedFiles]
            };
          }
          return appointment;
        });

        let medicalRecords = userData.medicalRecords || [];
        const newRecords = uploadedFiles.map(file => ({
          fileName: file.name,
          fileUrl: file.url,
          fileType: file.type,
          uploadedAt: file.uploadedAt,
          uploadedBy: file.uploadedBy,
          appointmentDate: record.date,
          appointmentTime: record.time,
          appointmentType: record.appointmentType || 'General Checkup',
          status: record.status,
          patientName: record.name,
          patientEmail: record.email
        }));

        await updateDoc(userRef, {
          appointmentHistory,
          medicalRecords: [...medicalRecords, ...newRecords]
        });
      }
    } catch (error) {
      console.error('Error updating historical record:', error);
      throw error;
    }
  };

  const fetchImportedFiles = async (userId) => {
    try {
      const userRef = doc(crud, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.appointmentHistory) {
          const files = {};
          userData.appointmentHistory.forEach(appointment => {
            if (appointment.importedFile) {
              const key = `${appointment.date}_${appointment.time}`;
              files[key] = appointment.importedFile;
              
              setGroupedRecords(prev => {
                const recordKey = Object.keys(prev).find(k => {
                  const records = prev[k];
                  return records.some(r => 
                    r.date === appointment.date && 
                    r.time === appointment.time && 
                    r.userId === userId
                  );
                });

                if (recordKey) {
                  const updatedRecords = prev[recordKey].map(record => {
                    if (record.date === appointment.date && 
                        record.time === appointment.time && 
                        record.userId === userId) {
                      return {
                        ...record,
                        importedFile: appointment.importedFile
                      };
                    }
                    return record;
                  });

                  return {
                    ...prev,
                    [recordKey]: updatedRecords
                  };
                }
                return prev;
              });
            }
          });
          setImportedFiles(files);

          console.log("Updated importedFiles:", files);
          console.log("Updated groupedRecords:", groupedRecords);
        }
      }
    } catch (error) {
      console.error("Error fetching imported files:", error);
      toast.error("Failed to fetch imported files");
    }
  };

  const handleFilePreview = (record) => {
    if (record?.importedFile?.url) {
      setSelectedFile({
        ...record,
        importedFile: {
          name: record.importedFile.name || 'Unknown File',
          url: record.importedFile.url,
          type: record.importedFile.type || 'application/octet-stream',
          uploadedAt: record.importedFile.uploadedAt,
          uploadedBy: record.importedFile.uploadedBy || {},
          size: record.importedFile.size || 0
        }
      });
      setShowAppointmentModal(true);
    }
  };

  const fetchMedicalRecords = async (userId) => {
    try {
      const userRef = doc(crud, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        const files = {};
        
        if (userData.appointmentHistory) {
          userData.appointmentHistory.forEach(appointment => {
            if (appointment.importedFile) {
              const key = `${appointment.date}_${appointment.time}`;
              files[key] = appointment.importedFile;
            }
          });
        }

        if (userData.medicalRecords) {
          userData.medicalRecords.forEach(record => {
            const key = `${record.appointmentDate}_${record.appointmentTime}`;
            files[key] = {
              name: record.fileName,
              url: record.fileUrl,
              uploadedAt: record.uploadedAt,
              uploadedBy: record.uploadedBy,
              type: record.fileType,
              size: record.fileSize,
              appointmentType: record.appointmentType
            };
          });
        }

        setImportedFiles(files);

        setGroupedRecords(prev => {
          const updatedGroups = { ...prev };
          Object.keys(updatedGroups).forEach(key => {
            updatedGroups[key] = updatedGroups[key].map(record => {
              const fileKey = `${record.date}_${record.time}`;
              if (files[fileKey]) {
                return {
                  ...record,
                  importedFile: files[fileKey]
                };
              }
              return record;
            });
          });
          return updatedGroups;
        });
      }
    } catch (error) {
      console.error("Error fetching medical records:", error);
      toast.error("Failed to fetch medical records");
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content loading-container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="patients-record-header">
            <div className="header-left">
              <h1>Patients Records</h1>
              <span className="record-count-total">
                Total Records: {Object.values(groupedRecords).reduce((acc, records) => acc + records.length, 0)}
              </span>
            </div>
            <div className="header-right">
              <div className="search-bar">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <button 
                className="btn btn-outline-secondary btn-sm ms-2"
                onClick={() => {
                  setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                  fetchRecords();
                }}
              >
                <FaSort /> {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </button>
            </div>
          </div>
          <div className="patients-record-content">
            {!selectedFolder ? (
              <>
                <div className="folder-grid">
                  {Object.entries(groupedRecords)
                    .filter(([key, records]) => {
                      const searchLower = searchTerm.toLowerCase();
                      if (key.toLowerCase().includes(searchLower)) return true;
                      
                      return records.some(record => 
                        record.name?.toLowerCase().includes(searchLower) ||
                        record.email?.toLowerCase().includes(searchLower) ||
                        record.message?.toLowerCase().includes(searchLower) ||
                        record.appointmentType?.toLowerCase().includes(searchLower) ||
                        (record.age && record.age.toString().includes(searchLower)) ||
                        (record.date && new Date(record.date).toLocaleDateString().toLowerCase().includes(searchLower))
                      );
                    })
                    .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                    .map(([key, records]) => {
                      const [name] = key.split('_');
                      return (
                        <div 
                          key={key} 
                          className="folder-item"
                          onClick={() => handleFolderClick(records)}
                        >
                          <div className="folder-delete-btn" onClick={(e) => handleDeleteFolder(key, records, e)}>
                            <FaTrashAlt />
                          </div>
                          <FaFolder className="folder-icon" />
                          <div className="folder-label">{name || 'N/A'}</div>
                          <div className="record-count">{records.length} records</div>
                        </div>
                      );
                    })}
                </div>
                <div className="pagination-container">
                  <Pagination
                    recordsPerPage={recordsPerPage}
                    totalRecords={Object.keys(groupedRecords).length}
                    paginate={paginate}
                    currentPage={currentPage}
                  />
                </div>
              </>
            ) : (
              <div className="files-view">
                <div className="files-header">
                  <button 
                    className="btn btn-back"
                    onClick={() => setSelectedFolder(null)}
                  >
                    <FaFolder /> Back to Folders
                  </button>
                  <div className="folder-info">
                    <h3>{selectedFolder[0]?.name}'s Records</h3>
                    <span className="record-count">
                      {selectedFolder.length} {selectedFolder.length === 1 ? 'record' : 'records'}
                    </span>
                  </div>
                </div>
                <div className="files-grid">
                  {selectedFolder
                    .filter(record => {
                      if (!searchTerm) return true;
                      const searchLower = searchTerm.toLowerCase();
                      return (
                        record.name?.toLowerCase().includes(searchLower) ||
                        record.email?.toLowerCase().includes(searchLower) ||
                        record.message?.toLowerCase().includes(searchLower) ||
                        record.selectedPricingType?.toLowerCase().includes(searchLower) ||
                        (record.age && record.age.toString().includes(searchLower)) ||
                        (record.date && new Date(record.date).toLocaleDateString().toLowerCase().includes(searchLower))
                      );
                    })
                    .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                    .map((record) => (
                      <div 
                        key={record.id} 
                        className="file-item"
                        onClick={() => handleFileClick(record)}
                      >
                        <div className="file-content">
                          <div className="file-main-info">
                            <div className="file-primary-details">
                              <div className="name-status">
                                <h4>{record.name}</h4>
                                <span className={`status-badge ${record.status || 'pending'}`}>
                                  {capitalizeFirstLetter(record.status || 'pending')}
                                </span>
                              </div>
                              <div className="contact-info">
                                <span className="email-info">
                                  <FaEnvelope className="icon" />
                                  {record.email}
                                </span>
                                <span className="age-info">
                                  <FaUser className="icon" />
                                  Age: {record.age}
                                </span>
                              </div>
                            </div>
                            <div className="appointment-time">
                              <span className="date">
                                <FaCalendarAlt className="icon" />
                                {new Date(record.date).toLocaleDateString()}
                              </span>
                              <span className="time">
                                <FaClock className="icon" />
                                {record.time}
                              </span>
                            </div>
                            {record.importedFile && (
                              <div className="imported-file-indicator">
                                <FaFileDownload className="me-2" />
                                <span>Medical Record: {record.importedFile.name}</span>
                                <div className="file-actions">
                                  <button 
                                    className="btn btn-sm btn-preview"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFilePreview(record);
                                    }}
                                  >
                                    <FaEye className="me-1" />
                                    View
                                  </button>
                                  <a 
                                    href={record.importedFile.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-download"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <FaFileDownload className="me-1" />
                                    Download
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="file-actions">
                            <button 
                              className="action-btn profile-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewUserProfile(record);
                              }}
                              title="View profile"
                            >
                              <FaUserCircle />
                            </button>
                            <button 
                              className="action-btn view-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileClick(record);
                              }}
                              title="View details"
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="action-btn import-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImport(record);
                              }}
                              title="Import file"
                            >
                              <FaFileImport />
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              onClick={(e) => handleDeleteFile(record, e)}
                              title="Delete record"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="pagination-container">
                  <Pagination
                    recordsPerPage={recordsPerPage}
                    totalRecords={selectedFolder.length}
                    paginate={paginate}
                    currentPage={currentPage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showProfileModal && selectedProfile && (
        <div className="folder-popup" onClick={(e) => {
          if (e.target.className === 'folder-popup') {
            setShowProfileModal(false);
          }
        }}>
          <div className="folder-popup-content user-profile-style">
            <div className="row">
              <div className="col-lg-4">
                <div className="card profile-card shadow">
                  <div className="card-body text-center">
                    <div className="profile-image-container mb-4">
                      {selectedProfile.profilePicture ? (
                        <img
                          src={selectedProfile.profilePicture}
                          alt="Profile"
                          className="profile-image rounded-circle"
                        />
                      ) : (
                        <div className="profile-image-placeholder rounded-circle">
                          <FaUserCircle className="profile-icon" size={150} />
                        </div>
                      )}
                    </div>
                    <h3 className="mb-2">{selectedProfile.name || 'User'}</h3>
                    <p className="text-muted">{selectedProfile.email}</p>
                  </div>
                </div>

                <div className="card mt-4 stats-card shadow">
                  <div className="card-body">
                    <h4 className="card-title mb-4">Appointment Stats</h4>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <div className="stat-icon pending">
                          <FaCalendarAlt />
                        </div>
                        <div className="stat-label">Status</div>
                        <div className={`stat-value ${selectedProfile.status || 'pending'}`}>
                          {capitalizeFirstLetter(selectedProfile.status || 'pending')}
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-icon type">
                          <FaFile />
                        </div>
                        <div className="stat-label">Type</div>
                        <div className="stat-value">
                          {selectedProfile.appointmentType || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card mt-4 remark-card shadow">
                  <div className="card-body">
                    <h4 className="card-title mb-4">Appointment Remark</h4>
                    {selectedProfile.remark ? (
                      <>
                        <p>{selectedProfile.remark}</p>
                        {selectedProfile.remarkTimestamp && (
                          <small className="text-muted">
                            Added on: {new Date(selectedProfile.remarkTimestamp).toLocaleString()}
                          </small>
                        )}
                      </>
                    ) : (
                      <p>No remark available</p>
                    )}
                  </div>
                </div>

                <div className="card mt-4 files-card shadow">
                  <div className="card-body">
                    <h4 className="card-title mb-4">Attached Files</h4>
                    {selectedProfile.importedFile ? (
                      <div className="file-link-container">
                        <a 
                          href={selectedProfile.importedFile.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="file-link"
                        >
                          <FaFile /> {selectedProfile.importedFile.name}
                        </a>
                      </div>
                    ) : (
                      <p>No files attached</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="card details-card shadow">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="card-title m-0">Personal Details</h4>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="detail-item d-flex align-items-center">
                          <FaUser className="detail-icon" />
                          <div className="ms-3">
                            <h6 className="mb-0 text-muted">Full Name</h6>
                            <p className="mb-0 fw-bold">{selectedProfile.name || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="detail-item d-flex align-items-center">
                          <FaEnvelope className="detail-icon" />
                          <div className="ms-3">
                            <h6 className="mb-0 text-muted">Email</h6>
                            <p className="mb-0 fw-bold">{selectedProfile.email || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="detail-item d-flex align-items-center">
                          <FaCalendarAlt className="detail-icon" />
                          <div className="ms-3">
                            <h6 className="mb-0 text-muted">Age</h6>
                            <p className="mb-0 fw-bold">{selectedProfile.age || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="detail-item d-flex align-items-center">
                          <FaPhone className="detail-icon" />
                          <div className="ms-3">
                            <h6 className="mb-0 text-muted">Phone</h6>
                            <p className="mb-0 fw-bold">{selectedProfile.phone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="detail-item d-flex align-items-center">
                          <FaMapMarkerAlt className="detail-icon" />
                          <div className="ms-3">
                            <h6 className="mb-0 text-muted">Location</h6>
                            <p className="mb-0 fw-bold">{selectedProfile.location || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="detail-item d-flex align-items-center">
                          <FaVenusMars className="detail-icon" />
                          <div className="ms-3">
                            <h6 className="mb-0 text-muted">Gender</h6>
                            <p className="mb-0 fw-bold">{selectedProfile.gender || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card mt-4 appointment-card shadow">
                  <div className="card-body">
                    <h4 className="card-title mb-4">Appointment Status</h4>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{selectedProfile.appointmentType}</td>
                            <td>{new Date(selectedProfile.date).toLocaleDateString()}</td>
                            <td>{selectedProfile.time}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(selectedProfile.status)}`}>
                                {capitalizeFirstLetter(selectedProfile.status || 'pending')}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {selectedProfile.message && (
                      <div className="mt-3">
                        <h5>Additional Message:</h5>
                        <p>{selectedProfile.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="folder-popup-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowProfileModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedFile && showAppointmentModal && (
        <div className="folder-popup" onClick={(e) => {
          if (e.target.className === 'folder-popup') {
            setShowAppointmentModal(false);
          }
        }}>
          <div className="folder-popup-content appointment-modal">
            <div className="modal-header glass-header">
              <div className="d-flex align-items-center">
                <div className="header-icon">
                  <FaFileDownload size={24} />
                </div>
                <div className="ms-3">
                  <h4 className="modal-title mb-0" id="filePreviewTitle">
                    Medical Record
                  </h4>
                  <small className="text-muted">
                    {selectedFile?.importedFile?.name || 'No file name available'}
                  </small>
                </div>
              </div>
              <button 
                className="btn-close"
                onClick={() => setShowAppointmentModal(false)}
                aria-label="Close modal"
              ></button>
            </div>

            <div className="appointment-modal-body">
              <div className="info-card full-width">
                <div className="info-card-header">
                  <FaUser className="info-icon" />
                  <h4>Basic Information</h4>
                </div>
                <div className="info-card-content info-grid">
                  <div className="info-item">
                    <label>Full Name</label>
                    <span>{selectedFile.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span>{selectedFile.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Age</label>
                    <span>{selectedFile.age}</span>
                  </div>
                  <div className="info-item">
                    <label>Time</label>
                    <span>{selectedFile.time}</span>
                  </div>
                </div>
              </div>

              <div className="info-card full-width">
                <div className="info-card-header">
                  <FaFile className="info-icon" />
                  <h4>Appointment Details</h4>
                </div>
                <div className="info-card-content">
                  <div className="info-item">
                    <label>Pricing Type</label>
                    <span>{formatPricingType(selectedFile.selectedPricingType)}</span>
                  </div>
                  <div className="info-item">
                    <label>Selected Services</label>
                    <div className="services-list">
                      {Array.isArray(selectedFile.selectedServices) ? (
                        selectedFile.selectedServices.map((service, index) => (
                          <span key={index} className="service-tag">
                            {typeof service === 'object' ? service.name : service}
                          </span>
                        ))
                      ) : (
                        <span className="no-services">No services selected</span>
                      )}
                    </div>
                  </div>
                  {selectedFile.message && (
                    <div className="info-item">
                      <label>Message</label>
                      <p className="message-text">{selectedFile.message}</p>
                    </div>
                  )}
                  <div className="info-item">
                    <label>Status</label>
                    <span className={`status-badge ${selectedFile.status || 'pending'}`}>
                      {capitalizeFirstLetter(selectedFile.status || 'pending')}
                    </span>
                  </div>
                </div>
              </div>

              {selectedFile.importedFiles && selectedFile.importedFiles.length > 0 && (
                <div className="info-card full-width">
                  <div className="info-card-header">
                    <FaFile className="info-icon" />
                    <h4>Attached Files ({selectedFile.importedFiles.length})</h4>
                  </div>
                  <div className="info-card-content">
                    <div className="file-links-container">
                      {selectedFile.importedFiles.map((file, index) => (
                        <div key={index} className="file-link-item">
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="file-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaFile /> {file.name}
                          </a>
                          <small className="file-upload-info">
                            Uploaded on: {new Date(file.uploadedAt).toLocaleString()}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="appointment-modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAppointmentModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showUserProfileModal && selectedUserProfile && (
        <div className="folder-popup" onClick={(e) => {
          if (e.target.className === 'folder-popup') {
            setShowUserProfileModal(false);
          }
        }}>
          <div className="folder-popup-content user-profile-modal">
            <div className="modal-header">
              <h3>User Profile</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowUserProfileModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-header">
                <div className="profile-image-container">
                  {selectedUserProfile.profilePicture ? (
                    <img
                      src={selectedUserProfile.profilePicture}
                      alt="Profile"
                      className="profile-image"
                    />
                  ) : (
                    <div className="profile-image-placeholder">
                      <FaUserCircle size={80} />
                    </div>
                  )}
                </div>
                <div className="profile-name">
                  <h4>{selectedUserProfile.name || 'N/A'}</h4>
                  <p className="email">{selectedUserProfile.email}</p>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-section-user">
                  <h5>Personal Information</h5>
                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Phone</label>
                      <span>{selectedUserProfile.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Age</label>
                      <span>{selectedUserProfile.age || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Gender</label>
                      <span>{selectedUserProfile.gender || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Location</label>
                      <span>{selectedUserProfile.location || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {selectedUserProfile.appointmentHistoryCount && (
                  <div className="detail-section-user">
                    <h5>Appointment Statistics</h5>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <div className="stat-value">{selectedUserProfile.appointmentHistoryCount.total || 0}</div>
                        <div className="stat-label">Total Appointments</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value completed">{selectedUserProfile.appointmentHistoryCount.completed || 0}</div>
                        <div className="stat-label">Completed</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value pending">{selectedUserProfile.appointmentHistoryCount.pending || 0}</div>
                        <div className="stat-label">Pending</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value remarked">{selectedUserProfile.appointmentHistoryCount.remarked || 0}</div>
                        <div className="stat-label">Remarked</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedRecordForImport && (
        <div className="folder-popup" onClick={(e) => {
          if (e.target.className === 'folder-popup') {
            setSelectedRecordForImport(null);
          }
        }}>
          <div className="folder-popup-content import-modal">
            <div className="modal-header">
              <h3>Import File for {selectedRecordForImport.name}</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setSelectedRecordForImport(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="import-instructions">
                <p>Please select a file to import for this record.</p>
                <p>Supported file types:</p>
                <ul>
                  <li>PDF documents (.pdf)</li>
                  <li>Word documents (.doc, .docx)</li>
                  <li>Images (.jpg, .png)</li>
                  <li>Text files (.txt)</li>
                </ul>
              </div>
              <div className="import-actions">
                <input
                  type="file"
                  id="fileInput"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  onChange={(e) => handleImport(selectedRecordForImport)}
                  style={{ display: 'none' }}
                />
                <label htmlFor="fileInput" className="btn btn-primary upload-btn">
                  <FaCloudUploadAlt className="me-2" />
                  Choose File
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedRecordForImport(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" />
    </div>
  );
}

const Pagination = ({ recordsPerPage, totalRecords, paginate, currentPage }) => {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <nav className="pagination-nav">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            onClick={() => paginate(currentPage - 1)}
            className="page-link"
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>
        
        {pageNumbers.map(number => (
          <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <button
              onClick={() => paginate(number)}
              className="page-link"
            >
              {number}
            </button>
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            onClick={() => paginate(currentPage + 1)}
            className="page-link"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

function capitalizeFirstLetter(string) {
  return string && typeof string === 'string' 
    ? string.charAt(0).toUpperCase() + string.slice(1) 
    : '';
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'approved': return 'bg-success';
    case 'rejected': return 'bg-danger';
    case 'remarked': return 'bg-info';
    default: return 'bg-warning';
  }
}

export default PatientsRecord;