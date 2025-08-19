class CustomModalOpener extends HTMLElement {
  constructor() {
    super();
    this.opener = this.querySelector(".custom-product-card__cta");
  }

  connectedCallback() {
    this.opener.addEventListener("click", () => {
      const currentProductId = this.dataset.modal.replace(
        "custom-modal-opener-",
        ""
      );
      const modal = document.querySelector(
        `#custom-quick-add-modal-${currentProductId}`
      );
      if (modal) {
        modal.openModal(modal);
      }
    });
  }

  disconnectedCallback() {
    this.removeEventListener("click", () => {
      const currentProductId = this.dataset.modal.replace(
        "custom-modal-opener-",
        ""
      );
      const modal = document.querySelector(
        `#custom-quick-add-modal-${currentProductId}`
      );
      if (modal) {
        modal.openModal(modal);
      }
    });
  }
}
customElements.define("custom-modal-opener", CustomModalOpener);
