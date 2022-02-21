import "./index.css";
import { Router } from "@vaadin/router";

const footprint = require("url:../../images/footprint.png");

class HeaderComp extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  addListeners() {
    const logInButton = this.querySelector(".log-in");
    logInButton.addEventListener("click", () => {
      Router.go("/login");
    });

    const myDataButton = this.querySelector(".me");
    myDataButton.addEventListener("click", () => {
      Router.go("/user-data");
    });

    const myPetsButton = this.querySelector(".my-pets");
    myPetsButton.addEventListener("click", () => {
      Router.go("/user-pets");
    });

    const petDataButton = this.querySelector(".pet-data");
    petDataButton.addEventListener("click", () => {
      Router.go("/pet-data");
    });

    const footprintButton = this.querySelector(".logo");
    footprintButton.addEventListener("click", () => {
      Router.go("/");
    });
  }

  render() {
    this.innerHTML = `
    <nav class="navbar navbar-expand-md navbar-light bg-light">
      <div class="container-fluid">

        <img class="navbar-brand logo" src="${footprint}"> </img>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          
            <li class="nav-item">
              <button type="button" class="btn btn-outline-dark me"> Mis datos </button>
            </li>

            <li class="nav-item">
              <button type="button" class="btn btn-outline-dark my-pets">  Mis mascotas reportadas </button>
            </li>

            <li class="nav-item">
              <button type="button" class="btn btn-outline-dark pet-data"> Reportar mascota </button>
            </li>
          

            <li class="nav-item">
              <button type="button" class="btn btn-outline-info log-in"> Iniciar sesión </button>
            </li>

          
          </ul>
        </div>
      </div>
    </nav>
    `;

    this.addListeners();
  }
}

customElements.define("x-header-comp", HeaderComp);
