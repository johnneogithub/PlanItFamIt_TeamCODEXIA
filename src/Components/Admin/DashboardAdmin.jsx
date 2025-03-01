import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc, setDoc, getDoc, onSnapshot, getDoc as fetchDoc, arrayUnion } from 'firebase/firestore';
import Sidebar from '../Global/Sidebar';
import { Link } from 'react-router-dom';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ReactPaginate from 'react-paginate';
import { getAuth } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Clinic from '../Assets/stmargaretlogo.png'
import logomini from '../Assets/logo-mini.svg'
import Circle from '../Assets/circle.png'

import './DashboardAdmin.css';
import 'bootstrap/dist/js/bootstrap.js';
import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap-icons/font/bootstrap-icons.css";

import UserProfilePopup from './AdminLogin/UserProfilePopup';
import Articles from '../../pages/Articles';

const tableStyles = {
  card: {
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem'
  },
  cardHeader: {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
    padding: '1.5rem',
    borderTopLeftRadius: '15px',
    borderTopRightRadius: '15px'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: 0,
    color: '#344767'
  },
  table: {
    borderCollapse: 'separate',
    borderSpacing: '0 8px'
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    color: '#344767',
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.5px'
  },
  tableRow: {
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }
  },
  actionButton: {
    borderRadius: '20px',
    padding: '0.375rem 1rem',
    fontSize: '0.875rem',
    textTransform: 'none',
    fontWeight: '500'
  }
};

function DashboardAdmin() {
  const location = useLocation();
  const history = useHistory();

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
    <div className="dashboard-container">
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
      <div className="main-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h3 className="page-title-nav">
              <span className="page-title-icon bg-gradient-primary text-white me-2">
                <i className="bi bi-house-fill menu-icon"></i>
              </span>{" "}
              Dashboard
            </h3>
            <nav aria-label="breadcrumb">
              <ul className="breadcrumb">
                <li className="breadcrumb-item active" aria-current="page">
                  <span />
                  Overview{" "}
                  <i className="mdi mdi-alert-circle-outline icon-sm text-primary align-middle" />
                </li>
              </ul>
            </nav>
          </div>
          <div className="row">
            <div className="col-md-4 stretch-card grid-margin unique-card">
              <div className="card bg-gradient-danger card-img-holder text-white">
                <div className="card-body">
                <img src={Circle} class="card-img-absolute" alt="circle-image" />
                  <h4 className="font-weight-normal mb-3">
                    Medical Staff{" "}
                    <i class="bi bi-person mdi-24px float-end"></i>
                  </h4>
                  <h2 className="mb-5">10</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 stretch-card grid-margin unique-card">
              <div className="card bg-gradient-info card-img-holder text-white">
                <div className="card-body">
                  <img src={Circle} className="card-img-absolute" alt="circle-image" />
                  <h4 className="font-weight-normal mb-3">
                    Registered Users on the System{" "}
                    <i className="bi bi-postcard-heart-fill mdi-24px float-end"></i>
                  </h4>
                  <h2 className="mb-5">{registeredUsersCount}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-4 stretch-card grid-margin unique-card">
              <div className="card bg-gradient-success card-img-holder text-white">
                <div className="card-body">
                <img src={Circle} className="card-img-absolute" alt="circle-image" />
                  <h4 className="font-weight-normal mb-3">
                    Total Appointments{" "}
                    <i className="bi bi-clipboard2-check mdi-24px float-end"></i>
                  </h4>
                  {loading ? (
                    <p>Loading...</p>
                  ) : error ? (
                    <p>{error}</p>
                  ) : (
                    <>
                      <h2 className="mb-5">{totalAppointmentsCount}</h2>
                      <h6 className="card-text">Pending: {pendingAppointmentsCount}</h6>
                      <h6 className="card-text">Approved: {approvedAppointmentsCount}</h6>
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
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">For Approval of Appointment</h4>
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
            <div className="message-popup">
              <div className="message-popup-content">
                <h5>Message</h5>
                <p>{selectedMessage}</p>
                <button className="btn btn-primary" onClick={closeMessagePopup}>Close</button>
              </div>
            </div>
          )}

          {selectedUser && (
            <UserProfilePopup
              user={selectedUser}
              onClose={closeUserProfilePopup}
            />
          )}

          {selectedServicesForView && (
            <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Selected Services</h5>
                    <div className="pricing-type-label">
                      <div className="selected-type">
                        Selected Pricing Type: 
                        <span className="pricing-badge selected ms-2">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          {selectedServicesForView.selectedPricingType === 'withoutPH' && 'Without PhilHealth'}
                          {selectedServicesForView.selectedPricingType === 'PHBenefit' && 'PhilHealth Benefit'}
                          {selectedServicesForView.selectedPricingType === 'withPH' && 'With PhilHealth'}
                        </span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setSelectedServicesForView(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="pricing-summary mb-3">
                      <h6>Pricing Type: <span className="pricing-badge">{formatPricingType(selectedServicesForView.selectedPricingType)}</span></h6>
                      {selectedServicesForView.totalAmount && (
                        <div className="pricing-details mt-2">
                          <div className="row">
                            <div className="col-md-4">
                              <small className="text-muted">Without PhilHealth:</small>
                              <div>₱{selectedServicesForView.totalAmount.withoutPH?.toLocaleString()}</div>
                            </div>
                            <div className="col-md-4">
                              <small className="text-muted">PhilHealth Benefit:</small>
                              <div>₱{selectedServicesForView.totalAmount.PHBenefit?.toLocaleString()}</div>
                            </div>
                            <div className="col-md-4">
                              <small className="text-muted">With PhilHealth:</small>
                              <div>₱{selectedServicesForView.totalAmount.withPH?.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedServicesForView.selectedServices?.map((service, index) => (
                      <div key={index} className="service-item p-3 border rounded mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">{service.name}</h6>
                          <span className="badge bg-primary">
                            ₱{service[selectedServicesForView.selectedPricingType]?.toLocaleString()}
                          </span>
                        </div>
                        {service.isPackage && service.components && (
                          <div className="mt-2">
                            <small className="text-muted">Package Components:</small>
                            <ul className="list-unstyled ms-3">
                              {service.components.map((component, idx) => (
                                <li key={idx} className="d-flex justify-content-between">
                                  <span>{component.name}</span>
                                  <span>₱{component[selectedServicesForView.selectedPricingType]?.toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="total-amount p-2 bg-light rounded">
                      <strong>Total Amount: </strong>
                      <span>₱{calculateTotal(
                        selectedServicesForView.selectedServices,
                        selectedServicesForView.selectedPricingType
                      )}</span>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setSelectedServicesForView(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showApproveModal && (
            <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Approve Appointment</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => {
                        setShowApproveModal(false);
                        setPendingApprovalId(null);
                        setApprovalRemark('');
                        setIncludeRemark(false);
                      }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>Would you like to include a remark with this approval?</p>
                    <div className="form-check mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="includeRemark"
                        checked={includeRemark}
                        onChange={(e) => setIncludeRemark(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="includeRemark">
                        Include Remark
                      </label>
                    </div>
                    {includeRemark && (
                      <div className="mb-3">
                        <label className="form-label">Remark:</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={approvalRemark}
                          onChange={(e) => setApprovalRemark(e.target.value)}
                          placeholder="Enter your remark here..."
                        />
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setShowApproveModal(false);
                        setPendingApprovalId(null);
                        setApprovalRemark('');
                        setIncludeRemark(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-success" 
                      onClick={handleFinalApprove}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showRejectModal && (
            <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Reject Appointment</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => {
                        setShowRejectModal(false);
                        setPendingRejectId(null);
                        setRejectRemark('');
                      }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Please provide a reason for rejection:</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={rejectRemark}
                        onChange={(e) => setRejectRemark(e.target.value)}
                        placeholder="Enter rejection reason here..."
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setShowRejectModal(false);
                        setPendingRejectId(null);
                        setRejectRemark('');
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-danger" 
                      onClick={handleFinalReject}
                      disabled={!rejectRemark.trim()}
                    >
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