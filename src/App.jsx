import React, { useState, useEffect } from 'react';
import { socket } from './socket';

import Welcome from './components/Welcome';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import VotingPhase from './components/VotingPhase';
import Scoreboard from './components/Scoreboard';

// Helper for session
function getSession() {
  try {
    const stored = localStorage.getItem('tuttifruti_session');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

function saveSession(data) {
  localStorage.setItem('tuttifruti_session', JSON.stringify(data));
}

function App() {
  const [view, setView] = useState('LOADING');
  const [roomCode, setRoomCode] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);

  const [roundData, setRoundData] = useState(null);
  const [votingData, setVotingData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameCategories, setGameCategories] = useState([]);
  const [rejoinedAnswers, setRejoinedAnswers] = useState(null);

  useEffect(() => {
    const session = getSession();
    socket.connect();

    if (session && session.roomCode && session.playerId) {
      console.log("Attempting to rejoin...", session);
      socket.emit('rejoin_request', {
        playerId: session.playerId,
        roomCode: session.roomCode,
        playerName: session.playerName
      });
    } else {
      setView('WELCOME');
    }

    socket.on('room_created', ({ code, playerId }) => {
      setRoomCode(code);
      setPlayerId(playerId);
      setIsHost(true);
      setView('LOBBY');
      const name = localStorage.getItem('tuttifruti_temp_name') || 'Anfitrión';
      saveSession({ roomCode: code, playerId, playerName: name });
    });

    socket.on('room_joined', ({ code, playerId }) => {
      setRoomCode(code);
      setPlayerId(playerId);
      setIsHost(false);
      setView('LOBBY');
      const name = localStorage.getItem('tuttifruti_temp_name') || 'Jugador';
      saveSession({ roomCode: code, playerId, playerName: name });
    });

    socket.on('state_restored', (state) => {
      setRoomCode(state.roomCode);
      setPlayerId(state.playerId);
      setIsHost(state.isHost);
      setPlayers(state.players);

      // Save session just in case
      saveSession({ roomCode: state.roomCode, playerId: state.playerId, playerName: state.players.find(p => p.id === state.playerId)?.name });

      if (state.roundData) {
        setRoundData(state.roundData);
        setGameCategories(state.roundData.categories);
      }

      if (state.myAnswers) {
        setRejoinedAnswers(state.myAnswers);
      }

      switch (state.state) {
        case 'LOBBY': setView('LOBBY'); break;
        case 'PLAYING':
        case 'COLLECTING_ANSWERS':
        case 'VOTING_TRANSITION':
          setView('PLAYING');
          break;
        case 'VOTING': setView('VOTING'); break;
        case 'ROUND_RESULTS': setView('RESULTS'); break;
        default: setView('WELCOME');
      }
    });

    socket.on('error', (err) => {
      if (err.code === 'REJOIN_FAILED') {
        localStorage.removeItem('tuttifruti_session');
        setView('WELCOME');
      } else {
        console.error(err);
      }
    });

    socket.on('update_players', (playerList) => {
      setPlayers(playerList);
    });

    socket.on('round_started', (data) => {
      setRoundData(data);
      setGameCategories(data.categories);
      setRejoinedAnswers(null);
      setView('PLAYING');
    });

    socket.on('start_voting_phase', (data) => {
      setVotingData(data);
      setView('VOTING');
    });

    socket.on('game_reset', ({ players }) => {
      // Reset local state to Lobby
      setPlayers(players);
      setView('LOBBY');
      setRoundData(null);
      setVotingData(null);
      setLeaderboard([]);
      setIsGameOver(false);
    });

    socket.on('round_ended', ({ leaderboard, isGameOver, roundDetails, categories }) => {
      setLeaderboard(leaderboard);
      setIsGameOver(isGameOver);

      // Pass extra data for Scoreboard
      // Note: roundData might have outdated categories if new ones generated? 
      // Better to use passed categories or keep current.
      // We'll store it in a temp state or pass directly via props if View updates
      setRoundData(prev => ({ ...prev, details: roundDetails, categoriesOverride: categories }));
      setView('RESULTS');
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('state_restored');
      socket.off('error');
      socket.off('update_players');
      socket.off('round_started');
      socket.off('start_voting_phase');
      socket.off('round_ended');
      socket.off('game_reset');
    };
  }, []);

  const handleLeave = () => {
    localStorage.removeItem('tuttifruti_session');
    window.location.href = '/'; // Full reload to clear memory
  };

  let content;
  switch (view) {
    case 'LOADING':
      content = <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}><h1 className="title">Conectando...</h1></div>;
      break;
    case 'WELCOME':
      content = <Welcome onSessionSave={saveSession} />;
      break;
    case 'LOBBY':
      content = <Lobby roomCode={roomCode} players={players} isHost={isHost} />;
      break; // Lobby needs to handle "leave" to clear session? For now, automatic persistence is desired.
    case 'PLAYING':
      content = <GameBoard
        roomCode={roomCode}
        roundData={roundData}
        categories={gameCategories}
        initialAnswers={rejoinedAnswers}
      />;
      break;
    case 'VOTING':
      content = <VotingPhase
        roomCode={roomCode}
        targetPlayer={votingData ? votingData.targetPlayer : {}}
        answers={votingData ? votingData.answers : {}}
        categories={gameCategories}
      // We need roundData for context if needed, but VotingPhase props usually sufficient
      />;
      break;
    case 'RESULTS':
      content = <Scoreboard
        leaderboard={leaderboard}
        isHost={isHost}
        roomCode={roomCode}
        isGameOver={isGameOver}
        roundDetails={roundData ? roundData.details : []}
        categories={gameCategories}
        onLeave={handleLeave}
      />;
      break;
    default:
      content = <Welcome onSessionSave={saveSession} />;
  }

  return (
    <div className="app-root">
      {content}
    </div>
  );
}

export default App;
