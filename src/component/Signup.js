import React, { useState } from 'react';
import axios from 'axios';
import './login.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/auth/signup', {
                username,
                password
            });

            navigate('/login'); // Redirect to login page after successful signup
        } catch (err) {
            if (err.response && err.response.status === 409) {
                // User already exists (HTTP 409 Conflict)
                setError('User already exists. Please try a different username.');
            } else {
                // Other errors
                setError('Error creating account. Please try again.');
            }
        }
    };

    return (
        <div className="signup-container">
            <h1 className="h3 mb-3 fw-normal text-light">Sign up</h1>
            <form onSubmit={handleSignup} className="signup-form">
                <div className="form-floating mb-3">
                    <label htmlFor="username" className="te">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-floating mb-3">
                    <label htmlFor="password" className="te">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary w-100 py-2" type="submit">Sign up</button>
                {error && <p className="text-danger">{error}</p>}
            </form>
            <p className="login-link">
                Already have an account? <span onClick={() => navigate('/login')} className="link">Log in here</span>
            </p>
        </div>
    );
};

export default Signup;
