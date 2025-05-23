import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './AppointmentForm.css'; 
import Navbar from '../Components/Global/Navbar_Main';
import 'bootstrap/dist/css/bootstrap.min.css';
import backgroudappointmentF from '../Components/Assets/FamilyPlanning_img2.jpg';
import { FaCalendarAlt, FaClock, FaListAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ServiceSelectionModal = ({ isOpen, onClose, services, selectedPricingType, onSelectService, selectedPackage, selectedServices, setSelectedServices }) => {
  const [activeTab, setActiveTab] = useState('packages');
  
  if (!isOpen) return null;

  return (
    <div className="service-selection-modal">
      <div className="modal-content-selection">
        <div className="modal-header-selection">
          <h2>Select Services</h2>
    
        
        <div className="modal-tabs-selection">
          <button 
            className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('packages');
            }}
          >
            Packages
          </button>
          <button 
            className={`tab-btn ${activeTab === 'individual' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('individual');
            }}
          >
            Others
          </button >
         
          </div>
     
          <button className="close-btn-fill" onClick={onClose}>×</button>
          {/* </div> */}
        </div>

        <div className="modal-body-selection">
          <div className="modal-grid">
            <div className="services-list">
              {activeTab === 'packages' ? (
                <div className="packages-grid">
                  {services.filter(s => s.isPackage).map((service, index) => (
                    <div 
                      key={index}
                      className={`package-card ${selectedPackage?.name === service.name ? 'selected' : ''}`}
                      onClick={() => onSelectService(service)}
                    >
                      <div className="package-header">
                        <h3>{service.name}</h3>
                        <div className="package-price">
                          ₱{service[selectedPricingType].toLocaleString()}
                        </div>
                      </div>
                      <div className="package-description">
                        {service.description}
                      </div>
                      <div className="package-components">
                        <h4>Includes:</h4>
                        <ul>
                          {service.components.map((component, idx) => (
                            <li key={idx}>
                              {component.name} - ₱{component[selectedPricingType].toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="individual-services-grid">
                  {services.filter(s => !s.isPackage).map((service, index) => (
                    <div 
                      key={index}
                      className={`service-card ${selectedServices.some(s => s.name === service.name) ? 'selected' : ''}`}
                      onClick={() => onSelectService(service)}
                    >
                      <div className="service-card-header">
                        <div className="service-title">
                          <i className="fas fa-heartbeat service-icon"></i>
                          <h3>{service.name}</h3>
                        </div>
                        {/* <div className="pricing-type-badge">
                          <i className="fas fa-tag"></i>
                          <span>
                            {selectedPricingType === 'withoutPH' && 'Without PhilHealth'}
                            {selectedPricingType === 'PHBenefit' && 'PhilHealth Benefit'}
                            {selectedPricingType === 'withPH' && 'With PhilHealth'}
                          </span>
                        </div> */}
                      </div>
                      <div className="service-card-body">
                        <p>{service.description}</p>
                        <div className="service-features">
                          <div className="feature-item">
                            <i className="fas fa-check-circle"></i>
                            <span>Professional Service</span>
                          </div>
                          <div className="feature-item">
                            <i className="fas fa-clock"></i>
                            <span>Flexible Schedule</span>
                          </div>
                        </div>
                      </div>
                      <div className="service-price-fill">
                        <div className="price-info">
                          <span className="price-label">Price</span>
                          <span className="price-amount">₱{service[selectedPricingType].toLocaleString()}</span>
                        </div>
                        {/* <button className="select-service-btn">
                          {selectedServices.some(s => s.name === service.name) ? 'Selected' : 'Select'}
                        </button> */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedServices.length > 0 && (
              <div className="selected-services-sidebar">
                <h3>Selected Services</h3>
                {selectedServices.map((service, index) => (
                  <div key={index} className="service-breakdown-container">
                    <div className="breakdown-header">
                      <h4>{service.name}</h4>
                      <div className="pricing-type-badge">
                        {selectedPricingType === 'withoutPH' && 'Without PhilHealth'}
                        {selectedPricingType === 'PHBenefit' && 'PhilHealth Benefit'}
                        {selectedPricingType === 'withPH' && 'With PhilHealth'}
                      </div>
                    </div>
                    {service.isPackage && (
                      <div className="service-components">
                        <div className="components-table">
                          <div className="table-header">
                            <div className="service-name-header">Service</div>
                            <div className="price-header" style={{ textAlign: 'right', paddingRight: '20px' }}>Amount</div>
                          </div>
                          {service.components.map((component, idx) => (
                            <div key={idx} className="component-row">
                              <div className="service-name">
                                {component.name}
                              </div>
                              <div className="price-column" style={{ textAlign: 'right', paddingRight: '20px' }}>
                                <span className="price-amount">₱{component[selectedPricingType].toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="package-summary">
                          <div className="summary-row">
                            <span className="summary-label">Number of Services:</span>
                            <span className="summary-value" style={{ textAlign: 'right' }}>{service.components.length}</span>
                          </div>
                          <div className="total-row">
                            <span className="total-label">
                              {selectedPricingType === 'withoutPH' && 'Total Amount (Without PhilHealth)'}
                              {selectedPricingType === 'PHBenefit' && 'Total PhilHealth Benefits'}
                              {selectedPricingType === 'withPH' && 'Final Amount (With PhilHealth)'}
                            </span>
                            <span className="total-amount-fill" style={{ textAlign: 'right', paddingRight: '20px' }}>
                              ₱{service[selectedPricingType].toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer-selection">
          <button 
            className="done-btn"
            onClick={() => {
              if (selectedServices.length === 0) {
                return;
              }
              onClose();
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};  

const AppointmentFillUp = () => {
  const [searchQuery, setSearchQuery] = useState({
    name: "",
    email: "",
    age: "",
    appointmentType: "",
    date: "",
    time: "",
    message: "",
  });

  const [availableTimes, setAvailableTimes] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const history = useHistory();
  const firestore = getFirestore();
  const auth = getAuth();
  const [bookedTimes, setBookedTimes] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [packagePrice, setPackagePrice] = useState({
    withPhilhealth: 0,
    withoutPhilhealth: 0
  });
  const [packageDetails, setPackageDetails] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchService, setSearchService] = useState('');
  const [showServices, setShowServices] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showTotals, setShowTotals] = useState(false);
  const [totalType, setTotalType] = useState(''); 
  const [selectedPriceType, setSelectedPriceType] = useState(null); 
  const [selectedPricingType, setSelectedPricingType] = useState('');
  const [showServiceBreakdown, setShowServiceBreakdown] = useState(null);
  const [isPackageHovered, setIsPackageHovered] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [services, setServices] = useState([]);
  const crud = firestore;

  const getFieldValidationClass = (fieldValue) => {
    return submitted && !fieldValue ? 'invalid-field' : '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery(prevState => ({
      ...prevState,
      [name]: value
    }));
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const shouldShowError = (fieldName, value) => {
    return (touchedFields[fieldName] || submitted) && !value;
  };

  const validateForm = () => {
    const validationResults = {
      name: !!searchQuery.name,
      email: !!searchQuery.email,
      age: !!searchQuery.age,
      date: !!searchQuery.date,
      time: !!searchQuery.time,
      message: !!searchQuery.message,
      pricingType: !!selectedPricingType,
      services: selectedServices.length > 0
    };

    if (!Object.values(validationResults).every(Boolean)) {
      const missingFields = Object.entries(validationResults)
        .filter(([_, value]) => !value)
        .map(([key]) => key);
       {missingFields.join(', ')}
      return false;
    }

    // Check for same-day overlapping appointments
    const selectedDateTime = new Date(`${searchQuery.date} ${searchQuery.time}`);
    const hasOverlap = appointmentHistory.some(appointment => {
      if (appointment.status === 'rejected' || appointment.status === 'completed') {
        return false;
      }
      
      const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
      
      // Only check for overlap if it's the same day
      if (appointmentDateTime.toDateString() === selectedDateTime.toDateString()) {
        const timeDiff = Math.abs(selectedDateTime - appointmentDateTime);
        const minutesDiff = timeDiff / (1000 * 60);
        return minutesDiff < 90; // 90 minutes minimum gap between appointments
      }
      return false;
    });

    if (hasOverlap) {
      return false;
    }

    // Check for maximum appointments per day
    const appointmentsOnSelectedDate = appointmentHistory.filter(appointment => {
      const appointmentDate = new Date(appointment.date).toDateString();
      const selectedDate = new Date(searchQuery.date).toDateString();
      return appointmentDate === selectedDate && 
             appointment.status !== 'rejected' && 
             appointment.status !== 'completed';
    });

    if (appointmentsOnSelectedDate.length >= 3) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const selectedDate = new Date(searchQuery.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error('Please select a future date for your appointment');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fill in all required fields and select at least one service');
      return;
    }

    try {
      const appointmentData = {
        ...searchQuery,
        selectedServices: selectedServices,
        selectedPricingType: selectedPricingType,
        totalAmount: calculateTotals(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const userId = auth.currentUser.uid;
      const userRef = doc(crud, `users/${userId}`);
      const docSnap = await getDoc(userRef);
      const userData = docSnap.exists() ? docSnap.data() : {};

      const currentAppointments = userData.appointments || [];
      const updatedAppointments = [...currentAppointments, appointmentData];

      await updateDoc(userRef, {
        appointments: updatedAppointments,
        latestAppointment: appointmentData
      });

      const appointmentsRef = collection(firestore, 'pendingAppointments');
      await addDoc(appointmentsRef, {
        ...appointmentData,
        userId: userId
      });
      
      toast.success('Appointment scheduled successfully!');
      
      history.replace({
        pathname: '/UserProfile',
        state: { appointmentData: appointmentData, action: 'update' }
      });

    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error('Failed to schedule appointment. Please try again.');
    }
  };

  const handleServiceSelection = (selectedService) => {
    if (selectedService.isPackage) {
      if (selectedServices.some(s => s.isPackage)) {
        toast.warning('You can only select one package at a time');
        return;
      }
      setSelectedServices(prev => [...prev, selectedService]);
      toast.success(`${selectedService.name} package added to your selection`);
    } else {
      if (selectedServices.find(s => s.name === selectedService.name)) {
        toast.warning('This service is already selected');
        return;
      }
      setSelectedServices(prev => [...prev, selectedService]);
      toast.success(`${selectedService.name} service added to your selection`);
    }
  };

  const handleRemoveService = (serviceName) => {
    setSelectedServices(selectedServices.filter(s => s.name !== serviceName));
    toast.info(`${serviceName} removed from your selection`);
  };

  const handlePricingTypeChange = (e) => {
    const newPricingType = e.target.value;
    setSelectedPricingType(newPricingType);
    setSelectedPriceType(newPricingType);
    setSelectedServices([]);
    setTouchedFields(prev => ({ ...prev, pricingType: true }));
    setIsServiceModalOpen(true);
    toast.info('Please select your services for the chosen pricing type');
  };

  useEffect(() => {
    if (searchQuery.date) {
      fetchAvailableTimes(searchQuery.date);
    } else {
      setAvailableTimes([]); // Reset available times when no date is selected
    }
  }, [searchQuery.date]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const userRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const birthDate = new Date(userData.birthdate);
          
          // Calculate age from birthdate
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          // Update form with user data
          setSearchQuery(prevState => ({
            ...prevState,
            name: `${userData.firstName} ${userData.middleInitial ? userData.middleInitial + ' ' : ''}${userData.lastName}`,
            email: userData.email,
            age: age.toString()
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [auth.currentUser, firestore]);

  useEffect(() => {
    const fetchAppointmentHistory = async () => {
      if (!auth.currentUser) return;

      try {
        const userRef = doc(crud, `users/${auth.currentUser.uid}`);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          let allAppointments = [];
          
          // Get current appointments
          if (userData.appointments) {
            allAppointments = [...userData.appointments];
          }
          
          // Get appointment history
          if (userData.appointmentHistory) {
            allAppointments = [...allAppointments, ...userData.appointmentHistory];
          }
          
          setAppointmentHistory(allAppointments);
        }
      } catch (error) {
        console.error("Error fetching appointment history:", error);
      }
    };

    fetchAppointmentHistory();
  }, [auth.currentUser]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesRef = collection(firestore, 'services');
        const snapshot = await getDocs(servicesRef);
        const servicesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to fetch services');
      }
    };

    fetchServices();
  }, [firestore]);

  const fetchAvailableTimes = async (date) => {
    try {
      const allTimes = generateTimeSlots();
      const booked = await getBookedTimes(date);
      
      // Filter out times that are too close to user's existing appointments
      const userBookedTimes = appointmentHistory
        .filter(appointment => 
          appointment.date === date && 
          appointment.status !== 'rejected' && 
          appointment.status !== 'completed'
        )
        .map(appointment => appointment.time);

      const available = allTimes.filter(time => {
        // Check if time is already booked
        if (booked.includes(time)) return false;

        // Check if time is too close to user's existing appointments
        const timeToCheck = new Date(`${date} ${time}`);
        return !userBookedTimes.some(bookedTime => {
          const existingTime = new Date(`${date} ${bookedTime}`);
          const timeDiff = Math.abs(timeToCheck - existingTime);
          const minutesDiff = timeDiff / (1000 * 60);
          return minutesDiff < 90;
        });
      });

      setAvailableTimes(available);
      setBookedTimes(booked);
    } catch (error) {
      console.error("Error fetching available times:", error);
      setAvailableTimes([]);
      setBookedTimes([]);
    }
  };

  const generateTimeSlots = () => {
    const times = [];
    for (let hour = 8; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const time = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        times.push(time);
      }
    }
    console.log("Generated time slots (12-hour format):", times); // Debug log
    return times;
  };

  const getBookedTimes = async (date) => {
    try {
      const firestore = getFirestore();
      const appointmentsRef = collection(firestore, 'pendingAppointments');
      const approvedAppointmentsRef = collection(firestore, 'approvedAppointments');
      
      const pendingQuery = query(appointmentsRef, where("date", "==", date));
      const approvedQuery = query(approvedAppointmentsRef, where("date", "==", date));
      
      const [pendingSnapshot, approvedSnapshot] = await Promise.all([
        getDocs(pendingQuery),
        getDocs(approvedQuery)
      ]);
      
      const pendingTimes = pendingSnapshot.docs.map(doc => doc.data().time);
      const approvedTimes = approvedSnapshot.docs.map(doc => doc.data().time);
      
      const bookedTimes = [...pendingTimes, ...approvedTimes];
      console.log("Booked times:", bookedTimes); // Debug log
      return bookedTimes;
    } catch (error) {
      console.error("Error getting booked times:", error);
      return []; // Return empty array in case of error
    }
  };
  
  const handleBookedTimeClick = (time) => {
    setAlertMessage(`The time ${time} is already booked. Please select another time.`);
    setShowAlert(true);
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  const calculateTotals = () => {
    return selectedServices.reduce((acc, service) => ({
      withoutPH: acc.withoutPH + service.withoutPH,
      PHBenefit: acc.PHBenefit + service.PHBenefit,
      withPH: acc.withPH + service.withPH
    }), { withoutPH: 0, PHBenefit: 0, withPH: 0 });
  };

  const handlePriceItemClick = (type) => {
    setSelectedPriceType(type === selectedPriceType ? null : type);
    setTotalType(type);
    setShowTotals(true);
  };

  const renderServiceComponents = (service) => {
    if (!service.components) return null;

    return (
      <div className="service-components">
        <h6>Package Breakdown:</h6>
        {service.components.map((component, idx) => (
          <div key={idx} className="component-item">
            <span>{component.name}</span>
            <div className="component-prices">
              {(!selectedPriceType || selectedPriceType === 'withoutPH') && (
                <div className="price-detail">
                  <small>W/O PhilHealth: </small>
                  <span>₱{component.withoutPH.toLocaleString()}</span>
                </div>
              )}
              {(!selectedPriceType || selectedPriceType === 'PHBenefit') && (
                <div className="price-detail benefit">
                  <small>PhilHealth Benefit: </small>
                  <span>₱{component.PHBenefit.toLocaleString()}</span>
                </div>
              )}
              {(!selectedPriceType || selectedPriceType === 'withPH') && (
                <div className="price-detail final">
                  <small>W/ PhilHealth: </small>
                  <span>₱{component.withPH.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const openServiceModal = () => {
    if (!selectedPricingType) {
      return;
    }
    setIsServiceModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="appointment-container-bg">
        <div className="appointment-content">
          <div className="appointment-header-fil-up">
            <h1>Make An Appointment</h1>
            <p>with St. Margaret Lying-in Clinic and take the first step towards a healthy and happy delivery.</p>
          </div>
          <div className="appointment-form">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    className="form-control"
                    type="text"
                    name="name"
                    value={searchQuery.name}
                    onChange={handleChange}
                    readOnly
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    className="form-control"
                    type="email"
                    name="email"
                    value={searchQuery.email}
                    onChange={handleChange}
                    readOnly
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    id="age"
                    className="form-control"
                    type="number"
                    name="age"
                    value={searchQuery.age}
                    onChange={handleChange}
                    readOnly
                    autoComplete="age"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Select Pricing Type & Services</label>
                <select
                  className={`form-control ${shouldShowError('pricingType', selectedPricingType) ? 'invalid-field' : ''}`}
                  value={selectedPricingType}
                  onChange={handlePricingTypeChange}
                >
                  <option value="">Choose your pricing type</option>
                  <option value="withoutPH">Without PhilHealth</option>
                  <option value="PHBenefit">PhilHealth Benefit</option>
                  <option value="withPH">With PhilHealth</option>
                </select>
                {shouldShowError('pricingType', selectedPricingType) && 
                  <div className="error-message">Please select a pricing type</div>
                }
              </div>

              {selectedServices.length > 0 && (
                <div className="selected-services-summary">
                  <h4>Selected Services:</h4>
                  <div className="selected-services-list">
                    {selectedServices.map((service, index) => (
                      <div key={index} className="selected-service-item">
                        <div className="service-info">
                          <span className="service-name">{service.name}</span>
                          <span className="service-price-fill">
                            ₱{service[selectedPricingType].toLocaleString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="remove-service-btn"
                          onClick={() => handleRemoveService(service.name)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <div className="total-amount-fill">
                      <strong>Total Amount:</strong>
                      <span>₱{calculateTotals()[selectedPricingType].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <div className="input-icon-wrapper">
                    <FaCalendarAlt className="input-icon" />
                    <input
                      id="date"
                      className={`form-control ${shouldShowError('date', searchQuery.date) ? 'invalid-field' : ''}`}
                      type="date"
                      name="date"
                      value={searchQuery.date}
                      onChange={handleChange}
                      autoComplete="off"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  {shouldShowError('date', searchQuery.date) && 
                    <div className="error-message">Please select a date</div>
                  }
                </div>
                <div className="form-group">
                  <label htmlFor="time">Available Times</label>
                  <div className="input-icon-wrapper">
                    <FaClock className="input-icon" />
                    <select
                      id="time"
                      className={`form-control ${shouldShowError('time', searchQuery.time) ? 'invalid-field' : ''}`}
                      name="time"
                      value={searchQuery.time}
                      onChange={handleChange}
                      disabled={!searchQuery.date}
                    >
                      <option value="">Select an available time</option>
                      {availableTimes.length > 0 ? (
                        availableTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No available times for this date</option>
                      )}
                    </select>
                  </div>
                  {shouldShowError('time', searchQuery.time) && 
                    <div className="error-message">Please select a time</div>
                  }
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Reason for Appointment / Additional Message</label>
                <textarea
                  id="message"
                  className={`form-control ${shouldShowError('message', searchQuery.message) ? 'invalid-field' : ''}`}
                  name="message"
                  value={searchQuery.message}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Please provide any additional information or specific concerns"
                ></textarea>
                {shouldShowError('message', searchQuery.message) && 
                  <div className="error-message">Please provide a reason for the appointment</div>
                }
              </div>

              <div className="form-group">
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={!searchQuery.name || 
                           !searchQuery.email || 
                           !searchQuery.age || 
                           !searchQuery.date || 
                           !searchQuery.time || 
                           !searchQuery.message || 
                           !selectedPricingType || 
                           selectedServices.length === 0}
                >
                  {submitted ? 'Scheduling...' : 'Schedule Appointment'}
                </button>
              </div>

              <ServiceSelectionModal 
                isOpen={isServiceModalOpen}
                onClose={() => setIsServiceModalOpen(false)}
                services={services}
                selectedPricingType={selectedPricingType}
                onSelectService={(service) => {
                  handleServiceSelection(service);
                }}
                selectedPackage={selectedPackage}
                selectedServices={selectedServices}
                setSelectedServices={setSelectedServices}
              />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentFillUp;
