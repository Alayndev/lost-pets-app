import { sequelize } from "./models/connection"; // Connection to RDB (Heroku Postgres)
import * as express from "express";
import * as cors from "cors";
import * as path from "path";

// Controllers
import {
  userRegistered,
  userSignUp,
  getUserProfile,
  updateUserProfile,
} from "./controllers/users-controller";
import { authSignUp, createToken } from "./controllers/auth-controller";
import { getUserPets, createPet } from "./controllers/pets-controller";

// Middlewares
import { authMiddleware, hashPassword } from "./middlewares";

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
// CREAR MIDDLEWARES PARA DIF. CHEQUEOS DE BODY (emailAndPasswordBodyCheck - emailBodyCheck - etc.)

// ----------------- AUTH SYSTEM:
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
      message:
        "This enpoint needs: id - Probably authMiddleware() failed OR the token did not have an id inside, check the endpoint POST /auth/token",
    });
  }

  try {
    const userProfile = await getUserProfile(id);

    res.status(200).json(userProfile);
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.patch("/users/profile", authMiddleware, async (req, res) => {
  const { id } = req._user;

  const { email, fullName }: { email: string; fullName: string } = req.body;

  if (!email && !fullName) {
    res.status(400).json({
      message:
        "Bad Request! You should include values for the columns email or fullName (both or one of them)",
    });
  }

  if (!id) {
    res.status(400).json({
      message:
        "This enpoint needs: id - Probably authMiddleware() failed OR the token did not have an id inside, check the endpoint POST /auth/token",
    });
  }

  try {
    const usersUpdated = await updateUserProfile(id, req.body);

    res.status(200).json({ usersUpdated, userWhoWasUpdated: id });
  } catch (err) {
    res.status(400).json({ err });
  }
});

// ----------------- PETS: (De acá en adelante)

// CREAR PET
// POST /products: Crear un endpoint POST /products, que permita crear productos y estos estén vinculados al User que el token indica. O sea que este endpoint solo debe recibir la data del nuevo producto y nada relacionado al User a relacionar, esto debe ser extraido del token cómo ya vimos en el proceso de auth.
app.post("/users/pets", authMiddleware, async (req, res) => {
  const { id } = req._user;

  if (!id) {
    res.status(400).json({
      message:
        "This enpoint needs: id - Probably authMiddleware() failed OR the token did not have an id inside, check the endpoint POST /auth/token",
    });
  }
});

// GET /users/pets: DEBE TRAERNOS LA/S PETS DE UN USER Y EL USER
// CREAR PETS PARA DIF. USERS. DEBE TRAERNOS LA/S PETS DE ESE USER Y EL USER
// DUDA: Pets-controller.ts --> getUserPets: DEBERÍA IR EN users-controller.ts? Ya que son los Pets de un user en particular. O está bien acá xq hacemos la llamada a la table Pets?
app.get("/users/pets", authMiddleware, async (req, res) => {
  const { id } = req._user;

  if (!id) {
    res.status(400).json({
      message:
        "This enpoint needs: id - Probably authMiddleware() failed OR the token did not have an id inside, check the endpoint POST /auth/token",
    });
  }

  try {
    const userPets = await getUserPets(id);

    res.status(200).json({ userPets });
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
