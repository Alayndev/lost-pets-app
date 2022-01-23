import { User, Auth } from "../models";

import * as jwt from "jsonwebtoken";

import * as crypto from "crypto";

function sha256(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

const SECRET_TEXT = "asdfghjklñpoiuytre"; // ENV VAR

export async function signUp(userData) {
  const {
    fullName,
    email,
    password,
  }: { fullName: string; email: string; password: string } = userData;

  if (userData) {
    // TABLE USERS:
    const [user, userCreated] = await User.findOrCreate({
      where: { email: email }, // Si este mail ya existe, userCreated va a ser false y vamos a endpoint auth/token para chequear la contraseña hasheandola y crear/chequear token

      defaults: {
        fullName,
        email,
        state: true,
      },
    });

    // Para SOLO hacer otra llamada a la DB solo de ser necesario
    if (userCreated) {
      // TABLE AUTH:
      const [auth, authCreated] = await Auth.findOrCreate({
        where: { userId: user.get("id") },

        defaults: {
          email: email,
          password: sha256(password),
          userId: user.get("id"),
        },
      });
      return { user, userCreated, auth, authCreated };
    }

    return { user, userCreated };
  } else {
    throw "Controller without userData";
  }
}

export async function createToken(userData) {
  const { password }: { email: string; password: string } = userData;

  const userFound = await Auth.findOne({
    where: {
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

export async function userExist(email: string) {
  const userFound = await User.findOne({ where: { email } });

  return userFound ? true : false;
}
