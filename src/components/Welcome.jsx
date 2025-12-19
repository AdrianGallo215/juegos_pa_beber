import React, { useState } from 'react';
import { socket } from '../socket';


// Simple uuid replacement to avoid installing package if not needed
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default function Welcome({ onSessionSave }) {
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [mode, setMode] = useState('menu');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = () => {
        if (!name) return alert('Por favor ingresa tu nombre');
        setIsLoading(true);
        const playerId = generateUUID();

        // Save now
        onSessionSave({ playerId, roomCode: null, playerName: name }); // roomCode unknown yet, will update later?
        // Actually, we can't save roomCode until we get it.
        // But we need to send playerId.

        // Timeout check to warn user if server is unreachable
        const timer = setTimeout(() => {
            setIsLoading(false);
            alert('Error: No se recibió respuesta del servidor. \n1. Verifica que el servidor esté encendido. \n2. Si estás en Vercel, revisa que la variable VITE_API_URL sea correcta.');
        }, 5000);

        // One-time listeners to clear loading state
        const clear = () => { clearTimeout(timer); setIsLoading(false); };
        socket.once('room_created', clear);
        socket.once('error', (err) => { clear(); alert(err.message); });

        socket.connect();
        // We listen to room_created in App.jsx, but we need to intercept to save session fully
        // Or just save playerId now, and App.js updates session when room_created fires?

        // Let's pass the logic to App, or just emit here?
        // Emitting here is fine. App.jsx listeners will catch the result.
        // BUT App.jsx needs to know to save the session with the new code.
        // Let's modify App.jsx to save session on 'room_created' using the playerId it receives.
        // But App.jsx need to know the 'name' to save it?
        // Actually, room_created event sends back code and playerId.

        // Simplest: We save partial session here? Or just generate ID here.

        socket.emit('create_room', { playerName: name, playerId });

        // We also likely want to manually update the local storage "roomCode" once we get it.
        // Let's let App.jsx handle the response and storage. But App.jsx doesn't know the NAME unless we pass it.
        // We'll update persisted session in App.jsx when room_created/joined happens.
        // But we need to pass this 'playerId' we just made to App.jsx?
        // No, we emit it to server, server sends it back in 'room_created'.

        // Wait, if I emit here, App.jsx listener fires.
        // I need to ensure App.jsx saves the name too.
        // Maybe save name to localStorage here?
        localStorage.setItem('tuttifruti_temp_name', name);
    };

    const handleJoin = () => {
        if (!name || !roomCode) return alert('Completa los campos');
        setIsLoading(true);
        const pid = generateUUID();
        localStorage.setItem('tuttifruti_temp_name', name);

        const timer = setTimeout(() => {
            setIsLoading(false);
            alert('Error: No se pudo entrar a la sala. \nEl servidor puede estar desconectado o el código es incorrecto.');
        }, 5000);

        const clear = () => { clearTimeout(timer); setIsLoading(false); };
        socket.once('room_joined', clear);
        socket.once('error', (err) => { clear(); alert(err.message); });

        socket.connect();
        socket.emit('join_room', { code: roomCode.toUpperCase(), playerName: name, playerId: pid });
    };

    return (
        <div className="container animate-fade-in">
            <h1 className="title">TUTTIFRUTI</h1>

            <div className="card">
                <div className="word-input-group">
                    <label>Tu Nombre</label>
                    <input
                        className="input-field"
                        placeholder="Ej. Juan Mecánico"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                {mode === 'menu' ? (
                    <div className="grid-cols-2">
                        <button className="btn-primary" onClick={handleCreate} disabled={isLoading}>
                            {isLoading ? 'Creando...' : 'Crear Sala'}
                        </button>
                        <button className="btn-primary" style={{ backgroundColor: 'var(--secondary-bg)', border: '1px solid var(--primary)' }} onClick={() => setMode('join')} disabled={isLoading}>
                            Unirse
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <div className="word-input-group">
                            <label>Código de Sala</label>
                            <input
                                className="input-field"
                                placeholder="ABCD"
                                value={roomCode}
                                onChange={e => setRoomCode(e.target.value)}
                                maxLength={5}
                            />
                        </div>
                        <div className="grid-cols-2">
                            <button className="btn-primary" onClick={handleJoin} disabled={isLoading}>
                                {isLoading ? 'Entrando...' : 'Entrar'}
                            </button>
                            <button className="btn-danger" onClick={() => setMode('menu')} disabled={isLoading}>Cancelar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
