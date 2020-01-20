// file containing code for all chess pieces
const ChessLogic = require("./chessLogic.js");

class Piece {
  constructor(color, imgURL, name, row, col) {
    // color is an integer; 0 for white, 1 for black
    this.color = color;
    this.imgURL = imgURL;

    // coordinates on board
    this.row = row;
    this.col = col;
    this.name = name;
    this.hasUsedFirstMove = false;
  }

  // updates index corresponding to Piece
  updateIndex(newRow, newCol) {
    this.row = newRow;
    this.col = newCol;
  }

  // function to update piece's features if piece has been moved
  hasBeenMoved() {
    this.hasUsedFirstMove = true;
  }

  // filter possibleMoves to get rid of moves that would cause king to be in check
  checkFilter(possibleMoves, opponentPieces, board, king, playerColor) {
    return possibleMoves.filter(move => {
      return !ChessLogic.willKingBeInCheck(
        board,
        king,
        playerColor,
        opponentPieces,
        [this],
        [move]
      );
    });
  }

  /* add in castling options to possibleMoves if appropriate; actual code will only
  be added for king */
  castleFilter() {}

  // helper function to determine if enemy is at index
  enemyAtIndex(board, row, col) {
    const colorAtIndex = ChessLogic.colorOfPiece(board, row, col);
    if (colorAtIndex === this.color || colorAtIndex === null) return false;
    return true;
  }

  // is move valid?
  isValidMove(board, isKnight, startRow, startCol, endRow, endCol) {
    // check if end indices are in range
    if (!ChessLogic.indexInRange(endRow, endCol)) {
      return false;
    }

    /* check if any pieces are between start and end indices; if knight,
        ignore this check*/
    if (
      !isKnight &&
      ChessLogic.piecesBlockingMove(board, startRow, startCol, endRow, endCol)
    ) {
      return false;
    }

    // if piece at end index is same color, then move not possible
    if (ChessLogic.colorOfPiece(board, endRow, endCol) === this.color) {
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

    super(color, imgURL, "king", row, col);
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
  }

  // add in possible moves for castling
  castleFilter(board, oppPieces, playerColor, possibleMoves) {
    ChessLogic.castleFilter(board, this, oppPieces, playerColor, possibleMoves);
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

    super(color, imgURL, "queen", row, col);
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

    super(color, imgURL, "bishop", row, col);
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

    super(color, imgURL, "knight", row, col);
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

    super(color, imgURL, "rook", row, col);
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

    super(color, imgURL, "pawn", row, col);
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
        ChessLogic.indexInRange(currentRow - 1, currentCol) &&
        !this.enemyAtIndex(board, currentRow - 1, currentCol)
      ) {
        possibleMoves.push([currentRow - 1, currentCol]);
      }
      // 2 units forward
      if (
        ChessLogic.indexInRange(currentRow - 2, currentCol) &&
        !this.hasUsedFirstMove &&
        !this.enemyAtIndex(board, currentRow - 2, currentCol)
      ) {
        possibleMoves.push([currentRow - 2, currentCol]);
      }
      // diagonals if enemy present
      if (
        ChessLogic.indexInRange(currentRow - 1, currentCol + 1) &&
        this.enemyAtIndex(board, currentRow - 1, currentCol + 1)
      ) {
        possibleMoves.push([currentRow - 1, currentCol + 1]);
      }
      if (
        ChessLogic.indexInRange(currentRow - 1, currentCol - 1) &&
        this.enemyAtIndex(board, currentRow - 1, currentCol - 1)
      ) {
        possibleMoves.push([currentRow - 1, currentCol - 1]);
      }
    }
    // if pawn is opponent's pawn
    else {
      // 1 unit forward
      if (
        ChessLogic.indexInRange(currentRow + 1, currentCol) &&
        !this.enemyAtIndex(board, currentRow + 1, currentCol)
      ) {
        possibleMoves.push([currentRow + 1, currentCol]);
      }
      // 2 units forward
      if (
        ChessLogic.indexInRange(currentRow + 2, currentCol) &&
        !this.hasUsedFirstMove &&
        !this.enemyAtIndex(board, currentRow + 2, currentCol)
      ) {
        possibleMoves.push([currentRow + 2, currentCol]);
      }
      // diagonals if enemy present
      if (
        ChessLogic.indexInRange(currentRow + 1, currentCol + 1) &&
        this.enemyAtIndex(board, currentRow + 1, currentCol + 1)
      ) {
        possibleMoves.push([currentRow + 1, currentCol + 1]);
      }
      if (
        ChessLogic.indexInRange(currentRow + 1, currentCol - 1) &&
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
