#!/bin/bash
mkdir -p public/pieces
cd public/pieces

# Download chess pieces from Wikimedia
pieces=("p" "n" "b" "r" "q" "k")
colors=("w" "b")

for color in "${colors[@]}"; do
  for piece in "${pieces[@]}"; do
    if [ "$color" == "w" ]; then
      curl -o "${color}${piece}.svg" "https://commons.wikimedia.org/wiki/Special:FilePath/Chess_${piece}lt45.svg"
    else
      curl -o "${color}${piece}.svg" "https://commons.wikimedia.org/wiki/Special:FilePath/Chess_${piece}dt45.svg"
    fi
  done
done
