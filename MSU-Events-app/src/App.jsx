import { useState } from "react";
import "./styles.css";
import Login from "./Frontend/Login";
import Registration from "./Frontend/Registration";
import Dashboard from './Frontend/Dashboard';


function App() {
    const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;

});

const [screen, setScreen] = useState('login');

function handleLogout() {
  localStorage.removeItem('user');
  setUser(null);
  setScreen('login');
}

//Dashboard component when logged in
if (user) {return <Dashboard user={user} onLogout={handleLogout} />;}

//Otherwise show login or registration
if (screen === 'login') {
    return (
      <Login
        onLoginSuccess={setUser}
        onRegister={() => setScreen('register')}/>
);
} 

return (
    <Registration
      onRegisterSuccess={() => setScreen('login')}
      onGoToLogin={() => setScreen('login')}/>
  );
}

export default App;