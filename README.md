# Dental House

Denah dan maket interaktif untuk tugas desain klinik Kelompok 31. Mode **Maket 3D** menampilkan potongan satu lantai yang dapat diputar, **Denah** menampilkan tampak atas yang dapat dipilih, dan **Fasad** menampilkan bangunan utuh serta parkir. Nomor pada maket dan daftar ruang merujuk pada indeks yang sama.

## Menjalankan proyek

Gunakan Node.js 22.12 atau lebih baru dari direktori `Dental-House`.

```powershell
npm ci
npm run dev
```

Gunakan `npm test` untuk memeriksa data denah. Jalankan `npm run build` untuk membuat `dist/`, lalu `npm run preview` untuk memeriksa build lokal.

## Vercel

Impor repositori dengan preset **Vite**. Jika repositori berisi beberapa proyek, pilih **Dental-House** sebagai Root Directory. Jika isi folder ini berada di root repositori sendiri, gunakan root bawaan. Build memakai `npm run build` dan folder output `dist`. Web berjalan di browser tanpa backend atau variabel lingkungan. Vercel Hobby berlaku untuk penggunaan pribadi dan nonkomersial. [Vite di Vercel](https://vercel.com/docs/frameworks/frontend/vite) · [Vercel Hobby](https://vercel.com/docs/plans/hobby)

## Dasar denah

Proposal `TUGAS TEAM-BASED PROJECT.docx` memuat kebutuhan ruang dan peralatan. Bentuk tapak, bukaan, dan ukuran di web adalah interpretasi konseptual. Ruang publik berada di depan, tiga ruang perawatan terhubung ke koridor tengah, dan ruang staf serta servis berada di sayap kanan. Radiografi mengikuti bagian 2.3 proposal, memakai perangkat intraoral portabel di dua ruang praktik umum. Toilet bersama mengikuti bagian 2.8 dan ruang ganti APD mengikuti bagian 2.6. Arah kiblat dan dimensi teknis memerlukan data tapak.

`src/layout.js` menyimpan geometri denah dalam meter. Denah 2D memuat batang skala 5 m. Jejak bangunan utama berukuran 23 × 14 m pada rancangan. Petak mobil berukuran 2,70 × 5,00 m dan petak skuter 1,08 × 2,50 m. Ukuran tersebut merupakan asumsi desain konsep.

## Model 3D

Model di `public/models/` berasal dari Innerscene dan dirilis dengan lisensi [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Geometri dan tekstur dioptimalkan untuk browser dengan glTF Transform. Penempatan di maket memakai skala meter bawaan file.

| File | Ukuran mesh di maket (panjang × lebar × tinggi) | Sumber |
| --- | --- | --- |
| `dental-unit.glb` | 2,11 × 1,45 × 2,07 m | [Dental chair](https://www.innerscene.com/tools/library/3d-parts/dental-chair-652b8b58) |
| `hatchback.glb` | 4,26 × 2,12 × 1,59 m | [Silver five-door compact hatchback](https://www.innerscene.com/tools/library/3d-parts/silver-five-door-compact-hatchback-6bf4a878) |
| `scooter.glb` | 1,90 × 0,81 × 1,17 m | [Urban motor scooter](https://www.innerscene.com/tools/library/3d-parts/urban-motor-scooter-9dd945f9) |

| Model tambahan | Sumber |
| --- | --- |
| Meja pendaftaran bersudut membulat dan kursi kerja | [Curved reception desk](https://www.innerscene.com/tools/library/3d-parts/curved-reception-desk-ac93e59a) · [Ridge task chair](https://www.innerscene.com/tools/library/3d-parts/ridge-aluminum-ribbed-task-chair-25fb21c3) |
| Figur resepsionis dan dua pengunjung | [Seated office figure](https://www.innerscene.com/tools/library/3d-parts/seated-office-figure-79182d38) · [Daniel](https://www.innerscene.com/tools/library/3d-parts/daniel-3d-person-standing-casual-f788af5a) · [Taylor](https://www.innerscene.com/tools/library/3d-parts/taylor-3d-person-woman-seated-on-chair-b792e2dc). Berbasis aset MakeHuman/MPFB CC0. |
| TV dan sofa ruang tunggu | [Flat-screen TV 55 inch](https://www.innerscene.com/tools/library/3d-parts/flat-screen-tv-55-inch-on-a-pedestal-stand-44fcc478) · [COAST sofa](https://www.innerscene.com/tools/library/3d-parts/coast-three-seat-outdoor-sofa-30a2b0e5) |
| Autoclave meja | [Autoclave](https://www.innerscene.com/tools/library/3d-parts/autoclave-6a9820dc) |

Furnitur lain, karpet mushola, lanskap, dan bangunan dirakit di `src/model.js`. Mode denah tetap tersedia saat model 3D sedang dimuat.
