/* class that implements the board in game.js; not to be 
confused with chessBoard.js which is the component that represents the
board; unlike chessBoard.js, board.js is the actual implementation for 
how game.js keeps track of where the chess pieces are */
import Player from "./player.js";
const ChessLogic = require("./chessLogic.js");

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
    for (let piece of pieces) {
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

  // retrieves rook on king's side if it has not moved
  getKingSideRook(playerKing) {
    const rook = this.pieceAt(playerKing.row, playerKing.col + 3);
    return rook;
  }

  // retrieves rook on queen's side if it has not moved
  getQueenSideRook(playerKing) {
    const rook = this.pieceAt(playerKing.row, playerKing.col - 4);
    return rook;
  }

  /* move chess piece; 
piecesToMove is an array of pieces to move and newIndices is an array 
of indices corresponding to elements in piecesToMove */
  updateBoard(piecesToMove, newIndices) {
    let newBoard = this.copyOfBoard();

    // for each piece to move
    for (let index in piecesToMove) {
      const pieceToMove = piecesToMove[index];
      const indexToMove = newIndices[index];

      // update newBoard and indices of pieceToMove
      newBoard.moveTo(indexToMove[0], indexToMove[1], pieceToMove);
    }

    return newBoard;
  }

  // update board for single piece being moved
  updateBoardPiece(piece, move) {
    return this.updateBoard([piece], [move]);
  }

  // update board for castling
  updateBoardCastle(playerKing, isKingSideCastle) {
    let castleIndices = this.getCastleIndices(playerKing, isKingSideCastle);
    return this.updateBoard(castleIndices[0], castleIndices[1]);
  }

  // remove captured opponent pieces when updating board and return updated players
  removeCaptured(piecesToMove, newIndices, players) {
    const oppPieces = [];
    let oppColor = 0;

    // for each piece to move
    for (let index in piecesToMove) {
      const pieceToMove = piecesToMove[index];
      const indexToMove = newIndices[index];

      // if there is enemy piece at new index, add it to opponentPieces
      const oppPiece = this.pieceAt(indexToMove[0], indexToMove[1]);
      if (oppPiece !== null && oppPiece.color !== pieceToMove.color) {
        oppPieces.push(oppPiece);
        oppColor = oppPiece.color;
      }
    }

    // copy of two players
    let playerWhite = Player.copyPlayer(players[0]);
    let playerBlack = Player.copyPlayer(players[1]);
    let opponent;
    oppColor === 0 ? (opponent = playerWhite) : (opponent = playerBlack);

    // update inPlay and offPlay of opponent
    opponent.updateInPlay(oppPieces);
    opponent.updateOffPlay(oppPieces);

    return [playerWhite, playerBlack];
  }

  // remove captured pieces for single piece move
  removeCapturedPiece(piece, move, players) {
    return this.removeCaptured([piece], [move], players);
  }

  // remove captured pieces for castle move
  removeCapturedCastle(playerKing, isKingSideCastle, players) {
    let castleIndices = this.getCastleIndices(playerKing, isKingSideCastle);
    return this.removeCaptured(castleIndices[0], castleIndices[1], players);
  }

  // helper function to get castle indices
  getCastleIndices(playerKing, isKingSideCastle) {
    let rook;
    let newKingCol;
    let newRookCol;
    const piecesToMove = [];
    const newIndices = [];
    // if king-side castling
    if (isKingSideCastle) {
      rook = this.getKingSideRook(playerKing);
      newKingCol = playerKing.col + 2;
      newRookCol = rook.col - 2;
    } else {
      rook = this.getQueenSideRook(playerKing);
      newKingCol = playerKing.col - 2;
      newRookCol = rook.col + 3;
    }

    // insert piecesToMove and newIndices
    piecesToMove.push(playerKing);
    piecesToMove.push(rook);
    newIndices.push([playerKing.row, newKingCol]);
    newIndices.push([rook.row, newRookCol]);
    return [piecesToMove, newIndices];
  }
  // return copy of board
  copyOfBoard() {
    const rawBoard = this.getRawBoard();
    const rawBoardCopy = rawBoard.map(function(arr) {
      return arr.slice();
    });

    return new Board(8, 8, rawBoardCopy);
  }
}
