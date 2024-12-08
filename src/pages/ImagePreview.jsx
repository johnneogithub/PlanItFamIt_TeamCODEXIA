import React from 'react';
import { useLocation } from 'react-router-dom';
import './ImagePreviewStyle.css';

const ImagePreview = () => {
  const location = useLocation();
  const { imageUrl } = location.state || {};

  if (!imageUrl) {
    return <div>No image to display</div>;
  }

  return (
    <div className="image-preview-container-unique">
      <h2 className="image-preview-title-unique">Image Preview</h2>
      <img src={imageUrl} alt="Preview" className="image-preview-img-unique" />
      <br />
      <button className="image-preview-button-unique" onClick={() => window.history.back()}>Go Back</button>
    </div>
  );
};

export default ImagePreview; 