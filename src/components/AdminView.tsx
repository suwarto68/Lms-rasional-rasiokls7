import React, { useState } from 'react';
import {
  StudentUser,
  ExamSubmission,
  AppSettings,
  ConnectionStatus,
  KelasOption,
} from '../types/cbtTypes';
import { EXAM_QUESTIONS } from '../data/questionsData';
import {
  APPS_SCRIPT_FULL_CODE,
  APPS_SCRIPT_SNIPPET_SOAL_2,
  APPS_SCRIPT_SNIPPET_SOAL_3,
} from '../data/appsScriptTemplate';
import {
  Users,
  FileSpreadsheet,
  Settings,
  Lock,
  Unlock,
  Download,
  RefreshCw,
  Copy,
  Check,
  PlusCircle,
  Code2,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AdminViewProps {
  users: StudentUser[];
  results: ExamSubmission[];
  settings: AppSettings;
  connectionStatus: ConnectionStatus;
  onPullFromSpreadsheet: () => Promise<{ ok: boolean; message: string }>;
  onAddStudentToSheet: (student: Partial<StudentUser>) => Promise<{ ok: boolean; message: string }>;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => Promise<{ ok: boolean; message: string }>;
  onTestConnection: () => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  users,
  results,
  settings,
  connectionStatus,
  onPullFromSpreadsheet,
  onAddStudentToSheet,
  onUpdateSettings,
  onTestConnection,
}) => {
  const [activeMenu, setActiveMenu] = useState<'users' | 'results' | 'settings' | 'pembahasan'>('users');

  // State Menu 1: Data Pengguna & Tarik dari Spreadsheet
  const [filterKelas, setFilterKelas] = useState<'ALL' | '7A' | '7B'>('ALL');
  const [isPulling, setIsPulling] = useState(false);
  const [pullFeedback, setPullFeedback] = useState<string | null>(null);

  // Form Tambah Siswa ke Spreadsheet (Kode, Nama Peserta, Kelas, Token)
  const [newKode, setNewKode] = useState('7A-008');
  const [newNama, setNewNama] = useState('');
  const [newKelas, setNewKelas] = useState<KelasOption>('7A');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newToken, setNewToken] = useState(settings.examToken || 'WNRY26');
  const [isSavingUser, setIsSavingUser] = useState(false);

  // State Menu 3: Pengaturan & Kode Apps Script
  const [scriptUrlInput, setScriptUrlInput] = useState(settings.appsScriptUrl || '');
  const [sheetNameInput, setSheetNameInput] = useState(settings.spreadsheetName || '');
  const [durationInput, setDurationInput] = useState(settings.examDurationMinutes || 80);
  const [tokenSettingInput, setTokenSettingInput] = useState(settings.examToken || 'WNRY26');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [copiedCodeTab, setCopiedCodeTab] = useState<string | null>(null);
  const [activeScriptTab, setActiveScriptTab] = useState<'full' | 'nama_kelas' | 'kode_nama_token'>('full');

  React.useEffect(() => {
    setScriptUrlInput(settings.appsScriptUrl || '');
    setSheetNameInput(settings.spreadsheetName || '');
    setDurationInput(settings.examDurationMinutes || 80);
    setTokenSettingInput(settings.examToken || 'WNRY26');
    setNewToken(settings.examToken || 'WNRY26');
  }, [settings]);

  // State Menu 4: Akses Pembahasan Berpassword Terprotek (Password: Suwarto)
  const [pembahasanPasswordInput, setPembahasanPasswordInput] = useState('');
  const [isPembahasanUnlocked, setIsPembahasanUnlocked] = useState(false);
  const [pembahasanError, setPembahasanError] = useState('');

  // Handler "Tarik dari Spreadsheet"
  const handlePullSpreadsheet = async () => {
    setIsPulling(true);
    setPullFeedback(null);
    try {
      const res = await onPullFromSpreadsheet();
      setPullFeedback(res.message);
    } finally {
      setIsPulling(false);
    }
  };

  // Handler Simpan Data Siswa ke Spreadsheet
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newKode.trim()) return;
    setIsSavingUser(true);
    setPullFeedback(null);
    try {
      const res = await onAddStudentToSheet({
        kode: newKode.trim(),
        nama: newNama.trim(),
        kelas: newKelas,
        username: newUsername.trim() || newKode.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
        password: newPassword.trim() || '123456',
        token: newToken.trim().toUpperCase() || 'WNRY26',
      });
      setPullFeedback(res.message);
      if (res.ok) {
        setNewNama('');
        setNewUsername('');
        const nextNum = users.filter((u) => u.kelas === newKelas).length + 2;
        setNewKode(`${newKelas}-${String(nextNum).padStart(3, '0')}`);
      }
    } finally {
      setIsSavingUser(false);
    }
  };

  // Handler Simpan Pengaturan (Kompatibel Penuh dengan Vercel & Google Apps Script)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSavedMsg(null);
    try {
      const res = await onUpdateSettings({
        appsScriptUrl: scriptUrlInput.trim(),
        spreadsheetName: sheetNameInput.trim(),
        examDurationMinutes: Number(durationInput) || 80,
        examToken: tokenSettingInput.trim().toUpperCase() || 'WNRY26',
      });
      setSettingsSavedMsg(res.message);
      setTimeout(() => setSettingsSavedMsg(null), 6000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handler Copy Kode Apps Script
  const handleCopyCode = (code: string, tabName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeTab(tabName);
    setTimeout(() => setCopiedCodeTab(null), 2500);
  };

  // Handler Buka Kunci Pembahasan Terprotek (Password: Suwarto)
  const handleUnlockPembahasan = (e: React.FormEvent) => {
    e.preventDefault();
    if (pembahasanPasswordInput.trim().toLowerCase() === 'suwarto') {
      setIsPembahasanUnlocked(true);
      setPembahasanError('');
    } else {
      setPembahasanError(
        'Password salah! Akses Pembahasan diproteksi dengan Nama Pengguna pengampu (Ketik: Suwarto).'
      );
    }
  };

  // Handler Ekspor CSV Hasil Ujian (Sheet JawabanUjian)
  const handleExportCsv = () => {
    const headers = [
      'Waktu',
      'Kode Peserta',
      'Nama Peserta',
      'Kelas',
      'Token',
      ...Array.from({ length: 20 }, (_, i) => `No_${i + 1}`),
      'Skor Pemahaman (10%)',
      'Skor Aplikasi (40%)',
      'Skor Penalaran (50%)',
      'Skor Akhir',
    ];
    const rows = results.map((r) => [
      `"${r.waktu}"`,
      `"${r.kode}"`,
      `"${r.nama}"`,
      `"${r.kelas}"`,
      `"${r.token}"`,
      ...Array.from({ length: 20 }, (_, i) => `"${r.jawabanFormatted[i + 1] || '-'}"`),
      r.skorPemahaman,
      r.skorAplikasi,
      r.skorPenalaran,
      r.skorAkhir,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `JawabanUjian_CBT_SMPN1_Wanaraya_2026_2027.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter((u) => (filterKelas === 'ALL' ? true : u.kelas === filterKelas));

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Panel Admin & Indikator Koneksi Database */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-sky-700">
              Panel Administrator & Integrasi Google Spreadsheet · SMP Negeri 1 Wanaraya
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Manajemen CBT ANBK & Database Spreadsheet (Pengampu: Suwarto)
            </h1>
          </div>

          {/* Indikator Koneksi Database Real-Time */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                connectionStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <div className="text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>Indikator Koneksi Database: TERHUBUNG</span>
                <span className="font-mono text-[11px] text-emerald-700 tabular-nums">
                  ({connectionStatus.latencyMs}ms)
                </span>
              </div>
              <div className="text-slate-600">{connectionStatus.message}</div>
            </div>
            <button
              type="button"
              onClick={onTestConnection}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer shrink-0"
            >
              Cek Koneksi
            </button>
          </div>
        </div>

        {/* Navigasi 4 Menu Admin */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setActiveMenu('users')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeMenu === 'users'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Data Pengguna (Sheet UserLogin)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMenu('results')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeMenu === 'results'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>2. Hasil Ujian (Sheet JawabanUjian · {results.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMenu('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeMenu === 'settings'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>3. Pengaturan & Kode Apps Script</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMenu('pembahasan')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeMenu === 'pembahasan'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isPembahasanUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>4. Akses Pembahasan Terprotek (Suwarto)</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MENU 1: DATA PENGGUNA (TARIK DARI SPREADSHEET & INPUT PESERTA)    */}
      {/* ================================================================= */}
      {activeMenu === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Sambungkan Data Siswa (Kode, Nama Peserta, Kelas, Token) ke Spreadsheet */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="border-b border-slate-200 pb-3">
              <div className="text-xs font-semibold text-emerald-700">Input ke Sheet UserLogin</div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Simpan Data Siswa ke Spreadsheet</span>
              </h2>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Kode Peserta *</label>
                  <input
                    type="text"
                    required
                    value={newKode}
                    onChange={(e) => setNewKode(e.target.value)}
                    placeholder="7A-008"
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Kelas (Dropdown) *</label>
                  <select
                    value={newKelas}
                    onChange={(e) => {
                      const k = e.target.value as KelasOption;
                      setNewKelas(k);
                      const nextIdx = users.filter((u) => u.kelas === k).length + 1;
                      setNewKode(`${k}-${String(nextIdx).padStart(3, '0')}`);
                    }}
                    className="w-full px-3 py-2 font-semibold bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="7A">7A</option>
                    <option value="7B">7B</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Nama Peserta *</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Nama lengkap siswa..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Username Login</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Otomatis jika kosong"
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Password Login</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Token Ujian *</label>
                <input
                  type="text"
                  required
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingUser}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                {isSavingUser ? 'Menyimpan...' : 'Simpan Data Siswa ke Spreadsheet'}
              </button>
            </form>
          </div>

          {/* Tabel Data Pengguna & Tombol "Tarik dari Spreadsheet" */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Daftar Peserta Ujian (`sheet UserLogin` · {filteredUsers.length} Siswa)
                </h2>
                <p className="text-xs text-slate-500">
                  Data Username, Password, Nama Peserta, Kelas [7A dan 7B], dan Token Ujian.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter Kelas */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterKelas('ALL')}
                    className={`px-2.5 py-1 font-semibold rounded cursor-pointer ${
                      filterKelas === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterKelas('7A')}
                    className={`px-2.5 py-1 font-semibold rounded cursor-pointer ${
                      filterKelas === '7A' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Kelas 7A
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterKelas('7B')}
                    className={`px-2.5 py-1 font-semibold rounded cursor-pointer ${
                      filterKelas === '7B' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Kelas 7B
                  </button>
                </div>

                {/* TOMBOL WAJIB: "Tarik dari Spreadsheet" */}
                <button
                  type="button"
                  onClick={handlePullSpreadsheet}
                  disabled={isPulling}
                  className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
                  <span>{isPulling ? 'Menarik Data...' : 'Tarik dari Spreadsheet'}</span>
                </button>
              </div>
            </div>

            {pullFeedback && (
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{pullFeedback}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-bold">Kode</th>
                    <th className="py-2.5 px-3 font-bold">Nama Peserta</th>
                    <th className="py-2.5 px-3 font-bold">Kelas</th>
                    <th className="py-2.5 px-3 font-bold">Username</th>
                    <th className="py-2.5 px-3 font-bold">Password</th>
                    <th className="py-2.5 px-3 font-bold">Token</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                  {filteredUsers.map((u) => (
                    <tr key={u.kode} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-sky-800">{u.kode}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{u.nama}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{u.kelas}</td>
                      <td className="py-2.5 px-3 text-slate-700">{u.username}</td>
                      <td className="py-2.5 px-3 text-slate-700">{u.password}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">{u.token}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MENU 2: HASIL UJIAN (SHEET JAWABANUJIAN)                          */}
      {/* ================================================================= */}
      {activeMenu === 'results' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Rekapitulasi Hasil Ujian Siswa (`sheet JawabanUjian`)
              </h2>
              <p className="text-xs text-slate-500">
                Data otomatis tersimpan: Nama, Kelas, Waktu, Jawaban tiap nomor (1–20), Rincian Level, dan Skor Akhir.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer self-start"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Rekap Spreadsheet (.CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                  <th className="py-3 px-3 font-bold">Waktu Submit</th>
                  <th className="py-3 px-3 font-bold">Kode & Nama Peserta</th>
                  <th className="py-3 px-3 font-bold">Kelas</th>
                  <th className="py-3 px-3 font-bold">Ringkasan Jawaban (No. 1 – 20)</th>
                  <th className="py-3 px-3 font-bold text-right">Pemahaman (10%)</th>
                  <th className="py-3 px-3 font-bold text-right">Aplikasi (40%)</th>
                  <th className="py-3 px-3 font-bold text-right">Penalaran (50%)</th>
                  <th className="py-3 px-3 font-bold text-right">Skor Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{r.waktu}</td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-slate-900">{r.nama}</div>
                      <div className="text-[11px] font-mono text-slate-500">{r.kode}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-sky-700">{r.kelas}</td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="truncate text-[11px] text-slate-600" title={JSON.stringify(r.jawabanFormatted)}>
                        {Object.entries(r.jawabanFormatted || {})
                          .slice(0, 6)
                          .map(([k, v]) => `#${k}:${v}`)
                          .join(', ')}{' '}
                        ... (20 Soal)
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold">{r.skorPemahaman} / 10</td>
                    <td className="py-3 px-3 text-right font-semibold">{r.skorAplikasi} / 40</td>
                    <td className="py-3 px-3 text-right font-semibold">{r.skorPenalaran} / 50</td>
                    <td className="py-3 px-3 text-right font-bold text-sm text-emerald-700">
                      {r.skorAkhir}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MENU 3: PENGATURAN & KODE GOOGLE APPS SCRIPT (Code.gs)            */}
      {/* ================================================================= */}
      {activeMenu === 'settings' && (
        <div className="space-y-8">
          {/* Bagian A: Form Konfigurasi Koneksi Google Spreadsheet & Parameter Ujian */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-sky-700">Konfigurasi Database & CBT</span>
                <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
                  Pengaturan Koneksi Google Spreadsheet & Parameter Ujian
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Activity className="w-4 h-4" />
                <span>Status Koneksi: Aktif ({connectionStatus.latencyMs}ms)</span>
              </div>
            </div>

            {settingsSavedMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 font-semibold">
                {settingsSavedMsg}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-6 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  URL Web App Google Apps Script (`https://script.google.com/macros/s/.../exec`)
                </label>
                <input
                  type="url"
                  value={scriptUrlInput}
                  onChange={(e) => setScriptUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl"
                />
                <p className="text-[11px] text-slate-500">
                  Tempelkan URL hasil Deploy Web App dari Google Spreadsheet Anda agar sinkronisasi dua arah berjalan otomatis.
                </p>
              </div>

              <div className="md:col-span-6 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Nama File Google Spreadsheet
                </label>
                <input
                  type="text"
                  value={sheetNameInput}
                  onChange={(e) => setSheetNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Durasi Waktu Ujian (Menit)
                </label>
                <input
                  type="number"
                  min={10}
                  max={180}
                  value={durationInput}
                  onChange={(e) => setDurationInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Token Ujian Aktif
                </label>
                <input
                  type="text"
                  value={tokenSettingInput}
                  onChange={(e) => setTokenSettingInput(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-sm font-mono font-bold uppercase bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="md:col-span-4 flex items-end">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-2.5 px-5 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-sky-400 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  {isSavingSettings ? 'Menyimpan & Menghubungkan...' : 'Simpan Pengaturan & Sinkronkan'}
                </button>
              </div>
            </form>
          </div>

          {/* Bagian B: Kode Google Apps Script (Code.gs) Siap Pakai */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" />
                  <span>Kode Integrasi Google Apps Script (`Code.gs`)</span>
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  Script Penghubung Aplikasi ke Google Spreadsheet (Sheet UserLogin & JawabanUjian)
                </h3>
              </div>

              {/* Pilihan 3 Script sesuai Permintaan User */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setActiveScriptTab('full')}
                  className={`px-3 py-1.5 font-semibold rounded-lg cursor-pointer ${
                    activeScriptTab === 'full' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  1. Full Code.gs (Koneksi + Login + Hasil)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScriptTab('nama_kelas')}
                  className={`px-3 py-1.5 font-semibold rounded-lg cursor-pointer ${
                    activeScriptTab === 'nama_kelas' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  2. Script Simpan (Nama Peserta & Kelas)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScriptTab('kode_nama_token')}
                  className={`px-3 py-1.5 font-semibold rounded-lg cursor-pointer ${
                    activeScriptTab === 'kode_nama_token' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  3. Script Simpan (Kode, Nama Peserta & Token)
                </button>
              </div>
            </div>

            {activeScriptTab === 'full' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600">
                    <strong>1. Kode Lengkap Apps Script (`Code.gs`):</strong> Mendukung indikator koneksi (`action=ping`),
                    tarik data siswa (`action=getUsers`), simpan siswa baru (`action=saveStudent`), dan simpan otomatis hasil ujian (`action=submitExam`).
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(APPS_SCRIPT_FULL_CODE, 'full')}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedCodeTab === 'full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodeTab === 'full' ? 'Tersalin!' : 'Salin Code.gs Lengkap'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed">
                  {APPS_SCRIPT_FULL_CODE}
                </pre>
              </div>
            )}

            {activeScriptTab === 'nama_kelas' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600">
                    <strong>2. Script Menyimpan Data dari Google AI (Nama Peserta & Kelas [7A/7B]) ke Spreadsheet:</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(APPS_SCRIPT_SNIPPET_SOAL_2, 'nama_kelas')}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedCodeTab === 'nama_kelas' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodeTab === 'nama_kelas' ? 'Tersalin!' : 'Salin Script'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                  {APPS_SCRIPT_SNIPPET_SOAL_2}
                </pre>
              </div>
            )}

            {activeScriptTab === 'kode_nama_token' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600">
                    <strong>3. Script Menyambungkan Data Siswa (Kode Peserta, Nama Peserta, Token) ke Spreadsheet:</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(APPS_SCRIPT_SNIPPET_SOAL_3, 'kode_nama_token')}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedCodeTab === 'kode_nama_token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodeTab === 'kode_nama_token' ? 'Tersalin!' : 'Salin Script'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                  {APPS_SCRIPT_SNIPPET_SOAL_3}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MENU 4: AKSES PEMBAHASAN BERPASSWORD TERPROTEK (PASSWORD: SUWARTO)*/}
      {/* ================================================================= */}
      {activeMenu === 'pembahasan' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {!isPembahasanUnlocked ? (
            <div className="max-w-md mx-auto py-8 text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-slate-900 font-display">
                  Akses Pembahasan Terprotek Password
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Halaman Kunci Jawaban & Pembahasan 20 Butir Soal CBT ANBK Matematika Kelas 7 Fase D ini
                  diproteksi menggunakan Nama Pengguna Guru Pengampu.
                </p>
              </div>

              {pembahasanError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pembahasanError}</span>
                </div>
              )}

              <form onSubmit={handleUnlockPembahasan} className="space-y-3 text-left">
                <label className="block text-xs font-bold text-slate-700">
                  Masukkan Password Pembahasan (Nama Pengguna: Suwarto)
                </label>
                <input
                  type="password"
                  required
                  value={pembahasanPasswordInput}
                  onChange={(e) => setPembahasanPasswordInput(e.target.value)}
                  placeholder="Ketik password: Suwarto"
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-600"
                />
                <button
                  type="submit"
                  className="w-full py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Buka Kunci Pembahasan (20 Soal)
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-700">
                    ● Akses Terbuka · Guru Pengampu: Bapak Suwarto
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
                    Kunci Jawaban & Pembahasan Lengkap 20 Soal Matematika Kelas 7 Fase D
                  </h2>
                  <p className="text-xs text-slate-500">
                    Komposisi Level Kognitif: Pemahaman 10% (2 Soal) · Aplikasi 40% (8 Soal) · Penalaran 50% (10 Soal)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPembahasanUnlocked(false);
                    setPembahasanPasswordInput('');
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 self-start cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Kunci Kembali</span>
                </button>
              </div>

              <div className="space-y-4">
                {EXAM_QUESTIONS.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-200 pb-2">
                      <div className="font-bold text-slate-900">
                        Soal No. {q.id} ({q.code}) · {q.stimulusTitle}
                      </div>
                      <div className="font-mono text-sky-800 font-semibold">
                        Level: {q.level} ({q.weightPercent}%) · Tipe: {q.type}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      <strong>Indikator:</strong> {q.indicator}
                    </div>

                    <div className="text-xs sm:text-sm font-semibold text-slate-900">
                      Pertanyaan: {q.questionPrompt}
                    </div>

                    <div className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs space-y-1.5">
                      <div className="font-bold text-emerald-950">
                        Kunci Jawaban Resmi:{' '}
                        {q.type === 'PG'
                          ? `Opsi ${q.correctOption}`
                          : q.type === 'PGK'
                          ? `Pernyataan ${q.correctOptions?.join(' dan ')} (2 Jawaban Benar)`
                          : q.statements
                              ?.map((s, i) => `Pernyataan ${i + 1}: ${s.isTrue ? 'BENAR' : 'SALAH'}`)
                              .join('  |  ')}
                      </div>
                      <div className="text-slate-800 whitespace-pre-line leading-relaxed pt-1 border-t border-emerald-200/60">
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
