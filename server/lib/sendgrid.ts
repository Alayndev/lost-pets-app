const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(petOwner, phoneNumber, petName, report) {
  const msg = {
    to: petOwner, // petOwner - Change to your recipient
    from: "saezalayn@gmail.com", // Change to your verified sender
    subject: `There has been a report of your pet: ${petName}`,
    text: `There has been a report of your pet called ${petName}. Someone reported: " ${report} ". You can get in touch with the person who reported: ${phoneNumber} `,
    html: `There has been a report of your pet called ${petName}. Someone reported: " ${report} ". You can get in touch with the person who reported: ${phoneNumber} `,
  };

  const sentEmail = await sgMail
    .send(msg)
    .then(() => {
      console.log(`Email sent to: ${petOwner}`);
      const sendgridEmail = `Email sent to: ${petOwner}`;
      return { sendgridEmail };
    })
    .catch((error) => {
      console.error(error);
      return { error };
    });

  return sentEmail;
}

// Si no llegara a funcionar sendgrid puede que sea por la Env Var, volver a declarar en la consola el comando (SCREEN EN IMAGENES): export SENDGRID_API_KEY=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

// RECORDAR HACER ENV VARS PARA CONECCTION A AMBAS DB, NO ME LEE EL .env LA LIBRERIA dotenv --> env.ts

// Y tambien recordar hacer middlewares para checkear el body
