// Components
import "./components/header";
import "./components/pet-card";

// Pages
import "./pages/home/home";
import "./pages/signin";

// Router
import "./router";

// State
import { state } from "./state";

function main() {
  state.initState();
}

main();
