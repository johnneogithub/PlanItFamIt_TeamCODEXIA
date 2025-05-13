import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../pages/ovulation-tracker-folder/OTDesignStyle.css";
import Navbar from "../../Components/Global/Navbar_Main";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faWeight, faRulerVertical } from '@fortawesome/free-solid-svg-icons';

import rightbgpic from '../../Components/Assets/AskingOT.png';
import leftbgpic from '../../Components/Assets/smartOTpic.png';
import btnpre from '../../Components/Assets/Magicpen.png';
import useOvulationPrediction from "./hooks/useOvulationPrediction";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const [menstrualDuration, setMenstrualDuration] = useState(null);
  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "firstMenstrualPeriod" || name === "lastMenstrualPeriod") {
      const date = new Date(value);
      const formattedDate = date.toISOString().split("T")[0];
      setFormData({ ...formData, [name]: formattedDate });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const predictOvulation = useOvulationPrediction(formData, setResults, setFormData);

  useEffect(() => {
    if (formData.firstMenstrualPeriod && formData.lastMenstrualPeriod) {
      const firstDate = new Date(formData.firstMenstrualPeriod);
      const lastDate = new Date(formData.lastMenstrualPeriod);
      const duration = (lastDate - firstDate) / (1000 * 60 * 60 * 24) + 1;
      setMenstrualDuration(duration);
    }
  }, [formData.firstMenstrualPeriod, formData.lastMenstrualPeriod]);

  const formatDateForDisplay = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <ToastContainer/>

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
          <h1 className="ot-main-title">Know your Ovulation Phase!</h1>
          <p className="ot-subtitle">Ensure your health and safety by accurately tracking your ovulation phase.</p>

          <div className="ot-tracker-grid">
            <div className="ot-date-card">
              <h2>Ovulation Date</h2>
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
                    <span className="ot-no-prediction">Awaiting Prediction</span>
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
                  <h3 className="indicator-title">
                    <FontAwesomeIcon icon={faWeight} className="indicator-icon" /> 
                    <span className="indicator-text">Period Flow</span>
                  </h3>
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

            <button className="ot-predict-button" onClick={() => predictOvulation()}>
              <img src={btnpre} alt="Predict Icon" className="icon" />
              <span>Predict Ovulation</span>
            </button>
          </div>
        </div>

        <div className="ot-disclaimer">
          Disclaimer: As per professional advice, this tracker is not recommended for women having irregular menstruation.
          <span className="ot-credibility-link">See paper & tracker credibility.</span>
        </div>
      </div>
    </>
  );
};

export default OvulationTracker;