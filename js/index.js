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

        // Ambil container tempat menampilkan produk unggulan (top product)
        let pembungkus = document.getElementById("top-product")

        // Loop untuk menampilkan 3 produk: index 7, 8, lalu langsung loncat ke index 19
        // (trik: saat i == 2, dipaksa jadi 12, sehingga index terakhir jadi 12+7=19)
        for (let i = 0; i < 3; i++) {
            if (i == 2) {
                i = 12
            }

            // Buat card pembungkus untuk 1 produk
            let hiji = document.createElement("div")
            hiji.classList.add('card')
            pembungkus.appendChild(hiji)

            // Container gambar produk
            let img = document.createElement('div')
            img.classList.add('img')
            hiji.appendChild(img)

            // Ambil data produk berdasarkan index (offset +7 dari data asli)
            let fotoHiji = document.createElement("img")
            fotoHiji.src = "https://api-sepatu-six.vercel.app/" + data[i + 7].foto
            img.appendChild(fotoHiji)


            // Container informasi produk (merk, nama, deskripsi, harga)
            let isi = document.createElement('div')
            isi.classList.add('isi')
            hiji.appendChild(isi)

            // Tampilkan merk produk
            let merk = document.createElement('p')
            merk.textContent = data[i + 7].merk
            merk.classList.add('merk')
            isi.appendChild(merk)

            // Tampilkan nama produk
            let nama = document.createElement('p')
            nama.textContent = data[i + 7].nama
            nama.classList.add('nama')
            isi.appendChild(nama)
            // Kalau nama produk pendek (< 21 karakter), tambah class khusus
            // supaya layout/lebar teksnya menyesuaikan (lihat CSS .nama.panjang)
            if (data[i+7].nama.length < 21) {
                nama.classList.add("panjang");
            }

            // Tampilkan deskripsi singkat produk
            let deskripsi = document.createElement('p')
            deskripsi.textContent = data[i + 7].deskripsi
            deskripsi.classList.add('deskripsi')
            isi.appendChild(deskripsi)

            // Tampilkan harga produk dengan format Rupiah
            let harga = document.createElement('p')
            harga.textContent = "Rp. " + data[i + 7].harga.toLocaleString("id-ID")
            harga.classList.add('harga')
            isi.appendChild(harga)

            // Buat tombol/link menuju halaman detail produk,
            // ditempatkan di dalam elemen harga
            let cek = document.createElement('a')
            cek.href = "html/detail.html?id=" + data[i+7].id
            cek.classList.add('cek')
            cek.textContent = "Explore Product"
            harga.appendChild(cek)

        }

    })
    .catch(error => {
        // Tulis penanganan jika terjadi error di sini
        console.error("Terjadi kesalahan:", error);
    });