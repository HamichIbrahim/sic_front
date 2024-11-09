import React, { useState } from 'react';
import axios from 'axios';
import './login.css';
import { useNavigate } from 'react-router-dom';

const Login = ({ setCurrentUser, setIsAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/auth/signin', {
                username,
                password
            });
            const jwtToken = response.data.token;
            const userInfo = {
                id: response.data.id,
                username: response.data.username
            };
            console.log("Logged in user info: ", userInfo);
            
            localStorage.setItem('currentUser', JSON.stringify(userInfo));
            localStorage.setItem('token', jwtToken);
            
            setCurrentUser(userInfo); // Update currentUser in App
            setIsAuthenticated(true); // Update isAuthenticated in App
            navigate('/chatrooms'); // Navigate to chatrooms
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="login-container">
            <h1 className="h3 mb-3 fw-normal text-light">Please sign in</h1>
            <form onSubmit={handleLogin} className="login-form">
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
                <button className="btn btn-primary w-100 py-2" type="submit">Sign in</button>
                {error && <p className="text-danger">{error}</p>}
            </form>
            <p className="signup-link">
                Don't have an account? <span className="link">Sign up here</span>
            </p>
        </div>
    );
};

export default Login;
