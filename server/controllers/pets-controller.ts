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
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function findOnePet(petId: number) {
  try {
    const petFound = await Pet.findOne({ where: { id: petId, state: true } });

    if (petFound) {
      return { petFound };
    } else {
      const error = "Pet not found - The petId is wrong or does not exist";
      return { error };
    }
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function deletePet(petId) {
  try {
    const petsDeleted = await Pet.update(
      { state: false },
      { where: { id: petId, state: true } } // Si no pongo state: true, siempre va a encontrar y va a hacer ese update, haciendo la llamada async a Algolia tmb al pedo
    );

    if (petsDeleted > [0]) {
      return { petsDeleted };
    } else {
      const error = "Pet not found - The petId is wrong or does not exist";
      return { error };
    }
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function getPetAndOwner(petId) {
  const petAndOwner = await Pet.findByPk(petId, { include: [User] });
  return petAndOwner;
}
