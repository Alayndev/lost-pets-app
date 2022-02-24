class ButtonComponent extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  addListener() {
    this.addEventListener("click", (e) => {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent("buttonClicked", { detail: { name: "Manz" } })
      );
    });
  }

  render() {
    const content = this.textContent;
    const css_class = this.getAttribute("type");
    console.log(css_class);

    this.innerHTML = `
    <button type="button" class="${css_class}">
      ${content}
    </button>
    `;
    this.addListener();
  }
}
customElements.define("x-button", ButtonComponent);
