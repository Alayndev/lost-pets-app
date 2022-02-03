const cloudinary = require("cloudinary").v2;

// Env vars
cloudinary.config({
  cloud_name: "daxkw95yw",
  api_key: "797863183635941",
  api_secret: "1Dj1yGfH0PIyd3cnAJwhgH9QIKY",
});

// Recibe dataURL - devuelve URL
export async function uploadPictureCloudinary(dataURL: string) {
  try {
    const pictureURL = await cloudinary.uploader.upload(dataURL, {
      resource_type: "image",
      discard_original_filename: true,
      width: 1000,
    });

    return pictureURL.secure_url; // Cloudinary me da la URL con la imagen (Cloudinary convierte el string dataURL creado por Dropzone en una URL con la imagen, URl que guardamos en la DB ). cloudinary.uploader.upload(imagen en formato dataURL/64, { config... })
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export { cloudinary };
