// helper module for chessPiece.js containing logic of chess moves
const BoardHelperFuncs = require("./boardHelperFunctions.js");
const numOfRows = 8;
const numOfCols = 8;

// helper function to check if piece remains in index of board
function indexInRange(row, col) {
  return row >= 0 && row < numOfRows && col >= 0 && col < numOfCols;
}

// helper function to determine what color piece is at index
function colorOfPiece(board, row, col) {
  const piece = board[row][col];
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
        if (board[startRow][col] !== null) {
          return true;
        }
      }
    } else {
      for (let col = endCol + 1; col < startCol; col++) {
        if (board[startRow][col] !== null) return true;
      }
    }
  }
  // if startCol and endCol are the same, vertical move
  else if (startCol === endCol) {
    const distance = endRow - startRow;
    if (distance > 0) {
      for (let row = startRow + 1; row < endRow; row++) {
        if (board[row][startCol] !== null) return true;
      }
    } else {
      for (let row = endRow + 1; row < startRow; row++) {
        if (board[row][startCol] !== null) return true;
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
          if (board[startRow + i][startCol + i] !== null) return true;
        }
      } else {
        for (let i = 1; i < diagonalDistance; i++) {
          if (board[startRow - i][startCol - i] !== null) return true;
        }
      }
    }
    // positive diagonal move otherwise
    else {
      if (horizDistance > 0) {
        for (let i = 1; i < diagonalDistance; i++) {
          if (board[startRow - i][startCol + i] !== null) return true;
        }
      } else {
        for (let i = 1; i < diagonalDistance; i++) {
          if (board[startRow + i][startCol - i] !== null) return true;
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
    const possibleMoves = opponentPiece.possibleMoves(board, playerColor);
    for (let i in possibleMoves) {
      const move = possibleMoves[i];
      if (row === move[0] && col === move[1]) return true;
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
    let possibleMovesByPiece = playerPiece.possibleMoves(board, playerColor);
    possibleMovesByPiece = playerPiece.filterMovesResultingInCheck(
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
  const boardCopy = BoardHelperFuncs.copyOfBoard(board);

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
    const enemyPieceAtNewIndex = boardCopy[rowToMove][colToMove];
    opponentPiecesToRemove.push(enemyPieceAtNewIndex);

    // add original index of pieceToMove to originalIndices
    originalIndices.push([pieceToMove.row, pieceToMove.col]);

    // update boardCopy and indices of pieceToMove
    boardCopy[pieceToMove.row][pieceToMove.col] = null;
    boardCopy[rowToMove][colToMove] = pieceToMove;
    pieceToMove.row = rowToMove;
    pieceToMove.col = colToMove;
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
    pieceToMove.row = originalRow;
    pieceToMove.col = originalCol;
  }

  return kingInCheck;
}

module.exports = {
  indexInRange,
  colorOfPiece,
  piecesBlockingMove,
  isSquareInCheck,
  isKingInCheck,
  isKingInCheckmate,
  willKingBeInCheck
};
