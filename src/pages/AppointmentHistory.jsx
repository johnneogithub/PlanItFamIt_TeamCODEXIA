import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useHistory } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaCommentDots, FaCheckCircle, FaTimesCircle, FaList, FaFileAlt } from 'react-icons/fa';
import Navbar from '../Components/Global/Navbar_Main';
import { doc, getDoc } from 'firebase/firestore';
import { crud } from '../Config/firebase';
import './AppointmentHistoryStyle.css';

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

  const fetchUserData = async () => {
    try {
      setIsDataLoading(true);
      const userRef = doc(crud, `users/${userId}`);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("Fetched user data:", userData);
        
        let allAppointments = [];
        
        if (userData.appointmentData && 
            userData.appointmentData.status !== 'completed' && 
            userData.appointmentData.status !== 'rejected') {
          allAppointments.push({
            ...userData.appointmentData,
            isCurrent: true
          });
        }
        
        if (userData.appointmentHistory) {
          allAppointments = [...allAppointments, ...userData.appointmentHistory];
        }

        console.log("Combined appointments:", allAppointments);
        setAppointments(allAppointments);

        setUserInfo({
          name: `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim(),
          email: userData.email,
          profilePic: userData.profilePicture,
          userId: userId
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <FaCheckCircle color="#007bff" />;
      case 'rejected': return <FaTimesCircle color="#dc3545" />;
      case 'remarked': return <FaCommentDots color="#17a2b8" />;
      case 'approved': return <FaCheckCircle color="#28a745" />;
      case 'pending': return <FaClock color="#ffc107" />;
      default: return <FaClock color="#ffc107" />;
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
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

  return (
    <>
      <Navbar />
      <div className="appointment-history-container">
        {isLoading ? (
          <div className="loading-spinner-small">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="history-header">
              <div className="header-title">
                <h2>Appointment History</h2>
                <span className="total-count">Total: {appointments.length}</span>
                <button 
                  className="btn btn-primary historical-btn"
                  onClick={handleNavigateToHistorical}
                >
                  View Historical Records
                </button>
              </div>
              {userInfo?.name && (
                <div className="user-info">
                  {userInfo.profilePic && (
                    <img src={userInfo.profilePic} alt="Profile" className="profile-pic" />
                  )}
                  <div className="user-details">
                    <h4>{userInfo.name}</h4>
                    <p>{userInfo.email}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="controls-section">
              <div className="filter-section">
                <button 
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('pending')}
                >
                  Pending
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('approved')}
                >
                  Approved
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('completed')}
                >
                  Completed
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('rejected')}
                >
                  Rejected
                </button>
              </div>
              
              <button className="sort-btn" onClick={toggleSortOrder}>
                <FaList /> {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </button>
            </div>

            <div className="appointments-grid">
              {filteredAppointments.length === 0 ? (
                <div className="no-appointments">
                  <p>No appointments found.</p>
                </div>
              ) : (
                filteredAppointments.map((appointment, index) => (
                  <div key={index} className={`appointment-card ${appointment.status}`}>
                    <div className="card-header">
                      <h3>{appointment.appointmentType}</h3>
                      <div className="status-badge">
                        {getStatusIcon(appointment.status)}
                        <span>{appointment.status || 'pending'}</span>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="appointment-info">
                        <div className="info-item">
                          <FaCalendarAlt />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="info-item">
                          <FaClock />
                          <span>{formatTime(appointment.time)}</span>
                        </div>
                      </div>

                      {appointment.message && (
                        <div className="message-section">
                          <FaCommentDots />
                          <p>{appointment.message}</p>
                        </div>
                      )}

                      {appointment.remark && (
                        <div className="remark-section">
                          <FaCommentDots />
                          <div>
                            <strong>Remark:</strong>
                            <p>{appointment.remark}</p>
                          </div>
                        </div>
                      )}

                      {appointment.importedFile && (
                        <div className="imported-file-notification">
                          <FaFileAlt className="file-icon" />
                          <span>This appointment has an imported file</span>
                          <button 
                            className="btn btn-link view-file-btn"
                            onClick={() => history.push('/HistoricalAppointment')}
                          >
                            View in Historical Records
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        
        {isDataLoading && (
          <div className="data-loading-indicator">
            Updating...
          </div>
        )}
      </div>
    </>
  );
};

export default AppointmentHistory; 