import { Router } from "@vaadin/router";
import { state } from "../../state";
import Swal from "sweetalert2";

// ACA
// Problema: Al ingresar una contraseña erronea NO le informamos nada al usuario. Informarle, solo llega un 400 Bad request en la consola de la dev tools
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
      </form>
    </div>
    `;
    const form: any = this.querySelector(".login");
    form
      .querySelector("x-button")
      .addEventListener("buttonClicked", async (e) => {
        const email = form.email.value;
        const { exist } = await state.checkMail(email); // Hecho

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
      </form>
    </div>

    `;

    const form: any = this.querySelector(".login");
    form
      .querySelector("x-button")
      .addEventListener("buttonClicked", async (e: any) => {
        e.preventDefault();
        const userData = { email, password: form.password.value };
        // ACA - Hecho - /auth - /auth/token
        // ACA - AGREGAR IF
        await state.createOrFindUser(userData).then((res) => {
          Swal.fire({
            icon: "success",
            title: "Bienvenidx!",
          });
          
          Router.go("/user-data");
        });
      });
  }
}
customElements.define("x-login-page", Login);
