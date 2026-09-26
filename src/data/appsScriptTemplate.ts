export const APPS_SCRIPT_FULL_CODE = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT (Code.gs) - LMS & CBT ANBK MATEMATIKA KELAS 7 FASE D
 * SMP NEGERI 1 WANARAYA - TAHUN AJARAN 2026/2027
 * Guru Pengampu / Admin: Suwarto
 * ============================================================================
 *
 * CARA PEMASANGAN DI GOOGLE SPREADSHEET:
 * 1. Buka Google Spreadsheet baru di Google Drive Anda.
 * 2. Klik menu "Ekstensi" (Extensions) -> "Apps Script".
 * 3. Hapus kode yang ada, lalu Tempel (Paste) seluruh kode ini ke dalam Code.gs.
 * 4. Klik ikon Simpan (Save), lalu jalankan fungsi "setupDatabase()" sekali
 *    untuk membuat sheet otomatis ("UserLogin" dan "JawabanUjian") beserta data awal.
 * 5. Klik tombol "Terapkan" (Deploy) -> "Deployment baru" (New deployment).
 * 6. Pilih jenis: "Aplikasi Web" (Web App).
 *    - Jalankan sebagai (Execute as): "Saya" (Me)
 *    - Siapa yang memiliki akses (Who has access): "Siapa saja" (Anyone)
 * 7. Klik "Terapkan" (Deploy), salin URL Aplikasi Web (berakhiran /exec),
 *    lalu tempelkan pada menu Admin -> Pengaturan di Aplikasi CBT SMPN 1 Wanaraya.
 */

const SHEET_USERS = 'UserLogin';
const SHEET_RESULTS = 'JawabanUjian';

/**
 * Inisialisasi awal Sheet "UserLogin" dan "JawabanUjian"
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Buat Sheet UserLogin (Kode, Username, Password, Nama Peserta, Kelas, Token, Waktu Input)
  let userSheet = ss.getSheetByName(SHEET_USERS);
  if (!userSheet) {
    userSheet = ss.insertSheet(SHEET_USERS);
    userSheet.appendRow([
      'Kode Peserta',
      'Username',
      'Password',
      'Nama Peserta',
      'Kelas',
      'Token',
      'Waktu Terdaftar'
    ]);
    userSheet.getRange('A1:G1').setFontWeight('bold').setBackground('#0284C7').setFontColor('#FFFFFF');

    // Data sampel awal Kelas 7A dan 7B SMP Negeri 1 Wanaraya
    const sampleStudents = [
      ['7A-001', 'siswa7a1', '123456', 'Ahmad Fauzan', '7A', 'WNRY26', new Date()],
      ['7A-002', 'siswa7a2', '123456', 'Siti Nurhaliza', '7A', 'WNRY26', new Date()],
      ['7A-003', 'siswa7a3', '123456', 'Muhammad Rizky Pratama', '7A', 'WNRY26', new Date()],
      ['7B-001', 'siswa7b1', '123456', 'Nabila Putri Azzahra', '7B', 'WNRY26', new Date()],
      ['7B-002', 'siswa7b2', '123456', 'Bagus Setiawan', '7B', 'WNRY26', new Date()],
      ['7B-003', 'siswa7b3', '123456', 'Dewi Sartika Sari', '7B', 'WNRY26', new Date()]
    ];
    sampleStudents.forEach(row => userSheet.appendRow(row));
  }

  // 2. Buat Sheet JawabanUjian (Nama, Kelas, Waktu, Jawaban No 1..20, Skor Akhir)
  let resultSheet = ss.getSheetByName(SHEET_RESULTS);
  if (!resultSheet) {
    resultSheet = ss.insertSheet(SHEET_RESULTS);
    const headers = ['Waktu Submit', 'Kode Peserta', 'Nama Peserta', 'Kelas', 'Token'];
    for (let i = 1; i <= 20; i++) {
      headers.push('No_' + i);
    }
    headers.push('Skor Pemahaman (10%)', 'Skor Aplikasi (40%)', 'Skor Penalaran (50%)', 'Skor Akhir');
    resultSheet.appendRow(headers);
    resultSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0369A1').setFontColor('#FFFFFF');
  }

  return 'Database Spreadsheet SMP Negeri 1 Wanaraya berhasil disiapkan!';
}

/**
 * Handler HTTP GET:
 * - ?action=ping       -> Indikator koneksi database (Online / Terhubung)
 * - ?action=getUsers   -> Tarik data siswa dari sheet UserLogin
 * - ?action=getResults -> Tarik hasil ujian dari sheet JawabanUjian
 */
function doGet(e) {
  try {
    setupDatabase();
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'ping';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'ping') {
      const userSheet = ss.getSheetByName(SHEET_USERS);
      const resultSheet = ss.getSheetByName(SHEET_RESULTS);
      return jsonResponse({
        status: 'connected',
        ok: true,
        spreadsheetName: ss.getName(),
        school: 'SMP Negeri 1 Wanaraya',
        totalUsers: Math.max(0, userSheet.getLastRow() - 1),
        totalResults: Math.max(0, resultSheet.getLastRow() - 1),
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'getUsers') {
      const sheet = ss.getSheetByName(SHEET_USERS);
      const rows = sheet.getDataRange().getValues();
      const users = [];
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i][0] && !rows[i][1]) continue;
        users.push({
          kode: String(rows[i][0] || ''),
          username: String(rows[i][1] || ''),
          password: String(rows[i][2] || ''),
          nama: String(rows[i][3] || ''),
          kelas: String(rows[i][4] || '7A'),
          token: String(rows[i][5] || 'WNRY26'),
          createdAt: String(rows[i][6] || '')
        });
      }
      return jsonResponse({ status: 'success', ok: true, users: users });
    }

    if (action === 'getResults') {
      const sheet = ss.getSheetByName(SHEET_RESULTS);
      const rows = sheet.getDataRange().getValues();
      const results = [];
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i][2]) continue;
        const jawaban = {};
        for (let q = 1; q <= 20; q++) {
          jawaban[q] = rows[i][4 + q];
        }
        results.push({
          waktu: String(rows[i][0] || ''),
          kode: String(rows[i][1] || ''),
          nama: String(rows[i][2] || ''),
          kelas: String(rows[i][3] || ''),
          token: String(rows[i][4] || ''),
          jawaban: jawaban,
          skorPemahaman: Number(rows[i][25] || 0),
          skorAplikasi: Number(rows[i][26] || 0),
          skorPenalaran: Number(rows[i][27] || 0),
          skorAkhir: Number(rows[i][28] || 0)
        });
      }
      return jsonResponse({ status: 'success', ok: true, results: results });
    }

    return jsonResponse({ status: 'error', message: 'Action tidak dikenali: ' + action });
  } catch (err) {
    return jsonResponse({ status: 'error', ok: false, message: err.toString() });
  }
}

/**
 * Handler HTTP POST:
 * 1. action = "saveStudent" -> Menyimpan Kode, Nama Peserta, Kelas, Username, Password, Token ke sheet UserLogin
 * 2. action = "submitExam"  -> Menyimpan Nama, Kelas, Waktu, Jawaban No 1-20, Skor Akhir ke sheet JawabanUjian
 */
function doPost(e) {
  try {
    setupDatabase();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    // 1. SIMPAN DATA SISWA (Kode, Nama Peserta, Kelas, Token, Username, Password)
    if (action === 'saveStudent') {
      const sheet = ss.getSheetByName(SHEET_USERS);
      const kode = payload.kode || ('7' + (payload.kelas || 'A') + '-' + Math.floor(100 + Math.random() * 900));
      const username = payload.username || kode.toLowerCase().replace(/[^a-z0-9]/g, '');
      const password = payload.password || '123456';
      const nama = payload.nama || '';
      const kelas = payload.kelas || '7A';
      const token = payload.token || 'WNRY26';

      sheet.appendRow([
        kode,
        username,
        password,
        nama,
        kelas,
        token,
        new Date().toLocaleString('id-ID')
      ]);

      return jsonResponse({
        status: 'success',
        ok: true,
        message: 'Data siswa berhasil disimpan ke sheet UserLogin',
        student: { kode, username, password, nama, kelas, token }
      });
    }

    // 2. SIMPAN HASIL UJIAN (Nama, Kelas, Waktu, Jawaban Tiap Nomor 1-20, Skor Akhir)
    if (action === 'submitExam') {
      const sheet = ss.getSheetByName(SHEET_RESULTS);
      const rowData = [
        payload.waktu || new Date().toLocaleString('id-ID'),
        payload.kode || '-',
        payload.nama || '',
        payload.kelas || '',
        payload.token || 'WNRY26'
      ];

      const ansObj = payload.jawaban || {};
      for (let q = 1; q <= 20; q++) {
        const val = ansObj[q] !== undefined ? ansObj[q] : '-';
        rowData.push(typeof val === 'object' ? JSON.stringify(val) : String(val));
      }

      rowData.push(
        Number(payload.skorPemahaman || 0),
        Number(payload.skorAplikasi || 0),
        Number(payload.skorPenalaran || 0),
        Number(payload.skorAkhir || 0)
      );

      sheet.appendRow(rowData);

      return jsonResponse({
        status: 'success',
        ok: true,
        message: 'Jawaban dan skor akhir ujian berhasil disimpan di sheet JawabanUjian'
      });
    }

    return jsonResponse({ status: 'error', ok: false, message: 'Action POST tidak valid' });
  } catch (err) {
    return jsonResponse({ status: 'error', ok: false, message: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const APPS_SCRIPT_SNIPPET_SOAL_2 = `// SCRIP KHUSUS MENYIMPAN DATA ISIAN (NAMA PESERTA & KELAS) DARI GOOGLE AI STUDIO KE SPREADSHEET
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('UserLogin') || ss.insertSheet('UserLogin');
  const data = JSON.parse(e.postData.contents);

  // Menyimpan Nama Peserta, Kelas [7A / 7B], dan Waktu Input
  sheet.appendRow([
    data.kode || 'SISWA-' + Date.now().toString().slice(-4),
    data.username || '',
    data.password || '123456',
    data.nama,   // Isian Nama Peserta
    data.kelas,  // Isian Kelas (7A / 7B)
    data.token || 'WNRY26',
    new Date().toLocaleString('id-ID')
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'Nama peserta & Kelas tersimpan!' }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export const APPS_SCRIPT_SNIPPET_SOAL_3 = `// SCRIP KHUSUS MENYAMBUNGKAN ISIAN (KODE PESERTA, NAMA PESERTA, TOKEN) KE SPREADSHEET
function simpanPesertaDanToken(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('UserLogin');
  if (!sheet) {
    sheet = ss.insertSheet('UserLogin');
    sheet.appendRow(['Kode Peserta', 'Username', 'Password', 'Nama Peserta', 'Kelas', 'Token', 'Waktu']);
  }

  // Baris data: Kode, Username, Password, Nama Peserta, Kelas, Token, Timestamp
  sheet.appendRow([
    payload.kode,       // Kode Peserta (misal: 7A-001)
    payload.username || payload.kode.toLowerCase(),
    payload.password || '123456',
    payload.nama,       // Nama Peserta
    payload.kelas || '7A',
    payload.token,      // Token Ujian (misal: WNRY26)
    new Date().toLocaleString('id-ID')
  ]);
}`;
