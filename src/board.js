/* class that implements the board in game.js; not to be 
confused with chessBoard.js which is the component that represents the
board; unlike chessBoard.js, board.js is the actual implementation for 
how game.js keeps track of where the chess pieces are */

export default class Board {
  constructor(numOfRows = 8, numOfCols = 8, board) {
    if (board === null) {
      this.board = this.emptyBoard(numOfRows, numOfCols);
    } else {
      this.board = board;
    }
  }

  // function to fill in board as the starting board
  makeStartBoard(allWhitePieces, allBlackPieces) {
    this.fillInBoard(allWhitePieces);
    this.fillInBoard(allBlackPieces);
  }

  // helper function to create empty board of dimensions row x col
  emptyBoard(numOfRows, numOfCols) {
    let colArr = Array(numOfCols).fill(null);
    return Array(numOfRows)
      .fill(null)
      .map(() => colArr.slice());
  }

  // function to fill board with pieces
  fillInBoard(pieces) {
    for (let index in pieces) {
      const piece = pieces[index];
      this.fillAt(piece.row, piece.col, piece);
    }
  }

  // helper function to fill in board at row,col with piece
  fillAt(row, col, piece) {
    this.board[row][col] = piece;
  }

  // function to return piece at index
  pieceAt(row, col) {
    return this.board[row][col];
  }

  // function to move piece to index
  moveTo(row, col, piece) {
    this.fillAt(piece.row, piece.col, null);
    this.fillAt(row, col, piece);
  }

  // return raw array implementation of board
  getRawBoard() {
    return this.board;
  }

  // return copy of board
  static copyOfBoard(board) {
    const rawBoard = board.getRawBoard();
    const rawBoardCopy = rawBoard.map(function(arr) {
      return arr.slice();
    });

    return new Board(8, 8, rawBoardCopy);
  }
}
