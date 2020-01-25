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
function isSquareInCheck(board, row, col, oppPieces) {
  for (let oppPiece of oppPieces) {
    // check whether square can be reached
    const possibleMoves = oppPiece.possibleMoves(board);
    for (let move of possibleMoves) {
      if (Helper.moveMatchesIndex(move, row, col)) return true;
    }
  }
  return false;
}

// checks whether king IS in check
function isKingInCheck(board, playerKing, oppPieces) {
  return isSquareInCheck(board, playerKing.row, playerKing.col, oppPieces);
}

/* checks whether king is in checkmate 
  (if king in check and no possible moves exist that do not result in check) */
function isKingInCheckmate(board, playerPieces, oppPieces, playerKing) {
  let possibleMoves = [];
  let test = [];
  // add all possible moves by all player's pieces
  for (let playerPiece of playerPieces) {
    let possibleMovesByPiece = playerPiece.filteredMoves(
      board,
      playerKing,
      oppPieces
    );

    possibleMoves = possibleMoves.concat(possibleMovesByPiece);
    if (possibleMovesByPiece.length !== 0) {
      test.push([playerPiece, possibleMovesByPiece]);
    }
  }

  return (
    isKingInCheck(board, playerKing, oppPieces) && possibleMoves.length === 0
  );
}

/* checks whether king WILL be in check after piece moves to new index; 
piecesToMove is an array of pieces to move and newIndices is an array 
of indices corresponding to elements in piecesToMove
*/
function willKingBeInCheck(
  board,
  playerKing,
  oppPieces,
  piecesToMove,
  newIndices
) {
  // make copy of board
  const boardCopy = board.copyOfBoard();

  // variable containing all opponent pieces that are captured while moving piecesToMove
  const capturedOppPieces = [];

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
    capturedOppPieces.push(enemyPieceAtNewIndex);

    // add original index of pieceToMove to originalIndices
    originalIndices.push([pieceToMove.row, pieceToMove.col]);

    // update boardCopy and indices of pieceToMove
    boardCopy.fillAt(pieceToMove.row, pieceToMove.col, null);
    boardCopy.fillAt(rowToMove, colToMove, pieceToMove);
    pieceToMove.updateIndex(rowToMove, colToMove);
  }

  // remove opponentPiecesToRemove from opponentPieces
  const oppPiecesCopy = oppPieces.filter(function(piece) {
    for (let capturedOppPiece of capturedOppPieces) {
      if (piece === capturedOppPiece) return false;
    }
    return true;
  });
  // check whether king would be in check
  const kingInCheck = isKingInCheck(boardCopy, playerKing, oppPiecesCopy);

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
function canKingSideCastle(board, playerKing, oppPieces) {
  // return if king or rook have previously moved
  const rook = board.getKingSideRook(playerKing);

  if (rook === null || playerKing.hasUsedFirstMove || rook.hasUsedFirstMove) {
    return false;
  }

  // no pieces blocking move
  if (
    piecesBlockingMove(
      board,
      playerKing.row,
      playerKing.col,
      rook.row,
      rook.col
    )
  ) {
    return false;
  }

  // King not currently in check
  if (isKingInCheck(board, playerKing, oppPieces)) {
    return false;
  }

  // king will not be in check from castling
  if (
    willKingBeInCheck(
      board,
      playerKing,
      oppPieces,
      [playerKing, rook],
      [[playerKing.row, playerKing.col + 2], [rook.row, rook.col - 2]]
    )
  ) {
    return false;
  }

  // king must not pass through square under check by enemy pieces
  for (let col = playerKing.col; col < rook.col; col++) {
    if (isSquareInCheck(board, playerKing.row, col, oppPieces)) {
      return false;
    }
  }
  return true;
}

// determines whether queen-side castling is possible
function canQueenSideCastle(board, playerKing, oppPieces) {
  // return if king or rook have previously moved
  const rook = board.getQueenSideRook(playerKing);
  if (rook === null || playerKing.hasUsedFirstMove || rook.hasUsedFirstMove) {
    return false;
  }

  // no pieces blocking move
  if (
    piecesBlockingMove(
      board,
      rook.row,
      rook.col,
      playerKing.row,
      playerKing.col
    )
  ) {
    return false;
  }

  // King not currently in check
  if (isKingInCheck(board, playerKing, oppPieces)) {
    return false;
  }

  // king will not be in check from castling
  if (
    willKingBeInCheck(
      board,
      playerKing,
      oppPieces,
      [playerKing, rook],
      [[playerKing.row, playerKing.col - 2], [rook.row, rook.col + 3]]
    )
  ) {
    return false;
  }

  // king must not pass through square under check by enemy pieces
  for (let col = playerKing.col; col > rook.col + 1; col--) {
    if (isSquareInCheck(board, playerKing.row, col, oppPieces)) {
      return false;
    }
  }
  return true;
}

function castleFilter(board, playerKing, oppPieces, playerKingMoves) {
  // return if piece is not a king
  if (playerKing.name !== "king") return;

  if (canKingSideCastle(board, playerKing, oppPieces)) {
    playerKingMoves.push([playerKing.row, playerKing.col + 2]);
  }
  if (canQueenSideCastle(board, playerKing, oppPieces)) {
    playerKingMoves.push([playerKing.row, playerKing.col - 2]);
  }
}

// function to tell whether player chose king side castle
function isKCastle(board, piece, oppPieces, move) {
  // return false if piece is not a king
  if (piece.name !== "king") return false;
  if (
    canKingSideCastle(board, piece, oppPieces) &&
    move[0] === piece.row &&
    move[1] === piece.col + 2
  ) {
    return true;
  }
  return false;
}

// function to tell whether player chose queen side castle
function isQCastle(board, piece, oppPieces, move) {
  // return false if piece is not a king
  if (piece.name !== "king") return false;

  if (
    canQueenSideCastle(board, piece, oppPieces) &&
    move[0] === piece.row &&
    move[1] === piece.col - 2
  ) {
    return true;
  }
  return false;
}

// tells whether pawn has reached opposite side
function pawnAtEnd(pawn) {
  // return if piece is not pawn
  if (pawn.name !== "pawn") return;

  // if white
  if (pawn.color === 0) {
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
  pawnAtEnd
};
