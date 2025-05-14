
import { 
  addYears, 
  subYears 
} from 'date-fns';

import { 
  FaFacebookF, 
  FaEnvelope 
} from "react-icons/fa";

import "./RegistrationFormStyle.css";
import "react-datepicker/dist/react-datepicker.css";

import useRegistrationForm from './Hooks/useRegistration';
import usePasswordMatch from './Hooks/usePasswordMatch';
import DatePicker from "react-datepicker";
import TermsAndConditionsModal from "./TermsAndConditionsModal";
import DataPrivacyPlanItFamIt from "./DataPrivacyPlanItFamIt";
import background1 from '../../Assets/landing_page_bkg1.png';
import logo from '../../../Components/Assets/PlantItFamIt_Logo_v2.png'

  
  function RegistrationForm() {
    
    const {
      email, setEmail,
      password, setPassword,
      confirmPassword, setConfirmPassword,
      firstName, setFirstName,
      middleInitial, setMiddleInitial,
      lastName, setLastName,
      birthdate, setBirthdate,
      agreedToTerms, agreedToPrivacy,
      termsModalIsOpen, privacyModalIsOpen,
      registrationSuccess,
      openTermsModal, openPrivacyModal,
      closeTermsModal, agreeToTerms,
      closePrivacyModal, agreeToPrivacy,
      handleTermsCheckboxChange, handlePrivacyCheckboxChange,
      SignUp, calculateAge
    } = useRegistrationForm();

    const { error: passwordError } = usePasswordMatch(password, confirmPassword);

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
                <form onSubmit={SignUp} className="registration-form shadow-sm rounded p-5 px-5 ">
                <div className="text-center ">
                  <img src={logo} alt="PlanItFamIt Logo" className="logo-img" style={{ maxWidth: '280px' }} />
                </div>
                  <div className="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
                    <p className="lead fw-bold  text-center w-100">Register with us!</p>
                  </div>

                  {/* Email */}
                  <div className="form-outline mb-2">
                    <label className="form-label fw-semibold">Email address</label>
                    <input type="email" className="form-control form-control-lg"
                      placeholder="Enter a valid email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <div className="form-outline me-2">
                      <label className="form-label fw-semibold">First Name</label>
                      <input type="text" className="form-control form-control-lg"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="form-outline me-2">
                      <label className="form-label fw-semibold">Middle Initial</label>
                      <input type="text" className="form-control form-control-lg"
                        placeholder="M.I. (Optional)"
                        value={middleInitial}
                        onChange={(e) => setMiddleInitial(e.target.value)} />
                    </div>
                    <div className="form-outline">
                      <label className="form-label fw-semibold">Last Name</label>
                      <input type="text" className="form-control form-control-lg"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>

                  {/* Birthdate (Calendar Modal) */}
                  <div className="form-outline mb-2">
                    <label className="form-label fw-semibold">Birthdate</label>
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
                  <div className="form-outline mb-2">
                    <label className="form-label fw-semibold">Password</label>
                    <input type="password" className="form-control form-control-lg"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)} />
                  </div>

                  {/* Confirm Password */}
                  <div className="form-outline mb-2">
                    <label className="form-label fw-semibold">Confirm Password</label>
                    <input type="password" className="form-control form-control-lg"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>

                  {passwordError && (
                    <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                      {passwordError}
                    </div>
                  )}

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          className="form-check-input "
                          onChange={handleTermsCheckboxChange}
                        />
                        <label>
                          <a href="#" onClick={openTermsModal} style={{ color: '#8e44ad' }}>Terms and Conditions</a>
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
                          <a href="#" onClick={openPrivacyModal} style={{ color: '#8e44ad' }}>Data Privacy Act of 2012</a>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-3  ">
                    <button 
                      type="submit" 
                      className="btn-login w-100  " 
                      disabled={!agreedToTerms || !agreedToPrivacy}
                      style={{ 
                        borderRadius: '30px',
                        background: 'linear-gradient(to right, #6a11cb, #8e44ad)',
                        border: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Register Now!
                    </button>
                    <p className="fw-bold mt-2 mb-0">
                      Already have an account? <a href="/Login" className="link-danger" style={{ color: '#8e44ad' }}>Login</a>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
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

        {registrationSuccess && <p style={{ color: 'green' }}>Successfully registered! Please check your email to verify your account.</p>}
      </>
    );
  }

export default RegistrationForm;