import { Auth } from "../models";

import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";

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

export async function validatePassword(email, password: string) {
  if (!password) {
    const error = "Controller validatePassword() without password";
    return { error };
  }

  try {
    const userFound = await Auth.findOne({ where: { email, password } });

    return { exist: userFound ? true : false };
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

export async function updateUserAuth(
  userId: number,
  password: string,
  email?: string
) {
  if (!userId || !password) {
    const error = "Controller updateUserAuth() without userId or password";
    return { error };
  }

  try {
    const passwordHashed = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    console.log(passwordHashed);

    const userUpdated = await Auth.update(
      { password: passwordHashed, email },
      {
        where: {
          id: userId,
        },
      }
    );

    return { userUpdated };
  } catch (error) {
    console.error(error);
    return { error };
  }
}
