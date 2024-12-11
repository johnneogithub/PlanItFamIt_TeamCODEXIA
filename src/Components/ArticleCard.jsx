import React from 'react';

const ArticleCard = ({ image, category, title, link, onDelete, isAdmin }) => (
  <div className="card-item">
    <div className="card-image" style={{ backgroundImage: `url(${image})` }}></div>
    <div className="card-content">
      <span className={`category ${category.toLowerCase()}`}>{category}</span>
      <h3>{title}</h3>
      <a href={link} target="_blank" rel="noopener noreferrer" className="card-link">Read More</a>
      {isAdmin && (
        <button className="delete-button" onClick={onDelete} aria-label="Delete Article">
          <i className="fas fa-trash-alt"></i>
        </button>
      )}
    </div>
  </div>
);

export default ArticleCard; 