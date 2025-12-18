import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

export default function GameBoard({ roomCode, roundData, categories }) {
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        // Initialize answers
        const init = {};
        categories.forEach(c => init[c] = '');
        setAnswers(init);

        // Timer logic
        const interval = setInterval(() => {
            const seconds = Math.floor((roundData.endTime - Date.now()) / 1000);
            setTimeLeft(Math.max(0, seconds));
            if (seconds <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [roundData, categories]);

    const handleChange = (cat, val) => {
        setAnswers(prev => ({ ...prev, [cat]: val }));
    };

    const handleStop = () => {
        // Only if all filled? or allow partials? 
        // Usually STOP requires valid effort.
        // Let's allow anytime but maybe warn if empty?
        // Let's just send stop.
        socket.emit('stop_round', { code: roomCode });
        // Also submit answers immediately just in case
        socket.emit('submit_answers', { code: roomCode, answers });
    };

    // Listen for request_answers in App.jsx usually, 
    // but if we are mounted, we can listen here?
    // Better in App.jsx to avoid mounting issues. 
    // But App.jsx needs access to `answers`.
    // So we should hoist state to App.jsx OR use a ref/effect here that listens.

    useEffect(() => {
        // Create a listener specific to this component instance
        const submitHandler = () => {
            socket.emit('submit_answers', { code: roomCode, answers });
        };

        socket.on('request_answers', submitHandler);
        return () => socket.off('request_answers', submitHandler);
    }, [answers, roomCode]); // Re-bind when answers change

    return (
        <div className="container animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <span className="text-muted">Ronda {roundData.round}</span>
                    <h2 className="title" style={{ textAlign: 'left', margin: 0, fontSize: '4rem' }}>{roundData.letter}</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: timeLeft < 10 ? 'var(--accent)' : 'var(--text-main)' }}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <span className="text-muted">Tiempo Restante</span>
                </div>
            </div>

            <div className="card" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {categories.map(cat => (
                    <div key={cat} className="word-input-group">
                        <label>{cat}</label>
                        <input
                            className="input-field"
                            value={answers[cat] || ''}
                            onChange={e => handleChange(cat, e.target.value)}
                            placeholder={`Empieza con ${roundData.letter}...`}
                            autoComplete="off"
                        />
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
                <button className="btn-danger" style={{ width: '100%', fontSize: '1.5rem', padding: '1.5rem' }} onClick={handleStop}>
                    ¡STOP! ✋
                </button>
            </div>
        </div>
    );
}
