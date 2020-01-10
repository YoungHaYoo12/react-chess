import React from "react";

import "./square.css";

/* Square represents a single square on chess board */
function Square(props) {
  let imgURL = "";
  if (props.value) {
    imgURL = props.value.imgURL;
  }

  const className =
    "square " + props.colorClassName + " " + props.highlightClassName;

  return (
    <button className={className} onClick={props.onClick}>
      <img src={imgURL} alt="" />
    </button>
  );
}

export default Square;
