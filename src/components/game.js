import React from "react";
import ChessBoard from "./chessBoard";
import RemovedPieces from "./removedPieces";
import Title from "./title";
import GameButtons from "./gameButtons";
import createPlayers from "../initialSet.js";
import GameInfo from "../gameInfo.js";
import Board from "../board.js";
import aiTurn from "../AI/AI.js";
import "./game.css";

const ChessLogic = require("../chessLogic.js");
const Helper = require("../helperFunctions.js");
const Piece = require("../chessPiece.js");

class Game extends React.Component {
  constructor(props) {
    super(props);
    // dimensions of chess board
    this.numOfRows = 8;
    this.numOfCols = 8;
    // set up initial players and board
    const initialPlayers = createPlayers();
    const initialBoard = new Board(8, 8, null);
    initialBoard.makeStartBoard(
      initialPlayers[0].getInPlay(),
      initialPlayers[1].getInPlay()
    );

    this.state = {
      // array of all board states at a certain period of game
      history: [
        {
          board: initialBoard
        }
      ],
      // index for which board state of history should be displayed
      historyIndex: 0,
      // possible moves possible for selected piece
      possibleMoves: [],
      // keeps track of currently selected piece
      selectedPiece: null,
      // stores information about game
      gameInfo: new GameInfo(0, -1, 0),
      // reference to two players
      players: initialPlayers
    };
  }

  // move piece to another square
  squareClicked(row, col) {
    const board = this.getCurrBoard();
    const piece = board.pieceAt(row, col);
    const playerKing = this.getCurrKing();
    const oppPieces = this.getOppPieces();
    const players = this.state.players;

    // code for player to select a piece to move
    if (!this.isPossibleMove(row, col)) {
      /* return if box without pieces has been clicked or player color does
      not match chosen piece's color or if game has been won*/
      if (!piece || this.wrongColor(piece) || this.state.gameInfo.isWin())
        return;

      // create a list of possible moves for the piece
      const moves = piece.filteredMoves(board, playerKing, oppPieces);

      this.setState({
        possibleMoves: moves,
        selectedPiece: piece
      });
    }

    // code for player to move selected piece
    else {
      const possibleMoves = this.state.possibleMoves;
      const selectedPiece = this.state.selectedPiece;
      let newBoard;
      let newPlayers;

      for (const move of possibleMoves) {
        // continue if player does not choose among possible moves
        if (!Helper.moveMatchesIndex(move, row, col)) continue;
        // king-side castling picked
        if (ChessLogic.isKCastle(board, selectedPiece, oppPieces, move)) {
          newPlayers = board.removeCapturedCastle(selectedPiece, true, players);
          newBoard = board.updateBoardCastle(selectedPiece, true);
          Piece.Piece.updatePiecesCastle(board, selectedPiece, true);
        }
        // queen-side castling picked
        else if (ChessLogic.isQCastle(board, selectedPiece, oppPieces, move)) {
          newPlayers = board.removeCapturedCastle(
            selectedPiece,
            false,
            players
          );
          newBoard = board.updateBoardCastle(selectedPiece, false);
          Piece.Piece.updatePiecesCastle(board, selectedPiece, false);
        }
        // regular single-piece update
        else {
          newPlayers = board.removeCapturedPiece(selectedPiece, move, players);
          newBoard = board.updateBoardPiece(selectedPiece, move);
          Piece.Piece.updatePiece(selectedPiece, move);
        }

        const history = this.updateHistory(newBoard);

        // update game info
        this.state.gameInfo.updateGameInfo(
          newBoard,
          newPlayers[0].getInPlay(),
          newPlayers[0].getKing(),
          newPlayers[1].getInPlay(),
          newPlayers[1].getKing()
        );

        this.setState(
          {
            history: history,
            historyIndex: this.state.historyIndex + 1,
            possibleMoves: [],
            gameInfo: this.state.gameInfo,
            players: newPlayers
          },

          function() {
            if (this.state.gameInfo.isCPUTurn()) {
              this.AIClick();
            }
          }
        );

        break;
      }
      return;
    }
  }

  async AIClick() {
    // get random piece from CPU pieces
    const minimaxResult = aiTurn(
      this.getCurrBoard(),
      this.state.players,
      this.state.gameInfo,
      2
    );
    const piece = minimaxResult[0];
    const move = minimaxResult[1];

    // Promise to wait for piece to be selected
    let selectPiece = (row, col) => {
      return new Promise((resolve, reject) => {
        this.squareClicked(piece.row, piece.col);
        resolve();
      });
    };
    // select move after piece has been selected
    await selectPiece(piece.row, piece.col).then(() => {
      const chosenMove = move;
      this.squareClicked(chosenMove[0], chosenMove[1]);
    });
  }

  // helper function to add currentBoard to the history array
  updateHistory(board) {
    /* add current board to history and increment history index
     *** if historyIndex is less than historyLength-1, it 
     means that a move has been played after the user has 
     used the jump backwards button. Therefore, all elements in history after
     where historyIndex currently is should be erased *** 
     */
    const historyIndex = this.state.historyIndex;
    const historyLength = this.state.history.length;
    let history = this.state.history;
    if (historyIndex < historyLength - 1) {
      history = this.state.history.splice(0, historyIndex + 1);
    }

    return history.concat([{ board: board }]);
  }

  /* helper function for squareClicked() to check if player has clicked 
  among possible moves */
  isPossibleMove(row, col) {
    for (const move of this.state.possibleMoves) {
      if (row === move[0] && col === move[1]) return true;
    }
    return false;
  }

  // helper function to tell whether player picked piece with wrong color
  wrongColor(piece) {
    return this.state.gameInfo.getTurn() !== piece.color;
  }

  // helper function to get opponent pieces at a certain point in the game
  getOppPieces() {
    return this.getInPlay(
      this.state.gameInfo.oppColor(this.state.gameInfo.getTurn())
    );
  }

  // helper function to get player of color
  getPlayer(color) {
    return this.state.players[color];
  }

  // helper function to get pieces in play of player of certain color
  getInPlay(color) {
    return this.getPlayer(color).inPlay;
  }

  // helper function to get pieces off play of player of certain color
  getPiecesOffPlay(color) {
    return this.getPlayer(color).offPlay;
  }

  // helper function to get king of player of certain color
  getKing(color) {
    return this.getPlayer(color).king;
  }

  // helper function to get king of current player
  getCurrKing() {
    return this.getKing(this.state.gameInfo.getTurn());
  }

  // helper function to get current board
  getCurrBoard() {
    const board = this.state.history[this.state.historyIndex].board;
    return board;
  }

  // function for HistoryButton to allow user to reset game
  reset(playerColor = 0) {
    const initialPlayers = createPlayers();
    const initialBoard = new Board(8, 8, null);
    initialBoard.makeStartBoard(
      initialPlayers[0].getInPlay(),
      initialPlayers[1].getInPlay()
    );

    this.setState({
      history: [
        {
          board: initialBoard
        }
      ],
      historyIndex: 0,
      possibleMoves: [],
      selectedPiece: null,
      gameInfo: new GameInfo(0, -1, playerColor),
      players: initialPlayers
    });
  }

  // function to change playerColor and reset board accordingly
  changePlayerColor(playerColor) {
    this.reset(playerColor);
  }

  render() {
    // get current board state which should be displayed
    const board = this.getCurrBoard();

    /* rotate board-container if player chooses black color; also pass
     along argument to ChessBoard and RemovedPieces to rotate them as well */
    const playerColor = this.state.gameInfo.getUserColor();
    let colorClassName = "";
    playerColor === 0
      ? (colorClassName = "")
      : (colorClassName = "playerIsBlack");

    // rotate board-container if player chooses black color; also pass
    // along argument to ChessBoard and RemovedPieces to rotate them as well
    const boardContainerClassName = "board-container " + colorClassName;

    return (
      <div className="game">
        <Title
          turnColor={this.state.gameInfo.getTurn()}
          winner={this.state.gameInfo.getWinStatus()}
        />
        <div className={boardContainerClassName}>
          <RemovedPieces
            className="whiteRemovedPieces"
            pieces={this.getPiecesOffPlay(0)}
            playerColor={playerColor}
            colorClassName={colorClassName}
          />
          <ChessBoard
            board={board}
            squareClicked={(row, col) => this.squareClicked(row, col)}
            possibleMoves={this.state.possibleMoves}
            colorClassName={colorClassName}
          />
          <RemovedPieces
            className="blackRemovedPieces"
            pieces={this.getPiecesOffPlay(1)}
            colorClassName={colorClassName}
          />
        </div>
        <GameButtons
          changeToWhite={() => this.changePlayerColor(0)}
          changeToBlack={() => this.changePlayerColor(1)}
          reset={() => this.reset()}
        />
      </div>
    );
  }
}

export default Game;
