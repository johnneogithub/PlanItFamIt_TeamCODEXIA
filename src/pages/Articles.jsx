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
            image={SX2}
            category="Sex"
            title="Practicing Safe Sex"
            link="https://health.clevelandclinic.org/safe-sex"
          />
          <ArticleCard 
            image={SX2}
            category="UTIs "
            title="Why You Get UTIs After Sex — and How To Prevent Them"
            link="https://health.clevelandclinic.org/uti-after-sex"
          />
               <ArticleCard 
            image={SX2}
            category="Ovulate"
            title="When do I ovulate, how do I know, and what does it feel like?"
            link="https://www.medicalnewstoday.com/articles/150870#how-to-track-it"
          />
               <ArticleCard 
            image={SX2}
            category="Vaginal Discharge"
            title="What do different types of vaginal discharge mean?"
            link="https://www.medicalnewstoday.com/articles/150870"
          />
               <ArticleCard 
            image={SX2}
            category="Periods"
            title="Talking about periods at home"
            link="https://www.unicef.org/parenting/health/talking-about-periods-at-home?gad_source=1&gclid=CjwKCAjwg-24BhB_EiwA1ZOx8tWARSUDDBfu3MrGl--dXQWhpmZz_Tt12cukNSofLRdzYgE163ONkhoCZQIQAvD_BwE"
          />
               <ArticleCard 
            image={SX2}
            category="Late Ovulation And Pregnancy"
            title="Monthly calendar with date circled and the word ovulation
Late Ovulation And Pregnancy"
            link="https://triofertility.com/late-ovulation-and-pregnancy/#:~:text=Late%20ovulation%20is%20ovulation%20that,in%20your%20baby%2Dmaking%20plans"
          />
               <ArticleCard 
            image={SX2}
            category="Birth Control"
            title="Birth control and family planning"
            link="https://medlineplus.gov/ency/article/001946.htm"
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