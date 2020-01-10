import React from "react";

import "./removedPieces.css";

/* Square represents a single square on chess board */
function RemovedPieces(props) {
  const pieces = [];
  for (let index in props.pieces) {
    pieces.push(
      <img className="removedPiece" src={props.pieces[index].imgURL} alt="" />
    );
  }
  const className = "removedPieces " + props.className;
  return (
    <div className={className}>
      <div className="centeringContainer">{pieces}</div>
    </div>
  );
}

export default RemovedPieces;
