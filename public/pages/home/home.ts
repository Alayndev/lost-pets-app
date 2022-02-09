import { Router } from "@vaadin/router";

import "./index.css";

import { state } from "../../state";

class HomePage extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  addListeners() {
    const cs = state.getState();

    const myLoc = this.querySelector(".btn-primary");
    myLoc.addEventListener("click", (e) => {
      navigator.geolocation.getCurrentPosition(async (geo) => {
        // CREAR PETS CON POSTMAN CERCA DE MI LAT Y LNG, LUEGO HACER ESTA LLAMADA AL ENDPOINT

        const { latitude, longitude } = geo.coords;
        console.log(geo.coords);

        cs._geoloc = { lat: latitude, lng: longitude };

        state.setState(cs);

        const pets = await (await state.getPetsAround()).json();
        console.log(pets);

        if (pets) {
          const homeContent = this.querySelector(".content-page");
          homeContent.setAttribute("style", "display:none");

          const showPets = this.querySelector(".show-found-pets");
          showPets.setAttribute("style", "display:flex");

          // Poner en x-card-comp la data de las pets encontradas, quizá haya que modificar lo que guardamos en Algolia y guardar tmb la pictureURL para poder mostrarla aquí. Seguramente. POST /users/pets -- createPetAlgolia() --> pictureURL: pet.get("pictureURL"), -- description: pet.get("description"),
          showPets.innerHTML = `

          
          <h2 class="found-pets"> Mascotas encontradas cerca tuyo: ${pets.petsAround.nbHits} </h2>
          
          <x-card-comp> </x-card-comp>
          
          `;
        }

        this.render(pets);
      });
    });
  }

  render(pets?) {
    if (pets) {
    } else {
      this.innerHTML = `
          <x-header-comp></x-header-comp>
  
          <div class="show-found-pets">  </div>
          
          <div class="content-page">
            <h1 class="content-page__title"> Mascotas pérdidas cerca tuyo </h1>
  
            <p class="content-page__text">Para ver las mascotas reportadas cerca tuyo necesitamos permiso para conocer tu ubicación.</p>
            <button type="button" class="btn btn-primary"> Dar mi ubicación </button>
          </div>
  
    
      `;

      this.addListeners();
    }
  }
}

customElements.define("x-home-page", HomePage);
