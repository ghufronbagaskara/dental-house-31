export const zones = {
  public: { label: 'Publik', floor: '#d8bb91' },
  clinical: { label: 'Perawatan', floor: '#a9bec8' },
  staff: { label: 'Staf', floor: '#adb4ba' },
}

// x, z, lebar, panjang dalam meter. Fasad dan pintu masuk menghadap +z.
export const building = [0, 0, 23, 14]
export const corridor = [0, 6, 23, 2]
export const site = [-2, -4, 27, 25.6]
export const parking = {
  cars: [1.05, 15, 8.1, 5],
  scooters: [17.1, 16.3, 5.4, 2.5],
  dropOff: [13.95, 15, 2.7, 5],
}
export const rooms = [
  { id: '01', name: 'Resepsionis', short: 'Resepsionis', zone: 'public', rect: [8.8, 8, 5, 6], kind: 'reception', description: 'Meja pendaftaran berada tepat di sisi pintu masuk. Komputer, printer dan layar informasi mendukung registrasi, reservasi dan pembayaran.' },
  { id: '02', name: 'Ruang tunggu', short: 'Ruang tunggu', zone: 'public', rect: [4.4, 8, 4.4, 6], kind: 'lounge', description: 'Sofa, kursi, meja kecil, dispenser dan layar antrean melengkapi ruang tunggu. Akses dari resepsionis terbuka, dengan pandangan ke area bermain.' },
  { id: '03', name: 'Playground anak', short: 'Area bermain', zone: 'public', rect: [0, 8, 4.4, 6], kind: 'play', description: 'Area bermain beralas empuk dengan buku, balok dan papan edukasi gigi. Partisi rendah menjaga pandangan dari ruang tunggu.' },
  { id: '04', name: 'Mushola', short: 'Mushola', zone: 'public', rect: [13.8, 8, 3.4, 6], kind: 'prayer', description: 'Ruang ibadah dengan sajadah dan rak perlengkapan. Area wudhu berada di sebelahnya. Arah kiblat ditentukan setelah lokasi tapak diketahui.' },
  { id: '05', name: 'Toilet bersama', short: 'Toilet', zone: 'public', rect: [17.2, 8, 2.9, 3], kind: 'wc', description: 'Toilet pasien dan staf dibuka dari koridor. Kloset, wastafel dan ruang sirkulasi ditampilkan secara konseptual.' },
  { id: '06', name: 'Area wudhu', short: 'Wudhu', zone: 'public', rect: [17.2, 11, 2.9, 3], kind: 'wash', description: 'Area basah di samping mushola dengan keran dan tempat duduk. Aksesnya melalui mushola.' },
  { id: '07', name: 'Ruang perawatan anak', short: 'Perawatan anak', zone: 'clinical', rect: [0, 0, 5.2, 6], kind: 'kids', description: 'Kursi dental anak, lampu tindakan, wastafel instrumen dan kursi pendamping. Mural dan sudut Little Brave Smile memberi ruang untuk edukasi dan apresiasi setelah perawatan.' },
  { id: '08', name: 'Ruang praktik umum 1', short: 'Praktik umum 1', zone: 'clinical', rect: [5.2, 0, 5.2, 6], kind: 'general', description: 'Kursi dental elektrik, monitor, kursi operator dan asisten, serta konter dengan wastafel instrumen, ultrasonic cleaner dan autoclave. Radiografi intraoral direncanakan memakai perangkat portabel.' },
  { id: '09', name: 'Ruang praktik umum 2', short: 'Praktik umum 2', zone: 'clinical', rect: [10.4, 0, 5.4, 6], kind: 'general', description: 'Unit perawatan umum kedua dilengkapi konter pemrosesan instrumen dan monitor untuk menampilkan hasil radiografi intraoral dari alat portabel.' },
  { id: '10', name: 'Sterilisasi', short: 'Sterilisasi', zone: 'staff', rect: [15.8, 0, 3.6, 6], kind: 'sterile', description: 'Konter untuk alur instrumen kotor, pencucian, pengemasan dan autoclave, dengan penyimpanan steril di ujung alur.' },
  { id: '11', name: 'Penyimpanan alat dan bahan', short: 'Penyimpanan', zone: 'staff', rect: [19.4, 0, 3.6, 6], kind: 'storage', description: 'Kabinet tertutup berlabel dan meja persiapan untuk bahan habis pakai, instrumen cadangan dan pengecekan stok.' },
  { id: '12', name: 'Ruang tenaga kesehatan', short: 'Ruang staf', zone: 'staff', rect: [20.1, 8, 2.9, 3.4], kind: 'staff', description: 'Ruang kerja dan istirahat staf dengan meja, komputer, kabinet dan bangku. Ruang ganti APD terhubung dari sini.' },
  { id: '13', name: 'Donning dan doffing', short: 'Ganti APD', zone: 'staff', rect: [20.1, 11.4, 2.9, 2.6], kind: 'ppe', description: 'Sisi donning menyediakan kabinet APD dan cermin. Sisi doffing dilengkapi wastafel dan tempat sampah medis, dipisahkan oleh pembatas rendah.' },
  { id: '14', name: 'Ruang utilitas', short: 'Utilitas', zone: 'staff', rect: [19.4, -3, 3.6, 3], kind: 'utility', description: 'Ruang mesin suction dan instalasi pendukung dental unit. Pintu servis menghadap sisi luar bangunan.' },
  { id: '15', name: 'Parkir dan drop-off', short: 'Parkir', zone: 'public', rect: [0, 14, 23, 6.5], kind: 'parking', description: 'Parkir mobil di kiri dan motor di kanan. Jalur pejalan kaki di tengah menghubungkan area drop-off dengan pintu depan.' },
]

// x1, z1, x2, z2, jenis. Bukaan dihitung dari data yang sama untuk kedua tampilan.
export const walls = [
  [0, 0, 23, 0], [0, 0, 0, 14], [23, 0, 23, 14],
  [0, 14, 8.8, 14, 'glass'], [8.8, 14, 10.15, 14, 'glass'],
  [12.45, 14, 13.8, 14, 'glass'], [13.8, 14, 23, 14],
  ...rooms.filter(({ rect: [, z] }) => z === 0).flatMap(({ rect: [x, , w] }) => {
    const door = x + w - 1.95
    return [[x, 6, door, 6], [door + 1.35, 6, x + w, 6]]
  }),
  ...[5.2, 10.4, 15.8, 19.4].map((x) => [x, 0, x, 6]),
  [0, 8, 9.85, 8], [12.4, 8, 14.35, 8], [15.7, 8, 17.8, 8],
  [19.15, 8, 20.8, 8], [22.15, 8, 23, 8],
  [4.4, 8, 4.4, 11.4, 'low'], [4.4, 13, 4.4, 14, 'low'],
  [8.8, 8, 8.8, 10.3, 'low'], [8.8, 13.2, 8.8, 14, 'low'],
  [13.8, 8, 13.8, 14], [17.2, 8, 17.2, 11.55], [17.2, 12.8, 17.2, 14],
  [20.1, 8, 20.1, 14], [17.2, 11, 20.1, 11], [20.1, 11.4, 21.3, 11.4], [22.55, 11.4, 23, 11.4],
  [19.4, 0, 19.4, -3], [19.4, -3, 23, -3], [23, -3, 23, -2.2], [23, -0.9, 23, 0],
]
