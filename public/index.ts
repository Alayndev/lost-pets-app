// Components
import "./components/header";
import "./components/pet-card";
import "./components/button";
import "./components/loader";

// Pages
import "./pages/home/home";
import "./pages/login/login";
import "./pages/user-data/user-data";
import "./pages/user-pets/user-pets";
import "./pages/pet-data/pet-data";

// Router
import "./router";

// State
import { state } from "./state";

function main() {
  state.initState();
}

main();
