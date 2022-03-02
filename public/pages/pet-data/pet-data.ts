import { Router } from "@vaadin/router";
import { state } from "../../state";
import { mapping } from "../../utils/mapbox";
import { dropzonedImg } from "../../utils/dropzone";
import Swal from "sweetalert2";
const missingImg = require("url:../../images/no-img.png");

// LISTO
class PetData extends HTMLElement {
  async connectedCallback() {
    const { token } = state.getState().user;

    if (!token) {
      return Router.go("/login");
    }

    const { petData } = state.getState();
    console.log(petData, "petData antes del if");

    if (petData.id) {
      console.log("entro al if");

      await state.getPetData(); // ACA - Hecho

      const { petData } = state.getState(); // Prefiero usar lo que guardamos en el state que para eso está. Usamos la data del state que cargamos en el state method, allí cargamos la data que traemos del endpoint en el state

      this.render(petData);
    } else {
      this.render();
    }
  }

  // Page para Editar o Reportar Pet - Ver Figma
  render(pet?) {
    console.log(pet, "render");

    const type = pet ? "Editar" : "Reportar";

    this.innerHTML = `
      <div>
      <x-header-comp> </x-header-comp>

      <form class="pet-data form card">
        <h1 class="title"> ${type} mascota perdida</h1>

        <div class="sub-container">
        
                <label class="label">
                <span>NOMBRE</span>
                <input type="text" name="name" class="is-success" required />
                </label>
                
                <label class="label" id="img">
                  <img class="imgUrlPet pet-card__img" name="imgURL" src=${missingImg} crossorigin="anonymous">
                  <br />
                  <p class="subtitle"> Imagen hasta 60kB. Haga click arriba para seleccionar la imagen. </p>
                  <p class="subtitle"> Si su imagen es más pesada, asegúrese de achicarla, de otro modo el reporte NO se realizará. Hágalo en segundos con <a href="https://www.achicarimagenes.com.ar/" target="_blank"> esta web </a></p>    
                  <x-button type="btn btn-outline-success buttonCentered" id="buttonImg"> Agregar/Modificar foto</x-button>
                </label>
  
        </div>

        <label class="label sub-container">
              <span>UBICACION</span>
              <p class="subtitle">BUSCÁ UN PUNTO DE REFERENCIA PARA REPORTAR A TU MASCOTA. PUEDE SER UNA DIRECCIÓN, UN BARRIO O UNA CIUDAD</p>
              <div id="map" style="width: 335px; height: 335px"></div>
              <input type="text" name="geoloc" class="search-geoloc" required>

              
              <x-button class="submit" type="btn btn-outline-success buttonCentered">${type}</x-button>
              
              <x-button type="btn btn-outline-danger buttonCentered" class=${
                pet ? "finded" : "cancel"
              }>${pet ? "Reportar como encontrado" : "Cancelar"}</x-button>
        </label>



      </form>
    </div>
    `;
    const pic = this.querySelector(".imgUrlPet");
    const petDataForm: any = this.querySelector(".form");
    const buttonImg = this.querySelector("#buttonImg");

    if (pet) {
      petDataForm.name.value = pet.fullName;
      pic.setAttribute("src", pet.pictureURL);
      petDataForm.geoloc.value = `${pet.lat},${pet.lng}`;
    }

    // ACA - Hecho
    //inicializa el mapa
    pet ? mapping([pet.lat, pet.lng]) : mapping();

    // ACA - Hecho
    //inicializa dropzone
    dropzonedImg(pic, buttonImg);

    this.querySelector(".submit").addEventListener(
      "buttonClicked",
      async (e) => {
        const petDataForm: any = this.querySelector(".form");

        if (type == "Editar") {
          // Edita la mascota
          // ACA - Hecho
          const res = await state.editPet({
            id: pet.id,
            fullName: petDataForm.name.value,
          });

          console.log(res, "res editPet() en pet-data page 96");

          if (res.algoliaPetUpdated.error || res.petUpdated.error) {
            Swal.fire({
              title: res.petUpdated.error || res.algoliaPetUpdated.error,
            });
          } else {
            Swal.fire({ icon: "success" });
          }
        }

        if (type == "Reportar") {
          // Crea la mascota
          // ACA - Hecho
          const res = await state.createPet({
            fullName: petDataForm.name.value,
          });

          console.log(res, "res createPet() en pet-data page 134");

          if (res.petCreated === false) {
            Swal.fire({
              title:
                "Este reporte ya existe. Asegúrese de completar los campos correctamente.",
            });
          } else {
            Swal.fire({
              icon: "success",
              title:
                "Su mascota ha sido reportada correctamente. Este atento a su casilla de correo, inclusive al spam, ya que por allí le llegarán los reportes de su mascota.",
            });
          }
        }
      }
    );

    this.querySelector(".cancel")?.addEventListener("buttonClicked", (e) => {
      //limpiar formulario
      const petDataForm: any = this.querySelector(".form");
      petDataForm.reset();
    });

    this.querySelector(".finded")?.addEventListener(
      "buttonClicked",
      async (e) => {
        //enviar al servidor que se encontró a la pet
        // ACA - Hecho
        const res = await state.petFound(pet.id);

        console.log(res, "res findedPet() en pet-data page 140");

        if (res.algoliaPetDeleted.taskID && res.petdeleted.length === 1) {
          Swal.fire({
            icon: "success",
            title: "Usted ha encontrado a su mascota! Felicitaciones!",
          });
        } else {
          Swal.fire({
            title: "Ha ocurrido un error, intente nuevamente!",
          });
        }

        const petDataForm: any = this.querySelector(".form");
        state.data.petData = {};
        petDataForm.reset();
      }
    );
  }
}
customElements.define("x-pet-data-page", PetData);
