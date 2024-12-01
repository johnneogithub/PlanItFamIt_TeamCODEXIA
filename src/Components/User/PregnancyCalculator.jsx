import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import Modal from 'react-modal';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import "./PregnancyCalculatorStyle.css";
import Navbar_Main from '../Global/Navbar_Main';
import { FaCalendarAlt, FaBaby, FaClock, FaArrowRight, FaFemale, FaHeartbeat, FaTimes, FaSave, FaTrash } from 'react-icons/fa';

function PregnancyCalculator() {
    const initialSavedCalculations = JSON.parse(localStorage.getItem('pregnancyCalculations')) || [];
    const [savedCalculations, setSavedCalculations] = useState(initialSavedCalculations);
    
    const [USweeks, setUSweeks] = useState("");
    const [USdays, setUSdays] = useState("");
    const [EGAweeks, setEGAweeks] = useState("");
    const [EGAdays, setEGAdays] = useState("");
    const [LMP, setLMP] = useState(new Date());
    const [USDate, setUSDate] = useState(new Date());
    const [cycle, setCycle] = useState(28);
    const [showLmpCalendar, setShowLmpCalendar] = useState(false);
    const [showUsCalendar, setShowUsCalendar] = useState(false);
    const [conceptionDate, setConceptionDate] = useState(null);
    const [secondTrimester, setSecondTrimester] = useState(null);
    const [thirdTrimester, setThirdTrimester] = useState(null);
    const [dueDate, setDueDate] = useState(null);
    const [EGA, setEGA] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [showResults, setShowResults] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [showSavedCalculations, setShowSavedCalculations] = useState(false);

    const reset = () => {
        setUSweeks("");
        setUSdays("");
        setEGAweeks("");
        setEGAdays("");
        setLMP(new Date());
        setUSDate(new Date());
        setCycle(28);
        setShowLmpCalendar(false);
        setShowUsCalendar(false);
        setConceptionDate(null);
        setSecondTrimester(null);
        setThirdTrimester(null);
        setDueDate(null);
        setEGA("");
        localStorage.removeItem('currentCalculation');
    };

    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '0%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '600px',
            height: 'auto',
            maxHeight: '90vh',
            padding: '0',
            border: 'none',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            overflow: 'auto'
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)'
        }
    };
    
    Modal.setAppElement('#root');

    useEffect(() => {
        const conception = new Date(LMP.getTime());
        conception.setDate(conception.getDate() + (cycle - 14));
        setConceptionDate(conception);
    
        const second = new Date(conception.getTime());
        second.setDate(second.getDate() + 14 * 7);
        setSecondTrimester(second);
    
        const third = new Date(conception.getTime());
        third.setDate(third.getDate() + 28 * 7);
        setThirdTrimester(third);
    
        const due = new Date(conception.getTime());
        due.setDate(due.getDate() + 40 * 7);
        setDueDate(due);
    }, [LMP, cycle]);

    useEffect(() => {
        if (USweeks !== "" && USdays !== "") {
            const ultrasoundDate = new Date(USDate.getTime());
            ultrasoundDate.setDate(ultrasoundDate.getDate() + parseInt(USweeks) * 7 + parseInt(USdays));
            const diffDays = Math.abs((ultrasoundDate.getTime() - LMP.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays > 5) {
                setLMP(ultrasoundDate);
            }
        }
    }, [USweeks, USdays, USDate, LMP]);

    useEffect(() => {
        const today = new Date();
        const diffTime = Math.abs(today - LMP);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        setEGA(Math.floor(diffDays/7) + " weeks and " + diffDays%7 + " days");
    }, [LMP]);

    useEffect(() => {
        if (EGAweeks !== "" && EGAdays !== "") {
            const today = new Date();
            const EGAdate = new Date(today.getTime());
            EGAdate.setDate(EGAdate.getDate() - (parseInt(EGAweeks) * 7 + parseInt(EGAdays)));
            setLMP(EGAdate);
        }
    }, [EGAweeks, EGAdays]);

    useEffect(() => {
        const storedCalculations = localStorage.getItem('pregnancyCalculations');
        if (storedCalculations) {
            setSavedCalculations(JSON.parse(storedCalculations));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('pregnancyCalculations', JSON.stringify(savedCalculations));
    }, [savedCalculations]);

    useEffect(() => {
        const currentCalc = {
            lmpDate: LMP.toDateString(),
            conceptionDate: conceptionDate?.toDateString(),
            secondTrimester: secondTrimester?.toDateString(),
            thirdTrimester: thirdTrimester?.toDateString(),
            dueDate: dueDate?.toDateString(),
            currentEGA: EGA
        };
        localStorage.setItem('currentCalculation', JSON.stringify(currentCalc));
    }, [LMP, conceptionDate, secondTrimester, thirdTrimester, dueDate, EGA]);

    useEffect(() => {
        const currentCalc = localStorage.getItem('currentCalculation');
        if (currentCalc) {
            const parsed = JSON.parse(currentCalc);
            setLMP(new Date(parsed.lmpDate));
            setConceptionDate(parsed.conceptionDate ? new Date(parsed.conceptionDate) : null);
            setSecondTrimester(parsed.secondTrimester ? new Date(parsed.secondTrimester) : null);
            setThirdTrimester(parsed.thirdTrimester ? new Date(parsed.thirdTrimester) : null);
            setDueDate(parsed.dueDate ? new Date(parsed.dueDate) : null);
            setEGA(parsed.currentEGA);
        }
    }, []);

    const saveCalculation = () => {
        const newCalculation = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            lmpDate: LMP.toDateString(),
            conceptionDate: conceptionDate?.toDateString(),
            secondTrimester: secondTrimester?.toDateString(),
            thirdTrimester: thirdTrimester?.toDateString(),
            dueDate: dueDate?.toDateString(),
            currentEGA: EGA
        };
        
        const existingCalculations = JSON.parse(localStorage.getItem('pregnancyCalculations')) || [];
        const updatedCalculations = [...existingCalculations, newCalculation];
        
        localStorage.setItem('pregnancyCalculations', JSON.stringify(updatedCalculations));
        setSavedCalculations(updatedCalculations);
        setShowResultsModal(false);
    };

    const deleteCalculation = (id) => {
        const existingCalculations = JSON.parse(localStorage.getItem('pregnancyCalculations')) || [];
        const updatedCalculations = existingCalculations.filter(calc => calc.id !== id);
        
        localStorage.setItem('pregnancyCalculations', JSON.stringify(updatedCalculations));
        setSavedCalculations(updatedCalculations);
    };

    const handleSliderChange = (e) => {
        const value = e.target.value;
        setCycle(value);
        
        const percentage = ((value - 20) / (45 - 20)) * 100;
        e.target.style.background = `linear-gradient(to right, rgb(197, 87, 219) 0%, rgb(197, 87, 219) ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`;
    };

    return (
        <div className="preg-calc-dashboard-container">
            <Navbar_Main />
            <div className="preg-calc-main-content preg-calc-user-view">
                <div className="preg-calc-content-wrapper">
                    <h1><FaBaby className="preg-calc-icon" /> Pregnancy Calculator</h1>
                    
                    <div className="preg-calc-pregnancy-wheel-content">
                        <div className="preg-calc-input-column">
                            <div className="preg-calc-input-section">
                                <h2><FaCalendarAlt className="preg-calc-icon" /> Ultrasound Date</h2>
                                <div className="preg-calc-input-row">
                                    <button className="preg-calc-date-picker-btn" onClick={() => {setShowUsCalendar(!showUsCalendar); setShowLmpCalendar(false);}}>
                                        <FaCalendarAlt /> Select Date
                                    </button>
                                    <Modal isOpen={showUsCalendar} onRequestClose={() => setShowUsCalendar(false)} style={customStyles}>
                                        <div className="pregnancy-modal-header">
                                            <h3>Select Ultrasound Date</h3>
                                            <button onClick={() => setShowUsCalendar(false)} className="pregnancy-modal-close-btn">
                                                <FaTimes />
                                            </button>
                                        </div>
                                        <DatePicker
                                            selected={USDate}
                                            onChange={(date) => {setUSDate(date); setShowUsCalendar(false);}}
                                            inline
                                            monthsShown={1}
                                            showYearDropdown
                                            dateFormatCalendar="MMMM"
                                            yearDropdownItemNumber={15}
                                            scrollableYearDropdown
                                        />
                                    </Modal>
                                    <div className="preg-calc-input-group">
                                        <label htmlFor="us-weeks">Weeks:</label>
                                        <input 
                                            id="us-weeks" 
                                            className="preg-calc-input-field" 
                                            type="number" 
                                            value={USweeks} 
                                            onChange={e => setUSweeks(e.target.value)}
                                            min="0"
                                            max="42"
                                        />
                                    </div>
                                    <div className="preg-calc-input-group">
                                        <label htmlFor="us-days">Days:</label>
                                        <input id="us-days" className="preg-calc-input-field" type="number" value={USdays} onChange={e => setUSdays(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="preg-calc-input-section">
                                <h2><FaFemale className="preg-calc-icon" /> Last Menstrual Period</h2>
                                <div className="preg-calc-input-row">
                                    <button className="preg-calc-date-picker-btn" onClick={() => {setShowLmpCalendar(!showLmpCalendar); setShowUsCalendar(false);}}>
                                        <FaCalendarAlt /> Select Date
                                    </button>
                                    <Modal isOpen={showLmpCalendar} onRequestClose={() => setShowLmpCalendar(false)} style={customStyles}>
                                        <div className="pregnancy-modal-header">
                                            <h3>Select LMP Date</h3>
                                            <button onClick={() => setShowLmpCalendar(false)} className="pregnancy-modal-close-btn">
                                                <FaTimes />
                                            </button>
                                        </div>
                                        <DatePicker
                                            selected={LMP}
                                            onChange={(date) => {setLMP(date); setShowLmpCalendar(false);}}
                                            inline
                                            monthsShown={1}
                                            showYearDropdown
                                            dateFormatCalendar="MMMM"
                                            yearDropdownItemNumber={15}
                                            scrollableYearDropdown
                                        />
                                    </Modal>
                                    <span className="preg-calc-date-display">{moment(LMP).format('MMMM Do YYYY')}</span>
                                </div>
                            </div>

                            <div className="preg-calc-input-section">
                                <h2><FaClock className="preg-calc-icon" /> Cycle Length: {cycle} days</h2>
                                <div className="preg-calc-slider-container">
                                    <input 
                                        type="range" 
                                        min="20" 
                                        max="45" 
                                        value={cycle} 
                                        onChange={handleSliderChange}
                                        style={{
                                            background: `linear-gradient(to right, rgb(197, 87, 219) 0%, rgb(197, 87, 219) ${((cycle - 20) / (45 - 20)) * 100}%, #e0e0e0 ${((cycle - 20) / (45 - 20)) * 100}%, #e0e0e0 100%)`
                                        }}
                                    />
                                    <div className="preg-calc-slider-labels">
                                        <span>20</span>
                                        <span>45</span>
                                    </div>
                                </div>
                            </div>

                            <div className="preg-calc-input-section">
                                <h2><FaHeartbeat className="preg-calc-icon" /> Estimated Gestational Age: {EGA}</h2>
                                <div className="preg-calc-input-row">
                                    <div className="preg-calc-input-group">
                                        <label htmlFor="ega-weeks">Weeks:</label>
                                        <input id="ega-weeks" className="preg-calc-input-field" type="number" value={EGAweeks} onChange={e => setEGAweeks(e.target.value)} />
                                    </div>
                                    <div className="preg-calc-input-group">
                                        <label htmlFor="ega-days">Days:</label>
                                        <input id="ega-days" className="preg-calc-input-field" type="number" value={EGAdays} onChange={e => setEGAdays(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="preg-calc-results-column">
                            <div className="preg-calc-button-group">
                                <button className="preg-calc-calculateBtn" onClick={() => {
                                    const today = new Date();
                                    const diffTime = Math.abs(today - LMP);
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                                    setEGA(Math.floor(diffDays/7) + " weeks and " + diffDays%7 + " days");
                                    setShowResultsModal(true);
                                }}>Calculate</button>
                                <button className="preg-calc-resetBtn" onClick={reset}>Reset</button>
                            </div>
                            
                            <div className="preg-calc-current-calculation">
                                <h2><FaHeartbeat className="preg-calc-icon" /> Current Calculation</h2>
                                <div className="preg-calc-calculation-card" style={{
                                    animation: 'fadeIn 0.5s ease-out'
                                }}>
                                    <div className="preg-calc-card-content">
                                        <p><strong>LMP Date:</strong> {LMP.toDateString()}</p>
                                        <p><strong>Conception Date:</strong> {conceptionDate?.toDateString()}</p>
                                        <p><strong>2nd Trimester:</strong> {secondTrimester?.toDateString()}</p>
                                        <p><strong>3rd Trimester:</strong> {thirdTrimester?.toDateString()}</p>
                                        <p><strong>Due Date:</strong> {dueDate?.toDateString()}</p>
                                        <p><strong>Current EGA:</strong> {EGA}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="preg-calc-saved-calculations-section">
                                <button 
                                    className="preg-calc-show-saved-btn"
                                    onClick={() => setShowSavedCalculations(!showSavedCalculations)}
                                >
                                    <FaSave className="preg-calc-icon" /> 
                                    Show Saved Calculations
                                    <span className="preg-calc-saved-count">{savedCalculations.length}</span>
                                </button>
                                
                                <Modal 
                                    isOpen={showSavedCalculations} 
                                    onRequestClose={() => setShowSavedCalculations(false)}
                                    style={{
                                        content: {
                                            top: '50%',
                                            left: '50%',
                                            right: 'auto',
                                            bottom: 'auto',
                                            transform: 'translate(-50%, -50%)',
                                            width: '90%',
                                            maxWidth: '1200px',
                                            height: '80vh',
                                            padding: '0',
                                            border: 'none',
                                            borderRadius: '20px',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                            overflow: 'auto'
                                        },
                                        overlay: {
                                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                            backdropFilter: 'blur(5px)'
                                        }
                                    }}
                                >
                                    <div className="pregnancy-modal-header">
                                        <h2><FaSave className="preg-calc-icon" /> Saved Calculations</h2>
                                        <button 
                                            className="pregnancy-modal-close-btn"
                                            onClick={() => setShowSavedCalculations(false)}
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                    <div className="pregnancy-modal-content">
                                        <div className="pregnancy-modal-grid">
                                            {savedCalculations.map(calc => (
                                                <div key={calc.id} className="preg-calc-calculation-card saved-card">
                                                    <div className="preg-calc-card-header">
                                                        <span className="preg-calc-calc-date">Saved on: {calc.date}</span>
                                                        <button 
                                                            className="preg-calc-delete-btn"
                                                            onClick={() => deleteCalculation(calc.id)}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                    <div className="preg-calc-card-content">
                                                        <div className="preg-calc-saved-info">
                                                            <div className="preg-calc-saved-item">
                                                                <FaCalendarAlt className="preg-calc-icon" />
                                                                <div>
                                                                    <label>LMP Date:</label>
                                                                    <span>{calc.lmpDate}</span>
                                                                </div>
                                                            </div>
                                                            <div className="preg-calc-saved-item">
                                                                <FaHeartbeat className="preg-calc-icon" />
                                                                <div>
                                                                    <label>Conception:</label>
                                                                    <span>{calc.conceptionDate}</span>
                                                                </div>
                                                            </div>
                                                            <div className="preg-calc-saved-item">
                                                                <FaArrowRight className="preg-calc-icon" />
                                                                <div>
                                                                    <label>2nd Trimester:</label>
                                                                    <span>{calc.secondTrimester}</span>
                                                                </div>
                                                            </div>
                                                            <div className="preg-calc-saved-item">
                                                                <FaArrowRight className="preg-calc-icon" />
                                                                <div>
                                                                    <label>3rd Trimester:</label>
                                                                    <span>{calc.thirdTrimester}</span>
                                                                </div>
                                                            </div>
                                                            <div className="preg-calc-saved-item">
                                                                <FaBaby className="preg-calc-icon" />
                                                                <div>
                                                                    <label>Due Date:</label>
                                                                    <span>{calc.dueDate}</span>
                                                                </div>
                                                            </div>
                                                            <div className="preg-calc-saved-item">
                                                                <FaClock className="preg-calc-icon" />
                                                                <div>
                                                                    <label>EGA at Save:</label>
                                                                    <span>{calc.currentEGA}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Modal>
                            </div>
                        </div>
                    </div>
                    <Modal 
                        isOpen={showResultsModal} 
                        onRequestClose={() => setShowResultsModal(false)}
                        style={customStyles}
                    >
                        <div className="pregnancy-modal-header">
                            <h3>Pregnancy Calculator Results</h3>
                            <button onClick={() => setShowResultsModal(false)} className="pregnancy-modal-close-btn">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="pregnancy-modal-content">
                            <div className="pregnancy-modal-grid">
                                <div className="preg-calc-date-item">
                                    <h3><FaHeartbeat className="preg-calc-icon" /> Conception Date:</h3>
                                    <span className="preg-calc-date-display">{conceptionDate && conceptionDate.toDateString()}</span>
                                </div>
                                <div className="preg-calc-date-item">
                                    <h3><FaArrowRight className="preg-calc-icon" /> 2nd Trimester Starts:</h3>
                                    <span className="preg-calc-date-display">{secondTrimester && secondTrimester.toDateString()}</span>
                                </div>
                                <div className="preg-calc-date-item">
                                    <h3><FaArrowRight className="preg-calc-icon" /> 3rd Trimester Starts:</h3>
                                    <span className="preg-calc-date-display">{thirdTrimester && thirdTrimester.toDateString()}</span>
                                </div>
                                <div className="preg-calc-date-item">
                                    <h3><FaBaby className="preg-calc-icon" /> Estimated Due Date:</h3>
                                    <span className="preg-calc-date-display">{dueDate && dueDate.toDateString()}</span>
                                </div>
                                <div className="preg-calc-date-item">
                                    <h3><FaHeartbeat className="preg-calc-icon" /> Current Gestational Age:</h3>
                                    <span className="preg-calc-date-display">{EGA}</span>
                                </div>
                            </div>
                            <div className="pregnancy-modal-actions">
                                <button className="pregnancy-modal-save-btn" onClick={saveCalculation}>
                                    <FaSave /> Save
                                </button>
                                <button className="pregnancy-modal-cancel-btn" onClick={() => setShowResultsModal(false)}>
                                    <FaTimes /> Cancel
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        </div>
    );
}

export default PregnancyCalculator; 