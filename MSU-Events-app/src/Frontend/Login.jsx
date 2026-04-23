import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import StatusBanner from "../components/StatusBanner";
import { apiRequest } from "../lib/api";
import "../styles.css";

function Login({ onLoginSuccess }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [resetMessage, setResetMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    function validateLoginForm() {
        const nextErrors = {};
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail.endsWith("@murraystate.edu")) {
            nextErrors.email = "Use your Murray State email address.";
        }
        if (password.length < 14) {
            nextErrors.password = "Password must be at least 14 characters.";
        }

        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

        if (!validateLoginForm()) {
            setMessage("Please correct the highlighted fields.");
            return;
        }

        try {
            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email: email.trim().toLowerCase(), password })
            });

            onLoginSuccess(data.user);
            navigate("/dashboard/calendar");
    } catch (err) {
            setMessage(err.message || "Server connection failed");
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    setResetMessage('');

        if (!resetEmail || !oldPassword || !newPassword) {
            setResetMessage("Email, old password, and new password are required");
            return;
    }

        if (!resetEmail.trim().toLowerCase().endsWith("@murraystate.edu")) {
            setResetMessage("Use your Murray State email address.");
            return;
        }

        if (newPassword.length < 14) {
            setResetMessage("New password must be at least 14 characters.");
            return;
        }

    try {
            await apiRequest("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email: resetEmail.trim().toLowerCase(), oldPassword, newPassword })
            });

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
        <AuthLayout title="Welcome Back" subtitle="Sign in to manage events, favorites, and organizations.">
            <form onSubmit={handleSubmit}>
                <FormField id="email" type="email" label="University Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required placeholder="name@murraystate.edu" error={fieldErrors.email}/>
                <FormField id="password" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" minLength={14} required error={fieldErrors.password} />

                <button type="submit">Login</button>
            </form>
            <StatusBanner message={message} />
                <p>
                        <button
                            type="button"
                            className="text-link"
                            onClick={() => {
                                setShowForgotPassword(!showForgotPassword);
                                setResetEmail(email);
                                setResetMessage('');
                            }}>
                            {showForgotPassword ? 'Cancel password reset' : 'Forgot password?'}
                        </button>
                </p>

            {showForgotPassword && (
                <form onSubmit={handleResetPassword}>
                    <FormField id="resetEmail" type="email" label="Account Email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                    <FormField id="oldPassword" type="password" label="Old Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                    <FormField id="newPassword" type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={14} required />

                    <button type="submit">Reset Password</button>
                </form>
            )}

            <StatusBanner type={resetMessage.includes("successful") || resetMessage.includes("reset") ? "success" : "error"} message={resetMessage} />

            <p>
        New user? <Link className="inline-link" to="/register">Create account</Link>
      </p>
    </AuthLayout>
    );
}

export default Login;