import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import Modal from 'react-modal';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import "./PregnancyWheelLMPStyle.css";
import Sidebar from '../Global/Sidebar';
import { FaCalendarAlt, FaBaby, FaClock, FaArrowRight, FaFemale, FaHeartbeat, FaTimes } from 'react-icons/fa';

function PregnancyWheelLMP() {
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
    };
    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '0%',
            transform: 'translate(-50%, -50%)',
            width: 'fit-content',
            height: 'fit-content',
            minWidth: '300px', 
            minHeight: '300px', 
            padding: '0',
            border: 'none',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="main-content">
                <div className="content-wrapper">
                    <h1><FaBaby className="icon" /> Pregnancy Wheel</h1>
                    <div className="pregnancy-wheel-content">
                        <div className="input-column">
                            <div className="input-section">
                                <h2><FaCalendarAlt className="icon" /> Ultrasound Date</h2>
                                <div className="input-row">
                                    <button className="date-picker-btn" onClick={() => {setShowUsCalendar(!showUsCalendar); setShowLmpCalendar(false);}}>
                                        <FaCalendarAlt /> Select Date
                                    </button>
                                    <Modal isOpen={showUsCalendar} onRequestClose={() => setShowUsCalendar(false)} style={customStyles}>
                                        <div className="custom-datepicker-header">
                                            <h3>Select Ultrasound Date</h3>
                                            <button onClick={() => setShowUsCalendar(false)} className="close-modal-btn">
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
                                    <div className="input-group">
                                        <label htmlFor="us-weeks">Weeks:</label>
                                        <input id="us-weeks" className="input-field" type="number" value={USweeks} onChange={e => setUSweeks(e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="us-days">Days:</label>
                                        <input id="us-days" className="input-field" type="number" value={USdays} onChange={e => setUSdays(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="input-section">
                                <h2><FaFemale className="icon" /> Last Menstrual Period</h2>
                                <div className="input-row">
                                    <button className="date-picker-btn" onClick={() => {setShowLmpCalendar(!showLmpCalendar); setShowUsCalendar(false);}}>
                                        <FaCalendarAlt /> Select Date
                                    </button>
                                    <Modal isOpen={showLmpCalendar} onRequestClose={() => setShowLmpCalendar(false)} style={customStyles}>
                                        <div className="custom-datepicker-header">
                                            <h3>Select LMP Date</h3>
                                            <button onClick={() => setShowLmpCalendar(false)} className="close-modal-btn">
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
                                    <span className="date-display">{moment(LMP).format('MMMM Do YYYY')}</span>
                                </div>
                            </div>

                            <div className="input-section">
                                <h2><FaClock className="icon" /> Cycle Length: {cycle} days</h2>
                                <div className="slider-container">
                                    <input type="range" min="20" max="45" value={cycle} onChange={e => setCycle(e.target.value)} />
                                    <div className="slider-labels">
                                        <span>20</span>
                                        <span>45</span>
                                    </div>
                                </div>
                            </div>

                            <div className="input-section">
                                <h2><FaHeartbeat className="icon" /> Estimated Gestational Age: {EGA}</h2>
                                <div className="input-row">
                                    <div className="input-group">
                                        <label htmlFor="ega-weeks">Weeks:</label>
                                        <input id="ega-weeks" className="input-field" type="number" value={EGAweeks} onChange={e => setEGAweeks(e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="ega-days">Days:</label>
                                        <input id="ega-days" className="input-field" type="number" value={EGAdays} onChange={e => setEGAdays(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="results-column">
                            <div className="input-section">
                                <h2><FaClock className="icon" /> Important Dates</h2>
                                <div className="dates-grid">
                                    <div className="date-item">
                                        <h3><FaHeartbeat className="icon" /> Conception Date:</h3>
                                        <span className="date-display">{conceptionDate && conceptionDate.toDateString()}</span>
                                    </div>
                                    <div className="date-item">
                                        <h3><FaArrowRight className="icon" /> 2nd Trimester Starts:</h3>
                                        <span className="date-display">{secondTrimester && secondTrimester.toDateString()}</span>
                                    </div>
                                    <div className="date-item">
                                        <h3><FaArrowRight className="icon" /> 3rd Trimester Starts:</h3>
                                        <span className="date-display">{thirdTrimester && thirdTrimester.toDateString()}</span>
                                    </div>
                                    <div className="date-item">
                                        <h3><FaBaby className="icon" /> Estimated Due Date:</h3>
                                        <span className="date-display">{dueDate && dueDate.toDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="resetBtn" onClick={reset}>Reset</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PregnancyWheelLMP;
