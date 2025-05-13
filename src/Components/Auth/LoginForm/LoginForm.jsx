import { 
  FaFacebookF, 
  FaEnvelope, 
  FaEye, 
  FaEyeSlash  
} from "react-icons/fa";

import { Link } from 'react-router-dom';
import { useState } from 'react';

import useLoginForm from "./Hooks/useLoginForm";
import background1 from '../../Assets/landing_page_bkg1.png';
import logo from '../../../Components/Assets/PlantItFamIt_Logo_v2.png';
import { ToastContainer } from "react-toastify";

import 'react-toastify/dist/ReactToastify.css';
import "../LoginForm/LoginFormStyle.css";

function LoginForm() {
  const [showModal, setShowModal] = useState(false);
  const {
    email, setEmail,
    password, setPassword,
    rememberMe, setRememberMe,
    showPassword, toggleShowPassword,
    SignIn
  } = useLoginForm();
  
  const handleRegisterClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <div className="login-container">
      <ToastContainer />
      {/* Modal */}
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
      <section className="login-content">
        <div className="container-fluid h-custom">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-md-9 col-lg-6 col-xl-5 mb-4 mb-md-0">
              <Link to="/Welcome">
                <img src={background1} className="img-fluid" alt="Log/Regis Illustration" />
              </Link>
            </div>

            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
              
              <form onSubmit={SignIn} className="login-form px-5 p-5 shadow-sm rounded">
              <div className="text-center">
                <img src={logo} alt="PlanItFamIt Logo" className="logo-img" style={{ maxWidth: '280px' }} />
              </div>
                <div className="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
                  <p className="lead fw-bold mb-4 me-2 text-center w-100">
                  Welcome, login to your account!</p>
                </div>

                <div className="form-outline mb-4">
                  <label className="form-label fw-semibold" htmlFor="form3Example3">Email address</label>
                  <input
                    type="email"
                    id="form3Example3"
                    className="form-control form-control-lg"
                    placeholder="Enter a valid email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-outline mb-3 position-relative">
                  <label className="form-label fw-semibold" htmlFor="form3Example4">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="form3Example4"
                    className="form-control form-control-lg"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    onClick={toggleShowPassword}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "15px",
                      transform: "translateY(15%)",
                      cursor: "pointer",
                      color: "#888"
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>


                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check mb-0">
                    <input
                      className="form-check-input me-2"
                      type="checkbox"
                      id="form2Example3"
                      onChange={() => setRememberMe(!rememberMe)}
                      checked={rememberMe}
                    />
                    <label className="form-check-label" htmlFor="form2Example3">Remember me</label>
                  </div>
                  <a href="/Resetyourpassword" className="text-body fw-semibold">Forgot password?</a>
                </div>

                <div className="text-center mt-4 pt-2">
                  <button
                    type="submit"
                    className="btn-login w-100 py-2 fw-bold"
                    style={{ 
                      borderRadius: '30px',
                      background: 'linear-gradient(to right, #6a11cb, #8e44ad)',
                      border: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Login
                  </button>
                  <p className="fw-bold mt-3 mb-0">
                    Don't have an account? <a href="#" onClick={handleRegisterClick} className="link-danger" style={{ color: '#8e44ad' }}>Register</a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer-login bg-fotlogin">
        <div className="footer-content-login">
          <div className="text-white">Copyright © 2024 PlanItFamIt. All rights reserved.</div>
          <div>
            <a href="https://www.facebook.com" className="text-white me-4" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="mailto:codexia.info@planitfamit.com" className="text-white me-4">
              <FaEnvelope />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LoginForm;
