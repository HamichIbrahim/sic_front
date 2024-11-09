

// export default ChatRoomSelector;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './room.css';
import ChatRoom from './ChatRoom';
import './chatroom.css';

const ChatRoomSelector = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
    const [newRoomLabel, setNewRoomLabel] = useState('');
    const [newRoomPrivacy, setNewRoomPrivacy] = useState('public');
    const [isEditing, setIsEditing] = useState(false);
    const [editedRoomId, setEditedRoomId] = useState(null);

    // Fetch currentUser from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const token = localStorage.getItem('token'); // Retrieve the token
                const response = await axios.get('http://localhost:8080/api/v1/rooms', {
                    headers: {
                        Authorization: `Bearer ${token}`,  // Add the token to the headers
                    },
                });
                setChatRooms(response.data);
            } catch (error) {
                console.error('Error fetching chat rooms:', error);
            }
        };
        const storedRoom = localStorage.getItem('selectedRoom');
        if (storedRoom) {
            setSelectedRoom(JSON.parse(storedRoom));
        }

        fetchChatRooms();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            localStorage.setItem('selectedRoom', JSON.stringify(selectedRoom));
        } else {
            localStorage.removeItem('selectedRoom');
        }
    }, [selectedRoom]);

    const markUserAsInactive = async (roomId) => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token
            await axios.put(`http://localhost:8080/join/${currentUser.id}/${roomId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add the token to the headers
                },
            });
        } catch (error) {
            console.error('Error marking user as inactive:', error);
        }
    };

    const handleJoinRoom = async (room) => {
        if (selectedRoom) {
            await markUserAsInactive(selectedRoom.id);
        }

        try {
            const token = localStorage.getItem('token'); // Retrieve the token
            const joinResponse = await axios.post('http://localhost:8080/join', {
                userId: currentUser.id,
                roomId: room.id,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add the token to the headers
                },
            });

            if (joinResponse.status === 200) {
                setSelectedRoom(room);
                localStorage.setItem('room', JSON.stringify(room)); 
            } else {
                console.error('Failed to join the room');
            }
        } catch (error) {
            console.error('Error joining room:', error);
        }
    };

    const handleLeave = async () => {
        setSelectedRoom(null);
        if (selectedRoom) {
            await markUserAsInactive(selectedRoom.id);
        }  
    };
    const handleProfile = () => {
        // Redirect to profile page (replace with your actual route)
        window.location.href = '/profile';
    };
    const handleLogout = async () => {
        if (selectedRoom) {
            await markUserAsInactive(selectedRoom.id);
        }
        setSelectedRoom(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token'); // Remove the token on logout
        window.location.reload();
    };

    const handleCreateRoom = async () => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token
            const createRoomResponse = await axios.post('http://localhost:8080/api/v1/rooms/create', {
                label: newRoomLabel,
                createdBy: { id: currentUser.id, username: currentUser.username },
                isPrivate: newRoomPrivacy === 'private',
            }, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add the token to the headers
                },
            });
            if (createRoomResponse.status === 201) {
                setChatRooms([...chatRooms, createRoomResponse.data]);
                setShowCreateRoomForm(false);
                setNewRoomLabel('');
                setNewRoomPrivacy('public');
            }
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };

    const handleEditRoom = (room) => {
        setIsEditing(true);
        setEditedRoomId(room.id);
        setNewRoomLabel(room.label);
        setNewRoomPrivacy(room.isPrivate ? 'private' : 'public');
        setShowCreateRoomForm(true);
    };

    const handleSaveEditedRoom = async () => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token
            const editRoomResponse = await axios.put(`http://localhost:8080/api/v1/rooms/${editedRoomId}`, {
                label: newRoomLabel,
                createdBy: { id: currentUser.id, username: currentUser.username },
                isPrivate: newRoomPrivacy === 'private',
            }, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add the token to the headers
                },
            });
            if (editRoomResponse.status === 200) {
                const updatedRooms = chatRooms.map(room =>
                    room.id === editedRoomId ? editRoomResponse.data : room
                );
                setChatRooms(updatedRooms);
                setShowCreateRoomForm(false);
                setIsEditing(false);
                setNewRoomLabel('');
                setNewRoomPrivacy('public');
            }
        } catch (error) {
            console.error('Error editing room:', error);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token
            await axios.delete(`http://localhost:8080/api/v1/rooms/${roomId}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add the token to the headers
                },
            });
            setChatRooms(chatRooms.filter(room => room.id !== roomId));
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-room-selector">
                <div className="user-info">
                    <h2>{currentUser?.username}</h2>
                    <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                </div>
                <h2>Rooms</h2>
                <div className="chat-room-list">
                    {chatRooms.map((room) => (
                        <div key={room.id} onClick={() => handleJoinRoom(room)} className="chat-room">
                            <span>{room.label}</span>
                            {room.createdBy && room.createdBy.id === currentUser?.id && (
                                <div className="room-management" onClick={(e) => e.stopPropagation()}>
                                    <button className="manage-button">⋮</button>
                                    <div className="management-options">
                                        <button onClick={(e) => { e.stopPropagation(); handleEditRoom(room); }}>Edit</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }}>Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div>
                        <button className="create-room" onClick={() => setShowCreateRoomForm(true)}>Create New Room</button>
                    </div>
                </div>
            </div>
            <div className="chat-room-display">
                {selectedRoom ? (
                    <ChatRoom currentUser={currentUser} selectedRoom={selectedRoom} onLogout={handleLogout} onLeave={handleLeave} />
                ) : (
                    <div className="chat-area">
                        <h3>Select a room to start chatting.</h3>
                    </div>
                )}
            </div>

            {showCreateRoomForm && (
                <div className="create-room-popup">
                    <div className="create-room-form">
                        <h3>{isEditing ? 'Edit Room' : 'Create a New Room'}</h3>
                        <label>Room Label:</label>
                        <input
                            type="text"
                            value={newRoomLabel}
                            onChange={(e) => setNewRoomLabel(e.target.value)}
                        />
                        <label>Privacy:</label>
                        <select
                            value={newRoomPrivacy}
                            onChange={(e) => setNewRoomPrivacy(e.target.value)}
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <div className="form-buttons">
                            <button onClick={isEditing ? handleSaveEditedRoom : handleCreateRoom}>
                                {isEditing ? 'Save' : 'Create'}
                            </button>
                            <button onClick={() => {
                                setShowCreateRoomForm(false);
                                setIsEditing(false);
                                setNewRoomLabel('');
                                setNewRoomPrivacy('public');
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatRoomSelector;
