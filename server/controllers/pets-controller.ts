import { User, Pet } from "../models"; // Controller invocan a capa Model
import { bodyToIndexAlgolia } from "../middlewares";

export async function createPet(userId: number, petData, pictureURL) {
  const { fullName, lat, lng, description } = petData;

  if (!petData || !userId) {
    const error =
      "Parameter userId or petData does not exist - createPet() - pets-controller.ts";
    return { error };
  }

  try {
    // TABLE PETS
    const [pet, petCreated] = await Pet.findOrCreate({
      // To make sure that the user do not post more than one Pet with the same data
      where: {
        fullName,
        lat,
        lng,
        userId,
      },

      defaults: {
        fullName,
        lat,
        lng,
        description,
        pictureURL,
        state: true,
        userId,
      },
    });

    return { pet, petCreated };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function updatePet(petData, pictureURL, petId: number) {
  const { fullName, lat, lng, description } = petData;

  if (!petData || !petId) {
    const error =
      "Parameter petId or petData does not exist - updatePet() - pets-controller.ts";
    return { error };
  }

  try {
    const petsUpdated = await Pet.update(
      { fullName, lat, lng, description, pictureURL },
      { where: { id: petId } }
    );

    if (petsUpdated > [0]) {
      const petDataToAlgolia = bodyToIndexAlgolia(petData, petId);
      return { petsUpdated, petDataToAlgolia };
    } else {
      const error = "Pet not found - The petId is wrong or does not exist";
      return { error };
    }
  } catch (error) {}
}

// DUDA: Pets-controller.ts --> getUserPets: DEBERÍA IR EN users-controller.ts? Ya que son los Pets de un user en particular. O está bien acá xq hacemos la llamada a la table Pets?
export async function getUserPets(userId: number) {
  try {
    const userPets = await Pet.findAll({
      where: { userId: userId, state: true },

      include: [User], // JOIN - "pet"."userId" = "user"."id"
    });

    if (userPets) {
      return { userPets };
    } else {
      return [];
    }
  } catch (err) {
    throw err;
  }
}
