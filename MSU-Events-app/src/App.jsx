import { useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import "./styles.css";
import Login from "./Frontend/Login";
import Registration from "./Frontend/Registration";
import Dashboard from './Frontend/Dashboard';


function App() {
    const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;

});

  const isLoggedIn = useMemo(() => Boolean(user?.id), [user]);

  function handleLogin(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard/calendar" replace /> : <Login onLoginSuccess={handleLogin} />} />
      <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard/calendar" replace /> : <Registration />} />
      <Route path="/dashboard/:tab" element={isLoggedIn ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/" element={<Navigate to={isLoggedIn ? '/dashboard/calendar' : '/login'} replace />} />
      <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard/calendar' : '/login'} replace />} />
    </Routes>
  );
}

export default App;