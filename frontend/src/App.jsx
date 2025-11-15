import React, { useState } from 'react';
import UploadPage from './components/UploadPage.jsx';
import ResultsPage from './components/ResultsPage.jsx';

function App() {
  const [step, setStep] = useState('upload');
  const [queryImageUrl, setQueryImageUrl] = useState('');
  const [results, setResults] = useState([]);

  const handleSearchCompleted = (imageUrl, products) => {
    setQueryImageUrl(imageUrl);
    setResults(products);
    setStep('results');
  };

  const handleBackToSearch = () => {
    setStep('upload');
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-logo">Visual Product Finder</div>
        <div className="app-subtitle">Search products by image reference</div>
      </header>

      <main className="app-main">
        {step === 'upload' && (
          <UploadPage onSearchCompleted={handleSearchCompleted} />
        )}
        {step === 'results' && (
          <ResultsPage
            queryImageUrl={queryImageUrl}
            products={results}
            onBack={handleBackToSearch}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>Demo MERN app · Image similarity is placeholder-based.</span>
      </footer>
    </div>
  );
}

export default App;
