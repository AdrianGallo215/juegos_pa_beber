import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

// Helper to get my ID
function getMyId() {
    try {
        const stored = localStorage.getItem('tuttifruti_session');
        return stored ? JSON.parse(stored).playerId : null;
    } catch { return null; }
}

export default function VotingPhase({ roomCode, targetPlayer, answers, categories, letter }) {
    const [votes, setVotes] = useState({});
    const [progress, setProgress] = useState(null); // { voters: [], totalNeeded: 0 }
    const myId = getMyId();
    const isTargetMe = targetPlayer.id === myId;
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        // Listen for progress
        const onProgress = (data) => setProgress(data);
        socket.on('voting_progress', onProgress);
        return () => socket.off('voting_progress', onProgress);
    }, []);

    useEffect(() => {
        // Reset logic when target changes
        const init = {};
        categories.forEach(c => {
            const word = answers[c] || '';
            // Auto-validate based on letter (case insensitive)
            const isValidStart = word.trim().toUpperCase().startsWith(letter.toUpperCase());
            init[c] = isValidStart;
        });
        setVotes(init);
        setHasVoted(false);
        setProgress(null);
    }, [targetPlayer, categories, letter, answers]);

    const toggleVote = (cat) => {
        if (isTargetMe || hasVoted) return;
        setVotes(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const submitVotes = () => {
        socket.emit('submit_votes', { code: roomCode, targetPlayerId: targetPlayer.id, votes });
        setHasVoted(true);
    };

    return (
        <div className="container animate-fade-in">
            <h2 className="title" style={{ fontSize: '2rem' }}>Revisando: {targetPlayer.name} {isTargetMe ? '(Tú)' : ''}</h2>

            <div className="card" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
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
                            cursor: (isTargetMe || hasVoted) ? 'default' : 'pointer',
                            opacity: (isTargetMe || hasVoted) ? 0.8 : 1
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

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                {!isTargetMe && !hasVoted && (
                    <button className="btn-primary" onClick={submitVotes}>
                        Confirmar Votos
                    </button>
                )}

                {(isTargetMe || hasVoted) && (
                    <div className="text-muted" style={{ fontStyle: 'italic' }}>
                        Esperando a los demás...
                        {progress && ` (${progress.voters.length}/${progress.totalNeeded})`}
                    </div>
                )}
            </div>
        </div>
    );
}
