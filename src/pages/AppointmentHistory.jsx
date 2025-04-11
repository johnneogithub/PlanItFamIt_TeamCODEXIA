import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useHistory } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaCommentDots, FaCheckCircle, FaTimesCircle, FaList, FaFileAlt, FaArrowLeft, FaChevronRight, FaEllipsisH, FaTrash, FaEye   } from 'react-icons/fa';
import Navbar from '../Components/Global/Navbar_Main';
import { doc, getDoc, onSnapshot, updateDoc, arrayRemove } from 'firebase/firestore';
import { crud } from '../Config/firebase';
import './AppointmentHistoryStyle.css';
import './AppointmentHistoryTable.css'; 

import AppointmentCard from '../Components/Appointments/AppointmentCard';
import AppointmentModal from '../Components/Appointments/AppointmentModal';
import AppointmentFilters from '../Components/Appointments/AppointmentFilters';
import NotificationBanner from '../Components/Notifications/NotificationBanner';
import HistoryHeader from '../Components/Appointments/HistoryHeader';
import LoadingSpinner from '../Components/UI/LoadingSpinner';

const formatPricingType = (type) => {
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
};

const AppointmentHistory = () => {
  const history = useHistory();
  const location = useLocation();
  const { userId } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);


  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        if (location.state?.appointments && location.state?.userInfo) {
          console.log("Using data from UserProfile:", location.state);
          setAppointments(location.state.appointments);
          setUserInfo(location.state.userInfo);
        } else if (userId) {
          console.log("Fetching data for userId:", userId);
          await fetchUserData();
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [location.state, userId]);

  useEffect(() => {
    if (appointments.length > 0) {
      console.log("Processing appointments:", appointments);
      
      const sortedAppointments = [...appointments].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
      
      const filtered = filterStatus === 'all' 
        ? sortedAppointments 
        : sortedAppointments.filter(app => app.status === filterStatus);
      
      console.log("Filtered appointments:", filtered);
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments([]);
    }
  }, [appointments, filterStatus, sortOrder]);

  const fetchUserData = async () => {
    try {
      setIsDataLoading(true);
      const userRef = doc(crud, `users/${userId}`);
      
      // Set up real-time listener for notifications
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          
          // Update notifications
          const userNotifications = userData.notifications || [];
          const completionNotifications = userNotifications.filter(
            n => n.notificationType === 'appointment_completion' && !n.read
          );
          setNotifications(completionNotifications);

          // Update appointments
          let allAppointments = [];
          
          // Only add current appointment if it exists and isn't already in history
          if (userData.appointmentData) {
            const currentAppointment = {
              ...userData.appointmentData,
              isCurrent: true,
              id: `current_${userData.appointmentData.date}_${userData.appointmentData.time}`
            };
            
            // Check if this appointment is already in history
            const isInHistory = userData.appointmentHistory?.some(histApp => 
              histApp.date === currentAppointment.date && 
              histApp.time === currentAppointment.time &&
              histApp.status === currentAppointment.status
            );
            
            if (!isInHistory) {
              allAppointments.push(currentAppointment);
            }
          }
          
          // Add appointment history
          if (userData.appointmentHistory) {
            allAppointments = [...allAppointments, ...userData.appointmentHistory];
          }
          
          // Remove any duplicates based on date, time, and status
          const uniqueAppointments = allAppointments.filter((app, index, self) =>
            index === self.findIndex((a) => 
              a.date === app.date && 
              a.time === app.time && 
              a.status === app.status
            )
          );
          
          setAppointments(uniqueAppointments);
          setFilteredAppointments(uniqueAppointments);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setIsDataLoading(true);
      const userId = userInfo.userId;
      const userRef = doc(crud, `users/${userId}`);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userAppointments = userData.appointments || [];

        const filteredAppointments = userAppointments.filter(appointment => {
          if (appointment.status === 'pending') {
            const existsWithNewStatus = userAppointments.some(other =>
              other.date === appointment.date &&
              other.time === appointment.time &&
              other.appointmentType === appointment.appointmentType &&
              (other.status === 'approved' || other.status === 'completed')
            );
            return !existsWithNewStatus;
          }
          return true;
        });

        const allAppointments = [...filteredAppointments];

        console.log("Filtered appointments:", allAppointments);
        setAppointments(allAppointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchAppointments();
    }
  }, [userInfo.userId, isLoading]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <FaCheckCircle color="#1976d2" />;
      case 'rejected': return <FaTimesCircle color="#dc3545" />;
      case 'remarked': return <FaCommentDots color="#17a2b8" />;
      case 'approved': return <FaCheckCircle color="#28a745" />;
      case 'pending': return <FaClock color="#f57c00" />;
      default: return <FaClock color="#f57c00" />;
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const toggleSortOrder = () => {
    if (sortOrder !== undefined) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
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

  const formatTime = (timeStr) => {
    return new Date(`2000/01/01 ${timeStr}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNavigateToHistorical = () => {
    history.push('/HistoricalAppointment');
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const handleCardClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
  };
  const handleOpenClick = (index) => {
    setOpenMenuIndex(prevIndex => (prevIndex === index ? null : index));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.details-cell')) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  


  
  const handleDeleteAppointment = async (appointment) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this appointment?");
    if (!confirmDelete) return;
  
    try {
      const userRef = doc(crud, `users/${userId}`);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        console.error("User not found.");
        return;
      }
  
      const userData = userSnap.data();
      const originalHistory = userData.appointmentHistory || [];
  
      // Filter out the appointment to be deleted
      const updatedHistory = originalHistory.filter((app) => {
        return !(
          app.date === appointment.date &&
          app.time === appointment.time &&
          app.endTime === appointment.endTime &&
          app.name === appointment.name &&
          app.email === appointment.email &&
          app.selectedPricingType === appointment.selectedPricingType &&
          app.status === appointment.status &&
          app.appointmentType === appointment.appointmentType
        );
      });
  
      // Update Firestore with filtered list
      await updateDoc(userRef, {
        appointmentHistory: updatedHistory
      });
  
      console.log("Appointment successfully removed from Firestore.");
  
      // Update local state to reflect deletion in UI
      setAppointments((prevAppointments) =>
        prevAppointments.filter((app) => app.id !== appointment.id)
      );
  
      setFilteredAppointments((prevFilteredAppointments) =>
        prevFilteredAppointments.filter((app) => app.id !== appointment.id)
      );
  
      console.log("Appointment deleted successfully from local state.");
    } catch (error) {
      console.error("Failed to delete appointment:", error);
    }
  };
  
  
  return (
    <>
      <Navbar />
      <div className="appointment-history-container">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <HistoryHeader 
              userInfo={userInfo}
              appointmentsCount={appointments.filter(apt => apt.status === 'completed').length}
              onGoBack={handleGoBack}
              onNavigateToHistorical={handleNavigateToHistorical}
            />

            <AppointmentFilters 
              filterStatus={filterStatus}
              sortOrder={sortOrder}
              onFilterChange={handleFilterChange}
              onToggleSortOrder={toggleSortOrder}
            />

            <div className="appointments-table-container">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th className="date-column">
                      <input type="checkbox" />
                      Date <span className="sort-icon">↓</span>
                    </th>
                    <th className="name-column">Name <span className="sort-icon">↓</span></th>
                    <th className="event-type-column">Pricing Type <span className="sort-icon">↓</span></th>
                    <th className="attendance-column">Status <span className="sort-icon">↓</span></th>
                    <th className="details-column"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-appointments">
                        <p>No appointments found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appointment, index) => (
                      <tr key={index} className={`appointment-row ${appointment.status}`}>
                        <td className="date-cell">
                          <div className="date-info">
                            <div className="date-label">
                            {formatDate(appointment.date)}

                            </div>
                            <div className="time-range">
                              {formatTime(appointment.time)} - {formatTime(appointment.endTime || 
                                new Date(new Date(`2000/01/01 ${appointment.time}`).getTime() + 30*60000).toTimeString().substring(0, 5))}
                            </div>
                          </div>
                        </td>
                        <td className="name-cell">
                          <div className="name-info">
                            <div className="client-name">{appointment.name || 'Client Name'}</div>
                            <div className="client-email">{appointment.email || 'client@example.com'}</div>
                          </div>
                        </td>
                        <td className="event-type-cell">
                          <div className="event-info">
                          <span>{formatPricingType(appointment.selectedPricingType)}</span>
                          </div>
                        </td>
                        <td className="attendance-cell">
                        <div className="detail-item-history status-section">
                          <div className="status-badge-history">
                            {getStatusIcon(appointment.status)}
                            <span>{appointment.status || 'pending'}</span>
                          </div>
                        </div>
                        </td>
                        <td className="details-cell" style={{ position: 'relative' }}>
                          <button
                            className="details-button"
                            onClick={() => handleOpenClick(index)}
                          >
                            <FaEllipsisH />
                          </button>

                          {openMenuIndex === index && (
                          <div className="dropdown-menu-appointment">
                            <button onClick={() => setSelectedAppointment(appointment)}><FaEye/></button>
                            <button onClick={() => handleDeleteAppointment(appointment)}><FaTrash/></button>
                          </div>
                        )}

                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
        
        {isDataLoading && (
          <div className="data-loading-indicator">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Updating...
          </div>
        )}
      </div>

      <AppointmentModal
        appointment={selectedAppointment}
        onClose={handleCloseModal}
        formatDate={formatDate}
        formatTime={formatTime}
        getStatusIcon={getStatusIcon}
        formatPricingType={formatPricingType}
        navigateToHistorical={() => history.push('/HistoricalAppointment')}
      />

      <NotificationBanner notifications={notifications} />
    </>
  );
};

export default AppointmentHistory;