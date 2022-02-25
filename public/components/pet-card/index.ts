import "./index.css";

import { Router } from "@vaadin/router";

import { state } from "../../state";
import Swal from "sweetalert2";

class CardComp extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  addStyle() {
    const style = document.createElement("style");
    style.textContent = `
    .pet-card__img{
      width: 335px;
      height: 335px;
      object-fit: cover;
    }
    .pet-card{
      max-width: 335px;
    }
    `;
    this.appendChild(style);
  }
  addListener(id) {
    // Se podrá pasarle el modal al activar el custom event?
    const modal = document.createElement("div");
    modal.innerHTML = `
      <p> Soy un modal </p>
    `;

    this.querySelector(".report").addEventListener("click", (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent("report-pet", { detail: { id } }));
    });
  }
  render() {
    const name = this.textContent;
    const img = this.getAttribute("img");
    const id = this.getAttribute("petId");
    const description = this.getAttribute("description");

    this.innerHTML = `
    <div class="pet-card card">
      <img class="pet-card__img card-image" src=${img} crossorigin="anonymous">

      <div class="pet-card__body card-content">
        <p>${name}</p>

        <br />

        <p type="subtitle" style="bold"> Descripción: ${description}</p>
        <ul class="pet-card__links">
          <a class="pet-card__link report">REPORTAR INFORMACIÓN</a>
        </ul>

<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
  Launch demo modal
</button>

<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
      <h2>Reportar info de ${name}</h2>
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
        <x-button type="primary">Enviar reporte</x-button>
      </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
    `;
    const form: any = this.querySelector(".report-pet__form");

    form
      .querySelector("x-button")
      .addEventListener("buttonClicked", async (e: any) => {
        const report = {
          petId: id,
          petName: name,
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
          }
        } catch (error) {
          console.error(error);
        }
      });

    this.addStyle();
    this.addListener(id);
  }
}

customElements.define("x-pet-card", CardComp);
