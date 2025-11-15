import React from 'react';

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-image-wrapper">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image"
        />
      </div>
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-score">
          Similarity score: <span>{product.similarityScore.toFixed(2)}</span>
        </p>
      </div>
    </article>
  );
}

export default ProductCard;
