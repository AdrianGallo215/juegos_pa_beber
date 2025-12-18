import io from 'socket.io-client';

// Replace with your local IP if testing on mobile, or localhost
const URL = 'http://localhost:3000';

export const socket = io(URL, {
    autoConnect: false
});
