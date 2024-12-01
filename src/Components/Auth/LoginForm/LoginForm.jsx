// LoginForm.jsx
import "../LoginForm/LoginFormStyle.css";
import { FaFacebookF, FaEnvelope } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { useHistory, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { useAuth } from '../../../AuthContext';
import { checkUserProfileCompletion } from "../../../Config/firebase";
import background1 from '../../Assets/landing_page_bkg1.png';

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const history = useHistory();
  const auth = getAuth();
  const { loginAsUser } = useAuth();

  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  const SignIn = async (e) => {
    e.preventDefault();
  
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
  
        if (!user.emailVerified) {
          alert("Please verify your email before logging in.");
          return;
        }
  
        loginAsUser(user);
  
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
  
        // Ensure that user.uid is passed and defined
        if (!user.uid) {
          console.error("User ID is undefined after login.");
          return;
        }
  
        // Redirect to /home regardless of profile completeness
        history.push("/home");
      })
      .catch((error) => {
        if (error.code === 'auth/user-not-found') {
          alert("No account found. Please register or verify your email.");
        } else if (error.code === 'auth/wrong-password') {
          alert("Incorrect password. Please try again.");
        } else {
          alert(`Login failed: ${error.message}`);
        }
      });
  };
  
  return (
    <div className="login-container">
      <section className="login-content">
        <div className="container-fluid h-custom">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-md-9 col-lg-6 col-xl-5 mb-4 mb-md-0">
              <Link to="/Welcome">
                <img src={background1} className="img-fluid" alt="Log/Regis Illustration" />
              </Link>
            </div>

            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
              <form onSubmit={SignIn} className="px-3 px-md-0">
                <div className="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
                  <p className="lead fw-normal mb-4 me-2 text-center text-lg-start">Welcome, login to your account!</p>
                </div>

                <div className="form-outline mb-4">
                  <label className="form-label" htmlFor="form3Example3">Email address</label>
                  <input
                    type="email"
                    id="form3Example3"
                    className="form-control form-control-lg"
                    placeholder="Enter a valid email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-outline mb-3">
                  <label className="form-label" htmlFor="form3Example4">Password</label>
                  <input
                    type="password"
                    id="form3Example4"
                    className="form-control form-control-lg"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center">
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
                  <a href="/Resetyourpassword" className="text-body">Forgot password?</a>
                </div>

                <div className="text-center text-lg-start mt-4 pt-2">
                  <button
                    type="submit"
                    className="btn-login w-100"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  >
                    Login
                  </button>
                  <p className="small fw-bold mt-2 pt-1 mb-0">
                    Don't have an account? <Link to="/Register" className="link-danger">Register</Link>
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
