export const initializePieces = () => {
  if (typeof window === 'undefined') return;
  
  const pieces = ['p', 'n', 'b', 'r', 'q', 'k'];
  const colors = ['w', 'b'];

  const loadPromises = colors.flatMap(color =>
    pieces.map(piece => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.src = `/pieces/${color}${piece}.svg`;
        img.onload = () => {
          console.log(`Loaded piece: ${color}${piece}`);
          resolve(true);
        };
        img.onerror = () => {
          console.error(`Failed to load piece: ${color}${piece}`);
          reject(new Error(`Failed to load piece: ${color}${piece}`));
        };
      });
    })
  );

  return Promise.all(loadPromises)
    .then(() => console.log('All pieces loaded successfully'))
    .catch(error => console.error('Error loading pieces:', error));
};
