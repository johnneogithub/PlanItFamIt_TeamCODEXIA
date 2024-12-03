import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './OTDesignStyle.css';
import Navbar from '../Components/Global/Navbar_Main';

import rightbgpic from '../Components/Assets/AskingOT.png';
import leftbgpic from '../Components/Assets/smartOTpic.png';

const OvulationTracker = () => {
  const [formData, setFormData] = useState({
    firstMenstrualPeriod: '',
    lastMenstrualPeriod: '',
    predictionStartDate: '',
    predictionEndDate: '',
    height: '',
    weight: '',
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

  const validateForm = () => {
    const { firstMenstrualPeriod, lastMenstrualPeriod, height, weight, bleedingIntensity, dischargeType } = formData;
    return firstMenstrualPeriod && lastMenstrualPeriod && height && weight && bleedingIntensity && dischargeType;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please fill out all the required inputs.');
      return;
    }
  
    try {
      // Include menstrualDuration in formData before sending to backend
      const dataToSend = { ...formData, menstrualDuration };

      const response = await fetch('http://127.0.0.1:5000/predict', {
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
      if (data.predicted_date) {
        setPredictedDate(new Date(data.predicted_date));
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
            <h2>Predicted Fertile Window</h2>
            <div className="ot-date-circle">
              <div className="ot-date-content">
                {predictedDate ? (
                  <>
                    <span className="ot-day-text">
                      {predictedDate.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="ot-date">
                      {predictedDate.toLocaleDateString('en-US', { 
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="ot-year">
                      {predictedDate.getFullYear()}
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
                <span>Starts</span>
                <input 
                  type="date" 
                  name="predictionStartDate" 
                  value={formData.predictionStartDate} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="ot-range-item">
                <span>Ends</span>
                <input 
                  type="date" 
                  name="predictionEndDate" 
                  value={formData.predictionEndDate} 
                  onChange={handleInputChange} 
                />
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
                <h3>Vaginal Discharge</h3>
                <select name="dischargeType" value={formData.dischargeType} onChange={handleInputChange} className="ot-pink-select">
                  <option value="">Pick here</option>
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
                <h3>Period Flow</h3>
                <select name="bleedingIntensity" value={formData.bleedingIntensity} onChange={handleInputChange} className="ot-purple-select">
                  <option value="">Pick here</option>
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
                <label>Weight</label>
                <div className="ot-measurement-input">
                  <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} />
                  <span>kg</span>
                </div>
              </div>
              <div className="ot-measurement-item">
                <label>Height</label>
                <div className="ot-measurement-input">
                  <input type="number" name="height" value={formData.height} onChange={handleInputChange} />
                  <span>cm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ot-bmi-display">
            <h3>Body Mass Index</h3>
            <div className="ot-bmi-result">
              {results && <div className="ot-bmi-value">{results.bmi} - {results.bmiCategory}</div>}
              <p className="ot-bmi-recommendation">Your BMI is in the normal range<br/>Keep maintaining a healthy lifestyle!</p>
            </div>
          </div>

          <button className="ot-predict-button" onClick={handleSubmit}>
            Predict my next ovulation
          </button>
        </div>

        <div className="ot-disclaimer">
          Disclaimer: As per professional advice, this tracker is not recommended for women having irregular menstruation.
          <span className="ot-credibility-link">See paper & tracker credibility.</span>
        </div>
      </div>
    </div>
  );
};

export default OvulationTracker;
