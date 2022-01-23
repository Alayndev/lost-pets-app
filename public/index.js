const API_URL = "http://localhost:3000";
// const API_URL = "https://lost-pet-finder-app.herokuapp.com/";


function userExist(email) {
  console.log("userExist state: " + email);

  return fetch(API_URL + "/users/exist?email=" + email)
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
    const newUserPromise = userExist(email);
    console.log(newUserPromise, "Hola");

    const res = await newUserPromise;

    if (!res.exist) {
      console.log("NO existe, POST /auth");
      const divEl = document.querySelector(".user-data");
      divEl.innerHTML = `
      <div class="user-data">
        <h2>Mis datos</h2>
        
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
        "YA EXISTE, user ingresa contraseña y la haseamos para compararla con la guardada en la DB, POST /auth/token"
      );
      const divEl = document.querySelector(".user-data");
      divEl.innerHTML = `    <div class="signin">
      <h2>Ingresar</h2>

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
