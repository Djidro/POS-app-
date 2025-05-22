// PIN login
const PIN = '9900', loginScreen = document.getElementById('login'), app = document.getElementById('app');
function login(){
  if(document.getElementById('pin').value===PIN){
    loginScreen.classList.add('hidden');
    app.classList.remove('hidden');
    loadAll();
  } else alert('Wrong PIN');
}
function logout(){ location.reload(); }

// Tab switching
document.querySelectorAll('.tabs button').forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    document.getElementById(b.dataset.tab).classList.add('active');
  };
});

// LocalStorage helpers
const ls={get:k=>JSON.parse(localStorage.getItem(k)||'[]'),set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};

// Data stores
let products=ls.get('products'), cart=ls.get('cart'),
    expenses=ls.get('expenses'), shifts=ls.get('shifts'),
    currentShift=ls.get('currentShift');

// Preload products if empty
if(!products.length){
  products=[{id:1,name:'Bread',price:1.5,img:''},{id:2,name:'Cake',price:3,img:''}];
  ls.set('products',products);
}

// Render functions
function renderProducts(){
  const grid=document.getElementById('product-grid'); grid.innerHTML='';
  products.forEach(p=>{
    const d=document.createElement('div');d.className='card';
    d.innerHTML=`<img src="${p.img||'https://via.placeholder.com/60'}"/><div>${p.name}</div><div>${p.price} RWF</div>`;
    d.onclick=()=>addToCart(p.id);
    grid.append(d);
  });
}
function renderCart(){
  const el=document.getElementById('cart-list'); el.innerHTML='';
  const grp=cart.reduce((a,i)=>{a[i.id]=(a[i.id]||0)+1;return a;},{});
  for(let id in grp){
    let p=products.find(x=>x.id==id);
    el.innerHTML+=`<div class="list-item">${p.name} x${grp[id]} = ${(p.price*grp[id]).toFixed(2)} RWF</div>`;
  }
}
function renderStock(){
  const el=document.getElementById('stock-list'); el.innerHTML='';
  products.forEach(p=>el.innerHTML+=`<div class="list-item">${p.name} - ${p.price} <button onclick="delStock(${p.id})">Del</button></div>`);
}
function renderExpenses(){
  const el=document.getElementById('exp-list'); el.innerHTML='';
  expenses.forEach((e,i)=>el.innerHTML+=`<div class="list-item">${e.name} = ${e.amount} <button onclick="delExp(${i})">Del</button></div>`);
}
function renderShifts(){
  const el=document.getElementById('shift-reports'); el.innerHTML='';
  shifts.forEach(s=>el.innerHTML+=`<div class="list-item">${s.opened}→${s.closed} | Sales:${s.total} | Exp:${s.exp}</div>`);
}

// Actions
function addToCart(id){
  if(!currentShift) return alert('Open shift first');
  cart.push({id}); ls.set('cart',cart); renderCart();
}
function checkout(m){
  if(!cart.length) return alert('Cart empty');
  let total=cart.reduce((a,i)=>a+products.find(p=>p.id==i.id).price,0);
  currentShift.total=(currentShift.total||0)+total;
  ls.set('currentShift',currentShift);
  cart=[]; ls.set('cart',cart); renderCart();
  alert(`Paid ${total.toFixed(2)} via ${m}`);
}
document.getElementById('stock-form').onsubmit=e=>{
  e.preventDefault();
  let id=Date.now(),name=e.target['stock-name'].value,price+0=+e.target['stock-price'].value;
  let file=e.target['stock-image'].files[0];
  let r=new FileReader();
  r.onload=()=>{products.push({id,name,price:r.result});ls.set('products',products);renderProducts();renderStock();};
  file?r.readAsDataURL(file):r.onload();
};
function delStock(id){
  products=products.filter(p=>p.id!==id);ls.set('products',products);renderProducts();renderStock();
}
document.getElementById('exp-form').onsubmit=e=>{
  e.preventDefault();
  if(!currentShift) return alert('Open shift first');
  let n=e.target['exp-name'].value,a=+e.target['exp-amt'].value;
  expenses.push({name:n,amount:a}); currentShift.exp=(currentShift.exp||0)+a;
  ls.set('expenses',expenses); ls.set('currentShift',currentShift); renderExpenses();
};
function delExp(i){expenses.splice(i,1);ls.set('expenses',expenses);renderExpenses();}
function openShift(){
  if(currentShift) return alert('Already open');
  currentShift={opened:new Date().toLocaleString(),total:0,exp:0};
  ls.set('currentShift',currentShift);renderShifts();alert('Shift opened');
}
function closeShift(){
  if(!currentShift) return alert('None open');
  currentShift.closed=new Date().toLocaleString();
  shifts.push(currentShift);ls.set('shifts',shifts);currentShift=null;ls.set('currentShift',currentShift);
  renderShifts();alert('Shift closed');
}

// Save & Load
function loadAll(){
  renderProducts();renderCart();renderStock();renderExpenses();renderShifts();
}
