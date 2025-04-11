import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './ArticlesStyle.css';
import Nav from '../Components/Global/Navbar_Main';
import Footer from '../Components/Global/Footer';
import Violet_Bkg from '../Components/Assets/articlespage_bkg2.jpg';
import WomenRH from '../Components/Assets/Reproductive_Women_img.jpg';
import { db, storage } from '../Config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ArticleModal from '../Components/Global/ArticleModal';

const Articles = () => {
  const location = useLocation();
  const isAdmin = location.state?.isAdmin || false;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [articleData, setArticleData] = useState({
    image: '',
    category: '',
    title: '',
    link: ''
  });
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const querySnapshot = await getDocs(collection(db, "articles"));
      const articlesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArticles(articlesList);
    };
    fetchArticles();
  }, []);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArticleData({ ...articleData, [name]: value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `images/${file.name}`);
      try {
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setArticleData({ ...articleData, image: url });
      } catch (error) {
        console.error("Error uploading image: ", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "articles"), articleData);
      setArticles(prevArticles => [...prevArticles, articleData]);
      console.log("Article added to Firestore");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    closeModal();
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "articles", id));
      setArticles(articles.filter(article => article.id !== id));
      console.log("Article deleted from Firestore");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      console.log('Admin access: Manage Articles');
    }
  }, [isAdmin]);

  return (
    <div className="articles-page">
      {!isAdmin && <Nav />}
      <header className="articles-header" style={{backgroundImage: `url(${Violet_Bkg})`}}>
        <div className="header-content">
          <h1>Journals and Articles</h1>
          <p>Explore our curated collection of informative articles to expand your knowledge on reproductive health and family planning.</p>
        </div>
      </header>
      
      <main className="articles-content">
        {isAdmin && (
          <div className="edit-button-container">
            <button className="back-button" onClick={() => window.history.back()}>Back</button>
            <button className="edit-button" onClick={openModal}>Add Articles</button>
          </div>
        )}

        <ArticleModal
          isOpen={modalIsOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          articleData={articleData}
          onInputChange={handleInputChange}
          onImageChange={handleImageChange}
        />

        <div className="card-grid">
          {articles.map((article) => (
            <ArticleCard 
              key={article.id}
              image={article.image}
              category={article.category}
              title={article.title}
              link={article.link}
              onDelete={() => handleDelete(article.id)}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

const ArticleCard = ({ image, category, title, link, onDelete, isAdmin }) => {
  const handleCardClick = (e) => {
    if (e.target.classList.contains('delete-button')) {
      e.preventDefault(); 
    }
  };

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="card-item" onClick={handleCardClick}>
      <div className="card-image" style={{backgroundImage: `url(${image})`}}></div>
      <div className="card-content">
        <span className={`category ${category.toLowerCase()}`}>{category}</span>
        <h3>{title}</h3>
        <div className="arrow">
          <i className="fas fa-arrow-right card-icon"></i>
        </div>
        {isAdmin && (
          <button className="delete-button" onClick={onDelete}>Delete</button>
        )}
      </div>
    </a>
  );
}

export default Articles;