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
        // Ambil daftar produk yang mau di-checkout (dari halaman sebelumnya)
        let co = JSON.parse(localStorage.getItem("co")) || [];
        // Menyimpan quantity tiap produk, index-nya mengikuti index "co"
        let qty = [];
        // Biaya ongkos kirim tetap
        let ongkir = 15000

        // Tampilkan biaya ongkir di halaman
        let shipping = document.getElementById('shipping')
        shipping.textContent = "Rp. " + ongkir.toLocaleString("id-ID");

        let total = document.getElementById('total')

        // Cocokkan tiap produk checkout dengan data dari API, lalu render kartunya
        data.forEach(item => {
            co.forEach((produk, index) => {

                if (item.id == produk.id) {
                    // Buat container card untuk 1 produk checkout
                    let card = document.createElement('div')
                    card.classList.add('produk')
                    document.querySelector('.card-co').appendChild(card)

                    // Set quantity awal produk ini = 1
                    qty[index] = 1

                    // Tampilkan gambar produk
                    let img = document.createElement('div')
                    let foto = document.createElement('img')
                    img.classList.add('foto')
                    foto.src = "https://api-sepatu-six.vercel.app/" + item.foto;
                    img.appendChild(foto)
                    card.appendChild(img)

                    // Container detail produk (merk, nama, ukuran, harga, qty)
                    let detail = document.createElement('div')
                    detail.classList.add('detail-produk')
                    card.appendChild(detail)

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

                    // Tampilkan ukuran yang dipilih user untuk produk ini
                    let ukuran = document.createElement('p')
                    ukuran.classList.add('ukuran')
                    ukuran.textContent = "Size : " + produk.ukuran
                    detail.appendChild(ukuran)

                    // Tampilkan harga satuan produk
                    let harga = document.createElement('p')
                    harga.classList.add('harga')
                    harga.textContent = "Rp. " + item.harga.toLocaleString("id-ID")
                    detail.appendChild(harga)

                    // Container pengaturan quantity (tombol tambah/kurang)
                    let qtyHitung = document.createElement('div')
                    qtyHitung.classList.add('qty')
                    detail.appendChild(qtyHitung)

                    // Label "Quantity :"
                    let ket = document.createElement('div')
                    ket.classList.add('ket')
                    qtyHitung.appendChild(ket)
                    let isiKet = document.createElement('p')
                    isiKet.textContent = "Quantity : "
                    ket.appendChild(isiKet)

                    // Container tombol +, angka qty, dan tombol -
                    let tombol = document.createElement('div')
                    tombol.classList.add('tombol')
                    qtyHitung.appendChild(tombol)

                    // Tombol tambah quantity
                    let tambah = document.createElement('button')
                    tambah.textContent = '+'
                    tombol.appendChild(tambah)

                    // Tampilan angka quantity saat ini
                    let qtyHasil = document.createElement('p')
                    qtyHasil.textContent = qty[index]
                    tombol.appendChild(qtyHasil)

                    // Tombol kurangi quantity
                    let kurang = document.createElement('button')
                    kurang.textContent = '-'
                    tombol.appendChild(kurang)

                    // Tampilan subtotal harga untuk produk ini (harga x qty)
                    let subtotalProduk = document.createElement('p')
                    subtotalProduk.classList.add('subtotal-item')
                    detail.appendChild(subtotalProduk)

                    // Update tampilan subtotal kartu ini sesuai qty saat ini
                    function updateSubtotalKartu() {
                        let hasil = item.harga * qty[index]
                        subtotalProduk.textContent = "Rp. " + hasil.toLocaleString("id-ID");
                    }

                    // Saat tombol "+" diklik: tambah qty, update tampilan qty & subtotal kartu,
                    // lalu hitung ulang total keseluruhan pesanan
                    tambah.onclick = function () {
                        qty[index]++;
                        qtyHasil.textContent = qty[index];
                        updateSubtotalKartu();
                        hitungTotalSemua();
                    }

                    // Saat tombol "-" diklik: kurangi qty (minimal 1), update tampilan qty & subtotal kartu,
                    // lalu hitung ulang total keseluruhan pesanan
                    kurang.onclick = function () {
                        if (qty[index] > 1) {
                            qty[index]--;
                            qtyHasil.textContent = qty[index];
                            updateSubtotalKartu();
                            hitungTotalSemua();
                        }
                    }

                    // Tampilkan subtotal awal saat kartu pertama kali dibuat
                    updateSubtotalKartu();
                }
            });
        });

        // Hitung ulang total belanja (semua produk x qty) + ongkir,
        // lalu tampilkan subtotal dan total keseluruhan
        function hitungTotalSemua() {
            let totalHarga = 0;
            data.forEach(item => {
                co.forEach((produk, index) => {
                    if (item.id == produk.id) {
                        totalHarga += item.harga * (qty[index] || 1);
                    }
                });
            });
            let hasil = totalHarga + ongkir;
            total.textContent = "Rp. " + hasil.toLocaleString("id-ID");
            document.getElementById('subtotal').textContent = "Rp. " + totalHarga.toLocaleString("id-ID");
        }

        // Tampilkan total awal saat halaman pertama dimuat
        hitungTotalSemua();

        // Ambil tombol "buy" (proses checkout)
        let bayar = document.getElementById("buy");

        // Dijalankan saat tombol checkout diklik
        bayar.onclick = function () {
            // Ambil metode pembayaran yang dipilih user
            let payment = document.querySelector('input[name="payment"]:checked');

            // Ambil & bersihkan (trim) input data pengiriman
            let nama = document.getElementById("nama").value.trim();
            let whatsapp = document.getElementById("whatsapp").value.trim();
            let email = document.getElementById("email").value.trim();
            let alamat = document.getElementById("alamat").value.trim();

            // Kalau belum pilih metode pembayaran, batalkan dan tampilkan notifikasi
            if (!payment) {
                tampilNotif("Choose your Payment", "tidak");
                return;
            } else if (!nama.length || !whatsapp.length || !email.length || !alamat.length) {
                // Kalau ada field yang masih kosong, batalkan dan tampilkan notifikasi
                tampilNotif("Please complete your shipping information.", "tidak");
                return;
            }

            // Validasi nama: minimal 3 karakter, hanya huruf/spasi/titik/apostrof/strip
            const regexNama = /^[a-zA-Z\s.'-]+$/;
            if (nama.length < 3 || !regexNama.test(nama)) {
                tampilNotif("Please enter a valid name (letters only, min. 3 characters).", "tidak");
                return;
            }

            // Validasi nomor WhatsApp (harus 08 + 8-11 digit = total 10-13 digit)
            const regexWA = /^08[0-9]{8,11}$/;
            if (!regexWA.test(whatsapp)) {
                tampilNotif("WhatsApp number must start with 08 and match a valid Indonesian phone number length.", "tidak");
                return;
            }

            // Validasi format email
            const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!regexEmail.test(email)) {
                tampilNotif("Please enter a valid email address.", "tidak");
                return;
            }

            // Validasi alamat: minimal panjang 10 karakter
            if (alamat.length < 10) {
                tampilNotif("Address is too short, please provide more details.", "tidak");
                return;
            }

            // Kumpulkan data pengiriman yang sudah tervalidasi
            let dataUser = {
                nama: nama,
                whatsapp: whatsapp,
                email: email,
                alamat: alamat
            };

            // Arahkan tombol ke halaman "berhasil" setelah semua validasi lolos
            bayar.href = "berhasil.html";

            // Simpan quantity final tiap produk ke dalam data checkout
            co.forEach((produk, index) => {
                produk.qty = qty[index] || 1;
            });

            // Simpan data pengiriman & data checkout ke localStorage
            localStorage.setItem("dataUser", JSON.stringify(dataUser));
            localStorage.setItem("co", JSON.stringify(co));
        };

        // Fungsi untuk menampilkan notifikasi sementara (muncul 2 detik lalu hilang)
        function tampilNotif(pesan, peringatan) {
            let notif = document.getElementById("notif");

            notif.textContent = pesan;
            notif.classList.add(peringatan);

            setTimeout(function () {
                notif.classList.remove(peringatan);
            }, 2000);
        }

        // Tombol "kembali" — hapus data checkout sementara, lalu kembali ke halaman sebelumnya
        let back = document.getElementById('back-detail')
        back.onclick = function () {
            localStorage.removeItem("co");
            history.back();
        }

    })
    .catch(error => {
        console.error("Terjadi kesalahan:", error);
    });