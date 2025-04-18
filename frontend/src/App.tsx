import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

const API_BASE_URL = 'http://localhost:3001';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is returning from Google auth
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    
    if (authStatus === 'success') {
      setIsLoggedIn(true);
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/url`);
      window.location.href = response.data.authUrl;
    } catch (err) {
      setError('Failed to generate authentication URL');
      console.error('Error getting auth URL:', err);
    }
  };

  const handleModifyEvents = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (endDate < startDate) {
      setError('End date must be after start date');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/modify-events`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      setResult({
        success: response.data.success,
        message: response.data.message
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to modify events');
      console.error('Error modifying events:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Google Calendar Privacy Tool</h1>
        <p>Easily modify your calendar events to private</p>
      </header>
      <main className="App-main">
        {!isLoggedIn ? (
          <div className="login-container">
            <p>Please login with your Google account to access your calendar</p>
            <button className="btn-primary" onClick={handleLogin}>Login with Google</button>
          </div>
        ) : (
          <div className="tool-container">
            <h2>Select Date Range</h2>
            <div className="date-pickers">
              <div className="date-picker">
                <label>Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => date && setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  dateFormat="yyyy-MM-dd"
                  className="date-input"
                />
              </div>
              <div className="date-picker">
                <label>End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => date && setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  dateFormat="yyyy-MM-dd"
                  className="date-input"
                />
              </div>
            </div>
            <button 
              className="btn-primary" 
              onClick={handleModifyEvents} 
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Change Events to Private'}
            </button>
            
            {error && <div className="error-message">{error}</div>}
            {result && (
              <div className="result-message">
                {result.success ? (
                  <p className="success">{result.message}</p>
                ) : (
                  <p className="error">{result.message}</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="App-footer">
        <p>Company Internal Tool - For Authorized Use Only</p>
      </footer>
    </div>
  );
}

export default App;
