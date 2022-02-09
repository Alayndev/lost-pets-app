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
  findOnePet,
  deletePet,
  getPetAndOwner,
} from "./controllers/pets-controller";
import { createPetReport, userReports } from "./controllers/reports-controller";

// Middlewares
import { authMiddleware, hashPassword } from "./middlewares";

// Lib
import {
  createPetAlgolia,
  updatePetAlgolia,
  searchPetsAround,
  deletePetAlgolia,
} from "./lib/algolia";
import { uploadPictureCloudinary } from "./lib/cloudinary";
import { sendEmail } from "./lib/sendgrid";

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

// ----------------- PETS:

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

// DUDA: No debería ser PATCH /pets ? No uso token
// TIP: Estaría bueno que dataURL no sea obligatorio, sino opcional
app.patch("/users/pets", async (req, res) => {
  const { fullName, lat, lng, description, dataURL } = req.body;
  const { petId } = req.query;

  // Middleware - tmb en GET /pets
  if (!petId) {
    res.status(400).json({ error: "Missing petId query" });
  }

  // Make it a middleware - Cuando dataURL no sea obligatorio, incluirlo en el middleware - Para chequear que me pasan algo para actualizar, sino no tiene sentido hacer las llamadas async
  if (!fullName && !lat && !lng && !description) {
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
    } else {
      const algoliaPetUpdated = await updatePetAlgolia(petUpdated);

      res.status(201).json({ petUpdated, algoliaPetUpdated });
    }
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

app.get("/pets/around", async (req, res) => {
  const { lat, lng } = req.query;

  // Middleware
  if (!lat || !lng) {
    res.status(400).json({
      message:
        "Bad Request! You should include values for the columns lat and lng",
    });
  }

  try {
    const petsAround = await searchPetsAround(lat, lng);

    res.status(200).json({ petsAround });
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.get("/pets", async (req, res) => {
  const { petId } = req.query;

  // Middleware
  if (!petId) {
    res.status(400).json({ error: "Missing petId query" });
  }

  try {
    const petFound = await findOnePet(petId);

    if (petFound.error) {
      res.status(404).json({ error: petFound.error });
    } else {
      res.status(200).json(petFound);
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.delete("/pets", async (req, res) => {
  const { petId } = req.query;

  // Middleware
  if (!petId) {
    res.status(400).json({ error: "Missing petId query" });
  }

  try {
    const petdeleted = await deletePet(petId);

    if (petdeleted.error) {
      res.status(404).json({ error: petdeleted.error });
    } else {
      const algoliaPetDeleted = await deletePetAlgolia(petId);

      res
        .status(200)
        .json({ petdeleted: petdeleted.petsDeleted, algoliaPetDeleted });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.post("/pets/reports", authMiddleware, async (req, res) => {
  const { petId } = req.query;
  const { id } = req._user;
  const { fullName, phoneNumber, report } = req.body;

  // Middleware
  if (!petId) {
    res.status(400).json({ error: "Missing petId query" });
  }

  // Middleware para req.body - Obligatorio fullName - phoneNumber - report
  if (!fullName || !phoneNumber || !report) {
    res.status(400).json({
      message:
        "Bad Request! You should include values for the columns fullName - email - report",
    });
  }

  try {
    const reportCreated = await createPetReport(petId, id, req.body);

    if (reportCreated.error) {
      res.status(400).json({ error: reportCreated.error }); // Para que no manden el mismo report muchos users
    } else {
      const petAndOwner = await getPetAndOwner(petId);

      // sendgrid
      const sentEmail = await sendEmail(
        petAndOwner.getDataValue("user").email, // owner - email del dueño de la mascota
        reportCreated.reportRecord.getDataValue("phoneNumber"), // phoneNumber de quien reporta
        petAndOwner.getDataValue("fullName"), // petName
        reportCreated.reportRecord.getDataValue("report") // reporte
      );

      res.status(201).json({ reportCreated, petAndOwner, sentEmail });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.get("/users/reports", authMiddleware, async (req, res) => {
  const { id } = req._user;

  if (!id) {
    res.status(400).json({
      message:
        "This enpoint needs: id - Probably authMiddleware() failed OR the token did not have an id inside, check the endpoint POST /auth/token",
    });
  }

  try {
    const reports = await userReports(id);

    res.status(200).json(reports);
  } catch (error) {
    res.status(400).json({ error });
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
