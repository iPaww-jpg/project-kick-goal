// Ambil elemen tombol toggle dark/light mode
let themeButton = document.querySelector(".dark-mode");
// Ambil elemen ikon di dalam tombol (untuk ganti icon dark_mode/light_mode)
let icon = document.querySelector('.dark-mode span')

// Cek preferensi tema yang tersimpan di localStorage dari kunjungan sebelumnya
let theme = localStorage.getItem("theme");

// Kalau tema tersimpan adalah "light", terapkan class "light" ke body saat halaman dimuat
if (theme === "light") {
    document.body.classList.add("light");
}

// Jalankan saat tombol dark/light mode diklik
themeButton.addEventListener("click", () => {

    // Toggle class "light" pada body (nyala/mati)
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
        // Kalau sekarang mode light, simpan preferensi ke localStorage
        // dan ganti ikon jadi "light_mode"
        localStorage.setItem("theme", "light");
        icon.textContent = "light_mode";
    } else {
        // Kalau sekarang mode dark, simpan preferensi ke localStorage
        // dan ganti ikon jadi "dark_mode"
        localStorage.setItem("theme", "dark");
        icon.textContent = "dark_mode";
    }

});

// Ambil elemen tombol "back" (panah kembali)
let back = document.querySelector('.back a')
back.onclick = function (e) {
    // Cegah perilaku default link (supaya tidak pindah ke href="")
    e.preventDefault();
    // Kembali ke halaman sebelumnya di riwayat browser
    history.back();
};