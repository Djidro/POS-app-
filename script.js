// Basic POS app data
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let shiftOpen = JSON.parse(localStorage.getItem('shiftOpen')) || false;
let shiftSales = JSON.parse(localStorage.getItem('shiftSales')) || [];
let shiftExpenses = JSON.parse(localStorage.getItem('shiftExpenses')) || [];

const productList = document.getElementById('product-list');
const cartList = document.getElementById('cart-list');
const expenseList = document.getElementById('expense-list');
const shiftStatus = document.getElementById('shift-status');
const shiftSummary = document.getElementById('shift-summary');

function showTab(tab) {
  document.querySelectorAll('main section').forEach(s => s.style.display = 'none');
  document.getElementById(tab).style.display = 'block';
  if (tab === 'products') renderProducts();
  if (tab === 'cart') renderCart();
  if (tab === 'expenses') renderExpenses();
  if (tab === 'shifts') renderShift();
}

function renderProducts() {
  productList.innerHTML = '';
  products.forEach((p, i) => {
    productList.innerHTML += `<div>
      ${p.name} - RWF ${p.price} - Stock: ${p.stock}
      <button onclick="addToCart(${i})" ${p.stock === 0 ? 'disabled' : ''}>Add to Cart</button>
    </div>`;
  });
}

function addToCart(i) {
  if (!shiftOpen) return alert('Open a shift first!');
  let p = products[i];
  if (p.stock === 0) return alert('Out of stock!');
  let cartItem = cart.find(c => c.name === p.name);
  if (cartItem) {
    cartItem.qty++;
  } else {
    cart.push({name: p.name, price: p.price, qty: 1});
  }
  products[i].stock--;
  saveData();
  renderProducts();
  renderCart();
}

function renderCart() {
  cartList.innerHTML = '';
  if (cart.length === 0) {
    cartList.textContent = 'Cart is empty';
    return;
  }
  cart.forEach((c, i) => {
    cartList.innerHTML += `<div>${c.name} x${c.qty} = RWF ${c.price * c.qty}
      <button onclick="removeFromCart(${i})">Remove</button>
    </div>`;
  });
}

function removeFromCart(i) {
  let item = cart[i];
  let productIndex = products.findIndex(p => p.name === item.name);
  if (productIndex !== -1) {
    products[productIndex].stock += item.qty;
  }
  cart.splice(i, 1);
  saveData();
  renderProducts();
  renderCart();
}

function checkout(method) {
  if (!shiftOpen) return alert('Open a shift first!');
  if (cart.length === 0) return alert('Cart is empty!');
  cart.forEach(item => {
    shiftSales.push({...item, method});
  });
  cart = [];
  saveData();
  renderCart();
  renderProducts();
  document.getElementById('payment-msg').textContent = `Paid with ${method.toUpperCase()} successfully!`;
}

function clearCart() {
  cart = [];
  saveData();
  renderCart();
  document.getElementById('payment-msg').textContent = '';
}

document.getElementById('add-product-form').addEventListener('submit', e => {
  e.preventDefault();
  let name = e.target['product-name'].value.trim();
  let price = Number(e.target['product-price'].value);
  let stock = Number(e.target['product-stock'].value);
  if (name && price >= 0 && stock >= 0) {
    products.push({name, price, stock});
    saveData();
    e.target.reset();
    renderProducts();
  }
});

document.getElementById('add-expense-form').addEventListener('submit', e => {
  e.preventDefault();
  if (!shiftOpen) return alert('Open a shift first!');
  let name = e.target['expense-name'].value.trim();
  let price = Number(e.target['expense-price'].value);
  if (name && price >= 0) {
    expenses.push({name, price});
    shiftExpenses.push({name, price});
    saveData();
    e.target.reset();
    renderExpenses();
  }
});

function renderExpenses() {
  expenseList.innerHTML = '';
  if (expenses.length === 0) {
    expenseList.textContent = 'No expenses added';
    return;
  }
  expenses.forEach((ex, i) => {
    expenseList.innerHTML += `<div>${ex.name} - RWF ${ex.price}</div>`;
  });
}

function openShift() {
  if (shiftOpen) return alert('Shift already open!');
  shiftOpen = true;
  shiftSales = [];
  shiftExpenses = [];
  expenses = [];
  saveData();
  renderShift();
  alert('Shift opened');
}

function closeShift() {
  if (!shiftOpen) return alert('No open shift to close!');
  shiftOpen = false;
  renderShiftSummary();
  saveData();
  alert('Shift closed');
}

function renderShift() {
  shiftStatus.textContent = shiftOpen ? 'Shift is OPEN' : 'Shift is CLOSED';
  shiftSummary.innerHTML = '';
}

function renderShiftSummary() {
  let totalCash = 0;
  let totalMoMo = 0;
  shiftSales.forEach(sale => {
    if (sale.method === 'cash') totalCash += sale.price * sale.qty;
    else if (sale.method === 'momo') totalMoMo += sale.price * sale.qty;
  });
  let totalExpenses = shiftExpenses.reduce((acc, e) => acc + e.price, 0);

  shiftSummary.innerHTML = `
    <h3>Shift Summary</h3>
    <p>Total Cash Sales: RWF ${totalCash}</p>
    <p>Total MoMo Sales: RWF ${totalMoMo}</p>
    <p>Total Expenses: RWF ${totalExpenses}</p>
    <p><strong>Grand Total: RWF ${totalCash + totalMoMo - totalExpenses}</strong></p>
  `;
}

function saveData() {
  localStorage.setItem('products', JSON.stringify(products));
  localStorage.setItem('cart', JSON.stringify(cart));
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('shiftOpen', JSON.stringify(shiftOpen));
  localStorage.setItem('shiftSales', JSON.stringify(shiftSales));
  localStorage.setItem('shiftExpenses', JSON.stringify(shiftExpenses));
}

window.onload = () => {
  renderProducts();
  renderCart();
  renderExpenses();
  renderShift();
};
