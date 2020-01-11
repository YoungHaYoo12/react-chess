import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Game from "./components/game";
import "./index.css";

const rootElement = document.getElementById("root");
ReactDOM.render(<Game />, rootElement);
