import React from 'react';
import './ArticlesStyle.css';
import Nav from '../Components/Global/Navbar_Main';
import Footer from '../Components/Global/Footer';
import Violet_Bkg from '../Components/Assets/articlespage_bkg2.jpg';
import WomenRH from '../Components/Assets/Reproductive_Women_img.jpg';
import MenRH from '../Components/Assets/Reproductive_Man_img.jpg';
import FP1 from '../Components/Assets/FamilyPlanning_img.jpg';
import FP2 from '../Components/Assets/FamilyPlanning_img2.jpg';
import SX1 from '../Components/Assets/Sex_img1.jpg';
import SX2 from '../Components/Assets/Safesex_img.jpg';
import SX3 from '../Components/Assets/couple_bed.png';
import SX4 from '../Components/Assets/talking-about.jpg';
import SX5 from '../Components/Assets/pic6.jpg';
import SX6 from '../Components/Assets/pic7.jpg';
import SX7 from '../Components/Assets/pic8.png';
import SX8 from '../Components/Assets/pic9.jpg';
import SX9 from '../Components/Assets/pic10.png';
const Articles = () => {
  return (
    <div className="articles-page">
      <Nav />
      <header className="articles-header" style={{backgroundImage: `url(${Violet_Bkg})`}}>
        <div className="header-content">
          <h1>Journals and Articles</h1>
          <p>Explore our curated collection of informative articles to expand your knowledge on reproductive health and family planning.</p>
        </div>
      </header>
      
      <main className="articles-content">
        <div className="card-grid">
          <ArticleCard 
            image={WomenRH}
            category="Reproductive"
            title="Women's Reproductive Health"
            link="https://www.healthline.com/health/womens-health/female-reproductive-organs#organs"
          />
          <ArticleCard 
            image={MenRH}
            category="Reproductive"
            title="Men's Reproductive Health"
            link="https://www.healthline.com/health/mens-health/male-genitalia"
          />
          <ArticleCard 
            image={FP1}
            category="Family Planning"
            title="Family Planning in the Philippines"
            link="https://doh.gov.ph/uhc/health-programs/family-planning-program/"
          />
          <ArticleCard 
            image={FP2}
            category="Family Planning"
            title="Importance of Family Planning"
            link="https://hellodoctor.com.ph/sexual-wellness/contraception/importance-family-planning/"
          />
          <ArticleCard 
            image={SX1}
            category="Sex"
            title="Understanding Sexual Intercourse"
            link="https://www.netdoctor.co.uk/healthy-living/sex-life/a2314/sexual-intercourse/"
          />
          <ArticleCard 
            image={SX7}
            category="Sex"
            title="Practicing Safe Sex"
            link="https://health.clevelandclinic.org/safe-sex"
          />
          <ArticleCard 
            image={SX3}
            category="UTIs "
            title="Why You Get UTIs After Sex — and How To Prevent Them"
            link="https://health.clevelandclinic.org/uti-after-sex"
          />
               <ArticleCard 
            image={SX8}
            category="Ovulate"
            title="When do I ovulate, how do I know, and what does it feel like?"
            link="https://www.medicalnewstoday.com/articles/150870#how-to-track-it"
          />
               <ArticleCard 
            image={SX9}
            category="Infertility in males and females"
            title="What is infertility?"
            link="https://www.medicalnewstoday.com/articles/165748"
          />
               <ArticleCard 
            image={SX4}
            category="Periods"
            title="Talking about periods at home"
            link="https://www.unicef.org/parenting/health/talking-about-periods-at-home?gad_source=1&gclid=CjwKCAjwg-24BhB_EiwA1ZOx8tWARSUDDBfu3MrGl--dXQWhpmZz_Tt12cukNSofLRdzYgE163ONkhoCZQIQAvD_BwE"
          />
               <ArticleCard 
            image={SX5}
            category="Contraceptive Implant"
            title="What is a contraceptive implant?"
            link="https://my.clevelandclinic.org/health/articles/24564-contraceptive-implant"
          />
               <ArticleCard 
            image={SX6}
            category="Birth Control Options"
            title="What is birth control?"
            link="https://my.clevelandclinic.org/health/articles/11427-birth-control-options"
          />  
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

const ArticleCard = ({ image, category, title, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer" className="card-item">
    <div className="card-image" style={{backgroundImage: `url(${image})`}}></div>
    <div className="card-content">
      <span className={`category ${category.toLowerCase()}`}>{category}</span>
      <h3>{title}</h3>
      <div className="arrow">
        <i className="fas fa-arrow-right card-icon"></i>
      </div>
    </div>
  </a>
);

export default Articles;