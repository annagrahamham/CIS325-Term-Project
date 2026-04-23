import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import StatusBanner from "../components/StatusBanner";
import { apiRequest } from "../lib/api";
import "../styles.css";

function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [MNumberID, setMNumberID] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("student");
    const [major, setMajor] = useState("");
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    function validateForm() {
        const nextErrors = {};
        const mNumberRegex = /^M\d{8}$/i;
        const phoneRegex = /^\d{10}$/;
        const normalizedEmail = email.trim().toLowerCase();

        if (!firstName.trim()) nextErrors.firstName = "First name is required.";
        if (!lastName.trim()) nextErrors.lastName = "Last name is required.";
        if (!normalizedEmail.endsWith("@murraystate.edu")) nextErrors.email = "Use your Murray State email address.";
        if (!mNumberRegex.test(MNumberID.trim())) nextErrors.mNumber = "Use format M######## (example: M12345678).";
        if (phone && !phoneRegex.test(phone)) nextErrors.phone = "Phone must be 10 digits.";
        if (password.length < 14) nextErrors.password = "Password must be at least 14 characters.";
        if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
        if (!role) nextErrors.role = "Role is required.";

        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

  async function handleSubmit(e) {
    e.preventDefault();
        setMessage("");

        if (!validateForm()) {
            setMessage("Please correct the highlighted fields.");
            return;
        }

        try {
            await apiRequest("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    MNumberID: MNumberID.trim().toUpperCase(),
                    email: email.trim().toLowerCase(),
                    password,
                    phone: phone || null,
                    role,
                    major: major.trim() || null
                })
            });

            navigate("/login");
    } catch (err) {
            setMessage(err.message || "Server connection failed");
    }
}

    return (
        <AuthLayout title="Create Account" subtitle="Register with your student, faculty, or staff information.">
            <form onSubmit={handleSubmit}>
                <FormField id="firstName" label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required error={fieldErrors.firstName} />
                <FormField id="lastName" label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required error={fieldErrors.lastName} />
                <FormField id="email" type="email" label="University Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mygatecode@murraystate.edu" required error={fieldErrors.email} />
                <FormField id="MNumberID" label="M Number" value={MNumberID} onChange={(e) => setMNumberID(e.target.value)} placeholder="M12345678" required error={fieldErrors.mNumber} />
                <FormField id="phone" type="tel" label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10 digits" error={fieldErrors.phone} />
                <FormField id="password" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={14} required error={fieldErrors.password} />
                <FormField id="confirmPassword" type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={14} required error={fieldErrors.confirmPassword} />
                <FormField id="role" label="Role" value={role} onChange={(e) => setRole(e.target.value)} required error={fieldErrors.role}
                    options={[
                        { value: "", label: "Select a role" },
                        { value: "student", label: "Student" },
                        { value: "faculty", label: "Faculty" },
                        { value: "staff", label: "Staff" }
                    ]}/>
                <FormField id="major" label="Major" value={major} onChange={(e) => setMajor(e.target.value)} />

                <button type="submit">Register</button>
                <p className="helper-row">Already have an account? <Link className="inline-link" to="/login">Login here</Link></p>
            
            </form>
            <StatusBanner message={message} />
        </AuthLayout>
    );
}

export default Register;