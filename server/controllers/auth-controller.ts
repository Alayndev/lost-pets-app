import { Auth } from "../models";

import * as jwt from "jsonwebtoken";

import "dotenv/config";

export async function authSignUp(user, password: string) {
  if (!user || !password) {
    const error = "Controller authSignUp() without user and/or password";
    return { error };
  }

  try {
    // TABLE AUTH:
    const [auth, authCreated] = await Auth.findOrCreate({
      where: { userId: user.get("id") },

      defaults: {
        email: user.get("email"),
        password,
        userId: user.get("id"),
      },
    });
    return { auth, authCreated };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function createToken(email: string, password: string) {
  if (!email || !password) {
    const error = "Controller createToken() without email and/or password";
    return { error };
  }

  try {
    const userFound = await Auth.findOne({
      where: {
        email,
        password,
      },
    });

    if (userFound === null) {
      // Para responderle al cliente (Postman - Front) que el usuario NO ha sido encontrado y que posiblemente se deba a un problema de tipeo
      const error =
        "User not Found! Email or Password incorrect, auth-controller.ts - createToken()";
      return { error };
    } else {
      const token = jwt.sign(
        { id: userFound.get("userId") },
        process.env.SECRET_TEXT
      );

      return { token };
    }
  } catch (error) {
    console.error(error);
    return { error };
  }
}
