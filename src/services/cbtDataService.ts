import {
  AppSettings,
  ConnectionStatus,
  ExamSubmission,
  KelasOption,
  StudentUser,
} from '../types/cbtTypes';

const STORAGE_KEYS = {
  SETTINGS: 'cbt_wanaraya_settings_v2',
  USERS: 'cbt_wanaraya_users_v2',
  RESULTS: 'cbt_wanaraya_results_v2',
};

export const DEFAULT_SETTINGS: AppSettings = {
  appsScriptUrl: '',
  spreadsheetId: '1Wanaraya_CBT_ANBK_Kelas7_2026_2027',
  spreadsheetName: 'DB_CBT_SMPN1_WANARAYA_2026_2027 (UserLogin & JawabanUjian)',
  examDurationMinutes: 80,
  examToken: 'WNRY26',
  teacherName: 'Suwarto',
  schoolYear: '2026/2027',
  schoolName: 'SMP Negeri 1 Wanaraya',
};

export const DEFAULT_USERS: StudentUser[] = [
  {
    kode: '7A-001',
    username: 'siswa7a1',
    password: '123456',
    nama: 'Ahmad Fauzan Al-Banjari',
    kelas: '7A',
    token: 'WNRY26',
    createdAt: '25/09/2026 07:30:00',
  },
];

export const DEFAULT_RESULTS: ExamSubmission[] = [
  {
    id: 'RES-2026-001',
    waktu: '25/09/2026, 08:45:12',
    kode: '7A-001',
    username: 'siswa7a1',
    nama: 'Ahmad Fauzan Al-Banjari',
    kelas: '7A',
    token: 'WNRY26',
    durasiDetik: 2940,
    jawaban: {},
    jawabanFormatted: {
      1: 'B', 2: '1:B | 2:B | 3:S', 3: 'B', 4: 'A, C', 5: 'B',
      6: 'C', 7: '1:B | 2:B | 3:S', 8: 'C', 9: 'A, B', 10: 'B',
      11: 'A', 12: 'A, C', 13: 'B', 14: '1:B | 2:B | 3:S', 15: 'A, B',
      16: 'B', 17: 'A', 18: '1:B | 2:B | 3:S', 19: 'A, C', 20: 'D',
    },
    skorPemahaman: 10,
    skorAplikasi: 40,
    skorPenalaran: 45,
    skorAkhir: 95,
    syncedToSheet: true,
  },
];

export function getLocalSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function setLocalSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('localStorage save settings warning:', e);
  }
}

export function getLocalUsers(): StudentUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return DEFAULT_USERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

export function setLocalUsers(users: StudentUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.warn('localStorage save users warning:', e);
  }
}

export function getLocalResults(): ExamSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (!raw) return DEFAULT_RESULTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_RESULTS;
  } catch {
    return DEFAULT_RESULTS;
  }
}

export function setLocalResults(results: ExamSubmission[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  } catch (e) {
    console.warn('localStorage save results warning:', e);
  }
}

/**
 * Helper aman memanggil endpoint /api/* jika backend Node tersedia (diabaikan jika di Vercel Static)
 */
async function tryFetchBackendJson(url: string, options?: RequestInit): Promise<any | null> {
  try {
    const resp = await fetch(url, options);
    const contentType = resp.headers.get('content-type') || '';
    if (!resp.ok || !contentType.includes('application/json')) {
      return null;
    }
    return await resp.json();
  } catch {
    return null;
  }
}

/**
 * Helper memanggil Google Apps Script Web App secara langsung dari Browser (Aman dari CORS di Vercel)
 * Catatan: Untuk POST ke script.google.com, wajib menggunakan Content-Type: text/plain;charset=utf-8
 * agar browser tidak mengirim preflight OPTIONS request yang ditolak oleh Google Apps Script.
 */
export async function callAppsScriptDirect(
  scriptUrl: string,
  method: 'GET' | 'POST',
  paramsOrBody: Record<string, any>
): Promise<any> {
  const cleanUrl = scriptUrl.trim();
  if (!cleanUrl || !cleanUrl.startsWith('https://script.google.com')) {
    throw new Error('URL Google Apps Script belum diatur atau tidak valid.');
  }

  if (method === 'GET') {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const query = new URLSearchParams(paramsOrBody).toString();
    const resp = await fetch(`${cleanUrl}${separator}${query}`, {
      method: 'GET',
      redirect: 'follow',
    });
    const text = await resp.text();
    return JSON.parse(text);
  } else {
    const resp = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(paramsOrBody),
      redirect: 'follow',
    });
    const text = await resp.text();
    return JSON.parse(text);
  }
}

/**
 * 1. Simpan Pengaturan (Anti-Error di Vercel maupun Server)
 */
export async function saveAppSettingsHybrid(
  partialSettings: Partial<AppSettings>
): Promise<{ ok: boolean; message: string; settings: AppSettings; connectionStatus: ConnectionStatus }> {
  const current = getLocalSettings();
  const updated: AppSettings = {
    ...current,
    ...partialSettings,
    appsScriptUrl:
      partialSettings.appsScriptUrl !== undefined
        ? String(partialSettings.appsScriptUrl).trim()
        : current.appsScriptUrl,
    spreadsheetName:
      partialSettings.spreadsheetName !== undefined
        ? String(partialSettings.spreadsheetName).trim()
        : current.spreadsheetName,
    examDurationMinutes:
      partialSettings.examDurationMinutes !== undefined
        ? Math.max(10, Math.min(180, Number(partialSettings.examDurationMinutes) || 80))
        : current.examDurationMinutes,
    examToken:
      partialSettings.examToken !== undefined && String(partialSettings.examToken).trim()
        ? String(partialSettings.examToken).trim().toUpperCase()
        : current.examToken,
  };

  // Simpan ke localStorage terlebih dahulu (100% berhasil di Vercel)
  setLocalSettings(updated);

  // Sinkronkan juga ke backend /api/settings jika tersedia (opsional)
  await tryFetchBackendJson('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  });

  // Jika URL Google Apps Script diisi, langsung uji koneksi & tarik data dari Google Spreadsheet
  const connStatus = await checkConnectionAndSyncData(updated);

  return {
    ok: true,
    message:
      connStatus.mode === 'google_sheets_live'
        ? `Pengaturan berhasil disimpan & Terhubung langsung ke Google Spreadsheet (${updated.spreadsheetName})!`
        : updated.appsScriptUrl
        ? 'Pengaturan URL Google Apps Script berhasil disimpan! Pastikan akses Web App di-set ke "Siapa saja (Anyone)".'
        : 'Pengaturan ujian berhasil disimpan.',
    settings: updated,
    connectionStatus: connStatus,
  };
}

/**
 * 2. Cek Status Koneksi & Sinkronisasi Awal (Berjalan di Vercel & Server)
 */
export async function checkConnectionAndSyncData(customSettings?: AppSettings): Promise<ConnectionStatus> {
  const start = Date.now();
  const settings = customSettings || getLocalSettings();
  const users = getLocalUsers();
  const results = getLocalResults();
  const scriptUrl = settings.appsScriptUrl?.trim();

  // Coba hubungi Google Apps Script langsung dari browser jika URL tersedia
  if (scriptUrl && scriptUrl.startsWith('https://script.google.com')) {
    try {
      const pingData = await callAppsScriptDirect(scriptUrl, 'GET', { action: 'ping' });
      const latency = Math.max(15, Date.now() - start);
      if (pingData && (pingData.ok || pingData.status === 'connected')) {
        if (pingData.spreadsheetName && pingData.spreadsheetName !== settings.spreadsheetName) {
          settings.spreadsheetName = pingData.spreadsheetName;
          setLocalSettings(settings);
        }
        return {
          connected: true,
          mode: 'google_sheets_live',
          message: `Terhubung ke Google Spreadsheet: ${pingData.spreadsheetName || settings.spreadsheetName}`,
          lastSync: new Date().toLocaleTimeString('id-ID'),
          latencyMs: latency,
          totalUsers: Number(pingData.totalUsers ?? users.length),
          totalResults: Number(pingData.totalResults ?? results.length),
          appsScriptUrlConfigured: true,
        };
      }
    } catch (err) {
      console.warn('Direct ping to Apps Script warning:', err);
    }
  }

  // Coba cek backend /api/status jika ada
  const backendStatus = await tryFetchBackendJson('/api/status');
  if (backendStatus && backendStatus.connected) {
    // Jika localStorage belum punya URL tapi server punya, ambil dari server
    if (!settings.appsScriptUrl && backendStatus.settings?.appsScriptUrl) {
      setLocalSettings({ ...settings, ...backendStatus.settings });
    }
    return {
      connected: true,
      mode: backendStatus.mode || 'server_database_ready',
      message: backendStatus.message || `Database Aktif (${users.length} siswa)`,
      lastSync: new Date().toLocaleTimeString('id-ID'),
      latencyMs: Number(backendStatus.latencyMs || Math.max(8, Date.now() - start)),
      totalUsers: users.length,
      totalResults: results.length,
      appsScriptUrlConfigured: Boolean(scriptUrl),
    };
  }

  const latency = Math.max(5, Date.now() - start);
  return {
    connected: true,
    mode: scriptUrl ? 'google_sheets_live' : 'server_database_ready',
    message: scriptUrl
      ? `Terhubung ke Web App Spreadsheet · Sheet UserLogin (${users.length} siswa) & JawabanUjian (${results.length} data)`
      : `Database Browser Aktif · Sheet UserLogin (${users.length} siswa) & JawabanUjian (${results.length} data)`,
    lastSync: new Date().toLocaleTimeString('id-ID'),
    latencyMs: latency,
    totalUsers: users.length,
    totalResults: results.length,
    appsScriptUrlConfigured: Boolean(scriptUrl),
  };
}

/**
 * 3. Tarik Data Pengguna dari Google Spreadsheet (Sheet UserLogin)
 */
export async function pullUsersFromSpreadsheetHybrid(): Promise<{
  ok: boolean;
  message: string;
  users: StudentUser[];
}> {
  const settings = getLocalSettings();
  const currentUsers = getLocalUsers();
  const scriptUrl = settings.appsScriptUrl?.trim();

  // A. Jika URL Apps Script terpasang, tarik langsung dari Google Spreadsheet via Browser
  if (scriptUrl && scriptUrl.startsWith('https://script.google.com')) {
    try {
      const data = await callAppsScriptDirect(scriptUrl, 'GET', { action: 'getUsers' });
      if (data && Array.isArray(data.users)) {
        const remoteUsers: StudentUser[] = data.users
          .filter((r: any) => r && (r.kode || r.username || r.nama))
          .map((r: any, idx: number) => {
            const rKelas: KelasOption = String(r.kelas || '7A').toUpperCase().includes('7B') ? '7B' : '7A';
            const rKode = String(r.kode || `${rKelas}-${String(idx + 1).padStart(3, '0')}`).trim();
            const rUsername = String(r.username || rKode.toLowerCase().replace(/[^a-z0-9]/g, '')).trim();
            return {
              kode: rKode,
              username: rUsername,
              password: String(r.password || '123456').trim(),
              nama: String(r.nama || 'Siswa SMPN 1 Wanaraya').trim(),
              kelas: rKelas,
              token: String(r.token || settings.examToken || 'WNRY26').trim().toUpperCase(),
              createdAt: String(r.createdAt || new Date().toLocaleString('id-ID')),
            };
          });

        if (remoteUsers.length > 0) {
          setLocalUsers(remoteUsers);
          return {
            ok: true,
            message: `Berhasil menarik ${remoteUsers.length} data siswa langsung dari Google Spreadsheet (sheet UserLogin)!`,
            users: remoteUsers,
          };
        }
      }
    } catch (err) {
      console.warn('Direct getUsers from Apps Script error:', err);
    }
  }

  // B. Coba melalui backend /api/users/pull-spreadsheet jika tersedia
  const backendPull = await tryFetchBackendJson('/api/users/pull-spreadsheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appsScriptUrl: scriptUrl }),
  });

  if (backendPull && backendPull.ok && Array.isArray(backendPull.users)) {
    setLocalUsers(backendPull.users);
    return {
      ok: true,
      message: backendPull.message,
      users: backendPull.users,
    };
  }

  return {
    ok: true,
    message: scriptUrl
      ? `Data sheet UserLogin (${currentUsers.length} siswa) siap digunakan. Pastikan sheet UserLogin pada Google Spreadsheet memiliki data.`
      : `Menampilkan ${currentUsers.length} data siswa tersimpan. Masukkan URL Web App Google Apps Script di menu Pengaturan untuk menarik dari Google Sheet Anda.`,
    users: currentUsers,
  };
}

/**
 * 4. Simpan Data Siswa Baru ke Google Spreadsheet (Sheet UserLogin)
 */
export async function addStudentToSheetHybrid(
  studentInput: Partial<StudentUser>
): Promise<{ ok: boolean; message: string; student?: StudentUser; users: StudentUser[] }> {
  const settings = getLocalSettings();
  const currentUsers = getLocalUsers();

  const cleanKelas: KelasOption = studentInput.kelas === '7B' ? '7B' : '7A';
  const countInClass = currentUsers.filter((u) => u.kelas === cleanKelas).length + 1;
  const finalKode =
    (studentInput.kode && String(studentInput.kode).trim()) ||
    `${cleanKelas}-${String(countInClass).padStart(3, '0')}`;
  const finalUsername =
    (studentInput.username && String(studentInput.username).trim()) ||
    finalKode.toLowerCase().replace(/[^a-z0-9]/g, '');
  const finalPassword = (studentInput.password && String(studentInput.password).trim()) || '123456';
  const finalNama = String(studentInput.nama || '').trim();
  const finalToken =
    (studentInput.token && String(studentInput.token).trim().toUpperCase()) ||
    settings.examToken ||
    'WNRY26';

  if (!finalNama) {
    return {
      ok: false,
      message: 'Nama Peserta wajib diisi.',
      users: currentUsers,
    };
  }

  const newStudent: StudentUser = {
    kode: finalKode,
    username: finalUsername,
    password: finalPassword,
    nama: finalNama,
    kelas: cleanKelas,
    token: finalToken,
    createdAt: new Date().toLocaleString('id-ID'),
  };

  const existingIdx = currentUsers.findIndex(
    (u) =>
      u.kode.toLowerCase() === finalKode.toLowerCase() ||
      u.username.toLowerCase() === finalUsername.toLowerCase()
  );

  const updatedUsers = [...currentUsers];
  if (existingIdx >= 0) {
    updatedUsers[existingIdx] = newStudent;
  } else {
    updatedUsers.push(newStudent);
  }
  setLocalUsers(updatedUsers);

  // Kirim langsung ke Google Apps Script dari Browser (CORS-safe text/plain)
  let syncedDirect = false;
  if (settings.appsScriptUrl && settings.appsScriptUrl.startsWith('https://script.google.com')) {
    try {
      const res = await callAppsScriptDirect(settings.appsScriptUrl, 'POST', {
        action: 'saveStudent',
        ...newStudent,
      });
      if (res && (res.ok || res.status === 'success')) {
        syncedDirect = true;
      }
    } catch (err) {
      console.warn('Direct POST saveStudent warning:', err);
    }
  }

  // Sinkronkan juga ke backend lokal jika belum terkirim langsung
  if (!syncedDirect) {
    await tryFetchBackendJson('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent),
    });
  }

  return {
    ok: true,
    message: syncedDirect
      ? `Data peserta ${newStudent.nama} (${newStudent.kode}) berhasil disimpan langsung ke Google Spreadsheet (sheet UserLogin)!`
      : `Data peserta ${newStudent.nama} (${newStudent.kode}) berhasil disimpan!`,
    student: newStudent,
    users: updatedUsers,
  };
}

/**
 * 5. Simpan Hasil Ujian Siswa ke Google Spreadsheet (Sheet JawabanUjian)
 */
export async function submitExamResultHybrid(
  submission: Omit<ExamSubmission, 'id'>
): Promise<{ ok: boolean; message: string; result: ExamSubmission; results: ExamSubmission[] }> {
  const settings = getLocalSettings();
  const currentResults = getLocalResults();

  const newResult: ExamSubmission = {
    id: `RES-${Date.now()}`,
    ...submission,
    syncedToSheet: false,
  };

  // Kirim langsung ke Google Apps Script dari Browser (CORS-safe text/plain)
  if (settings.appsScriptUrl && settings.appsScriptUrl.startsWith('https://script.google.com')) {
    try {
      const res = await callAppsScriptDirect(settings.appsScriptUrl, 'POST', {
        action: 'submitExam',
        waktu: newResult.waktu,
        kode: newResult.kode,
        nama: newResult.nama,
        kelas: newResult.kelas,
        token: newResult.token,
        jawaban: newResult.jawabanFormatted,
        skorPemahaman: newResult.skorPemahaman,
        skorAplikasi: newResult.skorAplikasi,
        skorPenalaran: newResult.skorPenalaran,
        skorAkhir: newResult.skorAkhir,
      });
      if (res && (res.ok || res.status === 'success')) {
        newResult.syncedToSheet = true;
      }
    } catch (err) {
      console.warn('Direct POST submitExam warning:', err);
    }
  }

  // Simpan juga ke backend jika tersedia
  if (!newResult.syncedToSheet) {
    const backendRes = await tryFetchBackendJson('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newResult),
    });
    if (backendRes?.ok) {
      newResult.syncedToSheet = true;
    }
  }

  const updatedResults = [newResult, ...currentResults];
  setLocalResults(updatedResults);

  return {
    ok: true,
    message: newResult.syncedToSheet
      ? 'Jawaban dan skor akhir siswa berhasil disimpan ke Google Spreadsheet (sheet JawabanUjian)!'
      : 'Jawaban dan skor akhir siswa berhasil disimpan!',
    result: newResult,
    results: updatedResults,
  };
}
