import { User, Report } from "../models";

export async function createPetReport(petId: number, userId: number, petData: { fullName: string, phoneNumber: number, report: string, lat: number, lng: number }) {
  const { fullName, phoneNumber, report, lat, lng } = petData;

  const [reportRecord, reportCreated] = await Report.findOrCreate({
    where: { fullName, phoneNumber, report },

    defaults: {
      fullName,
      phoneNumber,
      report,
      lat,
      lng,
      petId,
      userId,
    },
  });

  if (!reportCreated) {
    const error = "This report already exists";
    return { error };
  } else {
    return { reportRecord };
  }
}

export async function userReports(userId: number) {
  const userReports = await (
    await User.findByPk(userId, { include: [Report] })
  ).get("reports");

  return { userReports };
}

// JOIN: user.id = report.userId --> Todos los records de la table Reports que tengan userId = user.id

// .get("reports"); --> Seleccionamos la column reports que crea el JOIN en la response (sacar y poner para ver, es lo mismo que cuando hacemos: .get("id"); en Auth por ejemplo, pero con "reports" que es lo que crea el JOIN con los reports de ese user.id en table Reports, ya que user.id = report.userId (association/relation One to Many) )
