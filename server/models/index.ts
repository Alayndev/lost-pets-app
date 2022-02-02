import { User } from "./user";
import { Auth } from "./auth";
import { Pet } from "./pet";
import { Report } from "./report";

// Associations/Relations:

// One to One: Column userId inside Auths table/Auth Model
User.hasOne(Auth);
Auth.belongsTo(User);

// One to Many: Column userId inside Pets table/Pet Model
User.hasMany(Pet);
Pet.belongsTo(User);

// One to Many: Column userId inside Reports table/Report Model
User.hasMany(Report);
Report.belongsTo(User);

// One to Many: Column petId inside Reports table/Report Model
Pet.hasMany(Report);
Report.belongsTo(Pet);

export { User, Auth, Pet, Report };
