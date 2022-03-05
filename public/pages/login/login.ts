import { Router } from "@vaadin/router";
import { state } from "../../state";
import Swal from "sweetalert2";
import { debuglog } from "util";

class Login extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
    <x-header-comp> </x-header-comp>

    <div class="main-container">
      <form class="login">
        <h1>Ingresar</h1>
        <label>
        <span>EMAIL</span>
        <input type="email" name="email" required >
        </label>
        <x-button type="btn btn-outline-primary"> Siguiente </x-button>
        
        <span class="loader-container">  </span>

      </form>
    </div>
    `;

    const form: any = this.querySelector(".login");
    form
      .querySelector("x-button")
      .addEventListener("buttonClicked", async (e) => {
        const email = form.email.value;
        const { exist } = await state.checkMail(email);

        const loaderCont = this.querySelector(".loader-container");
        loaderCont.setAttribute("style", "display: flex");
        loaderCont.innerHTML = `
          <x-loader-comp> </x-loader-comp>
        `;

        try {
          if (exist.exist == true) {
            this.renderPass(email);
          }
          if (exist.exist == false) {
            state.saveMail(email);
            Router.go("/user-data");
          }
        } catch (error) {
          console.error(error);
        }
      });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value;
      const { exist } = await state.checkMail(email);

      const loaderCont = this.querySelector(".loader-container");
      loaderCont.setAttribute("style", "display: flex");
      loaderCont.innerHTML = `
        <x-loader-comp> </x-loader-comp>
      `;

      try {
        if (exist.exist == true) {
          this.renderPass(email);
        }
        if (exist.exist == false) {
          state.saveMail(email);
          Router.go("/user-data");
        }
      } catch (error) {
        console.error(error);
      }
    });
  }

  renderPass(email) {
    console.log(email);
    this.innerHTML = `
    <x-header-comp> </x-header-comp>

    <div class="main-container">  
      <form class="login">
        <h1>Ingresar</h1>
        <label>
        <span>CONTRASEÑA</span>
        <input type="password" name="password" required>
        </label>
        <x-button type="btn btn-outline-primary"> Ingresar </x-button>

        <span class="loader-container">  </span>


      </form>
    </div>

    `;

    const form: any = this.querySelector(".login");
    form
      .querySelector("x-button")
      .addEventListener("buttonClicked", async (e: any) => {
        e.preventDefault();
        const userData = { email, password: form.password.value };

        const loaderCont = this.querySelector(".loader-container");
        loaderCont.setAttribute("style", "display: flex");
        loaderCont.innerHTML = `
        <x-loader-comp> </x-loader-comp>
        `;
        
        const res = await state.createOrFindUser(userData);
        console.log("res en login", res);
        
        if (res === false) {
          loaderCont.setAttribute("style", "display: none");
          Swal.fire({
            text: `La contraseña ingresada NO es correcta.`,
          });
        } else {
          Swal.fire({
            icon: "success",
            title: "Bienvenidx!",
          });
          Router.go("/user-data");
        }
      });

    form.addEventListener("submit", async (e: any) => {
      e.preventDefault();
      const userData = { email, password: form.password.value };

      const loaderCont = this.querySelector(".loader-container");
      loaderCont.setAttribute("style", "display: flex");
      loaderCont.innerHTML = `
        <x-loader-comp> </x-loader-comp>
      `;

      const res = await state.createOrFindUser(userData);
      console.log("res en login submit", res);

      if (res === false) {
        Swal.fire({
          text: `La contraseña ingresada NO es correcta.`,
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Bienvenidx!",
        });
        Router.go("/user-data");
      }
    });
  }
}
customElements.define("x-login-page", Login);
