/**
 * CustomModalOpener - Web component for opening quick add modals
 * Handles the click event on product cards to display the quick add modal
 * @extends HTMLElement
 */
class CustomModalOpener extends HTMLElement {
  /**
   * Initialize the component and set up required properties
   */
  constructor() {
    super();
    this.opener = this.querySelector(".custom-product-card__cta");
  }

  /**
   * Set up event listeners when the element is added to the DOM
   * Attaches click event to the opener button to display the modal
   */
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

  /**
   * Clean up event listeners when the element is removed from the DOM
   * Removes the click event handler to prevent memory leaks
   */
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

/**
 * Register the custom element with the browser
 */
customElements.define("custom-modal-opener", CustomModalOpener);
