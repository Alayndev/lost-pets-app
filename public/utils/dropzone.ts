import { Dropzone } from "dropzone";
import { state } from "../state";

export async function dropzonedImg(pic, buttonImg) {
  let dataURL;

  const myDropzone = new Dropzone(pic, {
    url: "/falsa",
    autoProcessQueue: false,

    clickable: true,
    clickeableElements: buttonImg,

    thumbnail: function (file, dataUrl) {
      pic.setAttribute("src", dataUrl); // Le pongo la dataURl en el atributo src de la imagen que le mando a dropzonedImg() desde pet-data.ts
    },

    init: function () {
      buttonImg.addEventListener("buttonClicked", (e) => {
        this.processQueue();
      });
    },
  });

  myDropzone.on("thumbnail", function (file) {
    dataURL = file.dataURL;
    state.setDataURL(dataURL);
    console.log(dataURL, "dataURL para Cloudinary endpoint POST /users/pets");
  });

  return dataURL;
}
