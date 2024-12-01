import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './OTDesignStyle.css';

const OvulationTracker = () => {
  const [lastMenstrualPeriod, setLastMenstrualPeriod] = useState('');
  const [predictedDay, setPredictedDay] = useState(null);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;
    return formattedDate;
  };

  const calculateDaysBetween = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = end.getTime() - start.getTime();
    const daysBetween = Math.floor(difference / (1000 * 3600 * 24));
    return daysBetween;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('https://planitfamitovulationtracker.online/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          last_menstrual_period: lastMenstrualPeriod
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }
  
      const data = await response.json();
      setPredictedDay(formatDate(data.predicted_ovulation_day));
      setError(null);
    } catch (error) {
      console.error('Error making prediction:', error);
      setError('Error making prediction. Please check the console for more details.');
    }
  };
  
  return (
    <div className="app-container d-flex justify-content-center align-items-center min-vh-100">
      <div className="content-wrapper d-flex flex-column align-items-center w-100">
        <header className="header-ovu-trac mb-4">
          <nav className="d-flex justify-content-center">
            <div className="nav-item">
              <span className="nav-link active">Ovulation Tracker</span>
            </div>
            <div className="nav-item">
              <a href="/PlanItAssistant" className="nav-link">PlanIt Assistant</a>
            </div>
            <div className="nav-item">
              <a href="/Home" className="nav-link">Home</a>
            </div>
          </nav>
        </header>

        <main className="text-center mb-5">
          <h1 className="app-title mb-3">Know your next Ovulation Day!</h1>
          <p className="app-subtitle">Be protected and secured, let us track your next ovulation date.</p>
        </main>

        <div className="tracker-content bg-white rounded-lg shadow-lg p-5">
          <div className="row">
            <div className="col-md-6">
              <form onSubmit={handleSubmit} className="mb-4 mb-md-0">
                <div className="form-group mb-4">
                  <h2 className="text-left mb-3">Last Menstrual Period:</h2>
                  <input
                    type="date"
                    className="form-control form-control-lg"
                    value={lastMenstrualPeriod}
                    onChange={(e) => setLastMenstrualPeriod(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block">Predict Ovulation Day</button>
              </form>
            </div>
            <div className="col-md-6">
              <div className="output-card bg-gradient rounded-lg p-4 h-100">
                <h3 className="text-white mb-3">Your Ovulation Date</h3>
                {predictedDay && lastMenstrualPeriod ? (
                  <>
                    <p className="result-text mb-2">{`Ovulation Date: ${predictedDay}`}</p>
                    <p className="result-text mb-4">{`${calculateDaysBetween(lastMenstrualPeriod, predictedDay)} days until ovulation`}</p>
                    
                    <div className="source-text">
                      <small className='source-link-color'>
                        Source: <a href="https://scholar.smu.edu/datasciencereview/vol1/iss1/2/" target="_blank" rel="noopener noreferrer" className="text-black">Forecasting Ovulation for Family Planning</a>
                      </small>
                    </div>
                  </>
                ) : (
                  <p className="text-white">Enter your last menstrual period to see the prediction.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="disclaimer-card bg-light rounded-lg shadow-sm p-4 mt-5">
          <h4 className="mb-3">Disclaimer</h4>
          <p className="mb-0">As per professional advice, this tracker is not recommended for women having irregular menstruation.</p>
        </div>  
      </div>
    </div>
  );
};

export default OvulationTracker;
