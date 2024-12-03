import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './AppointmentForm.css'; 
import Navbar from '../Components/Global/Navbar_Main';
import 'bootstrap/dist/css/bootstrap.min.css';
import backgroudappointmentF from '../Components/Assets/FamilyPlanning_img2.jpg';
import { ToastContainer, toast } from 'react-toastify';
import { FaCalendarAlt, FaClock, FaListAlt } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

const ServiceSelectionModal = ({ isOpen, onClose, services, selectedPricingType, onSelectService, selectedPackage, selectedServices, setSelectedServices }) => {
  const [activeTab, setActiveTab] = useState('packages');
  
  if (!isOpen) return null;

  return (
    <div className="service-selection-modal">
      <div className="modal-content-selection">
        <div className="modal-header-selection">
          <h2>Select Services</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-tabs-selection">
          <button 
            className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            Packages
          </button>
          <button 
            className={`tab-btn ${activeTab === 'individual' ? 'active' : ''}`}
            onClick={() => setActiveTab('individual')}
          >
            Individual Services
          </button>
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
                      className="service-card"
                      onClick={() => onSelectService(service)}
                    >
                      <h3>{service.name}</h3>
                      <p>{service.description}</p>
                      <div className="service-price">
                        ₱{service[selectedPricingType].toLocaleString()}
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
                            <span className="total-amount" style={{ textAlign: 'right', paddingRight: '20px' }}>
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
                toast.warning("Please select at least one service");
                return;
              }
              onClose();
              toast.success(`Selected ${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''}`);
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
  const crud = firestore;

  const services = [
    { 
      name: "Maternity Care Package (OB-MANAGE)",
      withoutPH: 6500,
      PHBenefit: 4500,
      withPH: 2000,
      description: "Complete maternity care package including all services",
      isPackage: true,
      components: [
        {
          name: "Delivery Room",
          withoutPH: 2000,
          PHBenefit: 1500,
          withPH: 500
        },
        {
          name: "Room Rate",
          withoutPH: 1500,
          PHBenefit: 1000,
          withPH: 500
        },
        {
          name: "Drugs, Meds & Supplies",
          withoutPH: 1500,
          PHBenefit: 1000,
          withPH: 500
        },
        {
          name: "Assist Fee",
          withoutPH: 1000,
          PHBenefit: 700,
          withPH: 300
        },
        {
          name: "Professional Fee",
          withoutPH: 500,
          PHBenefit: 300,
          withPH: 200
        }
      ]
    },
    { 
      name: "Newborn Care Package (OB-MANAGE)",
      withoutPH: 5800,
      PHBenefit: 4000,
      withPH: 1800,
      description: "Complete newborn care package including monitoring and essential care services",
      isPackage: true,
      components: [
        {
          name: "Newborn Screening",
          withoutPH: 1800,
          PHBenefit: 1200,
          withPH: 600
        },
        {
          name: "Hearing Test",
          withoutPH: 1000,
          PHBenefit: 700,
          withPH: 300
        },
        {
          name: "BCG Vaccine",
          withoutPH: 1000,
          PHBenefit: 800,
          withPH: 200
        },
        {
          name: "Newborn Care Supplies",
          withoutPH: 1200,
          PHBenefit: 800,
          withPH: 400
        },
        {
          name: "Professional Fee",
          withoutPH: 800,
          PHBenefit: 500,
          withPH: 300
        }
      ]
    },
    { 
      name: "Normal Spontaneous Delivery (OB-MANAGE)",
      withoutPH: 24550,
      PHBenefit: 8450,
      withPH: 16100,
      description: "Complete normal delivery package including all essential services",
      isPackage: true,
      components: [
        {
          name: "Delivery Room",
          withoutPH: 2000,
          PHBenefit: 1500,
          withPH: 500
        },
        {
          name: "Room Rate",
          withoutPH: 2000,
          PHBenefit: 1500,
          withPH: 500
        },
        {
          name: "Drugs, Meds & Supplies",
          withoutPH: 2050,
          PHBenefit: 1570,
          withPH: 480
        },
        {
          name: "Assist Fee",
          withoutPH: 500,
          PHBenefit: 500,
          withPH: 0
        },
        {
          name: "Professional Fee",
          withoutPH: 18000,
          PHBenefit: 3380,
          withPH: 14620
        }
      ]
    },
    { 
      name: "Delivery Room",
      withoutPH: 2000,
      PHBenefit: 1500,
      withPH: 500,
      description: "Standard delivery room services"
    },
    { 
      name: "Room Rate",
      withoutPH: 1500,
      PHBenefit: 1000,
      withPH: 500,
      description: "Hospital room accommodation"
    },
    { 
      name: "Drugs, Meds & Supplies",
      withoutPH: 1500,
      PHBenefit: 1000,
      withPH: 500,
      description: "Essential medications and medical supplies"
    },
    { 
      name: "Assist Fee",
      withoutPH: 1000,
      PHBenefit: 700,
      withPH: 300,
      description: "Medical assistance services"
    },
    { 
      name: "Professional Fee",
      withoutPH: 500,
      PHBenefit: 300,
      withPH: 200,
      description: "Medical professional services"
    }
  ];

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
      
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
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
      toast.error("You have another appointment scheduled within 90 minutes of this time. Please choose a different time.");
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
      toast.error("You can only have up to 3 pending appointments per day. Please choose another date.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateForm()) {
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

      // Create or update appointments array
      const currentAppointments = userData.appointments || [];
      
      // Add new appointment to the array
      const updatedAppointments = [...currentAppointments, appointmentData];

      // Update user document
      await updateDoc(userRef, {
        appointments: updatedAppointments,
        latestAppointment: appointmentData
      });

      // Add to pending appointments collection
      const appointmentsRef = collection(firestore, 'pendingAppointments');
      await addDoc(appointmentsRef, {
        ...appointmentData,
        userId: userId
      });

      toast.success("Appointment scheduled successfully!");
      
      history.replace({
        pathname: '/UserProfile',
        state: { appointmentData: appointmentData, action: 'update' }
      });

    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handlePricingTypeChange = (e) => {
    const newPricingType = e.target.value;
    setSelectedPricingType(newPricingType);
    setSelectedPriceType(newPricingType);
    setSelectedServices([]); // Clear selected services when pricing type changes
    setTouchedFields(prev => ({ ...prev, pricingType: true }));
    
    // Log the selection for debugging
    console.log('Selected pricing type:', newPricingType);
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
        toast.error("Error loading user data");
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

  const handleRemoveService = (serviceName) => {
    setSelectedServices(selectedServices.filter(s => s.name !== serviceName));
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

  const handleServiceSelection = (selectedService) => {
    if (selectedService.isPackage) {
      // If a package is already selected, don't allow selecting another package
      if (selectedServices.some(s => s.isPackage)) {
        toast.warning("You can only select one package at a time. Please remove the current package first.");
        return;
      }
      // When selecting a package, keep individual services
      setSelectedServices(prev => [...prev, selectedService]);
    } else {
      // For individual services
      if (selectedServices.find(s => s.name === selectedService.name)) {
        toast.info("This service is already selected");
        return;
      }
      // Add the new service while keeping existing services
      setSelectedServices(prev => [...prev, selectedService]);
    }
  };

  const openServiceModal = () => {
    if (!selectedPricingType) {
      toast.warning("Please select a pricing type first");
      return;
    }
    setIsServiceModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="appointment-container">
        <div className="appointment-content">
          <div className="appointment-header">
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
              <div className="form-group">
                <label>Select Pricing Type</label>
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
              {selectedPricingType && (
                <div className="form-group">
                  <label>Services Selection</label>
                  <button 
                    type="button" 
                    className="select-services-btn"
                    onClick={openServiceModal}
                    style={{ 
                      background: 'linear-gradient(to right, #c557db, #8b2ba5)',
                      border: 'none',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      width: 'fit-content'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                    }}
                  >
                    <FaListAlt />
                    Select Services
                  </button>
                  
                  {selectedServices.length > 0 && (
                    <div className="selected-services-summary">
                      <h4>Selected Services:</h4>
                      <div className="selected-services-list">
                        {selectedServices.map((service, index) => (
                          <div key={index} className="selected-service-item">
                            <div className="service-info">
                              <span className="service-name">{service.name}</span>
                              <span className="service-price">
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
                        <div className="total-amount">
                          <strong>Total Amount:</strong>
                          <span>₱{calculateTotals()[selectedPricingType].toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                  onClick={() => {
                    console.log('Submit button clicked');
                    console.log('Current form state:', {
                      name: searchQuery.name,
                      email: searchQuery.email,
                      age: searchQuery.age,
                      date: searchQuery.date,
                      time: searchQuery.time,
                      message: searchQuery.message,
                      selectedPricingType,
                      servicesCount: selectedServices.length
                    });
                  }}
                >
                  {submitted ? 'Scheduling...' : 'Schedule Appointment'}
                </button>
              </div>
              {/* New section to display booked times */}
              {bookedTimes.length > 0 && (
                <div className="booked-times">
                  <h3>Already Booked Times</h3>
                  <ul className="booked-times-list">
                    {bookedTimes.map((time, index) => (
                      <li 
                        key={index} 
                        onClick={() => handleBookedTimeClick(time)}
                      >
                        {time}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {showTotals && (
                <div className="totals-popup">
                  <div className="totals-popup-content">
                    <button className="close-totals-btn" onClick={() => setShowTotals(false)}>×</button>
                    <h5>Total Breakdown</h5>
                    <div className="totals-list">
                      {selectedServices.map((service, index) => (
                        <div key={index} className="total-item">
                          <span>{service.name}</span>
                          <strong>
                            ₱{service[totalType].toLocaleString()}
                          </strong>
                        </div>
                      ))}
                      <div className="total-item grand-total">
                        <span>Grand Total</span>
                        <strong>
                          ₱{calculateTotals()[totalType].toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {showServiceBreakdown && (
                <div className="service-breakdown-modal">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5>Service Breakdown</h5>
                      <button 
                        type="button" 
                        className="close-modal"
                        onClick={() => setShowServiceBreakdown(null)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="modal-body">
                      {selectedServices.find(s => s.name === showServiceBreakdown)?.components?.map((component, idx) => (
                        <div key={idx} className="component-item">
                          <span>{component.name}</span>
                          <div className="component-price">
                            <span>₱{component[selectedPricingType].toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default AppointmentFillUp;
