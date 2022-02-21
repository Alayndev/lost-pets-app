import { Router } from "@vaadin/router";
import Swal from "sweetalert2";

import "./index.css";

import { state } from "../../state";

class HomePage extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  addListenerGeoloc() {
    const cs = state.getState();
    this.querySelector("x-button").addEventListener("buttonClicked", (e) => {
      navigator.geolocation.getCurrentPosition(async (geo) => {
        const { latitude, longitude } = geo.coords;
        cs._geoloc = { lat: latitude, lng: longitude };
        state.setState(cs);
        const pets = await (await state.getPetsAround()).json();
        console.log(pets);

        this.render(pets);
      });
    });
  }

  addListenerPetReport() {
    const cs = state.getState();

    const pets = document.querySelectorAll("x-pet-card");

    for (const pet of pets) {
      pet.addEventListener("report-pet", (e) => {
        if (cs.user?.id) {
          this.reportPet({
            id: pet.getAttribute("petId"),
            name: pet.getAttribute("petName"),
          });
        } else {
          Router.go("/login");
        }
      });

      pet.addEventListener("info-pet", (e) => {
        if (cs.user?.id) {
          state.setPetData({ id: Number(pet.getAttribute("petId")) });
          Router.go("/pet-data");
        } else {
          Router.go("/login");
        }
      });
    }
  }

  reportPet(pet) {
    // MODAL - APARECE AL FINAL - HACERLO CON MODAL BOOTSTRAP UNA VEZ QUE FUNCIONE
    console.log(pet, "estas logeado");
    const div = document.createElement("div");
    div.innerHTML = `

    <div class="exit button is-danger">X</div>
    <x-text type="title" style="bold">Reportar info de ${pet.name}</x-text>
    <form class="report-pet__form">
      <label class="report-pet__label">
        <span>TU NOMBRE</span>
        <input  class="report-pet__input input is-large" type="text" name="name">
      </label>
      <label class="report-pet__label">
        <span>TU TELEFONO</span>
        <input  class="report-pet__input input is-large" type="phone" name="tel">
      </label>
      <label class="report-pet__label">
        <span>¿DÓNDE LO VISTE?</span>
        <textarea class="report-pet__input textarea" name="report"></textarea>
      </label>
      <x-button type="primary">Enviar reporte</x-button>
    </form>
    `;
    div.className = "report-pet";
    div.classList.add("report-pet");
    div.classList.add("has-background-grey-darker");
    div.classList.add("has-text-light");
    this.appendChild(div);
    const form: any = this.querySelector(".report-pet__form");

    div.querySelector(".exit").addEventListener("click", () => {
      div.remove();
    });

    form
      .querySelector("x-button")
      .addEventListener("buttonClicked", async (e: any) => {
        const report = {
          petId: pet.id,
          petName: pet.name,
          name: form.name.value,
          tel: form.tel.value,
          report: form.report.value,
        };
        try {
          const reportSended = await state.sendReport(report); // ACA
          if (reportSended) {
            Swal.fire({
              icon: "success",
              text: `${report.name}, muchas gracias por reportar información de ${report.petName}. Se le envió un mail a quien lo busca para que sepa lo que nos contaste.`,
            });
            div.remove();
          }
        } catch (error) {
          console.error(error);
        }
      });
  }

  render(pets?) {
    if (!pets) {
      this.innerHTML = `
      <x-header-comp> </x-header-comp>

      <div>
      <x-navbar></x-navbar>
      <div class="welcome">
      <x-text class="title" type="title" style="bold">Mascotas perdidas cerca tuyo</x-text>
      <x-text type="subtitle" style="thin">Para ver las mascotas reportadas cerca tuyo necesitamos permiso para conocer tu ubicación.</x-text>
      <x-button type="primary">Dar mi ubicación</x-button>
      </div>
    </div>
    `;
      this.addListenerGeoloc();
    }
    if (pets) {
      const hits = pets.petsAround.hits;

      const petsString = hits
        .map((pet) => {
          return `<x-pet-card img=${pet.pictureURL} petId=${pet.objectID} petName="${pet.fullName}" description="${pet.description}" > ${pet.fullName} </x-pet-card>`;
        })
        .join("");

      this.innerHTML = `
      <x-header-comp> </x-header-comp>

      <div>
      <x-navbar></x-navbar>
      <div class="welcome">
      <x-text type="title" style="bold">Mascotas perdidas cerca tuyo: ${pets.petsAround.nbHits}</x-text>
      <div class="pets-container">
        ${petsString}
      </div>
      </div>
    </div>
    `;
      this.addListenerPetReport();
    }
  }
}

customElements.define("x-home-page", HomePage);
