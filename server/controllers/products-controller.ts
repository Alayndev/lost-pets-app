import { User, Product } from "../models"; // Controller invocan a capa Model

export async function getUserProducts(userId) {
    if (userId) {
        try {
            const products = await Product.findAll({
                where: { userId: userId }, // Obtenemos el id del user mediante el token. Previamente, en authMiddleware, chequemos que el token sea válido y firmado por nosotros. De resultar así, tenemos el JSON escondido en ese token que incluye el id (linea 94 - al crear el token)
                
                include: [User],
            });
            
            return { products };
        } catch (err) {
            throw err;
        }
    } else {
        throw "Controller without userId";
    }
}

// DUDA: products-controller.ts --> getUserProducts: DEBERÍA IR EN users-controller.ts? Ya que son los products de un user en particular. O está bien acá xq hacemos la llamda a la table products? 

