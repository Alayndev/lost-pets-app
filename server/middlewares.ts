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

export function checkEmail(req, res, next) {
  const { email }: { email: string } = req.query;

  if (!email) {
    return res.status(400).json({
      message: "Bad Request! You mus include a value for email by query",
    });
  } else {
    next();
  }
}

export function checkEmailAndPassword(req, res, next) {
  const { email, password }: { email: string; password: string } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message:
        "Bad Request! You must include values for email and password by body",
    });
  } else {
    next();
  }
}

export function checkEmailOrFullName(req, res, next) {
  const { email, fullName }: { email: string; fullName: string } = req.body;

  if (!email && !fullName) {
    return res.status(400).json({
      message:
        "Bad Request! You must include values for email or fullName by body (both or one of them)",
    });
  } else {
    next();
  }
}

export function createPetChecker(req, res, next) {
  const { fullName, lat, lng, dataURL } = req.body;

  if (!fullName || !lat || !lng || !dataURL) {
    return res.status(400).json({
      message:
        "Bad Request! You must include values for: fullName - lat - lng - dataURL",
    });
  } else {
    next();
  }
}

export function checkPetId(req, res, next) {
  const { petId } = req.query;

  if (!petId) {
    return res.status(400).json({ error: "Missing petId query" });
  } else {
    next();
  }
}

// Con && para que sea OPCIONAL - Dif. a createPetChecker donde necesito OBLIGATORIAMENTE todos estos datos
// Para chequear que me pasan algo para actualizar, sino no tiene sentido hacer las llamadas async
export function updatePetChecker(req, res, next) {
  const { fullName, lat, lng, description, dataURL } = req.body;

  if (!fullName && !lat && !lng && !description && !dataURL) {
    return res
      .status(400)
      .json({ error: "The client did not send any information to update" });
  } else {
    next();
  }
}

// Xq sino falla uploadPictureCloudinary()
export function checkDataURL(req, res, next) {
  if (!req.body.dataURL) {
    return res.status(400).json({
      message:
        "This enpoint needs: dataURL. Make sure to add it inside the body request",
    });
  } else {
    next();
  }
}

export function checkLatLng(req, res, next) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      message:
        "Bad Request! You must include values for: lat and lng",
    });
  } else {
    next();
  }
}

export function checkReportData(req, res, next) {
  const { fullName, phoneNumber, report } = req.body;

  //  Obligatorio para crear Report: fullName - phoneNumber - report
  if (!fullName || !phoneNumber || !report) {
    return res.status(400).json({
      message:
        "Bad Request! You must include values for: fullName - email - report",
    });
  } else {
    next();
  }
}
