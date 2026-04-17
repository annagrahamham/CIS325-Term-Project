import { useState } from "react";
import "../styles.css";

function Register({onRegisterSuccess, onGoToLogin}){
    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [MNumberID, setMNumberID] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('student');
    const [major, setMajor] = useState('');
    const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

if (password !== confirmPassword) {
  setMessage('Passwords do not match');
  return;
}

try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, MNumberID, email, password, phone, role, major})
});

let data = {};
const contentType = res.headers.get('content-type') || '';

if (contentType.includes('application/json')) {
  data = await res.json();
}

if(!res.ok) {
    setMessage(data.error || data.message || 'Registration failed');
    return;
}

onRegisterSuccess();
    } catch (err) {
        setMessage('Server connection failed');
    }
}

return (
    <div className="container registration-container">
        <h1>REGISTRATION</h1>
        <form onSubmit={handleSubmit}>
            <label htmlFor="firstName">First Name:</label>
            <input type="text" id="firstName" 
            value={firstName} onChange={(e) => setFirstName(e.target.value)}
            required/>
            <label htmlFor="lastName">Last Name:</label>
            <input type="text" id="lastName"  
            value={lastName} onChange={(e) => setLastName(e.target.value)}
            required/>

            <label htmlFor="email">University Email:</label>
            <input type="email" id="email"  
            value={email} onChange={(e) => setEmail(e.target.value)}
            required/>
            
            <label htmlFor="MNumberID">Student ID:</label>
            <input type="text" id="MNumberID" 
            value={MNumberID} onChange={(e) => setMNumberID(e.target.value)}
            required/>

            <label htmlFor="phone">Phone Number:</label>
            <input type="tel" id="phone" 
            value={phone} onChange={(e) => setPhone(e.target.value)}/>

            <label htmlFor="password">Password:</label>
            <input type="password"id="password" 
            value={password}  onChange={(e) => setPassword(e.target.value)}
            required/>

            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input type="password" id="confirmPassword" 
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>

            <label htmlFor="role">Role:

            </label>
            <select id="role"
            value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="">Select a role</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff</option>
            </select>

            <label htmlFor="major">Major:</label>
            <input type="text" id="major" 
            value={major} onChange={(e) => setMajor(e.target.value)}/>

            <button type="submit">Register</button>
            <button type="button" onClick={onGoToLogin}>Already have an account? Login here</button>
            
        </form>
    </div>
);}
export default Register;