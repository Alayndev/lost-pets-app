class CardComp extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  addListener(id) {
    this.querySelector(".report").addEventListener("click", (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent("report-pet", { detail: { id } }));
    });
  }

  render() {
    const name = this.textContent;
    const img = this.getAttribute("img");
    const id = this.getAttribute("petId");
    const description = this.getAttribute("description");
    const loc = this.getAttribute("loc");

    this.innerHTML = `
    <div class="card pet-card" style="width: 18rem;">
      <img class="card-img-top pet-card__img" src=${img} crossorigin="anonymous" alt="pet-img">
      <div class="card-body">
        <h5 class="card-title"> 🐕 ${name}</h5>
        
        <p class="subtitle"> Descripción: ${description} </p>
        <p class="subtitle"> 📍 ${loc} </p>

        <ul class="pet-card__links">
          <a class="pet-card__link report">REPORTAR INFORMACIÓN</a>
        </ul>
      </div>
    </div>    `;

    this.addListener(id);
  }
}

customElements.define("x-pet-card", CardComp);
