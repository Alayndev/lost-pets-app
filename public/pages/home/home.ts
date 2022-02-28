import { Router } from "@vaadin/router";
import Swal from "sweetalert2";

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
    console.log(pet, "estas logeado");

    const div = document.createElement("div");
    div.innerHTML = `

    <div class="exit button is-danger">X</div>
    <h2 class="title">Reportar info de ${pet.name}</h2>
    <form class="report-pet__form">
      <label class="report-pet__label">
        <span>TU NOMBRE</span>
        <input  class="report-pet__input input is-large" type="text" name="name" required>
      </label>
      <label class="report-pet__label">
        <span>TU TELEFONO</span>
        <input  class="report-pet__input input is-large" type="phone" name="tel" required>
      </label>
      <label class="report-pet__label">
        <span>¿DÓNDE LO VISTE?</span>
        <textarea class="report-pet__input textarea" name="report" required></textarea>
      </label>
      <x-button type="btn btn-outline-success">Enviar reporte</x-button>
    </form>
    `;
    div.className = "report-this-pet";
    div.classList.add("report-this-pet");
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
        console.log("escucha el custom event"); // Si no lo escucha, ver como es en otras pages--> user-pets.ts --> addListener(container)

        const report = {
          petId: pet.id,
          petName: pet.name,
          fullName: form.name.value,
          phoneNumber: form.tel.value,
          report: form.report.value,
        };

        try {
          const reportSent = await state.sendReport(report); // ACA - Hecho
          console.log(reportSent);

          if (reportSent.error) {
            Swal.fire({
              text: `${reportSent.error}. ${report.fullName}, agredecemos la información que intenta brindar acerca de ${report.petName}, pero la misma ya ha sido reportada.`,
            });
          } else {
            Swal.fire({
              icon: "success",
              text: `${report.fullName}, muchas gracias por reportar información acerca de ${report.petName}. Se le envió un mail al dueñx con la información brindada, quizá sea contactado al teléfono brindado o puede contactar al dueñx vía email. Email del dueñx: ${reportSent.petAndOwner.user.email}.`,
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

    <div class="main-container">
      <div class="main-container">
        <h1 class="title"> Mascotas perdidas cerca tuyo </h1>
        <p class="text"> Para ver las mascotas reportadas cerca tuyo necesitamos permiso para conocer tu ubicación. </p>
        
        <x-button type="btn btn-outline-primary" >Dar mi ubicación</x-button>
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
      <div class="welcome main-container">
      <h1>Mascotas perdidas cerca tuyo: ${pets.petsAround.nbHits}</h1>
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
