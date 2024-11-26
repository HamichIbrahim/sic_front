import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './chatroom.css';
import './ViewerPopup.css'; // Import the CSS for the viewer popup
import ViewerPopup from './popup'; // Import the viewer popup component

import profileImage from './profile.png';
import seenIcon from './double-check.png'; // Add a suitable seen icon image for seen messages
import multipleSeenIcon from './icons8-select-24.png'; // Add a suitable icon for multiple viewers

const ChatRoom = ({ currentUser, selectedRoom, onLogout, onLeave}) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [unseenMessageIds, setUnseenMessageIds] = useState([]);
    const [viewers, setViewers] = useState({});
    const [showViewerPopup, setShowViewerPopup] = useState(null);
    const chatAreaRef = useRef(null);
    const endOfMessagesRef = useRef(null); // A ref to track the bottom of the messages
    const token = localStorage.getItem('token');
    const scrollToBottom = () => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToUnseenMessage = (unseenMessages) => {
        if (unseenMessages.length > 0) {
            const firstUnseenMessageId = unseenMessages[0].id;
            const unseenMessageElement = document.getElementById(`message-${firstUnseenMessageId}`);
            if (unseenMessageElement) {
                unseenMessageElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/message/${selectedRoom.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the header
                },
            });
            setMessages(response.data);

            const unseenResponse = await axios.get(`http://localhost:8080/message/${selectedRoom.id}/${currentUser.id}/unseenMessages`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const unseenMessages = unseenResponse.data;

            if (unseenMessages.length > 0) {
                setUnseenMessageIds(unseenMessages.map(msg => msg.id));
                await axios.post(`http://localhost:8080/message/${selectedRoom.id}/${currentUser.id}/markseen`, unseenMessages.map(msg => msg.id), {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Include the token in the header
                    },
                });
                scrollToUnseenMessage(unseenMessages);
            }

            // Fetch viewers for each message
            response.data.forEach(async (msg) => {
                const viewersResponse = await axios.get(`http://localhost:8080/message/${selectedRoom.id}/${msg.id}/${currentUser.id}/viewers`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the header
                    },
                });
                setViewers(prevViewers => ({
                    ...prevViewers,
                    [msg.id]: viewersResponse.data
                }));
            });

            // Scroll to bottom after initial fetch
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const markMessageAsSeen = async (messageId) => {
        try {
            await axios.post(`http://localhost:8080/message/${selectedRoom.id}/${currentUser.id}/markseen`, [messageId], {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Include the token in the header
                },
            });
        } catch (error) {
            console.error('Error marking message as seen:', error);
        }
    };

    // Set up the SSE connection for real-time updates
    useEffect(() => {
        let hasFetchedUnseenMessages = false; // Flag to prevent fetching multiple times
        const handleMouseMove = async () => {
            if (!hasFetchedUnseenMessages) {
                try {
                    // Fetch unseen messages
                    const unseenResponse = await axios.get(`http://localhost:8080/message/${selectedRoom.id}/${currentUser.id}/unseenMessages`, {
                        headers: {
                            Authorization: `Bearer ${token}`, // Include the token in the header
                        },
                    });
                    const unseenMessages = unseenResponse.data;
                    if (unseenMessages.length > 0) {
                        setUnseenMessageIds(unseenMessages.map((msg) => msg.id));

                        // Mark unseen messages as seen
                        await axios.post(
                            `http://localhost:8080/message/${selectedRoom.id}/${currentUser.id}/markseen`,
                            unseenMessages.map((msg) => msg.id),
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`, // Include the token in the header
                                },
                            }
                        );
                        scrollToUnseenMessage(unseenMessages);
                    }
                } catch (error) {
                    console.error("Error fetching unseen messages:", error);
                }

                hasFetchedUnseenMessages = true;
            }
        };

        if (selectedRoom?.id) {
            fetchMessages(); // Fetch initial messages when the room is selected
            // Set up SSE connection
            const eventSource = new EventSource(`http://localhost:8080/message/sse/room/${selectedRoom.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the header for SSE
                },
            });
            eventSource.onopen = () => {
                console.log("Connection to server opened.");
            };

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.message) {
                    markMessageAsSeen(data.id);
                    setMessages((prevMessages) => [...prevMessages, data]);
                    scrollToBottom();
                } else {
                    // Handle viewer update
                    console.log(data);
                    setViewers((prevViewers) => ({
                        ...prevViewers,
                        [data.messageId]: data.viewers,
                    }));
                }
            };

            // Add mousemove listener
            document.addEventListener('mousemove', handleMouseMove);

            return () => {
                eventSource.close(); // Close the connection when component unmounts
                document.removeEventListener('mousemove', handleMouseMove); // Clean up listener on unmount
            };
        }
    }, [selectedRoom?.id]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (message.trim()) {
            const newMessage = {
                message: message,
                user: { id: currentUser.id, username: currentUser.username },
                room: { id: selectedRoom.id, label: selectedRoom.label }
            };

            try {
                await axios.post('http://localhost:8080/message', newMessage, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Include the token in the header
                    },
                });
                setMessage(''); // Clear input after sending
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const toggleViewerPopup = (messageId) => {
        if (showViewerPopup === messageId) {
            setShowViewerPopup(null); // Hide viewer list
        } else {
            setShowViewerPopup(messageId); // Show viewer list
        }
    };

    return (
        <div className="chatroom-container">
            <nav className="navbar">
                <span>
                    <img src={profileImage} alt="Avatar" className="avatar" />
                </span>
                <span className="navbar-user"> {currentUser.username}</span>
                <button className="leave-room-btn" onClick={onLeave}>Leave Room</button>
            </nav>

            <div className="chat-area" ref={chatAreaRef}>
                <h3>{selectedRoom.label}</h3>
                <div className="message-list">
                {messages.map((msg) => (
    <div key={msg.id} id={`message-${msg.id}`} className={`message ${msg.user?.id === currentUser?.id ? 'sent' : 'received'}`}>
        <img src={profileImage} alt="Avatar" className="avatar" />
        <div className="message-content">
    <strong>{msg.user ? msg.user.username : 'Unknown User'}:</strong>
    <br />
    {msg.message || ''}
    <div className="message-date">
        {new Date(msg.date).toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })}
    </div>
</div>

        {msg.user.id === currentUser.id && (
            <div className="message-viewers" onClick={() => toggleViewerPopup(msg.id)}>
                {viewers[msg.id]?.length >0 ? (
                    <img src={seenIcon} alt="Seen" className="viewer-icon" />
                ) : (
                    <img src={multipleSeenIcon} alt="Multiple Viewers" className="viewer-icon" />
                )}
                <span className="viewers-count">{viewers[msg.id]?.length || 0}</span>
            </div>
        )}
    </div>
))}
                    <div ref={endOfMessagesRef} />
                </div>
            </div>

            {showViewerPopup && viewers[showViewerPopup] && (
                <ViewerPopup viewers={viewers[showViewerPopup]} onClose={() => setShowViewerPopup(null)} />
            )}

            <form onSubmit={sendMessage} className="message-form">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                />
                <button type="submit" className="send-btn">Send</button>
            </form>
        </div>
    );
};

export default ChatRoom;
