import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc, setDoc, getDoc, onSnapshot, getDoc as fetchDoc, arrayUnion } from 'firebase/firestore';
import Sidebar from '../Global/Sidebar';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ReactPaginate from 'react-paginate';
import { getAuth } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Circle from '../Assets/circle.png'

import './DashboardAdmin.css';
import 'bootstrap/dist/js/bootstrap.js';
import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap-icons/font/bootstrap-icons.css";

import UserProfilePopup from './AdminLogin/UserProfilePopup';


const tableStyles = {
  card: {
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
    }
  },
  cardHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    borderTopLeftRadius: '15px',
    borderTopRightRadius: '15px',
    backdropFilter: 'blur(10px)'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: 0,
    color: '#344767',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  },
  table: {
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
    width: '100%'
  },
  tableHeader: {
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    color: '#344767',
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.5px',
    padding: '1rem',
    backdropFilter: 'blur(10px)'
  },
  tableRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 1)'
    }
  },
  actionButton: {
    borderRadius: '20px',
    padding: '0.375rem 1rem',
    fontSize: '0.875rem',
    textTransform: 'none',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }
  }
};

function DashboardAdmin() {


  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [approvedAppointments, setApprovedAppointments] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentApprovedPage, setCurrentApprovedPage] = useState(0);
  const [currentPendingPage, setCurrentPendingPage] = useState(0);
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingAppointmentsCount, setPendingAppointmentsCount] = useState(0);
  const [approvedAppointmentsCount, setApprovedAppointmentsCount] = useState(0);
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0);
  const itemsPerPage = 5; 


  const [selectedUser, setSelectedUser] = useState(null);


  const [selectedServicesForView, setSelectedServicesForView] = useState(null);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState(null);
  const [approvalRemark, setApprovalRemark] = useState('');
  const [includeRemark, setIncludeRemark] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [pendingRejectId, setPendingRejectId] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');

  const isAdmin = true;

  useEffect(() => {
    const fetchData = async () => {
      const firestore = getFirestore();
      
      try {
        const pendingSnapshot = await getDocs(collection(firestore, 'pendingAppointments'));
        const pendingData = pendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingAppointments(pendingData);
        setPendingAppointmentsCount(pendingSnapshot.size);

        const approvedSnapshot = await getDocs(collection(firestore, 'approvedAppointments'));
        const approvedData = approvedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApprovedAppointments(approvedData);
        setApprovedAppointmentsCount(approvedSnapshot.size);

        const totalCount = pendingSnapshot.size + approvedSnapshot.size;
        setTotalAppointmentsCount(totalCount);
      } catch (error) {
        console.error("Error fetching appointments: ", error);
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }

      try {
        const usersSnapshot = await getDocs(collection(firestore, 'users'));
        const existingUsersCount = usersSnapshot.size;
        
        const userCountRef = doc(firestore, 'statistics', 'userCount');
        const unsubscribe = onSnapshot(userCountRef, (doc) => {
          if (doc.exists()) {
            const totalCount = (doc.data().count || 0) + existingUsersCount;
            setRegisteredUsersCount(totalCount);
          } else {
            setRegisteredUsersCount(existingUsersCount);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching user count:", error);
      }

      const appointmentsRef = collection(firestore, 'pendingAppointments');
      const snapshot = await getDocs(appointmentsRef);
      setAppointmentCount(snapshot.size);
    };

    fetchData();
  }, []);

  const fetchDocument = async (firestore, collectionName, id) => {
    const docRef = doc(firestore, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap;
  };
  
  const handleApprove = (id) => {
    setPendingApprovalId(id);
    setShowApproveModal(true);
  };

  const handleFinalApprove = async () => {
    try {
      const firestore = getFirestore();
      const pendingDocRef = doc(firestore, 'pendingAppointments', pendingApprovalId);
      const pendingDocSnap = await getDoc(pendingDocRef);
      
      if (pendingDocSnap.exists()) {
        const appointmentData = pendingDocSnap.data();
        
        const updatedAppointmentData = {
          ...appointmentData,
          id: pendingApprovalId,
          status: 'approved',
          isApproved: true,
          approvedAt: new Date().toISOString(),
          ...(includeRemark && approvalRemark ? { 
            remark: approvalRemark,
            remarkTimestamp: new Date().toISOString()
          } : {})
        };
        
        if (appointmentData.userId) {
          const userRef = doc(firestore, 'users', appointmentData.userId);
          
          const userDoc = await getDoc(userRef);
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          const updatedAppointments = userData.appointments || [];
          const appointmentIndex = updatedAppointments.findIndex(app => app.id === pendingApprovalId);
          
          if (appointmentIndex !== -1) {
            updatedAppointments[appointmentIndex] = updatedAppointmentData;
          } else {
            updatedAppointments.push(updatedAppointmentData);
          }

          const notification = {
            type: 'approval',
            message: `Your appointment for ${appointmentData.date} at ${appointmentData.time} has been approved`,
            timestamp: new Date().toISOString(),
            read: false,
            notificationType: 'appointment_approval',
            appointmentId: pendingApprovalId,
            appointmentDetails: {
              date: appointmentData.date,
              time: appointmentData.time,
              services: appointmentData.selectedServices,
              status: 'approved'
            }
          };

          await updateDoc(userRef, {
            appointmentData: updatedAppointmentData,
            appointments: updatedAppointments,
            lastUpdated: new Date().toISOString(),
            currentAppointmentId: pendingApprovalId,
            notifications: arrayUnion(notification)
          });

          const userAppointmentRef = doc(firestore, `users/${appointmentData.userId}/appointments`, pendingApprovalId);
          await setDoc(userAppointmentRef, updatedAppointmentData);
        }
        
        await setDoc(doc(firestore, 'approvedAppointments', pendingApprovalId), updatedAppointmentData);
        
        await deleteDoc(pendingDocRef);
        
        setPendingAppointments(prev => prev.filter(app => app.id !== pendingApprovalId));
        setApprovedAppointments(prev => [...prev, updatedAppointmentData]);

        setPendingAppointmentsCount(prev => prev - 1);
        setApprovedAppointmentsCount(prev => prev + 1);

        setShowApproveModal(false);
        setPendingApprovalId(null);
        setApprovalRemark('');
        setIncludeRemark(false);

        toast.success("Appointment approved successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error approving appointment: ", error);
      toast.error("An error occurred while approving the appointment. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  

  const handleReject = (id) => {
    setPendingRejectId(id);
    setShowRejectModal(true);
  };

  const handleFinalReject = async () => {
    try {
      if (!rejectRemark.trim()) {
        alert("Please provide a remark for the rejection.");
        return;
      }

      const firestore = getFirestore();
      const pendingDocRef = doc(firestore, 'pendingAppointments', pendingRejectId);
      const pendingDocSnap = await getDoc(pendingDocRef);

      if (pendingDocSnap.exists()) {
        const appointmentData = pendingDocSnap.data();
        
        const updatedAppointmentData = {
          ...appointmentData,
          id: pendingRejectId,
          status: 'rejected',
          isApproved: false,
          remark: rejectRemark,
          rejectedAt: new Date().toISOString(),
          remarkTimestamp: new Date().toISOString()
        };

        if (appointmentData.userId) {
          const userRef = doc(firestore, 'users', appointmentData.userId);
          
          const userDoc = await getDoc(userRef);
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          const notification = {
            type: 'rejection',
            message: `Your appointment for ${appointmentData.date} at ${appointmentData.time} has been rejected. Reason: ${rejectRemark}`,
            timestamp: new Date().toISOString(),
            read: false,
            notificationType: 'appointment_rejection',
            appointmentId: pendingRejectId,
            appointmentDetails: {
              date: appointmentData.date,
              time: appointmentData.time,
              services: appointmentData.selectedServices,
              status: 'rejected',
              rejectionReason: rejectRemark
            }
          };

          await updateDoc(userRef, {
            appointmentData: updatedAppointmentData,
            appointments: [...(userData.appointments || []), updatedAppointmentData],
            appointmentHistory: [...(userData.appointmentHistory || []), updatedAppointmentData],
            lastUpdated: new Date().toISOString(),
            notifications: arrayUnion(notification)
          });
        }

        await deleteDoc(pendingDocRef);

        setPendingAppointments(prev => prev.filter(app => app.id !== pendingRejectId));
        setPendingAppointmentsCount(prev => prev - 1);
        setTotalAppointmentsCount(prev => prev - 1);

        setShowRejectModal(false);
        setPendingRejectId(null);
        setRejectRemark('');

        toast.success("Appointment rejected successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error rejecting appointment: ", error);
      toast.error("An error occurred while rejecting the appointment. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  


const handleDone = async (appointment) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("User not authenticated");
      toast.error("You must be logged in to perform this action.");
      return;
    }

    const firestore = getFirestore();
    const appointmentRef = doc(firestore, 'approvedAppointments', appointment.id);
    const appointmentDoc = await getDoc(appointmentRef);

    if (!appointmentDoc.exists()) {
      toast.error("This appointment no longer exists in the database.");
      return;
    }
    const currentAppointmentData = appointmentDoc.data();

    // Get all imported files
    const importedFiles = [];
    if (currentAppointmentData.importedFile) {
      importedFiles.push({
        name: currentAppointmentData.importedFile.name,
        url: currentAppointmentData.importedFile.url,
        type: currentAppointmentData.importedFile.type,
        uploadedAt: currentAppointmentData.importedFile.uploadedAt || new Date().toISOString(),
        uploadedBy: currentAppointmentData.importedFile.uploadedBy || {
          uid: user.uid,
          email: user.email
        }
      });
    }

    if (currentAppointmentData.importedFiles && Array.isArray(currentAppointmentData.importedFiles)) {
      importedFiles.push(...currentAppointmentData.importedFiles);
    }

    const completedAppointment = {
      ...currentAppointmentData,
      id: appointment.id,
      name: appointment.name || currentAppointmentData.name,
      email: appointment.email || currentAppointmentData.email,
      age: appointment.age || currentAppointmentData.age,
      date: appointment.date || currentAppointmentData.date,
      time: appointment.time || currentAppointmentData.time,
      selectedPricingType: appointment.selectedPricingType || currentAppointmentData.selectedPricingType,
      selectedServices: appointment.selectedServices || currentAppointmentData.selectedServices || [],
      message: appointment.message || currentAppointmentData.message,
      importedFiles: importedFiles,
      userId: appointment.userId,
      completedAt: new Date().toISOString(),
      status: 'completed',
      isApproved: true,
      totalAmount: appointment.totalAmount || currentAppointmentData.totalAmount,
      remark: currentAppointmentData.remark || null
    };

    if (appointment.userId) {
      const userRef = doc(firestore, 'users', appointment.userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      const notifications = [];

      // Add completion notification
      notifications.push({
        type: 'completion',
        message: `Your appointment for ${appointment.date} at ${appointment.time} has been completed`,
        timestamp: new Date().toISOString(),
        read: false,
        notificationType: 'appointment_completion',
        appointmentId: appointment.id,
        appointmentDetails: {
          date: appointment.date,
          time: appointment.time,
          services: appointment.selectedServices,
          status: 'completed',
          completedAt: new Date().toISOString()
        }
      });

      // Add medical records notification if files were imported
      if (importedFiles.length > 0) {
        notifications.push({
          type: 'medical_records',
          message: `New medical records have been added from your appointment on ${appointment.date}`,
          timestamp: new Date().toISOString(),
          read: false,
          notificationType: 'medical_records_update',
          appointmentId: appointment.id,
          recordDetails: {
            date: appointment.date,
            time: appointment.time,
            files: importedFiles.map(file => ({
              name: file.name,
              type: file.type,
              uploadedAt: file.uploadedAt
            }))
          }
        });
      }

      // Update user document with both notifications
      await updateDoc(userRef, {
        appointmentData: completedAppointment,
        appointments: [...(userData.appointments || []), completedAppointment],
        appointmentHistory: [...(userData.appointmentHistory || []), completedAppointment],
        lastUpdated: new Date().toISOString(),
        notifications: arrayUnion(...notifications)
      });
    }

    // Rest of your existing code...
    await setDoc(doc(firestore, 'patientsRecords', appointment.id), completedAppointment);
    await deleteDoc(appointmentRef);
    setApprovedAppointments(prevAppointments => 
      prevAppointments.filter(app => app.id !== appointment.id)
    );
    setApprovedAppointmentsCount(prev => prev - 1);
    setTotalAppointmentsCount(prev => prev - 1);

    toast.success('Appointment marked as completed successfully!');
  } catch (error) {
    console.error("Error handling done action: ", error);
    toast.error("An error occurred while completing the appointment. Please try again.");
  }
};

const handleImport = (appointment) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          throw new Error('User not authenticated');
        }

        const storage = getStorage();
        const storageRef = ref(storage, `appointments/${user.uid}/${appointment.id}/${file.name}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const fileData = {
          name: file.name,
          url: downloadURL,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: {
            uid: user.uid,
            email: user.email
          }
        };

        await updateAppointment(appointment, fileData);
        
        alert('File uploaded successfully!');
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };
  input.click();
};

const updateAppointment = async (appointment, fileData) => {
  try {
    console.log('Updating appointment with fileData:', fileData);
    
    const updatedAppointment = {
      ...appointment,
      importedFile: fileData
    };
    
    console.log('Updated appointment object:', updatedAppointment);

    setApprovedAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === appointment.id 
          ? updatedAppointment
          : app
      )
    );

    const firestore = getFirestore();
    const appointmentRef = doc(firestore, 'approvedAppointments', appointment.id);
    await setDoc(appointmentRef, updatedAppointment, { merge: true });

    console.log('Appointment updated successfully in database');
  } catch (error) {
    console.error('Error updating appointment:', error);
    alert(`Error updating appointment: ${error.message}`);
  }
};

const handleMessageClick = (message) => {
  setSelectedMessage(message);
};

const closeMessagePopup = () => {
  setSelectedMessage(null);
};

const handleApprovedPageClick = ({ selected }) => {
  setCurrentApprovedPage(selected);
};

const handlePendingPageClick = ({ selected }) => {
  setCurrentPendingPage(selected);
};

const paginatedApprovedAppointments = approvedAppointments.slice(
  currentApprovedPage * itemsPerPage,
  (currentApprovedPage + 1) * itemsPerPage
);

const paginatedPendingAppointments = pendingAppointments.slice(
  currentPendingPage * itemsPerPage,
  (currentPendingPage + 1) * itemsPerPage
);

  const handleAppointmentClick = async (event, appointment) => {
    if (event.target.classList.contains('appointment-name')) {
      try {
        const firestore = getFirestore();
        const userRef = doc(firestore, 'users', appointment.userId);
        const userSnap = await fetchDoc(userRef);
        
        if (userSnap.exists()) {
          setSelectedUser({ id: userSnap.id, ...userSnap.data(), appointment });
        } else {
          console.error('User not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  const closeUserProfilePopup = () => {
    setSelectedUser(null);
  };

  const handleServicesClick = (appointment) => {
    setSelectedServicesForView(appointment);
  };

  return (
    <div className="dashboard-container" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.1) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        opacity: 0.5,
        pointerEvents: 'none'
      }} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Sidebar isAdmin={true} />
      <div className="main-content" style={{
        position: 'relative',
        zIndex: 1
      }}>
        <div className="content-wrapper" style={{
          padding: '2rem',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div className="page-header" style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 className="page-title-nav" style={{
              color: '#344767',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span className="page-title-icon" style={{
                background: 'linear-gradient(45deg, rgb(99, 44, 110),rgb(177, 67, 199))',
                padding: '0.5rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(33, 203, 243, 0.3)'
              }}>
                <i className="bi bi-house-fill menu-icon" style={{ color: 'white' }}></i>
              </span>
              Dashboard
            </h3>
            <nav aria-label="breadcrumb" style={{ marginTop: '1rem' }}>
              <ul className="breadcrumb" style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                gap: '0.5rem'
              }}>
                <li className="breadcrumb-item active" aria-current="page">
                  <span style={{
                    color: '#344767',
                    fontWeight: '500'
                  }} />
                  Overview
                  <i className="mdi mdi-alert-circle-outline icon-sm text-primary align-middle" style={{
                    marginLeft: '0.5rem',
                    color: '#2196F3'
                  }} />
                </li>
              </ul>
            </nav>
          </div>
          <div className="row">
            <div className="col-md-4 stretch-card grid-margin unique-card">
              <div className="card" style={{
                background: 'linear-gradient(45deg, #FF416C, #FF4B2B)',
                borderRadius: '15px',
                boxShadow: '0 4px 20px rgba(255, 75, 43, 0.3)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(255, 75, 43, 0.4)'
                }
              }}>
                <div className="card-body" style={{ position: 'relative', zIndex: 1 }}>
                  <img src={Circle} className="card-img-absolute" alt="circle-image" style={{
                    position: 'absolute',
                    right: '-20px',
                    bottom: '-20px',
                    opacity: 0.2,
                    transform: 'rotate(180deg)'
                  }} />
                  <h4 className="font-weight-normal mb-3" style={{
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    Medical Staff
                    <i className="bi bi-person" style={{ fontSize: '1.5rem' }}></i>
                  </h4>
                  <h2 className="mb-5" style={{ color: 'white', fontSize: '2.5rem' }}>10</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 stretch-card grid-margin unique-card">
              <div className="card" style={{
                background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                borderRadius: '15px',
                boxShadow: '0 4px 20px rgba(33, 203, 243, 0.3)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(33, 203, 243, 0.4)'
                }
              }}>
                <div className="card-body" style={{ position: 'relative', zIndex: 1 }}>
                  <img src={Circle} className="card-img-absolute" alt="circle-image" style={{
                    position: 'absolute',
                    right: '-20px',
                    bottom: '-20px',
                    opacity: 0.2,
                    transform: 'rotate(180deg)'
                  }} />
                  <h4 className="font-weight-normal mb-3" style={{
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    Registered Users
                    <i className="bi bi-postcard-heart-fill" style={{ fontSize: '1.5rem' }}></i>
                  </h4>
                  <h2 className="mb-5" style={{ color: 'white', fontSize: '2.5rem' }}>{registeredUsersCount}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 stretch-card grid-margin unique-card">
              <div className="card" style={{
                background: 'linear-gradient(45deg, #2dce89, #2dcecc)',
                borderRadius: '15px',
                boxShadow: '0 4px 20px rgba(45, 206, 137, 0.3)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(45, 206, 137, 0.4)'
                }
              }}>
                <div className="card-body" style={{ position: 'relative', zIndex: 1 }}>
                  <img src={Circle} className="card-img-absolute" alt="circle-image" style={{
                    position: 'absolute',
                    right: '-20px',
                    bottom: '-20px',
                    opacity: 0.2,
                    transform: 'rotate(180deg)'
                  }} />
                  <h4 className="font-weight-normal mb-3" style={{
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    Total Appointments
                    <i className="bi bi-clipboard2-check" style={{ fontSize: '1.5rem' }}></i>
                  </h4>
                  {loading ? (
                    <div style={{ color: 'white' }}>Loading...</div>
                  ) : error ? (
                    <div style={{ color: 'white' }}>{error}</div>
                  ) : (
                    <>
                      <h2 className="mb-3" style={{ color: 'white', fontSize: '2.5rem' }}>{totalAppointmentsCount}</h2>
                      <div style={{ display: 'flex', gap: '1rem', color: 'white' }}>
                        <div>
                          <small>Pending: {pendingAppointmentsCount}</small>
                        </div>
                        <div>
                          <small>Approved: {approvedAppointmentsCount}</small>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
         
          <div className="row">
            <div className="col-12 grid-margin">
              <div className="card" style={tableStyles.card}>
                <div style={tableStyles.cardHeader}>
                  <h4 style={tableStyles.cardTitle}>Approved Appointments</h4>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table" style={tableStyles.table}>
                      <thead>
                        <tr>
                          <th style={{...tableStyles.tableHeader, width: '5%'}}>#</th>
                          <th style={{...tableStyles.tableHeader, width: '15%'}}>Name</th>
                          <th style={{...tableStyles.tableHeader, width: '15%'}}>Email</th>
                          <th style={{...tableStyles.tableHeader, width: '5%'}}>Age</th>
                          <th style={{...tableStyles.tableHeader, width: '10%'}}>Date</th>
                          <th style={{...tableStyles.tableHeader, width: '10%'}}>Time</th>
                          <th style={{...tableStyles.tableHeader, width: '10%'}}>Select Pricing Type</th>
                          <th style={{...tableStyles.tableHeader, width: '10%'}}>Services</th>
                          <th style={{...tableStyles.tableHeader, width: '10%'}}>Message</th>
                          <th style={{...tableStyles.tableHeader, width: '20%'}}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedApprovedAppointments.map((appointment, index) => (
                          <tr key={appointment.id} style={tableStyles.tableRow}>
                            <td>{index + 1}</td>
                            <td 
                              className="appointment-name" 
                              onClick={(e) => handleAppointmentClick(e, appointment)}
                              style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}}
                            >
                              {appointment.name || 'N/A'}
                            </td>
                            <td>{appointment.email || 'N/A'}</td>
                            <td>{appointment.age || 'N/A'}</td>
                            <td>{appointment.date || 'N/A'}</td>
                            <td>{appointment.time || 'N/A'}</td>
                            <td>
                              <div className="pricing-type-info">
                                <div className="selected-pricing-type">
                                  {appointment.selectedPricingType ? (
                                    <>
                                      <div className="pricing-label">Selected:</div>
                                      <span className="pricing-badge selected">
                                        <i className="bi bi-check-circle-fill me-1"></i>
                                        {appointment.selectedPricingType === 'withoutPH' && 'Without PhilHealth'}
                                        {appointment.selectedPricingType === 'PHBenefit' && 'PhilHealth Benefit'}
                                        {appointment.selectedPricingType === 'withPH' && 'With PhilHealth'}
                                      </span>
                                      {appointment.totalAmount && (
                                        <div className="pricing-amount">
                                          <small className="text-muted">
                                            Amount: ₱{appointment.totalAmount[appointment.selectedPricingType]?.toLocaleString()}
                                          </small>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <span className="pricing-badge no-selection">
                                      No Selection Made
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <button 
                                className="btn btn-link p-0"
                                onClick={() => handleServicesClick(appointment)}
                              >
                                View ({appointment.selectedServices?.length || 0})
                              </button>
                            </td>
                            <td>
                              {appointment.message ? (
                                <button 
                                  className="btn btn-link p-0"
                                  onClick={() => handleMessageClick(appointment.message)}
                                >
                                  <i className="bi bi-eye" style={{ fontSize: '1.2em', color: '#007bff' }}></i>
                                </button>
                              ) : 'N/A'}
                            </td>
                            <td>
                              <div className="d-flex flex-row align-items-center gap-2">
                                <button 
                                  className='btn btn-sm me-2' 
                                  style={{
                                    ...tableStyles.actionButton,
                                    backgroundColor: '#2dce89',
                                    color: 'white',
                                    border: 'none'
                                  }}
                                  onClick={() => handleDone(appointment)}
                                >
                                  Done
                                </button>
                                <button 
                                  className='btn btn-sm'
                                  style={{
                                    ...tableStyles.actionButton,
                                    backgroundColor: appointment.importedFile ? '#6c757d' : '#11cdef',
                                    color: 'white',
                                    border: 'none'
                                  }}
                                  onClick={() => handleImport(appointment)}
                                  disabled={!!appointment.importedFile}
                                >
                                  <i className="bi bi-file-earmark-arrow-up me-1"></i>
                                  {appointment.importedFile ? 'Imported' : 'Import'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ReactPaginate
                    previousLabel={'<'}
                    nextLabel={'>'}
                    breakLabel={'...'}
                    pageCount={Math.ceil(approvedAppointments.length / itemsPerPage)}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handleApprovedPageClick}
                    containerClassName={'pagination justify-content-center mt-4'}
                    pageClassName={'page-item mx-1'}
                    pageLinkClassName={'page-link rounded-circle'}
                    previousClassName={'page-item mx-1'}
                    previousLinkClassName={'page-link rounded-circle'}
                    nextClassName={'page-item mx-1'}
                    nextLinkClassName={'page-link rounded-circle'}
                    breakClassName={'page-item mx-1'}
                    breakLinkClassName={'page-link rounded-circle'}
                    activeClassName={'active'}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12 grid-margin">
            <div className="card" style={tableStyles.card}>
                <div className="card-body">
                <div style={tableStyles.cardHeader}>
                  <h4 style={tableStyles.cardTitle}>For Approval of Appointment</h4>
                </div>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{width: '5%'}}>#</th>
                          <th style={{width: '15%'}}>Name</th>
                          <th style={{width: '15%'}}>Email</th>
                          <th style={{width: '5%'}}>Age</th>
                          <th style={{width: '10%'}}>Date</th>
                          <th style={{width: '10%'}}>Time</th>
                          <th style={{width: '10%'}}>Select Pricing Type</th>
                          <th style={{width: '10%'}}>Services</th>
                          <th style={{width: '10%'}}>Message</th>
                          <th style={{width: '20%'}}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPendingAppointments.map((appointment, index) => (
                          <tr key={appointment.id}>
                            <td>{index + 1}</td>
                            <td 
                              className="appointment-name" 
                              onClick={(e) => handleAppointmentClick(e, appointment)}
                              style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}}
                            >
                              {appointment.name || 'N/A'}
                            </td>
                            <td>{appointment.email || 'N/A'}</td>
                            <td>{appointment.age || 'N/A'}</td>
                            <td>{appointment.date || 'N/A'}</td>
                            <td>{appointment.time || 'N/A'}</td>
                            <td>
                              <div className="pricing-type-info">
                                <div className="selected-pricing-type">
                                  {appointment.selectedPricingType ? (
                                    <>
                                      <div className="pricing-label">Selected:</div>
                                      <span className="pricing-badge selected">
                                        <i className="bi bi-check-circle-fill me-1"></i>
                                        {appointment.selectedPricingType === 'withoutPH' && 'Without PhilHealth'}
                                        {appointment.selectedPricingType === 'PHBenefit' && 'PhilHealth Benefit'}
                                        {appointment.selectedPricingType === 'withPH' && 'With PhilHealth'}
                                      </span>
                                      {appointment.totalAmount && (
                                        <div className="pricing-amount">
                                          <small className="text-muted">
                                            Amount: ₱{appointment.totalAmount[appointment.selectedPricingType]?.toLocaleString()}
                                          </small>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <span className="pricing-badge no-selection">
                                      No Selection Made
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <button 
                                className="btn btn-link p-0"
                                onClick={() => handleServicesClick(appointment)}
                              >
                                View ({appointment.selectedServices?.length || 0})
                              </button>
                            </td>
                            <td>
                              {appointment.message ? (
                                <button 
                                  className="btn btn-link p-0"
                                  onClick={() => handleMessageClick(appointment.message)}
                                >
                                  <i className="bi bi-eye" style={{ fontSize: '1.2em', color: '#007bff' }}></i>
                                </button>
                              ) : 'N/A'}
                            </td>
                            <td>
                              <div className="d-flex flex-row align-items-center gap-2">
                                <button 
                                  className='btn btn-sm me-2'
                                  style={{
                                    ...tableStyles.actionButton,
                                    backgroundColor: '#2dce89',
                                    color: 'white',
                                    border: 'none'
                                  }}
                                  onClick={() => handleApprove(appointment.id)}
                                >
                                  Approve
                                </button>
                                <button 
                                  className='btn btn-sm'
                                  style={{
                                    ...tableStyles.actionButton,
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none'
                                  }}
                                  onClick={() => handleReject(appointment.id)}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ReactPaginate
                    previousLabel={'<'}
                    nextLabel={'>'}
                    breakLabel={'...'}
                    pageCount={Math.ceil(pendingAppointments.length / itemsPerPage)}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePendingPageClick}
                    containerClassName={'pagination justify-content-center'}
                    pageClassName={'page-item'}
                    pageLinkClassName={'page-link'}
                    previousClassName={'page-item'}
                    previousLinkClassName={'page-link'}
                    nextClassName={'page-item'}
                    nextLinkClassName={'page-link'}
                    breakClassName={'page-item'}
                    breakLinkClassName={'page-link'}
                    activeClassName={'active'}
                  />
                </div>
              </div>
            </div>
          </div>

          {selectedMessage && (
            <div className="message-popup" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(5px)'
            }}>
              <div className="message-popup-content" style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                maxWidth: '500px',
                width: '90%',
                animation: 'popIn 0.3s ease-out'
              }}>
                <h5 style={{
                  color: '#344767',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="bi bi-chat-dots" style={{ color: '#2196F3' }}></i>
                  Message
                </h5>
                <p style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem'
                }}>{selectedMessage}</p>
                <button 
                  className="btn btn-primary" 
                  onClick={closeMessagePopup}
                  style={{
                    background: 'linear-gradient(45deg, rgb(99, 44, 110),rgb(177, 67, 199))',
                    border: 'none',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '25px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(33, 203, 243, 0.3)'
                    }
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {selectedUser && (
            <UserProfilePopup
              user={selectedUser}
              onClose={closeUserProfilePopup}
              style={{
                animation: 'slideIn 0.3s ease-out'
              }}
            />
          )}

          {selectedServicesForView && (
            <div className="modal fade show" style={{ 
              display: 'block',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(5px)'
            }} tabIndex="-1">
              <div className="modal-dialog modal-lg" style={{
                margin: '1.75rem auto',
                maxWidth: '800px'
              }}>
                <div className="modal-content" style={{
                  borderRadius: '15px',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  animation: 'slideIn 0.3s ease-out'
                }}>
                  <div className="modal-header" style={{
                    background: 'linear-gradient(45deg, rgb(99, 44, 110),rgb(177, 67, 199))',
                    color: 'white',
                    borderTopLeftRadius: '15px',
                    borderTopRightRadius: '15px',
                    padding: '1.5rem'
                  }}>
                    <h5 className="modal-title" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'white'
                    }}>
                      <i className="bi bi-list-check"></i>
                      Selected Services
                    </h5>
                    <div className="pricing-type-label" style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
      
                    </div>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setSelectedServicesForView(null)}
                      style={{
                        filter: 'brightness(0) invert(1)',
                        opacity: '0.8',
                        transition: 'opacity 0.3s ease',
                        '&:hover': {
                          opacity: '1'
                        }
                      }}
                    ></button>
                  </div>
                  <div className="modal-body-dash" style={{
                    padding: '1.5rem',
                    maxHeight: '70vh',
                    overflowY: 'auto'
                  }}>
                    <div className="pricing-summary mb-4" style={{
                      background: 'rgba(33, 150, 243, 0.1)',
                      padding: '1rem',
                      borderRadius: '10px'
                    }}>
                      <h6 style={{
                        color: '#344767',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <i className="bi bi-currency-dollar"></i>
                        Pricing Summary
                      </h6>
                      {selectedServicesForView.totalAmount && (
                        <div className="pricing-details" style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '1rem'
                        }}>
                          <div style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                          }}>
                            <small style={{ color: '#666' }}>Without PhilHealth:</small>
                            <div style={{ color: 'rgb(177, 67, 199)', fontWeight: '600' }}>
                              ₱{selectedServicesForView.totalAmount.withoutPH?.toLocaleString()}
                            </div>
                          </div>
                          <div style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                          }}>
                            <small style={{ color: '#666' }}>PhilHealth Benefit:</small>
                            <div style={{ color: 'rgb(177, 67, 199)', fontWeight: '600' }}>
                              ₱{selectedServicesForView.totalAmount.PHBenefit?.toLocaleString()}
                            </div>
                          </div>
                          <div style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                          }}>
                            <small style={{ color: '#666' }}>With PhilHealth:</small>
                            <div style={{ color: 'rgb(177, 67, 199)', fontWeight: '600' }}>
                              ₱{selectedServicesForView.totalAmount.withPH?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedServicesForView.selectedServices?.map((service, index) => (
                      <div key={index} className="service-item" style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '10px',
                        marginBottom: '1rem',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                        }
                      }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0" style={{ color: '#344767' }}>{service.name}</h6>
                          <span className="badge" style={{
                                background: 'linear-gradient(45deg, rgb(99, 44, 110),rgb(177, 67, 199))',
                            padding: '0.5rem 1rem',
                            borderRadius: '15px',
                            color: 'white',
                            fontWeight: '500'
                          }}>
                            ₱{service[selectedServicesForView.selectedPricingType]?.toLocaleString()}
                          </span>
                        </div>
                        {service.isPackage && service.components && (
                          <div style={{ marginTop: '1rem' }}>
                            <small style={{ color: '#666' }}>Package Components:</small>
                            <ul style={{
                              listStyle: 'none',
                              padding: 0,
                              margin: '0.5rem 0 0 0'
                            }}>
                              {service.components.map((component, idx) => (
                                <li key={idx} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  padding: '0.5rem 0',
                                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                  '&:last-child': {
                                    borderBottom: 'none'
                                  }
                                }}>
                                  <span style={{ color: '#666' }}>{component.name}</span>
                                  <span style={{ color: 'rgb(177, 67, 199)', fontWeight: '500' }}>
                                    ₱{component[selectedServicesForView.selectedPricingType]?.toLocaleString()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="total-amount-dash" style={{
                      background: 'linear-gradient(45deg, rgb(99, 44, 110),rgb(177, 67, 199))',
                      padding: '1rem',
                      borderRadius: '10px',
                      color: 'white',
                      marginTop: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <strong>Total Amount:</strong>
                      <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                        ₱{calculateTotal(
                          selectedServicesForView.selectedServices,
                          selectedServicesForView.selectedPricingType
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="modal-footer" style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)'
                  }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setSelectedServicesForView(null)}
                      style={{
                        background: 'linear-gradient(45deg, #6c757d, #495057)',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '25px',
                        color: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(108, 117, 125, 0.3)'
                        }
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showApproveModal && (
            <div className="ST-modal-overlay modal fade show" style={{ 
              display: 'flex',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(5px)'
            }} tabIndex="-1">
              <div className="ST-modal-dialog" style={{
                margin: '1.75rem auto',
                maxWidth: '500px'
              }}>
                <div className="ST-modal-content" style={{
                  borderRadius: '15px',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  animation: 'slideIn 0.3s ease-out'
                }}>
                  <div className="ST-modal-header" style={{
                    background: 'linear-gradient(45deg, #2dce89, #2dcecc)',
                    color: 'white',
                    borderTopLeftRadius: '15px',
                    borderTopRightRadius: '15px',
                    padding: '1.5rem'
                  }}>
                    <h5 className="ST-modal-title" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      margin: 0
                    }}>
                      <i className="bi bi-check-circle-fill"></i>
                      Approve Appointment
                    </h5>
                    <button 
                      type="button" 
                      className="ST-modal-close btn-close" 
                      onClick={() => {
                        setShowApproveModal(false);
                        setPendingApprovalId(null);
                        setApprovalRemark('');
                        setIncludeRemark(false);
                      }}
                      style={{
                        filter: 'brightness(0) invert(1)',
                        opacity: '0.8',
                        transition: 'opacity 0.3s ease'
                      }}
                    ></button>
                  </div>
                  <div className="ST-modal-body" style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.95)'
                  }}>
                    <p className="ST-modal-text" style={{
                      color: '#344767',
                      marginBottom: '1.5rem',
                      fontSize: '1.1rem'
                    }}>
                      Would you like to include a remark with this approval?
                    </p>
                    <div className="ST-form-check mb-4">
                      <input
                        type="checkbox"
                        className="ST-form-check-input"
                        id="includeRemark"
                        checked={includeRemark}
                        onChange={(e) => setIncludeRemark(e.target.checked)}
                        style={{
                          width: '1.2rem',
                          height: '1.2rem',
                          cursor: 'pointer'
                        }}
                      />
                      <label className="ST-form-check-label" htmlFor="includeRemark" style={{
                        marginLeft: '0.5rem',
                        color: '#344767',
                        cursor: 'pointer'
                      }}>
                        Include Remark
                      </label>
                    </div>
                    {includeRemark && (
                      <div className="ST-remark-container">
                        <label className="ST-remark-label" style={{
                          color: '#344767',
                          fontWeight: '500',
                          marginBottom: '0.5rem'
                        }}>
                          Remark:
                        </label>
                        <textarea
                          className="ST-remark-textarea form-control"
                          rows="4"
                          value={approvalRemark}
                          onChange={(e) => setApprovalRemark(e.target.value)}
                          placeholder="Enter your remark here..."
                          style={{
                            borderRadius: '10px',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            padding: '0.75rem',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s ease',
                            '&:focus': {
                              borderColor: '#2dce89',
                              boxShadow: '0 0 0 0.2rem rgba(45, 206, 137, 0.25)'
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="ST-modal-footer" style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'rgba(255, 255, 255, 0.95)'
                  }}>
                    <button 
                      type="button" 
                      className="ST-cancel-btn btn" 
                      onClick={() => {
                        setShowApproveModal(false);
                        setPendingApprovalId(null);
                        setApprovalRemark('');
                        setIncludeRemark(false);
                      }}
                      style={{
                        background: 'linear-gradient(45deg, #6c757d, #495057)',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '25px',
                        color: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(108, 117, 125, 0.3)'
                        }
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="ST-approve-btn btn" 
                      onClick={handleFinalApprove}
                      style={{
                        background: 'linear-gradient(45deg, #2dce89, #2dcecc)',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '25px',
                        color: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(45, 206, 137, 0.3)'
                        }
                      }}
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showRejectModal && (
            <div className="unique-reject-modal modal fade show" style={{ 
              display: 'block',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(5px)'
            }} tabIndex="-1">
              <div className="modal-dialog unique-modal-dialog" style={{
                margin: '1.75rem auto',
                maxWidth: '500px'
              }}>
                <div className="modal-content unique-modal-content" style={{
                  borderRadius: '15px',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  animation: 'slideIn 0.3s ease-out'
                }}>
                  <div className="modal-header unique-modal-header" style={{
                    background: 'linear-gradient(45deg,rgb(204, 86, 98), #c82333)',
                    color: 'white',
                    borderTopLeftRadius: '15px',
                    borderTopRightRadius: '15px',
                    padding: '1.5rem'
                  }}>
                    <h5 className="modal-title unique-modal-title" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      margin: 0
                    }}>
                      <i className="bi bi-x-circle-fill"></i>
                      Reject Appointment
                    </h5>
                    <button 
                      type="button" 
                      className="btn-close unique-modal-close" 
                      onClick={() => {
                        setShowRejectModal(false);
                        setPendingRejectId(null);
                        setRejectRemark('');
                      }}
                      style={{
                        filter: 'brightness(0) invert(1)',
                        opacity: '0.8',
                        transition: 'opacity 0.3s ease'
                      }}
                    ></button>
                  </div>
                  <div className="modal-body unique-modal-body" style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.95)'
                  }}>
                    <div className="unique-reject-form">
                      <label className="form-label unique-form-label" style={{
                        color: '#344767',
                        fontWeight: '500',
                        marginBottom: '1rem'
                      }}>
                        Please provide a reason for rejection:
                      </label>
                      <textarea
                        className="form-control unique-textarea"
                        rows="4"
                        value={rejectRemark}
                        onChange={(e) => setRejectRemark(e.target.value)}
                        placeholder="Enter rejection reason here..."
                        required
                        style={{
                          borderRadius: '10px',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          padding: '0.75rem',
                          fontSize: '0.95rem',
                          transition: 'all 0.3s ease',
                          '&:focus': {
                            borderColor: '#dc3545',
                            boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="modal-footer unique-modal-footer" style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'rgba(255, 255, 255, 0.95)'
                  }}>
                    <button 
                      type="button" 
                      className="btn unique-cancel-btn" 
                      onClick={() => {
                        setShowRejectModal(false);
                        setPendingRejectId(null);
                        setRejectRemark('');
                      }}
                      style={{
                        background: 'linear-gradient(45deg, #6c757d, #495057)',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '25px',
                        color: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(108, 117, 125, 0.3)'
                        }
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn unique-reject-btn" 
                      onClick={handleFinalReject}
                      disabled={!rejectRemark.trim()}
                      style={{
                        background: 'linear-gradient(45deg, #dc3545, #c82333)',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '25px',
                        color: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover:not(:disabled)': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(220, 53, 69, 0.3)'
                        },
                        '&:disabled': {
                          opacity: 0.6,
                          cursor: 'not-allowed'
                        }
                      }}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
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
      return 'Select Pricing Type';
  }
}

function calculateTotal(services, pricingType) {
  if (!services || !pricingType) return 0;
  return services.reduce((total, service) => total + (service[pricingType] || 0), 0).toLocaleString();
}

export default DashboardAdmin;