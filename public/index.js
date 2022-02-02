//const API_URL = "http://localhost:3000";
const API_URL = "https://lost-pet-finder-app.herokuapp.com";

function userRegistered(email) {
  console.log("userRegistered state: " + email);

  return fetch(API_URL + "/users/registered?email=" + email)
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      return json;
    });
}

function main() {
  const formEl = document.querySelector(".form");
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const target = e.target;
    const email = target.email.value;
    const newUserPromise = userRegistered(email);
    console.log(newUserPromise, "Hola");

    const res = await newUserPromise;
    console.log(res, "Res");

    if (!res.exist.exist) {
      console.log("NO resgistrado, POST /auth");
      const divEl = document.querySelector(".user-data");
      divEl.innerHTML = `
      <div class="user-data">
        <h2>Mis datos - NO registrado</h2>
        
        <form class="form">
          <div> Nombre: </div>
          <input name="email" type="text" />
          
          <div> Contraseña: </div>
          <input name="password" type="text" />

          <div> Repetir contraseña: </div>
          <input name="passwordtwo" type="text" />
        </form>
        
        <button class="next-page">Siguiente</button>
      </div>`;
    } else {
      console.log(
        "YA REGISTRADO, user ingresa contraseña y la haseamos para compararla con la guardada en la DB, POST /auth/token"
      );
      const divEl = document.querySelector(".user-data");
      divEl.innerHTML = `    <div class="signin">
        <h2>Registrado</h2>

        <form class="form">
          <div> Contraseña: </div>
          <input name="password" type="text" />

        </form>

        <button class="next-page">Guardar</button>
      </div>
`;
    }
  });
}

main();
