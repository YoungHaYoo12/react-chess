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

  // rotate removedPieces if player chooses black color
  const colorClassName = props.colorClassName;

  const className = colorClassName + " removedPieces " + props.className;
  return (
    <div className={className}>
      <div className="centeringContainer">{pieces}</div>
    </div>
  );
}

export default RemovedPieces;
