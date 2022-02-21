const API_URL = "http://localhost:3000";
//const API_URL = "https://lost-pet-finder-app.herokuapp.com";

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
    return await fetch(`${API_URL}/pets/around?lat=${lat}&lng=${lng}`);
  },

  // fullName? opcional xq lo uso en login.ts page para que encuentre al user. Obligatorio en user-data.ts page
  async createOrFindUser(userData: {
    fullName?: string;
    email: string;
    password: string;
  }) {
    const { user, userCreated } = await (
      await fetch(API_URL + "/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
    ).json();

    console.log(user);

    const cs = this.getState();
    cs.user = user;
    cs.user.created = userCreated;
    this.setState(cs);

    return await this.getToken(userData.email, userData.password);
  },

  async getToken(email, password) {
    // "/auth/token"
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
    const email = cs.user.email;

    const bodyToEndpoint = {
      fullName: data.name,
      email: email,
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

    console.log(updated);
    if (updated.usersUpdated.length === 1) {
      return updated;
    } else {
      return { error: "The user was not updated." };
    }
  },

  async checkMail(email: string) {
    return await (
      await fetch(API_URL + "/users/registered?email=" + email)
    ).json();
  },

  saveMail(email: string) {
    const cs = this.getState();
    cs.user = { email };
    this.setState(cs);
  },

  async sendReport(report) {
    const cs = this.getState();
    return await (
      await fetch(`${API_URL}/pets/report?petId=${report.petId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${cs.user.token}`,
        },
        body: JSON.stringify(report),
      })
    ).json();
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

  // Agregar description, tambien en page para editar/reportar
  // PUT /me/pets?petId
  async editPet({ id, fullName, dataURL }) {
    const cs = this.getState();
    const lat = cs.petData.lat; // lat y lng desde page?
    const lng = cs.petData.lng;

    const bodyToEndpoint = {
      fullName,
      dataURL,
      lat,
      lng,
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

  // Agregar description
  // POST /me/pets
  // Cambiar nombre a reportPet()
  async createPet({ fullName, dataURL }) {
    const cs = this.getState();
    const lat = cs.petData.lat;
    const lng = cs.petData.lng;

    const bodyToEndpoint = {
      fullName,
      dataURL,
      lat,
      lng,
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

  // Cambiar a petFound()
  // DELETE /me/pets?petId=
  async findedPet(id) {
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
