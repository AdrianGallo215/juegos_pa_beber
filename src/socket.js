import io from 'socket.io-client';

// Dynamic URL determination
const getSocketUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // If running in development local, use localhost
    if (import.meta.env.MODE === 'development') {
        return 'http://localhost:3000';
    }
    // Default to relative (same origin) for production if VITE_API_URL not set
    // This assumes the API is served from the same domain/port
    return window.location.origin;
};

export const socket = io(getSocketUrl(), {
    autoConnect: false,
    transports: ['websocket', 'polling'] // Enforce robust transports
});
