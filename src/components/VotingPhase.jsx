import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import clsx from 'clsx'; // I assumed I have this, if not I'll just use template strings. I installed it.

export default function VotingPhase({ roomCode, targetPlayer, answers, categories, roundData }) {
    const [votes, setVotes] = useState({});

    useEffect(() => {
        // Reset votes when target player changes
        const init = {};
        categories.forEach(c => init[c] = true); // Default to VALID (True)
        setVotes(init);
    }, [targetPlayer, categories]);

    const toggleVote = (cat) => {
        setVotes(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const submitVotes = () => {
        socket.emit('submit_votes', { code: roomCode, targetPlayerId: targetPlayer.id, votes });
        // Show "Waiting" state locally? 
        // Or just wait for next event.
    };

    return (
        <div className="container animate-fade-in">
            <h2 className="title" style={{ fontSize: '2rem' }}>Revisando: {targetPlayer.name}</h2>

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
                            cursor: 'pointer',
                            transition: 'all 0.2s'
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
                <button className="btn-primary" onClick={submitVotes}>
                    Confirmar Votos
                </button>
            </div>
        </div>
    );
}
