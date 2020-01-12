import React from "react";
// get our fontawesome imports
import {
  faChevronRight,
  faChevronLeft,
  faUndo
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./gameButtons.css";
// title compartment of the connect-four board game
function GameButtons(props) {
  return (
    <div className="gameButtons">
      <div className="colorButtons buttonDiv">
        <button
          className="changePlayerColor playAsWhite button"
          onClick={props.changeToWhite}
        >
          White
        </button>

        <button
          className="changePlayerColor playAsBlack button"
          onClick={props.changeToBlack}
        >
          Black
        </button>
      </div>
      <div className="resetButton buttonDiv">
        <button className="historyButton button" onClick={props.reset}>
          <FontAwesomeIcon icon={faUndo} />
        </button>
      </div>
    </div>
  );
}

export default GameButtons;
