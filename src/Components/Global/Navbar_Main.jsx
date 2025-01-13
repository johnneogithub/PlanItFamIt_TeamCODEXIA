import '../../pages/HomeStyle.css';
import { Link, useHistory } from 'react-router-dom';
import humber from '../Assets/hamburger.png';
import iconyou from '../Assets/icon_you.png';
import React, { useState, useEffect } from 'react';
import { auth, crud } from '../../Config/firebase';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FaUser, FaSignOutAlt, FaHistory, FaFolder } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Nav({ isAdmin = false }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [hasProfileUpdates, setHasProfileUpdates] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const { logout } = useAuth();
  const history = useHistory();

  const toggleDropdown = async () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('authToken');
      logout();
      history.push('/Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleProfileClick = async () => {
    try {
      if (auth.currentUser) {
        const userRef = doc(crud, `users/${auth.currentUser.uid}`);
        
        const updatedNotifications = notifications.map(notif => ({
          ...notif,
          read: notif.notificationType !== 'appointment_approval' && 
                notif.notificationType !== 'appointment_rejection' &&
                notif.notificationType !== 'appointment_completion' &&
                notif.notificationType !== 'medical_records_update' ? true : notif.read
        }));
        
        await updateDoc(userRef, {
          notifications: updatedNotifications
        });
        
        setNotifications(updatedNotifications);
        
        if (hasProfileUpdates) {
          setHasProfileUpdates(false);
          localStorage.setItem(`lastViewedProfile_${auth.currentUser.uid}`, new Date().toISOString());
        }
      }
    } catch (error) {
      console.error('Error updating profile notifications:', error);
      toast.error("Could not update profile notifications", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
        hideProgressBar: true
      });
    }
  };

  const handleAppointmentHistoryClick = async () => {
    try {
      if (auth.currentUser) {
        const userRef = doc(crud, `users/${auth.currentUser.uid}`);
        
        const updatedNotifications = notifications.map(notif => ({
          ...notif,
          read: (notif.notificationType === 'appointment_approval' || 
                 notif.notificationType === 'appointment_rejection' ||
                 notif.notificationType === 'appointment_completion') ? true : notif.read
        }));
        
        await updateDoc(userRef, {
          notifications: updatedNotifications
        });
        
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error('Error updating appointment notifications:', error);
      toast.error("Could not update appointment notifications", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
        hideProgressBar: true
      });
    }
  };

  const handleMedicalRecordsClick = async () => {
    try {
      if (auth.currentUser) {
        const userRef = doc(crud, `users/${auth.currentUser.uid}`);
        
        const updatedNotifications = notifications.map(notif => ({
          ...notif,
          read: notif.notificationType === 'medical_records_update' ? true : notif.read
        }));
        
        await updateDoc(userRef, {
          notifications: updatedNotifications
        });
        
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error('Error updating medical records notifications:', error);
      toast.error("Could not update medical records notifications", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
        hideProgressBar: true
      });
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(crud, `users/${user.uid}`);
        
        const unsubscribeDoc = onSnapshot(userRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setUserProfilePic(data.profilePicture || '');
            
            const userNotifications = data.notifications || [];
            setNotifications(userNotifications);
            
            const hasUnreadProfile = userNotifications.some(notif => 
              !notif.read && 
              notif.notificationType !== 'appointment_approval' && 
              notif.notificationType !== 'appointment_rejection' &&
              notif.notificationType !== 'appointment_completion' &&
              notif.notificationType !== 'medical_records_update'
            );

            const hasUnreadAppointments = userNotifications.some(notif => 
              !notif.read && 
              (notif.notificationType === 'appointment_approval' || 
               notif.notificationType === 'appointment_rejection' ||
               notif.notificationType === 'appointment_completion')
            );

            const hasUnreadMedicalRecords = userNotifications.some(notif =>
              !notif.read && notif.notificationType === 'medical_records_update'
            );
            
            setHasUnreadNotifications(hasUnreadProfile || hasUnreadAppointments || hasUnreadMedicalRecords);
            
            const lastProfileUpdate = data.lastProfileUpdate;
            const lastViewed = localStorage.getItem(`lastViewedProfile_${user.uid}`);
            
            if (lastProfileUpdate && (!lastViewed || new Date(lastProfileUpdate) > new Date(lastViewed))) {
              setHasProfileUpdates(true);
            } else {
              setHasProfileUpdates(false);
            }
          }
        });

        return () => unsubscribeDoc();
      } else {
        resetState();
      }
    });

    return () => unsubscribe();
  }, []);

  const resetState = () => {
    setUserProfilePic('');
    setAppointmentHistory([]);
    setMedicalRecords([]);
  };

  if (isAdmin) return null;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className='navbar_master'>
        <input type="checkbox" id="check" checked={menuOpen} onChange={toggleMenu} />
        <label htmlFor="check" className="checkbtn">
          <div className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </label>

        <Link className="page_name" to="/Home">
          <label>PlanIt<span>FamIt</span></label>
        </Link>

        <ul className={menuOpen ? 'open' : ''}>
          <li>
            <Link to="/OvulationTracker" className="OvulationTracker">
              <a className="active">Ovulation Tracker</a>
            </Link>
          </li>
          <li>
            <Link to="/StMargaretLyingInClinic" className="st-mar-style-font">
              <a>St. Margaret Lying In Clinic</a>
            </Link>
          </li>
          <li>
            <Link to="/PregnancyCalculator" className="pregnancy-calculator-style-font">
              <a>Pregnancy Calculator</a>
            </Link>
          </li>
          <li>
            <Link to="/Aboutus" className="aboutus-style-font">
              <a>About Us</a>
            </Link>
          </li>
 
          <li>
            <a className="dropdown-toggle1 position-relative" onClick={toggleDropdown}>
              <img src={userProfilePic || iconyou} alt="Profile" className="profile-pic-small" />
              {(hasProfileUpdates || hasUnreadNotifications) && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notifications.filter(n => !n.read).length || '!'}
                </span>
              )}
              {dropdownOpen && (
                <div className="dropdown1">
                  <div className="dropdown-content1">
                    <Link to="/UserProfile" onClick={handleProfileClick}>
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <FaUser /> Profile
                        </div>
                        {(hasProfileUpdates || hasUnreadNotifications) && (
                          <span className="badge bg-danger ms-2">
                            {notifications.filter(n => 
                              !n.read && 
                              n.notificationType !== 'appointment_approval' && 
                              n.notificationType !== 'appointment_rejection' &&
                              n.notificationType !== 'appointment_completion'
                            ).length || '!'}
                          </span>
                        )}
                      </div>
                    </Link>
                    <Link 
                      to={`/AppointmentHistory/${auth.currentUser?.uid}`}
                      onClick={handleAppointmentHistoryClick}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <FaHistory />History
                        </div>
                        {hasUnreadNotifications && (
                          <span className="badge bg-danger ms-2">
                            {notifications.filter(n => 
                              !n.read && 
                              (n.notificationType === 'appointment_approval' || 
                               n.notificationType === 'appointment_rejection' ||
                               n.notificationType === 'appointment_completion')
                            ).length || ''}
                          </span>
                        )}
                      </div>
                    </Link>
                    <Link 
                      to="/HistoricalAppointment"
                      onClick={handleMedicalRecordsClick}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                          <FaFolder /> Medical Records
                        {hasUnreadNotifications && (
                          <span className="badge bg-danger ms-2">
                            {notifications.filter(n => 
                              !n.read && 
                              n.notificationType === 'medical_records_update'
                            ).length || ''}
                          </span>
                        )}
                      </div>
                    </Link>
                    <a onClick={handleLogout}><FaSignOutAlt /> Logout</a>
                  </div>
                </div>
              )}
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Nav;
