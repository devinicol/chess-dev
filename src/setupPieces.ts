import { useEffect } from 'react';

const pieces = {
  // White pieces
  wp: '♙', bp: '♟',
  wn: '♘', bn: '♞',
  wb: '♗', bb: '♝',
  wr: '♖', br: '♜',
  wq: '♕', bq: '♛',
  wk: '♔', bk: '♚'
};

const pieceColors = {
  w: '#FFFFFF',
  b: '#000000'
};

export const useSetupPieces = () => {
  useEffect(() => {
    // Create SVG pieces dynamically
    const piecesDir = `${process.env.NODE_ENV === 'production' ? '/Chess' : ''}/pieces`;
    
    // Check if pieces directory exists
    const checkPieces = async () => {
      try {
        for (const [piece, symbol] of Object.entries(pieces)) {
          const color = piece[0]; // first char is color
          const type = piece[1]; // second char is type
          
          // Create a fallback SVG text-based piece
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          svg.setAttribute('viewBox', '0 0 45 45');
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', '50%');
          text.setAttribute('y', '50%');
          text.setAttribute('dominant-baseline', 'middle');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', '30');
          text.setAttribute('fill', pieceColors[color as keyof typeof pieceColors]);
          text.textContent = symbol;
          
          svg.appendChild(text);
          
          // Convert SVG to string and create a blob URL
          const svgString = new XMLSerializer().serializeToString(svg);
          const blob = new Blob([svgString], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          
          // Try to dynamically inject the pieces
          document.querySelectorAll(`[data-piece="${piece}"]`).forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.backgroundImage = `url(${url})`;
            }
          });
        }
      } catch (error) {
        console.error('Error setting up pieces:', error);
      }
    };
    
    checkPieces();
    
    // Cleanup created URLs
    return () => {
      // Cleanup logic if needed
    };
  }, []);
};
