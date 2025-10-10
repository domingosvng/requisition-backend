import React, { useState } from 'react';
import './App.css';

import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  const roleMap = {
    'SOLICITANTE': 'Solicitante',
    'ADMIN_TEC': 'Admin. Técnico',
    'GESTOR_DADM': 'Gestor DADM',
    'ADMIN': 'Administrador'
  };

  const handleLogin = (userData) => {
    localStorage.setItem('userToken', userData.token);
    localStorage.setItem('userRole', userData.role);
    setUser(userData);
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="App">
      <header>
        <h1>Bem-vindo, {user.username}!</h1>
        <p>Seu papel: {roleMap[user.role] || user.role}</p>
        <button onClick={() => {
          localStorage.clear();
          setUser(null);
        }}>
          Logout
        </button>
      </header>
      {/* --- MAIN DASHBOARD VIEW --- */}
      <Dashboard userRole={user.role} />
    </div>
  );
}

export default App;
