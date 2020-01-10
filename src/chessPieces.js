// file contains list of all chess pieces that will be used in game
const Piece = require("./chessPieceLogic.js");
const numOfCols = 8;

// ordered from front row to back row, left to right
const allWhitePieces = [];
const allBlackPieces = [];

// fill in pawns
for (let col = 0; col < numOfCols; col++) {
  allWhitePieces.push(new Piece.Pawn(0, 6, col));
  allBlackPieces.push(new Piece.Pawn(1, 1, col));
}

// fill in back row
allWhitePieces.push(new Piece.Rook(0, 7, 0));
allWhitePieces.push(new Piece.Knight(0, 7, 1));
allWhitePieces.push(new Piece.Bishop(0, 7, 2));
allWhitePieces.push(new Piece.Queen(0, 7, 3));
// also save king to variable
const whiteKing = new Piece.King(0, 7, 4);
allWhitePieces.push(whiteKing);
allWhitePieces.push(new Piece.Bishop(0, 7, 5));
allWhitePieces.push(new Piece.Knight(0, 7, 6));
allWhitePieces.push(new Piece.Rook(0, 7, 7));

allBlackPieces.push(new Piece.Rook(1, 0, 0));
allBlackPieces.push(new Piece.Knight(1, 0, 1));
allBlackPieces.push(new Piece.Bishop(1, 0, 2));
allBlackPieces.push(new Piece.Queen(1, 0, 3));
// also save king to variable
const blackKing = new Piece.King(1, 0, 4);
allBlackPieces.push(blackKing);
allBlackPieces.push(new Piece.Bishop(1, 0, 5));
allBlackPieces.push(new Piece.Knight(1, 0, 6));
allBlackPieces.push(new Piece.Rook(1, 0, 7));

const kings = [whiteKing, blackKing];

module.exports = { allWhitePieces, allBlackPieces, kings };
