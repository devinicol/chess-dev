import { useState, useEffect } from 'react';
import './App.css';
import Chessboard from './components/Chessboard';
import GameInfo from './components/GameInfo';
import { Chess } from 'chess.js/dist/esm/chess';

function App() {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [promotionSquare, setPromotionSquare] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{from: string, to: string} | null>(null);
  const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] });

  useEffect(() => {
    updateGameState();
  }, [game]);

  const updateGameState = () => {
    // Update game status
    let statusText = '';
    if (game.isCheckmate()) {
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
    setMoveHistory(game.history({ verbose: true }));
    
    // Update captured pieces
    const history = game.history({ verbose: true });
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
    if (game.isGameOver() || promotionSquare) return;

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
      game.move({ from, to, promotion });
      setGame(new Chess(game.fen()));
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
    setGame(new Chess());
    setSelectedSquare(null);
    setValidMoves([]);
    setPromotionSquare(null);
    setPendingMove(null);
  };

  const handleUndoMove = () => {
    game.undo();
    setGame(new Chess(game.fen()));
  };

  return (
    <div className="chess-game">
      <h1>Chess Game</h1>
      
      <div className="game-container">
        <Chessboard 
          position={game.fen()}
          selectedSquare={selectedSquare}
          validMoves={validMoves}
          onSquareClick={handleSquareClick}
        />
        
        <GameInfo
          status={status}
          moveHistory={moveHistory}
          capturedPieces={capturedPieces}
          onNewGame={handleNewGame}
          onUndoMove={handleUndoMove}
          canUndo={moveHistory.length > 0}
        />
      </div>

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
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
