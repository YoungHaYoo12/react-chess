import React from "react";
// get our fontawesome imports
import { faChessRook } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./title.css";
// title compartment of the connect-four board game
function Title(props) {
  // change color of title (h6 component) depending on whether red or yellow turn
  const color = props.turnColor === 0 ? "white-turn" : "black-turn";

  const titleClassName = "title ";

  let message;

  // message to display in h6 component based on state of game

  // if game has been won
  if (props.winner !== -1) {
    const winner = props.winner === 0 ? "Player White, " : "Player Black, ";
    message = winner + "You Have Won!";
  }

  // if game is still going on
  else {
    const player = props.turnColor === 0 ? "Player White, " : "Player Black, ";
    message = player + "It Is Your Turn";
  }

  return (
    <div className={titleClassName}>
      <div className="titleTop">
        <FontAwesomeIcon className="picture" icon={faChessRook} />
        <h3>CHESS</h3>
        <FontAwesomeIcon className="picture" icon={faChessRook} />
      </div>
      <h6 className={color}>{message}</h6>
    </div>
  );
}

export default Title;
