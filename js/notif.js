/*mengambil data dan mengambil jumlah data pada cart*/

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let notif = document.querySelector('.notif')
let isi = document.createElement('p')
isi.textContent = cart.length
notif.appendChild(isi)