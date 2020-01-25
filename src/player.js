// class player stores information about a player in the chess game
const Helper = require("./helperFunctions.js");
export default class Player {
  constructor(color, inPlay, offPlay, king) {
    this.color = color;
    // inPlay for pieces in play
    this.inPlay = inPlay;
    // offPlay for pieces off play
    this.offPlay = offPlay;
    this.king = king;
  }

  // update pieces in play (filter out pieces)
  updateInPlay(pieces) {
    this.inPlay = Helper.filterOut(this.inPlay, pieces);
  }

  // update pieces off play (insert new pieces)
  updateOffPlay(pieces) {
    Helper.insertIntoArray(this.offPlay, pieces);
  }

  // get pieces in play
  getInPlay() {
    return this.inPlay;
  }

  // get pieces off play
  getOffPlay() {
    return this.offPlay;
  }

  // get king
  getKing() {
    return this.king;
  }

  // return copy of pieces in play
  inPlayCopy() {
    return Helper.copyOfArray(this.inPlay);
  }

  // return copy of pieces off play
  offPlayCopy() {
    return Helper.copyOfArray(this.offPlay);
  }

  // create new copy of player
  static copyPlayer(player) {
    const inPlayCopy = player.inPlayCopy();
    const offPlayCopy = player.offPlayCopy();
    // reassign king as well
    let kingCopy = null;
    for (const piece of inPlayCopy) {
      if (piece.name === "king") kingCopy = piece;
    }
    return new Player(player.color, inPlayCopy, offPlayCopy, kingCopy);
  }
}
