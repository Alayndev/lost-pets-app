import { User, Product, Auth } from "../models"; // Controller invocan a capa Model

import { cloudinary } from "../lib/cloudinary";

export async function createUser(userId, userData) {
  const { fullName, bio, pictureURL } = userData;

  // 47 -- upload(imagen en formato dataURL/64, { config... })
  if (pictureURL) {
    try {
      const image = await cloudinary.uploader.upload(pictureURL, {
        resource_type: "image", // El tipo, ya que tmb acepta videos

        discard_original_filename: true, // Que le genere un nombre nuevo

        width: 1000, // Que le setee/limite el ancho a 1000
      });

      const updateDataComplete = {
        fullName,
        bio,
        pictureURL: image.secure_url, // Cloudinary me da la URL con la imagen (Cloudinary convierte el string dataURL creado por Dropzone en una URL con la imagen, URl que guardamos en la DB )
      };

      // 50 - Por qué no mejor findOrCreate?
      const userUpdated = await User.update(updateDataComplete, {
        where: {
          id: userId,
        },
      });

      return { userUpdated };
    } catch (err) {
      throw (
        err +
        " Problemas con Cloudinary o Sequelize User en users-controller.ts - createUser()"
      );
    }
  } else {
    console.error("No hay pictureURL en users-controller.ts - createUser()");
  }
}

// 1hr. 10m.
export async function getUserProfile(userId) {
  if (!userId) {
    throw new Error(
      " No hay userId en users-controller.ts - getUserProfile() "
    );
  }

  try {
    const userProfile = await User.findByPk(userId);

    return userProfile;
  } catch (err) {
    console.error({ err });
  }
}

// Teoria 34 - La idea es que estas funciones Controllers funcionen independientemente de que sean llamadas por View/endpoints (NO debe importar si son llamadas por express o por X) o mismo desde otras funciones Controllers
// Aquí sucede la comunicación con la/s DB/s haciendo uso de las llamadas async de los Models sequelize/capa Model del patrón de arquitectura MVC
export async function createProduct(userId: number, productData) {
  const { title, price } = productData;

  if (!userId) {
    throw "Parameter userId does not exist";
  }

  if (userId) {
    try {
      const [product, productCreated] = await Product.findOrCreate({
        // To make sure that the user do not post more than one product with the same data
        where: {
          title,
          price,
          userId: userId,
        },

        defaults: {
          ...productData,
          userId: userId,
        },
      });

      return { productCreated, product };
    } catch (err) {
      return err;
    }
  }
}
