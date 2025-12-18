import React from 'react';
import { socket } from '../socket';

export default function Scoreboard({ leaderboard, roundScore, isHost, roomCode, isGameOver }) {

    const handleNext = () => {
        if (isGameOver) {
            // Maybe reset? 
            window.location.reload();
        } else {
            socket.emit('start_game', { code: roomCode }); // Starts next round
        }
    };

    return (
        <div className="container animate-fade-in">
            <h1 className="title">{isGameOver ? '¡FIN DEL JUEGO!' : 'Resultados'}</h1>

            <div className="card">
                {leaderboard.map((player, idx) => (
                    <div key={player.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                color: idx === 0 ? '#fbbf24' : 'var(--text-muted)',
                                width: '30px'
                            }}>
                                #{idx + 1}
                            </span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{player.name}</div>
                                {/* If we had roundScore breakdown, we could show it here */}
                            </div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            {player.score} pts
                        </div>
                    </div>
                ))}
            </div>

            {isHost && (
                <div style={{ marginTop: '2rem' }}>
                    <button className="btn-primary" onClick={handleNext}>
                        {isGameOver ? 'Nuevo Juego' : 'Siguiente Ronda ->'}
                    </button>
                </div>
            )}
            {!isHost && (
                <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
                    Esperando al anfitrión...
                </p>
            )}
        </div>
    );
}
