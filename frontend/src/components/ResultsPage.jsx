import React, { useMemo, useState } from 'react';
import FiltersPanel from './FiltersPanel.jsx';
import ProductCard from './ProductCard.jsx';

function ResultsPage({ queryImageUrl, products, onBack }) {
  const [minScore, setMinScore] = useState(0);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.similarityScore >= minScore),
    [products, minScore]
  );

  return (
    <section className="results-page">
      <div className="results-layout">
        <aside className="results-sidebar">
          <button className="btn btn-ghost" onClick={onBack}>
            ← Back to search
          </button>

          <div className="query-image-card">
            <h2 className="section-title">Query image</h2>
            {queryImageUrl ? (
              <img
                src={queryImageUrl}
                alt="Query"
                className="query-image"
              />
            ) : (
              <div className="query-image placeholder">No image available</div>
            )}
          </div>

          <FiltersPanel minScore={minScore} onMinScoreChange={setMinScore} />
        </aside>

        <div className="results-content">
          <div className="results-header">
            <h1 className="section-title">Similar products</h1>
            <p className="results-meta">
              Showing {filteredProducts.length} of {products.length} items
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">No products match the current filters.</div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ResultsPage;
