import React from 'react';
import './Aboutus.css';
import Navbar from '../Components/Global/Navbar_Main';
import neo_pic from '../images/neo_pic.jpg';
import dom_pic from '../images/dom_pic.jpg';
import glor_pic from '../images/glor_pic.jpg';
import sherwin from '../images/sherwin.jpg';

const Aboutus = () => {
  const teamMembers = [
    {
      name: "John Neo Lopez",
      role: "Visionary Leader",
      description: "John Neo's commitment to family planning stems from his research on teenage pregnancy rates. His expertise in machine learning and AI has been crucial in developing PlanItFamIt's revolutionary features.",
      image: neo_pic
    },
    {
      name: "Dominique Robles",
      role: "Design Expert",
      description: "Dominique has created a visually appealing and user-friendly platform. Her focus on accessibility ensures that PlanItFamIt is a pleasure to use for all.",
      image: dom_pic
    },
    {
      name: "John Ray Gloria",
      role: "Tech Genius",
      description: "John Ray ensures the platform runs smoothly and responds quickly. His backend development skills have been crucial in establishing a reliable and effective user interface.",
      image: glor_pic
    },
    {
      name: "Mr. Sherwin Rhey Condez",
      role: "Mentor and Advisor",
      description: "Mr. Condez has provided invaluable guidance throughout the development process. His extensive experience has been instrumental in shaping PlanItFamIt.",
      image: sherwin
    }
  ];

  return (
    <>
    <Navbar />
    <div className="about-us-container">
      <header className="about-header">
        <div className="header-content-about">
          <h1>About PlanItFamIt</h1>
          <p className="tagline">Empowering Reproductive Health Decisions</p>
        </div>
      </header>
      
      <main className="about-content">
        <section className="mission-vision">
          <div className="section-content">
            <div className="mission-vision-content">
              <div className="mission">
                <h3>Our Mission</h3>
                <p>PlanItFamIt's mission is to empower individuals to make informed and proactive family planning decisions. 
                  We strive to bridge the gap between individuals and healthcare professionals by offering a user-friendly 
                  platform that connects people with qualified providers, delivers accurate information, and supports them in 
                  taking control of their reproductive health. By increasing access to family planning services, promoting 
                  reproductive health education, and empowering individuals to make informed choices, we aim to reduce unintended 
                  pregnancies, improve maternal and child health outcomes, and create a more equitable and just world.</p>
              </div>
              <div className="vision">
                <h3>Our Vision</h3>
                <p>We envision a future where everyone has access to affordable, accessible, and comprehensive family planning care. 
                  PlanItFamIt is committed to breaking down barriers, promoting reproductive health, and fostering a society where 
                  individuals can thrive. Our vision is to create a world where people have the freedom to make informed choices 
                  about their reproductive health, free from stigma, discrimination, and financial hardship. We strive to empower 
                  individuals with the knowledge and resources they need to plan their families responsibly and achieve their goals.
                  By providing accessible and affordable family planning services, we aim to improve maternal and child health
                  outcomes, reduce unintended pregnancies, and create a more equitable and just society.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="history">
          <div className="section-content">
            <h2 className="section-title">Our Journey</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-content">
                  <h3>August 2023</h3>
                  <p>The name "PlanItFamIt" speaks to its core purpose: to empower individuals and families to plan their futures 
                    before starting a family. Originally conceived as a tool to assist the barangays of Olongapo City, Zambales, 
                    PlanItFamIt has evolved into a comprehensive resource for those seeking guidance, education, and support in
                    family planning.
                    </p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-content">
                  <h3>October 2023</h3>
                  <p>Registered at APPCON2023, PlanItFamIt's vision is to foster a more open and engaged society where Filipinos
                     feel comfortable discussing topics like family planning. By actively involving communities, we aim to create 
                     a better future where family planning is accessible and understood by all. We believe that by empowering
                      individuals and families with knowledge and support, we can contribute to a healthier, more prosperous, 
                      and more equitable society.
                    </p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-content">
                  <h3>First Trimester of the Baby</h3>
                  <p>Originally designed for barangay clinics, PlanItFamIt has evolved into a user-friendly app supporting family planning. 
                    Our mission is to empower individuals with accessible information and resources. By planning ahead, families can make 
                    informed decisions about their reproductive health.
                    </p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-content">
                  <h3>Partnership with St. Margaret Lying In Clinic</h3>
                  <p>As team moves on with its development, it has proudly partner with St. Margaret Lying In Clinic. With the supervision
                    of Ms. Junna May Gregoria, a midwife admin of the clinic, the features are getting tested for accuracy & comply with
                    the professional standards. In addition, the clinic requested more features to add on for making both the application and 
                    the clinic more reachable for patients and the community.
                    </p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-content">
                  <h3>Second Trimester of the Baby</h3>
                  <p>By March, PlanItFamIt leveraged a renowned generative AI platform to provide users with cutting-edge, accurate information. 
                    In April, our machine learning model was developed and refined to deliver exceptional results. 
                    By the 3rd quarter of the year, our appointment system was fully functional, allowing patients to 
                    schedule appointments and administrators to efficiently manage the process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="team">
          <div className="section-content">
            <h2 className="section-title">Meet the Team</h2>
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-member">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="member-image" 
                    onError={(e) => {
                      e.target.src = "/images/placeholder.jpg";
                    }}
                  />
                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <p className="member-role">{member.role}</p>
                    <p className="member-description">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="partnership">
          <div className="section-content">
            <h2 className="section-title">Proud Partnership with Gordon College</h2>
            <p>PlanItFamIt stands as a testament to the innovative spirit and unwavering commitment to social justice that defines 
              Gordon College. As proud alumni of this esteemed institution, we are honored to represent the university and its 
              dedication to equipping students with the knowledge, skills, and values needed to make a positive impact on the world. 
              Gordon College's fostering of a culture of innovation and social responsibility has been instrumental in the development 
              of PlanItFamIt, and we are grateful for the opportunities and support we have received throughout our academic journey.</p>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Join the Revolution</h2>
            <p className="cta-description">Together, we can transform family planning and create a brighter future for all.</p>
            <button className="cta-button">Get Involved</button>
          </div>
          <div className="cta-image">
            <img 
              src="https://via.placeholder.com/500x300?text=Family+Planning+Revolution" 
              alt="Family planning revolution" 
              className="cta-img"
            />
          </div>
        </section>
      </main>
    </div>
    </>
  );
};

export default Aboutus;
