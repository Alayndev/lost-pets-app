import * as crypto from "crypto";

import * as jwt from "jsonwebtoken";

const SECRET_TEXT = "asdfghjklñpoiuytre"; // ENV VAR

export function hashPassword(req, res, next) {
  const { password }: { password: string } = req.body;

  if (password) {
    req._hashPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    next();
  } else {
    res
      .status(400)
      .json({ message: "Middleware hashPassword without password" });
  }
}

export function authMiddleware(req, res, next) {
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
