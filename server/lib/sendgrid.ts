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
