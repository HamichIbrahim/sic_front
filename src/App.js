import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './component/Login';
import Signup from './component/Signup';
import ChatRoomSelector from './component/Room';
import ChatRoom from './component/ChatRoom';

const App = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if there is a token in local storage
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token); // Update isAuthenticated based on token presence
        // Load current user from local storage if available
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []); // Empty dependency array ensures this runs only on mount
    return (
        <Router>
            <Routes>
                {/* Route for login */}
                <Route path="/login" element={<Login />} />

                {/* Default route redirects to login if not authenticated */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Route for signup */}
                <Route path="/signup" element={<Signup />} />

                {/* Route for chat room selection, protected by authentication */}
                <Route 
                    path="/chatrooms" 
                    element={
                        isAuthenticated ? (
                            <ChatRoomSelector/>
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
                                onLogout={() => {
                                    setCurrentUser(null); // Clear current user on logout
                                    localStorage.removeItem('token'); // Optionally clear the token
                                    localStorage.removeItem('currentUser'); // Clear currentUser on logout
                                }}
                                onLeave={() => setSelectedRoom(null)} // Reset selected room
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
