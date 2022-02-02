// Configuración base de SDK: https://cloudinary.com/console/c-522565f667209256634ab40c18a983/getting-started
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "daxkw95yw",
  api_key: "797863183635941",
  api_secret: "1Dj1yGfH0PIyd3cnAJwhgH9QIKY",
});

export { cloudinary };
