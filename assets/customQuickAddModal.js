/**
 * CustomQuickAddModal - Web component for product quick add functionality
 * Handles variant selection, modal display, and add to cart functionality
 * @extends HTMLElement
 */
class CustomQuickAddModal extends HTMLElement {
  /**
   * Initialize the component and set up required properties
   */
  constructor() {
    super();
    // DOM elements
    this.closeButton = this.querySelector(".custom-quick-add-modal__close");
    this.productVariants = this.dataset.variants ? JSON.parse(this.dataset.variants) : [];
    this.selectRadioOpener = this.querySelector(".custom-quick-add-modal__select-container");
    this.selectRadioElementsContainer = this.querySelector(".custom-quick-add-modal__select-options")
    this.selectSVG = this.querySelector(".custom-quick-add-modal__select-container svg")
    this.dropdownContainer = this.querySelector(".custom-quick-add-modal__select-container");
    this.activeDropdown = this.querySelector(".custom-quick-add-modal__select-container p");
    
    // State tracking
    this.variantAutoSelect = this.dataset.variantAutofill === "true";
    this.selectedVariants = [];
    this.currentVariant = null;
  }

  /**
   * Set up event listeners when the element is added to the DOM
   * Initializes color variants and default selections
   */
  connectedCallback() {
    this.closeButton.addEventListener("click", () => this.closeWithOverlay());
    this.selectRadioOpener.addEventListener("click", () => this.toggleSelectOptions());
    this.addEventListener('change', this.changeVariant.bind(this));
    document
      .querySelector(".custom-modal-overlay")
      .addEventListener("click", () => this.closeWithOverlay());
    document.addEventListener("click", (event) => {
      event.target.closest(".custom-quick-add-modal__select-container") || this.closeSelectOptions();
    })
    this.showColorVariant();
    this.initializeSelectedVariants();
  }

  /**
   * Clean up event listeners when the element is removed from the DOM
   */
  disconnectedCallback() {
    this.closeButton.removeEventListener("click", () => this.closeWithOverlay());
    this.selectRadioOpener.removeEventListener("click", () => this.toggleSelectOptions());
    this.removeEventListener('change', this.changeVariant.bind(this));
    document
      .querySelector(".custom-modal-overlay")
      .removeEventListener("click", () => this.closeWithOverlay());
    document.removeEventListener("click", (event) => {
      event.target.closest(".custom-quick-add-modal__select-container") || this.closeSelectOptions();
    })
  }

  /**
   * Opens the modal and prevents body scrolling
   * @param {HTMLElement} modal - The modal element to open
   */
  openModal(modal) {
    modal.classList.add("is-open");
    document.querySelector(".custom-modal-overlay").classList.add("is-open");
    document.body.classList.add("overflow-hidden");
  }

  /**
   * Closes the modal and restores body scrolling
   */
  closeModal() {
    const { type } = window.cart;
    this.classList.remove("is-open");
    document.querySelector(".custom-modal-overlay").classList.remove("is-open");
    type !== "drawer" && document.body.classList.remove("overflow-hidden");
    !this.variantAutoSelect && this.resetVariantSelection();
  }

  /**
   * only Closes the modal when clicking on the overlay
   */
  closeWithOverlay() {
    this.classList.remove("is-open");
    document.querySelector(".custom-modal-overlay").classList.remove("is-open");
    document.body.classList.remove("overflow-hidden")
    !this.variantAutoSelect && this.resetVariantSelection();
  }

  /**
   * Toggles the visibility of the size dropdown options
   * Rotates the dropdown arrow accordingly
   */
  toggleSelectOptions(){
    this.selectRadioElementsContainer.classList.toggle("is-open");
    if (this.selectRadioElementsContainer.classList.contains("is-open")) {
      this.rotateForwardSVG();
    } else {
      this.rotateBackwardSVG();
    }
  }

  /**
   * Closes the size dropdown options
   * Rotates the dropdown arrow back to its original position
   */
  closeSelectOptions(){
    this.selectRadioElementsContainer.classList.remove("is-open");
    this.rotateBackwardSVG();
  }

  /**
   * Sets the background color for color swatches based on variant colors
   * Reads color data from data-color-variants attribute
   */
  showColorVariant() {
    const colorVariants = JSON.parse(this.dataset.colorVariants);
    const colorSwatchElements = this.querySelectorAll(".custom-quick-add-modal__option-color-code");
    if (!colorVariants || !colorSwatchElements) return
    colorSwatchElements.forEach((colorSwatch, idx) => {
      colorSwatch.style.backgroundColor = colorVariants[idx].color});
  }

  /**
   * Sets up initial variant selections when the modal is opened
   */
  initializeSelectedVariants() {
    this.updateSelectedVariants();
    // Select the first radio in each option group (color, size)
    this.variantAutoSelect && this.resetVariantSelection(
      [".custom-quick-add-modal__option-values input[type='radio']",
       ".custom-quick-add-modal__select-options input[type='radio']"
      ]
    );

  }

  /**
   * Handles variant selection changes when a radio button is clicked
   * @param {Event} event - The change event from the radio button
   */
  changeVariant(event) {
    const selectedRadio = event.target;
    if (selectedRadio.name && selectedRadio.name.startsWith("option-")) {
      if (!this.currentVariant && selectedRadio.classList.contains("select__option-value")) {
        this.activeDropdown.textContent = selectedRadio.value;
      }
      this.updateSelectedVariants();
    }
  }

  /**
   * Updates the selected variants array based on currently checked radio buttons
   * Triggers an update to the current variant
   */
  updateSelectedVariants() {
    this.selectedVariants = [];
    this.currentVariant = null;
    this.querySelectorAll("input[name^='option-']:checked").forEach((radio) => {
        this.selectedVariants.push(radio.value);
    });
    this.setCurrentVariant();
  }

  /**
   * Sets the current variant based on selected options
   * Updates the hidden input value with the variant ID
   * Updates the displayed text in the size dropdown
   */
  setCurrentVariant() {
    this.currentVariant = this.productVariants.find(variant => variant.options.every((option, idx) => this.selectedVariants[idx] === option));

    if (!this.currentVariant) {
      this.disableButton();
    }
    else {
      this.enableButton();
      this.setCurrentVariantId();
      this.showSizeLabel();
    }
  }

  /**
   * Resets the variant selection to its initial state
   * @param {[string]} classes - Array of class names to reset radio buttons state
   */
  resetVariantSelection(classes) {
    if (this.variantAutoSelect && classes) {
      setTimeout(() => {
        classes.forEach((className) => {
          this.querySelectorAll(className).forEach((radio, idx) => {
            if (idx === 0) {
              radio.checked = true;
            } else {
              radio.checked = false;
            }
          });
        })
      }, 100);
    }
    else {
    this.selectedVariants = [];
    this.currentVariant = null;
    this.querySelectorAll("input[name^='option-']").forEach((radio) => {
        radio.checked = false;
    });
    this.activeDropdown.textContent = window.sizeLabel.text;
    this.querySelector("product-form .custom-quick-add-modal__variant-value-input").value = "";
    this.disableButton();
   }
  }

  /**
   * Sets the current variant ID in the hidden input
   */
  setCurrentVariantId() {
    this.querySelector("product-form .custom-quick-add-modal__variant-value-input").value = this.currentVariant.id;
  }

  /**
   * Shows the size label in the dropdown
   */
  showSizeLabel() {
    this.activeDropdown.textContent = this.currentVariant.option2 || `${window.sizeLabel.text}`;
  }

  /**
   * Rotates the dropdown arrow forward (pointing up) with animation
   */
  rotateForwardSVG() {
    this.selectSVG.style.animation = "rotateForward 0.5s forwards";
  }
  
  /**
   * Rotates the dropdown arrow backward (pointing down) with animation
   */
  rotateBackwardSVG() {
    this.selectSVG.style.animation = "rotateBackward 0.5s forwards";
  }

  /**
   * Disables the submit button in the product form
   * Used when no valid variant is selected
   */
  disableButton() {
    this.querySelector("product-form button[type='submit']").disabled = true;
  }

  /**
   * Enables the submit button in the product form
   * Used when a valid variant is selected
   */
  enableButton() {
    this.querySelector("product-form button[type='submit']").disabled = false;
  }
}

customElements.define("custom-quick-add-modal", CustomQuickAddModal);
