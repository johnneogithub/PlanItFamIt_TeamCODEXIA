import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../Components/Global/Navbar_Main';
import { auth, storage, crud } from '../Config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { FaUser, FaEnvelope, FaCalendarAlt, FaVenusMars, FaPhone, FaMapMarkerAlt, FaEdit, FaCamera, FaUserCircle, FaFileDownload, FaHistory, FaCheckCircle, FaTimesCircle, FaCommentDots, FaClock, FaThLarge, FaList, FaFolder, FaComment, FaEye, FaImage, FaFile, FaSync } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './UserProfileStyle.css';
import defaultProfilePic from '.././Components/Assets/icon_you.png';
import { motion, AnimatePresence } from 'framer-motion';

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

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  return [storedValue, setValue];
};

const getLastViewedRemark = (userId) => {
  return localStorage.getItem(`lastViewedRemark_${userId}`);
};

const getLastViewedStatus = (userId) => {
  return localStorage.getItem(`lastViewedStatus_${userId}`);
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
  const [hasNewStatus, setHasNewStatus] = useState(false);
  const [hasNewRemark, setHasNewRemark] = useState(false);
  const [localPersonalDetails, setLocalPersonalDetails] = useLocalStorage('userPersonalDetails', null);
  const [lastFetchTime, setLastFetchTime] = useLocalStorage('lastPersonalDetailsFetch', 0);
  const FETCH_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds
  const [lastViewedRemark, setLastViewedRemark] = useState('');
  const [lastViewedStatus, setLastViewedStatus] = useState('');





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
        try {
          // Handle appointments array
          const appointments = Array.isArray(data.appointments) ? data.appointments : [];
          const latestAppointment = appointments[appointments.length - 1];
          
          if (latestAppointment) {
            setAppointmentData({
              ...latestAppointment,
              name: String(latestAppointment.name || 'N/A'),
              date: String(latestAppointment.date || 'N/A'),
              time: String(latestAppointment.time || 'N/A'),
              status: String(latestAppointment.status || 'pending'),
              selectedPricingType: String(latestAppointment.selectedPricingType || ''),
              selectedServices: Array.isArray(latestAppointment.selectedServices) ? 
                latestAppointment.selectedServices : []
            });
            
            setIsApproved(latestAppointment.status === 'approved');
            setRemark(String(latestAppointment.remark || ''));
            setRemarkTimestamp(latestAppointment.remarkTimestamp || null);
            setMessage(String(latestAppointment.message || ''));
          }

          // Process all appointments
          let allAppointments = [];
          if (appointments.length > 0) {
            allAppointments = appointments.map(appointment => ({
              id: String(appointment.id || ''),
              name: String(appointment.name || 'N/A'),
              date: String(appointment.date || 'N/A'),
              time: String(appointment.time || 'N/A'),
              status: String(appointment.status || 'pending'),
              message: String(appointment.message || ''),
              remark: String(appointment.remark || ''),
              selectedPricingType: String(appointment.selectedPricingType || ''),
              selectedServices: Array.isArray(appointment.selectedServices) ? 
                appointment.selectedServices : [],
              totalAmount: Number(appointment.totalAmount || 0),
              completedAt: appointment.completedAt || null,
              isCurrent: appointment === latestAppointment
            }));
          }

          // Add appointment history with proper string conversion
          if (Array.isArray(data.appointmentHistory)) {
            const historyAppointments = data.appointmentHistory.map(hist => ({
              id: String(hist.id || ''),
              name: String(hist.name || 'N/A'),
              date: String(hist.date || 'N/A'),
              time: String(hist.time || 'N/A'),
              status: String(hist.status || 'completed'),
              message: String(hist.message || ''),
              remark: String(hist.remark || ''),
              selectedPricingType: String(hist.selectedPricingType || ''),
              selectedServices: Array.isArray(hist.selectedServices) ? 
                hist.selectedServices : [],
              totalAmount: Number(hist.totalAmount || 0),
              completedAt: hist.completedAt || null,
              isCurrent: false
            }));
            allAppointments = [...allAppointments, ...historyAppointments];
          }

          // Sort appointments
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
        } catch (error) {
          console.error("Error processing appointments:", error);
        }
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
  
    try {
      const previewUrl = URL.createObjectURL(file);
      setPreviewPic(previewUrl);
      setIsUploading(true);
      await uploadFile(file);
    } catch (error) {
      console.error("Error handling file:", error);
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
      const currentData = docSnap.exists() ? docSnap.data() : {};

      await updateDoc(userRef, {
        ...currentData,
        profilePicture: url
      });

      setProfilePic(url);
      setPreviewPic('');
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

    const now = Date.now();
    const shouldFetchFromFirebase = !localPersonalDetails || 
                                  (now - lastFetchTime) > FETCH_COOLDOWN;

    if (shouldFetchFromFirebase) {
      try {
        setIsLoadingDetails(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const userRef = doc(crud, `users/${userId}`);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          if (data.birthdate) {
            setBirthdate(data.birthdate);
            const age = calculateAge(data.birthdate);
            const newDetails = {
              age: age ? `${age} years old` : 'Not provided',
              name: `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim(),
              location: data.location || '',
              phone: data.phone || '',
              email: auth.currentUser?.email || '',
              gender: data.gender || '',
            };
            
            setPersonalDetails(newDetails);
            setLocalPersonalDetails(newDetails);
            setLastFetchTime(now);
          } else {
            const basicDetails = {
              email: auth.currentUser?.email || '',
              name: auth.currentUser?.displayName || ''
            };
            setPersonalDetails(basicDetails);
            setLocalPersonalDetails(basicDetails);
            setLastFetchTime(now);
          }
        }
      } catch (error) {
        console.error("Error fetching personal details:", error);
        if (error.code === 'permission-denied') {
          alert("Access denied. Please check if you're logged in.");
        }
      } finally {
        setIsLoadingDetails(false);
      }
    } else {
      // Use cached data
      setPersonalDetails(localPersonalDetails);
      setIsLoadingDetails(false);
    }
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedDetails({
      ...personalDetails,
      phone: personalDetails.phone || '',
      location: personalDetails.location || '',
      gender: personalDetails.gender || ''
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
      const docSnap = await getDoc(userRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};

      const dataToSave = {
        ...currentData,
        phone: editedDetails.phone,
        location: editedDetails.location,
        gender: editedDetails.gender,
        lastUpdated: new Date().toISOString(),
        lastProfileUpdate: new Date().toISOString()
      };

      await updateDoc(userRef, dataToSave);

      const updatedDetails = {
        ...localPersonalDetails,
        phone: editedDetails.phone,
        location: editedDetails.location,
        gender: editedDetails.gender
      };

      setPersonalDetails(updatedDetails);
      setLocalPersonalDetails(updatedDetails);
      setLastFetchTime(Date.now());
      
      localStorage.removeItem(`lastViewedProfile_${user.uid}`);
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating personal details: ", error);
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

  const handleRemarkClick = () => {
    if (user && remark) {
      localStorage.setItem(`lastViewedRemark_${user.uid}`, remark);
      setHasNewRemark(false);
      setLastViewedRemark(remark);
    }
  };

  const handleStatusClick = () => {
    if (user && appointmentData?.status) {
      localStorage.setItem(`lastViewedStatus_${user.uid}`, appointmentData.status);
      setHasNewStatus(false);
      setLastViewedStatus(appointmentData.status);
    }
  };

  return (
    <div className="user-profile-page">
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
                </div>
                {remark ? (
                  <div>
                    <p>{remark}</p>
                    {remarkTimestamp && (
                      <small className="text-muted">
                        Added on: {new Date(remarkTimestamp).toLocaleString()}
                      </small>
                    )}
                  </div>
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
                    <Link 
                      to={`/AppointmentHistory/${user?.uid}`}
                      className="btn-user btn-view-all"
                      state={{ 
                        appointments: appointmentHistory.map(appointment => ({
                          id: appointment.id || '',
                          name: appointment.name || '',
                          date: appointment.date || '',
                          time: appointment.time || '',
                          status: appointment.status || 'pending',
                          message: appointment.message || '',
                          remark: appointment.remark || '',
                          selectedPricingType: appointment.selectedPricingType || '',
                          selectedServices: Array.isArray(appointment.selectedServices) ? appointment.selectedServices : [],
                          totalAmount: typeof appointment.totalAmount === 'number' ? appointment.totalAmount : 0,
                          completedAt: appointment.completedAt || null,
                          isCurrent: !!appointment.isCurrent
                        })),
                        userInfo: {
                          name: personalDetails.name || '',
                          email: personalDetails.email || '',
                          profilePic: profilePic || defaultProfilePic,
                          userId: user?.uid || ''
                        }
                      }}
                    >
                      <FaThLarge className="me-2" />
                      <span>View All</span>
                    </Link>
                  </div>
                </div>
                
                {appointmentHistory.length > 0 ? (
                  <div className="appointment-history-list">
                    {appointmentHistory.filter(appointment => appointment.status !== 'pending').slice(0, 1).map((appointment, index) => {
                      const appointmentDate = appointment.completedAt ? new Date(appointment.completedAt) : new Date();
                      const formattedDate = appointmentDate.toLocaleDateString();
                      const formattedTime = appointmentDate.toLocaleTimeString();

                      return (
                        <div 
                          key={index} 
                          className={`appointment-history-item mb-3 p-3 border rounded ${appointment.isCurrent ? 'current-appointment' : ''}`}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <span className="fw-bold">{appointment.appointmentType || 'General Appointment'}</span>
                              {appointment.isCurrent && (
                                <span className="badge bg-info ms-2">Current</span>
                              )}
                            </div>
                            <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                              {capitalizeFirstLetter(appointment.status || 'pending')}
                            </span>
                          </div>
                          <div className="text-muted small">
                            <div><strong>Date:</strong> {appointment.date || 'N/A'}</div>
                            <div><strong>Time:</strong> {appointment.time || 'N/A'}</div>
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
                                  `Updated: ${formattedDate} at ${formattedTime}`
                                }
                              </small>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                      <div>
                        {!isEditing && (
                          <>
                            <button 
                              className="btn-user btn-outline-primary btn-sm" 
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
                          </>
                        )}
                      </div>
                    </div>
                    <div className="row">
                      {isEditing ? (
                        <>
                          <div className="col-md-6 mb-3">
                            <div className="detail-item-profile">
                              <FaUser className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Name</h6>
                                <p className="mb-0 fw-bold">{personalDetails.name || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="detail-item-profile">
                              <FaEnvelope className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Email</h6>
                                <p className="mb-0 fw-bold">{personalDetails.email || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="detail-item-profile">
                              <FaMapMarkerAlt className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Location</h6>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="location"
                                  value={editedDetails.location || ''}
                                  onChange={handleChange}
                                  placeholder="Enter location"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="detail-item-profile">
                              <FaPhone className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Phone</h6>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="phone"
                                  value={editedDetails.phone || ''}
                                  onChange={handleChange}
                                  placeholder="Enter phone number"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="detail-item-profile">
                              <FaCalendarAlt className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Age</h6>
                                <p className="mb-0 fw-bold">{personalDetails.age || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="detail-item-profile">
                              <FaVenusMars className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Gender</h6>
                                <select
                                  className="form-control"
                                  name="gender"
                                  value={editedDetails.gender || ''}
                                  onChange={handleChange}
                                >
                                  <option value="">Select gender</option>
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="col-md-6 mb-3">
                            <div className="detail-item-profile d-flex align-items-center">
                              <FaUser className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Name</h6>
                                <p className="mb-0 fw-bold">{personalDetails.name || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="detail-item-profile d-flex align-items-center">
                              <FaEnvelope className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Email</h6>
                                <p className="mb-0 fw-bold">{personalDetails.email || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="detail-item-profile d-flex align-items-center">
                              <FaMapMarkerAlt className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Location</h6>
                                <p className="mb-0 fw-bold">{personalDetails.location || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="detail-item-profile d-flex align-items-center">
                              <FaPhone className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Phone</h6>
                                <p className="mb-0 fw-bold">{personalDetails.phone || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="detail-item-profile d-flex align-items-center">
                              <FaCalendarAlt className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Age</h6>
                                <p className="mb-0 fw-bold">{personalDetails.age || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="detail-item-profile d-flex align-items-center">
                              <FaVenusMars className="detail-icon" style={{ color: 'rgb(197, 87, 219)' }} />
                              <div className="ms-3">
                                <h6 className="mb-0 text-muted">Gender</h6>
                                <p className="mb-0 fw-bold">{personalDetails.gender || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {isEditing && (
                      <div className="mt-3 d-flex">
                        <button className="btn-user btn-primary me-2" onClick={handleSave}>Save</button>
                        <button className="btn-user btn-secondary" onClick={handleCancel}>Cancel</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="card mt-4 appointment-card shadow">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title">Appointment Status</h4>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Pricing Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointmentData ? (
                        <tr>
                          <td>{appointmentData.name || 'N/A'}</td>
                          <td>{appointmentData.date || 'N/A'}</td>
                          <td>{appointmentData.time || 'N/A'}</td>
                          <td>{formatPricingType(appointmentData.selectedPricingType) || 'N/A'}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(appointmentData.status)}`}>
                              {capitalizeFirstLetter(appointmentData.status || 'pending')}
                            </span>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">No appointment data available</td>
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
                        <div key={index} className="service-item-user p-3 border rounded mb-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">{service.name || 'Unnamed Service'}</h6>
                            <span className="badge bg-primary">
                              ₱{(service[appointmentData.selectedPricingType] || 0).toLocaleString()}
                            </span>
                          </div>
                          {service.isPackage && service.components && (
                            <div className="mt-2">
                              <small className="text-muted">Package Components:</small>
                              <ul className="list-unstyled ms-3">
                                {service.components.map((component, idx) => (
                                  <li key={idx} className="d-flex justify-content-between">
                                    <span>{component.name || 'Unnamed Component'}</span>
                                    <span>₱{(component[appointmentData.selectedPricingType] || 0).toLocaleString()}</span>
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