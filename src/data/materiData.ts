import imgInfografisRasional from '../assets/images/infografis_bilangan_rasional_1790388067278.jpg';
import imgInfografisRasio from '../assets/images/infografis_rasio_proporsi_1790388085813.jpg';
import imgPasarTerapung from '../assets/images/stimulus_pasar_terapung_kalsel_1790388098367.jpg';
import imgPertanianWanaraya from '../assets/images/stimulus_pertanian_wanaraya_barito_kuala_1790388109456.jpg';

export interface LearningObjective {
  id: string;
  bab: string;
  code: string;
  title: string;
  description: string;
  bookPage: string;
  indicators: string[];
}

export interface InfographicPosterData {
  id: string;
  title: string;
  subtitle: string;
  bab: string;
  imageUrl: string;
  keyFormulas: { label: string; formula: string; note: string }[];
  steps: { number: string; heading: string; detail: string }[];
  kalselContext: string;
}

export const LEARNING_OBJECTIVES: LearningObjective[] = [
  {
    id: 'tp-2-1',
    bab: 'Bab 2 · Bilangan Rasional',
    code: 'TP.7.2.1',
    title: 'Penjumlahan dan Pengurangan Bilangan Rasional (Pecahan & Desimal)',
    description:
      'Melakukan operasi hitung penjumlahan dan pengurangan yang memuat bilangan rasional dalam bentuk pecahan dan bentuk desimal sekaligus melalui konversi ekuivalen.',
    bookPage: 'Halaman 61 – 63 (Eksplorasi 2.7)',
    indicators: [
      'Mengubah bilangan desimal menjadi pecahan biasa berpenyebut 10, 100, atau 1.000 (Strategi Siswa A).',
      'Mengubah pecahan biasa menjadi bentuk desimal sebelum menjumlahkan atau mengurangkan (Strategi Siswa B).',
      'Membandingkan kesamaan nilai hasil operasi antara bentuk pecahan dan desimal.',
    ],
  },
  {
    id: 'tp-2-2',
    bab: 'Bab 2 · Bilangan Rasional',
    code: 'TP.7.2.2',
    title: 'Perkalian dan Pembagian Bilangan Rasional Berbentuk Pecahan',
    description:
      'Menentukan hasil kali dua pecahan menggunakan model luas daerah persegi serta menyelesaikan pembagian pecahan menggunakan konsep bilangan resiprokal (kebalikan).',
    bookPage: 'Halaman 64 – 70 (Eksplorasi 2.8 & 2.9)',
    indicators: [
      'Menghitung ketercukupan takaran bahan resep makanan (Kue Nagasari) untuk kelipatan porsi tertentu.',
      'Merepresentasikan perkalian pecahan (a/b × c/d) sebagai luas daerah terarsir pada persegi 1 × 1.',
      'Menentukan resiprokal (kebalikan) suatu pecahan yang hasil kalinya sama dengan 1 untuk operasi pembagian.',
    ],
  },
  {
    id: 'tp-2-3',
    bab: 'Bab 2 · Bilangan Rasional',
    code: 'TP.7.2.3',
    title: 'Operasi Hitung Desimal, Literasi Finansial & Indeks Massa Tubuh (IMT)',
    description:
      'Menyelesaikan perkalian dan pembagian bilangan desimal serta memecahkan masalah kontekstual diskon harga, kurs mata uang, dan perhitungan Indeks Massa Tubuh.',
    bookPage: 'Halaman 71 – 82 (Eksplorasi 2.10, 2.11, Uji Kompetensi & Pengayaan)',
    indicators: [
      'Menentukan posisi tanda koma yang tepat pada perkalian dan pembagian bersusun bilangan desimal.',
      'Menganalisis potongan harga (diskon %), selisih kurs beli dan kurs jual mata uang asing.',
      'Menghitung Indeks Massa Tubuh (IMT = BB / TB²) dan menentukan kategori status gizi seseorang.',
    ],
  },
  {
    id: 'tp-3-1',
    bab: 'Bab 3 · Rasio',
    code: 'TP.7.3.1',
    title: 'Konsep Rasio, Bentuk Rasio, dan Perbedaannya dengan Pecahan',
    description:
      'Menjelaskan konsep rasio (a : b) sebagai perbandingan dua besaran, menyederhanakan rasio, serta membedakan antara konsep rasio dan konsep pecahan.',
    bookPage: 'Halaman 84 – 91 (Eksplorasi 3.1)',
    indicators: [
      'Menuliskan rasio dua besaran dalam bentuk paling sederhana (contoh 4 : 6 disederhanakan menjadi 2 : 3).',
      'Membedakan pecahan (bagian dari keseluruhan) dengan rasio (perbandingan bagian terhadap bagian).',
      'Menyatakan rasio dari komposisi persentase bahan (cokelat batang 80% dan larutan alkohol 70%).',
    ],
  },
  {
    id: 'tp-3-2',
    bab: 'Bab 3 · Rasio',
    code: 'TP.7.3.2',
    title: 'Membedakan Perbandingan Selisih (Penjumlahan) dan Rasio (Perkalian)',
    description:
      'Membedakan antara selisih yang merupakan perbandingan secara penjumlahan/pengurangan dengan rasio yang merupakan perbandingan secara perkalian/pembagian.',
    bookPage: 'Halaman 92 – 96 (Kasus Kepekatan Susu Cokelat & Ayo Berpikir Kritis)',
    indicators: [
      'Menentukan minuman susu cokelat mana yang memiliki rasa cokelat paling kuat pada berbagai perubahan takaran.',
      'Membuktikan bahwa dua campuran dengan selisih gelas yang sama (2 : 1 vs 5 : 4) memiliki kepekatan rasa yang berbeda.',
    ],
  },
  {
    id: 'tp-3-3',
    bab: 'Bab 3 · Rasio',
    code: 'TP.7.3.3',
    title: 'Faktor Skala, Rasio Ekuivalen, Proporsi & Laju Perubahan Satuan',
    description:
      'Menggunakan faktor skala untuk menyelesaikan masalah perbesaran atau pengecilan ukuran secara proporsional serta menerapkan laju perubahan satuan.',
    bookPage: 'Halaman 97 – 100 (Eksplorasi 3.2)',
    indicators: [
      'Menentukan rasio kemudahan bidang miring berdasarkan perbandingan panjang bidang miring terhadap ketinggiannya.',
      'Menyamakan satuan dua besaran (misal km dan m) sebelum menentukan rasio paling sederhana.',
      'Menghitung ukuran panjang dan lebar gambar/foto yang diperbesar atau diperkecil secara proporsional.',
    ],
  },
];

export const PERTANYAAN_PEMANTIK = [
  'Bagaimana melakukan operasi penjumlahan, pengurangan, perkalian, dan pembagian yang memuat bilangan rasional pecahan dan desimal sekaligus?',
  'Bagaimana membandingkan dua besaran dengan menggunakan rasio (a : b) dan apa perbedaannya dengan pecahan?',
  'Kapan kita membandingkan dua besaran menggunakan pembagian/perkalian (rasio) dan kapan menggunakan selisih?',
  'Bagaimana menentukan ukuran lukisan atau foto yang diperbesar agar tetap proporsional (sebangun)?',
  'Bagaimana menerapkan konsep bilangan rasional dan rasio untuk menyelesaikan masalah pertanian dan ekonomi di Kalimantan Selatan?',
];

export const KATA_KUNCI_MATERI = [
  'Bilangan Rasional',
  'Pecahan & Desimal',
  'Resiprokal (Kebalikan)',
  'Indeks Massa Tubuh (IMT)',
  'Rasio (a : b)',
  'Rasio Ekuivalen',
  'Proporsi',
  'Faktor Skala',
  'Laju Perubahan Satuan',
];

export const REFLEKSI_ITEMS = [
  'Apakah saya dapat mengidentifikasi bilangan yang termasuk bilangan rasional (pecahan dan desimal)?',
  'Apakah saya dapat melakukan operasi hitung penjumlahan dan pengurangan bilangan rasional pecahan dan desimal sekaligus?',
  'Apakah saya dapat melakukan operasi perkalian pecahan (model luas persegi) dan pembagian pecahan (metode resiprokal)?',
  'Apakah saya dapat menjelaskan konsep rasio (a : b) dan membedakannya dengan pecahan (bagian dari keseluruhan)?',
  'Apakah saya dapat membedakan antara perbandingan menggunakan selisih dan perbandingan menggunakan rasio pada kasus kepekatan susu cokelat?',
  'Apakah saya dapat menggunakan faktor skala dan proporsi untuk menentukan perbesaran/pengecilan ukuran gambar?',
  'Apakah saya dapat memecahkan masalah kontekstual sehari-hari yang melibatkan bilangan rasional dan rasio?',
];

export const DEFAULT_INFOGRAPHIC_POSTERS: InfographicPosterData[] = [
  {
    id: 'poster-bab-2',
    title: 'Operasi Hitung Bilangan Rasional: Pecahan & Desimal',
    subtitle: 'Ringkasan Visual Bab 2 Matematika SMP/MTs Kelas VII Fase D (Halaman 61–82)',
    bab: 'Bab 2 · Bilangan Rasional',
    imageUrl: imgInfografisRasional,
    keyFormulas: [
      {
        label: 'Penjumlahan & Pengurangan Campuran',
        formula: '2/5 + 0,3 = 4/10 + 3/10 = 7/10 = 0,7',
        note: 'Samakan bentuk ke pecahan seluruhnya (Siswa A) atau ke desimal seluruhnya (Siswa B).',
      },
      {
        label: 'Perkalian Pecahan (Model Luas)',
        formula: 'a/b × c/d = (a × c) / (b × d)',
        note: 'Contoh: 3/4 × 2/4 = 6/16 = 3/8 (Pembilang kali pembilang, penyebut kali penyebut).',
      },
      {
        label: 'Pembagian Pecahan (Resiprokal)',
        formula: 'a/b : c/d = a/b × d/c',
        note: 'Kalikan pecahan pertama dengan kebalikan (resiprokal) dari pecahan pembagi.',
      },
      {
        label: 'Indeks Massa Tubuh (IMT)',
        formula: 'IMT = Berat Badan (kg) / [Tinggi Badan (m)]²',
        note: 'Kategori Normal Kemenkes RI: 18,5 sampai 25,0.',
      },
    ],
    steps: [
      {
        number: '01',
        heading: 'Strategi Konversi Fleksibel',
        detail: 'Kenali pasangan pecahan-desimal istimewa: 1/2 = 0,5; 1/4 = 0,25; 3/4 = 0,75; 1/5 = 0,2; 3/20 = 0,15.',
      },
      {
        number: '02',
        heading: 'Aturan Koma pada Perkalian Desimal',
        detail: 'Jumlah angka di belakang koma pada hasil kali sama dengan total angka di belakang koma dari kedua bilangan yang dikalikan (contoh: 2,31 × 0,24 memiliki 2 + 2 = 4 angka di belakang koma yaitu 0,5544).',
      },
      {
        number: '03',
        heading: 'Penerapan Literasi Finansial',
        detail: 'Diskon 75% berarti potongan sebesar 75/100 dari harga awal, sehingga pembeli cukup membayar 25% dari harga awal.',
      },
    ],
    kalselContext:
      'Diterapkan pada perhitungan takaran resep Kue Nagasari (Pais Pisang Banjar), pembagian petak sawah rawa pasang surut di Kecamatan Wanaraya, dan evaluasi Posyandu Remaja Barito Kuala.',
  },
  {
    id: 'poster-bab-3',
    title: 'Konsep Rasio, Faktor Skala & Proporsi Ekuivalen',
    subtitle: 'Ringkasan Visual Bab 3 Matematika SMP/MTs Kelas VII Fase D (Halaman 83–100)',
    bab: 'Bab 3 · Rasio',
    imageUrl: imgInfografisRasio,
    keyFormulas: [
      {
        label: 'Bentuk Umum Rasio Paling Sederhana',
        formula: 'a : b = (a ÷ FPB) : (b ÷ FPB)',
        note: 'Contoh: 4 gelas susu : 6 gelas cokelat = 4 : 6 = 2 : 3 (Setiap 2 gelas susu terdapat 3 gelas cokelat).',
      },
      {
        label: 'Rasio vs Pecahan Bagian',
        formula: 'Rasio = a : b  |  Pecahan = a / (a + b)',
        note: 'Dari 4 susu dan 6 cokelat (total 10 gelas), rasio susu : cokelat = 2 : 3, sedangkan pecahan susu = 4/10.',
      },
      {
        label: 'Kemudahan Bidang Miring',
        formula: 'Rasio Kemudahan = Panjang Bidang Miring : Ketinggian',
        note: 'Semakin besar rasio panjang terhadap tinggi, semakin mudah memindahkan beban.',
      },
      {
        label: 'Proporsi & Faktor Skala (k)',
        formula: 'Lebar Baru / Lebar Asli = Tinggi Baru / Tinggi Asli = k',
        note: 'Menjaga rasio tinggi dan lebar agar perbesaran foto/kertas A4 ke A3 tetap sebangun.',
      },
    ],
    steps: [
      {
        number: '01',
        heading: 'Samakan Satuan Sebelum Membandingkan',
        detail: 'Jika membandingkan 11,2 km dengan 2.000 m, ubah keduanya ke meter: 11.200 m : 2.000 m = 28 : 5.',
      },
      {
        number: '02',
        heading: 'Bedakan Selisih dengan Rasio',
        detail: 'Campuran (2 cokelat : 1 susu) dan (5 cokelat : 4 susu) sama-sama berselisih 1 gelas, namun rasionya berbeda (2/1 = 2,00 > 5/4 = 1,25) sehingga campuran pertama lebih pekat.',
      },
      {
        number: '03',
        heading: 'Rasio pada Komposisi Persentase',
        detail: 'Cokelat batang dengan 65% cokelat murni dan 35% gula+susu memiliki rasio gula+susu terhadap cokelat murni = 35 : 65 = 7 : 13.',
      },
    ],
    kalselContext:
      'Diterapkan pada perbandingan muatan jukung Pasar Terapung Lok Baintan, bidang miring dermaga Sungai Barito, dan pemagaran kebun penelitian lahan basah SMP Negeri 1 Wanaraya.',
  },
];

export { imgInfografisRasional, imgInfografisRasio, imgPasarTerapung, imgPertanianWanaraya };
