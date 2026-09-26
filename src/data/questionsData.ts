export type QuestionType = 'PG' | 'PGK' | 'BS';
export type CognitiveLevel = 'Pemahaman' | 'Aplikasi' | 'Penalaran';

export interface VisualAttachment {
  type: 'table' | 'bar_chart' | 'infographic_card' | 'image_table' | 'fraction_grid';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  headers?: string[];
  rows?: (string | number)[][];
  chartData?: { label: string; value: number; secondaryValue?: number; unit: string; color?: string }[];
  gridConfig?: { rows: number; cols: number; shadedRows: number; shadedCols: number; caption: string };
  highlightNotes?: { label: string; value: string }[];
}

export interface StatementBS {
  id: string;
  text: string;
  isTrue: boolean; // True = Benar, False = Salah (Ketentuan: 3 pernyataan, terdapat 2 jawaban Benar dan 1 Salah)
}

export interface QuestionItem {
  id: number;
  code: string;
  bab: 'Bab 2 - Bilangan Rasional' | 'Bab 3 - Rasio';
  level: CognitiveLevel;
  weightPercent: number; // Bobot soal untuk skor akhir
  type: QuestionType;
  indicator: string;
  stimulusTitle: string;
  stimulusText: string; // ~100 kata tanpa memberi petunjuk jawaban
  reference: string;
  visual: VisualAttachment;
  instruction: string;
  questionPrompt: string;
  // For PG & PGK (4 opsi: A, B, C, D)
  options?: {
    id: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  // For PG (1 jawaban benar)
  correctOption?: 'A' | 'B' | 'C' | 'D';
  // For PGK (4 pernyataan, tepat 2 jawaban benar)
  correctOptions?: ('A' | 'B' | 'C' | 'D')[];
  // For BS (3 pernyataan, tepat 2 bernilai Benar dan 1 bernilai Salah)
  statements?: StatementBS[];
  // Pembahasan lengkap (terprotek password Suwarto)
  explanation: string;
}

import imgPasarTerapung from '../assets/images/stimulus_pasar_terapung_kalsel_1790388098367.jpg';
import imgPertanianWanaraya from '../assets/images/stimulus_pertanian_wanaraya_barito_kuala_1790388109456.jpg';
import imgInfografisRasional from '../assets/images/infografis_bilangan_rasional_1790388067278.jpg';
import imgInfografisRasio from '../assets/images/infografis_rasio_proporsi_1790388085813.jpg';

export const EXAM_QUESTIONS: QuestionItem[] = [
  // =========================================================================
  // LEVEL PEMAHAMAN (10% -> 2 SOAL: Nomor 1 dan Nomor 2)
  // =========================================================================
  {
    id: 1,
    code: 'MAT-7D-01',
    bab: 'Bab 2 - Bilangan Rasional',
    level: 'Pemahaman',
    weightPercent: 5,
    type: 'PG',
    indicator: 'Mengidentifikasi nilai ekuivalen bilangan rasional dalam bentuk pecahan dan desimal pada data hasil panen pertanian lahan rawa pasang surut.',
    stimulusTitle: 'Distribusi Panen Padi Lahan Rawa Pasang Surut Kecamatan Wanaraya',
    stimulusText:
      'Kecamatan Wanaraya di Kabupaten Barito Kuala dikenal sebagai salah satu lumbung pangan utama di Provinsi Kalimantan Selatan yang mengandalkan sistem pertanian lahan rawa pasang surut. Pada musim panen tahun ini, Kelompok Tani Karya Makmur di Desa Kolam Kanan mendata proporsi hasil panen gabah kering giling dari empat petak sawah percontohan. Sebagian petani mencatat proporsi hasil panen menggunakan satuan pecahan bagian dari total kapasitas lumbung desa, sedangkan petugas penyuluh lapangan mencatatnya menggunakan format bilangan desimal untuk keperluan pelaporan digital ke dinas kabupaten. Data pencatatan dari keempat petak sawah tersebut dirangkum secara berdampingan pada tabel pemantauan produksi.',
    reference: 'Sumber: Data Olahan Penyuluhan Pertanian Kecamatan Wanaraya, Dinas Pertanian Tanaman Pangan dan Hortikultura Kab. Barito Kuala (2026).',
    visual: {
      type: 'image_table',
      title: 'Tabel Proporsi Cadangan Gabah Kelompok Tani Karya Makmur',
      imageUrl: imgPertanianWanaraya,
      headers: ['Kode Petak Sawah', 'Varietas Padi', 'Catatan Petani (Pecahan)', 'Catatan Penyuluh (Desimal)'],
      rows: [
        ['Petak A (Kolam Kanan)', 'Siam Unus', '2/5 bagian', '0,40 bagian'],
        ['Petak B (Sidomulyo)', 'Inpari Rawa', '3/20 bagian', '0,35 bagian'],
        ['Petak C (Dwipasari)', 'Margasari', '7/25 bagian', '0,28 bagian'],
        ['Petak D (Waringin Kencana)', 'Ciherang', '3/8 bagian', '0,375 bagian'],
      ],
    },
    instruction: 'Pilihlah satu jawaban yang paling tepat dari pilihan A, B, C, atau D.',
    questionPrompt:
      'Berdasarkan tabel pencatatan proporsi cadangan gabah di atas, petak sawah manakah yang memiliki ketidaksesuaian nilai antara catatan bentuk pecahan petani dan catatan bentuk desimal penyuluh?',
    options: [
      { id: 'A', text: 'Petak A (Kolam Kanan) dengan varietas Siam Unus' },
      { id: 'B', text: 'Petak B (Sidomulyo) dengan varietas Inpari Rawa' },
      { id: 'C', text: 'Petak C (Dwipasari) dengan varietas Margasari' },
      { id: 'D', text: 'Petak D (Waringin Kencana) dengan varietas Ciherang' },
    ],
    correctOption: 'B',
    explanation:
      'Konversi pecahan ke desimal pada masing-masing petak:\n' +
      '• Petak A: 2/5 = 4/10 = 0,40 (Sesuai)\n' +
      '• Petak B: 3/20 = 15/100 = 0,15. Pada tabel tertulis 0,35 sehingga TIDAK SESUAI.\n' +
      '• Petak C: 7/25 = 28/100 = 0,28 (Sesuai)\n' +
      '• Petak D: 3/8 = 375/1000 = 0,375 (Sesuai)\n' +
      'Jadi, yang tidak sesuai adalah Petak B (Sidomulyo).',
  },
  {
    id: 2,
    code: 'MAT-7D-02',
    bab: 'Bab 3 - Rasio',
    level: 'Pemahaman',
    weightPercent: 5,
    type: 'BS',
    indicator: 'Membedakan konsep rasio sebagian terhadap sebagian dan pecahan sebagian terhadap keseluruhan pada data pedagang Pasar Terapung Lok Baintan.',
    stimulusTitle: 'Komoditas Perahu Jukung di Pasar Terapung Sungai Martapura',
    stimulusText:
      'Pasar Terapung di Kalimantan Selatan merupakan warisan budaya masyarakat sungai yang masih lestari hingga saat ini. Setiap pagi hari, puluhan pedagang perempuan menggunakan perahu tradisional yang disebut jukung untuk memperdagangkan hasil kebun dan pertanian lokal secara langsung di atas perairan sungai. Dalam satu kelompok tambatan perahu di dermaga wisata, petugas dinas pariwisata mendata jenis muatan utama yang dibawa oleh sepuluh jukung pedagang. Terdapat 4 jukung yang khusus memuat keranjang jeruk siam Banjar dan 6 jukung yang khusus memuat ikatan sayur kangkung rawa segar untuk dijual kepada wisatawan maupun warga sekitar.',
    reference: 'Sumber: Laporan Observasi Komoditas Wisata Sungai, Dinas Pariwisata Provinsi Kalimantan Selatan (2026).',
    visual: {
      type: 'image_table',
      title: 'Komposisi Muatan Kelompok Tambatan Jukung Pasar Terapung',
      imageUrl: imgPasarTerapung,
      headers: ['Jenis Komoditas Utama', 'Jumlah Jukung (Unit)', 'Satuan Pengamatan'],
      rows: [
        ['Jeruk Siam Banjar', 4, 'Perahu Jukung'],
        ['Sayur Kangkung Rawa', 6, 'Perahu Jukung'],
        ['Total Keseluruhan di Dermaga', 10, 'Perahu Jukung'],
      ],
    },
    instruction: 'Pilihlah Pernyataan berikut jawaban yang benar atau salah.',
    questionPrompt:
      'Tentukan nilai kebenaran (Benar atau Salah) dari ketiga pernyataan matematis mengenai perbandingan dan pecahan jumlah jukung di atas!',
    statements: [
      {
        id: 'S1',
        text: 'Rasio paling sederhana antara banyak jukung bermuatan jeruk siam Banjar terhadap jukung bermuatan sayur kangkung rawa adalah 2 : 3.',
        isTrue: true,
      },
      {
        id: 'S2',
        text: 'Bagian jukung bermuatan sayur kangkung rawa dari keseluruhan jukung di tambatan dermaga dapat dinyatakan dalam bentuk pecahan 3/5.',
        isTrue: true,
      },
      {
        id: 'S3',
        text: 'Rasio banyak jukung bermuatan sayur kangkung rawa terhadap jukung bermuatan jeruk siam Banjar memiliki arti bahwa untuk setiap 1 jukung kangkung terdapat 3 jukung jeruk.',
        isTrue: false,
      },
    ],
    explanation:
      '• Pernyataan 1 (BENAR): Banyak jukung jeruk : jukung kangkung = 4 : 6, disederhanakan dengan membagi kedua ruas dengan 2 menjadi 2 : 3.\n' +
      '• Pernyataan 2 (BENAR): Pecahan jukung kangkung terhadap total jukung = 6/10 = 3/5 bagian.\n' +
      '• Pernyataan 3 (SALAH): Rasio kangkung terhadap jeruk adalah 6 : 4 = 3 : 2, artinya untuk setiap 3 jukung kangkung terdapat 2 jukung jeruk.',
  },

  // =========================================================================
  // LEVEL APLIKASI (40% -> 8 SOAL: Nomor 3 s.d. Nomor 10)
  // =========================================================================
  {
    id: 3,
    code: 'MAT-7D-03',
    bab: 'Bab 2 - Bilangan Rasional',
    level: 'Aplikasi',
    weightPercent: 5,
    type: 'PG',
    indicator: 'Menyelesaikan operasi hitung penjumlahan dan pengurangan bilangan rasional yang memuat bentuk pecahan dan desimal sekaligus.',
    stimulusTitle: 'Pemeliharaan Saluran Tersier Rawa Pasang Surut di Barito Kuala',
    stimulusText:
      'Sistem tata air mikro pada lahan pertanian rawa pasang surut di Kabupaten Barito Kuala sangat bergantung pada kebersihan saluran tersier agar pertukaran air pasang dan surut berjalan lancar. Warga Desa Roham Raya mengadakan kegiatan gotong royong pembersihan saluran air sepanjang akhir pekan. Pada hari Sabtu pagi, warga berhasil membersihkan sebagian ruas saluran yang tercatat dalam bentuk pecahan kilometer. Pada hari Sabtu sore, warga melanjutkan pembersihan yang dicatat dalam satuan desimal kilometer. Namun, pada hari Minggu dini hari terjadi hujan deras sehingga sebagian tebing saluran mengalami longsoran lumpur dan harus dibersihkan ulang.',
    reference: 'Sumber: Balai Penelitian Pertanian Lahan Rawa (Balittra) Banjarbaru & Kecamatan Wanaraya (2026).',
    visual: {
      type: 'table',
      title: 'Catatan Progres Pembersihan Saluran Tersier Desa Roham Raya',
      headers: ['Tahap Kegiatan', 'Waktu Pelaksanaan', 'Panjang Saluran (km)', 'Keterangan'],
      rows: [
        ['Tahap I', 'Sabtu Pagi', '2/5 km', 'Pembersihan rumput liar dan eceng gondok'],
        ['Tahap II', 'Sabtu Sore', '0,75 km', 'Pengerukan endapan lumpur saluran'],
        ['Terdampak Longsor', 'Minggu Dini Hari', '3/20 km', 'Tertutup kembali oleh endapan tebing (mengurangi progres bersih)'],
      ],
    },
    instruction: 'Pilihlah satu jawaban yang paling tepat dari pilihan A, B, C, atau D.',
    questionPrompt:
      'Berapa kilometer panjang bersih saluran tersier yang telah berhasil diselesaikan warga setelah dikurangi bagian yang terdampak longsor?',
    options: [
      { id: 'A', text: '0,95 km' },
      { id: 'B', text: '1,00 km' },
      { id: 'C', text: '1,05 km' },
      { id: 'D', text: '1,30 km' },
    ],
    correctOption: 'B',
    explanation:
      'Operasi hitung bilangan rasional (pecahan & desimal):\n' +
      'Panjang bersih = (2/5 + 0,75) - 3/20\n' +
      'Strategi ubah ke desimal (Siswa B pada buku hlm. 61-62):\n' +
      '• 2/5 = 0,40 km\n' +
      '• 0,75 km\n' +
      '• 3/20 = 15/100 = 0,15 km\n' +
      'Maka: 0,40 + 0,75 - 0,15 = 1,15 - 0,15 = 1,00 km.',
  },
  {
    id: 4,
    code: 'MAT-7D-04',
    bab: 'Bab 2 - Bilangan Rasional',
    level: 'Aplikasi',
    weightPercent: 5,
    type: 'PGK',
    indicator: 'Menentukan ketercukupan bahan resep makanan tradisional menggunakan operasi perkalian bilangan rasional berbentuk pecahan campuran.',
    stimulusTitle: 'Produksi Kue Nagasari Pisang Talas UMKM Kuliner Marabahan',
    stimulusText:
      'Kue nagasari atau yang dikenal masyarakat Banjar sebagai pais pisang merupakan kudapan tradisional berbahan dasar tepung beras, santan kelapa, gula pasir, dan pisang lokal yang dibungkus daun pisang. Sebuah kelompok usaha peningkatan pendapatan keluarga (UP2K) di Kota Marabahan menerima pesanan kudapan tradisional untuk kegiatan musyawarah perencanaan pembangunan tingkat kecamatan. Resep warisan yang digunakan oleh juru masak kelompok tersebut dirancang untuk menghasilkan tepat 5 porsi kue setiap satu kali adonan. Untuk memenuhi seluruh pesanan panitia kegiatan, kelompok usaha tersebut harus membuat sebanyak 30 porsi kue nagasari dengan takaran bahan baku yang tersedia di dapur produksi.',
    reference: 'Sumber: Adaptasi Eksplorasi 2.8 Buku Matematika SMP/MTs Kelas VII Kemendikbudristek (Hlm. 64) & UMKM Kuliner Barito Kuala.',
    visual: {
      type: 'table',
      title: 'Tabel Resep Kue Nagasari (Untuk 5 Porsi) dan Stok Dapur UMKM',
      headers: ['Nama Bahan Baku', 'Takaran untuk 1 Resep (5 Porsi)', 'Persediaan Bahan di Dapur'],
      rows: [
        ['Tepung Beras Lokal', '1 3/4 cangkir', '10 cangkir'],
        ['Gula Pasir', '8 1/2 sendok makan (sdm)', '55 sendok makan (sdm)'],
        ['Santan Kelapa Kental', '3 1/2 cangkir', '21 cangkir'],
        ['Garam Halus', '1/2 sendok teh (sdt)', '4 sendok teh (sdt)'],
      ],
    },
    instruction: 'Pilihlah Pernyataan berikut jawaban pilih lebih dari 1 jawaban yang benar.',
    questionPrompt:
      'Untuk membuat 30 porsi kue nagasari, manakah di antara pernyataan ketercukupan bahan baku berikut yang benar?',
    options: [
      { id: 'A', text: 'Kebutuhan tepung beras untuk seluruh pesanan adalah 10 1/2 cangkir sehingga persediaan di dapur tidak cukup.' },
      { id: 'B', text: 'Kebutuhan gula pasir untuk seluruh pesanan adalah 48 sendok makan sehingga persediaan tersisa 7 sendok makan.' },
      { id: 'C', text: 'Kebutuhan santan kelapa kental untuk seluruh pesanan tepat sebanyak 21 cangkir sehingga persediaan di dapur cukup.' },
      { id: 'D', text: 'Persediaan garam halus di dapur masih kurang 1 sendok teh dari total kebutuhan adonan.' },
    ],
    correctOptions: ['A', 'C'],
    explanation:
      'Untuk membuat 30 porsi dari resep 5 porsi, diperlukan: 30 : 5 = 6 kali lipat resep.\n' +
      '• Tepung beras: 6 × 1 3/4 = 6 × 7/4 = 42/4 = 10 2/4 = 10 1/2 cangkir. Stok tersedia 10 cangkir (Tidak cukup) -> Opsi A BENAR.\n' +
      '• Gula pasir: 6 × 8 1/2 = 6 × 17/2 = 51 sdm. Stok 55 sdm, sisa 4 sdm (Bukan 48 sdm) -> Opsi B SALAH.\n' +
      '• Santan: 6 × 3 1/2 = 6 × 7/2 = 21 cangkir. Stok 21 cangkir (Cukup tepat) -> Opsi C BENAR.\n' +
      '• Garam: 6 × 1/2 = 3 sdt. Stok 4 sdt (Cukup, sisa 1 sdt) -> Opsi D SALAH.',
  },
  {
    id: 5,
    code: 'MAT-7D-05',
    bab: 'Bab 2 - Bilangan Rasional',
    level: 'Aplikasi',
    weightPercent: 5,
    type: 'PG',
    indicator: 'Menentukan hasil perkalian dua pecahan menggunakan representasi visual luas daerah persegi yang diarsir.',
    stimulusTitle: 'Zonasi Lahan Kebun Bibit Sekolah Adiwiyata SMP Negeri 1 Wanaraya',
    stimulusText:
      'Dalam rangka mendukung program Sekolah Adiwiyata di Kabupaten Barito Kuala, pengurus OSIS SMP Negeri 1 Wanaraya merancang petak kebun percontohan berbentuk persegi berukuran 1 dam × 1 dam di halaman belakang sekolah. Petak persegi tersebut dibagi menjadi 20 bagian persegi panjang kecil yang kongruen menggunakan tali rafia. Sebagian panjang petak dialokasikan untuk zona tanaman hortikultura organik, dan dari zona tersebut sebagian lebarnya ditanami bibit cabai rawit lokal jenis Hiyung khas Kalimantan Selatan. Denah pembagian petak lahan dan area tanaman cabai rawit yang diberi warna hijau ditunjukkan pada gambar pemetaan kebun sekolah.',
    reference: 'Sumber: Adaptasi Eksplorasi 2.8 Buku Matematika Kelas VII (Hlm. 65-66) & Program Adiwiyata SMPN 1 Wanaraya.',
    visual: {
      type: 'fraction_grid',
      title: 'Denah Petak Kebun Percontohan Ukuran 1 × 1 (Dibagi 5 Kolom × 4 Baris)',
      gridConfig: {
        cols: 5,
        rows: 4,
        shadedCols: 4,
        shadedRows: 3,
        caption: 'Area berwarna hijau menunjukkan bagian panjang (4 dari 5 bagian) dan bagian lebar (3 dari 4 bagian) yang ditanami cabai rawit.',
      },
    },
    instruction: 'Pilihlah satu jawaban yang paling tepat dari pilihan A, B, C, atau D.',
    questionPrompt:
      'Operasi perkalian pecahan dan nilai luas daerah yang ditanami bibit cabai rawit terhadap keseluruhan petak kebun sekolah adalah ....',
    options: [
      { id: 'A', text: '4/5 × 3/4 = 7/9 bagian petak' },
      { id: 'B', text: '4/5 × 3/4 = 3/5 bagian petak' },
      { id: 'C', text: '3/5 × 3/4 = 9/20 bagian petak' },
      { id: 'D', text: '1/5 × 1/4 = 1/20 bagian petak' },
    ],
    correctOption: 'B',
    explanation:
      'Berdasarkan gambar grid persegi 1 × 1:\n' +
      '• Panjang daerah terarsir = 4 dari 5 kolom = 4/5 bagian.\n' +
      '• Lebar daerah terarsir = 3 dari 4 baris = 3/4 bagian.\n' +
      '• Luas daerah terarsir = 4/5 × 3/4 = 12/20 = 3/5 bagian petak.',
  },
  {
    id: 6,
    code: 'MAT-7D-06',
    bab: 'Bab 2 - Bilangan Rasional',
    level: 'Aplikasi',
    weightPercent: 5,
    type: 'PG',
    indicator: 'Menyelesaikan masalah kontekstual pembagian bilangan rasional dalam bentuk desimal dan pecahan.',
    stimulusTitle: 'Pengemasan Kerajinan Tali Purun Desa Peduli Gambut Barito Kuala',
    stimulusText:
      'Tanaman purun tikus tumbuh subur di kawasan rawa gambut Kalimantan Selatan dan dimanfaatkan oleh perajin perempuan di Kabupaten Barito Kuala untuk dianyam menjadi tas ramah lingkungan, tikar, serta topi tradisional. Sebelum proses penganyaman dimulai, batang purun yang telah dikeringkan dan ditumbuk pipih dipilin menjadi gulungan tali purun yang panjang. Seorang perajin di Kecamatan Wanaraya memiliki dua gulungan tali purun kering dengan panjang berbeda. Seluruh gabungan tali purun dari kedua gulungan tersebut akan dipotong-potong sama panjang tanpa sisa untuk dijadikan tali pegangan tas suvenir dengan ukuran potongan tertentu.',
    reference: 'Sumber: Profil Kerajinan Anyaman Purun Lahan Basah Kalimantan Selatan, Dekranasda Kab. Barito Kuala (2026).',
    visual: {
      type: 'table',
      title: 'Spesifikasi Bahan Tali Purun Perajin UMKM',
      headers: ['Komponen Bahan', 'Ukuran Panjang (meter)', 'Keterangan Proses'],
      rows: [
        ['Gulungan Tali Purun Pertama', '14 3/4 meter', 'Bahan siap potong kualitas A'],
        ['Gulungan Tali Purun Kedua', '7,75 meter', 'Bahan siap potong kualitas A'],
        ['Ukuran Tiap Potongan Tali Tas', '1,25 meter', 'Kebutuhan 1 pasang pegangan tas'],
      ],
    },
    instruction: 'Pilihlah satu jawaban yang paling tepat dari pilihan A, B, C, atau D.',
    questionPrompt:
      'Berapa banyak potongan tali pegangan tas yang diperoleh perajin apabila seluruh tali purun dari kedua gulungan tersebut habis dipotong?',
    options: [
      { id: 'A', text: '15 potongan tali' },
      { id: 'B', text: '16 potongan tali' },
      { id: 'C', text: '18 potongan tali' },
      { id: 'D', text: '20 potongan tali' },
    ],
    correctOption: 'C',
    explanation:
      '1. Hitung total panjang tali purun:\n' +
      '   14 3/4 meter = 14,75 meter.\n' +
      '   Total panjang = 14,75 m + 7,75 m = 22,50 meter.\n' +
      '2. Bagi dengan panjang tiap potongan (1,25 meter):\n' +
      '   Banyak potongan = 22,5 : 1,25 = 2250 : 125 = 18 potongan tali.',
  },
  {
    id: 7,
    code: 'MAT-7D-07',
    bab: 'Bab 2 - Bilangan Rasional',
    level: 'Aplikasi',
    weightPercent: 5,
    type: 'BS',
    indicator: 'Menganalisis sisa bagian dan operasi pecahan bertingkat pada penjualan komoditas lokal selama bazar UMKM.',
    stimulusTitle: 'Bazar UMKM Jamu Tradisional dan Minuman Herbal di Balai Kota',
    stimulusText:
      'Dalam memeriahkan Hari Jadi Kabupaten Barito Kuala, pemerintah daerah menyelenggarakan Bazar UMKM di lapangan terbuka selama tiga hari berturut-turut. Seorang pelaku usaha minuman herbal khas Banjar membawa sejumlah botol jamu beras kencur dan kunyit asam dalam kotak pendingin untuk dipasarkan selama bazar berlangsung. Pada hari pertama pameran, sebagian dari total stok botol jamu yang dibawa berhasil terjual kepada pengunjung. Pada hari kedua, pelaku usaha tersebut kembali berhasil menjual sebagian dari sisa stok botol jamu yang belum terjual pada hari pertama. Selanjutnya pada hari ketiga, seluruh botol jamu yang tersisa habis terjual.',
    reference: 'Sumber: Adaptasi Uji Kompetensi Bab 2 Nomor 2 Buku Matematika Kelas VII (Hlm. 76-77) & Dinas Koperasi UKM Barito Kuala.',
    visual: {
      type: 'table',
      title: 'Rekapitulasi Proporsi Penjualan Stok Jamu UMKM Selama 3 Hari Bazar',
      headers: ['Hari Pelaksanaan', 'Proporsi Penjualan', 'Acuan Perhitungan Bagian'],
      rows: [
        ['Hari Pertama (Jumat)', '2/5 bagian', 'Dari total seluruh stok awal jamu yang dibawa'],
        ['Hari Kedua (Sabtu)', '1/2 bagian', 'Dari sisa stok jamu setelah penjualan hari pertama'],
        ['Hari Ketiga (Minggu)', 'Seluruh sisa', 'Menghabiskan seluruh stok yang tersisa dari hari kedua'],
      ],
    },
    instruction: 'Pilihlah Pernyataan berikut jawaban yang benar atau salah.',
    questionPrompt:
      'Berdasarkan data penjualan bertahap selama tiga hari bazar tersebut, tentukan Benar atau Salah untuk setiap pernyataan berikut!',
    statements: [
      {
        id: 'S1',
        text: 'Sisa stok jamu pada akhir hari pertama adalah 3/5 bagian dari total stok awal.',
        isTrue: true,
      },
      {
        id: 'S2',
        text: 'Bagian stok jamu yang terjual pada hari ketiga adalah 3/10 bagian dari total stok awal.',
        isTrue: true,
      },
      {
        id: 'S3',
        text: 'Jumlah stok jamu yang terjual pada hari kedua lebih banyak daripada yang terjual pada hari pertama.',
        isTrue: false,
      },
    ],
    explanation:
      'Misalkan total stok awal = 1 bagian utuh.\n' +
      '• Hari 1 terjual = 2/5 bagian. Sisa akhir Hari 1 = 1 - 2/5 = 3/5 bagian (Pernyataan 1 BENAR).\n' +
      '• Hari 2 terjual = 1/2 dari sisa Hari 1 = 1/2 × 3/5 = 3/10 bagian.\n' +
      '• Hari 3 terjual = Sisa akhir = 3/5 - 3/10 = 6/10 - 3/10 = 3/10 bagian dari stok awal (Pernyataan 2 BENAR).\n' +
      '• Perbandingan penjualan Hari 2 (3/10) dengan Hari 1 (2/5 = 4/10): 3/10 < 4/10, sehingga Hari 2 lebih sedikit daripada Hari 1 (Pernyataan 3 SALAH).',
  },
  {
    id: 8,
    code: 'MAT-7D-08',
    bab: 'Bab 3 - Rasio',
    level: 'Aplikasi',
    weightPercent: 5,
    type: 'PG',
    indicator: 'Menentukan rasio paling sederhana dari dua besaran dengan satuan berbeda setelah disamakan satuannya.',
    stimulusTitle: 'Jarak Tempuh Angkutan Sungai dan Jalan Raya di Kawasan Jembatan Barito',
    stimulusText:
      'Jembatan Barito yang membentang di atas Sungai Barito merupakan jalur penghubung vital antara Kabupaten Barito Kuala dengan Kota Banjarmasin. Seorang siswa SMP Negeri 1 Wanaraya melakukan pengamatan geografi mengenai perbandingan panjang bentang utama jembatan dan panjang ruas jalan pendekat di sekitar kawasan wisata Pulau Bakut. Dalam buku catatan lapangannya, panjang bentang jembatan utama dicatat menggunakan satuan meter, sedangkan panjang jalur jalan raya penghubung menuju simpang kecamatan dicatat menggunakan satuan kilometer. Agar kedua besaran panjang tersebut dapat dibandingkan menggunakan konsep rasio yang tepat, satuan keduanya harus disetarakan terlebih dahulu.',
    reference: 'Sumber: Data Infrastruktur Balai Pelaksanaan Jalan Nasional (BPJN) Kalimantan Selatan & Bab 3 Rasio (Hlm. 99).',
    visual: {
      type: 'table',
      title: 'Data Pengukuran Infrastruktur Kawasan Jembatan Barito',
      headers: ['Objek Pengukuran', 'Nilai Tercatat', 'Satuan Pengukuran'],
      rows: [
        ['Jalur Jalan Pendekat Simpang', '4,8', 'Kilometer (km)'],
        ['Bentang Jembatan Utama', '1.080', 'Meter (m)'],
      ],
    },
    instruction: 'Pilihlah satu jawaban yang paling tepat dari pilihan A, B, C, atau D.',
    questionPrompt:
      'Berapakah rasio paling sederhana dari panjang jalur jalan pendekat simpang terhadap panjang bentang jembatan utama?',
    options: [
      { id: 'A', text: '4 : 9' },
      { id: 'B', text: '12 : 27' },
      { id: 'C', text: '40 : 9' },
      { id: 'D', text: '48 : 108' },
    ],
    correctOption: 'C',
    explanation:
      'Samakan satuan ke dalam meter (m):\n' +
      '• Panjang jalur jalan pendekat = 4,8 km = 4,8 × 1.000 m = 4.800 m.\n' +
      '• Panjang bentang jembatan utama = 1.080 m.\n' +
      '• Rasio = 4.800 : 1.080\n' +
      'Bagi kedua bilangan dengan FPB dari 4.800 dan 1.080 yaitu 120:\n' +
      '4.800 : 120 = 40\n' +
      '1.080 : 120 = 9\n' +
      'Jadi rasio paling sederhana adalah 40 : 9.',
  },
  {
    id: 9,
    code: 'MAT-7D-09',
    bab: 'Bab 3 - Rasio',
    level: 'Aplikasi',
    weightPercent: 5,
    type: 'PGK',
    indicator: 'Menganalisis rasio komposisi bahan dalam bentuk persentase pada produk olahan cokelat dan susu lokal.',
    stimulusTitle: 'Olahan Cokelat Susu Kedelai Kelompok Tani Wanita Wanaraya',
    stimulusText:
      'Kelompok Wanita Tani (KWT) di Kecamatan Wanaraya mengembangkan produk camilan sehat berupa cokelat batang yang dipadukan dengan bubuk susu kedelai hasil panen lokal dan gula aren Kalimantan Selatan. Pada kemasan produk cokelat batang varian reguler, tercantum informasi komposisi bahan yang dinyatakan dalam bentuk persentase berat. Setiap kemasan cokelat batang yang diproduksi untuk koperasi sekolah memiliki berat bersih tertentu dalam satuan gram. Pengurus koperasi sekolah ingin mengetahui perbandingan berat antara kandungan cokelat murni dengan campuran gula aren serta susu bubuk kedelai pada berbagai ukuran kemasan produk.',
    reference: 'Sumber: Adaptasi Latihan 3.1 Nomor 3 Buku Matematika Kelas VII (Hlm. 96) & KWT Kecamatan Wanaraya.',
    visual: {
      type: 'infographic_card',
      title: 'Komposisi Produk Cokelat Batang KWT Wanaraya',
      subtitle: 'Informasi Nilai Komposisi Bahan per Kemasan',
      imageUrl: imgInfografisRasio,
      highlightNotes: [
        { label: 'Kandungan Cokelat Murni', value: '65% dari berat bersih' },
        { label: 'Campuran Gula Aren + Susu Bubuk', value: '35% dari berat bersih' },
        { label: 'Berat Kemasan Standar Koperasi', value: '130 gram per batang' },
      ],
    },
    instruction: 'Pilihlah Pernyataan berikut jawaban pilih lebih dari 1 jawaban yang benar.',
    questionPrompt:
      'Berdasarkan informasi komposisi produk cokelat batang di atas, pilihlah dua pernyataan yang bernilai benar!',
    options: [
      { id: 'A', text: 'Rasio paling sederhana dari berat campuran gula dan susu bubuk terhadap cokelat murni adalah 7 : 13.' },
      { id: 'B', text: 'Jika berat cokelat murni dalam satu kemasan khusus adalah 130 gram, maka berat campuran gula dan susu bubuknya adalah 70 gram.' },
      { id: 'C', text: 'Jika ditambahkan 20 gram cokelat murni dan 20 gram campuran gula susu, maka rasio komposisinya tetap 7 : 13.' },
      { id: 'D', text: 'Pada kemasan 200 gram, berat cokelat murni adalah 120 gram dan campuran gula susu adalah 80 gram.' },
    ],
    correctOptions: ['A', 'B'],
    explanation:
      '• Opsi A (BENAR): Rasio (gula + susu) : cokelat murni = 35% : 65% = 35 : 65. Dibagi 5 menjadi 7 : 13.\n' +
      '• Opsi B (BENAR): Karena rasio (gula+susu) : cokelat murni = 7 : 13, jika cokelat murni = 130 gram (13 × 10), maka berat gula dan susu = 7 × 10 = 70 gram.\n' +
      '• Opsi C (SALAH): Menambahkan jumlah gram yang sama pada kedua besaran akan mengubah nilai rasio (kecuali rasionya 1:1).\n' +
      '• Opsi D (SALAH): Pada kemasan 200 gram, berat cokelat murni = 65% × 200 = 130 gram (bukan 120 gram).',
  },
  {
    id: 10,
    code: 'MAT-7D-10',
    bab: 'Bab 3 - Rasio',
    level: 'Aplikasi',
    weightPercent: 5,
    type: 'PG',
    indicator: 'Menggunakan konsep faktor skala dan proporsi untuk menentukan ukuran lukisan/cetakan foto yang sebangun.',
    stimulusTitle: 'Pencetakan Poster Dokumentasi Sejarah Bahari di Museum Lambung Mangkurat',
    stimulusText:
      'Tim jurnalistik siswa SMP Negeri 1 Wanaraya mengikuti lomba pameran fotografi sejarah Kalimantan Selatan dengan menampilkan foto dokumentasi perahu tradisional pinisi dan jukung di pelabuhan tua. File foto asli yang diambil menggunakan kamera digital memiliki ukuran lebar dan tinggi tertentu dalam satuan sentimeter. Untuk dipasang pada papan pameran utama sekolah, foto tersebut harus diperbesar secara proporsional (kunci rasio tinggi dan lebar diaktifkan) sehingga bentuk objek di dalam foto tidak mengalami distorsi atau tampak gepeng. Panitia pameran telah menetapkan ukuran lebar bingkai papan pameran yang harus dipenuhi oleh tim jurnalistik.',
    reference: 'Sumber: Adaptasi Eksplorasi 3.2 Skala dan Rasio Ekuivalen Buku Matematika Kelas VII (Hlm. 100).',
    visual: {
      type: 'table',
      title: 'Pengaturan Skala Ukuran Dokumentasi Fotografi Pameran',
      headers: ['Parameter Ukuran', 'Lebar Gambar (cm)', 'Tinggi Gambar (cm)', 'Status Proporsi'],
      rows: [
        ['Ukuran Foto Asli', '13,5 cm', '9,0 cm', 'Ukuran Awal (100%)'],
        ['Kanvas Pameran Sekolah', '81,0 cm', '... cm', 'Kunci Rasio Tinggi-Lebar Aktif'],
      ],
    },
    instruction: 'Pilihlah satu jawaban yang paling tepat dari pilihan A, B, C, atau D.',
    questionPrompt:
      'Agar hasil cetakan poster pada kanvas pameran sekolah tetap proporsional dengan foto asli, berapakah ukuran tinggi kanvas pameran yang diperlukan?',
    options: [
      { id: 'A', text: '48,0 cm' },
      { id: 'B', text: '54,0 cm' },
      { id: 'C', text: '60,5 cm' },
      { id: 'D', text: '76,5 cm' },
    ],
    correctOption: 'B',
    explanation:
      'Rasio Lebar : Tinggi pada foto asli = 13,5 : 9,0 = 3 : 2.\n' +
      'Faktor skala perbesaran lebar = 81,0 : 13,5 = 6 kali.\n' +
      'Maka tinggi kanvas pameran = 9,0 cm × 6 = 54,0 cm.',
  },

  // =========================================================================
  // LEVEL PENALARAN (50% -> 10 SOAL: Nomor 11 s.d. Nomor 20)
  // =========================================================================
  {
    id: 11,
    code: 'MAT-7D-11',
    bab: 'Bab 2 - Bilangan Rasional',
    level: 'Penalaran',
    weightPercent: 5,
    type: 'PG',
    indicator: 'Menganalisis laju pertumbuhan berat ternak per minggu menggunakan operasi pengurangan bilangan rasional desimal pada tabel pengamatan.',
    stimulusTitle: 'Uji Coba Pakan Ternak Ayam Potong di Kecamatan Wanaraya',
    stimulusText:
      'Seorang peternak mandiri di Desa Sidomulyo, Kecamatan Wanaraya melakukan uji coba tiga formulasi pakan lokal berbahan campuran dedak padi rawa, jagung giling, dan tepung ikan rawa untuk meningkatkan bobot ayam potong di peternakannya. Tiga kelompok sampel ayam diberi jenis pakan berbeda (Pakan A, Pakan B, dan Pakan C) lalu ditimbang rata-rata berat badannya dalam satuan gram sejak menetas hingga minggu keempat secara berkala. Dinas Peternakan Kabupaten Barito Kuala mengevaluasi hasil penimbangan tersebut untuk menentukan formulasi pakan mana yang menghasilkan penambahan bobot paling optimal pada rentang waktu tertentu.',
    reference: 'Sumber: Adaptasi Uji Kompetensi Bab 2 Tabel 2.10 Buku Matematika Kelas VII (Hlm. 77) & Dinas Perkebunan dan Peternakan Kalsel.',
    visual: {
      type: 'table',
      title: 'Tabel Hasil Penimbangan Berat Rata-Rata Ayam Potong ( dalam gram )',
      headers: ['Kelompok Pakan', 'Saat Menetas (g)', 'Minggu 1 (g)', 'Minggu 2 (g)', 'Minggu 3 (g)', 'Minggu 4 (g)'],
      rows: [
        ['Ayam dengan Pakan A', '42,9', '152,6', '367,9', '732,7', '1.043,5'],
        ['Ayam dengan Pakan B', '41,5', '120,8', '338,1', '733,4', '1.112,8'],
        ['Ayam dengan Pakan C', '48,3', '155,4', '403,6', '824,0', '1.294,2'],
      ],
    },
    instruction: 'Pilihlah satu jawaban yang paling tepat dari pilihan A, B, C, atau D.',
    questionPrompt:
      'Berdasarkan analisis data tabel di atas, berapakah selisih penambahan berat sepanjang empat minggu (dari saat menetas hingga Minggu ke-4) antara kelompok ayam dengan penambahan berat tertinggi dan kelompok ayam dengan penambahan berat terendah?',
    options: [
      { id: 'A', text: '245,3 gram' },
      { id: 'B', text: '250,7 gram' },
      { id: 'C', text: '174,6 gram' },
      { id: 'D', text: '70,7 gram' },
    ],
    correctOption: 'A',
    explanation:
      'Hitung penambahan berat sepanjang 4 minggu (Berat Minggu 4 dikurangi Berat Saat Menetas):\n' +
      '• Pakan A: 1.043,5 - 42,9 = 1.000,6 gram (Terendah)\n' +
      '• Pakan B: 1.112,8 - 41,5 = 1.071,3 gram\n' +
      '• Pakan C: 1.294,2 - 48,3 = 1.245,9 gram (Tertinggi)\n' +
      'Selisih antara penambahan berat tertinggi (Pakan C) dan terendah (Pakan A):\n' +
      '1.245,9 - 1.000,6 = 245,3 gram.',
  },
  {
    id: 12,
    code: 'MAT-7D-12',
    bab: 'Bab 2 - Bilangan Rasional',
    level: 'Penalaran',
    weightPercent: 5,
    type: 'PGK',
    indicator: 'Memecahkan masalah jarak dan posisi relatif pada garis bilangan rasional desimal.',
    stimulusTitle: 'Rute Perjalanan Bersepeda Siswa Menuju SMP Negeri 1 Wanaraya',
    stimulusText:
      'Jalan poros utama di Kecamatan Wanaraya menghubungkan permukiman warga, fasilitas umum, dan gedung SMP Negeri 1 Wanaraya dalam satu garis lurus. Rumah Fajar berjarak 1,7 km dari gedung SMP Negeri 1 Wanaraya. Tepat di separuh jarak antara rumah Fajar dan gedung sekolah terdapat Koperasi Alat Tulis Desa, sedangkan Puskesmas Pembantu berada pada jarak 3/4 bagian dari total jarak sekolah menuju rumah Fajar (dihitung dari titik sekolah). Siang ini sepulang sekolah, Fajar mengayuh sepedanya menuju rumah dan saat ini posisinya tercatat berada sejauh 0,42 km dari gerbang sekolah.',
    reference: 'Sumber: Adaptasi Uji Kompetensi Bab 2 Nomor 4 Buku Matematika Kelas VII (Hlm. 77-78).',
    visual: {
      type: 'table',
      title: 'Data Titik Lokasi pada Jalan Poros Sekolah – Rumah Fajar',
      headers: ['Titik Lokasi', 'Posisi dari Gerbang Sekolah', 'Keterangan Lokasi'],
      rows: [
        ['Gerbang SMPN 1 Wanaraya', '0,00 km', 'Titik keberangkatan Fajar sepulang sekolah'],
        ['Posisi Fajar Saat Ini', '0,42 km', 'Sedang bersepeda menuju arah rumah'],
        ['Koperasi Alat Tulis Desa', '1/2 dari jarak total', 'Tempat Fajar akan singgah membeli buku'],
        ['Puskesmas Pembantu', '3/4 dari jarak total', 'Terletak antara Koperasi dan Rumah Fajar'],
        ['Rumah Fajar', '1,70 km', 'Tujuan akhir perjalanan pulang'],
      ],
    },
    instruction: 'Pilihlah Pernyataan berikut jawaban pilih lebih dari 1 jawaban yang benar.',
    questionPrompt:
      'Berdasarkan informasi posisi Fajar saat ini, manakah dua pernyataan berikut yang benar secara matematis?',
    options: [
      { id: 'A', text: 'Jarak yang harus ditempuh Fajar dari posisinya saat ini untuk sampai di Koperasi Alat Tulis Desa adalah 0,43 km.' },
      { id: 'B', text: 'Jarak yang masih harus ditempuh Fajar dari posisinya saat ini untuk sampai di rumah adalah 1,38 km.' },
      { id: 'C', text: 'Jarak antara Koperasi Alat Tulis Desa dan Puskesmas Pembantu adalah 0,425 km.' },
      { id: 'D', text: 'Posisi Fajar saat ini sudah melewati Koperasi Alat Tulis Desa sejauh 0,07 km.' },
    ],
    correctOptions: ['A', 'C'],
    explanation:
      '• Jarak Sekolah ke Rumah = 1,7 km.\n' +
      '• Posisi Koperasi Alat Tulis (separuh jarak) = 1,7 : 2 = 0,85 km dari sekolah.\n' +
      '• Posisi Fajar saat ini = 0,42 km dari sekolah.\n' +
      '• Jarak Fajar ke Koperasi = 0,85 - 0,42 = 0,43 km -> Opsi A BENAR.\n' +
      '• Sisa jarak Fajar ke Rumah = 1,70 - 0,42 = 1,28 km (bukan 1,38 km) -> Opsi B SALAH.\n' +
      '• Posisi Puskesmas Pembantu = 3/4 × 1,7 = 0,75 × 1,7 = 1,275 km dari sekolah.\n' +
      '  Jarak Koperasi ke Puskesmas = 1,275 - 0,85 = 0,425 km -> Opsi C BENAR.\n' +
      '• Fajar (0,42 km) belum melewati Koperasi (0,85 km) -> Opsi D SALAH.',
  },
  {
    id: 13,
    code: 'MAT-7D-13',
    bab: 'Bab 2 - Bilangan Rasional',
    level: 'Penalaran',
    weightPercent: 5,
    type: 'PG',
    indicator: 'Membandingkan harga akhir barang setelah dikenakan diskon persentase yang berbeda pada harga awal yang berbeda.',
    stimulusTitle: 'Program Diskon Perlengkapan Sekolah di Koperasi Pasar Marabahan',
    stimulusText:
      'Menjelang dimulainya tahun ajaran baru 2026/2027 di Kabupaten Barito Kuala, empat toko sepatu dan perlengkapan sekolah di kawasan Pasar Baru Marabahan memberikan program potongan harga (diskon) untuk produk sepatu olahraga pelajar dengan kualitas setara. Masing-masing toko menetapkan harga awal sebelum diskon dan persentase potongan harga yang berbeda-beda untuk menarik minat orang tua siswa. Pengurus komite sekolah mengimbau para siswa kelas VII untuk menerapkan kemampuan literasi finansial dengan menghitung harga bersih yang harus dibayarkan setelah dikurangi potongan diskon agar memperoleh pengeluaran paling hemat.',
    reference: 'Sumber: Adaptasi Uji Kompetensi Bab 2 Nomor 5 Buku Matematika Kelas VII (Hlm. 78-79).',
    visual: {
      type: 'bar_chart',
      title: 'Perbandingan Harga Awal dan Persentase Diskon Sepatu Pelajar',
      subtitle: 'Data Promosi Tahun Ajaran Baru di Pasar Baru Marabahan',
      chartData: [
        { label: 'Toko Barito Jaya (Diskon 70%)', value: 120000, secondaryValue: 70, unit: 'Rp120.000 | Diskon 70%' },
        { label: 'Toko Berlian (Diskon 75%)', value: 130000, secondaryValue: 75, unit: 'Rp130.000 | Diskon 75%' },
        { label: 'Toko Selidah (Diskon 65%)', value: 100000, secondaryValue: 65, unit: 'Rp100.000 | Diskon 65%' },
        { label: 'Toko Wangi (Diskon 80%)', value: 165000, secondaryValue: 80, unit: 'Rp165.000 | Diskon 80%' },
      ],
    },
    instruction: 'Pilihlah satu jawaban yang paling tepat dari pilihan A, B, C, atau D.',
    questionPrompt:
      'Jika seorang siswa ingin membeli sepasang sepatu dengan harga bayar paling murah setelah dipotong diskon, toko manakah yang harus dipilih dan berapa harga yang harus dibayar?',
    options: [
      { id: 'A', text: 'Toko Barito Jaya dengan harga bayar Rp36.000,00' },
      { id: 'B', text: 'Toko Berlian dengan harga bayar Rp32.500,00' },
      { id: 'C', text: 'Toko Selidah dengan harga bayar Rp35.000,00' },
      { id: 'D', text: 'Toko Wangi dengan harga bayar Rp33.000,00' },
    ],
    correctOption: 'B',
    explanation:
      'Hitung harga bayar setelah diskon pada masing-masing toko:\n' +
      '• Toko Barito Jaya: Diskon 70% -> Bayar 30% × Rp120.000 = Rp36.000,00\n' +
      '• Toko Berlian: Diskon 75% -> Bayar 25% × Rp130.000 = 1/4 × Rp130.000 = Rp32.500,00 (Paling Murah)\n' +
      '• Toko Selidah: Diskon 65% -> Bayar 35% × Rp100.000 = Rp35.000,00\n' +
      '• Toko Wangi: Diskon 80% -> Bayar 20% × Rp165.000 = Rp33.000,00\n' +
      'Jadi pilihan paling hemat adalah Toko Berlian (Rp32.500,00).',
  },
  {
    id: 14,
    code: 'MAT-7D-14',
    bab: 'Bab 2 - Bilangan Rasional',
    level: 'Penalaran',
    weightPercent: 5,
    type: 'BS',
    indicator: 'Menganalisis konversi mata uang asing (kurs jual dan kurs beli) menggunakan operasi perkalian dan pembagian bilangan desimal.',
    stimulusTitle: 'Literasi Finansial Pertukaran Pelajar dan Ekspor Kerajinan Kalimantan Selatan',
    stimulusText:
      'Seorang perajin sekaligus pendamping koperasi pemuda dari Kalimantan Selatan berencana mengikuti pameran dagang internasional di Seoul, Korea Selatan untuk memperkenalkan produk anyaman purun dan kain sasirangan. Sebelum keberangkatan, ia melakukan penukaran mata uang Rupiah (IDR) dengan mata uang Won Korea Selatan (KRW) di salah satu bank devisa di Banjarmasin. Bank menetapkan dua jenis kurs yang berbeda, yaitu Kurs Beli (nilai yang digunakan bank saat membeli mata uang asing dari nasabah) dan Kurs Jual (nilai yang digunakan bank saat menjual mata uang asing kepada nasabah).',
    reference: 'Sumber: Adaptasi Literasi Finansial Tabel 2.11 Buku Matematika Kelas VII (Hlm. 79-80).',
    visual: {
      type: 'table',
      title: 'Tabel Nilai Tukar Mata Uang Won Korea Selatan (KRW) terhadap Rupiah (IDR)',
      headers: ['Mata Uang Asing', 'Simbol', 'Kurs Beli Bank (IDR)', 'Kurs Jual Bank (IDR)'],
      rows: [
        ['Won Korea Selatan (1 KRW)', '₩', 'Rp11,75', 'Rp12,47'],
      ],
    },
    instruction: 'Pilihlah Pernyataan berikut jawaban yang benar atau salah.',
    questionPrompt:
      'Berdasarkan aturan transaksi Kurs Beli dan Kurs Jual pada tabel di atas, tentukan Benar atau Salah untuk setiap pernyataan berikut!',
    statements: [
      {
        id: 'S1',
        text: 'Untuk memperoleh uang sebesar 50.000 KRW dari bank guna keperluan transportasi di Seoul, perajin tersebut harus membayar sebesar Rp623.500,00.',
        isTrue: true,
      },
      {
        id: 'S2',
        text: 'Jika sepulang dari pameran perajin masih memiliki sisa uang sebesar 2.000 KRW dan menukarkannya kembali ke bank menjadi Rupiah, ia akan menerima Rp23.500,00.',
        isTrue: true,
      },
      {
        id: 'S3',
        text: 'Dengan anggaran sebesar Rp623.500,00 untuk membeli cendera mata, selisih antara kurs jual dan kurs beli untuk 1 KRW adalah Rp0,82.',
        isTrue: false,
      },
    ],
    explanation:
      '• Pernyataan 1 (BENAR): Saat nasabah membeli 50.000 KRW dari bank, berlaku Kurs Jual Bank (Rp12,47). Biaya = 50.000 × 12,47 = Rp623.500,00.\n' +
      '• Pernyataan 2 (BENAR): Saat nasabah menjual sisa 2.000 KRW ke bank, berlaku Kurs Beli Bank (Rp11,75). Uang diterima = 2.000 × 11,75 = Rp23.500,00.\n' +
      '• Pernyataan 3 (SALAH): Selisih nilai jual dan nilai beli untuk 1 KRW adalah 12,47 - 11,75 = Rp0,72 (bukan Rp0,82).',
  },
  {
    id: 15,
    code: 'MAT-7D-15',
    bab: 'Bab 2 - Bilangan Rasional',
    level: 'Penalaran',
    weightPercent: 5,
    type: 'PGK',
    indicator: 'Mengevaluasi Indeks Massa Tubuh (IMT) dan menentukan penambahan atau pengurangan berat badan agar mencapai kategori normal.',
    stimulusTitle: 'Pemeriksaan Kesehatan dan Gizi Posyandu Remaja Kecamatan Wanaraya',
    stimulusText:
      'Puskesmas Kecamatan Wanaraya secara rutin menyelenggarakan kegiatan pemeriksaan status gizi masyarakat menggunakan indikator Indeks Massa Tubuh (IMT) atau Body Mass Index (BMI). Nilai IMT dihitung dengan cara membagi berat badan dalam satuan kilogram (kg) dengan kuadrat tinggi badan dalam satuan meter (m²), yaitu IMT = BB / (TB)². Petugas gizi mendata berat badan dan tinggi badan dari empat warga yang hadir dalam penyuluhan kesehatan desa, kemudian membandingkan hasilnya dengan tabel standar kategori IMT Kementerian Kesehatan Republik Indonesia untuk memberikan rekomendasi penambahan atau pengurangan berat badan.',
    reference: 'Sumber: Adaptasi Pengayaan Tabel 2.12 & 2.13 Buku Matematika Kelas VII (Hlm. 81-82) & Kemenkes RI.',
    visual: {
      type: 'table',
      title: 'Data Pengukuran Antropometri Warga & Acuan Kategori IMT Normal (18,5 – 25,0)',
      headers: ['Nama Warga', 'Berat Badan (kg)', 'Tinggi Badan (m)', 'Kuadrat Tinggi Badan (TB²)'],
      rows: [
        ['Pak Ananta', '81,0 kg', '1,80 m', '3,24 m²'],
        ['Pak Bintoro', '50,0 kg', '1,70 m', '2,89 m²'],
        ['Bu Dian', '60,8 kg', '1,60 m', '2,56 m²'],
        ['Pak Erlangga', '75,0 kg', '1,50 m', '2,25 m²'],
      ],
    },
    instruction: 'Pilihlah Pernyataan berikut jawaban pilih lebih dari 1 jawaban yang benar.',
    questionPrompt:
      'Jika batas kategori IMT Normal adalah 18,5 sampai 25,0 (Kekurangan ringan: 17,0–18,4; Kelebihan berat: > 27,0), manakah dua pernyataan evaluasi kesehatan berikut yang benar?',
    options: [
      { id: 'A', text: 'Pak Ananta memiliki nilai IMT tepat 25,0 sehingga masih berada pada batas atas kategori Normal.' },
      { id: 'B', text: 'Pak Bintoro perlu menambah berat badan minimal 3,465 kg agar mencapai batas bawah IMT Normal sebesar 18,5.' },
      { id: 'C', text: 'Bu Dian memiliki nilai IMT sebesar 26,25 sehingga termasuk kategori kelebihan berat badan tingkat ringan.' },
      { id: 'D', text: 'Pak Erlangga harus mengurangi berat badan sebanyak 12,5 kg agar mencapai nilai IMT tepat 25,0.' },
    ],
    correctOptions: ['A', 'B'],
    explanation:
      'Mari hitung nilai IMT dan target berat badan masing-masing:\n' +
      '• Pak Ananta: IMT = 81,0 / 3,24 = 25,0 (Tepat batas atas Normal) -> Opsi A BENAR.\n' +
      '• Pak Bintoro: IMT saat ini = 50 / 2,89 ≈ 17,30 (Kekurangan ringan). Agar mencapai IMT = 18,5, berat badan yang diperlukan = 18,5 × 2,89 = 53,465 kg. Tambahan berat badan = 53,465 - 50,0 = 3,465 kg -> Opsi B BENAR.\n' +
      '• Bu Dian: IMT = 60,8 / 2,56 = 23,75 (Normal, bukan 26,25) -> Opsi C SALAH.\n' +
      '• Pak Erlangga: Agar IMT = 25,0 pada TB² = 2,25, berat target = 25 × 2,25 = 56,25 kg. Berat yang harus dikurangi = 75,0 - 56,25 = 18,75 kg (bukan 12,5 kg) -> Opsi D SALAH.',
  },
  {
    id: 16,
    code: 'MAT-7D-16',
    bab: 'Bab 3 - Rasio',
    level: 'Penalaran',
    weightPercent: 5,
    type: 'PG',
    indicator: 'Membedakan perbandingan secara penjumlahan (selisih) dan perbandingan secara perkalian (rasio) dalam menentukan kepekatan campuran.',
    stimulusTitle: 'Eksperimen Kepekatan Minuman Susu Cokelat Koperasi Siswa',
    stimulusText:
      'Dalam kegiatan praktik mata pelajaran Matematika kelas VII di SMP Negeri 1 Wanaraya, empat kelompok siswa menyiapkan minuman susu cokelat di dalam teko besar dengan mencampurkan beberapa gelas takar cokelat murni dan beberapa gelas takar susu cair. Kelompok I dan Kelompok III mengamati bahwa selisih antara jumlah gelas cokelat dan gelas susu pada teko mereka sama-sama berselisih 2 gelas. Guru meminta seluruh siswa menganalisis teko kelompok manakah yang akan menghasilkan rasa cokelat paling pekat (paling kuat) ketika dicicipi berdasarkan konsep rasio matematika.',
    reference: 'Sumber: Adaptasi Ayo Berpikir Kritis Bab 3 Buku Matematika Kelas VII (Hlm. 92-94).',
    visual: {
      type: 'table',
      title: 'Tabel Takaran Campuran Cokelat dan Susu pada Empat Kelompok Siswa',
      headers: ['Kelompok Praktik', 'Banyak Gelas Cokelat', 'Banyak Gelas Susu', 'Selisih Gelas (Cokelat - Susu)'],
      rows: [
        ['Kelompok I (Teko A)', '5 gelas', '3 gelas', '2 gelas'],
        ['Kelompok II (Teko B)', '7 gelas', '4 gelas', '3 gelas'],
        ['Kelompok III (Teko C)', '8 gelas', '6 gelas', '2 gelas'],
        ['Kelompok IV (Teko D)', '9 gelas', '6 gelas', '3 gelas'],
      ],
    },
    instruction: 'Pilihlah satu jawaban yang paling tepat dari pilihan A, B, C, atau D.',
    questionPrompt:
      'Berdasarkan konsep perbandingan secara perkalian (rasio), teko milik kelompok manakah yang memiliki rasa cokelat paling kuat (paling pekat)?',
    options: [
      { id: 'A', text: 'Kelompok I (Teko A) karena rasio cokelat terhadap susu adalah 5 : 3' },
      { id: 'B', text: 'Kelompok II (Teko B) karena rasio cokelat terhadap susu adalah 7 : 4' },
      { id: 'C', text: 'Kelompok III (Teko C) karena jumlah gelas cokelatnya lebih banyak dari Kelompok I' },
      { id: 'D', text: 'Kelompok IV (Teko D) karena jumlah gelas cokelatnya paling banyak yaitu 9 gelas' },
    ],
    correctOption: 'B',
    explanation:
      'Kepekatan rasa cokelat ditentukan oleh nilai rasio (Cokelat : Susu), bukan oleh selisih atau jumlah gelas semata:\n' +
      '• Kelompok I: 5 : 3 = 5/3 ≈ 1,667\n' +
      '• Kelompok II: 7 : 4 = 7/4 = 1,750 (Nilai rasio terbesar -> Rasa cokelat paling kuat)\n' +
      '• Kelompok III: 8 : 6 = 4/3 ≈ 1,333\n' +
      '• Kelompok IV: 9 : 6 = 3/2 = 1,500\n' +
      'Jadi yang paling pekat adalah Kelompok II (7 : 4 = 1,75).',
  },
  {
    id: 17,
    code: 'MAT-7D-17',
    bab: 'Bab 3 - Rasio',
    level: 'Penalaran',
    weightPercent: 5,
    type: 'PG',
    indicator: 'Menggunakan konsep rasio panjang bidang miring terhadap ketinggian untuk menentukan tingkat kemudahan memindahkan beban.',
    stimulusTitle: 'Pemindahan Karung Gabah ke Atas Dermaga Gudang Bulog Marabahan',
    stimulusText:
      'Di pelabuhan bongkar muat hasil pertanian Sungai Barito, para pekerja menggunakan papan bidang miring untuk memudahkan pemindahan drum minyak goreng dan karung beras dari atas kapal menuju lantai dermaga gudang yang lebih tinggi. Dalam prinsip fisika dan matematika terapan, tingkat kemudahan (keuntungan mekanis) suatu bidang miring dinyatakan melalui rasio antara panjang papan bidang miring terhadap ketinggian tegak lurus dermaga. Semakin besar nilai rasio panjang bidang miring terhadap ketinggiannya, semakin ringan tenaga yang diperlukan pekerja untuk mendorong beban ke atas.',
    reference: 'Sumber: Adaptasi Latihan 3.1 Nomor 8 Tabel 3.4 Buku Matematika Kelas VII (Hlm. 98-99).',
    visual: {
      type: 'table',
      title: 'Spesifikasi Empat Jalur Papan Bidang Miring di Dermaga Gudang',
      headers: ['Kode Jalur', 'Panjang Papan Bidang Miring (cm)', 'Ketinggian Dermaga (cm)'],
      rows: [
        ['Bidang Miring P', '180 cm', '120 cm'],
        ['Bidang Miring Q', '210 cm', '70 cm'],
        ['Bidang Miring R', '250 cm', '80 cm'],
        ['Bidang Miring S', '240 cm', '90 cm'],
      ],
    },
    instruction: 'Pilihlah satu jawaban yang paling tepat dari pilihan A, B, C, atau D.',
    questionPrompt:
      'Urutan jalur bidang miring dari yang PALING MEMUDAHKAN pekerja hingga yang paling berat untuk memindahkan beban adalah ....',
    options: [
      { id: 'A', text: 'Bidang Miring R – Bidang Miring Q – Bidang Miring S – Bidang Miring P' },
      { id: 'B', text: 'Bidang Miring Q – Bidang Miring R – Bidang Miring S – Bidang Miring P' },
      { id: 'C', text: 'Bidang Miring R – Bidang Miring S – Bidang Miring Q – Bidang Miring P' },
      { id: 'D', text: 'Bidang Miring P – Bidang Miring S – Bidang Miring Q – Bidang Miring R' },
    ],
    correctOption: 'A',
    explanation:
      'Hitung nilai rasio (Panjang Bidang Miring : Ketinggian):\n' +
      '• Bidang Miring P: 180 : 120 = 1,50\n' +
      '• Bidang Miring Q: 210 : 70 = 3,00\n' +
      '• Bidang Miring R: 250 : 80 = 3,125 (Rasio terbesar -> Paling memudahkan)\n' +
      '• Bidang Miring S: 240 : 90 = 8/3 ≈ 2,67\n' +
      'Urutan dari yang paling memudahkan (rasio terbesar ke terkecil): R (3,125) -> Q (3,00) -> S (2,67) -> P (1,50).',
  },
  {
    id: 18,
    code: 'MAT-7D-18',
    bab: 'Bab 3 - Rasio',
    level: 'Penalaran',
    weightPercent: 5,
    type: 'BS',
    indicator: 'Menganalisis rasio pada data statistik angka putus sekolah menurut tipe daerah dan jenis kelamin.',
    stimulusTitle: 'Analisis Statistik Pendidikan Daerah Perkotaan dan Perdesaan',
    stimulusText:
      'Pemerintah Provinsi Kalimantan Selatan terus berupaya menekan angka putus sekolah melalui program bantuan pendidikan daerah dan penyediaan angkutan pelajar gratis di kawasan perdesaan maupun pinggiran sungai. Dalam rapat evaluasi pendidikan, disajikan tabel data persentase angka putus sekolah pada tiga jenjang pendidikan (SD/sederajat, SMP/sederajat, dan SMA/sederajat) yang dikelompokkan berdasarkan karakteristik wilayah tempat tinggal (perkotaan dan perdesaan) serta jenis kelamin peserta didik. Tim perencana pendidikan menggunakan konsep rasio untuk membandingkan ketimpangan antarwilayah dan antarjenjang pendidikan.',
    reference: 'Sumber: Adaptasi Tabel 3.3 Angka Putus Sekolah Badan Pusat Statistik (BPS) dalam Buku Matematika Kelas VII (Hlm. 98).',
    visual: {
      type: 'table',
      title: 'Tabel Persentase Angka Putus Sekolah Menurut Karakteristik dan Jenjang',
      headers: ['Karakteristik Wilayah / Gender', 'SD / Sederajat (%)', 'SMP / Sederajat (%)', 'SMA / Sederajat (%)'],
      rows: [
        ['Wilayah Perkotaan', '0,36', '0,85', '1,67'],
        ['Wilayah Perdesaan', '0,39', '1,36', '1,92'],
        ['Jenis Kelamin Laki-laki', '0,39', '1,14', '1,80'],
        ['Jenis Kelamin Perempuan', '0,36', '0,95', '1,73'],
      ],
    },
    instruction: 'Pilihlah Pernyataan berikut jawaban yang benar atau salah.',
    questionPrompt:
      'Berdasarkan data statistik pada tabel di atas, tentukan nilai kebenaran (Benar atau Salah) dari ketiga pernyataan berikut!',
    statements: [
      {
        id: 'S1',
        text: 'Rasio paling sederhana dari angka putus sekolah jenjang SD/sederajat di wilayah perdesaan terhadap wilayah perkotaan adalah 13 : 12.',
        isTrue: true,
      },
      {
        id: 'S2',
        text: 'Rasio paling sederhana dari angka putus sekolah jenjang SMP/sederajat untuk laki-laki terhadap perempuan adalah 6 : 5.',
        isTrue: true,
      },
      {
        id: 'S3',
        text: 'Rasio angka putus sekolah jenjang SMP/sederajat di wilayah perkotaan terhadap perdesaan adalah 8 : 5.',
        isTrue: false,
      },
    ],
    explanation:
      '• Pernyataan 1 (BENAR): SD Perdesaan : SD Perkotaan = 0,39 : 0,36 = 39 : 36. Dibagi 3 menghasilkan 13 : 12.\n' +
      '• Pernyataan 2 (BENAR): SMP Laki-laki : SMP Perempuan = 1,14 : 0,95 = 114 : 95. Dibagi 19 menghasilkan 6 : 5 (karena 19 × 6 = 114 dan 19 × 5 = 95).\n' +
      '• Pernyataan 3 (SALAH): SMP Perkotaan : SMP Perdesaan = 0,85 : 1,36 = 85 : 136. Dibagi 17 menghasilkan 5 : 8 (bukan 8 : 5).',
  },
  {
    id: 19,
    code: 'MAT-7D-19',
    bab: 'Bab 3 - Rasio',
    level: 'Penalaran',
    weightPercent: 5,
    type: 'PGK',
    indicator: 'Memecahkan masalah pencampuran larutan kimia/alkohol menggunakan konsep rasio dan persentase volume.',
    stimulusTitle: 'Pembuatan Cairan Antiseptik di Laboratorium IPA SMP Negeri 1 Wanaraya',
    stimulusText:
      'Dalam kegiatan praktikum IPA terpadu yang berkolaborasi dengan mata pelajaran Matematika, siswa kelas VII SMP Negeri 1 Wanaraya mempelajari pembuatan cairan pembersih tangan (antiseptik) sesuai standar kesehatan. Di meja laboratorium tersedia tiga botol larutan alkohol dengan konsentrasi persentase yang berbeda, yaitu larutan 90%, larutan 80%, dan larutan 70%. Larutan alkohol 70% memiliki arti bahwa dalam setiap 100 mililiter (ml) campuran larutan terdapat 70 ml alkohol murni dan sisanya berupa air suling (aquades). Guru meminta siswa menghitung volume masing-masing komponen dan rasionya jika volume botol diubah.',
    reference: 'Sumber: Adaptasi Latihan 3.1 Nomor 5 Tabel 3.2 Buku Matematika Kelas VII (Hlm. 96-97).',
    visual: {
      type: 'table',
      title: 'Tabel Pengamatan Konsentrasi Larutan Alkohol di Laboratorium Sekolah',
      headers: ['Kode Botol', 'Konsentrasi Alkohol', 'Volume Total Larutan (ml)', 'Komponen Pelarut'],
      rows: [
        ['Botol Lab A', '90%', '150 ml', 'Air Suling (Aquades)'],
        ['Botol Lab B', '80%', '250 ml', 'Air Suling (Aquades)'],
        ['Botol Lab C', '70%', '300 ml', 'Air Suling (Aquades)'],
      ],
    },
    instruction: 'Pilihlah Pernyataan berikut jawaban pilih lebih dari 1 jawaban yang benar.',
    questionPrompt:
      'Berdasarkan data ketiga botol larutan alkohol di laboratorium tersebut, manakah dua pernyataan yang benar?',
    options: [
      { id: 'A', text: 'Pada Botol Lab C (300 ml larutan alkohol 70%), volume alkohol murninya adalah 210 ml dan volume air sulingnya adalah 90 ml.' },
      { id: 'B', text: 'Selisih volume alkohol murni antara Botol Lab C dan Botol Lab B adalah 20 ml.' },
      { id: 'C', text: 'Jika larutan Botol Lab A dan Botol Lab B dicampurkan seluruhnya, maka rasio total alkohol murni terhadap total air suling menjadi 67 : 13.' },
      { id: 'D', text: 'Agar Botol Lab B (250 ml larutan 80%) berubah rasionya menjadi alkohol : air = 2 : 1, perlu ditambahkan 25 ml air suling.' },
    ],
    correctOptions: ['A', 'C'],
    explanation:
      'Mari hitung kandungan masing-masing botol:\n' +
      '• Botol A (150 ml, 90%): Alkohol = 0,9 × 150 = 135 ml; Air = 15 ml.\n' +
      '• Botol B (250 ml, 80%): Alkohol = 0,8 × 250 = 200 ml; Air = 50 ml.\n' +
      '• Botol C (300 ml, 70%): Alkohol = 0,7 × 300 = 210 ml; Air = 90 ml -> Opsi A BENAR.\n' +
      '• Selisih alkohol Botol C (210 ml) dan Botol B (200 ml) adalah 10 ml (bukan 20 ml) -> Opsi B SALAH.\n' +
      '• Campuran Botol A + Botol B: Total Alkohol = 135 + 200 = 335 ml; Total Air = 15 + 50 = 65 ml. Rasio Alkohol : Air = 335 : 65, dibagi 5 menjadi 67 : 13 -> Opsi C BENAR.\n' +
      '• Pada Botol B (Alkohol 200 ml, Air 50 ml), agar rasio menjadi 2 : 1 (200 ml : 100 ml), air yang harus ditambahkan adalah 100 - 50 = 50 ml (bukan 25 ml) -> Opsi D SALAH.',
  },
  {
    id: 20,
    code: 'MAT-7D-20',
    bab: 'Bab 3 - Rasio',
    level: 'Penalaran',
    weightPercent: 5,
    type: 'PG',
    indicator: 'Menyelesaikan masalah kontekstual yang mengintegrasikan keliling bangun datar, rasio bilangan bulat, dan luas maksimum pada kebun penelitian sekolah.',
    stimulusTitle: 'Pemagaran Kebun Penelitian Ekosistem Lahan Basah SMPN 1 Wanaraya',
    stimulusText:
      'Kelompok Ilmiah Remaja (KIR) SMP Negeri 1 Wanaraya mendapatkan gulungan kawat jaring pembatas sepanjang 24 meter untuk memagari sebidang lahan berbentuk persegi panjang yang akan dijadikan petak penelitian ekosistem tanaman rawa. Seluruh kawat jaring sepanjang 24 meter tersebut digunakan tepat mengelilingi keempat sisi persegi panjang tanpa sisa. Pembina KIR menetapkan aturan bahwa rasio antara ukuran panjang terhadap ukuran lebar petak kebun harus dinyatakan dalam bilangan bulat sederhana, dan ukuran panjang maupun lebarnya merupakan bilangan bulat dalam satuan meter.',
    reference: 'Sumber: Adaptasi Latihan 3.1 Nomor 7 Buku Matematika Kelas VII (Hlm. 98).',
    visual: {
      type: 'table',
      title: 'Alternatif Rancangan Rasio Panjang terhadap Lebar Petak Kebun (Keliling = 24 m)',
      headers: ['Kode Desain', 'Rasio Panjang : Lebar', 'Syarat Keliling 2 × (p + l)', 'Tujuan Penggunaan'],
      rows: [
        ['Desain I', '5 : 1', '24 meter', 'Jalur tanam memanjang tepi parit'],
        ['Desain II', '3 : 1', '24 meter', 'Petak pembibitan tanaman purun'],
        ['Desain III', '2 : 1', '24 meter', 'Petak kompos dan tanaman obat'],
        ['Desain IV', '7 : 5', '24 meter', 'Petak utama observasi biodiversitas'],
      ],
    },
    instruction: 'Pilihlah satu jawaban yang paling tepat dari pilihan A, B, C, atau D.',
    questionPrompt:
      'Berapakah selisih luas lahan antara desain petak yang menghasilkan luas terbesar dan desain petak yang menghasilkan luas terkecil dari keempat alternatif di atas?',
    options: [
      { id: 'A', text: '12 m²' },
      { id: 'B', text: '15 m²' },
      { id: 'C', text: '16 m²' },
      { id: 'D', text: '20 m²' },
    ],
    correctOption: 'B',
    explanation:
      'Keliling persegi panjang K = 2 × (p + l) = 24 m, sehingga jumlah panjang dan lebar (p + l) = 12 meter.\n' +
      'Mari hitung panjang (p), lebar (l), dan Luas (p × l) untuk setiap desain:\n' +
      '• Desain I (Rasio 5 : 1 -> jumlah rasio 6): p = 5/6 × 12 = 10 m, l = 1/6 × 12 = 2 m -> Luas = 10 × 2 = 20 m² (Terkecil).\n' +
      '• Desain II (Rasio 3 : 1 -> jumlah rasio 4): p = 3/4 × 12 = 9 m, l = 1/4 × 12 = 3 m -> Luas = 9 × 3 = 27 m².\n' +
      '• Desain III (Rasio 2 : 1 -> jumlah rasio 3): p = 2/3 × 12 = 8 m, l = 1/3 × 12 = 4 m -> Luas = 8 × 4 = 32 m².\n' +
      '• Desain IV (Rasio 7 : 5 -> jumlah rasio 12): p = 7 m, l = 5 m -> Luas = 7 × 5 = 35 m² (Terbesar).\n' +
      'Selisih luas terbesar dan terkecil = 35 m² - 20 m² = 15 m².',
  },
];
