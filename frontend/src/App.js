import { useEffect, useState } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EntryPage from '@/pages/EntryPage';
import Dashboard from '@/pages/Dashboard';
import ScriptEditor from '@/pages/ScriptEditor';
import ScriptHub from '@/pages/ScriptHub';
import { Toaster } from 'sonner';

function App() {
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('roblox_session');
    if (stored) {
      setSessionData(JSON.parse(stored));
    }
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem('roblox_session', JSON.stringify(data));
    setSessionData(data);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              sessionData ? 
                <Navigate to="/dashboard" replace /> : 
                <EntryPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              sessionData ? 
                <Dashboard sessionData={sessionData} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/editor" 
            element={
              sessionData ? 
                <ScriptEditor sessionData={sessionData} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/scripts" 
            element={
              sessionData ? 
                <ScriptHub sessionData={sessionData} /> : 
                <Navigate to="/" replace />
            } 
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}

export default App;
