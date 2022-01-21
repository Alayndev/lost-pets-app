import { sequelize } from "./models/connection"; // Connection to RDB (Heroku Postgres)
import * as express from "express";

import * as path from "path";

// Controllers
import {
  createUser,
  getUserProfile,
  createProduct,
} from "./controllers/users-controller";
import { signUp } from "./controllers/auth-controller";
import { createToken } from "./controllers/auth-controller";
import { getUserProducts } from "./controllers/products-controller";

import * as jwt from "jsonwebtoken";

const SECRET_TEXT = "asdfghjklñpoiuytre";

// EXPRESS CONFIG
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

// TESTING CONNECTION:
sequelize
  .authenticate()
  .then(() => console.log("Connection has been established successfully."))
  .catch((err) => console.log("Error: " + err));

////////////////////// DESAFÍO CON MARCE DE MVC: ENDPOINTS POST /profile Y GET /profile

// DUDA: Es para crear o actualizar? Xq si es para actualizar, como hace Marce, debería ser PATCH. ES CUALQUIERA EL DESAFÍO, SI QUIERO HACER UN PROYECTO HACER AMBOS ENDPOINTS, PARA CREAR Y PARA UPDATE CON PATCH
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

app.get("/profile", async (req, res) => {
  const { userId } = req.query;
  console.log({ userId });

  if (!userId) {
    res.status(400).json({
      message: "This enpoint needs: userId",
    });
  }

  try {
    const userProfile = await getUserProfile(userId);

    res.status(200).json(userProfile);
  } catch (err) {
    res.status(400).json({ err });
  }
});


///////////// ENDPOINTS: Postman API Auth Relations Sequelize /////////////

app.post("/auth", async (req, res) => {
  const { email, password }: { email: string; password: string } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message:
        "Bad Request! You should include values for the columns email and password",
    });
  }

  try {
    const user = await signUp(req.body);

    res.status(201).json({ user });
  } catch (err) {
    res.status(400).json({ err });
  }
});

app.post("/auth/token", async (req, res) => {
  const { email, password }: { email: string; password: string } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message:
        "Bad Request! You should include values for the columns email and password",
    });
  }

  try {
    const token = await createToken(req.body);

    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ err });
  }
});

function authMiddleware(req, res, next) {
  const authHeader: string = req.get("Authorization");

  if (!authHeader) {
    res.status(401).json({ error: "Header Authorization does not exist" });
  }

  try {
    const token = authHeader.split(" ")[1];

    const tokenJSON = jwt.verify(token, SECRET_TEXT);

    req._user = tokenJSON;

    next();
  } catch (err) {
    res.status(401).json({ error: err });
  }
}

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
    const product = await createProduct(userId, body);

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
    const userProducts = await getUserProducts(userId);
    res.status(200).json({ userProducts });
  } catch (err) {
    res.status(400).json({ err });
  }
});

// Servir el Front: MOVER CONST
const staticDirPath = path.resolve(__dirname, "../public"); // CAMBIAR A CARPETA QUE ESCUPE PARCEL (public-dist/dist)

app.use(express.static(staticDirPath));

app.get("*", function (req, res) {
  res.sendFile(staticDirPath + "/index.html");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
