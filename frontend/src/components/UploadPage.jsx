import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function UploadPage({ onSearchCompleted }) {
  const [file, setFile] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    setFile(selected || null);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!file && !imageUrlInput) {
      setError('Please upload an image or provide an image URL.');
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = imageUrlInput.trim();

      if (!imageUrl && file) {
        const formData = new FormData();
        formData.append('image', file);

        const uploadResponse = await axios.post(`${API_BASE}/api/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        imageUrl = uploadResponse.data.imageUrl;
      }

      const similarityResponse = await axios.post(`${API_BASE}/api/similarity`, {
        imageUrl,
        topK: 50,
      });

      onSearchCompleted(similarityResponse.data.queryImageUrl, similarityResponse.data.products);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while processing your image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="upload-page">
      <div className="card">
        <h1 className="card-title">Search by Image</h1>
        <p className="card-description">
          Upload a product photo or paste an image URL. We will return visually similar items
          from our catalog.
        </p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label className="form-label" htmlFor="file-input">
              Upload image file
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="input-file"
            />
          </div>

          <div className="form-divider">or</div>

          <div className="form-group">
            <label className="form-label" htmlFor="image-url-input">
              Paste image URL
            </label>
            <input
              id="image-url-input"
              type="url"
              placeholder="https://example.com/my-image.jpg"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="input-text"
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Searching…' : 'Find similar products'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default UploadPage;
