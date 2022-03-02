const API_URL = "https://lost-pet-finder-app.herokuapp.com";

//const API_URL = "http://localhost:3000";
console.log(API_URL);

const state = {
  data: {
    petData: {},
  },

  listeners: [],

  initState() {
    const cs = JSON.parse(localStorage.getItem("data")) || {
      user: {},
      petData: {},
    };
    this.setState(cs);
  },

  getState() {
    return this.data;
  },

  setState(newState) {
    this.data = newState;
    for (const cb of this.listeners) {
      cb();
    }
    console.log(this.data);
    localStorage.setItem("data", JSON.stringify(newState));
  },

  subscribe(cb: (any) => any) {
    this.listeners.push(cb);
  },

  async getPetsAround() {
    const { lat, lng } = this.getState()._geoloc;
    return await fetch(`${API_URL}/pets/around?lat=${lat}&lng=${lng}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // fullName? : Es opcional xq lo uso en login.ts page para que encuentre al user. Obligatorio en user-data.ts page
  async createOrFindUser(userData: {
    fullName?: string;
    email: string;
    password: string;
  }) {
    const res = await (
      await fetch(API_URL + "/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
    ).json();

    console.log(res);

    if (res.authCreated === true || res.passwordValideted.exist === true) {
      const cs = this.getState();
      cs.user = res.user;
      cs.user.created = res.userCreated;
      this.setState(cs);

      return await this.getToken(userData.email, userData.password);
    } else {
      return false;
    }
  },

  async getToken(email, password) {
    const cs = this.getState();
    const token = await (
      await fetch(API_URL + "/auth/token", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();
    cs.user.token = token.token.token;
    this.setState(cs);
    return true;
  },

  async updateUser(data) {
    const cs = this.getState();

    console.log(data, "updateUser state 98");

    const bodyToEndpoint = {
      fullName: data.name,
      password: data.password,
    };

    const updated = await (
      await fetch(API_URL + "/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${cs.user.token}`,
        },
        body: JSON.stringify(bodyToEndpoint),
      })
    ).json();

    console.log(updated, "res");

    if (updated.usersUpdated.userUpdated.length === 1) {
      cs.user.fullName = updated.usersUpdated.user.fullName;
      this.setState(cs);

      return updated;
    } else {
      return { error: "The user was not updated." };
    }
  },

  async checkMail(email: string) {
    return await (
      await fetch(API_URL + "/users/registered?email=" + email, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();
  },

  saveMail(email: string) {
    const cs = this.getState();
    cs.user = { email };
    this.setState(cs);
  },

  async sendReport(report) {
    const cs = this.getState();

    console.log(report, "report en state 127");

    const res = await (
      await fetch(`${API_URL}/pets/reports?petId=${report.petId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${cs.user.token}`,
        },
        body: JSON.stringify(report),
      })
    ).json();

    console.log(res, "res en state 140");

    return res;
  },

  async getReports() {
    const cs = this.getState();
    return await (
      await fetch(API_URL + `/me/report`, {
        method: "GET",
        headers: {
          Authorization: `bearer ${cs.user.token}`,
        },
      })
    ).json();
  },

  async getMyPets() {
    const cs = this.getState();

    const userPets = await (
      await fetch(API_URL + `/users/pets`, {
        method: "GET",
        headers: {
          Authorization: `bearer ${cs.user.token}`,
        },
      })
    ).json();

    console.log(userPets, "json res");

    if (userPets.userPets.error) {
      cs.myPets = "Este usuario todavía NO tiene pets reportadas";
      this.setState(cs);
    } else {
      cs.myPets = userPets.userPets;
      this.setState(cs);
    }

    return userPets;
  },

  async logout() {
    const cs = this.getState();
    cs.user = {};
    this.setState(cs);
  },

  async getPetData() {
    const cs = this.getState();
    console.log(cs.petData.id, "petId state para GET one pet");

    cs.petData = await (
      await fetch(`${API_URL}/pets?petId=${cs.petData.id}`)
    ).json();
    this.setState(cs);

    return cs.petData;
  },

  setPetData(petData) {
    const cs = this.getState();
    cs.petData = petData;
    this.setState(cs);
  },

  setPetGeoloc(geoloc: { lat: number; lng: number }) {
    const cs = this.getState();
    cs.petData.lat = geoloc.lat;
    cs.petData.lng = geoloc.lng;
    this.setState(cs);
  },

  setDataURL(dataURL) {
    const cs = this.getState();
    cs.dataURL = dataURL;
    this.setState(cs);
  },

  // Agregar description y barrio
  async editPet({ id, fullName, loc, description }) {
    const cs = this.getState();
    const lat = cs.petData.lat;
    const lng = cs.petData.lng;
    const dataURL = cs.dataURL;

    const bodyToEndpoint = {
      fullName,
      dataURL,
      lat,
      lng,
      loc,
      description,
    };

    console.log(bodyToEndpoint, "bodyToEndpoint");

    const petEdited = await (
      await fetch(API_URL + `/users/pets?petId=${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `bearer ${cs.user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyToEndpoint),
      })
    ).json();
    console.log(petEdited, "res state editPet() - 229");

    return petEdited;
  },

  // Agregar description y barrio
  async createPet({ fullName, loc, description }) {
    const cs = this.getState();
    const lat = cs.petData.lat;
    const lng = cs.petData.lng;
    const dataURL = cs.dataURL;

    const bodyToEndpoint = {
      fullName,
      dataURL,
      lat,
      lng,
      loc,
      description,
    };

    console.log(bodyToEndpoint, "bodyToEndpoint");

    const petCreated = await (
      await fetch(API_URL + `/users/pets`, {
        method: "POST",
        headers: {
          Authorization: `bearer ${cs.user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyToEndpoint),
      })
    ).json();

    console.log(petCreated, "res state createPet() - 235");

    return petCreated;
  },

  async petFound(id) {
    const cs = this.getState();
    const petEdited = await (
      await fetch(API_URL + `/pets?petId=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `bearer ${cs.user.token}`,
        },
      })
    ).json();
    return petEdited;
  },
};

export { state };
