import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../Components/Global/Navbar_Main';
import { auth, storage, crud } from '../Config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { FaUser, FaEnvelope, FaCalendarAlt, FaVenusMars, FaPhone, FaMapMarkerAlt, FaEdit, FaCamera, FaUserCircle, FaFileDownload, FaHistory, FaCheckCircle, FaTimesCircle, FaCommentDots, FaClock, FaThLarge, FaList, FaFolder, FaComment, FaEye, FaImage, FaFile } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './UserProfileStyle.css';
import defaultProfilePic from '.././Components/Assets/icon_you.png';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';

const getStatusIcon = (status) => {
  switch(status) {
    case 'completed': return <FaCheckCircle color="#0066ff" />;
    case 'rejected': return <FaTimesCircle color="#dc3545" />;
    case 'remarked': return <FaCommentDots color="#17a2b8" />;
    default: return <FaClock color="#ffc107" />;
  }
};

const ProfilePicture = ({ src, isLoading, isUploading, onFileChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleLocalFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <motion.div 
      className="profile-picture-container"
      initial={false}
      animate={{ scale: isHovered ? 1.02 : 1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="profile-image-wrapper"
      >
        {isLoading ? (
          <div className="profile-loading-skeleton">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <img
            src={src}
            alt="Profile"
            className="profile-image"
            onError={(e) => {
              e.target.src = defaultProfilePic;
              e.target.onerror = null;
            }}
          />
        )}
        
        <motion.div 
          className="profile-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <label htmlFor="profile-upload" className="upload-button">
            {isUploading ? (
              <div className="spinner-border spinner-border-sm text-light" role="status">
                <span className="visually-hidden">Uploading...</span>
              </div>
            ) : (
              <>
                <FaCamera className="camera-icon" />
                <span>Change Photo</span>
              </>
            )}
          </label>
        </motion.div>
      </motion.div>
      
      <input
        type="file"
        id="profile-upload"
        accept="image/*"
        onChange={handleLocalFileChange}
        style={{ display: 'none' }}
      />
    </motion.div>
  );
};

function UserProfile() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [profilePic, setProfilePic] = useState(defaultProfilePic);
  const [previewPic, setPreviewPic] = useState('');
  const [showRemark, setShowRemark] = useState(false);
  const [personalDetails, setPersonalDetails] = useState({
    name: '',
    location: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
  });
  const [remark, setRemark] = useState('');
  const [remarkTimestamp, setRemarkTimestamp] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [birthdate, setBirthdate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [newAppointments, setNewAppointments] = useState(0);
  const [hasNewRemark, setHasNewRemark] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        setPersonalDetails(prev => ({
          ...prev,
          email: user?.email || ''
        }));

        const storedData = localStorage.getItem(`appointmentData_${user.uid}`);
        if (storedData && storedData !== "undefined") {
          try {
            const parsedData = JSON.parse(storedData);
            setAppointmentData(parsedData);
          } catch (e) { 
            console.error("Error parsing JSON from localStorage:", e);
            setAppointmentData(null); 
          }
        } else {
          setAppointmentData(null); 
        }

        await fetchProfilePicture(user.uid);
        await fetchPersonalDetails(user.uid);
        await fetchInitialHistory(user.uid);
        const unsubscribeAppointments = subscribeToAppointments(user.uid);

        return () => unsubscribeAppointments(); 
      } else {
        resetState();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (location.state) {
      setAppointmentData(location.state.appointmentData);
      setShowRemark(location.state.showRemark || false);
    }
  }, [location]);
  
  useEffect(() => {
    let ageInterval;
    
    if (birthdate) {
      updateAge();
      
      ageInterval = setInterval(() => {
        updateAge();
      }, 86400000);
    }

    return () => {
      if (ageInterval) {
        clearInterval(ageInterval);
      }
    };
  }, [birthdate]);

  useEffect(() => {
    if (user) {
      fetchProfilePicture(user.uid);
      fetchPersonalDetails(user.uid);
      fetchInitialHistory(user.uid);
      const unsubscribeAppointments = subscribeToAppointments(user.uid);

      return () => unsubscribeAppointments();
    } else {
      resetState();
    }
  }, [user]);

  const resetState = () => {
    setUser(null);
    setAppointmentData(null);
    setProfilePic(defaultProfilePic);
    setPreviewPic('');
    setPersonalDetails({
      name: '',
      location: '',
      phone: '',
      email: '',
      age: '',
      gender: '',
    });
  };

  const subscribeToAppointments = (userId) => {
    const userRef = doc(crud, `users/${userId}`);
    const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
      const data = docSnapshot.data();
      if (data) {
        if (data.appointmentData) {
          if (data.appointmentData.remark && data.appointmentData.remark !== remark) {
            setHasNewRemark(true);
          }

          setAppointmentData(data.appointmentData);
          setIsApproved(data.appointmentData.status === 'approved');
          setRemark(data.appointmentData.remark || '');
          setRemarkTimestamp(data.appointmentData.remarkTimestamp || null);
          setMessage(data.appointmentData.message || '');

          if (['completed', 'rejected', 'remarked'].includes(data.appointmentData.status)) {
            await updateAppointmentHistory(userId, data.appointmentData);
          }
        }

        let allAppointments = [];
        
        if (data.appointmentData && !['completed', 'rejected'].includes(data.appointmentData.status)) {
          allAppointments.push({
            ...data.appointmentData,
            isCurrent: true
          });
        }

        if (data.appointmentHistory) {
          const previousLength = appointmentHistory.length;
          allAppointments = [...allAppointments, ...data.appointmentHistory];
          
          if (data.appointmentHistory.length > previousLength) {
            setNewAppointments(data.appointmentHistory.length - previousLength);
          }
        }

        const sortedAppointments = allAppointments.sort((a, b) => {
          if (a.status === 'completed' && b.status !== 'completed') return -1;
          if (b.status === 'completed' && a.status !== 'completed') return 1;
          if (a.isCurrent) return -1;
          if (b.isCurrent) return 1;
          const dateA = new Date(a.date + ' ' + a.time);
          const dateB = new Date(b.date + ' ' + b.time);
          return dateB - dateA;
        });

        setAppointmentHistory(sortedAppointments);
      }
    });
    return unsubscribe;
  };

  const updateAppointmentHistory = async (userId, appointmentData) => {
    try {
      const userRef = doc(crud, `users/${userId}`);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const currentHistory = docSnap.data().appointmentHistory || [];
        
        const existingAppointmentIndex = currentHistory.findIndex(
          appointment => 
            appointment.date === appointmentData.date && 
            appointment.time === appointmentData.time
        );

        let updatedHistory = [...currentHistory];
        const newAppointment = {
          ...appointmentData,
          completedAt: new Date().toISOString(),
          status: appointmentData.status
        };

        if (existingAppointmentIndex !== -1) {
          updatedHistory[existingAppointmentIndex] = {
            ...updatedHistory[existingAppointmentIndex],
            ...newAppointment
          };
        } else {
          updatedHistory.push(newAppointment);
        }
        
        updatedHistory.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateB - dateA;
        });
        
        await updateDoc(userRef, {
          appointmentHistory: updatedHistory,
        });
        
        setAppointmentHistory(updatedHistory);
      }
    } catch (error) {
      console.error("Error updating appointment history:", error);
    }
  };
  
  
  
  

  const handleFileChange = async (file) => {
    if (!file) {
      console.error("No file selected");
      return;
    }
  
    const previewUrl = URL.createObjectURL(file);
    setPreviewPic(previewUrl);
    setIsUploading(true);
  
    try {
      await uploadFile(file);
    } catch (error) {
      console.error("Error handling file:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFile = async (file) => {
    if (!user) {
      console.error("No user is authenticated");
      return;
    }
  
    const fileRef = ref(storage, `profile_pictures/${user.uid}/${file.name}`);
    try {
      await uploadBytes(fileRef, file);
      console.log("File uploaded successfully");
  
      const downloadURL = await getDownloadURL(fileRef);
      console.log("Download URL:", downloadURL);
      await updateProfilePicture(downloadURL);
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.code === 'storage/unauthorized') {
        alert("You don't have permission to upload files. Please contact support.");
      } else {
        alert("An error occurred while uploading the file. Please try again later.");
      }
      setPreviewPic('');
    }
  };

  const updateProfilePicture = async (url) => {
    if (!user) {
      console.error("No user is authenticated");
      return;
    }
  
    try {
      const userRef = doc(crud, `users/${user.uid}`);
      const docSnap = await getDoc(userRef);
  
      if (docSnap.exists()) {
        await updateDoc(userRef, {
          profilePicture: url
        });
  
        setProfilePic(url);
        setPreviewPic('');
        console.log("Profile picture updated successfully:", url);
      } else {

        await setDoc(userRef, {
          profilePicture: url,
          appointmentData: appointmentData || null, 
          isApproved: isApproved || false,
          ...personalDetails 
        });
  
        setProfilePic(url);
        setPreviewPic('');
        console.log("Document created and profile picture set successfully:", url);
      }
    } catch (error) {
      console.error("Error updating profile picture URL:", error);
    }
  };
  

  const fetchProfilePicture = async (userId) => {
    if (!userId) return;

    try {
      setIsLoadingProfile(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const userRef = doc(crud, 'users', userId);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profilePicture) {
          setProfilePic(data.profilePicture);
        } else {
          setProfilePic(defaultProfilePic);
        }
      } else {
        await setDoc(userRef, {
          profilePicture: defaultProfilePic,
          createdAt: new Date().toISOString()
        });
        setProfilePic(defaultProfilePic);
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      setProfilePic(defaultProfilePic);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchPersonalDetails = async (userId) => {
    if (!auth.currentUser) {
      console.error("User not authenticated");
      return;
    }

    try {
      setIsLoadingDetails(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userRef = doc(crud, `users/${userId}`);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        if (data.birthdate) {
          setBirthdate(data.birthdate);
        }

        setPersonalDetails(prev => ({
          ...prev,
          name: `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim(),
          firstName: data.firstName || '',
          middleName: data.middleName || '',
          lastName: data.lastName || '',
          location: data.location || '',
          phone: data.phone || '',
          email: auth.currentUser?.email || prev.email || '',
          gender: data.gender || '',
        }));
      } else {
        setPersonalDetails(prev => ({
          ...prev,
          email: auth.currentUser?.email || '',
          name: auth.currentUser?.displayName || ''
        }));
      }
    } catch (error) {
      console.error("Error fetching personal details:", error);
      if (error.code === 'permission-denied') {
        toast.error("Access denied. Please check if you're logged in.");
      }
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedDetails({
      ...personalDetails,
      firstName: personalDetails.firstName || '',
      middleName: personalDetails.middleName || '',
      lastName: personalDetails.lastName || '',
      age: personalDetails.age || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const userRef = doc(crud, `users/${user.uid}`);

      const dataToSave = {
        firstName: editedDetails.firstName,
        middleName: editedDetails.middleName,
        lastName: editedDetails.lastName,
        location: editedDetails.location,
        phone: editedDetails.phone,
        email: editedDetails.email,
        gender: editedDetails.gender,
        age: editedDetails.age,
      };

      await updateDoc(userRef, dataToSave);

      setPersonalDetails({
        ...dataToSave,
        name: `${dataToSave.firstName} ${dataToSave.middleName} ${dataToSave.lastName}`.trim(),
      });
      
      setIsEditing(false);

      const isProfileComplete = Object.values(dataToSave).every(value => value && value.trim() !== '');
      await updateDoc(userRef, { isProfileComplete });

      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

    } catch (error) {
      console.error("Error updating personal details: ", error);
      toast.error("Failed to update profile. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDetails({});
  };

  const capitalizeFirstLetter = (string) => {
    return string && typeof string === 'string' ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };

  const updateAge = () => {
    if (!birthdate) return;

    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    setPersonalDetails(prev => ({
      ...prev,
      age: `${age} years old`
    }));
  };

  const fetchInitialHistory = async (userId) => {
    try {
      const userRef = doc(crud, `users/${userId}`);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        let allAppointments = [];
        
        if (data.appointmentData) {
          allAppointments.push({
            ...data.appointmentData,
            isCurrent: true
          });
        }

        if (data.appointmentHistory) {
          allAppointments = [...allAppointments, ...data.appointmentHistory];
        }
        
        setAppointmentHistory(allAppointments);
      }
    } catch (error) {
      console.error("Error fetching initial history:", error);
    }
  };

  useEffect(() => {
    if (user) {
      const userRef = doc(crud, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data.profilePicture) {
            setProfilePic(data.profilePicture);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const markNotificationsAsViewed = () => {
    if (user) {
      localStorage.setItem(`lastChecked_${user.uid}`, new Date().toISOString());
      localStorage.setItem(`lastAppointmentCount_${user.uid}`, appointmentHistory.length.toString());
      setHasNewRemark(false);
      setNewAppointments(0);
    }
  };

  useEffect(() => {
    markNotificationsAsViewed();
  }, [user, appointmentHistory.length]);

  return (
    <div className="user-profile-page">
      <ToastContainer />
      <Navbar />
      <div className="container my-5">
        <div className="row">
          <div className="col-lg-4">
            <div className="card profile-card shadow">
              <div className="card-body text-center">
                <ProfilePicture
                  src={profilePic}
                  isLoading={isLoadingProfile}
                  isUploading={isUploading}
                  onFileChange={handleFileChange}
                />
                <h3 className="mt-3 mb-2">{personalDetails.name || 'User'}</h3>
                <p className="text-muted">{personalDetails.email}</p>
              </div>
            </div>
            
            <div className="card mt-4 remark-card shadow">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title m-0">Appointment Remark</h4>
                  {hasNewRemark && (
                    <span className="badge bg-danger">New!</span>
                  )}
                </div>
                {remark ? (
                  <>
                    <p onClick={() => setHasNewRemark(false)}>{remark}</p>
                    {remarkTimestamp && (
                      <small className="text-muted">
                        Added on: {new Date(remarkTimestamp).toLocaleString()}
                      </small>
                    )}
                  </>
                ) : (
                  <p>No remark available</p>
                )}
              </div>
            </div>
            
            <div className="card mt-4 history-card shadow">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title m-0">Appointment History</h4>
                  <div className="d-flex align-items-center">
                    <span className="badge appointment-count me-2" 
                      style={{ 
                        background: 'linear-gradient(145deg, rgb(197, 87, 219), rgb(177, 77, 199))',
                        color: 'white' 
                      }}
                    >
                      Total: {appointmentHistory.length}
                    </span>
                    <Link 
                      to={`/AppointmentHistory/${user?.uid}`}
                      className="btn btn-view-all position-relative"
                      state={{ 
                        appointments: [...(appointmentData ? [appointmentData] : []), ...appointmentHistory],
                        userInfo: {
                          name: personalDetails.name,
                          email: personalDetails.email,
                          profilePic: profilePic,
                          userId: user?.uid
                        }
                      }}
                      onClick={() => {
                        setNewAppointments(0);
                        localStorage.setItem(`lastAppointmentCount_${user.uid}`, appointmentHistory.length.toString());
                      }}
                    >
                      <FaThLarge className="me-2" />
                      <span>View All</span>
                      {newAppointments > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          {newAppointments}
                          <span className="visually-hidden">new appointments</span>
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
                
                {appointmentHistory.length > 0 ? (
                  <div className="appointment-history-list">
                    {appointmentHistory.slice(0, 1).map((appointment, index) => (
                      <div 
                        key={index} 
                        className={`appointment-history-item mb-3 p-3 border rounded ${appointment.isCurrent ? 'current-appointment' : ''}`}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <span className="fw-bold">{appointment.appointmentType}</span>
                            {appointment.isCurrent && (
                              <span className="badge bg-info ms-2">Current</span>
                            )}
                          </div>
                          <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                            {capitalizeFirstLetter(appointment.status || 'pending')}
                          </span>
                        </div>
                        <div className="text-muted small">
                          <div><strong>Date:</strong> {appointment.date}</div>
                          <div><strong>Time:</strong> {appointment.time}</div>
                          {appointment.message && (
                            <div><strong>Message:</strong> {appointment.message}</div>
                          )}
                          {appointment.remark && (
                            <div className="mt-2">
                              <strong>Remark:</strong> {appointment.remark}
                            </div>
                          )}
                          <div className="mt-1 text-end">
                            <small className="text-muted">
                              {appointment.isCurrent ? 'Current Appointment' : 
                                `Updated: ${new Date(appointment.completedAt).toLocaleDateString()} at 
                                ${new Date(appointment.completedAt).toLocaleTimeString()}`
                              }
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted">
                    <p>No appointment history available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card details-card shadow">
              <div className="card-body">
                {isLoadingDetails ? (
                  <div className="text-center p-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading details...</span>
                    </div>
                    <p className="mt-2">Loading personal details...</p>
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="card-title m-0">Personal Details</h4>
                      {!isEditing && (
                        <button 
                          className="btn btn-outline-primary btn-sm" 
                          onClick={handleEdit} 
                          style={{ 
                            color: 'rgb(197, 87, 219)', 
                            borderImage: 'linear-gradient(145deg, rgb(197, 87, 219), rgb(177, 77, 199))',
                            borderImageSlice: 1,
                            borderWidth: '1px',
                            borderStyle: 'solid'
                          }}
                        >
                          <FaEdit /> Edit
                        </button>
                      )}
                    </div>
                    <div className="row">
                      {isEditing ? (
                        <>
                          <div className="col-md-4 mb-3">
                            <div className="detail-item">
                              <FaUser className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">First Name</h6>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="firstName"
                                  value={editedDetails.firstName || ''}
                                  onChange={handleChange}
                                  placeholder="Enter first name"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <div className="detail-item">
                              <FaUser className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Middle Name</h6>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="middleName"
                                  value={editedDetails.middleName || ''}
                                  onChange={handleChange}
                                  placeholder="Enter middle name"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <div className="detail-item">
                              <FaUser className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Last Name</h6>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="lastName"
                                  value={editedDetails.lastName || ''}
                                  onChange={handleChange}
                                  placeholder="Enter last name"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="col-md-6 mb-3">
                          <div className="detail-item d-flex align-items-center">
                            <FaUser className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                            <div className="ms-3">
                              <h6 className="mb-0 text-muted">Name</h6>
                              <p className="mb-0 fw-bold">{personalDetails.name || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {Object.entries(isEditing ? editedDetails : personalDetails)
                        .filter(([key]) => !['name', 'firstName', 'middleName', 'lastName', 'age'].includes(key))
                        .map(([key, value]) => (
                          <div className="col-md-6 mb-3" key={key}>
                            <div className="detail-item d-flex align-items-center">
                              {getIcon(key)}
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">{capitalizeFirstLetter(key)}</h6>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    className="form-control"
                                    name={key}
                                    value={value}
                                    onChange={handleChange}
                                  />
                                ) : (
                                  <p className="mb-0 fw-bold">{value || 'Not provided'}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      <div className="col-md-6 mb-3">
                        <div className="detail-item d-flex align-items-center">
                          <FaCalendarAlt className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                          <div className="ms-3">
                            <h6 className="mb-0 text-muted">Age</h6>
                            {isEditing ? (
                              <input
                                type="text"
                                className="form-control"
                                name="age"
                                value={editedDetails.age || ''}
                                onChange={handleChange}
                                placeholder="Enter age"
                              />
                            ) : (
                              <p className="mb-0 fw-bold">{personalDetails.age || 'Not provided'}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="mt-3">
                        <button className="btn btn-primary me-2" onClick={handleSave}>Save</button>
                        <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="card mt-4 appointment-card shadow">
              <div className="card-body">
                <h4 className="card-title mb-4">Appointment Status</h4>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Pricing Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointmentData ? (
                        <tr>
                          <td>{appointmentData.name}</td>
                          <td>{appointmentData.appointmentType}</td>
                          <td>{appointmentData.date}</td>
                          <td>{appointmentData.time}</td>
                          <td>{formatPricingType(appointmentData.selectedPricingType)}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(appointmentData.status)}`}>
                              {capitalizeFirstLetter(appointmentData.status || 'pending')}
                            </span>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">No appointment data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {appointmentData?.selectedServices && appointmentData.selectedServices.length > 0 && (
                  <div className="mt-4">
                    <h5>Selected Services</h5>
                    <div className="selected-services-list">
                      {appointmentData.selectedServices.map((service, index) => (
                        <div key={index} className="service-item p-3 border rounded mb-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">{service.name}</h6>
                            <span className="badge bg-primary">
                              ₱{service[appointmentData.selectedPricingType]?.toLocaleString()}
                            </span>
                          </div>
                          {service.isPackage && service.components && (
                            <div className="mt-2">
                              <small className="text-muted">Package Components:</small>
                              <ul className="list-unstyled ms-3">
                                {service.components.map((component, idx) => (
                                  <li key={idx} className="d-flex justify-content-between">
                                    <span>{component.name}</span>
                                    <span>₱{component[appointmentData.selectedPricingType]?.toLocaleString()}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="total-amount p-2 bg-light rounded">
                        <strong>Total Amount: </strong>
                        <span>₱{calculateTotal(appointmentData.selectedServices, appointmentData.selectedPricingType)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {message && (
                  <div className="mt-3">
                    <h5>Additional Message:</h5>
                    <p>{message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getIcon(key) {
  const iconStyle = { 
    color: 'rgb(197, 87, 219)',
    background: 'linear-gradient(145deg, rgb(197, 87, 219), rgb(177, 77, 199))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };
  switch (key) {
    case 'name': return <FaUser className="detail-icon" style={iconStyle} />;
    case 'email': return <FaEnvelope className="detail-icon" style={iconStyle} />;
    case 'age': return <FaCalendarAlt className="detail-icon" style={iconStyle} />;
    case 'gender': return <FaVenusMars className="detail-icon" style={iconStyle} />;
    case 'phone': return <FaPhone className="detail-icon" style={iconStyle} />;
    case 'location': return <FaMapMarkerAlt className="detail-icon" style={iconStyle} />;
    default: return null;
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'completed': return 'bg-blue';
    case 'rejected': return 'bg-danger';
    case 'remarked': return 'bg-info';
    default: return 'bg-warning';
  }
}

function formatPricingType(type) {
  switch (type) {
    case 'withoutPH':
      return 'Without PhilHealth';
    case 'PHBenefit':
      return 'PhilHealth Benefit';
    case 'withPH':
      return 'With PhilHealth';
    default:
      return type;
  }
}

function calculateTotal(services, pricingType) {
  if (!services || !pricingType) return 0;
  return services.reduce((total, service) => total + (service[pricingType] || 0), 0).toLocaleString();
}

export default UserProfile;