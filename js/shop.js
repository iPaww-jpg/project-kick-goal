// URL endpoint API untuk mengambil data sepatu
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
        // Ambil daftar merk yang unik (tanpa duplikat) dari seluruh data,
        // lalu ambil 1 item pertama untuk mewakili tiap merk
        let hasil = [...new Set(data.map(item => item.merk))]
            .map(merk => data.find(item => item.merk === merk));

        console.log(hasil);


        // Buat tombol filter "ALL" (default aktif saat halaman pertama dibuka)
        let filter = document.getElementById("filter-merk")
        let pilih = document.createElement('button')
        pilih.classList.add("active")
        pilih.textContent = "ALL"
        pilih.onclick = klik
        pilih.id = "all"
        filter.appendChild(pilih)

        // Menyimpan merk yang sedang dipilih user, default "all"
        let pilihan = "all"

        // Buat tombol filter untuk tiap merk yang ada di data
        for (let i = 0; i < hasil.length; i++) {
            pilih = document.createElement('button')
            pilih.textContent = hasil[i].merk
            filter.appendChild(pilih)
            pilih.onclick = klik
            pilih.id = hasil[i].merk
        }


        // Fungsi yang dijalankan saat salah satu tombol filter merk diklik
        function klik() {

            // Hapus class "active" dari semua tombol filter
            document.querySelectorAll("#filter-merk button")
                .forEach(button => {
                    button.classList.remove("active");
                });

            // Tambahkan class "active" ke tombol yang baru diklik
            this.classList.add("active");

            // Simpan id tombol (nama merk atau "all") sebagai filter aktif
            pilihan = this.id;

            console.log(pilihan);

            // Tampilkan ulang data produk sesuai filter yang dipilih
            tampilkanData(data, pilihan);
        }


        // Menampilkan data produk ke halaman berdasarkan filter merk
        function tampilkanData(data, filter) {
            let card = document.querySelector(".list-produk");
            // Kosongkan dulu list produk sebelum render ulang
            card.replaceChildren();

            data.forEach(item => {

                // Kalau filter "all", tampilkan semua produk
                if (filter == "all") {
                    render(item)
                    // Kalau tidak, tampilkan hanya produk dengan merk yang sesuai filter
                } else if (item.merk == filter) {
                    render(item)
                }


            });
        }

        // Ambil elemen input pencarian
        let input = document.getElementById("search");

        // Jalankan pencarian saat user menekan tombol Enter di kolom search
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                search(input.value)
            }
        });

        // Fungsi pencarian produk berdasarkan nama (case-insensitive)
        function search(input) {

            let card = document.querySelector(".list-produk");

            // Kosongkan list produk sebelum menampilkan hasil pencarian
            card.replaceChildren();

            let keyword = input.toLowerCase();

            // Filter data yang nama produknya mengandung keyword pencarian
            let hasil = data.filter(item => {
                return (item.nama || "").toLowerCase().includes(keyword);
            });

            console.log("hasil pencarian:", hasil); // debug

            // Kalau tidak ada hasil yang cocok, tampilkan notifikasi
            if (hasil.length === 0) {
                tampilNotif("No results found", "tidak");
                return;
            }

            // Render semua hasil pencarian yang ditemukan
            hasil.forEach(item => render(item));
        }

        // Fungsi untuk membuat dan menampilkan 1 kartu produk ke halaman
        function render(item) {
            let card = document.querySelector(".list-produk");

            // Buat elemen <a> sebagai bungkus kartu produk, mengarah ke halaman detail
            let hiji = document.createElement("a");
            hiji.classList.add("card");
            hiji.href = "detail.html?id=" + item.id
            card.appendChild(hiji);


            // FOTO
            // Buat container untuk gambar produk
            let img = document.createElement("div");
            img.classList.add("img");
            hiji.appendChild(img);

            // Buat elemen gambar dan set sumbernya dari API
            let fotoHiji = document.createElement("img");
            fotoHiji.src = "https://api-sepatu-six.vercel.app/" + item.foto;
            img.appendChild(fotoHiji);


            // ISI
            // Buat container untuk informasi produk (merk, nama, harga, tombol detail)
            let isi = document.createElement("div");
            isi.classList.add("isi");
            hiji.appendChild(isi);


            // MERK
            // Tampilkan nama merk produk
            let merk = document.createElement("p");
            merk.textContent = item.merk;
            merk.classList.add("merk");
            isi.appendChild(merk);


            // NAMA
            // Tampilkan nama produk
            let nama = document.createElement("p");
            nama.textContent = item.nama;
            nama.classList.add("nama");
            isi.appendChild(nama);
            // Kalau nama produk pendek (< 21 karakter), tambah class khusus
            // supaya layout/lebar teksnya menyesuaikan (lihat CSS .nama.panjang)
            if (item.nama.length < 21) {
                nama.classList.add("panjang");
            }


            // HARGA
            // Tampilkan harga produk dengan format Rupiah (pemisah ribuan ala Indonesia)
            let harga = document.createElement("p");
            harga.textContent = "Rp. " + item.harga.toLocaleString("id-ID");
            harga.classList.add("harga");
            isi.appendChild(harga);

            console.log(item.id)

            // DETAIL
            // Buat tombol/link "DETAIL" menuju halaman detail produk
            let detail = document.createElement("a");
            detail.textContent = "DETAIL";
            detail.href = "detail.html?id=" + item.id
            detail.classList.add("detail");
            isi.appendChild(detail);

        }

        // Tampilkan data produk pertama kali saat halaman dimuat (default filter "all")
        tampilkanData(data, pilihan)

        // Fungsi untuk menampilkan notifikasi sementara (muncul 2 detik lalu hilang)
        function tampilNotif(pesan, peringatan) {
            let notif = document.getElementById("notif");

            notif.textContent = pesan;
            notif.classList.add(peringatan);

            // Hapus class notifikasi setelah 2 detik agar animasi/tampilan notif hilang
            setTimeout(function () {
                notif.classList.remove(peringatan);
            }, 2000);
        }


    })
    .catch(error => {
        // Tulis penanganan jika terjadi error di sini
        console.error("Terjadi kesalahan:", error);
    });