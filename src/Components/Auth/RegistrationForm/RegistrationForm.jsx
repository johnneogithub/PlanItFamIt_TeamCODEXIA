// RegistrationForm.jsx
import React, { useState, useEffect } from "react";
import { addYears, subYears } from 'date-fns';

// Firebase Auth and Firestore
import { getFirestore, doc, runTransaction, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendEmailVerification } from "firebase/auth";

// React Router and Date Picker
import { useHistory, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Modals
import TermsAndConditionsModal from "./TermsAndConditionsModal";
import DataPrivacyPlanItFamIt from "./DataPrivacyPlanItFamIt";

// Assets
import background1 from '../../Assets/landing_page_bkg1.png';
import { FaFacebookF, FaEnvelope } from "react-icons/fa";

  function RegistrationForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [middleInitial, setMiddleInitial] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthdate, setBirthdate] = useState(null);

    // States for modals and agreements
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
    const [termsModalIsOpen, setTermsModalIsOpen] = useState(false);
    const [privacyModalIsOpen, setPrivacyModalIsOpen] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const history = useHistory();
    const location = useLocation();

    // Calculate Age Function moved outside of SignUp function
    const calculateAge = (birthdate) => {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--; // Adjust the age if the birthday hasn't occurred yet this year
        }
        return age;
    };

    // Open modals based on route path
    useEffect(() => {
        if (location.pathname === "/Register/TermsAndConditions") {
            setTermsModalIsOpen(true);
        } else {
            setTermsModalIsOpen(false);
        }

        if (location.pathname === "/Register/DataPrivacyAct") {
            setPrivacyModalIsOpen(true);
        } else {
            setPrivacyModalIsOpen(false);
        }
    }, [location.pathname]);

    // Open Terms and Conditions Modal
    const openTermsModal = (e) => {
        if (e) e.preventDefault();
        history.push("/Register/TermsAndConditions");
    };

    // Open Data Privacy Act Modal
    const openPrivacyModal = (e) => {
        if (e) e.preventDefault();
        history.push("/Register/DataPrivacyAct");
    };

    // Close Terms Modal and set agreement state
    const closeTermsModal = () => {
        setTermsModalIsOpen(false);
        history.replace("/Register");
    };

    const agreeToTerms = () => {
        setAgreedToTerms(true); // Set agreed state to true
        closeTermsModal();      // Close the modal
    };

    // Close Privacy Modal and set agreement state
    const closePrivacyModal = () => {
        setPrivacyModalIsOpen(false);
        history.replace("/Register");
    };

    const agreeToPrivacy = () => {
        setAgreedToPrivacy(true); // Set agreed state to true
        closePrivacyModal();      // Close the modal
    };

    // Toggle terms checkbox manually
    const handleTermsCheckboxChange = () => {
        setAgreedToTerms((prev) => !prev);
    };

    // Toggle privacy checkbox manually
    const handlePrivacyCheckboxChange = () => {
        setAgreedToPrivacy((prev) => !prev);
    };

    const SignUp = async (e) => {
        e.preventDefault();

        if (!birthdate) {
            alert("Please select your birthdate.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        if (!agreedToTerms || !agreedToPrivacy) {
            alert("You must agree to both Terms and Conditions and Data Privacy Act to register.");
            return;
        }

        const auth = getAuth();
        const firestore = getFirestore();

        try {
            const existingUser = await fetchSignInMethodsForEmail(auth, email);
            if (existingUser.length > 0) {
                alert("This email is already registered. Please use a different email.");
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Calculate age before saving to Firestore
            const age = calculateAge(birthdate);

            // Save user details to Firestore
            const userRef = doc(firestore, 'users', user.uid);
            await setDoc(userRef, {
                firstName: firstName,
                middleInitial: middleInitial,
                lastName: lastName,
                email: email,
                birthdate: birthdate.toISOString(),
                age: age, // Add the calculated age
                createdAt: new Date().toISOString(),
                // Add any other relevant fields
            });

            await sendEmailVerification(user);
            alert("A verification email has been sent. Please verify your email before logging in.");

            const userCountRef = doc(firestore, 'statistics', 'userCount');
            await runTransaction(firestore, async (transaction) => {
                const userCountDoc = await transaction.get(userCountRef);
                if (!userCountDoc.exists()) {
                    transaction.set(userCountRef, { count: 1 });
                } else {
                    const newCount = userCountDoc.data().count + 1;
                    transaction.update(userCountRef, { count: newCount });
                }
            });

            setRegistrationSuccess(true);
            setTimeout(() => {
                history.push("/Login");
            }, 2000);
        } catch (error) {
            console.error("Error registering user:", error.message);
            alert("Error during registration: " + error.message);
        }
    };

  return (
    <>
      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={termsModalIsOpen}
        onClose={closeTermsModal}
        onAgree={agreeToTerms}
      />

      {/* Data Privacy Act Modal */}
      <DataPrivacyPlanItFamIt
        isOpen={privacyModalIsOpen}
        onClose={closePrivacyModal}
        onAgree={agreeToPrivacy}
      />
      
      <div className="registration-section">
        <div className="container-fluid">
          <div className="row d-flex justify-content-center align-items-center">
            <div className="col-md-9 col-lg-6 col-xl-5">
              <img src={background1} className="img-fluid" alt="Log/Regis Illustration" />
            </div>

            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
              <form onSubmit={SignUp} className="registration-form">
                <div className="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
                  <p className="lead fw-normal mb-3 me-3">Register with us!</p>
                </div>

                {/* Email */}
                <div className="form-outline mb-8">
                  <label className="form-label">Email address</label>
                  <input type="email" className="form-control form-control-lg"
                    placeholder="Enter a valid email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} />
                </div>

  
                <div className="d-flex justify-content-between mb-3">
                  <div className="form-outline me-2">
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-control form-control-lg"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="form-outline me-2">
                    <label className="form-label">Middle Initial</label>
                    <input type="text" className="form-control form-control-lg"
                      placeholder="M.I. (Optional)"
                      value={middleInitial}
                      onChange={(e) => setMiddleInitial(e.target.value)} />
                  </div>
                  <div className="form-outline">
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-control form-control-lg"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                {/* Birthdate (Calendar Modal) */}
                <div className="form-outline mb-3">
                  <label className="form-label">Birthdate</label>
                  <DatePicker
                    selected={birthdate}
                    onChange={(date) => setBirthdate(date)}
                    dateFormat="MMMM d, yyyy"
                    className="form-control form-control-lg"
                    placeholderText="Select your birthdate"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={200}
                    maxDate={addYears(new Date(), 50)}
                    minDate={new Date(1900, 0, 1)}
                    dropdownMode="select"
                    isClearable
                    showMonthDropdown
                    peekNextMonth
                    onKeyDown={(e) => e.preventDefault()}
                    renderCustomHeader={({
                      date,
                      changeYear,
                      changeMonth,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled,
                    }) => (
                      <div className="custom-calendar-header">
                        <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                          {"<"}
                        </button>
                        <select
                          value={date.getFullYear()}
                          onChange={({ target: { value } }) => changeYear(value)}
                          className="year-dropdown"
                        >
                          {Array.from(
                            { length: 175 }, // 125 years past + 50 years future
                            (_, i) => new Date().getFullYear() + 50 - i
                          ).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                        <select
                          value={date.getMonth()}
                          onChange={({ target: { value } }) => changeMonth(value)}
                          className="month-dropdown"
                        >
                          {[
                            "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                          ].map((month, i) => (
                            <option key={month} value={i}>
                              {month}
                            </option>
                          ))}
                        </select>
                        <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                          {">"}
                        </button>
                      </div>
                    )}
                  />
                  {birthdate && (
                    <small className="text-muted">
                      Age: {calculateAge(birthdate)}
                    </small>
                  )}
                </div>

                {/* Password */}
                <div className="form-outline mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control form-control-lg"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} />
                </div>

                {/* Confirm Password */}
                <div className="form-outline mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-control form-control-lg"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        className="form-check-input me-2"
                        onChange={handleTermsCheckboxChange}
                      />
                      <label>
                        <a href="#" onClick={openTermsModal}>Terms and Conditions</a>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        checked={agreedToPrivacy}
                        className="form-check-input me-2"
                        onChange={handlePrivacyCheckboxChange}
                      />
                      <label>
                        <a href="#" onClick={openPrivacyModal}>Data Privacy Act of 2012</a>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="text-center text-lg-start mt-4 pt-2">
                  <button type="submit" className="btn-login" disabled={!agreedToTerms || !agreedToPrivacy}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>Register Now!</button>
                  <p className="small fw-bold mt-2 pt-1 mb-0">Already have an account? <a href="/Login"
                      className="link-danger">Login</a></p>
                </div>
              </form>
            </div>
          </div>
        </div>

        <footer className="footer-register bg-fotregister mt-auto">
          <div className="footer-content-register">
            <div className="text-white">
              Copyright © 2024 PlanItFamIt. All rights reserved. 
            </div>

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

      {registrationSuccess && <p style={{ color: 'green' }}>Successfully registered! Please check your email to verify your account.</p>}
    </>
  );
}

export default RegistrationForm;
