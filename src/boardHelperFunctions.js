const numOfRows = 8;
const numOfCols = 8;

// helper function to return copy of a board
function copyOfBoard(board) {
  return board.map(function(arr) {
    return arr.slice();
  });
}

// helper function to return copy of array
function copyOfArray(array) {
  const copy = [];
  for (let i = 0; i < array.length; i++) {
    copy.push(array[i]);
  }
  return copy;
}

// helper function to create empty board of dimensions row x col
function emptyBoard(numOfRows, numOfCols) {
  let colArr = Array(numOfCols).fill(null);
  return Array(numOfRows)
    .fill(null)
    .map(() => colArr.slice());
}

// helper function to return starting chess board
function getStartBoard(allWhitePieces, allBlackPieces) {
  let board = emptyBoard(numOfRows, numOfCols);

  // fill white
  for (let index in allWhitePieces) {
    const piece = allWhitePieces[index];
    const row = piece.row;
    const col = piece.col;
    board[row][col] = piece;
  }

  // fill black
  for (let index in allBlackPieces) {
    const piece = allBlackPieces[index];
    const row = piece.row;
    const col = piece.col;
    board[row][col] = piece;
  }
  return board;
}

// helper function to show if move matches given index
function moveMatchesIndex(move, row, col) {
  return move[0] === row && move[1] === col;
}

module.exports = {
  getStartBoard,
  copyOfBoard,
  copyOfArray,
  moveMatchesIndex
};
