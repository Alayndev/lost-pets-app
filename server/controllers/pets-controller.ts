import { User, Pet } from "../models"; // Controller invocan a capa Model

export async function createPet(userId: number, petData) {
  const { title, price } = petData;

  if (!userId) {
    throw "Parameter userId does not exist";
  }

  if (userId) {
    try {
      const [pet, petCreated] = await Pet.findOrCreate({
        // To make sure that the user do not post more than one Pet with the same data
        where: {
          title,
          price,
          userId: userId,
        },

        defaults: {
          ...petData,
          userId: userId,
        },
      });

      return { petCreated, pet };
    } catch (err) {
      return err;
    }
  }
}

export async function getUserPets(userId) {
  try {
    const pets = await Pet.findAll({
      where: { userId: userId, state: true },

      include: [User],
    });

    return { pets };
  } catch (err) {
    throw err;
  }
}

// DUDA: Pets-controller.ts --> getUserPets: DEBERÍA IR EN users-controller.ts? Ya que son los Pets de un user en particular. O está bien acá xq hacemos la llamada a la table Pets?
