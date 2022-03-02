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
    const type = userData.token
      ? "Editá tu información personal. No es necesario que edites tu información personal para poder reportar, ya podés hacerlo."
      : "Guardá tu información personal, una vez resgitrado podrás reportar.";

    this.innerHTML = `
      <x-header-comp> </x-header-comp>

      <form class="login main-container">
        <h1>Mis datos</h1>

        <p class="subtitle"> ${type} </p>

        <div class="sub-container">
        
          <label>
          <div>NOMBRE</div>
          <input type="text" name="name" required />
          </label>


          <label>
          <div>CONTRASEÑA</div>
          <input type="password" name="password" class="password" required />
          </label>

          <label>
          <div>REPETIR CONTRASEÑA</div>
          <input type="password" name="repeatedPassword" class="password" required />
          </label>
  
        </div>

        <x-button type="btn btn-outline-primary"> Guardar </x-button>
      </form>
    `;

    const submit = this.querySelector("x-button");
    const loginForm: any = this.querySelector(".login");

    // Si tengo token, es decir estoy logeado, puedo cambiar mis datos.
    if (userData.token) {
      loginForm.name.value = userData.fullName;

      submit.addEventListener("buttonClicked", async (e: any) => {
        const data = new FormData(loginForm);
        const value = Object.fromEntries(data.entries());
        console.log(value, "value a ver");

        const password = loginForm.password.value;
        const repeatedPassword = loginForm.repeatedPassword.value;

        if (password === repeatedPassword) {
          const res = await state.updateUser(value); 
          console.log(res, "json");

          if (!res.error) {
            Swal.fire({
              icon: "success",
            });
          }
        } else {
          Swal.fire(
            "Verificar que las contraseñas ingresadas coincidan."
          );
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
            const res = await state.createOrFindUser({
              fullName,
              email,
              password,
            });

            console.log(res, "res createOrFindUser() en user-data.ts - 92");

            if (res === true) {
              Swal.fire({
                icon: "success",
                title: "Bienvenidx!",
              });
            } else {
              Swal.fire({
                title:
                  "Ha ocurrido un error al crear su usuario. Por favor intente nuevamente completando todos los campos.",
              });
            }
          } catch (err) {
            console.error(err);
          }
        } else {
          Swal.fire(
            "Verificar que las contraseñas ingresadas coincidan."
          );
        }
      });
    }
  }
}
customElements.define("x-user-data-page", UserData);
