import { test } from "./models/connection";
import * as express from "express";
import * as cors from "cors";
import * as path from "path";

import "dotenv/config";

// Controllers
import {
  userRegistered,
  userSignUp,
  getUserProfile,
  updateUserProfile,
  getUserPets,
} from "./controllers/users-controller";
import {
  authSignUp,
  createToken,
  validatePassword,
  updateUserAuth,
} from "./controllers/auth-controller";
import {
  createPet,
  updatePet,
  findOnePet,
  deletePet,
  getPetAndOwner,
} from "./controllers/pets-controller";
import { createPetReport, userReports } from "./controllers/reports-controller";

// Middlewares
import {
  authMiddleware,
  hashPassword,
  checkEmail,
  checkEmailAndPassword,
  checkPasswordOrFullNameOrEmail,
  createPetChecker,
  checkPetId,
  updatePetChecker,
  checkDataURL,
  checkLatLng,
  checkReportData,
} from "./middlewares";

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
app.use(express.json());
const port = process.env.PORT || 3000;

const allowedHosts = [
  "https://lost-pet-finder-app-2.web.app",
  "https://lost-pet-finder-app-2.firebaseapp.com",
  "http://localhost:8080",
];

app.use(
  cors({
    origin: allowedHosts,
  })
);

// TESTING CONNECTION - DB POSTGRES HEROKU:
test();

//--------------------------------- ENDPOINTS: ----------------------------------//

// ----------------- AUTH SYSTEM:
app.get("/users/registered", checkEmail, async (req, res) => {
  try {
    const exist = await userRegistered(req.query.email);

    res.status(200).json({ exist });
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.post("/auth", checkEmailAndPassword, hashPassword, async (req, res) => {
  try {
    const { user, userCreated } = await userSignUp(req.body);

    // Para SOLO hacer otra llamada a la DB de ser necesario
    if (userCreated) {
      const { auth, authCreated } = await authSignUp(user, req._hashPassword);

      return res.status(201).json({ user, userCreated, authCreated });
    } else {
      const passwordValideted = await validatePassword(
        req.body.email,
        req._hashPassword
      );

      return res.status(201).json({ passwordValideted, user, userCreated });
    }
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.post(
  "/auth/token",
  checkEmailAndPassword,
  hashPassword,
  async (req, res) => {
    const { email } = req.body;

    try {
      const token = await createToken(email, req._hashPassword);

      if (token.error) {
        return res.status(400).json({ error: token.error });
      }

      res.status(200).json({ token });
    } catch (err) {
      res.status(400).json({ err });
    }
  }
);

app.get("/users/profile", authMiddleware, async (req, res) => {
  const { id } = req._user;

  try {
    const userProfile = await getUserProfile(id);

    res.status(200).json(userProfile);
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.patch(
  "/users/profile",
  checkPasswordOrFullNameOrEmail,
  authMiddleware,
  async (req, res) => {
    const { id } = req._user;
    console.log(req.body, "body");

    try {
      const usersUpdated = await updateUserProfile(id, req.body);

      // Actualizar contraseña en Table Auth
      if (req.body.password) {
        const authUpdated = await updateUserAuth(
          id,
          req.body.password,
          req.body.email
        );

        return res
          .status(200)
          .json({ usersUpdated, authUpdated, userWhoWasUpdated: id });
      }

      res.status(200).json({ usersUpdated, userWhoWasUpdated: id });
    } catch (err) {
      res.status(400).json({ err });
    }
  }
);

// ----------------- PETS:

app.post("/users/pets", createPetChecker, authMiddleware, async (req, res) => {
  const { id } = req._user;

  try {
    const pictureURL = await uploadPictureCloudinary(req.body.dataURL);

    const { pet, petCreated } = await createPet(id, req.body, pictureURL);

    if (petCreated) {
      const algoliaPetCreated = await createPetAlgolia(pet);

      return res.status(201).json({ pet, petCreated, algoliaPetCreated });
    }

    res.status(201).json({ pet, petCreated });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// DUDA: No debería ser PATCH /pets ? No uso token
app.patch(
  "/users/pets",
  checkPetId,
  updatePetChecker,
  checkDataURL,
  async (req, res) => {
    const { petId } = req.query;

    try {
      const pictureURL = await uploadPictureCloudinary(req.body.dataURL);

      const petUpdated = await updatePet(req.body, pictureURL, petId);

      if (petUpdated.error) {
        return res.status(404).json({ error: petUpdated.error });
      } else {
        const algoliaPetUpdated = await updatePetAlgolia(petUpdated);

        return res.status(201).json({ petUpdated, algoliaPetUpdated });
      }
    } catch (error) {
      res.status(400).json({ error });
    }
  }
);

app.get("/users/pets", authMiddleware, async (req, res) => {
  const { id } = req._user;

  try {
    const userPets = await getUserPets(id);

    res.status(200).json({ userPets });
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.get("/pets/around", checkLatLng, async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const petsAround = await searchPetsAround(lat, lng);

    res.status(200).json({ petsAround });
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.get("/pets", checkPetId, async (req, res) => {
  const { petId } = req.query;

  try {
    const petFound = await findOnePet(petId);

    if (petFound.error) {
      return res.status(404).json({ error: petFound.error });
    } else {
      return res.status(200).json(petFound.petFound);
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.delete("/pets", checkPetId, async (req, res) => {
  const { petId } = req.query;

  try {
    const petdeleted = await deletePet(petId);

    if (petdeleted.error) {
      return res.status(404).json({ error: petdeleted.error });
    } else {
      const algoliaPetDeleted = await deletePetAlgolia(petId);

      return res
        .status(200)
        .json({ petdeleted: petdeleted.petsDeleted, algoliaPetDeleted });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.post(
  "/pets/reports",
  checkPetId,
  checkReportData,
  authMiddleware,
  async (req, res) => {
    const { petId } = req.query;
    const { id } = req._user;

    try {
      const reportCreated = await createPetReport(petId, id, req.body);

      if (reportCreated.error) {
        return res.status(200).json({ error: reportCreated.error }); // Para que no manden el mismo report muchos users
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
  }
);

app.get("/users/reports", authMiddleware, async (req, res) => {
  const { id } = req._user;

  try {
    const reports = await userReports(id);

    res.status(200).json(reports);
  } catch (error) {
    res.status(400).json({ error });
  }
});

//---------------------------------- Servir el Front: ----------------------------------//
const dir = process.env.NODE_ENV === "development" ? "../dist" : "../../dist";

const staticDirPath = path.resolve(__dirname, dir);

app.use(express.static(staticDirPath));

app.get("*", function (req, res) {
  res.sendFile(staticDirPath + "/index.html");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
