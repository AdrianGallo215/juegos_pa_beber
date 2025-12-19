import React, { useEffect, useState } from 'react';

export default function PlayerSummary({ data }) {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!data) return null;

    const { player, roundScore, totalScore, details } = data;

    return (
        <div className="container animate-fade-in" style={{ textAlign: 'center' }}>
            <h2 className="title">{player.name}</h2>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)' }}>
                    +{roundScore} pts
                </div>
                <div className="text-muted">Puntaje Total: {totalScore}</div>
            </div>

            <div className="card" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                    <tbody>
                        {Object.entries(details).map(([cat, res]) => (
                            <tr key={cat} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <td style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{cat}</td>
                                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{res.word || '-'}</td>
                                <td style={{ padding: '0.5rem', textAlign: 'right', color: res.valid ? 'var(--success)' : 'var(--error)' }}>
                                    {res.valid ? 'Aprobado' : 'Rechazado'}
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                        {res.votesFor} vs {res.votesAgainst}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '2rem', fontSize: '1.2rem' }}>
                Siguiente en {countdown}...
            </div>
        </div>
    );
}
