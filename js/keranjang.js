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
        // Ambil isi keranjang dari localStorage (kosong array kalau belum ada)
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let produk = document.getElementById('produk')

        // Kalau keranjang kosong, tampilkan pesan "keranjang kosong" dan hentikan proses
        if (cart.length == 0) {
            let kosong = document.createElement('p')
            kosong.textContent = "YOUR CART IS EMPTY."
            kosong.classList.add('kosong')
            produk.appendChild(kosong)
            return
        } else {

            // Cocokkan setiap item di cart dengan data produk dari API,
            // lalu render kartu produk untuk tiap item yang cocok
            data.forEach(data => {
                cart.forEach(item => {
                    if (data.id == item.id) {

                        // Buat container card untuk 1 produk di keranjang
                        let card = document.createElement('div')
                        card.classList.add('card-produk')
                        produk.appendChild(card)

                        // Buat container checkbox pilih produk
                        let pilih = document.createElement('div')
                        pilih.classList.add('pilih')

                        // Checkbox untuk memilih produk ini (individual)
                        let pilihSemua = document.createElement('input')
                        pilihSemua.type = "checkbox"
                        pilihSemua.classList.add('check-produk')
                        // Simpan id & ukuran produk di dataset checkbox, supaya bisa diakses saat event berubah
                        pilihSemua.dataset.id = item.id;
                        pilihSemua.dataset.ukuran = item.ukuran;
                        // Simpan referensi elemen card ke checkbox, supaya mudah dihapus nanti saat "hapus produk"
                        pilihSemua.card = card
                        pilihSemua.addEventListener("change", pilihProduk)

                        card.appendChild(pilih)
                        pilih.appendChild(pilihSemua)

                        // Container gambar produk
                        let pic = document.createElement('div')
                        pic.classList.add('pic')
                        card.appendChild(pic)

                        let img = document.createElement('img')
                        img.src = "https://api-sepatu-six.vercel.app/" + data.foto;
                        pic.appendChild(img)

                        // Container informasi produk (merk, nama, ukuran, harga)
                        let info = document.createElement('div')
                        info.classList.add('info')
                        card.appendChild(info)

                        // Tampilkan merk produk
                        let merk = document.createElement('p')
                        merk.classList.add('merk')
                        merk.textContent = data.merk
                        info.appendChild(merk)

                        // Tampilkan nama produk
                        let nama = document.createElement('p')
                        nama.classList.add('nama')
                        nama.textContent = data.nama
                        info.appendChild(nama)
                        // Kalau nama produk pendek (< 21 karakter), tambah class khusus
                        // supaya layout/lebar teksnya menyesuaikan (lihat CSS .nama.panjang)
                        if (data.nama.length < 21) {
                            nama.classList.add('panjang')
                        }

                        // Tampilkan ukuran yang dipilih user untuk produk ini
                        let ukuran = document.createElement('p')
                        ukuran.classList.add('ukuran')
                        ukuran.textContent = "Size : " + item.ukuran
                        info.appendChild(ukuran)

                        // Tampilkan harga produk dengan format Rupiah
                        let harga = document.createElement('p')
                        harga.classList.add('harga')
                        harga.textContent = "Rp. " + data.harga.toLocaleString("id-ID")
                        info.appendChild(harga)

                    }
                });
            });

        }

        // Ambil elemen penampil subtotal, set nilai awal ke 0 (belum ada produk dipilih)
        let subtotal = document.querySelector(".nominal");

        subtotal.textContent =
            "Rp. " + 0


        // Ambil elemen checkbox "pilih semua"
        let select = document.getElementById('select-all')
        select.addEventListener("change", selectAll);

        // Fungsi untuk mencentang/melepas centang semua checkbox produk sekaligus
        function selectAll() {
            let semuaCheckbox = document.querySelectorAll(".check-produk");
            let checked = this.checked;

            semuaCheckbox.forEach(checkbox => {
                checkbox.checked = checked;   
                pilihProduk.call(checkbox); 
            });

            select.checked = checked;
        }

        // Ambil elemen tombol "bayar" dan arahkan ke halaman checkout
        let bayar = document.getElementById('bayar')
        bayar.href = 'buy.html'
        bayar.onclick = tambah

        // Menyimpan daftar produk (id & ukuran) yang sedang dicentang user
        let produkDipilih = [];

        // Dijalankan setiap kali status checkbox produk berubah (dicentang/dilepas)
        function pilihProduk() {

            let id = Number(this.dataset.id);
            let ukuran = this.dataset.ukuran;


            if (this.checked) {

                // Cek apakah produk dengan id & ukuran yang sama sudah ada di daftar terpilih
                let sudahAda = produkDipilih.some(item =>
                    item.id === id && item.ukuran === ukuran
                );

                // Kalau belum ada, tambahkan ke daftar produk terpilih
                if (!sudahAda) {
                    produkDipilih.push({
                        id: id,
                        ukuran: ukuran,
                    });
                }

            } else {

                // Kalau checkbox dilepas, hapus produk tersebut dari daftar terpilih
                produkDipilih = produkDipilih.filter(item =>
                    !(item.id === id && item.ukuran === ukuran)
                );

            }

            // Hitung ulang subtotal setiap kali pilihan berubah
            updateTotal()
            syncSelectAll();
        }

        // Sinkronkan status checkbox "select all" berdasarkan checkbox produk
        function syncSelectAll() {
            let semuaCheckbox = document.querySelectorAll(".check-produk");
            let select = document.getElementById('select-all');

            if (semuaCheckbox.length === 0) {
                select.checked = false;
                return;
            }

            // Cek apakah SEMUA checkbox produk sedang tercentang
            let semuaTercentang = Array.from(semuaCheckbox).every(cb => cb.checked);
            select.checked = semuaTercentang;
        }

        // Dijalankan saat tombol "bayar" diklik, sebelum pindah ke halaman checkout
        function tambah(e) {
            // Kalau belum ada produk yang dipilih, batalkan navigasi dan tampilkan notifikasi
            if (produkDipilih.length === 0) {
                e.preventDefault(); // biar tidak lanjut ke buy.html
                tampilNotif("Please select a product to continue.", "tidak");
                return;
            }

            // Simpan daftar produk yang dipilih untuk dipakai di halaman checkout (buy.html)
            localStorage.setItem("co", JSON.stringify(produkDipilih));
        }

        // Hitung ulang total harga dari produk-produk yang sedang dicentang
        function updateTotal() {

            let total = 0;

            produkDipilih.forEach(produk => {

                data.forEach(item => {

                    if (produk.id === item.id) {
                        total += item.harga;
                    }

                });

            });

            let subtotal = document.querySelector(".nominal");

            // Tampilkan total harga dengan format Rupiah
            subtotal.textContent =
                "Rp. " + total.toLocaleString("id-ID");
        }

        // Ambil elemen tombol "hapus" produk dari keranjang
        let hapus = document.getElementById('hapus');
        hapus.onclick = hapusProduk;

        // Menghapus produk yang sedang dicentang dari keranjang
        function hapusProduk(e) {
            e.preventDefault(); // biar href="" gak reload/redirect halaman

            // Kalau tidak ada produk yang dicentang, tampilkan notifikasi dan hentikan proses
            if (produkDipilih.length === 0) {
                tampilNotif("No product selected", "tidak");
                return;
            }

            // 1. Hapus dari cart di localStorage
            cart = cart.filter(item =>
                !produkDipilih.some(p => p.id === item.id && p.ukuran === item.ukuran)
            );
            localStorage.setItem("cart", JSON.stringify(cart));

            // 2. Hapus card yang tercentang dari tampilan
            let semuaCheckbox = document.querySelectorAll(".check-produk");
            semuaCheckbox.forEach(checkbox => {
                if (checkbox.checked) {
                    checkbox.card.remove();
                }
            });

            // 3. Reset produkDipilih & update total
            produkDipilih = [];
            localStorage.setItem("co", JSON.stringify(produkDipilih));
            updateTotal();
            updateNotif()
            syncSelectAll();
            tampilNotif("Product removed from cart.", "berhasil");
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

        // Fungsi untuk menampilkan notifikasi sementara (muncul 2 detik lalu hilang)
        function tampilNotif(pesan, peringatan) {
            let notif = document.getElementById("notif");

            notif.textContent = pesan;
            notif.classList.add(peringatan);

            setTimeout(function () {
                notif.classList.remove(peringatan);
            }, 2000);
        }


    })
    .catch(error => {
        // Tulis penanganan jika terjadi error di sini
        console.error("Terjadi kesalahan:", error);
    });