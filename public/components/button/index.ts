class ButtonComponent extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  addStyle() {
    const style = document.createElement("style");
    style.textContent = `
      .xbutton{
        border-radius: 4px;
        height: 50px;
        width: 335px;
      }
      .primary{
        background-color: #FF9DF5;
      }
      .secondary{
        background-color: #97EA9F;
      }
      .cancel{
        background-color: #CDCDCD;
      }
      `;
    this.appendChild(style);
  }
  addListener() {
    // add an appropriate event listener
    this.addEventListener("click", (e) => {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent("buttonClicked", { detail: { name: "Manz" } })
      );
    });
  }
  render() {
    const content = this.textContent;
    const tipo = this.getAttribute("type");

    this.innerHTML = `
      <button>
      ${content}
      </button>
      `;
    this.querySelector("button").classList.add("xbutton", tipo);
    this.addStyle();
    this.addListener();
  }
}
customElements.define("x-button", ButtonComponent);
