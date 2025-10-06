//=========================== calculation =========================================
let cart = {
    total: 0,
    products: {}
};

document.querySelectorAll(".product").forEach(product => {
    const addBtn = product.querySelector(".addBtn");
    const minusBtn = product.querySelector(".minusBtn");
    const msg = document.getElementById("cartTotalMsg");
    const quantityEl = product.querySelector(".quantity");
    let quantity = parseInt(quantityEl.innerHTML);

    addBtn.addEventListener('click', () => {
        quantity++;
        quantityEl.innerHTML = quantity;
        console.log("Product", product.dataset.productId, "Qty", quantity);

        // Update cart
        const productId = product.dataset.productId;
        const item = {
            productId: productId,
            name: product.dataset.productName,
            Qty: quantity,
            price: parseFloat(product.dataset.productPrice)
        };

        cart.products[productId] = item;

        // Update cart total
        cart.total = Object.values(cart.products).reduce((sum, p) => sum + p.Qty * p.price, 0);

        if (cart.total) {
            msg.innerHTML = `Amount is R${cart.total}`;
            msg.classList.remove("hidden");
        }
        else {
            msg.classList.add("hidden");
        }

        console.log("Cart:", product.dataset.productName, cart);
    });

    minusBtn.addEventListener('click', () => {
        if (quantity > 0) quantity--;
        quantityEl.innerHTML = quantity;

        const productId = product.dataset.productId;
        if (quantity === 0) {
            delete cart.products[productId];
        } else {
            cart.products[productId].Qty = quantity;
        }

        cart.total = Object.values(cart.products).reduce((sum, p) => sum + p.Qty * p.price, 0);

        if (cart.total) {
            msg.innerHTML = `Amount is R${cart.total}`;
            msg.classList.remove("hidden");
        }
        else {
            msg.classList.add("hidden");
        }

         console.log("Cart:", cart.total);
    });
});



//=========================== Delivery/Collect Toggle ================================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".type").forEach(type => {
    const deliveryBtn = type.querySelector(".deliveryBtn");
    const collectBtn = type.querySelector(".collectBtn");
    const orderTypeMsg = type.querySelector(".orderTypeMsg");

    if (!deliveryBtn || !collectBtn || !orderTypeMsg) return; // skip if missing

    function setActiveButton(activeBtn) {
      [deliveryBtn, collectBtn].forEach(btn => {
        btn.classList.remove("bg-black", "text-white");
        btn.classList.add("bg-white", "text-black");
      });

      activeBtn.classList.add("bg-black", "text-white");
      activeBtn.classList.remove("bg-white", "text-black");
    }

    deliveryBtn.addEventListener("click", () => {
      setActiveButton(deliveryBtn);
      orderTypeMsg.innerHTML = "When do you want your order to be delivered?";
    });

    collectBtn.addEventListener("click", () => {
      setActiveButton(collectBtn);
      orderTypeMsg.innerHTML = "When do you want to collect your order?";
    });
  });
});





//=========================== Mobile menu toggle =====================================
const btn = document.getElementById('mobile-menu-button');
const menu = document.getElementById('mobile-menu');



//=========================== Cart Modal =============================================
const cartBtn = document.getElementById("cartBtn");
const cartModal = document.getElementById("cartModal");

cartBtn.addEventListener("click", () => {
  cartModal.classList.toggle("hidden");
  cartModal.classList.toggle("translate-y-[-20px]");
});

//Fetch cart from Flask
function loadCart() {
    fetch("/get_cart")
    .then(res => res.json())
    .then(cart => {
        const cartItemsDiv = document.getElementById("cartItems");
        const cartTotalEl = document.getElementById("cartTotalModal");
        const cartCountEl = document.getElementById("cartCount");

        cartItemsDiv.innerHTML = "";
        let count = 0;

        cart.items.forEach(item => {
            count += item.qty;

            const itemDiv = document.createElement("div");
            itemDiv.className = "flex justify-between items-center bg-gray-100 p-2 rounded-lg";

            itemDiv.innerHTML = `
                <div>
                    <p class="font-medium text-gray-800">${item.name}</p>
                    <p class="text-sm text-gray-600">R${item.price} x ${item.qty}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="updateQty(${item.id}, ${item.qty - 1})" class="px-2 bg-red-500 text-white rounded">-</button>
                    <span>${item.qty}</span>
                    <button onclick="updateQty(${item.id}, ${item.qty + 1})" class="px-2 bg-green-500 text-white rounded">+</button>
                </div>
            `;

            cartItemsDiv.appendChild(itemDiv);
        });

        //update total and count AFTER loop
        cartTotalEl.innerText = `R${cart.total}`;
        cartCountEl.innerText = count;
    });
}


// Update Flask
function updateQty(productId, qty) {
  fetch("/update_cart", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ productId, qty })
  })
  .then(res => res.json())
  .then(() => loadCart());
}

// Load cart on page load
window.onload = loadCart;


//=========================== Modal Cards ============================================
const openModalOrder = document.getElementById('openModalOrder');
const openModal = document.getElementById('openModal');

const closeModalOrder = document.getElementById('closeModalOrder');
const closeModal = document.getElementById('closeModal');

const popupModalOrder = document.getElementById('popupModalOrder');
const popupModal = document.getElementById('popupModal');


// Open modal
openModalOrder.addEventListener('click', (e) => {
    e.preventDefault();
    popupModalOrder.classList.remove('pointer-events-none');
    popupModalOrder.classList.add('opacity-100');
    document.body.style.overflow = 'hidden'; // lock background scroll
});
openModal.addEventListener('click', (e) => {
    e.preventDefault();
    popupModal.classList.remove('pointer-events-none');
    popupModal.classList.add('opacity-100');
    document.body.style.overflow = 'hidden'; // lock background scroll
});

// Close modal
closeModalOrder.addEventListener('click', () => {
    popupModalOrder.classList.add('pointer-events-none');
    popupModalOrder.classList.remove('opacity-100');
    document.body.style.overflow = ''; // unlock scroll
});
closeModal.addEventListener('click', () => {
    popupModal.classList.add('pointer-events-none');
    popupModal.classList.remove('opacity-100');
    document.body.style.overflow = ''; // unlock scroll
});

// Close modal when clicking outside the content
popupModalOrder.addEventListener('click', (e) => {
    if (e.target === popupModalOrder) {
        popupModalOrder.classList.add('pointer-events-none');
        popupModalOrder.classList.remove('opacity-100');
        document.body.style.overflow = '';
    }
});
popupModal.addEventListener('click', (e) => {
    if (e.target === popupModal) {
        popupModal.classList.add('pointer-events-none');
        popupModal.classList.remove('opacity-100');
        document.body.style.overflow = '';
    }
});

