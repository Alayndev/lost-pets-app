// Toda la lógica de AUTH: 1) Guardar en table User y Auth lo correspondiente - 2) Generar token

import { User, Auth } from "../models"; // Controller invocan a capa Model

import * as jwt from "jsonwebtoken";

import * as crypto from "crypto";

function sha256(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

const SECRET_TEXT = "asdfghjklñpoiuytre";

export async function signUp(userData) {
  const {
    full_name,
    birthdate,
    email,
    password,
  }: { full_name: string; birthdate: string; email: string; password: string } =
    userData;

  if (userData) {
    // TABLE USERS:
    const [user, userCreated] = await User.findOrCreate({
      where: { email: email },

      defaults: {
        full_name,
        birthdate,
        email,
      },
    });

    // TABLE AUTH:
    const [auth, authCreated] = await Auth.findOrCreate({
      where: { userId: user.get("id") },

      defaults: {
        email: email,
        password: sha256(password),
        userId: user.get("id"),
      },
    });

    return { user, userCreated };
  } else {
    throw "Controller without userData";
  }
}

export async function createToken(userData) {
  const { email, password }: { email: string; password: string } = userData;

  const userFound = await Auth.findOne({
    where: {
      email,
      password: sha256(password),
    },
  });

  if (userFound === null) {
    throw "User not Found! Email or Password incorrect";
  } else {
    const token = jwt.sign({ id: userFound.get("userId") }, SECRET_TEXT);

    return { token };
  }
}
