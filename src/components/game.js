import React from "react";
import ChessBoard from "./chessBoard";
import RemovedPieces from "./removedPieces";
import Title from "./title";
import GameButtons from "./gameButtons";
import createPlayers from "../initialSet.js";
import Player from "../player.js";
import GameInfo from "../gameInfo.js";
import Board from "../board.js";
import "./game.css";

const ChessLogic = require("../chessLogic.js");
const Helper = require("../helperFunctions.js");

class Game extends React.Component {
  constructor(props) {
    super(props);
    // dimensions of chess board
    this.numOfRows = 8;
    this.numOfCols = 8;
    // set up initial players and board
    const initialPlayers = createPlayers(0);
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
    const oppPieces = this.getOppPieces();
    const playerCol = this.state.gameInfo.getPlayerColor();

    // code for player to select a piece to move
    if (!this.isPossibleMove(row, col)) {
      /* return if box without pieces has been clicked or player color does
      not match chosen piece's color or if game has been won*/
      if (!piece || this.wrongColor(piece) || this.state.gameInfo.isWin())
        return;

      // create a list of possible moves for the piece
      let king = this.getCurrKing();
      let moves = piece.possibleMoves(board, playerCol);
      // filter out moves resulting in check and add castling if applicable
      moves = piece.checkFilter(moves, oppPieces, board, king, playerCol);
      piece.castleFilter(board, oppPieces, playerCol, moves);

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

      for (const index in possibleMoves) {
        const move = possibleMoves[index];
        // continue if player does not choose among possible moves
        if (!Helper.moveMatchesIndex(move, row, col)) continue;
        // king-side castling picked
        if (
          ChessLogic.isKCastle(board, selectedPiece, oppPieces, playerCol, move)
        ) {
          newBoard = this.updateBoardCastle(board, selectedPiece, true);
        }
        // queen-side castling picked
        else if (
          ChessLogic.isQCastle(board, selectedPiece, oppPieces, playerCol, move)
        ) {
          newBoard = this.updateBoardCastle(board, selectedPiece, false);
        }
        // regular single-piece update
        else {
          newBoard = this.updateBoardPiece(board, selectedPiece, move);
        }

        const history = this.updateHistory(newBoard);

        // update game info
        this.state.gameInfo.updateGameInfo(
          newBoard,
          this.getInPlay(0),
          this.getKing(0),
          this.getInPlay(1),
          this.getKing(1)
        );

        this.setState({
          history: history,
          historyIndex: this.state.historyIndex + 1,
          possibleMoves: [],
          gameInfo: this.state.gameInfo
        });

        break;
      }
      return;
    }
  }

  /* move chess piece; returns array of pieces that have been removed from moves;
piecesToMove is an array of pieces to move and newIndices is an array 
of indices corresponding to elements in piecesToMove */
  updateBoard(board, piecesToMove, newIndices) {
    // copy of board
    let newBoard = Board.copyOfBoard(board);

    // variable containing all opponent pieces that are captured while moving piecesToMove
    const opponentPiecesToRemove = [];

    // for each piece to move
    for (let index in piecesToMove) {
      const pieceToMove = piecesToMove[index];
      const indexToMove = newIndices[index];

      // if there is enemy piece at new index, add it to opponentPiecesToRemove
      const oppPiece = newBoard.pieceAt(indexToMove[0], indexToMove[1]);
      if (oppPiece !== null && oppPiece.color !== pieceToMove.color) {
        opponentPiecesToRemove.push(oppPiece);
      }

      // update newBoard and indices of pieceToMove
      newBoard.moveTo(indexToMove[0], indexToMove[1], pieceToMove);
      pieceToMove.updateIndex(indexToMove[0], indexToMove[1]);
      pieceToMove.hasBeenMoved();
    }

    // remove opponent pieces from piecesInPlay
    const oppColor = GameInfo.oppColor(piecesToMove[0].color);
    this.removeOppPiece(opponentPiecesToRemove, oppColor);

    return newBoard;
  }

  // update board for single piece being moved
  updateBoardPiece(board, piece, move) {
    return this.updateBoard(board, [piece], [move]);
  }

  // update board for castling
  updateBoardCastle(board, king, isKingSideCastle) {
    let rook;
    let newKingCol;
    let newRookCol;
    const piecesToMove = [];
    const newIndices = [];
    // if king-side castling
    if (isKingSideCastle) {
      rook = ChessLogic.getKingSideRook(board, king);
      newKingCol = king.col + 2;
      newRookCol = rook.col - 2;
    } else {
      rook = ChessLogic.getQueenSideRook(board, king);
      newKingCol = king.col - 2;
      newRookCol = rook.col + 3;
    }

    // insert piecesToMove and newIndices
    piecesToMove.push(king);
    piecesToMove.push(rook);
    newIndices.push([king.row, newKingCol]);
    newIndices.push([rook.row, newRookCol]);

    return this.updateBoard(board, piecesToMove, newIndices);
  }

  // helper function for updateBoard() to remove opponent piece from board
  removeOppPiece(oppPieces, oppColor) {
    // create copy of two players
    let playerWhite = Player.copyPlayer(this.getPlayer(0));
    let playerBlack = Player.copyPlayer(this.getPlayer(1));
    // mark which one is opponent
    let opponent;
    oppColor === 0 ? (opponent = playerWhite) : (opponent = playerBlack);

    // update inPlay and offPlay of opponent
    opponent.updateInPlay(oppPieces);
    opponent.updateOffPlay(oppPieces);

    this.setState({ players: [playerWhite, playerBlack] });
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
    for (const index in this.state.possibleMoves) {
      const move = this.state.possibleMoves[index];
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
    const initialPlayers = createPlayers(playerColor);
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
    return (
      <div className="game">
        <Title
          turnColor={this.state.gameInfo.getTurn()}
          winner={this.state.gameInfo.getWinStatus()}
        />
        <div className="board-container">
          <RemovedPieces
            className="whiteRemovedPieces"
            pieces={this.getPiecesOffPlay(0)}
          />
          <ChessBoard
            board={board}
            squareClicked={(row, col) => this.squareClicked(row, col)}
            possibleMoves={this.state.possibleMoves}
          />
          <RemovedPieces
            className="blackRemovedPieces"
            pieces={this.getPiecesOffPlay(1)}
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
