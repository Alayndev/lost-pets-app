import { Router } from "@vaadin/router";
import { state } from "../../state";

const footprint = require("url:../../images/footprint.png");

class HeaderComp extends HTMLElement {
  connectedCallback() {
    const { user } = state.getState();

    if (user) {
      this.render(user);
    } else {
      this.render();
    }
  }

  addListeners(userEmail?) {
    const logInButton = this.querySelector(".log-in");
    const userState = logInButton.getAttribute("userState");

    if (userState == userEmail) {
      const logOutButton: any = this.querySelector(".log-out");
      logOutButton.style.display = "inline";

      logOutButton.addEventListener("click", () => {
        state.logOut();
        logInButton.textContent = "Iniciar Sesión";
        logOutButton.style.display = "none";
        Router.go("/");
      });
    } else {
      logInButton.addEventListener("click", () => {
        Router.go("/login");
      });
    }

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

  render(user?) {
    const textContent = user.email ? user.email : "Iniciar Sesión";

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
              <button type="button" class="btn btn-primary me btn-header"> Mis datos </button>
            </li>

            <li class="nav-item">
              <button type="button" class="btn btn-primary my-pets btn-header">  Mis mascotas reportadas </button>
            </li>

            <li class="nav-item">
              <button type="button" class="btn btn-primary pet-data btn-header"> Reportar mascota </button>
            </li>
          

            <li class="nav-item">
              <button type="button" class="btn btn-outline-success log-in btn-header" userState=${textContent}> ${textContent} </button>
            </li>

            <li class="nav-item">
              <button type="button" class="btn btn-outline-danger log-out btn-header" userState=${textContent}> Cerrar sesión </button>
            </li>


          
          </ul>
        </div>
      </div>
    </nav>
    `;

    this.addListeners(user.email);
  }
}

customElements.define("x-header-comp", HeaderComp);
