/* File contains the the code needed to run the AI in Chess*/
import evaluateHeuristic from "./minimaxHeuristic.js";
const ChessLogic = require("../chessLogic.js");
const Piece = require("../chessPiece.js");

// function that enables AI to make a move based on Minimax Algorithm
// difficulty level represents the depth of the minimax algorithm
export default function aiTurn(board, players, gameInfo, difficultyLevel) {
  // from minimax result, get best piece and move
  const minimaxResult = alphabeta(
    board,
    difficultyLevel,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    true,
    players,
    gameInfo
  );

  // GET RESULT FROM THE MINIMAX ALGORITHM
  const bestPiece = minimaxResult[0];
  const bestMove = minimaxResult[1];

  // RETURN THE RESULT FROM MINIMAX ALGORITHM
  return [bestPiece, bestMove];
}

// minimax algorithm with alpha beta pruning implemented; computer will be
// maximizing player; returns the best move to make with a piece
function alphabeta(board, depth, a, b, maximizingPlayer, players, gameInfo) {
  // BASE CASE
  const playerWhite = players[0];
  const playerBlack = players[1];
  const CPU = players[gameInfo.getCPUColor()];
  const user = players[gameInfo.getUserColor()];

  // Base Case 1: winner
  // if human player wins
  if (
    gameInfo.isPlayerWinner(
      board,
      playerWhite.getInPlay(),
      playerWhite.getKing(),
      playerBlack.getInPlay(),
      playerBlack.getKing()
    )
  ) {
    return [null, null, Number.NEGATIVE_INFINITY];
  } else if (
    gameInfo.isCPUWinner(
      board,
      playerWhite.getInPlay(),
      playerWhite.getKing(),
      playerBlack.getInPlay(),
      playerBlack.getKing()
    )
  ) {
    return [null, null, Number.POSITIVE_INFINITY];
  }

  // Base Case 3: depth == 0
  if (depth === 0) {
    return [null, null, evaluateHeuristic(board, gameInfo.getUserColor())];
  }

  // if computer turn
  if (maximizingPlayer) {
    let bestVal = Number.NEGATIVE_INFINITY;
    const randomOption = randomMoveOption(
      board,
      players[gameInfo.getCPUColor()],
      players[gameInfo.getUserColor()]
    );
    let bestPiece = randomOption[0];
    let bestMove = randomOption[1];

    // iterate over moves for each CPU piece in play
    for (const piece of CPU.getInPlay()) {
      for (const move of piece.filteredMoves(
        board,
        CPU.getKing(),
        user.getInPlay()
      )) {
        // original indices to set pieces back to normal afterwards
        const piecesToMoveBack = [];
        const originalIndices = [];
        const originalHasBeenMoved = [];
        piecesToMoveBack.push(piece);
        originalIndices.push([piece.row, piece.col]);
        originalHasBeenMoved.push(piece.hasUsedFirstMove);

        // update board and players
        let updatedBoard = null;
        let updatedPlayers = players;
        if (ChessLogic.isKCastle(board, piece, user.getInPlay(), move)) {
          const rook = board.getKingSideRook(CPU.getKing());
          piecesToMoveBack.push(rook);
          originalIndices.push([rook.row, rook.col]);
          originalHasBeenMoved.push(rook.hasUsedFirstMove);
          updatedBoard = board.updateBoardCastle(piece, true);
          updatedPlayers = board.removeCapturedCastle(piece, true, players);
          Piece.Piece.updatePiecesCastle(board, piece, true);
        } else if (ChessLogic.isQCastle(board, piece, user.getInPlay(), move)) {
          const rook = board.getQueenSideRook(CPU.getKing());
          piecesToMoveBack.push(rook);
          originalIndices.push([rook.row, rook.col]);
          originalHasBeenMoved.push(rook.hasUsedFirstMove);
          updatedBoard = board.updateBoardCastle(piece, false);
          updatedPlayers = board.removeCapturedCastle(piece, false, players);
          Piece.Piece.updatePiecesCastle(board, piece, false);
        } else {
          updatedBoard = board.updateBoardPiece(piece, move);
          updatedPlayers = board.removeCapturedPiece(piece, move, players);
          Piece.Piece.updatePiece(piece, move);
        }

        // call recursive function
        let newVal = alphabeta(
          updatedBoard,
          depth - 1,
          a,
          b,
          false,
          updatedPlayers,
          gameInfo
        )[2];
        if (newVal > bestVal) {
          bestVal = newVal;
          bestPiece = piece;
          bestMove = move;
        }

        // change back player piece positions
        for (const index in piecesToMoveBack) {
          const pieceToMoveBack = piecesToMoveBack[index];
          const originalIndex = originalIndices[index];
          pieceToMoveBack.updateIndex(originalIndex[0], originalIndex[1]);
          pieceToMoveBack.hasBeenMoved(originalHasBeenMoved[index]);
        }

        // alpha beta pruning
        a = Math.max(a, bestVal);
        if (a >= b) {
          console.log("pruning");
          break;
        }
      }
    }
    return [bestPiece, bestMove, bestVal];
  }

  // if human turn
  if (!maximizingPlayer) {
    let bestVal = Number.POSITIVE_INFINITY;
    const randomOption = randomMoveOption(
      board,
      players[gameInfo.getUserColor()],
      players[gameInfo.getCPUColor()]
    );
    let bestPiece = randomOption[0];
    let bestMove = randomOption[1];

    // iterate over moves for each CPU piece in play
    for (const piece of user.getInPlay()) {
      for (const move of piece.filteredMoves(
        board,
        user.getKing(),
        CPU.getInPlay()
      )) {
        // original indices to set pieces back to normal afterwards
        const piecesToMoveBack = [];
        const originalIndices = [];
        const originalHasBeenMoved = [];
        piecesToMoveBack.push(piece);
        originalIndices.push([piece.row, piece.col]);
        originalHasBeenMoved.push(piece.hasUsedFirstMove);

        // update board and players
        let updatedBoard = board.copyOfBoard();
        let updatedPlayers = players;
        if (ChessLogic.isKCastle(board, piece, CPU.getInPlay(), move)) {
          const rook = board.getKingSideRook(user.getKing());
          piecesToMoveBack.push(rook);
          originalIndices.push([rook.row, rook.col]);
          originalHasBeenMoved.push(rook.hasUsedFirstMove);
          updatedBoard = board.updateBoardCastle(piece, true);
          updatedPlayers = board.removeCapturedCastle(piece, true, players);
          Piece.Piece.updatePiecesCastle(board, piece, true);
        } else if (ChessLogic.isQCastle(board, piece, CPU.getInPlay(), move)) {
          const rook = board.getQueenSideRook(user.getKing());
          piecesToMoveBack.push(rook);
          originalIndices.push([rook.row, rook.col]);
          originalHasBeenMoved.push(rook.hasUsedFirstMove);
          updatedBoard = board.updateBoardCastle(piece, false);
          updatedPlayers = board.removeCapturedCastle(piece, false, players);
          Piece.Piece.updatePiecesCastle(board, piece, false);
        } else {
          updatedBoard = board.updateBoardPiece(piece, move);
          updatedPlayers = board.removeCapturedPiece(piece, move, players);
          Piece.Piece.updatePiece(piece, move);
        }

        // call recursive function
        const alphabetaResult = alphabeta(
          updatedBoard,
          depth - 1,
          a,
          b,
          true,
          updatedPlayers,
          gameInfo
        );
        let newVal = alphabetaResult[2];

        if (newVal < bestVal) {
          bestVal = newVal;
          bestPiece = piece;
          bestMove = move;
        }

        // change back player piece positions
        for (const index in piecesToMoveBack) {
          const pieceToMoveBack = piecesToMoveBack[index];
          const originalIndex = originalIndices[index];
          pieceToMoveBack.updateIndex(originalIndex[0], originalIndex[1]);
          pieceToMoveBack.hasBeenMoved(originalHasBeenMoved[index]);
        }

        // alpha beta pruning
        a = Math.min(a, bestVal);
        if (a >= b) {
          console.log("pruning");

          break;
        }
      }
    }
    return [bestPiece, bestMove, bestVal];
  }
}

// picks random piece from available pieces
function randomMoveOption(board, player, opponent) {
  const playerKing = player.getKing();
  const playerPieces = player.getInPlay();
  const oppPieces = opponent.getInPlay();
  const moveOptions = []; // elements are array of piece and its moves

  for (const playerPiece of playerPieces) {
    const moves = playerPiece.filteredMoves(board, playerKing, oppPieces);
    if (moves.length !== 0) {
      const randomMove = getRandomElement(moves);
      moveOptions.push([playerPiece, randomMove]);
    }
  }
  return getRandomElement(moveOptions);
}

// helper function to return random element from an array
function getRandomElement(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
