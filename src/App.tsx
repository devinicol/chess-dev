import { useState, useEffect } from 'react';
import './App.css';
import Chessboard from './components/Chessboard';
import GameInfo from './components/GameInfo';
import { Chess } from 'chess.js/dist/esm/chess';
import { initializePieces } from './utils/initPieces';

function App() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<any[]>([]);
  const [status, setStatus] = useState('Click "New Game" to start playing');
  const [promotionSquare, setPromotionSquare] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{from: string, to: string} | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{ w: string[], b: string[] }>({ w: [], b: [] });
  const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'w' | 'b'>('w');
  const [piecesLoaded, setPiecesLoaded] = useState(false);
  useEffect(() => {
    // Initialize and preload pieces
    initializePieces();
    setPiecesLoaded(true);
  }, []);

  useEffect(() => {
    updateGameState();
  }, [game]);
  const updateGameState = () => {
    // Update current player
    setCurrentPlayer(game.turn() as 'w' | 'b');
    
    // Update game status
    let statusText = '';
    if (!gameStarted) {
      statusText = 'Click "New Game" to start playing';
    } else if (game.isCheckmate()) {
      statusText = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
    } else if (game.isDraw()) {
      statusText = 'Game ended in a draw';
      if (game.isStalemate()) statusText += ' (Stalemate)';
      if (game.isInsufficientMaterial()) statusText += ' (Insufficient material)';
      if (game.isThreefoldRepetition()) statusText += ' (Threefold repetition)';
    } else if (game.isCheck()) {
      statusText = `${game.turn() === 'w' ? 'White' : 'Black'} is in check`;
    } else {
      statusText = `${game.turn() === 'w' ? 'White' : 'Black'} to move`;
    }
    setStatus(statusText);
    
    // Update move history
    const history = game.history({ verbose: true });
    setMoveHistory(history);
    
    // Set last move for highlighting
    if (history.length > 0) {
      const lastMoveDetail = history[history.length - 1];
      setLastMove({
        from: lastMoveDetail.from,
        to: lastMoveDetail.to
      });
    } else {
      setLastMove(null);
    }
    
    // Update captured pieces
    const captured = { w: [], b: [] };
    history.forEach(move => {
      if (move.captured) {
        if (move.color === 'w') {
          captured.b.push(move.captured);
        } else {
          captured.w.push(move.captured);
        }
      }
    });
    setCapturedPieces(captured);
  };

  const handleSquareClick = (square: string) => {
    if (!gameStarted || game.isGameOver() || promotionSquare) return;

    // If a square is already selected
    if (selectedSquare) {
      const moves = game.moves({
        square: selectedSquare,
        verbose: true
      });

      // Find if the target square is a valid move
      const move = moves.find(m => m.to === square);

      // If valid move
      if (move) {
        // Check if it's a promotion move
        if (move.promotion) {
          setPromotionSquare(square);
          setPendingMove({ from: selectedSquare, to: square });
        } else {
          // Make the move
          makeMove(selectedSquare, square);
        }
      }
      
      // Reset selection
      setSelectedSquare(null);
      setValidMoves([]);
    } 
    // Select a piece
    else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        
        // Get valid moves for this piece
        const moves = game.moves({
          square,
          verbose: true
        });
        setValidMoves(moves.map(move => move.to));
      }
    }
  };

  const makeMove = (from: string, to: string, promotion = 'q') => {
    try {
      const moveDetails = { from, to, promotion };
      game.move(moveDetails);
      
      // Create a new Chess instance to properly update state
      const newGame = new Chess(game.fen());
      setGame(newGame);
      
      // Update lastMove for highlighting
      setLastMove({ from, to });
    } catch (e) {
      console.error('Invalid move', e);
    }
  };

  const handlePromotion = (piece: string) => {
    if (pendingMove) {
      makeMove(pendingMove.from, pendingMove.to, piece);
      setPromotionSquare(null);
      setPendingMove(null);
    }
  };

  const handleNewGame = () => {
    console.log("Starting new game");
    // Create a fresh Chess instance
    const newGame = new Chess();
    setGame(newGame);
    setSelectedSquare(null);
    setValidMoves([]);
    setPromotionSquare(null);
    setPendingMove(null);
    setCapturedPieces({ w: [], b: [] });
    setLastMove(null);
    setGameStarted(true);
  };

  const handleUndoMove = () => {
    if (!gameStarted) return;
    
    const moveUndone = game.undo();
    if (moveUndone) {
      // Create a new Chess instance to properly update state
      const newGame = new Chess(game.fen());
      setGame(newGame);
    }
  };

  return (
    <div className="chess-game">
      <h1>Chess Game</h1>
      
      {!piecesLoaded ? (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading chess pieces...</div>
        </div>
      ) : (
        <div className="game-container">
          <div className="board-container">
            {currentPlayer === 'b' && gameStarted && (
              <div className="player-info white-player">
                <div className="player-name">White</div>
                <div className="captured-pieces-row">
                  {capturedPieces.b.map((type, i) => (
                    <div 
                      key={`b-${type}-${i}`}
                      className="captured-piece-small"
                      style={{ backgroundImage: `url(/pieces/w${type}.svg)` }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <Chessboard 
              position={game.fen()}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              lastMove={lastMove}
              onSquareClick={handleSquareClick}
            />
            
            {currentPlayer === 'w' && gameStarted && (
              <div className="player-info black-player">
                <div className="player-name">Black</div>
                <div className="captured-pieces-row">
                  {capturedPieces.w.map((type, i) => (
                    <div 
                      key={`w-${type}-${i}`}
                      className="captured-piece-small"
                      style={{ backgroundImage: `url(/pieces/b${type}.svg)` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <GameInfo
            status={status}
            moveHistory={moveHistory}
            capturedPieces={capturedPieces}
            onNewGame={handleNewGame}
            onUndoMove={handleUndoMove}
            canUndo={moveHistory.length > 0 && gameStarted}
            gameStarted={gameStarted}
            currentPlayer={currentPlayer}
          />
        </div>
      )}

      {promotionSquare && (
        <div className="promotion-modal">
          <div className="promotion-options">
            {['q', 'r', 'n', 'b'].map(piece => (
              <div 
                key={piece}
                className="promotion-piece"
                style={{ 
                  backgroundImage: `url(/pieces/${game.turn()}${piece}.svg)`
                }}
                onClick={() => handlePromotion(piece)}
              >
                {/* Fallback text */}
                {game.turn() === 'w' ? piece.toUpperCase() : piece}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
