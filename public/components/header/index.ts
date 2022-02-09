import "./index.css";
import { Router } from "@vaadin/router";

const footprint = require("url:../../images/footprint.png");

class HeaderComp extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  addListeners() {
    const signInButton = this.querySelector(".singin");
    console.log(signInButton);

    signInButton.addEventListener("click", () => {
      Router.go("/signin");
    });
    // const enterGameButton = this.querySelector(".entergame-button");
    // enterGameButton.addEventListener("click", () => {
    //   Router.go("/entergame");
    // });
  }

  render() {
    this.innerHTML = `
    <nav class="navbar navbar-expand-md navbar-light bg-light">
      <div class="container-fluid">

        <img class="navbar-brand" src="${footprint}"> </img>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          
            <li class="nav-item">
              <button type="button" class="btn btn-outline-dark me"> Me </button>
            </li>

            <li class="nav-item">
              <button type="button" class="btn btn-outline-dark">  My Reported Pets </button>
            </li>

            <li class="nav-item">
              <button type="button" class="btn btn-outline-dark"> Report a pet </button>
            </li>

            <li class="nav-item">
              <button type="button" class="btn btn-outline-dark signin"> Log in </button>
            </li>

            <li class="nav-item">
              <button type="button" class="btn btn-outline-info"> Sign up </button>
            </li>

          
          </ul>
        </div>
      </div>
    </nav>
    `;
  }
}

customElements.define("x-header-comp", HeaderComp);
