import React from 'react';

function FiltersPanel({ minScore, onMinScoreChange }) {
  const handleChange = (event) => {
    const value = Number(event.target.value) || 0;
    onMinScoreChange(value);
  };

  return (
    <div className="filters-panel card">
      <h2 className="card-title">Filters</h2>
      <div className="form-group">
        <label className="form-label" htmlFor="min-score-range">
          Minimum similarity score
        </label>
        <input
          id="min-score-range"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={minScore}
          onChange={handleChange}
          className="input-range"
        />
        <div className="filters-value">{minScore.toFixed(2)}</div>
      </div>
    </div>
  );
}

export default FiltersPanel;
