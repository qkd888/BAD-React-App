import React, { useState, useEffect } from 'react';
import '../order-numbers.css';

function OrderNumbers() {
  // State to manage the current number
  const [currentNumber, setCurrentNumber] = useState(() => {
    return parseInt(localStorage.getItem('orderNumber')) || 0;
  });
  const [animation, setAnimation] = useState('');

  // Function to pad number with leading zeros
  const padNumber = (num) => {
    return num.toString().padStart(4, '0');
  };

  // Update localStorage when currentNumber changes
  useEffect(() => {
    localStorage.setItem('orderNumber', currentNumber.toString());
  }, [currentNumber]);

  // Handle generate button click
  const handleGenerate = () => {
    setCurrentNumber(prev => prev + 1);
    setAnimation('scale');
    setTimeout(() => setAnimation(''), 200);
  };

  // Handle reset button click
  const handleReset = () => {
    setCurrentNumber(0);
    setAnimation('shake');
    setTimeout(() => setAnimation(''), 500);
  };

  // Add animation styles using useEffect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      @keyframes scale {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="page">
      <div className="order-number-container" id="order-number">
        <h1>Order Number Generator</h1>
        <div className="display">
          <div 
            id="orderNumber" 
            className={animation}
            style={{
              transition: animation === 'scale' ? 'transform 0.2s' : 'none',
              animation: animation === 'shake' ? 'shake 0.5s' : 'none'
            }}
          >
            BA-{padNumber(currentNumber)}
          </div>
        </div>
        <div className="buttons">
          <button id="generateBtn" onClick={handleGenerate}>
            Generate
          </button>
          <button id="resetBtn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderNumbers;