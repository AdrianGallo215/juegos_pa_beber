import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

// Helper to get my ID
function getMyId() {
    try {
        const stored = localStorage.getItem('tuttifruti_session');
        return stored ? JSON.parse(stored).playerId : null;
    } catch { return null; }
}

export default function VotingPhase({ roomCode, targetPlayer, answers, categories }) {
    const [votes, setVotes] = useState({});
    const myId = getMyId();
    const isTargetMe = targetPlayer.id === myId;

    useEffect(() => {
        // Reset votes when target player changes
        // If it's me, I don't vote (or it's read-only)
        const init = {};
        categories.forEach(c => init[c] = true); // Default to VALID (True)
        setVotes(init);
    }, [targetPlayer, categories]);

    const toggleVote = (cat) => {
        if (isTargetMe) return; // Disable toggling for self
        setVotes(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const submitVotes = () => {
        // Logic for self: Send empty or all-true? 
        // Server ignores self-votes for tally, but needs the event to progress.
        // So we send whatever.
        socket.emit('submit_votes', { code: roomCode, targetPlayerId: targetPlayer.id, votes });
    };

    return (
        <div className="container animate-fade-in">
            <h2 className="title" style={{ fontSize: '2rem' }}>Revisando: {targetPlayer.name} {isTargetMe ? '(Tú)' : ''}</h2>
            {isTargetMe && <p className="text-muted" style={{ textAlign: 'center', marginBottom: '1rem' }}>Espera a que los demás voten tus respuestas</p>}

            <div className="card" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                {categories.map(cat => (
                    <div key={cat}
                        onClick={() => toggleVote(cat)}
                        style={{
                            padding: '1rem',
                            background: votes[cat] ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${votes[cat] ? 'var(--success)' : 'var(--error)'}`,
                            borderRadius: '0.75rem',
                            marginBottom: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: isTargetMe ? 'default' : 'pointer',
                            opacity: isTargetMe ? 0.8 : 1
                        }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                {answers[cat] || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>(Vacío)</span>}
                            </div>
                        </div>
                        <div style={{
                            fontSize: '1.5rem',
                            color: votes[cat] ? 'var(--success)' : 'var(--error)'
                        }}>
                            {votes[cat] ? '✓' : '✗'}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
                {/* Always show button to "confirm" and wait */}
                <button className="btn-primary" onClick={submitVotes}>
                    {isTargetMe ? 'Continuar' : 'Confirmar Votos'}
                </button>
            </div>
        </div>
    );
}
