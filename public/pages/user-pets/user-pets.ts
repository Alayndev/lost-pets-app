import { Router } from "@vaadin/router";
import { state } from "../../state";
import * as map from "lodash/map";

// PONER LOADER XQ TARDA, MISMA LÓGICA QUE EN dwf-m6
class UserPets extends HTMLElement {
  async connectedCallback() {
    const { token } = state.getState().user;

    if (token) {
      console.log("hola, tengo token");

      const { userPets } = await state.getMyPets(); // ACA - Hecho

      if (userPets) {
        userPets.length > 0 ? this.render(userPets) : this.render();
      } else {
        this.render();
      }
    } else {
      Router.go("/login");
    }
  }

  // ACA, - Hecho
  addListener(container?) {
    console.log(container, "container");

    map(container, (pet) => {
      pet.addEventListener("report-pet", async (e) => {
        const { id } = e.detail;
        state.setPetData({ id: parseInt(id) });
        Router.go("/pet-data");
      });
    });
  }

  render(pets?) {
    console.log(pets, "render");

    this.innerHTML = pets
      ? `
      
      <div>
      <x-header-comp> </x-header-comp>

      <x-text type="title" style="bold">Mis mascotas reportadas</x-text>
      <div class="pets-container">
        ${
          !pets
            ? `<x-text type="body">AUN NO REPORTASTE MASCOTAS PERDIDAS</x-text>`
            : map(pets, (pet) => {
                return `<x-pet-card img=${pet.pictureURL} petId=${pet.id} petName="${pet.fullName}" description="${pet.description}" > ${pet.fullName} </x-pet-card>`;
              }).join("")
        }
      </div>
      </div>
    `
      : `
    <div>
      <x-navbar></x-navbar>
      <x-text type="title" style="bold">Mis mascotas reportadas</x-text>
      <x-text type="subtitle">Aun no reportaste mascotas perdidas</x-text>
    </div>
    `;

    this.addListener(this.querySelectorAll("x-pet-card"));
  }
}
customElements.define("x-user-pets-page", UserPets);
