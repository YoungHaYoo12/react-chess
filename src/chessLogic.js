import Board from "./board.js";
const Helper = require("./helperFunctions.js");

// helper module for chessPiece.js containing logic of chess moves
const numOfRows = 8;
const numOfCols = 8;

// helper function to check if piece remains in index of board
function indexInRange(row, col) {
  return row >= 0 && row < numOfRows && col >= 0 && col < numOfCols;
}

// helper function to determine what color piece is at index
function colorOfPiece(board, row, col) {
  const piece = board.pieceAt(row, col);
  if (piece === null) return null;
  return piece.color;
}

// helper function for isMoveValid() to check if there are pieces between start and end indices
function piecesBlockingMove(board, startRow, startCol, endRow, endCol) {
  // if startRow and endRow are the same, horizontal move
  if (startRow === endRow) {
    const distance = endCol - startCol;
    if (distance > 0) {
      for (let col = startCol + 1; col < endCol; col++) {
        if (board.pieceAt(startRow, col) !== null) {
          return true;
        }
      }
    } else {
      for (let col = endCol + 1; col < startCol; col++) {
        if (board.pieceAt(startRow, col) !== null) return true;
      }
    }
  }
  // if startCol and endCol are the same, vertical move
  else if (startCol === endCol) {
    const distance = endRow - startRow;
    if (distance > 0) {
      for (let row = startRow + 1; row < endRow; row++) {
        if (board.pieceAt(row, startCol) !== null) return true;
      }
    } else {
      for (let row = endRow + 1; row < startRow; row++) {
        if (board.pieceAt(row, startCol) !== null) return true;
      }
    }
  }

  // else diagonal move
  else {
    const horizDistance = endCol - startCol;
    const vertDistance = endRow - startRow;
    const diagonalDistance = Math.abs(horizDistance);
    // negative diagonal move if horizDistance and vertDistance have same sign
    if (horizDistance * vertDistance > 0) {
      if (horizDistance > 0) {
        for (let i = 1; i < diagonalDistance; i++) {
          if (board.pieceAt(startRow + i, startCol + i) !== null) return true;
        }
      } else {
        for (let i = 1; i < diagonalDistance; i++) {
          if (board.pieceAt(startRow - i, startCol - i) !== null) return true;
        }
      }
    }
    // positive diagonal move otherwise
    else {
      if (horizDistance > 0) {
        for (let i = 1; i < diagonalDistance; i++) {
          if (board.pieceAt(startRow - i, startCol + i) !== null) return true;
        }
      } else {
        for (let i = 1; i < diagonalDistance; i++) {
          if (board.pieceAt(startRow + i, startCol - i) !== null) return true;
        }
      }
    }
  }

  return false;
}

// function to check whether a square is under check
function isSquareInCheck(board, row, col, opponentPieces, playerColor) {
  for (let index in opponentPieces) {
    const opponentPiece = opponentPieces[index];
    // check whether king can be reached
    const possibleMoves = opponentPiece.possibleMoves(
      board,
      opponentPieces,
      playerColor
    );
    for (let i in possibleMoves) {
      const move = possibleMoves[i];
      if (Helper.moveMatchesIndex(move, row, col)) return true;
    }
  }
  return false;
}

// checks whether king IS in check
function isKingInCheck(board, king, opponentPieces, playerColor) {
  return isSquareInCheck(
    board,
    king.row,
    king.col,
    opponentPieces,
    playerColor
  );
}

/* checks whether king is in checkmate 
  (if king in check and no possible moves exist that do not result in check) */
function isKingInCheckmate(
  board,
  playerPieces,
  opponentPieces,
  king,
  playerColor
) {
  let possibleMoves = [];
  // add all possible moves by all player's pieces
  for (let index in playerPieces) {
    const playerPiece = playerPieces[index];
    let possibleMovesByPiece = playerPiece.possibleMoves(
      board,
      opponentPieces,
      playerColor
    );
    possibleMovesByPiece = playerPiece.checkFilter(
      possibleMovesByPiece,
      opponentPieces,
      board,
      king
    );
    possibleMoves = possibleMoves.concat(possibleMovesByPiece);
  }

  return (
    isKingInCheck(board, king, opponentPieces, playerColor) &&
    possibleMoves.length === 0
  );
}

/* checks whether king WILL be in check after piece moves to new index; 
piecesToMove is an array of pieces to move and newIndices is an array 
of indices corresponding to elements in piecesToMove
*/
function willKingBeInCheck(
  board,
  king,
  playerColor,
  opponentPieces,
  piecesToMove,
  newIndices
) {
  // make copy of board
  const boardCopy = Board.copyOfBoard(board);

  // variable containing all opponent pieces that are captured while moving piecesToMove
  const opponentPiecesToRemove = [];

  // variable containing all original indices of piecesToMove
  const originalIndices = [];

  // for each piece to move
  for (let index in piecesToMove) {
    const pieceToMove = piecesToMove[index];
    const indexToMove = newIndices[index];
    const rowToMove = indexToMove[0];
    const colToMove = indexToMove[1];

    // if there is enemy piece at new index, add it to opponentPiecesToRemove
    const enemyPieceAtNewIndex = boardCopy.pieceAt(rowToMove, colToMove);
    opponentPiecesToRemove.push(enemyPieceAtNewIndex);

    // add original index of pieceToMove to originalIndices
    originalIndices.push([pieceToMove.row, pieceToMove.col]);

    // update boardCopy and indices of pieceToMove
    boardCopy.fillAt(pieceToMove.row, pieceToMove.col, null);
    boardCopy.fillAt(rowToMove, colToMove, pieceToMove);
    pieceToMove.updateIndex(rowToMove, colToMove);
  }

  // remove opponentPiecesToRemove from opponentPieces
  const opponentPiecesCopy = opponentPieces.filter(function(piece) {
    for (let index in opponentPiecesToRemove) {
      const opponentPieceToRemove = opponentPiecesToRemove[index];
      if (piece === opponentPieceToRemove) return false;
    }
    return true;
  });
  // check whether king would be in check
  const kingInCheck = isKingInCheck(
    boardCopy,
    king,
    opponentPiecesCopy,
    playerColor
  );

  // change back indices of piecesToMove
  for (let index in piecesToMove) {
    const pieceToMove = piecesToMove[index];
    const originalIndex = originalIndices[index];
    const originalRow = originalIndex[0];
    const originalCol = originalIndex[1];
    pieceToMove.updateIndex(originalRow, originalCol);
  }

  return kingInCheck;
}

// determines whether king-side castling is possible
function canKingSideCastle(board, king, opponentPieces, playerColor) {
  // return if king or rook have previously moved
  const rook = getKingSideRook(board, king);

  if (rook === null || king.hasUsedFirstMove || rook.hasUsedFirstMove) {
    return false;
  }

  // no pieces blocking move
  if (piecesBlockingMove(board, king.row, king.col, rook.row, rook.col)) {
    return false;
  }

  // King not currently in check
  if (isKingInCheck(board, king, opponentPieces, playerColor)) {
    return false;
  }

  // king will not be in check from castling
  if (
    willKingBeInCheck(
      board,
      king,
      playerColor,
      opponentPieces,
      [king, rook],
      [[king.row, king.col + 2], [rook.row, rook.col - 2]]
    )
  ) {
    return false;
  }

  // king must not pass through square under check by enemy pieces
  for (let col = king.col; col < rook.col; col++) {
    if (isSquareInCheck(board, king.row, col, opponentPieces, playerColor)) {
      return false;
    }
  }
  return true;
}

// determines whether queen-side castling is possible
function canQueenSideCastle(board, king, opponentPieces, playerColor) {
  // return if king or rook have previously moved
  const rook = getQueenSideRook(board, king);
  if (rook === null || king.hasUsedFirstMove || rook.hasUsedFirstMove) {
    return false;
  }

  // no pieces blocking move
  if (piecesBlockingMove(board, rook.row, rook.col, king.row, king.col)) {
    return false;
  }

  // King not currently in check
  if (isKingInCheck(board, king, opponentPieces, playerColor)) {
    return false;
  }

  // king will not be in check from castling
  if (
    willKingBeInCheck(
      board,
      king,
      playerColor,
      opponentPieces,
      [king, rook],
      [[king.row, king.col - 2], [rook.row, rook.col + 3]]
    )
  ) {
    return false;
  }

  // king must not pass through square under check by enemy pieces
  for (let col = king.col; col > rook.col + 1; col--) {
    if (isSquareInCheck(board, king.row, col, opponentPieces, playerColor)) {
      return false;
    }
  }
  return true;
}

function castleFilter(
  board,
  king,
  opponentPieces,
  playerColor,
  possibleMovesByKing
) {
  // return if piece is not a king
  if (king.name !== "king") return;

  if (canKingSideCastle(board, king, opponentPieces, playerColor)) {
    possibleMovesByKing.push([king.row, king.col + 2]);
  }
  if (canQueenSideCastle(board, king, opponentPieces, playerColor)) {
    possibleMovesByKing.push([king.row, king.col - 2]);
  }
}

// function to tell whether player chose king side castle
function isKCastle(board, king, opponentPieces, playerColor, move) {
  // return false if piece is not a king
  if (king.name !== "king") return false;
  if (
    canKingSideCastle(board, king, opponentPieces, playerColor) &&
    move[0] === king.row &&
    move[1] === king.col + 2
  ) {
    return true;
  }
  return false;
}

// function to tell whether player chose queen side castle
function isQCastle(board, king, opponentPieces, playerColor, move) {
  // return false if piece is not a king
  if (king.name !== "king") return false;

  if (
    canQueenSideCastle(board, king, opponentPieces, playerColor) &&
    move[0] === king.row &&
    move[1] === king.col - 2
  ) {
    return true;
  }
  return false;
}

// retrieves rook on king's side if it has not moved
function getKingSideRook(board, king) {
  const rook = board.pieceAt(king.row, king.col + 3);
  return rook;
}

// retrieves rook on queen's side if it has not moved
function getQueenSideRook(board, king) {
  const rook = board.pieceAt(king.row, king.col - 4);
  return rook;
}

// tells whether pawn has reached opposite side
function pawnAtEnd(pawn, playerColor) {
  // return if piece is not pawn
  if (pawn.name !== "pawn") return;

  // if playerColor and pawn Color is the same
  if (playerColor === pawn.color) {
    return pawn.row === 0;
  } else {
    return pawn.row === numOfRows - 1;
  }
}
module.exports = {
  indexInRange,
  colorOfPiece,
  piecesBlockingMove,
  isSquareInCheck,
  isKingInCheck,
  isKingInCheckmate,
  willKingBeInCheck,
  castleFilter,
  isKCastle,
  isQCastle,
  getKingSideRook,
  getQueenSideRook,
  pawnAtEnd
};
