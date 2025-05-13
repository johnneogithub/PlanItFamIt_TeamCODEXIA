import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../Components/Global/Navbar_Main';
import { auth, storage, crud } from '../Config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { FaUser, FaEnvelope, FaCalendarAlt, FaVenusMars, FaPhone, FaMapMarkerAlt, FaEdit, FaCamera, FaUserCircle, FaFileDownload, FaHistory, FaCheckCircle, FaTimesCircle, FaCommentDots, FaClock, FaThLarge, FaList, FaFolder, FaComment, FaEye, FaImage, FaFile, FaSync, FaTimes } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './JRGUserProfileStyle.css';
import defaultProfilePic from '../Components/Assets/icon_you.png';
import { motion, AnimatePresence } from 'framer-motion';

import { ProfilePicture, PersonalDetails } from "../Components/UserProfile/UserProfileComponents"
import AppointmentStatus from '../Components/UserProfile/AppointmentStatus';

const getStatusIcon = (status) => {
  switch(status) {
    case 'completed': return <FaCheckCircle color="#0066ff" />;
    case 'rejected': return <FaTimesCircle color="#dc3545" />;
    case 'approved': return <FaCheckCircle color="#28a745" />;
    default: return <FaClock color="#ffc107" />;
  }
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
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState('');

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
      const downloadURL = await getDownloadURL(fileRef);
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

  const handleViewRemark = (remark) => {
    if (remark) {
      setSelectedRemark(remark);
      setShowRemarkModal(true);
    }
  };

  return (
    <div className="jrg-user-profile-page">
      <Navbar />
      <div className="container-fluid my-5">
        <div className="row">
          <div className="col-lg-4">
            <div className="sticky-sidebar">
              {/* Remove this duplicate profile card */}
              
              <PersonalDetails
                personalDetails={personalDetails}
                isEditing={isEditing}
                editedDetails={editedDetails}
                handleEdit={handleEdit}
                handleChange={handleChange}
                handleSave={handleSave}
                handleCancel={handleCancel}
                profilePic={profilePic}
                isLoadingProfile={isLoadingProfile}
                isUploading={isUploading}
                onFileChange={handleFileChange}
                email={user?.email}
              />
            </div>
          </div>
          <div className="col-lg-8">
            <div className="row">
              <div className="col-lg-12">
                <AppointmentStatus 
                  appointmentData={appointmentData}
                  remark={remark}
                  remarkTimestamp={remarkTimestamp}
                  showRemark={showRemark}
                  onRemarkClick={handleRemarkClick}
                  user={user}
                  personalDetails={personalDetails}
                  profilePic={profilePic}
                  appointmentHistory={appointmentHistory}
                  onViewRemark={handleViewRemark}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Remark Modal */}
      {showRemarkModal && (
        <div className="jrg-modal-overlay" onClick={() => setShowRemarkModal(false)}>
          <div className="jrg-modal" onClick={e => e.stopPropagation()}>
            <div className="jrg-modal-header">
              <h3>Appointment Remark</h3>
              <button 
                className="jrg-modal-close"
                onClick={() => setShowRemarkModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="jrg-modal-body">
              <p>{selectedRemark}</p>
            </div>
            <div className="jrg-modal-footer">
              <button 
                className="jrg-btn-primary"
                onClick={() => setShowRemarkModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;