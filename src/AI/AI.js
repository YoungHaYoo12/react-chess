/* File contains the the code needed to run the AI in Chess*/
import Board from "../src/board.js";
import evaluateHeuristic from "./minimaxHeuristic.js";

// function that enables AI to make a move based on Minimax Algorithm
// difficulty level represents the depth of the minimax algorithm
function aiTurn(board, players, gameInfo, difficultyLevel) {
  const currBoard = Board.copyOfBoard(board);

  // from minimax result, get the column of best placement
  const minimaxResult = alphabeta(
    currBoard,
    difficultyLevel,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    true,
    players,
    gameInfo
  );
  // GET SOME RESULT FROM THE MINIMAX ALGORITHM
  const bestColumn = minimaxResult[0];

  // RETURN THE RESULT FROM MINIMAX ALGORITHM
  return [0, bestColumn];
}

// minimax algorithm with alpha beta pruning implemented; computer will be
// maximizing player; returns the best column and best score
function alphabeta(board, depth, a, b, maximizingPlayer, players, gameInfo) {
  // BASE CASE
  const playerWhite = players[0];
  const playerBlack = players[1];

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
    return Number.NEGATIVE_INFINITY;
  } else if (
    gameInfo.isCPUWinner(
      board,
      playerWhite.getInPlay(),
      playerWhite.getKing(),
      playerBlack.getInPlay(),
      playerBlack.getKing()
    )
  ) {
    return Number.POSITIVE_INFINITY;
  }

  // Base Case 3: depth == 0
  if (depth === 0) {
    return evaluateHeuristic(board, gameInfo.getUserColor());
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

    // iterate over the possibility of inserting in each unfilled column
    for (let col = 0; col < numOfCols; col++) {
      if (!BoardFunctions.isColFilled(currentBoard, col)) {
        // update board with index(topRow,col) filled in
        const topRow = BoardFunctions.topRowFilledInCol(currentBoard, 0, col);
        let updatedBoard = BoardFunctions.copyOfBoard(currentBoard);
        updatedBoard = BoardFunctions.updateBoard(
          updatedBoard,
          topRow,
          col,
          -1
        );
        let newVal = alphabeta(updatedBoard, depth - 1, a, b, false)[1];
        if (newVal > bestVal) {
          bestVal = newVal;
          bestColumn = col;
        }

        // alpha beta pruning
        a = Math.max(a, bestVal);
        if (a >= b) {
          break;
        }
      }
    }
    return [bestColumn, bestVal];
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

    // iterate over the possibility of inserting in each unfilled column
    for (let col = 0; col < numOfCols; col++) {
      if (!BoardFunctions.isColFilled(currentBoard, col)) {
        // update board with index(topRow,col) filled in
        const topRow = BoardFunctions.topRowFilledInCol(currentBoard, 0, col);
        let updatedBoard = BoardFunctions.copyOfBoard(currentBoard);
        updatedBoard = BoardFunctions.updateBoard(
          updatedBoard,
          topRow,
          col,
          +1
        );
        let newVal = alphabeta(updatedBoard, depth - 1, a, b, true)[1];
        if (newVal < bestVal) {
          bestVal = newVal;
          bestColumn = col;
        }

        // alpha beta pruning
        b = Math.min(b, bestVal);
        if (a >= b) {
          break;
        }
      }
    }
    return [bestColumn, bestVal];
  }
}

// picks random piece from available pieces
function randomMoveOption(board, player, opponent) {
  const king = player.getKing();
  const playerPieces = player.getInPlay();
  const oppPieces = opponent.getInPlay();
  const moveOptions = []; // elements are array of piece and its moves

  for (let index in playerPieces) {
    const playerPiece = playerPieces[index];
    const moves = playerPiece.filteredMoves(board, king, oppPieces);
    if (moves.length !== 0) {
      const randomMove = getRandomElement(moves);
      moveOptions.push([playerPiece, randomMove]);
    }
  }
  return getRandomElement(moveOptions);
}

// helper function to return random element from an array
function getRandomElement(array) {
  const randomIndex = Math.floor(Math.random * array.length);
  return array[randomIndex];
}

module.exports = {
  aiTurn
};
