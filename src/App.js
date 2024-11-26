import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './component/Login';
import Signup from './component/Signup';
import ChatRoomSelector from './component/Room';
import ChatRoom from './component/ChatRoom';

const App = () => {
    const [currentUser, setCurrentUser] = useState(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const token = localStorage.getItem('token');
        return !!token;
    });

    useEffect(() => {
        // Check for updates in authentication status on every render
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token); // Set isAuthenticated based on the presence of token
    }, [currentUser]);

    const handleLogout = () => {
        setCurrentUser(null); // Clear current user on logout
        setIsAuthenticated(false); // Update auth state
        localStorage.removeItem('token'); // Clear the token
        localStorage.removeItem('currentUser'); // Clear currentUser
    };

    return (
        <Router>
            <Routes>
                {/* Route for login, redirecting to chatrooms if already authenticated */}
                <Route 
                    path="/login" 
                    element={
                        isAuthenticated ? (
                            <Navigate to="/chatrooms" />
                        ) : (
                            <Login setCurrentUser={setCurrentUser} setIsAuthenticated={setIsAuthenticated} />
                           
                        )
                    } 
                />
{
<Route 
                    path="/singup" 
                    element={
                        isAuthenticated ? (
                            <Navigate to="/chatrooms" />
                        ) : (
                            <Signup/>
                        )
                    } 
                />}


                {/* Default route redirects to login if not authenticated */}
                <Route path="/" element={<Navigate to={isAuthenticated ? "/chatrooms" : "/login"} />} />

                {/* Route for signup */}
                <Route path="/signup" element={<Signup setCurrentUser={setCurrentUser} setIsAuthenticated={setIsAuthenticated} />} />

                {/* Route for chat room selection, protected by authentication */}
                <Route 
                    path="/chatrooms" 
                    element={
                        isAuthenticated ? (
                            <ChatRoomSelector 
                                currentUser={currentUser}
                                setSelectedRoom={setSelectedRoom}
                            />
                        ) : (
                            <Navigate to="/login" />
                        )
                    } 
                />

                {/* Route for specific chat room, protected by authentication */}
                <Route 
                    path="/chatroom/:roomId" 
                    element={
                        isAuthenticated ? (
                            <ChatRoom
                                currentUser={currentUser}
                                selectedRoom={selectedRoom}
                                onLogout={handleLogout}
                                onLeave={() => setSelectedRoom(null)}
                            />
                        ) : (
                            <Navigate to="/login" />
                        )
                    } 
                />

                {/* Redirect if authenticated */}
                <Route path="*" element={<Navigate to={isAuthenticated ? "/chatrooms" : "/login"} />} />
            </Routes>
        </Router>
    );
};

export default App;
