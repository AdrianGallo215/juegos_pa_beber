import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { socket } from '../socket';

export default function Lobby({ roomCode, players, isHost }) {
    const startGame = () => {
        socket.emit('start_game', { code: roomCode });
    };

    return (
        <div className="container animate-fade-in">
            <h2 className="title" style={{ fontSize: '2rem' }}>Sala: {roomCode}</h2>

            <div className="card" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '1rem', marginBottom: '1rem' }}>
                    <QRCodeCanvas value={`http://local-ip-or-host:5173/?room=${roomCode}`} size={160} />
                </div>
                <p className="text-muted">Escanea para unirte (Si estás en la misma red)</p>
            </div>

            <div className="glass-panel">
                <h3 style={{ marginBottom: '1rem' }}>Jugadores ({players.length})</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {players.map(p => (
                        <span key={p.id} style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(139, 92, 246, 0.2)',
                            borderRadius: '2rem',
                            border: '1px solid var(--primary)'
                        }}>
                            {p.name}
                        </span>
                    ))}
                </div>
            </div>

            {isHost ? (
                <button className="btn-primary" onClick={startGame}>
                    Comenzar Juego
                </button>
            ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Esperando al anfitrión...</p>
            )}
        </div>
    );
}
