class CardComp extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
    <div class="card" style="width: 18rem;">
        <img src="..." class="card-img-top" alt="...">
        <div class="card-body">
        <h5 class="card-title"> Bobby </h5>
        <p class="card-text"> Bobby es un perro amigable color marrón. </p>
        <a href="#" class="btn btn-primary"> Reportar información </a>
        </div>
    </div>
      `;
  }
}

customElements.define("x-card-comp", CardComp);
