import { User, Auth } from "../models";

import * as jwt from "jsonwebtoken";

const SECRET_TEXT = "asdfghjklñpoiuytre"; // ENV VAR

export async function signUp(userData, password) {
  const { fullName, email }: { fullName: string; email: string } = userData;

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
          email,
          password,
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

export async function createToken(email, password) {
  try {
    const userFound = await Auth.findOne({
      where: {
        email,
        password,
      },
    });

    if (userFound === null) {
      console.error("User not Found! Email or Password incorrect, auth-controller.ts - createToken()");
      const error = "User not Found! Email or Password incorrect, auth-controller.ts - createToken()";
      return error;
    } else {
      const token = jwt.sign({ id: userFound.get("userId") }, SECRET_TEXT);

      return { token, userFound };
    }
  } catch (err) {
    console.error(err);
  }
}

export async function userRegistered(email: string) {
  const userFound = await User.findOne({ where: { email } });

  return userFound ? true : false;
}
