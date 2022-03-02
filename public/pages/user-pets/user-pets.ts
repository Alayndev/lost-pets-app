import { Router } from "@vaadin/router";
import { state } from "../../state";
import * as map from "lodash/map";

class UserPets extends HTMLElement {
  async connectedCallback() {
    const { token } = state.getState().user;

    if (token) {
      console.log("user con token");

      const { userPets } = await state.getMyPets();

      if (userPets) {
        userPets.length > 0 ? this.render(userPets) : this.render();
      } else {
        this.render();
      }
    } else {
      Router.go("/login");
    }
  }

  addListener(container?) {
    console.log(container, "container");

    map(container, (pet) => {
      pet.addEventListener("click", async (e) => {
        console.log(pet, "escucho report-pet para editar e ir a /pet-data");

        const id = pet.getAttribute("petId");
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
      
      <h1 class="title">Mis mascotas reportadas</h1>
      <div class="sub-container">
        ${
          !pets
            ? `<h1 class="title">AUN NO REPORTASTE MASCOTAS PERDIDAS</h1>`
            : map(pets, (pet) => {
                return `<x-pet-card img=${pet.pictureURL} petId=${pet.id} petName="${pet.fullName}" description="${pet.description}" loc="${pet.loc}" > ${pet.fullName} </x-pet-card>
                
                <x-button class="report-pet" type="btn btn-outline-success" petId=${pet.id} > Editar información sobre ${pet.fullName} </x-button>
                `;
              }).join("")
        }
      </div>
      </div>
    `
      : `
      <x-header-comp> </x-header-comp>
      <div class="main-container">
       <h1 class="title">Mis mascotas reportadas</h1>
       <p class="subtitle">Aun no reportaste mascotas perdidas</p>
  
      </div>

    `;

    this.addListener(this.querySelectorAll(".report-pet"));
  }
}
customElements.define("x-user-pets-page", UserPets);
