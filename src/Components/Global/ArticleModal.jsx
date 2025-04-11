import React from 'react';
import './ArticleModal.css';

const ArticleModal = ({ isOpen, onClose, onSubmit, articleData, onInputChange, onImageChange }) => {
  if (!isOpen) return null;

  return (
    <div className="md-modal-wrapper">
      <div className="md-modal-overlay" onClick={onClose}></div>
      <div className="md-modal-content">
        <div className="md-modal-header">
          <h2>Add New Article</h2>
          <button className="md-close-btn" onClick={onClose} aria-label="Close modal">×</button>
        </div>
        
        <form onSubmit={onSubmit} className="md-modal-form">
          <div className="md-form-group">
            <label htmlFor="image">Image</label>
            <input 
              type="file" 
              id="image"
              name="image" 
              onChange={onImageChange} 
              className="md-form-input"
              accept="image/*"
            />
          </div>

          <div className="md-form-group">
            <label htmlFor="category">Category</label>
            <input 
              type="text" 
              id="category"
              name="category" 
              value={articleData.category} 
              onChange={onInputChange} 
              className="md-form-input"
              placeholder="Enter article category"
              required
            />
          </div>

          <div className="md-form-group">
            <label htmlFor="title">Title</label>
            <input 
              type="text" 
              id="title"
              name="title" 
              value={articleData.title} 
              onChange={onInputChange} 
              className="md-form-input"
              placeholder="Enter article title"
              required
            />
          </div>

          <div className="md-form-group">
            <label htmlFor="link">Link</label>
            <input 
              type="url" 
              id="link"
              name="link" 
              value={articleData.link} 
              onChange={onInputChange} 
              className="md-form-input"
              placeholder="Enter article URL"
              required
            />
          </div>

          <div className="md-modal-buttons">
            <button type="submit" className="md-save-btn">Save Article</button>
            <button type="button" onClick={onClose} className="md-cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleModal; 