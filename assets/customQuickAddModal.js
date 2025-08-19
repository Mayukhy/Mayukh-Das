class CustomQuickAddModal extends HTMLElement {
  constructor() {
    super();
    this.closeButton = this.querySelector(".custom-quick-add-modal__close");
  }

  connectedCallback() {
    this.closeButton.addEventListener("click", () => this.closeModal());
    document
      .querySelector(".custom-modal-overlay")
      .addEventListener("click", () => this.closeModal());
  }

  disconnectedCallback() {
    this.closeButton.removeEventListener("click", () => this.closeModal());
  }

  openModal(modal) {
    modal.classList.add("is-open");
    document.querySelector(".custom-modal-overlay").classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    this.classList.remove("is-open");
    document.querySelector(".custom-modal-overlay").classList.remove("is-open");
    document.body.style.overflow = "auto";
  }
}

customElements.define("custom-quick-add-modal", CustomQuickAddModal);
