let api = "https://api-sepatu-six.vercel.app/api/sepatu"

// Ambil data sepatu dari API
fetch(api)
    .then(response => {
        // Cek apakah response gagal (misal 404, 500, dll)
        if (!response.ok) {
            throw new Error("HTTP Error: " + response.status);
        }
        return response.json();
    })
    .then(data => {
        // Ambil daftar produk yang barusan di-checkout
        let co = JSON.parse(localStorage.getItem("co")) || [];
        // Ambil data pengiriman (nama, WA, email, alamat) yang tadi diisi user
        let user = JSON.parse(localStorage.getItem("dataUser")) || [];
        let bungkus = document.querySelector('.bungkus-card')
        let subtotal = 0
        let ongkir = 15000

        // Cocokkan tiap produk hasil checkout dengan data dari API, lalu tampilkan ringkasannya
        data.forEach(produk => {
            co.forEach(item => {
                if (item.id == produk.id) {

                    // Buat container card untuk 1 produk dalam ringkasan pesanan
                    let card = document.createElement('div')
                    card.classList.add('card-produk')
                    bungkus.appendChild(card)

                    // Tampilkan gambar produk
                    let pic = document.createElement('div')
                    pic.classList.add('pic')
                    let foto = document.createElement('img')
                    card.appendChild(pic)
                    pic.appendChild(foto)
                    foto.src = "https://api-sepatu-six.vercel.app/" + produk.foto;

                    // Container informasi produk (merk, nama, ukuran, qty)
                    let info = document.createElement('div')
                    info.classList.add('info')
                    card.appendChild(info)


                    // Tampilkan merk produk
                    let merk = document.createElement('p')
                    merk.classList.add('merk')
                    merk.textContent = produk.merk
                    info.appendChild(merk)

                    // Tampilkan nama produk
                    let nama = document.createElement('p')
                    nama.classList.add('nama')
                    nama.textContent = produk.nama
                    info.appendChild(nama)

                    // Tampilkan ukuran yang dipilih untuk produk ini
                    let ukuran = document.createElement('p')
                    ukuran.classList.add('ukuran')
                    ukuran.textContent = "Size : " + item.ukuran
                    info.appendChild(ukuran)

                    // Tampilkan jumlah (quantity) produk yang dipesan
                    let qty = document.createElement('p')
                    qty.classList.add('qty')
                    qty.textContent = "Qty : " + item.qty
                    info.appendChild(qty)


                    // Akumulasi subtotal: harga produk x quantity
                    subtotal += produk.harga * item.qty

                }
            });
        });

        // Tampilkan subtotal (total harga semua produk, belum termasuk ongkir)
        let isiSubtotal = document.getElementById('subtotal')
        isiSubtotal.textContent = "Rp. " + subtotal.toLocaleString("id-ID")

        // Tampilkan biaya ongkos kirim
        let shipping = document.getElementById('shipping')
        shipping.textContent = "Rp. " + ongkir.toLocaleString("id-ID")

        // Hitung dan tampilkan total keseluruhan (subtotal + ongkir)
        let totalSemua = subtotal + ongkir
        let total = document.getElementById('total')
        total.textContent = "Rp. " + totalSemua.toLocaleString("id-ID")

        // Dijalankan saat tombol (misal "Selesai"/"Kembali ke Home") diklik
        let tombol = document.getElementById('tombol')
        tombol.onclick = function () {
            // Ambil isi keranjang belanja
            let cart = JSON.parse(localStorage.getItem("cart")) || [];

            // Hapus dari keranjang produk-produk yang barusan berhasil dibeli
            // (supaya tidak dobel muncul lagi di halaman keranjang)
            co.forEach(coItem => {

                cart.forEach((cartItem, index) => {

                    if (coItem.id == cartItem.id && coItem.ukuran == cartItem.ukuran) {
                        cart.splice(index, 1);
                    }

                });

            });

            // Simpan keranjang yang sudah dibersihkan
            localStorage.setItem("cart", JSON.stringify(cart));

            // Hapus data checkout & data pengiriman sementara karena transaksi sudah selesai
            localStorage.removeItem("co");
            localStorage.removeItem("dataUser");
        }

        // Tampilkan data pengiriman user (nama, WA, email, alamat) di halaman
        let namaUser = document.getElementById('nama-user')
        namaUser.textContent = user.nama
        let whatsappUser = document.getElementById('whatsapp')
        whatsappUser.textContent = user.whatsapp
        let emailUser = document.getElementById('email')
        emailUser.textContent = user.email
        let alamatUser = document.getElementById('alamat')
        alamatUser.textContent = user.alamat

    })
    .catch(error => {
        console.error("Terjadi kesalahan:", error);
    });