import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [useEnhancement, setUseEnhancement] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('detection');
  const [activeInfoTab, setActiveInfoTab] = useState('about-skin-cancer');

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      
      // Reset previous results
      setResult(null);
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select an image first");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('use_enhancement', useEnhancement);
      
      // Send request to API
      const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://skin-cancer-detection-web-8f38fc400b28.herokuapp.com/api/detect'  // In production, use full backend URL
  : 'http://localhost:5000/api/detect'; // In development, use localhost
const response = await fetch(API_URL, {
  method: 'POST',
  body: formData,
});
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      // Check if response has content
      const text = await response.text();
      if (!text) {
        throw new Error("Empty response received from server");
      }
      
      // Parse JSON only if we have content
      const data = JSON.parse(text);
      setResult(data);
    } catch (error) {
      console.error("Error details:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Skin Cancer Detection</h1>
      </header>
      
      <div className="tabs">
        <button 
          className={activeTab === 'detection' ? 'active' : ''}
          onClick={() => setActiveTab('detection')}
        >
          Detection
        </button>
        <button 
          className={activeTab === 'information' ? 'active' : ''}
          onClick={() => setActiveTab('information')}
        >
          Information
        </button>
        <button 
          className={activeTab === 'about' ? 'active' : ''}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
      </div>
      
      {activeTab === 'detection' && (
        <div className="detection-tab">
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="file-upload">
                <label htmlFor="file-input">Choose a dermoscopic image</label>
                <input
                  id="file-input"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="options">
                <label>
                  <input
                    type="checkbox"
                    checked={useEnhancement}
                    onChange={(e) => setUseEnhancement(e.target.checked)}
                  />
                  Use image enhancement
                </label>
              </div>
              
              <button 
                type="submit" 
                className="analyze-button" 
                disabled={!file || isLoading}
              >
                {isLoading ? 'Analyzing...' : 'Analyze Image'}
              </button>
            </form>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {preview && !result && (
            <div className="preview-container">
              <h2>Preview</h2>
              <img src={preview} alt="Preview" />
            </div>
          )}
          
          {result && (
            <div className="results-container">
              <h2>Analysis Results</h2>
              
              <div className="results-grid">
                <div className="result-card">
                  <h3>Original Image</h3>
                  <img 
                    src={`data:image/jpeg;base64,${result.images.original}`} 
                    alt="Original" 
                  />
                </div>
                
                {result.images.heatmap && (
                  <div className="result-card">
                    <h3>Attention Map</h3>
                    <img 
                      src={`data:image/jpeg;base64,${result.images.heatmap}`} 
                      alt="Attention Map" 
                    />
                    <p className="caption">Areas the model focused on</p>
                  </div>
                )}
                
                <div className="result-card">
                  <h3>Prediction</h3>
                  <div className={`prediction ${result.prediction.label === 'Benign' ? 'benign' : 'malignant'}`}>
                    Result: {result.prediction.label}
                  </div>
                  <div className="confidence">
                    Confidence: {result.prediction.confidence.toFixed(2)}%
                  </div>
                  
                  <h4>Probability Distribution:</h4>
                  <img 
                    src={`data:image/png;base64,${result.images.chart}`} 
                    alt="Probability Chart" 
                  />
                </div>
              </div>
              
              <div className="disclaimer">
                <strong>Disclaimer:</strong> This tool is for educational purposes only and should not replace professional medical advice.
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'information' && (
        <div className="information-tab">
          <div className="info-tabs">
            <button 
              className={activeInfoTab === 'about-skin-cancer' ? 'active' : ''}
              onClick={() => setActiveInfoTab('about-skin-cancer')}
            >
              About Skin Cancer
            </button>
            <button 
              className={activeInfoTab === 'abcde-rule' ? 'active' : ''}
              onClick={() => setActiveInfoTab('abcde-rule')}
            >
              ABCDE Rule
            </button>
            <button 
              className={activeInfoTab === 'when-to-see-doctor' ? 'active' : ''}
              onClick={() => setActiveInfoTab('when-to-see-doctor')}
            >
              When to See a Doctor
            </button>
          </div>
          
          <div className="info-content">
            {activeInfoTab === 'about-skin-cancer' && (
              <>
                <h2>About Skin Cancer</h2>
                
                <h3>What is Skin Cancer?</h3>
                <p>
                  Skin cancer is the abnormal growth of skin cells, most often developed on skin exposed to the sun. 
                  It can also occur in areas of the skin not ordinarily exposed to sunlight.
                </p>
                
                <h3>Common Types:</h3>
                <ul>
                  <li><strong>Basal Cell Carcinoma</strong>: Most common type, rarely spreads</li>
                  <li><strong>Squamous Cell Carcinoma</strong>: Second most common type, can spread if untreated</li>
                  <li><strong>Melanoma</strong>: Most dangerous type, can spread to other parts of the body</li>
                </ul>
                
                <h3>Risk Factors:</h3>
                <ul>
                  <li>Excessive sun exposure</li>
                  <li>History of sunburns</li>
                  <li>Fair skin</li>
                  <li>Family or personal history of skin cancer</li>
                  <li>Weakened immune system</li>
                </ul>
              </>
            )}
            
            {activeInfoTab === 'abcde-rule' && (
              <>
                <h2>ABCDE Rule for Melanoma Detection</h2>
                
                <p>The ABCDE rule is a simple guide to help identify potential melanomas:</p>
                
                <ul>
                  <li><strong>A - Asymmetry</strong>: One half of the mole doesn't match the other half.</li>
                  <li><strong>B - Border</strong>: The edges are irregular, ragged, notched, or blurred.</li>
                  <li><strong>C - Color</strong>: The color is not the same throughout and may include different shades.</li>
                  <li><strong>D - Diameter</strong>: The mole is larger than 6 millimeters across.</li>
                  <li><strong>E - Evolving</strong>: The mole is changing in size, shape, or color over time.</li>
                </ul>
              </>
            )}
            
            {activeInfoTab === 'when-to-see-doctor' && (
              <>
                <h2>When to See a Doctor</h2>
                
                <h3>Consult a dermatologist if you notice:</h3>
                <ul>
                  <li>A new spot on your skin</li>
                  <li>A spot that differs from other spots on your skin</li>
                  <li>A spot that changes in size, shape, or color</li>
                  <li>A spot that itches, bleeds, or doesn't heal</li>
                  <li>A mole that matches any of the ABCDE criteria</li>
                </ul>
                
                <h3>Regular Check-ups</h3>
                <ul>
                  <li>People with no history of skin cancer: Annual skin examination</li>
                  <li>People with a history of skin cancer: More frequent check-ups</li>
                  <li>People with many moles: Regular monitoring</li>
                </ul>
                
                <p><strong>Remember:</strong> Early detection is crucial for successful treatment of skin cancer.</p>
              </>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'about' && (
        <div className="about-tab">
          <h2>About This Application</h2>
          
          <h3>Purpose</h3>
          <p>
            This application uses deep learning to analyze dermoscopic images and detect potential skin cancer. 
            The model classifies skin lesions as either benign or malignant based on visual patterns.
          </p>
          
          <h3>How It Works</h3>
          <ol>
            <li>You upload a dermoscopic image</li>
            <li>The AI model processes and analyzes the image</li>
            <li>Grad-CAM visualization shows areas of interest</li>
            <li>Classification results display with confidence scores</li>
          </ol>
          
          <h3>Limitations</h3>
          <ul>
            <li>This is a demonstration tool and should not be used for clinical diagnosis</li>
            <li>The model was trained on a specific dataset and may not generalize to all types of skin lesions</li>
            <li>Image quality significantly affects performance</li>
          </ul>
          
          <h3>Technologies Used</h3>
          <ul>
            <li>TensorFlow and Keras for deep learning</li>
            <li>React for the web interface</li>
            <li>Flask for the backend API</li>
            <li>Grad-CAM for visualization</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;