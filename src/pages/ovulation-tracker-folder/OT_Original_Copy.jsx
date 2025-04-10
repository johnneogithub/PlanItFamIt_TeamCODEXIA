import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../pages/ovulation-tracker-folder/OTDesignStyle.css";
import Navbar from "../../Components/Global/Navbar_Main";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faWeight, faRulerVertical } from '@fortawesome/free-solid-svg-icons';

import rightbgpic from '../../Components/Assets/AskingOT.png';
import leftbgpic from '../../Components/Assets/smartOTpic.png';
import btnpre from '../../Components/Assets/Magicpen.png';

const OvulationTracker = ({ height, weight }) => {
  const [formData, setFormData] = useState({
    firstMenstrualPeriod: '',
    lastMenstrualPeriod: '',
    predictionStartDate: '',
    predictionEndDate: '',
    height: height || '',
    weight: weight || '',
    bleedingIntensity: '',
    dischargeType: '',
  });
  const [menstrualDuration, setMenstrualDuration] = useState(null);  // Track the menstrual duration
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [predictedDate, setPredictedDate] = useState(null);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    // Handle date formatting explicitly
    if (name === "firstMenstrualPeriod" || name === "lastMenstrualPeriod") {
      const date = new Date(value);
      const formattedDate = date.toISOString().split("T")[0]; // Ensures YYYY-MM-DD format
      setFormData({ ...formData, [name]: formattedDate });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Function to calculate menstrual duration based on first and last menstrual dates
  const calculateMenstrualDuration = () => {
    if (formData.firstMenstrualPeriod && formData.lastMenstrualPeriod) {
      const firstDate = new Date(formData.firstMenstrualPeriod);
      const lastDate = new Date(formData.lastMenstrualPeriod);
      const duration = (lastDate - firstDate) / (1000 * 60 * 60 * 24) + 1; // Duration in days
      setMenstrualDuration(duration); // Update state with the calculated duration
    }
  };

  // Recalculate menstrual duration whenever dates change
  useEffect(() => {
    calculateMenstrualDuration();
  }, [formData.firstMenstrualPeriod, formData.lastMenstrualPeriod]);

  const validateDates = () => {
    const { firstMenstrualPeriod, lastMenstrualPeriod } = formData;
  
    if (!firstMenstrualPeriod || !lastMenstrualPeriod) return false;
  
    const firstDate = new Date(firstMenstrualPeriod);
    const lastDate = new Date(lastMenstrualPeriod);
    const today = new Date();
    const fourMonthsAgo = new Date(today.setMonth(today.getMonth() - 4));
  
    // Reset error before validation
    setError(null);
  
    // Check if dates are too far in the past
    if (firstDate < fourMonthsAgo || lastDate < fourMonthsAgo) {
      setError('Menstruation dates cannot be from more than four months ago.');
      return false;
    }
  
    // Check if the first date is today and the last date is in the future
    if (
      firstDate.toDateString() === new Date().toDateString() &&
      lastDate > new Date()
    ) {
      setError(
        'The first day of menstruation cannot be today with the last day in the future.'
      );
      return false;
    }
  
    // Check if the last date is before the first date
    if (lastDate < firstDate) {
      setError('The last day of menstruation cannot be before the first day.');
      return false;
    }
  
    return true;
  };  

  const validateForm = () => {
    const {
      firstMenstrualPeriod,
      lastMenstrualPeriod,
      height,
      weight,
      bleedingIntensity,
      dischargeType,
    } = formData;
  
    // Check if all fields are filled
    if (
      !firstMenstrualPeriod ||
      !lastMenstrualPeriod ||
      !height ||
      !weight ||
      !bleedingIntensity ||
      !dischargeType
    ) {
      setError('Please fill out all required fields.');
      return false;
    }
  
    // Check date-specific validations
    return validateDates();
  };
  
  const formatDateForDisplay = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
  
    if (!validateForm()) return; // Stop submission if validation fails
  
    try {
      const dataToSend = { ...formData, menstrualDuration };
      const response = await fetch('http://planitfamitovulationtracker.online/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(errorData.error || 'Unknown error occurred.');
      }
  
      const data = await response.json();
      setResults(data);
  
      if (data.peakOvulationDay) {
        setPredictedDate(new Date(data.peakOvulationDay));
      }
  
      if (data.firstDayOvulation && data.lastDayOvulation) {
        setFormData((prev) => ({
          ...prev,
          predictionStartDate: data.firstDayOvulation,
          predictionEndDate: data.lastDayOvulation,
        }));
      }
  
      setError(null);
    } catch (err) {
      console.error('Request failed:', err);
      setError(`Error making prediction: ${err.message}`);
    }
  };
  

  return (
    <div className="ot-page-container">
      <Navbar />
      <div className="ot-background-wrapper">
        <div className="ot-left-bg">
          <img src={leftbgpic} alt="Smart Ovulation Tracking" />
        </div>
        <div className="ot-right-bg">
          <img src={rightbgpic} alt="Ovulation Tracking Questions" />
        </div>
      </div>

      <div className="ot-container">
        <h1 className="ot-main-title">Know your next Ovulation Day!</h1>
        <p className="ot-subtitle">Be protected and secured, let us track your next ovulation date.</p>

        <div className="ot-tracker-grid">
          <div className="ot-date-card">
            <h2>Your next ovulation date</h2>
            <div className={`ot-date-circle ${results?.peakOvulationDay ? 'animate' : ''}`}>
              <div className="ot-date-content">
                {results?.peakOvulationDay ? (
                  <>
                    <span className="ot-day-text">
                      {new Date(results.peakOvulationDay).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="ot-date">
                      {new Date(results.peakOvulationDay).toLocaleDateString('en-US', { 
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="ot-year">
                      {new Date(results.peakOvulationDay).getFullYear()}
                    </span>
                  </>
                ) : (
                  <span className="ot-no-prediction">
                    Awaiting Prediction
                  </span>
                )}
              </div>
            </div>
            <div className="ot-date-range">
              <div className="ot-range-item">
                <span className="ot-range-label">Starts</span>
                <div className={`ot-date-display ot-date-start ${formData.predictionStartDate ? 'animate' : ''}`}>
                  {formatDateForDisplay(formData.predictionStartDate) || <span className="ot-pending-text">Pending...</span>}
                </div>
              </div>
              <div className="ot-range-item">
                <span className="ot-range-label">Ends</span>
                <div className={`ot-date-display ot-date-end ${formData.predictionEndDate ? 'animate' : ''}`}>
                  {formatDateForDisplay(formData.predictionEndDate) || <span className="ot-pending-text">Pending...</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="ot-menstruation-details">
            <div className="menstrual-input-card first-period">
              <label>Your first day of menstruation</label>
              <input 
                type="date" 
                name="firstMenstrualPeriod" 
                value={formData.firstMenstrualPeriod} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="menstrual-input-card last-period">
              <label>Your last day of menstruation</label>
              <input 
                type="date" 
                name="lastMenstrualPeriod" 
                value={formData.lastMenstrualPeriod} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="menstrual-input-card period-duration">
              <label>Total Days of menstruation</label>
              <input 
                type="text" 
                value={menstrualDuration || ''} 
                disabled 
              />
            </div>
          </div>
          <div className="ot-health-indicators">
            <div className="ot-indicators-row">
              <div className="ot-indicator-card">
                <h3 className="indicator-title">
                  <FontAwesomeIcon icon={faCalendarAlt} className="indicator-icon" />
                  <span className="indicator-text">Vaginal Discharge</span>
                </h3>
                <select name="dischargeType" value={formData.dischargeType} onChange={handleInputChange} className="ot-pink-select">
                  <option value="">Select Discharge Type</option>
                  <option value="1">No Discharge</option>
                  <option value="2">Creamy Discharge</option>
                  <option value="3">Sticky Discharge</option>
                  <option value="4">Spotting</option>
                  <option value="5">Clumpy White Discharge</option>
                  <option value="6">Gray Discharge</option>
                  <option value="7">Egg White Color Discharge</option>
                  <option value="8">Unusual Discharge</option>
                </select>
              </div>
              <div className="ot-indicator-card">
                <h3 className="indicator-title">
                  <FontAwesomeIcon icon={faWeight} className="indicator-icon" /> 
                  <span className="indicator-text">Period Flow</span>
                </h3>
                <select name="bleedingIntensity" value={formData.bleedingIntensity} onChange={handleInputChange} className="ot-purple-select">
                  <option value="">Select Period Flow</option>
                  <option value="1">Light</option>
                  <option value="2">Normal</option>
                  <option value="3">Heavy</option>
                  <option value="4">Unusual</option>
                </select>
              </div>
            </div>
          </div>

          <div className="ot-measurements">
            <div className="ot-measurements-wrapper">
              <div className="ot-measurement-item">
                <label className="measurement-label">
                  <FontAwesomeIcon icon={faWeight} className="measurement-icon" /> 
                  <span className="measurement-text">Weight</span>
                </label>
                <div className="ot-measurement-input">
                  <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="ot-input" />
                  <span className="ot-unit">kg</span>
                </div>
              </div>
              <div className="ot-measurement-item">
                <label className="measurement-label">
                  <FontAwesomeIcon icon={faRulerVertical} className="measurement-icon" /> 
                  <span className="measurement-text">Height</span>
                </label>
                <div className="ot-measurement-input">
                  <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="ot-input" />
                  <span className="ot-unit">cm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ot-bmi-display">
            <h3>Body Mass Index</h3>
            <div className="ot-bmi-result">
              {results?.bmi ? (
                <>
                  <div className="ot-bmi-value">{results.bmi} - {results.bmiCategory}</div>
                  <p className="ot-bmi-recommendation">
                    Your BMI is in the {results.bmiCategory.toLowerCase()} range<br/>
                    {results.bmiCategory === 'Normal' 
                      ? 'Keep maintaining a healthy lifestyle!'
                      : 'Consider consulting with a healthcare professional for guidance.'}
                  </p>
                </>
              ) : (
                <p className="ot-bmi-placeholder">
                  Fill in your height and weight to see your BMI
                </p>
              )}
            </div>
          </div>

          <button className="ot-predict-button " onClick={handleSubmit}>
            <img src={btnpre} alt="Predict Icon" className="icon" />
            <span>Predict my next ovulation</span>
          </button>
        </div>
      </div>
      <div className="ot-disclaimer">
          Disclaimer: As per professional advice, this tracker is not recommended for women having irregular menstruation.
          <span className="ot-credibility-link">See paper & tracker credibility.</span>
        </div>
    </div>
  );
};

export default OvulationTracker;
