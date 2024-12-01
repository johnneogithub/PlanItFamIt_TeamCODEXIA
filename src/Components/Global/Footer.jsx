import { Link } from 'react-router-dom';
import './FooterStyle.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-3 col-md-6 mb-4">
            <h2 className="footer-heading">PlanItFamIt</h2>
            <p className="footer-text">
              PlanItFamIt: your guide to family planning!<br/>
              Developed by Team CODEXIA from Gordon College CCS department.<br/>
              With development partner St. Margaret Lying In Clinic.
            </p>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h3 className="footer-heading">Explore</h3>
            <ul className="footer-links">

              <li><a href="/Home">Home</a></li>
              <li><a href="/Articles">Articles</a></li>
              <li><a href="/PlanItAssistant">PlanIt Assistant</a></li>
              <li><a href="/StMargaretLyingInClinic">St. Margaret Lying In Clinic</a></li>

            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h3 className="footer-heading">Clinic Information</h3>
            <ul className="footer-links">
              <li>Page · Pregnancy Care Center</li>
              <li>GF 74A 20TH ST. EAST BAJAC BAJAC, Olongapo, Philippines</li>
              <li>0968 240 5533</li>
              <li>St. Margaret Lying In Clinic</li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h3 className="footer-heading">Clinic's Open Hours</h3>
            <table className="footer-table">
              <tbody>
                <tr>
                  <td>Mon - Fri:</td>
                  <td>8am - 5pm</td>
                </tr>
                <tr>
                  <td>Sat - Sun:</td>
                  <td>8am - 4pm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="footer-copyright">
        © 2024 Copyright:
        <Link to="/">PlanItFamIt.com</Link>
      </div>
    </footer>
  );
};

export default Footer;
