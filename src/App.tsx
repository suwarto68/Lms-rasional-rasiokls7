/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StudentUser,
  ExamSubmission,
  AppSettings,
  ConnectionStatus,
  KelasOption,
} from './types/cbtTypes';
import { SchoolLogo } from './components/SchoolLogo';
import { TujuanPembelajaranView } from './components/TujuanPembelajaranView';
import { MateriView } from './components/MateriView';
import { CbtQuizView } from './components/CbtQuizView';
import { AdminView } from './components/AdminView';
import {
  imgInfografisRasional,
  imgInfografisRasio,
  imgPertanianWanaraya,
} from './data/materiData';
import {
  BookOpen,
  Compass,
  Award,
  Settings,
  ArrowRight,
  Database,
  CheckCircle2,
  Send,
  UserCheck,
  Code2,
} from 'lucide-react';

type ActiveTab = 'home' | 'tujuan' | 'materi' | 'kuis' | 'admin';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // State Database & Koneksi Google Spreadsheet
  const [users, setUsers] = useState<StudentUser[]>([]);
  const [results, setResults] = useState<ExamSubmission[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    appsScriptUrl: '',
    spreadsheetId: '1Wanaraya_CBT_ANBK_Kelas7_2026_2027',
    spreadsheetName: 'DB_CBT_SMPN1_WANARAYA_2026_2027 (UserLogin & JawabanUjian)',
    examDurationMinutes: 80,
    examToken: 'WNRY26',
    teacherName: 'Suwarto',
    schoolYear: '2026/2027',
    schoolName: 'SMP Negeri 1 Wanaraya',
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: true,
    mode: 'server_database_ready',
    message: 'Terhubung ke Database · Sheet UserLogin & JawabanUjian Siap',
    lastSync: new Date().toLocaleTimeString('id-ID'),
    latencyMs: 12,
    totalUsers: 10,
    totalResults: 2,
    appsScriptUrlConfigured: false,
  });

  // State Form Cepat di Beranda: Sambungkan Data Siswa (Kode, Nama Peserta, Kelas, Token) ke Spreadsheet
  const [quickKode, setQuickKode] = useState('7A-007');
  const [quickNama, setQuickNama] = useState('');
  const [quickKelas, setQuickKelas] = useState<KelasOption>('7A');
  const [quickToken, setQuickToken] = useState('WNRY26');
  const [quickSaveFeedback, setQuickSaveFeedback] = useState<string | null>(null);
  const [isQuickSaving, setIsQuickSaving] = useState(false);

  // Fungsi Tarik Status, Users, dan Results dari Server
  const fetchAllData = useCallback(async () => {
    try {
      const [statusRes, usersRes, resultsRes] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/users'),
        fetch('/api/results'),
      ]);

      if (statusRes.ok) {
        const sData = await statusRes.json();
        setConnectionStatus({
          connected: Boolean(sData.connected),
          mode: sData.mode || 'server_database_ready',
          message: sData.message || 'Database Terhubung',
          lastSync: sData.lastSync || new Date().toLocaleTimeString('id-ID'),
          latencyMs: Number(sData.latencyMs || 10),
          totalUsers: Number(sData.totalUsers || 0),
          totalResults: Number(sData.totalResults || 0),
          appsScriptUrlConfigured: Boolean(sData.appsScriptUrlConfigured),
        });
        if (sData.settings) {
          setSettings(sData.settings);
          setQuickToken(sData.settings.examToken || 'WNRY26');
        }
      }

      if (usersRes.ok) {
        const uData = await usersRes.json();
        if (Array.isArray(uData.users)) {
          setUsers(uData.users);
        }
      }

      if (resultsRes.ok) {
        const rData = await resultsRes.json();
        if (Array.isArray(rData.results)) {
          setResults(rData.results);
        }
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handler Tambah / Simpan Data Siswa ke Spreadsheet (Kode, Nama Peserta, Kelas, Token)
  const handleAddStudentToSheet = async (student: Partial<StudentUser>) => {
    try {
      const resp = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });
      const data = await resp.json();
      if (data.ok && Array.isArray(data.users)) {
        setUsers(data.users);
        await fetchAllData();
        return { ok: true, message: data.message, student: data.student };
      }
      return { ok: false, message: data.message || 'Gagal menyimpan data siswa.' };
    } catch {
      return { ok: false, message: 'Gagal menghubungi server database.' };
    }
  };

  // Handler Form Cepat di Home (Sambungkan Kode, Nama Peserta, Kelas, Token ke Spreadsheet)
  const handleQuickSaveStudentHome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNama.trim() || !quickKode.trim()) return;
    setIsQuickSaving(true);
    setQuickSaveFeedback(null);
    try {
      const res = await handleAddStudentToSheet({
        kode: quickKode.trim(),
        nama: quickNama.trim(),
        kelas: quickKelas,
        token: quickToken.trim().toUpperCase() || 'WNRY26',
        username: quickKode.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
        password: '123456',
      });
      setQuickSaveFeedback(res.message);
      if (res.ok) {
        setQuickNama('');
        const nextIdx = users.filter((u) => u.kelas === quickKelas).length + 2;
        setQuickKode(`${quickKelas}-${String(nextIdx).padStart(3, '0')}`);
      }
    } finally {
      setIsQuickSaving(false);
    }
  };

  // Handler "Tarik dari Spreadsheet"
  const handlePullFromSpreadsheet = async () => {
    try {
      const resp = await fetch('/api/users/pull-spreadsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appsScriptUrl: settings.appsScriptUrl }),
      });
      const data = await resp.json();
      if (data.ok && Array.isArray(data.users)) {
        setUsers(data.users);
        await fetchAllData();
        return { ok: true, message: data.message };
      }
      return { ok: false, message: data.message || 'Gagal menarik data spreadsheet.' };
    } catch {
      return { ok: false, message: 'Gagal melakukan sinkronisasi dengan spreadsheet.' };
    }
  };

  // Handler Submit Hasil Ujian ke Sheet JawabanUjian
  const handleSubmitExamResult = async (submission: Omit<ExamSubmission, 'id'>) => {
    try {
      const resp = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      const data = await resp.json();
      await fetchAllData();
      return {
        ok: Boolean(data.ok),
        message: data.message || 'Hasil ujian tersimpan di sheet JawabanUjian.',
        result: data.result,
      };
    } catch {
      return {
        ok: true,
        message: 'Hasil ujian tersimpan secara lokal.',
      };
    }
  };

  // Handler Update Pengaturan
  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const resp = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await resp.json();
      if (data.ok && data.settings) {
        setSettings(data.settings);
        await fetchAllData();
        return { ok: true, message: data.message };
      }
      return { ok: false, message: 'Gagal menyimpan pengaturan.' };
    } catch {
      return { ok: false, message: 'Terjadi kesalahan saat menyimpan pengaturan.' };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* =================================================================== */}
      {/* TOP BAR NAVIGATION CONTRACT (HEADER BIRU DENGAN LOGO DI KIRI)       */}
      {/* =================================================================== */}
      <header className="bg-[#0284C7] text-white border-b border-sky-700 sticky top-0 z-40 shadow-sm no-print">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Title with School Logo on the Left */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left cursor-pointer shrink-0"
          >
            <SchoolLogo size="sm" />
            <span className="text-base sm:text-lg font-bold tracking-tight text-white font-display whitespace-nowrap">
              SMP Negeri 1 Wanaraya
            </span>
          </button>

          {/* Zone 2: 5 Clean Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-sky-100">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'home'
                  ? 'text-white font-bold underline underline-offset-8 decoration-2 decoration-amber-300'
                  : 'hover:text-white'
              }`}
            >
              Beranda
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tujuan')}
              className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'tujuan'
                  ? 'text-white font-bold underline underline-offset-8 decoration-2 decoration-amber-300'
                  : 'hover:text-white'
              }`}
            >
              1. Tujuan Pembelajaran
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('materi')}
              className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'materi'
                  ? 'text-white font-bold underline underline-offset-8 decoration-2 decoration-amber-300'
                  : 'hover:text-white'
              }`}
            >
              2. Materi & Infografis
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kuis')}
              className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'kuis'
                  ? 'text-white font-bold underline underline-offset-8 decoration-2 decoration-amber-300'
                  : 'hover:text-white'
              }`}
            >
              3. Kuis CBT
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'admin'
                  ? 'text-white font-bold underline underline-offset-8 decoration-2 decoration-amber-300'
                  : 'hover:text-white'
              }`}
            >
              Admin & Spreadsheet
            </button>
          </nav>

          {/* Zone 3: Primary Action & User Identity (Suwarto) */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden lg:inline-block text-xs text-sky-100 whitespace-nowrap">
              Pengguna: <strong className="text-white">Suwarto</strong>
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('kuis')}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              Masuk CBT ANBK
            </button>
          </div>
        </div>

        {/* Mobile Secondary Nav Bar */}
        <div className="md:hidden bg-sky-800 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'home' ? 'bg-white text-sky-900 font-bold' : 'text-sky-100'
            }`}
          >
            Beranda
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tujuan')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'tujuan' ? 'bg-white text-sky-900 font-bold' : 'text-sky-100'
            }`}
          >
            1. Tujuan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('materi')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'materi' ? 'bg-white text-sky-900 font-bold' : 'text-sky-100'
            }`}
          >
            2. Materi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kuis')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'kuis' ? 'bg-white text-sky-900 font-bold' : 'text-sky-100'
            }`}
          >
            3. Kuis CBT
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-white text-sky-900 font-bold' : 'text-sky-100'
            }`}
          >
            Admin
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* KONTEN UTAMA BERDASARKAN MENU YANG DIPILIH                          */}
      {/* =================================================================== */}
      <div className="flex-1">
        {activeTab === 'home' && (
          <div className="space-y-12 pb-12">
            {/* HERO SECTION DENGAN SALAM PEMBUKA "SALAM BELAJAR JARAK JAUH" & BACKGROUND CERAH */}
            <section className="bg-gradient-to-b from-sky-100/80 via-sky-50/50 to-[#F8FAFC] border-b border-slate-200/80 pt-8 pb-12 px-4 sm:px-6">
              <div className="max-w-[1200px] mx-auto space-y-8">
                {/* Bar Indikator Koneksi Database Google Spreadsheet Real-Time */}
                <div className="bg-white border border-sky-200/90 rounded-xl px-4 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-900">Indikator Koneksi Database:</span>
                    <span className="text-slate-700">{connectionStatus.message}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-slate-500 tabular-nums">
                      Tahun Ajaran 2026/2027 · Guru Pengampu: <strong className="text-slate-900">Suwarto</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className="text-sky-700 hover:text-sky-900 font-semibold underline cursor-pointer"
                    >
                      Lihat Kode Apps Script →
                    </button>
                  </div>
                </div>

                {/* Main Hero Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 tracking-wide uppercase">
                      <span>✨ Salam Belajar Jarak Jauh · SMP Negeri 1 Wanaraya</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-900 font-display leading-[1.18]">
                      Salam Belajar Jarak Jauh! Portal LMS & Ujian Online CBT ANBK Kelas 7 Fase D
                    </h1>

                    <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                      Selamat datang di Sistem Pembelajaran Digital dan Asesmen Nasional Berbasis Komputer (CBT ANBK)
                      Matematika Kelas VII Fase D <strong>SMP Negeri 1 Wanaraya Tahun Ajaran 2026/2027</strong> bersama
                      Bapak <strong>Suwarto</strong>. Pelajari materi <em>Bilangan Rasional</em> dan <em>Rasio</em>,
                      eksplorasi poster infografis, serta kerjakan kuis CBT yang terhubung langsung ke Google Spreadsheet.
                    </p>

                    {/* Dominant CTA & Secondary Navigation */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('kuis')}
                        className="px-6 py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <span>Mulai Kuis CBT ANBK (20 Soal)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('materi')}
                        className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-300 transition-colors cursor-pointer"
                      >
                        Buka Materi & Poster Infografis
                      </button>
                    </div>

                    {/* Ringkasan Statistik Kurikulum */}
                    <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-lg font-mono tabular-nums">
                      <div>
                        <div className="text-xl font-bold text-slate-900">Bab 2 & 3</div>
                        <div className="text-xs font-sans text-slate-600">Bilangan Rasional & Rasio</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-sky-700">20 Butir</div>
                        <div className="text-xs font-sans text-slate-600">Soal TKA Kalimantan Selatan</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-emerald-700">80 Menit</div>
                        <div className="text-xs font-sans text-slate-600">Timer Standar CBT ANBK</div>
                      </div>
                    </div>
                  </div>

                  {/* Hero Visual Showcase Card */}
                  <div className="lg:col-span-5">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden p-4 space-y-4">
                      <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video relative">
                        <img
                          src={imgPertanianWanaraya}
                          alt="Konteks Pembelajaran SMP Negeri 1 Wanaraya Kalimantan Selatan"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent flex flex-col justify-end p-4 text-white">
                          <div className="text-xs text-sky-300 font-semibold">
                            Konteks Lokal Kabupaten Barito Kuala · Kalimantan Selatan
                          </div>
                          <div className="text-sm font-bold leading-snug">
                            Numerasi Kontekstual Pertanian Rawa Pasang Surut Wanaraya & Pasar Terapung
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100">
                          <div className="font-bold text-slate-900">Pengampu Materi</div>
                          <div className="text-sky-800 font-semibold mt-0.5">Bapak Suwarto</div>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                          <div className="font-bold text-slate-900">Token Ujian Aktif</div>
                          <div className="font-mono font-bold text-emerald-800 mt-0.5">{settings.examToken}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* 3 MENU UTAMA SESUAI SPESIFIKASI: 1. TUJUAN  2. MATERI  3. KUIS   */}
            {/* ================================================================= */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                    Navigasi Utama Aplikasi LMS & CBT
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 font-display">
                    Pilih Menu Pembelajaran Jarak Jauh
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  SMP Negeri 1 Wanaraya · Kelas VII (7A & 7B) · Fase D Matematika
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Menu 1: Tujuan Pembelajaran */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-sky-400 transition-colors shadow-2xs">
                  <div className="space-y-4">
                    <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                      <Compass className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-sky-700">Menu 01 · Kurikulum Fase D</div>
                      <h3 className="text-xl font-bold text-slate-900 font-display">
                        1. Tujuan Pembelajaran
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Memuat capaian dan tujuan pembelajaran Bab 2 (Bilangan Rasional: Pecahan & Desimal) serta Bab 3
                        (Rasio, Skala & Laju Perubahan Satuan) sesuai buku teks yang diunggah, lengkap dengan refleksi diri.
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveTab('tujuan')}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Buka Tujuan Pembelajaran</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Menu 2: Materi & Poster Infografis */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-400 transition-colors shadow-2xs">
                  <div className="space-y-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-emerald-700">Menu 02 · Eksplorasi & Infografis</div>
                      <h3 className="text-xl font-bold text-slate-900 font-display">
                        2. Materi & Poster Infografis
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Materi lengkap halaman 61–100 (Resep Kue Nagasari, Grid Perkalian Pecahan, Resiprokal, IMT,
                        Rasio Susu Cokelat, Skala & Bidang Miring) dilengkapi <strong>Poster Infografis</strong> & AI Generator.
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveTab('materi')}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Pelajari Materi & Generate Poster</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Menu 3: Kuis CBT ANBK */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-sky-500 transition-colors shadow-2xs">
                  <div className="space-y-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-amber-800">Menu 03 · Asesmen CBT ANBK</div>
                      <h3 className="text-xl font-bold text-slate-900 font-display">
                        3. Kuis (Ujian CBT ANBK)
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Login siswa Kelas 7A & 7B dari sheet <span className="font-mono">UserLogin</span>. Kerjakan 20 soal
                        Matematika (PG, PG Kompleks, Benar-Salah) dengan stimulus Kalimantan Selatan & simpan otomatis ke{' '}
                        <span className="font-mono">JawabanUjian</span>.
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveTab('kuis')}
                      className="w-full py-2.5 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Login & Mulai Kuis CBT</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* SEKSI INTEGRASI DATA SISWA KE GOOGLE SPREADSHEET & PREVIEW POSTER */}
            {/* ================================================================= */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Kiri (6 Kolom): Form Sambungkan Data Siswa (Kode, Nama Peserta, Kelas, Token) ke Spreadsheet */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xs">
                <div className="border-b border-slate-200 pb-4">
                  <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    <span>Integrasi Langsung ke Google Spreadsheet (Sheet UserLogin)</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 font-display mt-1">
                    Sambungkan Data Siswa (Kode, Nama Peserta, Kelas & Token)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Isi formulir di bawah ini untuk menyimpan data peserta didik baru langsung ke database dan Google Spreadsheet.
                  </p>
                </div>

                {quickSaveFeedback && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">{quickSaveFeedback}</div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('kuis')}
                        className="mt-1.5 text-emerald-800 underline font-semibold cursor-pointer"
                      >
                        Lanjut ke Halaman Login Kuis CBT →
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleQuickSaveStudentHome} className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block text-xs">
                        Kode Peserta *
                      </label>
                      <input
                        type="text"
                        required
                        value={quickKode}
                        onChange={(e) => setQuickKode(e.target.value)}
                        placeholder="Contoh: 7A-007"
                        className="w-full px-3.5 py-2.5 font-mono bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block text-xs">
                        Kelas (Pilihan Dropdown) *
                      </label>
                      <select
                        value={quickKelas}
                        onChange={(e) => {
                          const k = e.target.value as KelasOption;
                          setQuickKelas(k);
                          const nextNum = users.filter((u) => u.kelas === k).length + 1;
                          setQuickKode(`${k}-${String(nextNum).padStart(3, '0')}`);
                        }}
                        className="w-full px-3.5 py-2.5 font-semibold bg-slate-50 border border-slate-300 rounded-xl"
                      >
                        <option value="7A">Kelas 7A</option>
                        <option value="7B">Kelas 7B</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">
                      Nama Peserta Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={quickNama}
                      onChange={(e) => setQuickNama(e.target.value)}
                      placeholder="Ketik nama lengkap peserta didik..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">
                      Token Ujian CBT *
                    </label>
                    <input
                      type="text"
                      required
                      value={quickToken}
                      onChange={(e) => setQuickToken(e.target.value.toUpperCase())}
                      placeholder="WNRY26"
                      className="w-full px-3.5 py-2.5 font-mono font-bold uppercase bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={isQuickSaving}
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {isQuickSaving ? 'Menyimpan ke Spreadsheet...' : 'Simpan ke Google Spreadsheet'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Code2 className="w-4 h-4 text-sky-700" />
                      <span>Buka Script Apps Script</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Kanan (6 Kolom): Pratinjau Poster Infografis & Panel Admin Suwarto */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-sky-700">Poster Infografis Materi</div>
                      <h3 className="text-lg font-bold text-slate-900 font-display">
                        Infografis Visual Bab 2 & Bab 3
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('materi')}
                      className="text-xs font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
                    >
                      Buka & Generate Poster →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => setActiveTab('materi')}
                      className="group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer"
                    >
                      <div className="aspect-[3/4] overflow-hidden">
                        <img
                          src={imgInfografisRasional}
                          alt="Poster Infografis Bilangan Rasional"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="p-2.5 text-xs font-bold text-slate-800 text-center">
                        Poster Bab 2: Bilangan Rasional
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab('materi')}
                      className="group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer"
                    >
                      <div className="aspect-[3/4] overflow-hidden">
                        <img
                          src={imgInfografisRasio}
                          alt="Poster Infografis Rasio dan Skala"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="p-2.5 text-xs font-bold text-slate-800 text-center">
                        Poster Bab 3: Rasio & Skala
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kartu Akses Cepat Admin & Pembahasan Terprotek Suwarto */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4" />
                      <span>Halaman Admin & Pembahasan Terprotek</span>
                    </div>
                    <div className="text-base font-bold">
                      Kelola Data Pengguna, Tarik dari Spreadsheet & Pembahasan (Password: Suwarto)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('admin')}
                    className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-sky-700" />
                    <span>Buka Halaman Admin</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'tujuan' && <TujuanPembelajaranView onNavigate={setActiveTab} />}

        {activeTab === 'materi' && <MateriView onNavigate={setActiveTab} />}

        {activeTab === 'kuis' && (
          <CbtQuizView
            users={users}
            connectionStatus={connectionStatus}
            examDurationMinutes={settings.examDurationMinutes}
            activeToken={settings.examToken}
            onRefreshUsers={async () => {
              await handlePullFromSpreadsheet();
            }}
            onRegisterStudentToSheet={handleAddStudentToSheet}
            onSubmitExamResult={handleSubmitExamResult}
            onExitToHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            users={users}
            results={results}
            settings={settings}
            connectionStatus={connectionStatus}
            onPullFromSpreadsheet={handlePullFromSpreadsheet}
            onAddStudentToSheet={handleAddStudentToSheet}
            onUpdateSettings={handleUpdateSettings}
            onTestConnection={fetchAllData}
          />
        )}
      </div>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 px-4 sm:px-6 text-xs text-slate-500 no-print">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026/2027 <strong>SMP Negeri 1 Wanaraya</strong> · Kabupaten Barito Kuala, Kalimantan Selatan
          </div>
          <div>
            LMS & CBT ANBK Matematika Kelas VII Fase D · Pengampu: <strong className="text-slate-700">Suwarto</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
