import { sequelize } from "./models/connection"; // Connection to RDB (Heroku Postgres)
import * as express from "express";
import * as cors from "cors";
import * as path from "path";

// Controllers
import {
  userRegistered,
  userSignUp,
  getUserProfile,
  createUser,
  createPet,
} from "./controllers/users-controller";
import { authSignUp, createToken } from "./controllers/auth-controller";
import { getUserPets } from "./controllers/pets-controller";

// Middlewares
import { authMiddleware, hashPassword } from "./middlewares"; // CREAR MIDDLEWARES PARA DIF. CHEQUEOS DE BODY (emailAndPasswordBodyCheck - emailBodyCheck - etc.) 

// EXPRESS CONFIG
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

// TESTING CONNECTION:
sequelize
  .authenticate()
  .then(() => console.log("Connection has been established successfully."))
  .catch((err) => console.log("Error: " + err));

//--------------------------------- ENDPOINTS: ----------------------------------//

app.get("/users/registered", async (req, res) => {
  const { email }: { email: string } = req.query;

  if (!email) {
    res.status(400).json({
      message: "Bad Request! You should include values for the columns email",
    });
  }

  try {
    const exist = await userRegistered(email);

    res.send({ exist });
  } catch (err) {
    res.send({ err });
  }
});

app.post("/auth", hashPassword, async (req, res) => {
  const { email, password }: { email: string; password: string } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message:
        "Bad Request! You should include values for the columns email and password",
    });
  }

  try {
    const { user, userCreated } = await userSignUp(req.body);

    // Para SOLO hacer otra llamada a la DB de ser necesario
    if (userCreated) {
      const { auth, authCreated } = await authSignUp(user, req._hashPassword);

      res.status(201).json({ user, userCreated, auth, authCreated });
    }

    res.status(201).json({ user, userCreated });
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.post("/auth/token", hashPassword, async (req, res) => {
  const { email, password }: { email: string; password: string } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message:
        "Bad Request! You should include values for the columns email and password",
    });
  }

  try {
    const token = await createToken(email, req._hashPassword);

    if (token.error) {
      res.status(400).json({ error: token.error });
    }

    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.get("/users/profile", authMiddleware, async (req, res) => {
  const { id } = req._user;

  if (!id) {
    res.status(400).json({
      message: "This enpoint needs: id",
    });
  }

  try {
    const userProfile = await getUserProfile(id);

    res.status(200).json(userProfile);
  } catch (err) {
    res.status(400).json({ err });
  }
});

// BUSCAR ENDPOINT TEORIA PARA ACTUALIZAR HACIENDO UN SOLO LLAMADO A LA DB
app.patch("/users/profile", authMiddleware, async (req, res) => {});

app.get("/users/pets", authMiddleware, async (req, res) => {});



// --------------------------------- ENDPOINTS DE AYUDA: --------------------//

// POST /products: Crear un endpoint POST /products, que permita crear productos y estos estén vinculados al User que el token indica. O sea que este endpoint solo debe recibir la data del nuevo producto y nada relacionado al User a relacionar, esto debe ser extraido del token cómo ya vimos en el proceso de auth.
app.post("/products", authMiddleware, async (req, res) => {
  const body = req.body;
  const userId = req._user.id;

  if (!body.title || !body.price) {
    res
      .status(400)
      .json({ message: "This endpoint needs values for title and price" });
  }

  if (!userId) {
    res.status(400).json({
      message:
        "The token did not have an id inside, check the endpoint POST /auth/token",
    });
  }

  try {
    const product = await createPet(userId, body);

    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ err });
  }
});

// GET /me/products: Crear un endpoint GET /me/products que me devuelva todos mis productos.
app.get("/me/products", authMiddleware, async (req, res) => {
  const userId = req._user.id;

  if (!userId) {
    res.status(400).json({
      message:
        "The token did not have an id inside, check the endpoint POST /auth/token",
    });
  }

  try {
    const userProducts = await getUserPets(userId);
    res.status(200).json({ userProducts });
  } catch (err) {
    res.status(400).json({ err });
  }
});

// DUDA: Es para crear o actualizar? Xq si es para actualizar, como hace Marce, debería ser PATCH. HACER AMBOS ENDPOINTS, PARA CREAR Y PARA UPDATE CON PATCH
app.post("/profile", async (req, res) => {
  const { fullName, bio, pictureURL } = req.body;

  if (!fullName || !bio || !pictureURL) {
    res.status(400).json({
      message: "This enpoint needs: fullName - bio - pictureURL",
    });
  }

  try {
    const user = await createUser(1, req.body);
    console.log(user);

    res.status(201).json({ user, message: true });
  } catch (err) {
    res.status(400).json({ err });
  }
});

//---------------------------------- Servir el Front: ----------------------------------//
const staticDirPath = path.resolve(__dirname, "../public"); // MOVER CONST Y CAMBIAR A CARPETA QUE ESCUPE PARCEL (public-dist/dist)

app.use(express.static(staticDirPath));

app.get("*", function (req, res) {
  res.sendFile(staticDirPath + "/index.html");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// PASOS PARA ENDPOINTS:

// ADAPTAR CON TEORIA -- OK
// Repasar métodos Sequelize y Algolia con docs -- OK  --> https://sequelize.org/v7/ || https://www.algolia.com/doc/api-reference/api-methods/save-objects/
// Revisar y probar en Postman -- OK
// Crear método para consumir este endpoint en state --
// Consumirlo desde la page --
// Deploy --
