import React, { useState, useEffect } from 'react';
import { socket } from './socket';

import Welcome from './components/Welcome';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import VotingPhase from './components/VotingPhase';
import Scoreboard from './components/Scoreboard';

function App() {
  const [view, setView] = useState('WELCOME');
  const [roomCode, setRoomCode] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);

  const [roundData, setRoundData] = useState(null); // { round, letter, endTime, categories }
  const [votingData, setVotingData] = useState(null); // { targetPlayer, answers }
  const [leaderboard, setLeaderboard] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  // Persistent categories across rounds if needed, but we get them each round
  const [gameCategories, setGameCategories] = useState([]);

  useEffect(() => {
    // Check URL params
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    if (code) {
      // We could auto-set it in Welcome, but Welcome handles its own state for input.
      // We can pass initialCode prop to Welcome?
      // For now, let's just let user type name, but pre-fill code logic is inside Welcome ideally.
      // But Welcome component handles inputs.
    }

    // Socket Events
    socket.on('room_created', ({ code, playerId }) => {
      setRoomCode(code);
      setPlayerId(playerId);
      setIsHost(true);
      setView('LOBBY');
    });

    socket.on('room_joined', ({ code, playerId }) => {
      setRoomCode(code);
      setPlayerId(playerId);
      setIsHost(false);
      setView('LOBBY');
    });

    socket.on('update_players', (playerList) => {
      setPlayers(playerList);
    });

    socket.on('error', (err) => {
      alert(err.message);
    });

    socket.on('round_started', (data) => {
      setRoundData(data);
      setGameCategories(data.categories);
      setView('PLAYING');
    });

    socket.on('start_voting_phase', (data) => {
      // data: { targetPlayer, answers }
      setVotingData(data);
      setView('VOTING');
    });

    socket.on('round_ended', ({ leaderboard, isGameOver }) => {
      setLeaderboard(leaderboard);
      setIsGameOver(isGameOver);
      setView('RESULTS');
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('update_players');
      socket.off('error');
      socket.off('round_started');
      socket.off('start_voting_phase');
      socket.off('round_ended');
    };
  }, []);

  // Determine current content
  let content;
  switch (view) {
    case 'WELCOME':
      content = <Welcome />;
      break;
    case 'LOBBY':
      content = <Lobby roomCode={roomCode} players={players} isHost={isHost} />;
      break;
    case 'PLAYING':
      content = <GameBoard roomCode={roomCode} roundData={roundData} categories={gameCategories} />;
      break;
    case 'VOTING':
      content = <VotingPhase roomCode={roomCode} targetPlayer={votingData.targetPlayer} answers={votingData.answers} categories={gameCategories} roundData={roundData} />;
      break;
    case 'RESULTS':
      content = <Scoreboard leaderboard={leaderboard} isHost={isHost} roomCode={roomCode} isGameOver={isGameOver} />;
      break;
    default:
      content = <Welcome />;
  }

  return (
    <div className="app-root">
      {content}
    </div>
  );
}

export default App;
