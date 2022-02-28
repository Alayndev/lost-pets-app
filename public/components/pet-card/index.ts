class CardComp extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  addStyle() {
    const style = document.createElement("style");
    style.textContent = `
    .pet-card__img{
      width: 290px;
      height: 290px;
      object-fit: cover;
    }
    .pet-card{
      max-width: 335px;
    }
    `;
    this.appendChild(style);
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

    this.innerHTML = `
    <div class="card pet-card" style="width: 18rem;">
      <img class="card-img-top pet-card__img" src=${img} crossorigin="anonymous" alt="pet-img">
      <div class="card-body">
        <h5 class="card-title">${name}</h5>
        <p class="card-text">${description}</p>
        
        <ul class="pet-card__links">
          <a class="pet-card__link report">REPORTAR INFORMACIÓN</a>
        </ul>
      </div>
    </div>    `;

    this.addStyle();
    this.addListener(id);
  }
}

customElements.define("x-pet-card", CardComp);
