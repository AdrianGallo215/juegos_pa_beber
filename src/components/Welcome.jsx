import React, { useState } from 'react';
import { socket } from '../socket';

export default function Welcome({ onJoin }) {
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [mode, setMode] = useState('menu'); // menu, join

    const handleCreate = () => {
        if (!name) return alert('Por favor ingresa tu nombre');
        socket.connect();
        socket.emit('create_room', { playerName: name });
        // We listen for 'room_created' in App.jsx or here?
        // App.jsx is better to centrally manage state transition
    };

    const handleJoin = () => {
        if (!name || !roomCode) return alert('Completa los campos');
        socket.connect();
        socket.emit('join_room', { code: roomCode.toUpperCase(), playerName: name });
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

                {mode === 'menu' && (
                    <div className="grid-cols-2">
                        <button className="btn-primary" onClick={handleCreate}>
                            Crear Sala
                        </button>
                        <button className="btn-primary" style={{ backgroundColor: 'var(--secondary-bg)', border: '1px solid var(--primary)' }} onClick={() => setMode('join')}>
                            Unirse
                        </button>
                    </div>
                )}

                {mode === 'join' && (
                    <div className="animate-fade-in">
                        <div className="word-input-group">
                            <label>Código de Sala</label>
                            <input
                                className="input-field"
                                placeholder="ABCD"
                                value={roomCode}
                                onChange={e => setRoomCode(e.target.value)}
                                maxLength={4}
                            />
                        </div>
                        <div className="grid-cols-2">
                            <button className="btn-primary" onClick={handleJoin}>Entrar</button>
                            <button className="btn-danger" onClick={() => setMode('menu')}>Cancelar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
