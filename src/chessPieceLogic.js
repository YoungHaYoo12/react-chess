// file containing code for all chess pieces
const BoardHelperFuncs = require("./boardHelperFunctions.js");

class Piece {
  constructor(color, imgURL, row, col) {
    // color is an integer; 0 for white, 1 for black
    this.color = color;
    this.imgURL = imgURL;

    // coordinates on board
    this.row = row;
    this.col = col;
  }

  static get numOfRows() {
    return 8;
  }
  static get numOfCols() {
    return 8;
  }

  updateIndex(newRow, newCol) {
    this.row = newRow;
    this.col = newCol;
  }

  // function to update piece's features if piece has been moved
  hasBeenMoved() {}

  // checks whether king IS in check
  static isKingInCheck(king, opponentPieces, board, playerColor) {
    for (let index in opponentPieces) {
      const opponentPiece = opponentPieces[index];
      // check whether king can be reached
      const possibleMoves = opponentPiece.possibleMoves(board, playerColor);
      for (let i in possibleMoves) {
        const move = possibleMoves[i];
        if (king.row === move[0] && king.col === move[1]) return true;
      }
    }
    return false;
  }

  /* checks whether king is in checkmate 
  (if king in check and no possible moves exist that do not result in check) */
  static isKingInCheckmate(
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
      Piece.isKingInCheck(king, opponentPieces, board, playerColor) &&
      possibleMoves.length === 0
    );
  }
  // checks whether king WILL be in check after piece moves to new index
  willKingBeInCheck(opponentPieces, board, king, newRow, newCol, playerColor) {
    // change position of piece
    // make copy of board
    const boardCopy = BoardHelperFuncs.copyOfBoard(board);

    // if there is a piece at new index, remove it from opponentPieces
    const pieceAtNewIndex = boardCopy[newRow][newCol];
    const opponentPiecesCopy = opponentPieces.filter(function(piece) {
      return piece !== pieceAtNewIndex;
    });

    // update boardCopy
    const oldRow = this.row;
    const oldCol = this.col;
    boardCopy[oldRow][oldCol] = null;
    boardCopy[newRow][newCol] = this;
    this.row = newRow;
    this.col = newCol;

    // check whether king would be in check
    const kingInCheck = Piece.isKingInCheck(
      king,
      opponentPiecesCopy,
      boardCopy,
      playerColor
    );

    // change back index of piece
    this.row = oldRow;
    this.col = oldCol;

    return kingInCheck;
  }

  // filter possibleMoves to get rid of moves that would cause king to be in check
  filterMovesResultingInCheck(
    possibleMoves,
    opponentPieces,
    board,
    king,
    playerColor
  ) {
    return possibleMoves.filter(move => {
      return !this.willKingBeInCheck(
        opponentPieces,
        board,
        king,
        move[0],
        move[1],
        playerColor
      );
    });
  }

  // helper function for isMoveValid() to check if piece remains in index of board
  indexInRange(row, col) {
    return (
      row >= 0 && row < Piece.numOfRows && col >= 0 && col < Piece.numOfCols
    );
  }

  // helper function for isMoveValid() to check if there are pieces between start and end indices
  piecesBlockingMove(board, startRow, startCol, endRow, endCol) {
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

  // helper function to determine what color piece is at index
  colorOfPiece(board, row, col) {
    const piece = board[row][col];
    if (piece === null) return null;
    return piece.color;
  }

  // helper function to determine if enemy is at index
  enemyAtIndex(board, row, col) {
    const colorAtIndex = this.colorOfPiece(board, row, col);
    if (colorAtIndex === this.color || colorAtIndex === null) return false;
    return true;
  }

  // is move valid?
  isValidMove(board, isKnight, startRow, startCol, endRow, endCol) {
    // check if end indices are in range
    if (!this.indexInRange(endRow, endCol)) {
      return false;
    }

    /* check if any pieces are between start and end indices; if knight,
        ignore this check*/
    if (
      !isKnight &&
      this.piecesBlockingMove(board, startRow, startCol, endRow, endCol)
    ) {
      return false;
    }

    // if piece at end index is same color, then move not possible

    if (this.colorOfPiece(board, endRow, endCol) === this.color) {
      return false;
    }
    return true;
  }
}

class King extends Piece {
  constructor(color, row, col) {
    let imgURL;
    // white img
    if (color === 0) {
      imgURL =
        "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg";
    }
    // black img
    else {
      imgURL =
        "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg";
    }

    super(color, imgURL, row, col);
  }

  // possible moves that king can make
  possibleMoves(board, playerColor) {
    const currentRow = this.row;
    const currentCol = this.col;

    // 8 possible moves for king
    const possibleMoves = [];
    possibleMoves.push([currentRow - 1, currentCol]);
    possibleMoves.push([currentRow + 1, currentCol]);
    possibleMoves.push([currentRow, currentCol - 1]);
    possibleMoves.push([currentRow, currentCol + 1]);
    possibleMoves.push([currentRow - 1, currentCol - 1]);
    possibleMoves.push([currentRow - 1, currentCol + 1]);
    possibleMoves.push([currentRow + 1, currentCol - 1]);
    possibleMoves.push([currentRow + 1, currentCol + 1]);

    return possibleMoves.filter(move => {
      return this.isValidMove(
        board,
        false,
        currentRow,
        currentCol,
        move[0],
        move[1]
      );
    });

    // add castling later
  }
}

class Queen extends Piece {
  constructor(color, row, col) {
    let imgURL;
    // white img
    if (color === 0) {
      imgURL =
        "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg";
    }
    // black img
    else {
      imgURL =
        "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg";
    }

    super(color, imgURL, row, col);
  }

  // possible moves that queen can make
  possibleMoves(board, playerColor) {
    const currentRow = this.row;
    const currentCol = this.col;
    const maxDimension = 8; // max units in any direction
    const possibleMoves = [];

    /* possible moves for queen; to simplify code, I pushed in 
       7 units in all 8 directions and then filtered (rather than
       having to create separate conditionals for all 8 directions) */
    for (let i = 1; i < maxDimension; i++) {
      possibleMoves.push([currentRow + i, currentCol]);
      possibleMoves.push([currentRow - i, currentCol]);
      possibleMoves.push([currentRow, currentCol + i]);
      possibleMoves.push([currentRow, currentCol - i]);
      possibleMoves.push([currentRow + i, currentCol + i]);
      possibleMoves.push([currentRow + i, currentCol - i]);
      possibleMoves.push([currentRow - i, currentCol + i]);
      possibleMoves.push([currentRow - i, currentCol - i]);
    }

    return possibleMoves.filter(move => {
      return this.isValidMove(
        board,
        false,
        currentRow,
        currentCol,
        move[0],
        move[1]
      );
    });
  }
}
class Bishop extends Piece {
  constructor(color, row, col) {
    let imgURL;
    // white img
    if (color === 0) {
      imgURL =
        "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg ";
    }
    // black img
    else {
      imgURL =
        "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg";
    }

    super(color, imgURL, row, col);
  }

  // possible moves that bishop can make
  possibleMoves(board, playerColor) {
    const currentRow = this.row;
    const currentCol = this.col;
    const maxDimension = 8; // max units in any direction
    const possibleMoves = [];

    /* possible moves for bishop; to simplify code, I pushed in 
         7 units in all 4 directions and then filtered */
    for (let i = 1; i < maxDimension; i++) {
      possibleMoves.push([currentRow + i, currentCol + i]);
      possibleMoves.push([currentRow + i, currentCol - i]);
      possibleMoves.push([currentRow - i, currentCol + i]);
      possibleMoves.push([currentRow - i, currentCol - i]);
    }

    return possibleMoves.filter(move => {
      return this.isValidMove(
        board,
        false,
        currentRow,
        currentCol,
        move[0],
        move[1]
      );
    });
  }
}
class Knight extends Piece {
  constructor(color, row, col) {
    let imgURL;
    // white img
    if (color === 0) {
      imgURL =
        "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg";
    }
    // black img
    else {
      imgURL =
        "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg";
    }

    super(color, imgURL, row, col);
  }

  // possible moves that knight can make
  possibleMoves(board, playerColor) {
    const currentRow = this.row;
    const currentCol = this.col;
    const possibleMoves = [];

    possibleMoves.push([currentRow - 2, currentCol + 1]);
    possibleMoves.push([currentRow - 2, currentCol - 1]);
    possibleMoves.push([currentRow + 2, currentCol + 1]);
    possibleMoves.push([currentRow + 2, currentCol - 1]);
    possibleMoves.push([currentRow + 1, currentCol - 2]);
    possibleMoves.push([currentRow - 1, currentCol - 2]);
    possibleMoves.push([currentRow + 1, currentCol + 2]);
    possibleMoves.push([currentRow - 1, currentCol + 2]);

    return possibleMoves.filter(move => {
      return this.isValidMove(
        board,
        true,
        currentRow,
        currentCol,
        move[0],
        move[1]
      );
    });
  }
}
class Rook extends Piece {
  constructor(color, row, col) {
    let imgURL;
    // white img
    if (color === 0) {
      imgURL =
        "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg";
    }
    // black img
    else {
      imgURL =
        "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg";
    }

    super(color, imgURL, row, col);
  }
  // possible moves that rook can make
  possibleMoves(board, playerColor) {
    const currentRow = this.row;
    const currentCol = this.col;
    const maxDimension = 8; // max units in any direction
    const possibleMoves = [];

    /* possible moves for rook; to simplify code, I pushed in 
       7 units in all 4 directions and then filtered */
    for (let i = 1; i < maxDimension; i++) {
      possibleMoves.push([currentRow + i, currentCol]);
      possibleMoves.push([currentRow - i, currentCol]);
      possibleMoves.push([currentRow, currentCol + i]);
      possibleMoves.push([currentRow, currentCol - i]);
    }

    return possibleMoves.filter(move => {
      return this.isValidMove(
        board,
        false,
        currentRow,
        currentCol,
        move[0],
        move[1]
      );
    });
  }
}
class Pawn extends Piece {
  constructor(color, row, col) {
    let imgURL;
    // white img
    if (color === 0) {
      imgURL =
        "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg";
    }
    // black img
    else {
      imgURL =
        "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg";
    }

    super(color, imgURL, row, col);
    this.hasUsedFirstMove = false;
  }

  hasBeenMoved() {
    this.hasUsedFirstMove = true;
  }

  // possible moves that pawn can make
  possibleMoves(board, playerColor) {
    const currentRow = this.row;
    const currentCol = this.col;

    const possibleMoves = [];

    // if pawn is player's pawn
    if (this.color === playerColor) {
      // 1 unit forward
      if (
        this.indexInRange(currentRow - 1, currentCol) &&
        !this.enemyAtIndex(board, currentRow - 1, currentCol)
      ) {
        possibleMoves.push([currentRow - 1, currentCol]);
      }
      // 2 units forward
      if (
        this.indexInRange(currentRow - 2, currentCol) &&
        !this.hasUsedFirstMove &&
        !this.enemyAtIndex(board, currentRow - 2, currentCol)
      ) {
        possibleMoves.push([currentRow - 2, currentCol]);
      }
      // diagonals if enemy present
      if (
        this.indexInRange(currentRow - 1, currentCol + 1) &&
        this.enemyAtIndex(board, currentRow - 1, currentCol + 1)
      ) {
        possibleMoves.push([currentRow - 1, currentCol + 1]);
      }
      if (
        this.indexInRange(currentRow - 1, currentCol - 1) &&
        this.enemyAtIndex(board, currentRow - 1, currentCol - 1)
      ) {
        possibleMoves.push([currentRow - 1, currentCol - 1]);
      }
    }
    // if pawn is opponent's pawn
    else {
      // 1 unit forward
      if (
        this.indexInRange(currentRow + 1, currentCol) &&
        !this.enemyAtIndex(board, currentRow + 1, currentCol)
      ) {
        possibleMoves.push([currentRow + 1, currentCol]);
      }
      // 2 units forward
      if (
        this.indexInRange(currentRow + 2, currentCol) &&
        !this.hasUsedFirstMove &&
        !this.enemyAtIndex(board, currentRow + 2, currentCol)
      ) {
        possibleMoves.push([currentRow + 2, currentCol]);
      }
      // diagonals if enemy present
      if (
        this.indexInRange(currentRow + 1, currentCol + 1) &&
        this.enemyAtIndex(board, currentRow + 1, currentCol + 1)
      ) {
        possibleMoves.push([currentRow + 1, currentCol + 1]);
      }
      if (
        this.indexInRange(currentRow + 1, currentCol - 1) &&
        this.enemyAtIndex(board, currentRow + 1, currentCol - 1)
      ) {
        possibleMoves.push([currentRow + 1, currentCol - 1]);
      }
    }

    return possibleMoves.filter(move => {
      return this.isValidMove(
        board,
        false,
        currentRow,
        currentCol,
        move[0],
        move[1]
      );
    });
  }
}

module.exports = {
  Piece,
  King,
  Queen,
  Bishop,
  Knight,
  Rook,
  Pawn
};
