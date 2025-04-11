import React from 'react';
import './ArticleModal.css';

const ArticleModal = ({ isOpen, onClose, onSubmit, articleData, onInputChange, onImageChange }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-wrapper">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Article</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-group">
            <label>Image</label>
            <input 
              type="file" 
              name="image" 
              onChange={onImageChange} 
              className="form-input"
              accept="image/*"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input 
              type="text" 
              name="category" 
              value={articleData.category} 
              onChange={onInputChange} 
              className="form-input"
              placeholder="Enter article category"
              required
            />
          </div>

          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              name="title" 
              value={articleData.title} 
              onChange={onInputChange} 
              className="form-input"
              placeholder="Enter article title"
              required
            />
          </div>

          <div className="form-group">
            <label>Link</label>
            <input 
              type="url" 
              name="link" 
              value={articleData.link} 
              onChange={onInputChange} 
              className="form-input"
              placeholder="Enter article URL"
              required
            />
          </div>

          <div className="modal-buttons">
            <button type="submit" className="save-btn">Save Article</button>
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleModal; 