const products = [
  {
    id: 1,
    name: "Shadow Katana",
    price: 18999,
    image: "https://images.unsplash.com/photo-1671015522549-e7aa41ded44f?q=80&w=800&auto=format&fit=crop",
    description: "Hand-forged black-steel blade balanced for swift, silent strikes."
  },
  {
    id: 2,
    name: "Samurai Mask",
    price: 12499,
    image: "https://images.unsplash.com/photo-1765118477495-212b9e5aaade?q=80&w=800&auto=format&fit=crop",
    description: "Battle-forged face guard with lacquered finish and intimidating detail."
  },
  {
    id: 3,
    name: "Twin Ninja Daggers",
    price: 6999,
    image: "https://images.unsplash.com/photo-1702287721762-a0b2dc0f0e70?q=80&w=800&auto=format&fit=crop",
    description: "Matched steel daggers built for close-range precision in tight spaces."
  },
  {
    id: 4,
    name: "Stealth Cloak",
    price: 9999,
    image: "https://images.unsplash.com/photo-1679521088529-20ee515e597e?q=80&w=800&auto=format&fit=crop",
    description: "Matte-black cloak with layered weave to mute movement and blend in."
  },
  {
    id: 5,
    name: "Throwing Shurikens",
    price: 3499,
    image: "https://images.unsplash.com/photo-1622125366500-6d0a46599523?q=80&w=800&auto=format&fit=crop",
    description: "Set of razor-edged stars tuned for balance, speed, and control."
  }
];

function formatPrice(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function getCart() {
  const savedCart = localStorage.getItem("shadow-market-cart");
  return savedCart ? JSON.parse(savedCart) : [];
}

function saveCart(cartItems) {
  localStorage.setItem("shadow-market-cart", JSON.stringify(cartItems));
}

function addToCart(productId) {
  const cartItems = getCart();
  const matchedItem = cartItems.find((item) => item.id === productId);

  if (matchedItem) {
    matchedItem.quantity += 1;
  } else {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    cartItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCart(cartItems);
  updateCartCount();
}

function removeItem(productId) {
  const nextCart = getCart().filter((item) => item.id !== productId);
  saveCart(nextCart);
  renderCart();
  updateCartCount();
}

function updateCartCount() {
  const countElement = document.getElementById("cart-count");
  if (!countElement) return;

  const totalItems = getCart().reduce((sum, item) => sum + item.quantity, 0);
  countElement.textContent = totalItems;
}

function createProductCard(product) {
  return `
    <article class="product-card" data-tilt-card>
      <img src="${product.image}" alt="${product.name}">
      <div class="product-content">
        <div class="product-head">
          <h3>${product.name}</h3>
          <span class="price">${formatPrice(product.price)}</span>
        </div>
        <p>${product.description}</p>
        <button class="add-btn" data-product-id="${product.id}">Acquire</button>
      </div>
    </article>
  `;
}

function renderProducts() {
  const productGrid = document.getElementById("product-grid");
  if (!productGrid) return;

  productGrid.innerHTML = products.map(createProductCard).join("");
  initializeCardTilt();

  productGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".add-btn");
    if (!button) return;

    const productId = Number(button.dataset.productId);
    addToCart(productId);

    button.textContent = "Acquired";
    setTimeout(() => {
      button.textContent = "Acquire";
    }, 700);
  });
}

function initializeCardTilt() {
  const cards = document.querySelectorAll("[data-tilt-card]");

  cards.forEach((card) => {
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let frameId = null;

    const animateCard = () => {
      currentRotateX += (targetRotateX - currentRotateX) * 0.14;
      currentRotateY += (targetRotateY - currentRotateY) * 0.14;

      card.style.setProperty("--card-rotate-x", `${currentRotateX.toFixed(2)}deg`);
      card.style.setProperty("--card-rotate-y", `${currentRotateY.toFixed(2)}deg`);

      const settledX = Math.abs(targetRotateX - currentRotateX) < 0.02;
      const settledY = Math.abs(targetRotateY - currentRotateY) < 0.02;
      if (!settledX || !settledY) {
        frameId = requestAnimationFrame(animateCard);
      } else {
        frameId = null;
      }
    };

    const requestTiltFrame = () => {
      if (!frameId) {
        frameId = requestAnimationFrame(animateCard);
      }
    };

    card.addEventListener("mousemove", (event) => {
      const bounds = card.getBoundingClientRect();
      const offsetX = event.clientX - bounds.left;
      const offsetY = event.clientY - bounds.top;

      targetRotateY = ((offsetX / bounds.width) - 0.5) * 7;
      targetRotateX = (0.5 - (offsetY / bounds.height)) * 7;

      card.style.setProperty("--card-mouse-x", `${((offsetX / bounds.width) * 100).toFixed(2)}%`);
      card.style.setProperty("--card-mouse-y", `${((offsetY / bounds.height) * 100).toFixed(2)}%`);

      requestTiltFrame();
    });

    card.addEventListener("mouseleave", () => {
      targetRotateX = 0;
      targetRotateY = 0;
      card.style.setProperty("--card-mouse-x", "50%");
      card.style.setProperty("--card-mouse-y", "50%");
      requestTiltFrame();
    });
  });
}

function createCartRow(item) {
  const itemTotal = item.price * item.quantity;

  return `
    <div class="cart-item">
      <span class="cart-item-name">${item.name}</span>
      <span class="cart-cell">${formatPrice(item.price)}</span>
      <span class="cart-cell">Qty: ${item.quantity}</span>
      <span class="cart-cell">${formatPrice(itemTotal)}</span>
      <button class="remove-btn" data-remove-id="${item.id}">Remove</button>
    </div>
  `;
}

function renderCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalElement = document.getElementById("cart-total");
  if (!cartItemsContainer || !cartTotalElement) return;

  const cartItems = getCart();

  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = `<div class="empty-cart">Your inventory is empty.</div>`;
    cartTotalElement.textContent = formatPrice(0);
    return;
  }

  cartItemsContainer.innerHTML = cartItems.map(createCartRow).join("");

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalElement.textContent = formatPrice(total);

  cartItemsContainer.onclick = (event) => {
    const button = event.target.closest(".remove-btn");
    if (!button) return;
    removeItem(Number(button.dataset.removeId));
  };
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderCart();
  updateCartCount();
});
