const store = window.DAB_STORE;
const productPage = document.querySelector("#product-page");
const isLocalCheckoutTest =
  ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
  new URLSearchParams(window.location.search).has("checkout");

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element && value) element.textContent = value;
}

function setCheckout(checkoutButton, checkoutUrl) {
  checkoutButton.removeAttribute("href");
  checkoutButton.setAttribute("aria-disabled", "true");

  if (!checkoutUrl?.trim()) return;

  try {
    const url = new URL(checkoutUrl);
    if (url.protocol === "https:") {
      checkoutButton.href = url.href;
      checkoutButton.removeAttribute("aria-disabled");
    }
  } catch (error) {
    // Keep checkout disabled until a valid HTTPS link is configured.
  }
}

function renderVariants(product, checkoutButton, salesEnabled) {
  const picker = document.querySelector("#variant-picker");
  const options = document.querySelector("#variant-options");
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const configuratorSize = document.querySelector("#configurator-size");

  function setConfiguratorSize(variant) {
    if (configuratorSize && variant?.name) {
      configuratorSize.textContent = variant.name;
    }
  }

  if (!picker || !options || !variants.length) {
    setCheckout(checkoutButton, salesEnabled ? product.checkoutUrl : "");
    return;
  }

  variants.forEach((variant, index) => {
    const label = document.createElement("label");
    label.className = "variant-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "hold-type";
    input.value = variant.id;
    input.dataset.modelUrl = variant.modelUrl || "";
    input.checked = index === 0;

    const copy = document.createElement("span");
    copy.className = "variant-copy";

    const name = document.createElement("span");
    name.className = "variant-name";
    name.textContent = variant.name;

    const price = document.createElement("span");
    price.className = "variant-price";
    price.textContent = variant.price || product.price || "";

    const description = document.createElement("span");
    description.className = "variant-description";
    description.textContent = variant.description;

    copy.append(name, price, description);
    label.append(input, copy);
    options.append(label);

    input.addEventListener("change", () => {
      setConfiguratorSize(variant);
      setCheckout(checkoutButton, salesEnabled ? variant.checkoutUrl : "");
      window.dispatchEvent(new CustomEvent("dab:model-change", {
        detail: { modelUrl: variant.modelUrl }
      }));
    });
  });

  const initialVariant = variants[0];
  setConfiguratorSize(initialVariant);
  setCheckout(checkoutButton, salesEnabled ? initialVariant.checkoutUrl : "");
  picker.hidden = false;
}

if (store && productPage) {
  const product = store.product || {};

  setText("#product-name", product.name);
  setText("#product-eyebrow", product.eyebrow);
  setText("#product-description", product.description);
  setText("#product-availability", product.availability);
  setText("#product-shipping", product.shipping);
  setText("#product-returns", product.returns);

  const checkoutButton = document.querySelector("#checkout-button");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", (event) => {
      if (checkoutButton.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
      }
    });
    renderVariants(product, checkoutButton, store.enabled || isLocalCheckoutTest);
  }

  productPage.hidden = false;
  requestAnimationFrame(() => import("/assets/js/model-viewer.js?v=20260717-5"));
}
