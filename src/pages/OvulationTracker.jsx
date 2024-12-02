import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './OTDesignStyle.css';

const OvulationTracker = () => {
  const [formData, setFormData] = useState({
    firstMenstrualPeriod: '',
    lastMenstrualPeriod: '',
    height: '',
    weight: '',
    bleedingIntensity: '',
    dischargeType: '',
  });
  const [menstrualDuration, setMenstrualDuration] = useState(null);  // Track the menstrual duration
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

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
      setError(null);
    } catch (err) {
      console.error('Request failed:', err);
      setError(`Error making prediction: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <form onSubmit={handleSubmit}>
          <input
            type="date"
            name="firstMenstrualPeriod"
            value={formData.firstMenstrualPeriod}
            onChange={handleInputChange}
          />
          <input
            type="date"
            name="lastMenstrualPeriod"
            value={formData.lastMenstrualPeriod}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="height"
            placeholder="Height (cm)"
            value={formData.height}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            value={formData.weight}
            onChange={handleInputChange}
          />
          <select name="bleedingIntensity" value={formData.bleedingIntensity} onChange={handleInputChange}>
            <option value="">Bleeding Intensity</option>
            <option value="1">Light</option>
            <option value="2">Normal</option>
            <option value="3">Heavy</option>
            <option value="4">Unusual</option>
          </select>
          <select name="dischargeType" value={formData.dischargeType} onChange={handleInputChange}>
            <option value="">Discharge Type</option>
            <option value="1">No Discharge</option>
            <option value="2">Creamy Discharge</option>
            <option value="3">Sticky Discharge</option>
            <option value="4">Spotting</option>
            <option value="5">Clumpy White Discharge</option>
            <option value="6">Gray Discharge</option>
            <option value="7">Egg White Color Discharge</option>
            <option value="8">Unusual Discharge</option>
          </select>
          <button type="submit">Predict Ovulation Day</button>
        </form>

        {error && <div className="error">{error}</div>}
        {results && (
          <div className="output-card bg-gradient rounded-lg p-4 mt-4">
            <h3 className="text-white mb-3">Results</h3>
            <p className="result-text mb-2">{`Ovulation Date: ${results.peakOvulationDay}`}</p>
            <div className="d-flex justify-content-between">
              <p className="result-text mb-2">{`First Day of Ovulation: ${results.firstDayOvulation}`}</p>
              <p className="result-text mb-2">{`Last Day of Ovulation: ${results.lastDayOvulation}`}</p>
            </div>
            <p className="result-text mb-2">{`BMI: ${results.bmi} (${results.bmiCategory})`}</p>
            <p className="result-text mb-2">{`Recommendation: ${results.recommendation}`}</p>
            <p className="result-text mb-2">{`Menstrual Duration: ${menstrualDuration ? menstrualDuration : "N/A"} days`}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OvulationTracker;
