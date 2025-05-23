import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, orderBy, limit, getDoc, where, arrayUnion, updateDoc } from 'firebase/firestore';
import { db as crud, storage } from '../../Config/firebase';
import Sidebar from '../Global/Sidebar';
import './PatientsRecordStyle.css';
import { useLocation } from 'react-router-dom';
import { FaTrash, FaSearch, FaSort, FaFile, FaEye, FaFolder, FaTrashAlt, FaUserCircle, FaEnvelope, FaCalendarAlt, FaPhone, FaMapMarkerAlt, FaVenusMars, FaClock, FaCloudUploadAlt, FaSpinner, FaTimes, FaImage, FaFileWord, FaFileImport, FaFileDownload, FaUser } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import UserProfilePopup from './UserProfilePopup';
import './UserProfilePopupStyle.css';
import MedicalPictureFiles from './MedicalPictureFiles/MedicalPictureFiles';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(12);
  const location = useLocation();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [groupedRecords, setGroupedRecords] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [selectedRecordForImport, setSelectedRecordForImport] = useState(null);
  const [importedFiles, setImportedFiles] = useState({});
  const [showUserProfilePopup, setShowUserProfilePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [showMedicalFilesModal, setShowMedicalFilesModal] = useState(false);
  const [showMedicalPictureFiles, setShowMedicalPictureFiles] = useState(false);
  const [medicalFiles, setMedicalFiles] = useState([]);

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

  const sortedRecords = React.useMemo(() => {
    return [...patientsRecords];
  }, [patientsRecords]);

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

  const handleFolderClick = async (records) => {
    console.log('Initial records:', records);
    
    // Get the latest data for each record
    const firestore = getFirestore();
    try {
      const updatedRecords = await Promise.all(records.map(async (record) => {
        const recordRef = doc(firestore, 'patientsRecords', record.id);
        const recordSnap = await getDoc(recordRef);
        if (recordSnap.exists()) {
          return {
            id: recordSnap.id,
            ...recordSnap.data()
          };
        }
        return record;
      }));

      console.log('Updated records with files:', updatedRecords);
      setSelectedFolder(updatedRecords);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error fetching updated records:', error);
      setSelectedFolder(records);
      setSelectedMessage(null);
    }
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

  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
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

        // Update both the appointments record and the user's medical history
        await Promise.all([
          updateRecord(record, uploadedFiles),
          updateUserMedicalHistory(record, uploadedFiles)
        ]);
        
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

      console.log('Record updated successfully in database');
      
      if (record.userId) {
        await fetchMedicalRecords(record.userId);
      }
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  };

  const updateUserMedicalHistory = async (record, uploadedFiles) => {
    if (!record.userId) return; // Skip if no userId is available

    try {
      const userRef = doc(crud, 'users', record.userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Update appointmentHistory
        let appointmentHistory = userData.appointmentHistory || [];
        appointmentHistory = appointmentHistory.map(appointment => {
          if (appointment.date === record.date && appointment.time === record.time) {
            return {
              ...appointment,
              importedFiles: [
                ...(appointment.importedFiles || []),
                ...uploadedFiles
              ]
            };
          }
          return appointment;
        });

        // Add to medicalRecords
        const medicalRecords = userData.medicalRecords || [];
        const newMedicalRecords = uploadedFiles.map(file => ({
          fileName: file.name,
          fileUrl: file.url,
          fileType: file.type,
          uploadedAt: file.uploadedAt,
          uploadedBy: file.uploadedBy,
          appointmentDate: record.date,
          appointmentTime: record.time,
          appointmentType: record.appointmentType || 'General Checkup',
          status: record.status
        }));

        // Update the user document
        await updateDoc(userRef, {
          appointmentHistory,
          medicalRecords: [...medicalRecords, ...newMedicalRecords]
        });

        console.log('User medical history updated successfully');
      }
    } catch (error) {
      console.error('Error updating user medical history:', error);
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
                    const key = `${appointment.date}_${appointment.time}`;
                    let appointmentFiles = [];
                    
                    if (appointment.importedFile) {
                        appointmentFiles.push(appointment.importedFile);
                    }
                    
                    if (appointment.importedFiles && Array.isArray(appointment.importedFiles)) {
                        appointmentFiles = [...appointmentFiles, ...appointment.importedFiles];
                    }
                    
                    if (appointmentFiles.length > 0) {
                        files[key] = appointmentFiles;
                    }
                });
            }

            if (userData.medicalRecords) {
                userData.medicalRecords.forEach(record => {
                    const key = `${record.appointmentDate}_${record.appointmentTime}`;
                    const fileRecord = {
                        name: record.fileName,
                        url: record.fileUrl,
                        uploadedAt: record.uploadedAt,
                        uploadedBy: record.uploadedBy,
                        type: record.fileType,
                        size: record.fileSize,
                        appointmentType: record.appointmentType
                    };
                    
                    files[key] = files[key] ? [...files[key], fileRecord] : [fileRecord];
                });
            }

            setGroupedRecords(prev => {
                const updatedGroups = { ...prev };
                Object.keys(updatedGroups).forEach(key => {
                    updatedGroups[key] = updatedGroups[key].map(record => {
                        const fileKey = `${record.date}_${record.time}`;
                        if (files[fileKey]) {
                            return {
                                ...record,
                                importedFiles: files[fileKey],
                                importedFile: files[fileKey][0]
                            };
                        }
                        return record;
                    });
                });
                return updatedGroups;
            });

            setImportedFiles(files);
        }
    } catch (error) {
        console.error("Error fetching medical records:", error);
        toast.error("Failed to fetch medical records");
    }
  };

  const handleViewProfile = async (event, records) => {
    event.stopPropagation();
    try {
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', records[0].userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setSelectedUser({
          id: userSnap.id,
          ...userData
        });
        setShowUserProfilePopup(true);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleFilesButtonClick = () => {
    setShowFilesModal(true);
  };

  const FilesModal = () => (
    <div className="folder-popup" onClick={() => setShowFilesModal(false)}>
        <div className="folder-popup-content">
            <div className="modal-header">
                <h4 className="modal-title">Attached Files</h4>
                <button 
                    className="close-modal-btn"
                    onClick={() => setShowFilesModal(false)}
                    aria-label="Close modal"
                >
                    &times;
                </button>
            </div>
            <div className="modal-body">
                {selectedFile?.importedFiles && selectedFile.importedFiles.length > 0 ? (
                    <div className="file-links-container">
                        {selectedFile.importedFiles.map((file, index) => (
                            <div key={index} className="file-link-item">
                                <a 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="file-link"
                                >
                                    <FaFile /> {file.name}
                                </a>
                                <small className="file-upload-info">
                                    Uploaded on: {new Date(file.uploadedAt).toLocaleString()}
                                </small>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No files attached.</p>
                )}
            </div>
        </div>
    </div>
  );

  const handleMedicalPictureClick = async () => {
    if (!selectedFolder) return;

    const firestore = getFirestore();
    try {
      // Get all files from the selected folder's records
      const filesMap = new Map(); // Use Map to track unique files by URL
      
      for (const record of selectedFolder) {
        const recordRef = doc(firestore, 'patientsRecords', record.id);
        const recordSnap = await getDoc(recordRef);
        
        if (recordSnap.exists()) {
          const data = recordSnap.data();
          
          // Add single importedFile if it exists
          if (data.importedFile && data.importedFile.url && !filesMap.has(data.importedFile.url)) {
            filesMap.set(data.importedFile.url, {
              ...data.importedFile,
              recordId: record.id,
              appointmentDate: data.date,
              appointmentTime: data.time,
              status: data.status
            });
          }
          
          // Add array of importedFiles if they exist
          if (data.importedFiles && Array.isArray(data.importedFiles)) {
            data.importedFiles.forEach(file => {
              if (file && file.url && !filesMap.has(file.url)) {
                filesMap.set(file.url, {
                  ...file,
                  recordId: record.id,
                  appointmentDate: data.date,
                  appointmentTime: data.time,
                  status: data.status
                });
              }
            });
          }
        }
      }

      // Convert Map values to array
      const uniqueFiles = Array.from(filesMap.values());
      console.log('Collected unique medical files:', uniqueFiles);
      setMedicalFiles(uniqueFiles);
      setShowMedicalPictureFiles(true);
    } catch (error) {
      console.error('Error fetching medical files:', error);
      toast.error('Failed to load medical files');
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
           <Sidebar isAdmin={true} />
        <div className="main-content loading-container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }
  const closeUserProfilePopup = () => {
    setShowUserProfilePopup(false);
    setSelectedUser(null);
  };
  return (
    <div className="dashboard-container">
         <Sidebar isAdmin={true} />
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
                          <button 
                            className="btn btn-icon" 
                            onClick={(e) => handleViewProfile(e, records)}
                            title="View Profile"
                          >
                            <FaUserCircle />
                          </button>
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
                  <div className="files-header-left">
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
                  <div className="files-header-right">
                    <button 
                      className="btn btn-primary"
                      onClick={handleMedicalPictureClick}
                    >
                      <FaImage /> Medical Picture
                    </button>
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
                                  <FaUserCircle className="icon" />
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

                          </div>
                          <div className="file-actions">
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

      {selectedFile && showAppointmentModal && (
        <div className="folder-popup" onClick={(e) => {
          if (e.target.className === 'folder-popup') {
            setShowAppointmentModal(false);
          }
        }}>
          <div className="folder-popup-content patients-record-appointment-modal">
            <div className="modal-header">
              <h4 className="modal-title"></h4>
              <button 
                className="close-modal-btn"
                onClick={() => setShowAppointmentModal(false)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="modal-body-admin">
              <div className="info-card full-width">
                <div className="info-card-header">
                  <h4>Basic Information</h4>
                </div>
                <div className="info-card-content info-grid">
                  <div className="info-item-rec">
                    <label>Full Name</label>
                    <span>{selectedFile.name}</span>
                  </div>
                  <div className="info-item-rec">
                    <label>Email</label>
                    <span>{selectedFile.email}</span>
                  </div>
                  <div className="info-item-rec">
                    <label>Age</label>
                    <span>{selectedFile.age}</span>
                  </div>
                  <div className="info-item-rec">
                    <label>Date</label>
                    <span>{new Date(selectedFile.date).toLocaleDateString()}</span>
                  </div>
                  <div className="iinfo-item-rec">
                    <label>Time</label>
                    <span>{selectedFile.time}</span>
                  </div>
                </div>
              </div>

              <div className="info-card full-width">
                <div className="info-card-header">
                  <h4>Appointment Details</h4>
                </div>
                <div className="info-card-content">
              
                  <div className="info-item-rec">
                    <label>Selected Services</label>
                    <div className="services-list">
                      {Array.isArray(selectedFile.selectedServices) ? (
                        <>
                          <div className="pricing-summary mb-3">
                            <h6>Pricing Type: <span className="pricing-badge">{formatPricingType(selectedFile.selectedPricingType)}</span></h6>
                            {selectedFile.totalAmount && (
                              <div className="pricing-details mt-2">
                                <div className="row">
                                  <div className="col-md-4">
                                    <small className="text-muted">Without PhilHealth:</small>
                                    <div>₱{selectedFile.totalAmount.withoutPH?.toLocaleString()}</div>
                                  </div>
                                  <div className="col-md-4">
                                    <small className="text-muted">PhilHealth Benefit:</small>
                                    <div>₱{selectedFile.totalAmount.PHBenefit?.toLocaleString()}</div>
                                  </div>
                                  <div className="col-md-4">
                                    <small className="text-muted">With PhilHealth:</small>
                                    <div>₱{selectedFile.totalAmount.withPH?.toLocaleString()}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          {selectedFile.selectedServices.map((service, index) => (
                            <div key={index} className="service-item-rec p-3 border rounded mb-2">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">{service.name}</h6>
                                <span className="badge ">
                                  ₱{service[selectedFile.selectedPricingType]?.toLocaleString()}
                                </span>
                              </div>
                              {service.isPackage && service.components && (
                                <div className="mt-2">
                                  <small className="text-muted">Package Components:</small>
                                  <ul className="list-unstyled ms-3">
                                    {service.components.map((component, idx) => (
                                      <li key={idx} className="d-flex justify-content-between">
                                        <span>{component.name}</span>
                                        <span>₱{component[selectedFile.selectedPricingType]?.toLocaleString()}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                          <div className="total-amount  bg-light rounded">
                            <strong>Total Amount: </strong>
                            <span>₱{calculateTotal(
                              selectedFile.selectedServices,
                              selectedFile.selectedPricingType
                            )}</span>
                          </div>
                        </>
                      ) : (
                        <span className="no-services">No services selected</span>
                      )}
                    </div>
                  </div>
                  <div className="info-item-rec">
                    <label>Status</label>
                    <span className={`status-badge ${selectedFile.status || 'pending'}`}>
                      {capitalizeFirstLetter(selectedFile.status || 'pending')}
                    </span>
                  </div>
                </div>
              </div>


              {showFilesModal && <FilesModal />}
            </div>

          </div>
        </div>
      )}
      {showUserProfilePopup && selectedUser && (
        <UserProfilePopup
          user={selectedUser}
          onClose={closeUserProfilePopup}
        />
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
          </div>
        </div>
      )}
      {showMedicalPictureFiles && (
        <MedicalPictureFiles
          isOpen={showMedicalPictureFiles}
          onClose={() => setShowMedicalPictureFiles(false)}
          selectedFolder={selectedFolder}
          files={medicalFiles}
          patientName={selectedFolder[0]?.name}
        />
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
            {'<'}
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
                     {'>'}
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

function calculateTotal(services, pricingType) {
  if (!services || !Array.isArray(services)) return 0;
  
  return services.reduce((total, service) => {
    const servicePrice = service[pricingType] || 0;
    return total + servicePrice;
  }, 0);
}

export default PatientsRecord;