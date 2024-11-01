import React from 'react';
import './ViewerPopup.css'; // Create this CSS file for styling

const ViewerPopup = ({ viewers, onClose }) => {
    return (
        <div className="viewer-popup-overlay" onClick={onClose}>
            <div className="viewer-popup" onClick={(e) => e.stopPropagation()}>
                <h4>viewers</h4>
                <ul>
                    {viewers.map(viewer => (
                        <li key={viewer.id}>{viewer.username}</li>
                    ))}
                </ul>
               
            </div>
        </div>
    );
};

export default ViewerPopup;
