import React from "react";
// get our fontawesome imports
import { faChessRook } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./gameButtons.css";
// title compartment of the connect-four board game
function GameButtons(props) {
  return (
    <div className="gameButtons">
      <button
        className="changePlayerColor playAsBlack"
        onClick={props.changeToBlack}
      >
        Black
      </button>
      <button
        className="changePlayerColor playAsWhite"
        onClick={props.changeToWhite}
      >
        White
      </button>
    </div>
  );
}

export default GameButtons;
