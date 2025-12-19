import React, { useState } from 'react';
import { socket } from '../socket';

export default function Scoreboard({ leaderboard, isHost, roomCode, isGameOver, roundDetails, categories, onLeave }) {
    const [showDetails, setShowDetails] = useState(false);

    const handleNext = () => {
        if (isGameOver) {
            socket.emit('reset_game', { code: roomCode });
        } else {
            socket.emit('start_game', { code: roomCode });
        }
    };

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '1000px' }}>
            <h1 className="title">{isGameOver ? '¡FIN DEL JUEGO!' : 'Resultados de Ronda'}</h1>

            <div className="grid-cols-2" style={{ marginBottom: '1rem' }}>
                <button className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--text-muted)', fontSize: '1rem' }} onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? 'Ver Puntajes' : 'Ver Detalles'}
                </button>
                <button className="btn-danger" style={{ fontSize: '1rem' }} onClick={onLeave}>
                    Salir de Sala
                </button>
            </div>

            {!showDetails ? (
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
                                </div>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {player.score} pts
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--text-muted)' }}>Jugador</th>
                                {categories.map(c => (
                                    <th key={c} style={{ padding: '0.5rem', borderBottom: '1px solid var(--text-muted)' }}>{c}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {roundDetails && roundDetails.map(p => (
                                <tr key={p.id}>
                                    <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>{p.name}</td>
                                    {categories.map(c => {
                                        const isValid = p.validations && p.validations[c];
                                        const word = p.answers && p.answers[c];
                                        return (
                                            <td key={c} style={{
                                                padding: '0.5rem',
                                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                                color: isValid ? 'var(--success)' : 'var(--error)'
                                            }}>
                                                {word || '-'} {isValid ? '✓' : '✗'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isHost && (
                <div style={{ marginTop: '2rem' }}>
                    <button className="btn-primary" onClick={handleNext}>
                        {isGameOver ? 'Jugar de Nuevo' : 'Siguiente Ronda ->'}
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
