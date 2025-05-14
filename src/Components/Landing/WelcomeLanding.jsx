import React, { useState } from 'react';
import BkgVideo from '../../Components/Assets/Happy_family2.mp4';
import '../../Components/Landing/WelcomeLandingStyle.css';
import { FaFacebook } from 'react-icons/fa';
import Logo from '../../Components/Assets/PlantItFamIt_Logo.png';
import PageViewsCounter from '../Global/PageViewsCounter';
import { Link } from 'react-router-dom';

const WelcomeLanding = () => {
  const [showModal, setShowModal] = useState(false);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <>
      {showModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#8e44ad', marginBottom: '1rem' }}>Important Notice</h3>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              This application is exclusively designed for female users. We appreciate your interest, but we want to ensure you're aware of this requirement before proceeding with registration.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '20px',
                  border: '1px solid #8e44ad',
                  backgroundColor: 'white',
                  color: '#8e44ad',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Close
              </button>
              <Link
                to="/Register"
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: '#8e44ad',
                  color: 'white',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Continue to Register
              </Link>
            </div>
          </div>
        </div>
      )}

      <nav className='nav-container-WL'>
        <div className="Wlogo">
          <img className="WPlanitfamitlogo" src={Logo} alt="PlanItFamIt Logo" />
          <span>PlanItFamIt</span>
        </div>
        <div className="nav-items desktop-nav">
          <li className='login-style-css-WL'><a href="/Login">Login</a></li>
          <li className='register-style-css-WL'><a href="#" onClick={handleRegisterClick}>Register</a></li>
          <li>
            <a href="https://www.facebook.com/share/RhhfyxArwqdyi5cW/?mibextid=LQQJ4d" target="_blank" rel="noopener noreferrer">
              <FaFacebook size={30} />
            </a>
          </li>
        </div>
      </nav>

      <div className='overlay textured-bg'></div>
      <div className='videobg'>
        <video autoPlay loop muted
          style={{
            position: "absolute",
            width: "100%",
            left: "50%",
            top: "50%",
            height: "100%",
            objectFit: "cover",
            transform: "translate(-50%, -50%)",
            zIndex: "-2",
            opacity: .9,
          }}
        >
          <source src={BkgVideo} type="video/mp4" />
        </video>
      </div>

      <main>
        <div className='WelcomemsgHEAD'>
          <h1>Plan Today</h1>
          <h2>for a happier tomorrow</h2>
          <p> Welcome to PlanItFamIt! In partnership with St. Margaret Lying In Clinic, we offer premier 
          <br/> family planning services. Our platform features comprehensive planning tools, an 
          <br/> AI chatbot assistant, and seamless appointment scheduling to enhance your experience. 
          <br/> Start planning your family's future with us today.
          </p>
          <h3> "PlanItFamIt, your guide to family planning!"</h3>
        </div>
        <div className="mobile-nav">
          <a href="/Login" className="mobile-nav-button">Login</a>
          <a href="#" onClick={handleRegisterClick} className="mobile-nav-button">Register</a>
        </div>
      </main>

      <footer className='footerers-WL'>
        <div className="foot_container">
          <PageViewsCounter />
        </div>
      </footer>
    </>
  );
};

export default WelcomeLanding;
