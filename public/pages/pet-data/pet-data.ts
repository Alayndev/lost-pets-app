import { Router } from "@vaadin/router";
import { state } from "../../state";
import { mapping } from "../../utils/mapbox";
import { dropzonedImg } from "../../utils/dropzone";
import Swal from "sweetalert2";
const missingImg = require("url:../../images/no-img.png");

// ACA - LINEA 84
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

      <form class="pet-data card">
        <h1 class="title"> ${type} mascota perdida</h1>

        <div class="sub-container">
        
                <label class="label">
                <span>NOMBRE</span>
                <input type="text" name="name" class="is-success" required />
                </label>
        
                <label class="label" id="img">
                  <img class="imgUrlPet pet-card__img" name="imgURL" src=${missingImg} crossorigin="anonymous">
                  <br />
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
            pet ? "finded" : "finded"
          }>${pet ? "Reportar como encontrado" : "Cancelar"}</x-button>
        </label>



      </form>
    </div>
    `;
    const pic = this.querySelector(".imgUrlPet");
    const petDataForm: any = this.querySelector(".pet-data");
    const buttonImg = this.querySelector("#buttonImg");

    // ADEMÁS para editar una pet NO aparece el mapa
    // ACA - HAY UN PROBLEMA - ANTES FUNCIONABA BIEN, LO UNICO QUE CAMBIE FUE LINEA 12 A 15, ESE IF
    if (pet) {
      //inserta los datos de la mascota en el formulario
      //petDataForm.name.value = pet.fullName;
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
        const petDataForm: any = this.querySelector(".pet-data");

        if (type == "Editar") {
          // Edita la mascota
          // ACA - Hecho
          const res = await state.editPet({
            id: pet.id,
            fullName: petDataForm.name.value,
            dataURL: petDataForm.imgURL.getAttribute("src"),
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
            dataURL: petDataForm.imgURL.getAttribute("src"),
          });

          console.log(res, "res createPet() en pet-data page 115");

          if (res.petCreated === false) {
            Swal.fire({
              title: "This pet report already exists",
            });
          } else {
            Swal.fire({ icon: "success" });
          }
        }

        console.log();
      }
    );

    this.querySelector(".cancel")?.addEventListener("buttonClicked", (e) => {
      //limpiar formulario
      const petDataForm: any = this.querySelector(".pet-data");
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

        const petDataForm: any = this.querySelector(".pet-data");
        state.data.petData = {};
        petDataForm.reset();
      }
    );
  }
}
customElements.define("x-pet-data-page", PetData);
