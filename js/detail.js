// Setiap kali halaman ini ditampilkan (termasuk saat kembali via tombol back),
// hapus data checkout sementara ("co") supaya tidak membawa pilihan lama
window.addEventListener("pageshow", function () {
    localStorage.removeItem("co");
});

let api = "https://api-sepatu-six.vercel.app/api/sepatu"

// Ambil data sepatu dari API
fetch(api)
    .then(response => {
        // Cek apakah response gagal (misal 404, 500, dll)
        if (!response.ok) {
            throw new Error("HTTP Error: " + response.status)
        }
        return response.json()
    })
    .then(data => {
        // Ambil parameter query string dari URL (misal detail.html?id=5)
        let params = new URLSearchParams(window.location.search)

        // Ambil id produk yang mau ditampilkan dari URL
        let id = Number(params.get("id"))

        let detail = document.querySelector('.detail-produk')

        // Menyimpan ukuran yang sedang dipilih user
        let pilihan

        // Cari produk yang id-nya cocok dengan id dari URL, lalu render detailnya
        data.forEach(item => {
            if (item.id == id) {
                // Tampilkan foto produk
                let pic = document.querySelector('.pic')
                let img = document.createElement('img')
                pic.appendChild(img)
                img.src = "https://api-sepatu-six.vercel.app/" + item.foto;


                // Tampilkan merk produk
                let merk = document.createElement('p')
                merk.classList.add('merk')
                merk.textContent = item.merk
                detail.appendChild(merk)

                // Tampilkan nama produk
                let nama = document.createElement('p')
                nama.classList.add('nama')
                nama.textContent = item.nama
                detail.appendChild(nama)
                // Kalau nama produk pendek (< 21 karakter), tambah class khusus
                // supaya layout/lebar teksnya menyesuaikan (lihat CSS .nama.panjang)
                if (item.nama.length < 21) {
                    nama.classList.add('panjang')
                }

                // Tampilkan deskripsi produk
                let deskripsi = document.createElement('p')
                deskripsi.classList.add('deskripsi')
                deskripsi.textContent = item.deskripsi
                detail.appendChild(deskripsi)

                // Tampilkan warna produk (dibungkus span di dalam kategori)
                let warna = document.createElement('span')
                warna.textContent = item.warna

                // Tampilkan kategori produk, digabung dengan warna (format: "Kategori · Warna")
                let kategoriWarna = document.createElement('p')
                kategoriWarna.classList.add('kategori-warna')
                kategoriWarna.textContent = item.kategori + " · "
                kategoriWarna.appendChild(warna)
                detail.appendChild(kategoriWarna)


                // Container pilihan ukuran
                let ukuran = document.createElement('div')
                ukuran.classList.add('ukuran')
                detail.appendChild(ukuran)

                // Label "SELECT SIZE"
                let select = document.createElement('p')
                select.classList.add('pilih-ukuran')
                select.textContent = "SELECT SIZE"
                ukuran.appendChild(select)

                // Buat tombol untuk tiap pilihan ukuran yang tersedia pada produk ini
                item.ukuran.forEach(uk => {
                    let button = document.createElement('button')
                    button.textContent = uk
                    ukuran.appendChild(button)
                    button.onclick = klik
                });

                // Tampilkan harga produk dengan format Rupiah
                let harga = document.createElement('p')
                harga.classList.add('harga')
                harga.textContent = "Rp. " + item.harga.toLocaleString("id-ID");
                detail.appendChild(harga)

                // Container tombol aksi (beli & tambah ke keranjang)
                let tombol = document.createElement('div')
                tombol.classList.add('tombol')
                detail.appendChild(tombol)

                // Tombol "PURCHASE" — langsung beli produk ini
                let buy = document.createElement('a')
                buy.textContent = "PURCHASE"
                buy.addEventListener("click", function (e) {
                    // Kalau belum pilih ukuran, batalkan dan tampilkan notifikasi
                    if (!pilihan) {
                        tampilNotif("Please select a size to continue..", "tidak");
                        return;
                    }
                    // Set tujuan link ke halaman checkout
                    buy.href = "buy.html"

                    // Simpan produk yang mau dibeli (id + ukuran) ke localStorage "co"
                    let co = JSON.parse(localStorage.getItem("co")) || []
                    co.push({
                        id: id,
                        ukuran: pilihan,
                    });

                    localStorage.setItem("co", JSON.stringify(co));
                })
                tombol.appendChild(buy)

                // Tombol tambah ke keranjang (icon cart)
                let keranjang = document.createElement('button')
                tombol.appendChild(keranjang)

                let icon = document.createElement('span')
                icon.classList.add("material-symbols-outlined")
                icon.textContent = "shopping_cart"
                keranjang.appendChild(icon)

                keranjang.onclick = cart
            }
        });


        // Menambahkan produk (id + ukuran yang dipilih) ke keranjang belanja
        function cart() {
            // Kalau belum pilih ukuran, batalkan dan tampilkan notifikasi
            if (!pilihan) {
                tampilNotif("Please select a size to continue.", "tidak");
                return;
            }

            let cart = JSON.parse(localStorage.getItem("cart")) || [];

            // Cek apakah produk dengan id & ukuran yang sama sudah ada di keranjang
            let produkAda = cart.find(item =>
                item.id === id && item.ukuran === pilihan
            );

            if (produkAda) {
                // Kalau sudah ada, tampilkan notifikasi dan hentikan proses
                tampilNotif("Product is already in your cart.", "tidak")
                return
            } else {
                // Kalau belum ada, tambahkan produk ke keranjang
                cart.push({
                    id: id,
                    ukuran: pilihan,
                });
            }

            // Simpan keranjang yang sudah diperbarui ke localStorage
            localStorage.setItem("cart", JSON.stringify(cart));

            // Tampilkan notifikasi sukses dan perbarui badge jumlah item di navbar
            tampilNotif("Added to cart.", "berhasil");
            updateNotif()
        }

        // Fungsi untuk menampilkan notifikasi sementara (muncul 2 detik lalu hilang)
        function tampilNotif(pesan, peringatan) {
            let notif = document.getElementById("notif");

            notif.textContent = pesan;
            notif.classList.add(peringatan);

            setTimeout(function () {
                notif.classList.remove(peringatan);
            }, 2000);
        }

        // Update angka notifikasi jumlah item di ikon keranjang (navbar)
        function updateNotif() {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const notif = document.querySelector('.notif');
            if (!notif) return; 
            notif.textContent = "";
            const isi = document.createElement('p');
            isi.textContent = cart.length;
            notif.appendChild(isi);
        }

        // Dijalankan saat salah satu tombol ukuran diklik
        function klik() {
            // Hapus status "active" dari semua tombol ukuran
            document.querySelectorAll(".ukuran button")
                .forEach(button => {
                    button.classList.remove("active");
                });

            // Tandai tombol yang baru diklik sebagai "active"
            this.classList.add("active");

            // Simpan ukuran yang dipilih user
            pilihan = this.textContent;
        }


    })
    .catch(error => {
        // Tulis penanganan jika terjadi error di sini
        console.error("Terjadi kesalahan:", error)
    })