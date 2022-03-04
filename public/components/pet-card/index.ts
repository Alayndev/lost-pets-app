class CardComp extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  addListener(id, reportSection) {
    this.querySelector(".report").addEventListener("click", (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent("report-pet", { detail: { id } }));
    });

    const type = this.getAttribute("type");
    if (!type) {
      reportSection.style.display = "none";
    }
  }

  render() {
    const name = this.textContent;
    const img = this.getAttribute("img");
    const id = this.getAttribute("petId");
    const description = this.getAttribute("description");
    const loc = this.getAttribute("loc");
    const type = this.getAttribute("type");

    const textContent = type ? "REPORTAR INFORMACIÓN" : "";

    this.innerHTML = `
    <div class="card pet-card" style="width: 18rem;">
      <img class="card-img-top pet-card__img" src=${img} crossorigin="anonymous" alt="pet-img">
      <div class="card-body">
        <h5 class="card-title"> 🐕 ${name}</h5>
        
        <p class="subtitle"> Descripción: ${description} </p>
        <p class="subtitle"> 📍 ${loc} </p>

        <ul class="pet-card__links ul-links">
          <a class="pet-card__link report subtitle"> ${textContent}  </a>
        </ul>
      </div>
    </div>    `;

    const reportSection: any = this.querySelector(".ul-links");

    this.addListener(id, reportSection);
  }
}

customElements.define("x-pet-card", CardComp);
