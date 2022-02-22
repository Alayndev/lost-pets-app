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
      <div>
     <x-header-comp> </x-header-comp>
      <form class="login">
        <x-text type="title" style="bold">Ingresar</x-text>
        <label>
        <span>EMAIL</span>
        <input type="email" name="email">
        </label>
        <x-button type="primary">Siguiente</x-button>
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
    <div>
    <x-header-comp> </x-header-comp>
    <form class="login">
      <x-text type="title" style="bold">Ingresar</x-text>
      <label>
      <span>CONTRASEÑA</span>
      <input type="password" name="password">
      </label>
      <x-button type="primary">Ingresar</x-button>
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
