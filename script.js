const productCards = document.querySelectorAll(".product-card");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");

const orderModal = document.getElementById("orderModal");
const orderClose = document.getElementById("orderClose");
const orderProductName = document.getElementById("orderProductName");
const orderProductPrice = document.getElementById("orderProductPrice");
const orderRecapName = document.getElementById("orderRecapName");
const orderRecapPrice = document.getElementById("orderRecapPrice");
const orderProductImage = document.getElementById("orderProductImage");

const selectedProduct = document.getElementById("selectedProduct");
const selectedPrice = document.getElementById("selectedPrice");
const selectedStripeUrlInput = document.getElementById("selectedStripeUrl");
const orderForm = document.getElementById("orderForm");

const nicknameInput = document.getElementById("nickname");
const nicknameCount = document.getElementById("nicknameCount");
const backNumberInput = document.getElementById("backNumber");
const postalCodeInput = document.getElementById("postalCode");

const confirmationSection = document.getElementById("confirmationSection");
const confirmationProduct = document.getElementById("confirmationProduct");

const cartFab = document.getElementById("cartFab");
const cartDrawer = document.getElementById("cartDrawer");
const cartClose = document.getElementById("cartClose");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const cartCheckoutButton = document.getElementById("cartCheckoutButton");

let selectedStripeUrl = "";
let cart = [];

function parsePrice(priceString) {
  return Number(String(priceString).replace("€", "").replace(/\s/g, "").replace(",", "."));
}

function formatPrice(value) {
  return `${value.toFixed(2).replace(".", ",")}€`;
}

function getItemKey(product) {
  return product.name;
}

function addToCart(product) {
  const key = getItemKey(product);
  const existing = cart.find((item) => item.key === key);

  if (existing) {
    existing.quantity += 1;
    existing.image = product.image;
  } else {
    cart.push({
      key,
      name: product.name,
      price: product.price,
      priceValue: parsePrice(product.price),
      stripeUrl: product.stripeUrl,
      image: product.image,
      quantity: 1
    });
  }

  renderCart();
}

function changeQuantity(key, delta) {
  const item = cart.find((entry) => entry.key === key);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter((entry) => entry.key !== key);
  }

  renderCart();
}

function removeFromCart(key) {
  cart = cart.filter((entry) => entry.key !== key);
  renderCart();
}

function renderCart() {
  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Ton panier est vide.</p>';
    cartTotal.textContent = "0,00€";
    cartCount.textContent = "0";
    cartCheckoutButton.disabled = true;
    return;
  }

  let total = 0;

  cartItems.innerHTML = cart.map((item) => {
    total += item.priceValue * item.quantity;

    return `
      <div class="cart-item">
        <img class="cart-item-image" src="${item.image}" alt="${item.name}">
        <div>
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${item.price}</div>
          <div class="cart-item-actions">
            <div class="cart-qty-controls">
              <button class="cart-qty-btn" type="button" data-action="decrease" data-key="${item.key}">−</button>
              <span class="cart-qty-value">${item.quantity}</span>
              <button class="cart-qty-btn" type="button" data-action="increase" data-key="${item.key}">+</button>
            </div>
            <button class="cart-remove-btn" type="button" data-action="remove" data-key="${item.key}">Supprimer</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  cartTotal.textContent = formatPrice(total);
  cartCount.textContent = String(cart.reduce((sum, item) => sum + item.quantity, 0));
  cartCheckoutButton.disabled = false;
}

function openCart() {
  if (!cartDrawer || !cartOverlay) return;
  cartDrawer.classList.add("active");
  cartOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  if (!cartDrawer || !cartOverlay) return;
  cartDrawer.classList.remove("active");
  cartOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

/* ─── INTERSECTION OBSERVER ─── */
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -40px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

document.querySelectorAll(".section-title").forEach((el) => observer.observe(el));

productCards.forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
  observer.observe(card);
});

/* ─── PRODUCT SLIDER LOGIC ─── */
productCards.forEach((card) => {
  const images = card.querySelectorAll(".main-product-image");
  const badge = card.querySelector(".product-badges span");
  const zoomButton = card.querySelector(".zoom-button");
  const orderButton = card.querySelector(".product-button");
  const leftArrow = card.querySelector(".slider-arrow-left");
  const rightArrow = card.querySelector(".slider-arrow-right");
  const slider = card.querySelector(".product-image-slider");

  let currentIndex = 0;
  let startX = 0;
  let startY = 0;
  let isPointerDown = false;

  let wheelLocked = false;
  let wheelDeltaX = 0;

  const labels = ["Face", "Dos"];

  const updateSlider = () => {
    images.forEach((img, index) => {
      img.classList.toggle("active", index === currentIndex);
    });
    badge.textContent = labels[currentIndex] || "";
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateSlider();
  };

  const showPrev = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateSlider();
  };

  const getCurrentImageSrc = () => images[currentIndex].src;

  leftArrow.addEventListener("click", (e) => {
    e.stopPropagation();
    showPrev();
  });

  rightArrow.addEventListener("click", (e) => {
    e.stopPropagation();
    showNext();
  });

  slider.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  }, { passive: true });

  slider.addEventListener("touchend", (e) => {
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - startX;
    const diffY = touch.clientY - startY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      diffX < 0 ? showNext() : showPrev();
    }
  });

  slider.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      isPointerDown = true;
      startX = e.clientX;
      startY = e.clientY;
    }
  });

  slider.addEventListener("pointerup", (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;

    const diffX = e.clientX - startX;
    const diffY = e.clientY - startY;

    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      diffX < 0 ? showNext() : showPrev();
    }
  });

  slider.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

    e.preventDefault();
    if (wheelLocked) return;

    wheelDeltaX += e.deltaX;

    if (Math.abs(wheelDeltaX) > 300) {
      wheelDeltaX > 0 ? showNext() : showPrev();
      wheelLocked = true;
      wheelDeltaX = 0;
      setTimeout(() => {
        wheelLocked = false;
      }, 450);
    }

    clearTimeout(slider._wheelResetTimer);
    slider._wheelResetTimer = setTimeout(() => {
      wheelDeltaX = 0;
    }, 120);
  }, { passive: false });

  const openLightbox = () => {
    lightboxImage.src = getCurrentImageSrc();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  images.forEach((img) => img.addEventListener("click", openLightbox));
  zoomButton.addEventListener("click", openLightbox);

  orderButton.addEventListener("click", () => {
    addToCart({
      name: card.dataset.productName,
      price: card.dataset.productPrice,
      stripeUrl: card.dataset.stripeUrl,
      image: getCurrentImageSrc()
    });
    openCart();
  });

  updateSlider();
});

cartFab?.addEventListener("click", openCart);
cartClose?.addEventListener("click", closeCart);
cartOverlay?.addEventListener("click", closeCart);

cartItems?.addEventListener("click", (e) => {
  const button = e.target.closest("button[data-action]");
  if (!button) return;

  const { action, key } = button.dataset;

  if (action === "increase") changeQuantity(key, 1);
  if (action === "decrease") changeQuantity(key, -1);
  if (action === "remove") removeFromCart(key);
});

cartCheckoutButton?.addEventListener("click", async () => {
  if (!cart.length) return;

  try {
    const response = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cart })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de la création du paiement.");
    }

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Lien Stripe introuvable.");
    }
  } catch (error) {
    console.error(error);
    alert("Impossible de lancer le paiement.");
  }
});

renderCart();

/* ─── LIGHTBOX ─── */
lightboxClose.addEventListener("click", () => {
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
});

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }
});

/* ─── ORDER MODAL ─── */
orderClose.addEventListener("click", () => {
  orderModal.classList.remove("active");
  document.body.style.overflow = "";
});

orderModal.addEventListener("click", (e) => {
  if (e.target === orderModal) {
    orderModal.classList.remove("active");
    document.body.style.overflow = "";
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    lightbox.classList.remove("active");
    orderModal.classList.remove("active");
    closeCart();
    document.body.style.overflow = "";
  }
});

/* ─── FORM VALIDATION ─── */
nicknameInput.addEventListener("input", () => {
  if (nicknameInput.value.length > 12) {
    nicknameInput.value = nicknameInput.value.slice(0, 12);
  }
  nicknameCount.textContent = nicknameInput.value.length;
});

backNumberInput.addEventListener("input", () => {
  let value = backNumberInput.value.replace(/\D/g, "");

  if (value !== "") {
    let numericValue = parseInt(value, 10);
    if (numericValue > 99) numericValue = 99;
    backNumberInput.value = numericValue;
  } else {
    backNumberInput.value = "";
  }
});

postalCodeInput.addEventListener("input", () => {
  postalCodeInput.value = postalCodeInput.value.replace(/\D/g, "").slice(0, 5);
});

orderForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const backNumberValue = parseInt(backNumberInput.value, 10);

  if (isNaN(backNumberValue) || backNumberValue < 0 || backNumberValue > 99) {
    alert("Le numéro au dos doit être compris entre 0 et 99.");
    return;
  }

  if (postalCodeInput.value.length !== 5) {
    alert("Le code postal doit contenir 5 chiffres.");
    return;
  }

  if (!selectedStripeUrl) {
    alert("Aucun lien de paiement n'est associé à ce produit.");
    return;
  }

  window.location.href = selectedStripeUrl;
});

/* ─── SUCCESS PAGE ─── */
(function handleSuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const success = params.get("success");
  const product = params.get("product");

  if (success === "1" && confirmationSection) {
    confirmationSection.classList.remove("hidden");

    if (product && confirmationProduct) {
      confirmationProduct.textContent = `Produit : ${decodeURIComponent(product)}`;
    }

    setTimeout(() => {
      confirmationSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }
})();