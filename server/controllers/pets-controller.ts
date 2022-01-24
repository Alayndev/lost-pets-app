import { User, Pet } from "../models"; // Controller invocan a capa Model

export async function getUserPets(userId) {
    if (userId) {
        try {
            const Pets = await Pet.findAll({
                where: { userId: userId }, // Obtenemos el id del user mediante el token. Previamente, en authMiddleware, chequemos que el token sea válido y firmado por nosotros. De resultar así, tenemos el JSON escondido en ese token que incluye el id (linea 94 - al crear el token)
                
                include: [User],
            });
            
            return { Pets };
        } catch (err) {
            throw err;
        }
    } else {
        throw "Controller without userId";
    }
}

// DUDA: Pets-controller.ts --> getUserPets: DEBERÍA IR EN users-controller.ts? Ya que son los Pets de un user en particular. O está bien acá xq hacemos la llamda a la table Pets? 

