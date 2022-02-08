import { User } from "../models"; // Controller invocan a capa Model

import { cloudinary } from "../lib/cloudinary";

export async function userRegistered(email: string) {
  if (!email) {
    const error = "Controller userRegistered() without email";
    return { error };
  }

  try {
    const userFound = await User.findOne({ where: { email } });

    return { exist: userFound ? true : false, userFound };
  } catch (error) {
    console.error(error);

    return { error };
  }
}

export async function userSignUp(userData) {
  const { fullName, email }: { fullName: string; email: string } = userData;

  if (!userData) {
    const error = "Controller userSignUp() without userData";
    return { error };
  }

  try {
    // TABLE USERS:
    const [user, userCreated] = await User.findOrCreate({
      where: { email: email },

      defaults: {
        fullName,
        email,
        state: true,
      },
    });

    return { user, userCreated };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function getUserProfile(userId: number) {
  if (!userId) {
    const error = "Controller getUserProfile() without userId";
    return { error };
  }

  try {
    const userProfile = await User.findByPk(userId);

    return userProfile;
  } catch (err) {
    console.error({ err });
    return { err };
  }
}

// DUDA: No debería actualizar el email en table Auth también?
export async function updateUserProfile(userId: number, userData) {
  const { email, fullName }: { email: string; fullName: string } = userData;

  if (!userId || !userData) {
    const error = "Controller updateUserProfile() without userId or userData";
    return { error };
  }

  try {
    const userUpdated = await User.update(
      { fullName, email: email },
      {
        where: {
          id: userId,
        },
      }
    );

    return userUpdated;
  } catch (error) {
    console.error(error);
    return { error };
  }
}

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
