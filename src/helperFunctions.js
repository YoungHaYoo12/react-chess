// helper function to return copy of array
function copyOfArray(array) {
  const copy = [];
  for (let i = 0; i < array.length; i++) {
    copy.push(array[i]);
  }
  return copy;
}

// helper function to filter out pieces from array
function filterOut(array, piecesToRemove) {
  return array.filter(function(piece) {
    for (let index in piecesToRemove) {
      const pieceToRemove = piecesToRemove[index];
      if (piece === pieceToRemove) {
        return false;
      }
    }
    return true;
  });
}

// helper function to insert pieces into array
function insertIntoArray(array, pieces) {
  for (let index in pieces) {
    array.push(pieces[index]);
  }
}

// helper function to show if move matches given index
function moveMatchesIndex(move, row, col) {
  return move[0] === row && move[1] === col;
}

module.exports = {
  copyOfArray,
  moveMatchesIndex,
  filterOut,
  insertIntoArray
};
