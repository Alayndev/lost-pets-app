class TextComponent extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  addStyle() {
    const style = document.createElement("style");
    style.textContent = `
    .title{
      font-family: Poppins;
      font-size: 40px;
      font-style: normal;
      font-weight: 700;
      line-height: 60px;
      letter-spacing: 0em;
      text-align: left;
    }
    .subtitle{
      font-family: Poppins;
      font-size: 24px;
      font-style: normal;
      font-weight: 400;
      line-height: 36px;
      letter-spacing: 0em;
      text-align: left;
    }
    .body{
      font-family: Poppins;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 24px;
      letter-spacing: 0em;
      text-align: left;
    }
    .bold{
      font-weight: 700;
    }
    `;
    this.appendChild(style);
  }
  render() {
    const content = this.textContent;
    const tipo = this.getAttribute("type");
    const style = this.getAttribute("style");

    this.innerHTML = `
    <div>${content}</div>
    `;
    this.classList.add(tipo, style);
    this.addStyle();
  }
}
customElements.define("x-text", TextComponent);
