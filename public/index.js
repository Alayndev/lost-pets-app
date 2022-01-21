async function pullProfile() {
  const formEl = document.querySelector("#form");
  const imgEl = document.querySelector(".form__profile-pic");
  console.log(imgEl);

  const res = await fetch("/profile?userId=3"); // Obviamente una query dinámica, GUARDAR TOKEN EN localStorage

  const userProfile = await res.json();
  console.log(userProfile);

  if (userProfile) {
    formEl.fullname.value = userProfile.fullName;

    formEl.bio.value = userProfile.bio;

    imgEl.src = userProfile.pictureURL;
  }
}

function main() {
  pullProfile();

  const formEl = document.querySelector("#form");

  let pictureURL;

  const myDropzone = new Dropzone(".form__profile-pic-cont", {
    url: "/falsa",
    autoProcessQueue: false, 
  });

  console.log(myDropzone);

  myDropzone.on("thumbnail", function (file) {
    pictureURL = file.dataURL;
    console.log(file.dataURL);
  });

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = e.target.fullname.value;

    const bio = e.target.bio.value;
    console.log({ fullName, bio, pictureURL });

    fetch("/profile", {
      headers: { "content-type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        fullName,
        bio,
        pictureURL, 
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  });
}

main();
