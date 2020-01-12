import React from "react";
import Board from "./board";
import RemovedPieces from "./removedPieces";
import Title from "./title";
import GameButtons from "./gameButtons";
import allChessPieces from "../allChessPieces.js";
import "./game.css";

const ChessLogic = require("../chessLogic.js");
const BoardHelperFuncs = require("../boardHelperFunctions.js");

class Game extends React.Component {
  constructor(props) {
    super(props);
    // dimensions of chess board
    this.numOfRows = 8;
    this.numOfCols = 8;

    // array consisting of allWhitePieces,allBlackPieces,and ref. to kings
    const chessPieces = allChessPieces(0);
    // save reference to the two kings
    this.kings = chessPieces[2];
    this.state = {
      // array of all board states at a certain period of game
      history: [
        {
          board: BoardHelperFuncs.getStartBoard(chessPieces[0], chessPieces[1])
        }
      ],
      // index for which board state of history should be displayed
      historyIndex: 0,
      // possible moves possible for selected piece
      possibleMoves: [],
      // keeps track of currently selected piece
      selectedPiece: null,
      // keeps track of which player's turn it is (white:0,black:1)
      turnColor: 0,
      // keeps track of which player has won (-1 if no winner, 0 for white, 1 for black)
      winner: -1,
      // keeps track of which color the user wants to be (white:0,black:1)
      playerColor: 0,
      // keeps track of all piecs in play (index 0 for white, index 1 for black)
      piecesInPlay: [chessPieces[0], chessPieces[1]],
      // keeps track of all pieces off play (index 0 for white, index 1 for black)
      piecesOffPlay: [[], []]
    };
  }

  /* helper function for squareClicked() to check if player has clicked 
  among possible moves */
  pickedPossibleMove(row, col) {
    for (const index in this.state.possibleMoves) {
      const move = this.state.possibleMoves[index];
      if (row === move[0] && col === move[1]) return true;
    }
    return false;
  }

  // helper function to give opposite color (0 for white, 1 for black)
  oppositeColor(color) {
    if (color === 0) return 1;
    return 0;
  }

  // move piece to another square
  squareClicked(row, col) {
    const board = this.state.history[this.state.historyIndex].board;
    const piece = board[row][col];

    // code for player to select a piece to move
    if (!this.pickedPossibleMove(row, col)) {
      /* return if box without pieces has been clicked or player color does
      not match chosen piece's color or if game has been won*/
      if (
        !piece ||
        this.state.turnColor !== piece.color ||
        this.state.winner !== -1
      ) {
        return;
      }

      // create a list of possible moves for the piece
      let opponentPieces = this.state.piecesInPlay[
        this.oppositeColor(this.state.turnColor)
      ];
      let king = this.kings[this.state.turnColor];
      let possibleMoves = piece.possibleMoves(board, this.state.playerColor);
      possibleMoves = piece.filterMovesResultingInCheck(
        possibleMoves,
        opponentPieces,
        board,
        king,
        this.state.playerColor
      );

      this.setState({
        possibleMoves: possibleMoves,
        selectedPiece: board[row][col]
      });
    }

    // code for player to move selected piece
    else {
      const possibleMoves = this.state.possibleMoves;

      // return if player does not choose among possible moves
      for (const index in possibleMoves) {
        const move = possibleMoves[index];

        if (BoardHelperFuncs.moveMatchesIndex(move, row, col)) {
          // updated version of board
          let newBoard = BoardHelperFuncs.copyOfBoard(board);
          newBoard = this.updateBoard(
            newBoard,
            [this.state.selectedPiece],
            [[row, col]]
          );
          // updated version of history
          const history = this.updateHistory(newBoard);

          this.setState(
            {
              history: history,
              historyIndex: this.state.historyIndex + 1,
              possibleMoves: [],
              turnColor: this.oppositeColor(this.state.turnColor)
            },
            () =>
              this.updateGameStatus(
                this.state.history[this.state.historyIndex].board
              )
          );

          break;
        }
      }
      return;
    }
  }

  /* move chess piece; returns array of pieces that have been removed from moves;
piecesToMove is an array of pieces to move and newIndices is an array 
of indices corresponding to elements in piecesToMove */
  updateBoard(board, piecesToMove, newIndices) {
    // variable containing all opponent pieces that are captured while moving piecesToMove
    const opponentPiecesToRemove = [];

    // for each piece to move
    for (let index in piecesToMove) {
      const pieceToMove = piecesToMove[index];
      const indexToMove = newIndices[index];
      const rowToMove = indexToMove[0];
      const colToMove = indexToMove[1];

      // if there is enemy piece at new index, add it to opponentPiecesToRemove
      const enemyPieceAtNewIndex = board[rowToMove][colToMove];
      if (
        enemyPieceAtNewIndex !== null &&
        enemyPieceAtNewIndex.color !== pieceToMove.color
      ) {
        opponentPiecesToRemove.push(enemyPieceAtNewIndex);
      }

      // update boardCopy and indices of pieceToMove
      board[pieceToMove.row][pieceToMove.col] = null;
      board[rowToMove][colToMove] = pieceToMove;
      pieceToMove.updateIndex(rowToMove, colToMove);
      pieceToMove.hasBeenMoved();
    }

    // variable storing what color opponent's piece is
    const opponentPieceColor = this.oppositeColor(piecesToMove[0].color);
    this.removeOpponentPiece(board, opponentPiecesToRemove, opponentPieceColor);

    return board;
  }

  // helper function for updateBoard() to remove opponent piece from board
  removeOpponentPiece(board, opponentPiecesToRemove, opponentPieceColor) {
    // create copies of piecesInPlay and piecesOffPlay
    let piecesInPlay = BoardHelperFuncs.copyOfBoard(this.state.piecesInPlay);
    let piecesOffPlay = BoardHelperFuncs.copyOfBoard(this.state.piecesOffPlay);

    // remove opponentPiecesToRemove from opponentPieces
    piecesInPlay[opponentPieceColor] = piecesInPlay[opponentPieceColor].filter(
      function(piece) {
        for (let index in opponentPiecesToRemove) {
          const opponentPieceToRemove = opponentPiecesToRemove[index];
          if (piece === opponentPieceToRemove) return false;
        }
        return true;
      }
    );

    // update opponent pieces off play
    for (let index in opponentPiecesToRemove) {
      const opponentPiece = opponentPiecesToRemove[index];
      piecesOffPlay[opponentPieceColor].push(opponentPiece);
    }

    this.setState({ piecesInPlay: piecesInPlay, piecesOffPlay: piecesOffPlay });
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

  // helper function to check for wins (0 for white win, 1 for black)
  updateGameStatus(board) {
    let winner = -1;
    // white checkmated
    if (
      ChessLogic.isKingInCheckmate(
        board,
        this.state.piecesInPlay[0],
        this.state.piecesInPlay[1],
        this.kings[0],
        this.state.playerColor
      )
    ) {
      winner = 1;
    }
    // black checkmated
    else if (
      ChessLogic.isKingInCheckmate(
        board,
        this.state.piecesInPlay[1],
        this.state.piecesInPlay[0],
        this.kings[1],
        this.state.playerColor
      )
    ) {
      winner = 0;
    }
    this.setState({ winner: winner });
  }

  // function to change playerColor and reset board accordingly
  changePlayerColor(playerColor) {
    // array consisting of allWhitePieces,allBlackPieces,and ref. to kings
    const chessPieces = allChessPieces(playerColor);
    // save reference to the two kings
    this.kings = chessPieces[2];
    this.setState({
      // array of all board states at a certain period of game
      history: [
        {
          board: BoardHelperFuncs.getStartBoard(chessPieces[0], chessPieces[1])
        }
      ],
      // index for which board state of history should be displayed
      historyIndex: 0,
      // possible moves possible for selected piece
      possibleMoves: [],
      // keeps track of currently selected piece index
      selectedPieceRow: null,
      selectedPieceCol: null,
      selectedPiece: null,
      // keeps track of which player's turn it is (white:0,black:1)
      turnColor: 0,
      // keeps track of which player has won (-1 if no winner, 0 for white, 1 for black)
      winner: -1,
      // keeps track of which color the user wants to be (white:0,black:1)
      playerColor: playerColor,
      // keeps track of all piecs in play (index 0 for white, index 1 for black)
      piecesInPlay: [chessPieces[0], chessPieces[1]],
      // keeps track of all pieces off play (index 0 for white, index 1 for black)
      piecesOffPlay: [[], []]
    });
  }

  // function for HistoryButton to allow user to reset game
  reset() {
    this.changePlayerColor(this.state.playerColor);
  }
  render() {
    // get current board state which should be displayed
    const board = this.state.history[this.state.historyIndex].board;

    return (
      <div className="game">
        <Title turnColor={this.state.turnColor} winner={this.state.winner} />
        <div className="board-container">
          <RemovedPieces
            className="whiteRemovedPieces"
            pieces={this.state.piecesOffPlay[0]}
          />
          <Board
            board={board}
            squareClicked={(row, col) => this.squareClicked(row, col)}
            possibleMoves={this.state.possibleMoves}
          />
          <RemovedPieces
            className="blackRemovedPieces"
            pieces={this.state.piecesOffPlay[1]}
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
