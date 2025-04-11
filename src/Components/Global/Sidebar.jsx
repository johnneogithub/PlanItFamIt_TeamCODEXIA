import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Clinic from '../Assets/stmargaretlogo.png';
import { FaHome, FaUserFriends, FaCalendarAlt, FaUser, FaBars, FaFile, FaTimes } from 'react-icons/fa';
import './SidebarStyle.css';

const Sidebar = ({ isAdmin }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <FaHome /> },
    { path: '/PatientsRecord', name: 'Patients Record', icon: <FaUserFriends /> },
    { path: '/PregnancyWheel', name: 'Pregnancy Wheel', icon: <FaCalendarAlt /> },
    { path: '/articles', name: 'Manage Articles', icon: <FaFile /> },
    { path: '/AdminLogin', name: 'Log Out', icon: <FaUser /> },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAdmin) return null;

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={toggleSidebar} />
      <nav className={`sidebar-admin ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={Clinic} alt="St. Margaret Clinic" className="clinic-logo" />
          <h3>St. Margaret Clinic</h3>
        </div>
        <ul className="nav-menu-admin">
          {menuItems.map((item) => (
            <li 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} 
              key={item.path}
            >
              <Link 
                className="nav-link" 
                to={item.path === '/articles' ? { pathname: item.path, state: { isAdmin: true } } : item.path} 
                onClick={() => window.innerWidth <= 991 && setIsSidebarOpen(false)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-title">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
