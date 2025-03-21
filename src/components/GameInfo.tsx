import { FC, Fragment } from 'react';

interface GameInfoProps {
  status: string;
  moveHistory: any[];
  capturedPieces: { w: string[], b: string[] };
  onNewGame: () => void;
  onUndoMove: () => void;
  canUndo: boolean;
  gameStarted: boolean;
  currentPlayer: 'w' | 'b';
}

const GameInfo: FC<GameInfoProps> = ({ 
  status, 
  moveHistory, 
  capturedPieces, 
  onNewGame, 
  onUndoMove, 
  canUndo,
  gameStarted,
  currentPlayer
}) => {
  // Group moves in pairs (white and black)
  const groupedMoves = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    groupedMoves.push({
      number: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1]
    });
  }

  const getEvaluation = (move: any) => {
    if (!move) return null;
    if (move.san.includes('#')) return 'Checkmate';
    if (move.san.includes('+')) return 'Check';
    if (move.captured) return 'Capture';
    if (move.san === 'O-O' || move.san === 'O-O-O') return 'Castle';
    return null;
  };

  return (
    <div className={`game-info ${gameStarted ? 'game-active' : 'game-inactive'}`}>
      <div className="game-status">
        <h3>Game Status</h3>
        <p className={`status-message ${gameStarted ? 'active' : 'inactive'}`}>{status}</p>
        
        {gameStarted && (
          <div className="turn-indicator">
            <div className={`player-turn ${currentPlayer === 'w' ? 'active' : ''}`}>
              <div className="player-color white"></div>
              <span>White</span>
            </div>
            <div className={`player-turn ${currentPlayer === 'b' ? 'active' : ''}`}>
              <div className="player-color black"></div>
              <span>Black</span>
            </div>
          </div>
        )}
        
        <div className="game-controls">
          <button 
            className="new-game-btn" 
            onClick={onNewGame}
          >
            {gameStarted ? 'Reset Game' : 'New Game'}
          </button>
          <button 
            className="undo-btn"
            onClick={onUndoMove}
            disabled={!canUndo}
          >
            Undo Move
          </button>
        </div>
      </div>
      
      <div className={`move-history ${gameStarted ? '' : 'empty'}`}>
        <h3>Move History</h3>
        {gameStarted ? (
          moveHistory.length > 0 ? (
            <div className="move-list">
              {groupedMoves.map(({ number, white, black }) => (
                <Fragment key={number}>
                  <div className="move-number">{number}.</div>
                  <div className="move-detail">
                    <span className="move-san">{white.san}</span>
                    {getEvaluation(white) && (
                      <span className={`move-eval ${getEvaluation(white)?.toLowerCase()}`}>
                        {getEvaluation(white)}
                      </span>
                    )}
                  </div>
                  <div className="move-detail">
                    {black && (
                      <>
                        <span className="move-san">{black.san}</span>
                        {getEvaluation(black) && (
                          <span className={`move-eval ${getEvaluation(black)?.toLowerCase()}`}>
                            {getEvaluation(black)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </Fragment>
              ))}
            </div>
          ) : (
            <div className="no-moves">No moves yet</div>
          )
        ) : (
          <div className="no-game">Start a new game</div>
        )}
      </div>
      
      {gameStarted && (
        <div className="captured-pieces-container">
          <div className="captured-section">
            <h4>Captured by White</h4>
            <div className="captured-pieces">
              {capturedPieces.w.map((type, i) => (
                <div 
                  key={`w-${type}-${i}`}
                  className="captured-piece"
                  style={{ backgroundImage: `url(/pieces/b${type}.svg)` }}
                />
              ))}
              {capturedPieces.w.length === 0 && <span className="none">None</span>}
            </div>
          </div>
          
          <div className="captured-section">
            <h4>Captured by Black</h4>
            <div className="captured-pieces">
              {capturedPieces.b.map((type, i) => (
                <div 
                  key={`b-${type}-${i}`}
                  className="captured-piece"
                  style={{ backgroundImage: `url(/pieces/w${type}.svg)` }}
                />
              ))}
              {capturedPieces.b.length === 0 && <span className="none">None</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInfo;
