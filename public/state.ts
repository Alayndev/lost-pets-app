// const API_URL =
//   process.env.NODE_ENV === "production"
//     ? "https://lost-pet-finder-app.herokuapp.com"
//     : "http://localhost:3000";

//const API_URL = "http://localhost:3000";
const API_URL = "https://lost-pet-finder-app.herokuapp.com";

const state = {
  data: {
    fullName: null,
    email: null,
    _geoloc: {},
  },

  listeners: [],

  initState() {
    const lastStorageState = JSON.parse(sessionStorage.getItem("token"));

    if (lastStorageState) {
      this.setState(lastStorageState);
    } else {
      const initialState = this.getState();

      this.setState(initialState);
    }
  },

  getState() {
    return this.data;
  },

  setState(newState) {
    this.data = newState;

    for (const cb of this.listeners) {
      cb();
    }

    sessionStorage.setItem("actual state", JSON.stringify(newState));

    console.log("Soy el STATE, he cambiado. Aquí la nueva data:", this.data);
  },

  subscribe(cb) {
    this.listeners.push(cb);
  },

  // CREAR PETS CON POSTMAN CERCA DE MI LAT Y LNG, LUEGO HACER ESTA LLAMADA AL ENDPOINT
  async getPetsAround() {
    const { lat, lng } = this.getState()._geoloc;
    return await fetch(`${API_URL}/pets/around?lat=${lat}&lng=${lng}`);
  },

  userRegistered(email) {
    console.log("userRegistered state: " + email);

    return fetch(API_URL + "/users/registered?email=" + email)
      .then((res) => res.json())
      .then((json) => console.log(json));
  },

  signUp(userData) {
    const cs = this.getState();

    return fetch(API_URL + "/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(userData),
    })
      .then((res) => res.json())
      .then((json) => {
        console.log("Hago la llamada a POST /auth : ", json);

        return json;
      });
  },

  createToken() {
    // fetch("/auth/token")....
    //this.setToken(token);
  },
  setToken(token) {
    //localStorage.setItem("token", token)
  },
};

export { state };
