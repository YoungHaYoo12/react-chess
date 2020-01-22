/* gameinfo stores information about a chess game, such as game status,
 what color the player chose, and whose turn it is */
const ChessLogic = require("./chessLogic.js");

export default class GameInfo {
  constructor(turn, winStatus, userColor) {
    // keeps track of whose turn it is (0 for white, 1 for black)
    this.turn = 0;
    // keeps track of winning status (no win: -1, white win:0, black win: 1)
    this.winStatus = -1;
    // keeps track of which color that player chose to be
    this.userColor = userColor;
  }
  // opposite color
  static oppColor(color) {
    if (color === 0) return 1;
    return 0;
  }
  // update turn
  updateTurn() {
    this.turn = this.oppColor(this.turn);
  }
  // update win status
  updateWinStatus(board, whitePieces, whiteKing, blackPieces, blackKing) {
    this.winStatus = this.evaluateWinStatus(
      board,
      whitePieces,
      whiteKing,
      blackPieces,
      blackKing
    );
  }

  // returns the win status of board
  evaluateWinStatus(board, whitePieces, whiteKing, blackPieces, blackKing) {
    // white checkmated (player black wins)
    if (
      ChessLogic.isKingInCheckmate(board, whitePieces, blackPieces, whiteKing)
    ) {
      return 1;
    }
    // black checkmated (player white wins)
    else if (
      ChessLogic.isKingInCheckmate(board, blackPieces, whitePieces, blackKing)
    ) {
      return 0;
    }
    return -1;
  }

  // returns whether player won
  isPlayerWinner(board, whitePieces, whiteKing, blackPieces, blackKing) {
    const winStatus = this.evaluateWinStatus(
      board,
      whitePieces,
      whiteKing,
      blackPieces,
      blackKing
    );
    return winStatus === this.getUserColor();
  }

  // returns whether CPU won
  isCPUWinner(board, whitePieces, whiteKing, blackPieces, blackKing) {
    const winStatus = this.evaluateWinStatus(
      board,
      whitePieces,
      whiteKing,
      blackPieces,
      blackKing
    );
    return winStatus === this.getCPUColor();
  }

  // returns if it is CPU's turn
  isCPUTurn() {
    return this.getTurn() !== this.getUserColor();
  }
  // is there a win
  isWin() {
    return this.winStatus !== -1;
  }

  // update game status
  updateGameInfo(board, whitePieces, whiteKing, blackPieces, blackKing) {
    this.updateWinStatus(board, whitePieces, whiteKing, blackPieces, blackKing);
    this.updateTurn();
  }

  // get turn
  getTurn() {
    return this.turn;
  }

  // get player color
  getUserColor() {
    return this.userColor;
  }

  // get CPU color
  getCPUColor() {
    return this.oppColor(this.getUserColor());
  }

  // get win status
  getWinStatus() {
    return this.winStatus;
  }

  // get opposite color
  oppColor(color) {
    if (color === 0) return 1;
    return 0;
  }

  // create copy of gameInfo
  static copyOfGameInfo(gameInfo) {
    return new GameInfo(
      gameInfo.getTurn(),
      gameInfo.getWinStatus(),
      gameInfo.getUserColor()
    );
  }
}
