import React, { useEffect } from 'react';
import './Notification.css';

const Notification = ({ id, message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 3000);

        return () => clearTimeout(timer);
    }, [id, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
            default:
                return 'ℹ';
        }
    };

    return (
        <div className={`notification notification-${type}`}>
            <div className="notification-icon">{getIcon()}</div>
            <div className="notification-message">{message}</div>
            <button className="notification-close" onClick={() => onClose(id)}>
                ×
            </button>
        </div>
    );
};

export default Notification;
