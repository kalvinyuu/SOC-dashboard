import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => setMessage('Error fetching API'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4 text-cyan-400">CyberSec Project</h1>
      <p className="text-xl mb-8">Elysia + React + Tailwind + Drizzle</p>
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">API Response:</h2>
        <pre className="bg-black p-4 rounded text-green-400">{message}</pre>
      </div>
    </div>
  );
}

export default App;
