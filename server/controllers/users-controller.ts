import { User, Pet } from "../models"; // Controller invocan a capa Model

import { cloudinary } from "../lib/cloudinary";

export async function userRegistered(email: string) {
  if (!email) {
    const error = "Controller userRegistered() without email";
    return { error };
  }

  try {
    const userFound = await User.findOne({ where: { email } });

    return { exist: userFound ? true : false, userFound };
  } catch (error) {
    console.error(error);

    return { error };
  }
}

export async function userSignUp(userData: {
  fullName: string;
  email: string;
}) {
  const { fullName, email } = userData;

  if (!userData) {
    const error = "Controller userSignUp() without userData";
    return { error };
  }

  try {
    // TABLE USERS:
    const [user, userCreated] = await User.findOrCreate({
      where: { email: email },

      defaults: {
        fullName,
        email,
        state: true,
      },
    });

    return { user, userCreated };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function getUserProfile(userId: number) {
  if (!userId) {
    const error = "Controller getUserProfile() without userId";
    return { error };
  }

  try {
    const userProfile = await User.findByPk(userId);

    return userProfile;
  } catch (err) {
    console.error({ err });
    return { err };
  }
}

export async function updateUserProfile(
  userId: number,
  userData: { email: string; fullName: string }
) {
  const { email, fullName } = userData;

  if (!userId || !userData) {
    const error = "Controller updateUserProfile() without userId or userData";
    return { error };
  }

  try {
    const userUpdated = await User.update(
      { fullName, email: email },
      {
        where: {
          id: userId,
        },
      }
    );

    const user = await User.findByPk(userId);

    return { userUpdated, user };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function getUserPets(userId: number) {
  try {
    const userPets = await (
      await User.findByPk(userId, {
        include: [{ model: Pet, where: { state: true } }],
      })
    ).get("pets");

    if (userPets) {
      return userPets;
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return { error };
  }
}
