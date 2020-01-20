/* gameinfo stores information about a chess game, such as game status,
 what color the player chose, and whose turn it is */
const ChessLogic = require("./chessLogic.js");

export default class GameInfo {
  constructor(turn, winStatus, playerColor) {
    // keeps track of whose turn it is (0 for white, 1 for black)
    this.turn = 0;
    // keeps track of winning status (no win: -1, white win:0, black win: 1)
    this.winStatus = -1;
    // keeps track of which color that player chose to be
    this.playerColor = playerColor;
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
    // white checkmated
    if (
      ChessLogic.isKingInCheckmate(
        board,
        whitePieces,
        blackPieces,
        whiteKing,
        this.getPlayerColor()
      )
    ) {
      this.winStatus = 1;
    }
    // black checkmated
    else if (
      ChessLogic.isKingInCheckmate(
        board,
        blackPieces,
        whitePieces,
        blackKing,
        this.getPlayerColor()
      )
    ) {
      this.winStatus = 0;
    }
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
  getPlayerColor() {
    return this.playerColor;
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
      gameInfo.getPlayerColor()
    );
  }
}
