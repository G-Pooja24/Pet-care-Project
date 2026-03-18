import React, { useEffect } from 'react';
import './NotificationToast.css';

export default function NotificationToast({ message, type = 'info', onClose, duration = 5000 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className={`notification-toast ${type}`}>
            <div className="toast-content">
                <span className="toast-icon">
                    {type === 'success' && '✅'}
                    {type === 'info' && '🔔'}
                    {type === 'warning' && '⚠️'}
                </span>
                <p className="toast-message">{message}</p>
            </div>
            <button className="toast-close-btn" onClick={onClose}>&times;</button>
        </div>
    );
}
