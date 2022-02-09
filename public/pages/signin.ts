import { Router } from "@vaadin/router";

class SignInPage extends HTMLElement {
  addListeners() {
    const newGameButton = this.querySelector(".singin");
    console.log(newGameButton);

    newGameButton.addEventListener("click", () => {
      Router.go("/signin");
    });
    // const enterGameButton = this.querySelector(".entergame-button");
    // enterGameButton.addEventListener("click", () => {
    //   Router.go("/entergame");
    // });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
        <x-header-comp></x-header-comp>
        <h1> Soy la page SIGN IN </h1>
    `;

    this.addListeners();
  }
}

customElements.define("x-signin-page", SignInPage);
