import '../../pages/HomeStyle.css';
import { Link, useHistory } from 'react-router-dom';
import humber from '../Assets/hamburger.png';
import iconyou from '../Assets/icon_you.png';
import React, { useState, useEffect } from 'react';
import { auth, crud } from '../../Config/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { FaUser, FaSignOutAlt, FaBell, FaHistory, FaFolder } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';

function Nav() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [historyNotifications, setHistoryNotifications] = useState(0);
  const [recordsNotifications, setRecordsNotifications] = useState(0);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const { logout } = useAuth();
  const history = useHistory();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen && notifications > 0) {
      setNotifications(0);
    }
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

  const handleViewNotifications = () => {
    const user = auth.currentUser;
    if (user) {
      localStorage.setItem(`lastChecked_${user.uid}`, new Date().toISOString());
      localStorage.setItem(`lastAppointmentCount_${user.uid}`, appointmentHistory.length.toString());
      setNotifications(0);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(crud, `users/${user.uid}`);
        
        const unsubscribeDoc = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setUserProfilePic(data.profilePicture || '');
            
            const appointmentData = data.appointmentData;
            const currentAppointmentHistory = data.appointmentHistory || [];
            const currentMedicalRecords = data.medicalRecords || [];
            setAppointmentHistory(currentAppointmentHistory);
            setMedicalRecords(currentMedicalRecords);
            
            const lastCheckedTimestamp = localStorage.getItem(`lastChecked_${user.uid}`);
            const lastCheckedAppointments = parseInt(localStorage.getItem(`lastAppointmentCount_${user.uid}`) || '0');
            const lastCheckedRecords = parseInt(localStorage.getItem(`lastRecordsCount_${user.uid}`) || '0');
            
            let newNotifications = 0;
            let newHistoryNotifs = 0;
            let newRecordsNotifs = 0;
            
            if (appointmentData?.remark && appointmentData?.remarkTimestamp && 
                (!lastCheckedTimestamp || new Date(appointmentData.remarkTimestamp) > new Date(lastCheckedTimestamp))) {
              newNotifications++;
            }
            
            if (currentAppointmentHistory.length > lastCheckedAppointments) {
              const newAppts = currentAppointmentHistory.length - lastCheckedAppointments;
              newNotifications += newAppts;
              newHistoryNotifs += newAppts;
            }

            if (currentMedicalRecords.length > lastCheckedRecords) {
              const newRecords = currentMedicalRecords.length - lastCheckedRecords;
              newNotifications += newRecords;
              newRecordsNotifs += newRecords;
            }
            
            setNotifications(newNotifications);
            setHistoryNotifications(newHistoryNotifs);
            setRecordsNotifications(newRecordsNotifs);
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
    setNotifications(0);
    setHistoryNotifications(0);
    setRecordsNotifications(0);
    setAppointmentHistory([]);
    setMedicalRecords([]);
  };

  return (
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
            {notifications > 0 && (
              <span className="notification-badge">
                {notifications}
              </span>
            )}
            {dropdownOpen && (
              <div className="dropdown1">
                <div className="dropdown-content1">
                  <Link to="/UserProfile" onClick={handleViewNotifications}>
                    <FaUser /> Profile
                    {notifications > 0 && (
                      <span className="notification-indicator">
                        {notifications} new
                      </span>
                    )}
                  </Link>
                  <Link to={`/AppointmentHistory/${auth.currentUser?.uid}`} onClick={() => {
                    const user = auth.currentUser;
                    if (user) {
                      localStorage.setItem(`lastAppointmentCount_${user.uid}`, appointmentHistory.length.toString());
                      setHistoryNotifications(0);
                    }
                  }}>
                    <FaHistory /> Appointment History
                    {historyNotifications > 0 && (
                      <span className="notification-indicator">
                        {historyNotifications} new
                      </span>
                    )}
                  </Link>
                  <Link to="/HistoricalAppointment" onClick={() => {
                    const user = auth.currentUser;
                    if (user) {
                      localStorage.setItem(`lastRecordsCount_${user.uid}`, medicalRecords.length.toString());
                      setRecordsNotifications(0);
                    }
                  }}>
                    <FaFolder /> Medical Records
                    {recordsNotifications > 0 && (
                      <span className="notification-indicator">
                        {recordsNotifications} new
                      </span>
                    )}
                  </Link>
                  <a onClick={handleLogout}><FaSignOutAlt /> Logout</a>
                </div>
              </div>
            )}
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Nav;
