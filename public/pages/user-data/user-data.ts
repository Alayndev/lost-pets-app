import { Router } from "@vaadin/router";
import { state } from "../../state";
import Swal from "sweetalert2";

class UserData extends HTMLElement {
  connectedCallback() {
    const cs = state.getState();
    const { email } = state.getState().user;
    if (email) {
      this.render(cs.user);
    } else {
      Router.go("/login");
    }
  }
  render(userData?) {
    this.innerHTML = `
      <div class="my-data">
      <x-navbar></x-navbar>
      <form class="login">
        <x-text type="title" style="bold">Mis datos</x-text>

        <label>
        <span>NOMBRE</span>
        <input type="text" name="name" required />
        </label>


        <label>
        <span>CONTRASEÑA</span>
        <input type="password" name="password" class="password" />
        </label>

        <label>
        <span>REPETIR CONTRASEÑA</span>
        <input type="password" name="repeatedPassword" class="password" />
        </label>

        <x-button type="primary">Guardar</x-button>
      </form>
    </div>
    `;
    const submit = this.querySelector("x-button");
    const loginForm: any = this.querySelector(".login");

    // Si tengo token, es decir estoy logeado, puedo cambiar mis datos. SOLAMENTE estoy actualizando el nombre, NO estoy cambiando contraseña
    if (userData.token) {
      loginForm.name.value = userData.name;

      submit.addEventListener("buttonClicked", async (e: any) => {
        const data = new FormData(loginForm);
        const value = Object.fromEntries(data.entries());
        console.log(value, "value a ver");

        const res = await state.updateUser(value); // ACA - Hecho
        console.log(res, "json");

        if (!res.error) {
          Swal.fire({
            icon: "success",
          });
        }
      });
    } else {
      // Si NO tengo token, es decir NO estoy logeado, 
      submit.addEventListener("buttonClicked", async (e: any) => {
        const fullName = loginForm.name.value;
        const email = state.getState().user.email;
        const password = loginForm.password.value;
        const repeatedPassword = loginForm.repeatedPassword.value;

        if (password === repeatedPassword) {
          try {
            // ACA - Hecho
            await state.createOrFindUser({
              fullName,
              email,
              password,
            });

            //await state.updateUser({ fullName }); // ACA - ¿Para que el update? No lo necesito xq seteo el fullName con createOrFindUser()

            Swal.fire({
              icon: "success",
              title: "Bienvenidx!",
            });
          } catch (err) {
            console.error(err);
          }
        } else {
          Swal.fire("Verificar las contraseñas. No son iguales.");
        }
      });
    }
  }
}
customElements.define("x-user-data-page", UserData);
