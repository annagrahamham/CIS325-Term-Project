import { useState } from "react";
import "../styles.css";

function Login({onLoginSuccess, onRegister}){
    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetMessage, setResetMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    
try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
    });

const data = await res.json();

if(!res.ok) {
    setMessage(data.error || 'Login failed');
    return;
}

localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
    } catch (err) {
        setMessage('Server connection failed');
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    setResetMessage('');

    if (!resetEmail || !oldPassword || !newPassword) {
    setResetMessage('Email, old password, and new password are required');
    return;
    }

    try {
    const res = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, oldPassword, newPassword })
    });

    const data = await res.json();

    if (!res.ok) {
        setResetMessage(data.error || 'Password reset failed');
        return;
    }

    setResetMessage('Password reset. Log in with your new password.');
    setPassword('');
    setResetEmail('');
    setOldPassword('');
    setNewPassword('');
    setShowForgotPassword(false);
    } catch (err) {
    setResetMessage('Server connection failed');
    }
}

return (
    <div className="container">
        <h1>LOGIN</h1>
        <form onSubmit={handleSubmit}>
            <label htmlFor="email">University Email:</label>
            <input type="email" id="email" name="email" 
            value={email} onChange={(e) => setEmail(e.target.value)}
             required/>

            <label htmlFor="password">Password:</label>
            <input type="password"id="password" name="password" 
            value={password}  onChange={(e) => setPassword(e.target.value)}
             required/>
            
            <button type="submit">Login</button>
        </form>
                {message && <p className="form-message">{message}</p>}

                <p>
                        <button
                            type="button"
                            className="text-link"
                            onClick={() => {
                                setShowForgotPassword(!showForgotPassword);
                                setResetEmail(email);
                                setResetMessage('');
                            }}
                        >
                            {showForgotPassword ? 'Cancel password reset' : 'Forgot password?'}
                        </button>
                </p>

                {showForgotPassword && (
                    <form onSubmit={handleResetPassword}>
                        <label htmlFor="resetEmail">Account Email:</label>
                        <input
                            type="email"
                            id="resetEmail"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                        />

                        <label htmlFor="oldPassword">Old Password:</label>
                        <input
                            type="password"
                            id="oldPassword"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />

                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />

                        <button type="submit">Reset Password</button>
                    </form>
                )}

                {resetMessage && <p className="form-message">{resetMessage}</p>}

  <p>
        New user?{' '}
        <button type="button" onClick={onRegister}>
          Create account
        </button>
      </p>
    </div>
);}

export default Login;