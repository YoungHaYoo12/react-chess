import React from "react";
import ReactDOM from "react-dom";
import Square from "./square";

import "./chessBoard.css";

class ChessBoard extends React.Component {
  constructor(props) {
    super(props);
  }

  renderSquare(row, col) {
    // determine whether square should be colored or not
    let colorClassName = "light";
    if ((row + col) % 2 === 1) {
      colorClassName = "dark";
    }
    // mark squares to be highlighted
    let highlightClassName = "";
    const possibleMoves = this.props.possibleMoves;
    for (const index in possibleMoves) {
      const move = possibleMoves[index];
      if (move[0] === row && move[1] === col) highlightClassName = "highlight";
    }

    return (
      <Square
        colorClassName={colorClassName}
        highlightClassName={highlightClassName}
        value={this.props.board.pieceAt(row, col)}
        onClick={() => this.props.squareClicked(row, col)}
      />
    );
  }
  renderRow(row) {
    return (
      <div className="row">
        {this.renderSquare(row, 0)}
        {this.renderSquare(row, 1)}
        {this.renderSquare(row, 2)}
        {this.renderSquare(row, 3)}
        {this.renderSquare(row, 4)}
        {this.renderSquare(row, 5)}
        {this.renderSquare(row, 6)}
        {this.renderSquare(row, 7)}
      </div>
    );
  }

  render() {
    return (
      <div className="board">
        {this.renderRow(0)}
        {this.renderRow(1)}
        {this.renderRow(2)}
        {this.renderRow(3)}
        {this.renderRow(4)}
        {this.renderRow(5)}
        {this.renderRow(6)}
        {this.renderRow(7)}
      </div>
    );
  }
}

export default ChessBoard;
