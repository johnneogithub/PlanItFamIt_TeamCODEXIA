import './HomeStyle.css';
import newhome from '../Components/Assets/back-new1.png';
import Nav from '../Components/Global/Navbar_Main';
import { Link } from 'react-router-dom';
import Footer from '../Components/Global/Footer';
import ProfileWarningModal from '../Components/Global/ProfileWarningModal';
import React, { useEffect, useState } from 'react';
import { checkUserProfileCompletion } from '../Config/firebase';
import { getAuth } from "firebase/auth"; 
import planitLogo from '../Components/Assets/PlanItFamItLogo_180x180px.png';

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.log("No user logged in");
          setIsLoading(false);
          return;
        }

        console.log("Checking profile completion for user:", user.uid);
        const isProfileComplete = await checkUserProfileCompletion(user.uid);
        console.log("Profile complete:", isProfileComplete);
        setShowModal(!isProfileComplete);
      } catch (error) {
        console.error("Error in profile completion check:", error);
        setShowModal(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileCompletion();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (isLoading) {
    return (
      <div className="custom-loading-container">
        <div className="custom-loading-spinner">
          <img src={planitLogo} alt="PlanItFamIt Logo" className="custom-loading-logo" />
          <div className="custom-loading-border"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`background_home ${showModal ? 'dimmed' : ''}`}>
        <Nav />
        <div className="content_wrapper">
          <div className="picture_fix">
            <img className="home_picture" src={newhome} alt="PlanitFamIt background" />
          </div>
          <div className="home_intro-style">
            <h1 className="main_title">Let us plan your future, for a better tomorrow.</h1>
            <p className="sub_title">PlanitFamIt is designed to reach every Filipino that seeks a better future for their family, through family planning.</p>
            
            <div className="cta_container">
              <Link to="/Chatbot" className="cta_button cta_button--primary">PlanIt Assistant</Link>
              <Link to="/Articles" className="cta_button cta_button--secondary">Healthcare Articles</Link>
            </div>

            <div className="healthcare_check">
              <Link to="/StMargaretLyingInClinic" className="cta_button cta_button--tertiary">Check your healthcare</Link>
            </div>    
          </div>
        </div>
      </div>
      
      <ProfileWarningModal show={showModal} onClose={handleCloseModal} />

      {showModal && <div className="modal-backdrop"></div>}

      <Footer />
    </>
  );
}

export default Home;
