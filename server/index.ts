import { test } from "./models/connection";
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
import {
  getUserPets,
  createPet,
  updatePet,
} from "./controllers/pets-controller";

// Middlewares
import { authMiddleware, hashPassword } from "./middlewares";

// Lib
import { createPetAlgolia, updatePetAlgolia } from "./lib/algolia";
import { uploadPictureCloudinary } from "./lib/cloudinary";

// EXPRESS CONFIG
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

// TESTING CONNECTION - DB POSTGRES HEROKU:
test();

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

// DUDA: No debería actualizar el email en table Auth también? De no hacer update en Auth, además de tener los emails desincronizados, al crear el token debemos pasarle el email viejo, o es que ya está creado y no importa?
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
    // DUDA: No debería actualizar el email en table Auth también?
    const usersUpdated = await updateUserProfile(id, req.body);

    // if (email) {
    //   const authUpdated = await updateUserRecord(id, req.body);

    //   res.status(200).json({ usersUpdated, authUpdated, userWhoWasUpdated: id });
    // }

    res.status(200).json({ usersUpdated, userWhoWasUpdated: id });
  } catch (err) {
    res.status(400).json({ err });
  }
});

// ----------------- PETS: (De acá en adelante)

app.post("/users/pets", authMiddleware, async (req, res) => {
  const { id } = req._user;

  if (!id) {
    res.status(400).json({
      message:
        "This enpoint needs: id - Probably authMiddleware() failed OR the token did not have an id inside, check the endpoint POST /auth/token",
    });
  }

  try {
    const pictureURL = await uploadPictureCloudinary(req.body.dataURL);

    const { pet, petCreated } = await createPet(id, req.body, pictureURL);

    if (petCreated) {
      const algoliaPetCreated = await createPetAlgolia(pet);

      res.status(201).json({ pet, petCreated, algoliaPetCreated });
    }

    res.status(201).json({ pet, petCreated });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Docs Postman: Update parcial en Postgres Heroku y Algolia de la pet recibida por query. De no pasarme nada en el body para actualizar, 400 - De no encontrar petId en table Pets, 404 (linea 218) - De no pasarme dataURL, 400.
// TIP: Estaría bueno que dataURL no sea obligatorio, sino opcional
app.patch("/users/pets", async (req, res) => {
  const { fullName, lat, lng, description, dataURL } = req.body;
  const { petId } = req.query;

  // Make it a middleware - Para chequear que me pasan algo para actualizar, sino no tiene sentido hacer las llamadas async
  if (!fullName && !lat && !lng && !description && !dataURL) {
    res
      .status(400)
      .json({ error: "The client did not send any information to update" });
  }

  // Xq sino falla uploadPictureCloudinary() - No se me ocurre otra solución por el momento
  if (!dataURL) {
    res.status(400).json({
      message:
        "This enpoint needs: dataURL. Make sure to add it inside the body request",
    });
  }

  try {
    const pictureURL = await uploadPictureCloudinary(dataURL);

    const petUpdated = await updatePet(req.body, pictureURL, petId);

    if (petUpdated.error) {
      res.status(404).json({ error: petUpdated.error });
    }

    const algoliaPetUpdated = await updatePetAlgolia(petUpdated);

    res.status(201).json({ petUpdated, algoliaPetUpdated });
  } catch (error) {
    res.status(400).json({ error });
  }
});

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
const staticDirPath = path.resolve(__dirname, "../dist");

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
