import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import './CheckHealthStyle.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Make sure this line is included
import Navbar from '../Components/Global/Navbar_Main';
import Footer from '../Components/Global/Footer';
import Cover from '../Components/Assets/type-user.png';

const Type = () => {
    const history = useHistory();

    const handleAppointmentClick = () => {
      history.push('/FillUpAppointment'); 
    };

    const handleGetDirections = () => {
        const address = encodeURIComponent("74 E 20th St, East Bajac Bajac, Olongapo, Philippines");
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
    };

    return (
    <>
    <Navbar/>

    <section className="hero" style={{
      backgroundImage: 'url("https://images.unsplash.com/photo-1531983412531-1f49a365ffed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '5rem 0',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,  
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
      }}></div>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <h1 className="display-3 mb-3 font-weight-bold" style={{ color: 'white' }}>
          St. Margaret Lying In Clinic
        </h1>
        <p className="lead mb-4" style={{ color: 'white' }}>Compassionate care for mothers and babies</p>
        <button 
          className="btn btn-lg mt-3 shadow-sm" 
          onClick={handleAppointmentClick}
          style={{
            backgroundColor: 'rgb(197, 87, 219)',
            color: 'white',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(177, 67, 199)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(197, 87, 219)'}
        >
          <i className="bi bi-calendar-check me-2"></i> Book an Appointment
        </button>
      </div>
    </section>

    <section className="welcome py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h2 className="mb-4" style={{color: 'rgb(197, 87, 219)'}}>
              Welcome to St. Margaret Lying In Clinic
            </h2>
            <p>
              We are thrilled to be a part of your journey through the miracle of life. 
              As a dedicated pregnancy care center, we are committed to providing comprehensive and compassionate care.
            </p>
            <p>
              Partnered with the innovative family planning application, PlanItFamIt, we aim to empower and support you in every step 
              of your family planning journey. Together, let's celebrate the joy of parenthood!
            </p>
            <Link to="/Aboutus" className="btn mt-3" style={{color: 'rgb(197, 87, 219)', borderColor: 'rgb(197, 87, 219)'}}>
              <i className="bi bi-info-circle me-2"></i> Learn More
            </Link>
          </div>
          <div className="col-lg-6 mt-4 mt-lg-0">
            <img src={Cover} alt="Mother and Baby" className="img-fluid rounded shadow-lg" />
          </div>
        </div>
      </div>
    </section>

    <section className="services bg-light py-5">
      <div className="container">
        <h2 className="text-center mb-5" style={{color: 'rgb(197, 87, 219)'}}>
          <i className="bi bi-heart-pulse me-3"></i> Our Services
        </h2>
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow hover-shadow transition">
              <div className="card-body text-center">
                <h5 className="card-title"><i className="bi bi-heart-pulse me-2"></i> Maternity Care Package</h5>
                <ul className="list-unstyled">
                  <li><i className="bi bi-check2-circle me-2"></i>DELIVERY ROOM</li>
                  <li><i className="bi bi-check2-circle me-2"></i>ROOM RATE</li>
                  <li><i className="bi bi-check2-circle me-2"></i>DRUGS, MEDS & SUPPLIES</li>
                  <li><i className="bi bi-check2-circle me-2"></i>ASSISTANT FEE</li>
                  <li><i className="bi bi-check2-circle me-2"></i>PROFESSIONAL FEE</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow hover-shadow transition">
              <div className="card-body text-center">
                <h5 className="card-title"><i className="bi bi-stars me-2"></i> Newborn Care Package</h5>
                <ul className="list-unstyled">
                  <li><i className="bi bi-check2-circle me-2"></i>NEWBORN CARE PACKAGE (RM/OB)</li>
                  <li><i className="bi bi-check2-circle me-2"></i>NEWBORN SCREENING</li>
                  <li><i className="bi bi-check2-circle me-2"></i>NEWBORN HEARING SCREENING</li>
                  <li><i className="bi bi-check2-circle me-2"></i>PROFFESIONAL FEE</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow hover-shadow transition">
              <div className="card-body text-center">
                <h5 className="card-title"><i className="bi bi-clipboard2-pulse me-2"></i> Normal Spontaneous Delivery </h5>
                <ul className="list-unstyled">
                  <li><i className="bi bi-check2-circle me-2"></i>DELIVERY ROOM</li>
                  <li><i className="bi bi-check2-circle me-2"></i>ROOM RATE</li>
                  <li><i className="bi bi-check2-circle me-2"></i>DRUGS, MEDS & SUPPLIES</li>
                  <li><i className="bi bi-check2-circle me-2"></i>ASSISTANT FEE</li>
                  <li><i className="bi bi-check2-circle me-2"></i>PROFESSIONAL FEE</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="location py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h2 className="mb-4" style={{color: 'rgb(197, 87, 219)'}}>
              <i className="bi bi-geo-alt-fill me-3"></i> Our Location
            </h2>
            <p className="lead">
              We extend a warm welcome to you at our clinic located at:
            </p>
            <p className="font-weight-bold">
              74 E 20th St, East Bajac Bajac, Olongapo, Philippines
            </p>
            <p>
              Our dedicated team is here to provide quality maternal and child care services. 
              Whether you're expecting or need postnatal support, we're committed to your well-being.
            </p>
            <button 
              className="btn mt-3" 
              style={{backgroundColor: 'rgb(197, 87, 219)', color: 'white'}}
              onClick={handleGetDirections}
            >
              <i className="bi bi-map me-2"></i> Get Directions
            </button>
          </div>
          <div className="col-lg-6 mt-4 mt-lg-0">
            <div className="rounded shadow overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3855.0679128830735!2d120.28204731484233!3d14.83307998964941!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33967b0f9c9f9d6f%3A0x9f7c7d0a4b4b4b4b!2s74%20E%2020th%20St%2C%20East%20Bajac-Bajac%2C%20Olongapo%2C%20Zambales!5e0!3m2!1sen!2sph!4v1623456789012!5m2!1sen!2sph" 
                width="100%" 
                height="450" 
                style={{border:0}} 
                allowFullScreen="" 
                loading="lazy"
                title="St. Margaret Lying In Clinic Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer/>
    </>
    );
};

export default Type;