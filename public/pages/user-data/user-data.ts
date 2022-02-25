import { Router } from "@vaadin/router";
import { state } from "../../state";
import Swal from "sweetalert2";

// PROBLEMA: LINEA 63 Y 90
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

    // Si tengo token, es decir estoy logeado, puedo cambiar mis datos. SOLAMENTE estoy actualizando el nombre, NO estoy cambiando contraseña
    if (userData.token) {
      loginForm.name.value = userData.fullName;

      submit.addEventListener("buttonClicked", async (e: any) => {
        const data = new FormData(loginForm);
        const value = Object.fromEntries(data.entries());
        console.log(value, "value a ver");

        const res = await state.updateUser(value); // ACA - ACTUALIZAR AUTH - Puedo actualizar email o contraseña en el flujo del Front? O necesito algortimo de abajo para que verifique que ambas son correcta y, además, en el Back actualizar la contraseña en Table Auth PATCH /users/profile
        console.log(res, "json");

        // REPLICAR ESTE IF PARA TODA LA PAGE - Y PARA TODAS LAS DEMÁS TMB
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
            const res = await state.createOrFindUser({
              fullName,
              email,
              password,
            });

            // ACA - AGREGAR IF
            // if(res) {

            // }
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
