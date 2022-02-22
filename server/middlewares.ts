import * as crypto from "crypto";

import * as jwt from "jsonwebtoken";

import "dotenv/config";

export function hashPassword(req, res, next) {
  const { password }: { password: string } = req.body;

  if (password) {
    req._hashPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    next();
  } else {
    res.status(400).json({
      message: "Middleware hashPassword() without password parameter",
    });
  }
}

export function authMiddleware(req, res, next) {
  const authHeader: string = req.get("Authorization");

  if (!authHeader) {
    res.status(401).json({ error: "Header Authorization does not exist" });
  }

  try {
    const token = authHeader.split(" ")[1];

    const tokenJSON = jwt.verify(token, process.env.SECRET_TEXT);

    req._user = tokenJSON;

    next();
  } catch (err) {
    res.status(401).json({ err });
  }
}

//Function para formatear data para pasarle a Algolia
export function bodyToIndexAlgolia(body, id: number) {
  const res: any = {};

  if (id) {
    res.objectID = id;
  }

  if (body.fullName) {
    res.fullName = body.fullName;
  }

  if (body.lat && body.lng) {
    res._geoloc = {
      lat: body.lat,
      lng: body.lng,
    };
  }

  return res;
}
