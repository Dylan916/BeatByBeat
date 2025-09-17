import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State to store the message from our backend
  const [message, setMessage] = useState('');

  useEffect(() => {
    // This function will run once when the component loads
    const checkBackendHealth = async () => {
      try {
        // Make a GET request to our server's /api/health endpoint
        const response = await axios.get('http://localhost:3000/api/health');
        
        // Update our state with the message from the server
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error connecting to the backend:", error);
        setMessage('Could not connect to the backend.');
      }
    };

    checkBackendHealth();
  }, []); // The empty array [] means this effect runs only once

  return (
    <div className="App">
      <h1>BeatByBeat Game</h1>
      {/* Display the message from the backend */}
      <p><strong>Server Status:</strong> {message || 'Connecting...'}</p>
    </div>
  );
}

export default App;