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
  }

  /**
   * only Closes the modal when clicking on the overlay
   */
  closeWithOverlay() {
    this.classList.remove("is-open");
    document.querySelector(".custom-modal-overlay").classList.remove("is-open");
    document.body.classList.remove("overflow-hidden")
  }

  /**
   * Toggles the visibility of the size dropdown options
   * Rotates the dropdown arrow accordingly
   */
  toggleSelectOptions(){
    this.selectRadioElementsContainer.classList.toggle("is-open");
    if (this.selectRadioElementsContainer.classList.contains("is-open")) {
      this.rotateForwardSVG();
      this.activeDropdown.textContent = `${window.sizeLabel.text}`;
    } else {
      this.rotateBackwardSVG();
      this.showSizeLabel();
    }
  }

  /**
   * Closes the size dropdown options
   * Rotates the dropdown arrow back to its original position
   */
  closeSelectOptions(){
    this.selectRadioElementsContainer.classList.remove("is-open");
    this.rotateBackwardSVG();
    const selectOptions = this.querySelectorAll(".custom-quick-add-modal__select-options input[type='radio']:checked");
    selectOptions.length > 0 && this.showSizeLabel();
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
    setTimeout(() => {
      this.iniasilizeFirstVariantOptions();
    }, 100);
  }

  /**
   * Initializes the first selected variant option when the modal is opened
   */
  iniasilizeFirstVariantOptions() {
    //Resets the variant selection options
    this.resetVariantSelection(
      [".custom-quick-add-modal__option-values.color-option input[type='radio']",
       ".custom-quick-add-modal__select-options input[type='radio']",
       ".custom-quick-add-modal__option-values.custom-option input[type='radio']"
      ]
    );
    // Set the first variant as selected
    this.autoSelectFirstVariant();
  }

  /**
   * Automatically selects the first variant option when the modal is opened
   */
  autoSelectFirstVariant() {
    const colorRadios = this.querySelectorAll(".custom-quick-add-modal__option-values.color-option input[type='radio']");
    const selectRadios = this.querySelectorAll(".custom-quick-add-modal__select-options input[type='radio']");
    const customRadios = this.querySelectorAll(".custom-quick-add-modal__option-values.custom-option input[type='radio']");

    this.selectedVariants = [
      colorRadios.length > 0 ? colorRadios[0].value : null,
      selectRadios.length > 0 ? selectRadios[0].value : null,
      customRadios.length > 0 ? customRadios[0].value : null
    ];

    this.selectedVariants = this.selectedVariants.filter(itm => itm !== null);
    this.setCurrentVariant();
  }

  /**
   * Handles variant selection changes when a radio button is clicked
   * @param {Event} event - The change event from the radio button
   */
  changeVariant(event) {
    const selectedRadio = event.target;
    if (selectedRadio.name && selectedRadio.name.startsWith("option-")) {
      this.updateSelectedVariants();
    }
  }

  /**
   * Updates the selected variants array based on currently checked radio buttons
   * Autocompletes the selected variant options by matching variant in the this.productVariants
   * Triggers an update to the current variant
   */
  updateSelectedVariants() {
    this.selectedVariants = [];
    this.currentVariant = null;
    this.querySelectorAll("input[name^='option-']:checked").forEach((radio) => {
      this.selectedVariants.push(radio.value);
    });
    this.autoCompleteVariantOptions();
    this.setCurrentVariant();
    this.currentVariant && this.changePrice();
  }

  /**
   * Auto-completes the selected variant options by finding the matching variant in the this.productVariants based on the current selection
   */
  autoCompleteVariantOptions() {
    // Auto-complete selectedVariants if only one option is selected
    if (this.productVariants[0].options.length <= 3) {
      if (this.selectedVariants.length === 1) {
        // Find the first variant that includes the selected value
        const found = this.productVariants.find(variant => variant.options.includes(this.selectedVariants[0]));
        if (found) {
          this.selectedVariants = [...found.options];
        }
      }
    }

    // Auto-complete selectedVariants if two options are selected
    if (this.productVariants[0].options.length === 3) {
      if (this.selectedVariants.length === 2) {
        const found = this.productVariants.find(variant =>
          variant.options.includes(this.selectedVariants[0]) &&
          variant.options.includes(this.selectedVariants[1])
        );
        if (found) {
          this.selectedVariants = [...found.options];
        }
      }
    }
  }

  /**
   * Updates the displayed price in the modal
   */
  changePrice() {
    if (this.currentVariant) {
      const priceElement = this.querySelector(".custom-quick-add-modal__price");
      priceElement.textContent = `${Math.floor(this.currentVariant.price / 100).toFixed(2)} ${window.currency.symbol}`;
    }
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
      const selectOptions = this.querySelectorAll(".custom-quick-add-modal__select-options input[type='radio']:checked");
      selectOptions.length > 0 && this.showSizeLabel();
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
    this.activeDropdown.textContent = `${window.sizeLabel.text}`;
    this.clearCurrentVariantId();
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
   * Clears the current variant ID in the hidden input
   */
  clearCurrentVariantId() {
    this.querySelector("product-form .custom-quick-add-modal__variant-value-input").value = "";
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

/**
 * Register the custom element with the browser
 */
customElements.define("custom-quick-add-modal", CustomQuickAddModal);
