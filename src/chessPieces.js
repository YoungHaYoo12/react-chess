// file contains list of all chess pieces that will be used in game
const Piece = require("./chessPieceLogic.js");
const numOfCols = 8;

/* returns chess pieces of board depending on which color 
player chooses; playerColor is an integer: 0 for white,1 for black */
export default function allChessPieces(playerColor) {
  // ordered from front row to back row, left to right
  const allWhitePieces = [];
  const allBlackPieces = [];
  let whiteKing;
  let blackKing;

  // if player chooses white
  if (playerColor === 0) {
    fillInFrontRow(0, 6, allWhitePieces);
    whiteKing = fillInBackRow(0, 7, allWhitePieces);
    fillInFrontRow(1, 1, allBlackPieces);
    blackKing = fillInBackRow(1, 0, allBlackPieces);
  }

  // if player chooses black
  else {
    fillInFrontRow(1, 6, allBlackPieces);
    blackKing = fillInBackRow(1, 7, allBlackPieces);
    fillInFrontRow(0, 1, allWhitePieces);
    whiteKing = fillInBackRow(0, 0, allWhitePieces);
  }

  // return array of allWhitePieces, allBlackPieces, and a reference to two kings
  return [allWhitePieces, allBlackPieces, [whiteKing, blackKing]];
}

// helper function for allChessPieces that fills array with row of pawns
function fillInFrontRow(color, row, array) {
  for (let col = 0; col < numOfCols; col++) {
    array.push(new Piece.Pawn(color, row, col));
  }
}

/* helper function for allChessPieces that fills array with back row;
  also returns king specifically */
function fillInBackRow(color, row, array) {
  array.push(new Piece.Rook(color, row, 0));
  array.push(new Piece.Knight(color, row, 1));
  array.push(new Piece.Bishop(color, row, 2));
  array.push(new Piece.Queen(color, row, 3));
  const king = new Piece.King(color, row, 4);
  array.push(king);
  array.push(new Piece.Bishop(color, row, 5));
  array.push(new Piece.Knight(color, row, 6));
  array.push(new Piece.Rook(color, row, 7));
  return king;
}
