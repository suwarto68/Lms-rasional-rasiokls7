import React, { useState, useEffect, useMemo } from 'react';
import {
  StudentUser,
  KelasOption,
  AnswerValue,
  ExamSubmission,
  ConnectionStatus,
} from '../types/cbtTypes';
import { QuestionItem } from '../data/questionsData';
import {
  getShuffledQuestionsForStudent,
  isQuestionAnswered,
  calculateExamScores,
} from '../utils/examUtils';
import { SchoolLogo } from './SchoolLogo';
import {
  LogOut,
  Clock,
  Grid,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  KeyRound,
  Database,
  Send,
  RefreshCw,
  Award,
  FileSpreadsheet,
} from 'lucide-react';

interface CbtQuizViewProps {
  users: StudentUser[];
  connectionStatus: ConnectionStatus;
  examDurationMinutes: number;
  activeToken: string;
  onRefreshUsers: () => Promise<void>;
  onRegisterStudentToSheet: (student: Partial<StudentUser>) => Promise<{ ok: boolean; message: string; student?: StudentUser }>;
  onSubmitExamResult: (submission: Omit<ExamSubmission, 'id'>) => Promise<{ ok: boolean; message: string; result?: ExamSubmission }>;
  onExitToHome: () => void;
}

export const CbtQuizView: React.FC<CbtQuizViewProps> = ({
  users,
  connectionStatus,
  examDurationMinutes,
  activeToken,
  onRefreshUsers,
  onRegisterStudentToSheet,
  onSubmitExamResult,
  onExitToHome,
}) => {
  // Mode Login vs Pendaftaran Cepat ke Spreadsheet
  const [authTab, setAuthTab] = useState<'login' | 'register_sheet'>('login');

  // State Form Login Siswa
  const [selectedKelas, setSelectedKelas] = useState<KelasOption>('7A');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [tokenInput, setTokenInput] = useState(activeToken || 'WNRY26');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // State Form Sambungkan Data Siswa ke Spreadsheet (Kode, Nama Peserta, Kelas, Token)
  const [regKode, setRegKode] = useState('7A-007');
  const [regNama, setRegNama] = useState('');
  const [regKelas, setRegKelas] = useState<KelasOption>('7A');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('123456');
  const [regToken, setRegToken] = useState(activeToken || 'WNRY26');
  const [regMessage, setRegMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // State Siswa yang Sedang Login & Ujian Aktif
  const [loggedInStudent, setLoggedInStudent] = useState<StudentUser | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [doubtfulMap, setDoubtfulMap] = useState<Record<number, boolean>>({});
  const [showQuestionListModal, setShowQuestionListModal] = useState(false);
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(examDurationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<ExamSubmission | null>(null);

  // Daftar siswa sesuai dropdown Kelas [7A dan 7B] dari sheet UserLogin
  const classUsers = useMemo(
    () => users.filter((u) => u.kelas === selectedKelas),
    [users, selectedKelas]
  );

  // Soal diacak untuk setiap siswa berdasarkan username + kode peserta
  const shuffledQuestions: QuestionItem[] = useMemo(() => {
    if (!loggedInStudent) return [];
    return getShuffledQuestionsForStudent(`${loggedInStudent.kode}-${loggedInStudent.username}`);
  }, [loggedInStudent]);

  // Timer Hitung Mundur 80 Menit
  useEffect(() => {
    if (!loggedInStudent || submittedResult) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loggedInStudent, submittedResult]);

  // Auto-submit jika waktu habis
  useEffect(() => {
    if (loggedInStudent && !submittedResult && timeLeftSeconds === 0 && !isSubmitting) {
      handleFinalSubmitExam();
    }
  }, [timeLeftSeconds, loggedInStudent, submittedResult]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Handler Pilih Cepat Akun Siswa dari Dropdown Sheet UserLogin
  const handleQuickSelectStudent = (u: StudentUser) => {
    setSelectedKelas(u.kelas);
    setUsernameInput(u.username);
    setPasswordInput(u.password);
    setTokenInput(u.token || activeToken || 'WNRY26');
    setLoginError('');
  };

  // Handler Login Siswa (Kompatibel Penuh di Vercel & Server)
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const cleanUser = usernameInput.trim().toLowerCase();
      const cleanPass = passwordInput.trim();
      const cleanToken = tokenInput.trim().toUpperCase();

      // 1. Cari pada daftar siswa yang sudah disinkronkan dari sheet UserLogin
      let matched = users.find(
        (u) =>
          (u.username.toLowerCase() === cleanUser ||
            u.kode.toLowerCase() === cleanUser ||
            u.nama.toLowerCase() === cleanUser) &&
          u.kelas === selectedKelas
      );

      // 2. Jika belum ditemukan di memori lokal, coba segarkan dari Google Spreadsheet terlebih dahulu
      if (!matched) {
        await onRefreshUsers();
      }

      matched = users.find(
        (u) =>
          (u.username.toLowerCase() === cleanUser ||
            u.kode.toLowerCase() === cleanUser ||
            u.nama.toLowerCase() === cleanUser) &&
          u.kelas === selectedKelas
      );

      if (matched) {
        if (matched.password !== cleanPass) {
          setLoginError('Password yang Anda masukkan tidak sesuai dengan data pada sheet UserLogin.');
          return;
        }
        if (
          cleanToken &&
          cleanToken !== (matched.token || '').toUpperCase() &&
          cleanToken !== (activeToken || 'WNRY26').toUpperCase()
        ) {
          setLoginError(`Token ujian "${tokenInput}" tidak valid. Gunakan Token Aktif: ${activeToken}`);
          return;
        }

        setLoggedInStudent(matched);
        setCurrentIndex(0);
        setAnswers({});
        setDoubtfulMap({});
        setSubmittedResult(null);
        setTimeLeftSeconds((examDurationMinutes || 80) * 60);
        return;
      }

      // 3. Fallback ke endpoint /api/auth/login jika berjalan di server Node
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
          kelas: selectedKelas,
          token: tokenInput,
        }),
      });
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await resp.json();
        if (resp.ok && data.ok && data.student) {
          setLoggedInStudent(data.student);
          setCurrentIndex(0);
          setAnswers({});
          setDoubtfulMap({});
          setSubmittedResult(null);
          setTimeLeftSeconds((data.examConfig?.durationMinutes || examDurationMinutes || 80) * 60);
          return;
        }
        setLoginError(
          data.message ||
            `Data peserta "${usernameInput}" tidak ditemukan pada Kelas ${selectedKelas} di sheet UserLogin.`
        );
      } else {
        setLoginError(
          `Data peserta "${usernameInput}" tidak ditemukan pada Kelas ${selectedKelas} di sheet UserLogin. Silakan klik "Segarkan Sheet UserLogin" atau daftarkan peserta di tab sebelah.`
        );
      }
    } catch {
      setLoginError(
        `Data peserta "${usernameInput}" tidak ditemukan pada Kelas ${selectedKelas} di sheet UserLogin.`
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handler Simpan Data Siswa Baru ke Spreadsheet (Kode, Nama Peserta, Kelas, Token)
  const handleRegisterAndSaveToSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegMessage(null);
    if (!regNama.trim() || !regKode.trim()) {
      setRegMessage({
        type: 'error',
        text: 'Mohon isi Kode Peserta dan Nama Peserta terlebih dahulu.',
      });
      return;
    }

    setIsRegistering(true);
    try {
      const res = await onRegisterStudentToSheet({
        kode: regKode.trim(),
        nama: regNama.trim(),
        kelas: regKelas,
        username: regUsername.trim() || regKode.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
        password: regPassword.trim() || '123456',
        token: regToken.trim().toUpperCase() || 'WNRY26',
      });

      if (res.ok && res.student) {
        setRegMessage({
          type: 'success',
          text: `${res.message} Silakan langsung klik "Gunakan untuk Login Ujian" di bawah.`,
        });
        setSelectedKelas(res.student.kelas);
        setUsernameInput(res.student.username);
        setPasswordInput(res.student.password);
        setTokenInput(res.student.token);
      } else {
        setRegMessage({ type: 'error', text: res.message || 'Gagal menyimpan ke spreadsheet.' });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  // Handler Logout Siswa
  const handleLogoutStudent = () => {
    setLoggedInStudent(null);
    setSubmittedResult(null);
    setAnswers({});
    setDoubtfulMap({});
    setShowQuestionListModal(false);
    setShowConfirmSubmitModal(false);
  };

  // Handler Input Jawaban Siswa
  const handleSelectPG = (qId: number, optionId: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  const handleTogglePGK = (qId: number, optionId: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[qId]) ? ([...(prev[qId] as ('A' | 'B' | 'C' | 'D')[])] ) : [];
      const exists = current.includes(optionId);
      const updated = exists ? current.filter((x) => x !== optionId) : [...current, optionId];
      return { ...prev, [qId]: updated };
    });
  };

  const handleSelectBS = (qId: number, statementId: string, val: 'Benar' | 'Salah') => {
    setAnswers((prev) => {
      const current =
        prev[qId] && typeof prev[qId] === 'object' && !Array.isArray(prev[qId])
          ? { ...(prev[qId] as Record<string, 'Benar' | 'Salah'>) }
          : {};
      current[statementId] = val;
      return { ...prev, [qId]: current };
    });
  };

  const toggleDoubtful = (qId: number) => {
    setDoubtfulMap((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Hitung jumlah soal terjawab untuk Progress Bar
  const answeredCount = useMemo(() => {
    return shuffledQuestions.filter((q) => isQuestionAnswered(q, answers[q.id])).length;
  }, [shuffledQuestions, answers]);

  const progressPercentage = shuffledQuestions.length
    ? Math.round((answeredCount / shuffledQuestions.length) * 100)
    : 0;

  // Handler Selesai & Simpan Hasil Ujian ke Google Spreadsheet (sheet JawabanUjian)
  const handleFinalSubmitExam = async () => {
    if (!loggedInStudent || isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmSubmitModal(false);

    const { skorPemahaman, skorAplikasi, skorPenalaran, skorAkhir, jawabanFormatted } =
      calculateExamScores(answers);

    const elapsedSeconds = Math.max(10, examDurationMinutes * 60 - timeLeftSeconds);
    const nowStr = new Date().toLocaleString('id-ID');

    const payload: Omit<ExamSubmission, 'id'> = {
      waktu: nowStr,
      kode: loggedInStudent.kode,
      username: loggedInStudent.username,
      nama: loggedInStudent.nama,
      kelas: loggedInStudent.kelas,
      token: loggedInStudent.token || tokenInput || 'WNRY26',
      durasiDetik: elapsedSeconds,
      jawaban: answers,
      jawabanFormatted,
      skorPemahaman,
      skorAplikasi,
      skorPenalaran,
      skorAkhir,
      syncedToSheet: true,
    };

    try {
      const res = await onSubmitExamResult(payload);
      setSubmittedResult(
        res.result || {
          id: `RES-${Date.now()}`,
          ...payload,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // TAMPILAN 1: HALAMAN LOGIN SISWA CBT ANBK (KOTAK PUTIH DENGAN BAYANGAN)
  // ============================================================================
  if (!loggedInStudent) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-gradient-to-b from-sky-50 via-[#F8FAFC] to-slate-100 py-8 px-4 sm:px-6">
        <div className="max-w-[1140px] mx-auto space-y-6">
          {/* Bar Indikator Koneksi Database Google Spreadsheet */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  connectionStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-slate-900">Status Database Spreadsheet: </span>
                <span className="text-slate-700">{connectionStatus.message}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                Sinkron: {connectionStatus.lastSync} ({connectionStatus.latencyMs}ms)
              </span>
              <button
                type="button"
                onClick={onRefreshUsers}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan Sheet UserLogin</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* KOTAK LOGIN PUTIH DENGAN BAYANGAN (SHADOW) SESUAI SPESIFIKASI */}
            <div className="lg:col-span-7 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
              {/* Header Biru Kotak Login */}
              <div className="bg-[#0284C7] text-white px-6 py-5 flex items-center gap-4">
                <SchoolLogo size="md" />
                <div>
                  <div className="text-xs text-sky-100 font-medium">
                    Portal CBT ANBK Matematika Kelas 7 Fase D · T.A. 2026/2027
                  </div>
                  <h1 className="text-xl font-bold font-display">
                    SMP Negeri 1 Wanaraya
                  </h1>
                </div>
              </div>

              {/* Tab Switcher: Login Siswa vs Input Data Siswa ke Spreadsheet */}
              <div className="px-6 pt-5">
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAuthTab('login')}
                    className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      authTab === 'login'
                        ? 'bg-white text-sky-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Login Peserta Ujian</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthTab('register_sheet')}
                    className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      authTab === 'register_sheet'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Input Data Siswa ke Sheet</span>
                  </button>
                </div>
              </div>

              {authTab === 'login' ? (
                <form onSubmit={handleStudentLogin} className="p-6 sm:p-8 space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-900">
                      Login Siswa Peserta CBT ANBK
                    </h2>
                    <p className="text-xs text-slate-500">
                      Masukkan Username/Kode, Password, dan pilih Kelas [7A atau 7B] sesuai data pada sheet{' '}
                      <span className="font-mono font-semibold text-slate-700">UserLogin</span>.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold">Gagal Masuk ke Ruang Ujian</div>
                        <div>{loginError}</div>
                      </div>
                    </div>
                  )}

                  {/* Dropdown Kelas [7A dan 7B] */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Pilih Kelas (Sheet UserLogin)
                    </label>
                    <select
                      value={selectedKelas}
                      onChange={(e) => {
                        setSelectedKelas(e.target.value as KelasOption);
                        setLoginError('');
                      }}
                      className="w-full px-4 py-3 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
                    >
                      <option value="7A">Kelas 7A — SMP Negeri 1 Wanaraya</option>
                      <option value="7B">Kelas 7B — SMP Negeri 1 Wanaraya</option>
                    </select>
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Username / Kode Peserta
                    </label>
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Contoh: siswa7a1 atau 7A-001"
                      className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-600 focus:bg-white"
                    />
                  </div>

                  {/* Password & Token */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Masukkan password (123456)"
                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-600 focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Token Ujian CBT
                      </label>
                      <input
                        type="text"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                        placeholder="WNRY26"
                        className="w-full px-4 py-3 text-sm font-mono font-bold uppercase bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3.5 px-6 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    {isLoggingIn ? 'Memverifikasi Data UserLogin...' : 'LOGIN & MULAI UJIAN CBT (80 MENIT)'}
                  </button>
                </form>
              ) : (
                /* Form Sambungkan Data Siswa (Kode, Nama Peserta, Kelas, Token) ke Spreadsheet */
                <form onSubmit={handleRegisterAndSaveToSheet} className="p-6 sm:p-8 space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-900">
                      Simpan Data Siswa Baru ke Google Spreadsheet
                    </h2>
                    <p className="text-xs text-slate-500">
                      Isian <strong>Kode Peserta, Nama Peserta, Kelas [7A/7B], dan Token</strong> di bawah ini
                      otomatis tersimpan ke dalam sheet <span className="font-mono font-semibold">UserLogin</span>.
                    </p>
                  </div>

                  {regMessage && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                        regMessage.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      <div className="font-semibold">{regMessage.text}</div>
                      {regMessage.type === 'success' && (
                        <button
                          type="button"
                          onClick={() => setAuthTab('login')}
                          className="mt-2 px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Gunakan untuk Login Ujian Sekarang →
                        </button>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Kode Peserta *</label>
                      <input
                        type="text"
                        required
                        value={regKode}
                        onChange={(e) => setRegKode(e.target.value)}
                        placeholder="Contoh: 7A-007"
                        className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Pilih Kelas *</label>
                      <select
                        value={regKelas}
                        onChange={(e) => {
                          const k = e.target.value as KelasOption;
                          setRegKelas(k);
                          setRegKode(`${k}-00${users.filter((u) => u.kelas === k).length + 1}`);
                        }}
                        className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl"
                      >
                        <option value="7A">Kelas 7A</option>
                        <option value="7B">Kelas 7B</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Nama Peserta Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={regNama}
                      onChange={(e) => setRegNama(e.target.value)}
                      placeholder="Masukkan nama lengkap peserta didik..."
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Username Login</label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="Otomatis dari kode"
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Password</label>
                      <input
                        type="text"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Token Ujian *</label>
                      <input
                        type="text"
                        required
                        value={regToken}
                        onChange={(e) => setRegToken(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isRegistering
                        ? 'Menyimpan ke Google Spreadsheet...'
                        : 'Simpan (Kode, Nama Peserta, Kelas & Token) ke Spreadsheet'}
                    </span>
                  </button>
                </form>
              )}
            </div>

            {/* PANEL KANAN: DAFTAR PESERTA SHEET USERLOGIN (PILIH CEPAT 1 KLIK) */}
            <div className="lg:col-span-5 bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-sky-600" />
                    <span>Data Peserta Sheet UserLogin (Kelas {selectedKelas})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klik salah satu nama siswa di bawah untuk mengisi form login secara otomatis:
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-sky-700 tabular-nums">
                  Token: {activeToken}
                </span>
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {classUsers.map((u) => (
                  <button
                    key={u.kode}
                    type="button"
                    onClick={() => handleQuickSelectStudent(u)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors flex items-center justify-between cursor-pointer ${
                      usernameInput === u.username
                        ? 'bg-sky-50 border-sky-500 text-slate-900'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs sm:text-sm font-bold text-slate-900">{u.nama}</div>
                      <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                        Kode: {u.kode} · User: <strong>{u.username}</strong> · Pass: <strong>{u.password}</strong>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-sky-700 shrink-0">Pilih →</span>
                  </button>
                ))}
              </div>

              {/* Ringkasan Aturan Ujian CBT ANBK */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-900">Ketentuan Ujian CBT Matematika Kelas 7 Fase D:</div>
                <div>• Jumlah Soal: <strong>20 Butir Soal Acak</strong> (Waktu: {examDurationMinutes} Menit)</div>
                <div>• Komposisi Level: Pemahaman (10%), Aplikasi (40%), Penalaran (50%)</div>
                <div>• Tipe Soal: Pilihan Ganda, Pilihan Ganda Kompleks (4 opsi, 2 benar), Benar-Salah (3 pernyataan)</div>
                <div>• Hasil otomatis tersimpan ke Google Spreadsheet (<span className="font-mono">sheet JawabanUjian</span>)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // TAMPILAN 2: HALAMAN HASIL UJIAN SETELAH SELESAI & TERSIMPAN DI SPREADSHEET
  // ============================================================================
  if (submittedResult) {
    return (
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-[#0284C7] text-white px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <SchoolLogo size="md" />
              <div>
                <div className="text-xs text-sky-100">
                  Bukti Penyelesaian CBT ANBK · SMP Negeri 1 Wanaraya T.A. 2026/2027
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display">
                  Hasil Ujian Matematika Kelas 7 Fase D
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogoutStudent}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Akun Siswa</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Banner Status Tersimpan di Google Spreadsheet */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-emerald-950 space-y-0.5">
                <div className="font-bold">
                  Jawaban & Skor Akhir Otomatis Tersimpan di Google Spreadsheet (Sheet JawabanUjian)
                </div>
                <p className="text-emerald-800">
                  Data Nama ({submittedResult.nama}), Kelas ({submittedResult.kelas}), Waktu ({submittedResult.waktu}),
                  jawaban nomor 1 s.d. 20, dan Skor Akhir telah terekam di database.
                </p>
              </div>
            </div>

            {/* Rincian Identitas & Skor Akhir */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-sm">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Nama Peserta:</span>
                  <span className="font-bold text-slate-900">{submittedResult.nama}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Kode Peserta / Username:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {submittedResult.kode} ({submittedResult.username})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Kelas:</span>
                  <span className="font-bold text-sky-700">{submittedResult.kelas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu Pengumpulan:</span>
                  <span className="font-mono text-xs text-slate-700 tabular-nums">{submittedResult.waktu}</span>
                </div>
              </div>

              <div className="md:col-span-5 p-6 rounded-xl bg-sky-50 border border-sky-200 text-center space-y-2">
                <Award className="w-8 h-8 text-sky-600 mx-auto" />
                <div className="text-xs font-semibold text-sky-800">SKOR AKHIR MATEMATIKA FASE D</div>
                <div className="text-4xl font-bold font-mono text-slate-900 tabular-nums">
                  {submittedResult.skorAkhir} <span className="text-lg font-normal text-slate-500">/ 100</span>
                </div>
                <div className="text-xs text-slate-600 font-mono tabular-nums pt-1">
                  Pemahaman: {submittedResult.skorPemahaman}/10 · Aplikasi: {submittedResult.skorAplikasi}/40 · Penalaran: {submittedResult.skorPenalaran}/50
                </div>
              </div>
            </div>

            {/* Tabel Rekaman Jawaban Nomor 1 - 20 yang Dikirim ke Sheet JawabanUjian */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Rekaman Jawaban Tiap Nomor pada Sheet JawabanUjian (No. 1 s.d. No. 20)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 font-mono text-xs tabular-nums">
                {Array.from({ length: 20 }).map((_, i) => {
                  const qNum = i + 1;
                  const val = submittedResult.jawabanFormatted[qNum] || '-';
                  return (
                    <div key={qNum} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">Soal No. {qNum}</div>
                      <div className="font-bold text-slate-900 truncate" title={val}>
                        {val}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={onExitToHome}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg cursor-pointer"
              >
                ← Kembali ke Beranda LMS
              </button>
              <button
                type="button"
                onClick={handleLogoutStudent}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout dari Akun Siswa</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // TAMPILAN 3: RUANG UJIAN FULLSCREEN CBT ANBK (KIRI STIMULUS, KANAN JAWABAN)
  // ============================================================================
  const currentQuestion = shuffledQuestions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const isCurrentDoubtful = Boolean(doubtfulMap[currentQuestion.id]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col">
      {/* HEADER BIRU DENGAN LOGO SEKOLAH DI KIRI + TIMER + TOMBOL LOGOUT SISWA */}
      <header className="bg-[#0284C7] text-white px-4 sm:px-6 py-3 shadow-md sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Kiri: Logo Sekolah & Identitas CBT */}
          <div className="flex items-center gap-3">
            <SchoolLogo size="md" />
            <div>
              <div className="text-[11px] text-sky-100 font-medium">
                CBT ANBK MATEMATIKA KELAS 7 FASE D · T.A. 2026/2027
              </div>
              <div className="text-base sm:text-lg font-bold tracking-tight">
                SMP Negeri 1 Wanaraya
              </div>
            </div>
          </div>

          {/* Tengah: Timer Hitung Mundur & Progress Bar Soal Dijawab */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex flex-col w-48">
              <div className="flex justify-between text-[11px] text-sky-100 mb-1 font-mono tabular-nums">
                <span>Progres Dijawab</span>
                <span className="font-bold text-white">
                  {answeredCount} / {shuffledQuestions.length} ({progressPercentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-sky-900/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-transform duration-150 origin-left"
                  style={{ transform: `scaleX(${progressPercentage / 100})` }}
                />
              </div>
            </div>

            <div
              className={`px-3.5 py-1.5 rounded-lg border font-mono text-sm sm:text-base font-bold flex items-center gap-2 tabular-nums ${
                timeLeftSeconds < 300
                  ? 'bg-red-600 border-red-300 text-white'
                  : 'bg-sky-900/60 border-sky-400/40 text-white'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>Sisa Waktu: {formatTimer(timeLeftSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowQuestionListModal(true)}
              className="px-3.5 py-2 bg-white text-sky-900 hover:bg-sky-50 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Grid className="w-4 h-4 text-sky-700" />
              <span>Daftar Soal ({answeredCount}/20)</span>
            </button>
          </div>

          {/* Kanan: Akun Siswa & Tombol Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">{loggedInStudent.nama}</div>
              <div className="text-[11px] text-sky-100 font-mono tabular-nums">
                Kelas {loggedInStudent.kelas} · {loggedInStudent.kode}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogoutStudent}
              title="Keluar dari akun siswa"
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* SUB-BAR INFORMASI SOAL AKTIF */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              SOAL NOMOR {currentIndex + 1} DARI {shuffledQuestions.length}
            </span>
            <span className="text-slate-400">·</span>
            <span className="font-semibold text-sky-700">{currentQuestion.bab}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">
              Level Kognitif: <strong>{currentQuestion.level}</strong> (
              {currentQuestion.level === 'Pemahaman'
                ? 'Komposisi 10%'
                : currentQuestion.level === 'Aplikasi'
                ? 'Komposisi 40%'
                : 'Komposisi 50%'}
              )
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <span>Tipe Soal:</span>
            <strong className="text-slate-900">
              {currentQuestion.type === 'PG'
                ? 'Pilihan Ganda (1 Jawaban Benar)'
                : currentQuestion.type === 'PGK'
                ? 'Pilihan Ganda Kompleks (4 Pernyataan · 2 Benar)'
                : 'Pilihan Ganda Kategorik Benar / Salah (3 Pernyataan)'}
            </strong>
          </div>
        </div>
      </div>

      {/* AREA UTAMA FULLSCREEN SPLIT-LAYOUT: KIRI TEKS/GAMBAR STIMULUS, KANAN PILIHAN JAWABAN */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================================= */}
        {/* PANEL KIRI (7 KOLOM): TEKS STIMULUS, GAMBAR/TABEL/GRAFIK & SUMBER */}
        {/* ================================================================= */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          {/* Indikator Soal */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800">Indikator Soal: </span>
            {currentQuestion.indicator}
          </div>

          {/* Judul & Wacana Stimulus TKA Puspendik (~100 kata) */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              Wacana Stimulus Kontekstual Kalimantan Selatan
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display leading-snug">
              {currentQuestion.stimulusTitle}
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed text-justify">
              {currentQuestion.stimulusText}
            </p>
          </div>

          {/* Injeksi Visual: Gambar, Tabel, Grafik, atau Grid Pecahan */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="text-xs sm:text-sm font-bold text-slate-900">
              {currentQuestion.visual.title}
            </div>

            {currentQuestion.visual.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-white max-h-[250px] flex items-center justify-center">
                <img
                  src={currentQuestion.visual.imageUrl}
                  alt={currentQuestion.visual.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full max-h-[250px] object-cover"
                />
              </div>
            )}

            {/* Jika tipe visual memiliki Tabel */}
            {currentQuestion.visual.headers && currentQuestion.visual.rows && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm bg-white rounded-lg overflow-hidden border border-slate-200">
                  <thead>
                    <tr className="bg-sky-700 text-white">
                      {currentQuestion.visual.headers.map((h, i) => (
                        <th key={i} className="py-2.5 px-3 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                    {currentQuestion.visual.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-2.5 px-3 ${
                              cIdx === 0 ? 'font-sans font-semibold text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Jika tipe visual adalah Bar Chart */}
            {currentQuestion.visual.type === 'bar_chart' && currentQuestion.visual.chartData && (
              <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
                {currentQuestion.visual.chartData.map((bar, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span>{bar.label}</span>
                      <span className="font-mono text-sky-700 tabular-nums">{bar.unit}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-600 rounded-full"
                        style={{ width: `${Math.min(100, (bar.value / 180000) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Jika tipe visual adalah Fraction Grid */}
            {currentQuestion.visual.type === 'fraction_grid' && currentQuestion.visual.gridConfig && (
              <div className="space-y-3">
                <div
                  className="max-w-[260px] mx-auto aspect-square bg-white border-2 border-slate-800 rounded overflow-hidden grid"
                  style={{
                    gridTemplateColumns: `repeat(${currentQuestion.visual.gridConfig.cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${currentQuestion.visual.gridConfig.rows}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: currentQuestion.visual.gridConfig.rows }).map((_, rIdx) =>
                    Array.from({ length: currentQuestion.visual.gridConfig!.cols }).map((__, cIdx) => {
                      const shaded =
                        cIdx < currentQuestion.visual.gridConfig!.shadedCols &&
                        rIdx < currentQuestion.visual.gridConfig!.shadedRows;
                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`border border-dashed border-slate-400 flex items-center justify-center text-xs font-mono ${
                            shaded ? 'bg-emerald-500/80 text-white font-bold' : 'bg-white'
                          }`}
                        >
                          {shaded ? '✓' : ''}
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-xs text-slate-600 text-center">
                  {currentQuestion.visual.gridConfig.caption}
                </p>
              </div>
            )}

            {/* Jika tipe visual adalah Infographic Card */}
            {currentQuestion.visual.highlightNotes && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {currentQuestion.visual.highlightNotes.map((hn, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-[11px] text-slate-500">{hn.label}</div>
                    <div className="text-xs sm:text-sm font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
                      {hn.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/80">
              {currentQuestion.reference}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* PANEL KANAN (5 KOLOM): PERTANYAAN & PILIHAN JAWABAN SISWA         */}
        {/* ================================================================= */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          {/* Instruksi Resmi sesuai Tipe Soal */}
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs sm:text-sm font-semibold text-sky-950">
            Instruksi: &ldquo;{currentQuestion.instruction}&rdquo;
          </div>

          {/* Kalimat Tanya */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase">Pertanyaan:</div>
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              {currentQuestion.questionPrompt}
            </p>
          </div>

          {/* 1. TIPE PILIHAN GANDA BIASA (A, B, C, D - 1 Jawaban Benar) */}
          {currentQuestion.type === 'PG' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = currentAnswer === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectPG(currentQuestion.id, opt.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-600 text-slate-950'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="text-sm leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. TIPE PILIHAN GANDA KOMPLEKS (4 Pernyataan - Pilih Lebih dari 1 Jawaban Benar) */}
          {currentQuestion.type === 'PGK' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const selectedArr = Array.isArray(currentAnswer) ? currentAnswer : [];
                const isChecked = selectedArr.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleTogglePGK(currentQuestion.id, opt.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors flex items-start gap-3.5 cursor-pointer ${
                      isChecked
                        ? 'bg-sky-50 border-sky-600 text-slate-950'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border ${
                        isChecked
                          ? 'bg-sky-600 border-sky-600 text-white'
                          : 'bg-white border-slate-400 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <div className="text-sm leading-relaxed">
                      <span className="font-mono font-bold mr-1.5">[{opt.id}]</span>
                      {opt.text}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. TIPE PILIHAN GANDA KATEGORIK (BENAR / SALAH - 3 Pernyataan) */}
          {currentQuestion.type === 'BS' && currentQuestion.statements && (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                    <th className="py-3 px-3.5 font-bold">Pernyataan (3 Pilihan)</th>
                    <th className="py-3 px-3 text-center font-bold w-20">Benar</th>
                    <th className="py-3 px-3 text-center font-bold w-20">Salah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentQuestion.statements.map((st, idx) => {
                    const currentMap =
                      currentAnswer && typeof currentAnswer === 'object' && !Array.isArray(currentAnswer)
                        ? (currentAnswer as Record<string, 'Benar' | 'Salah'>)
                        : {};
                    const picked = currentMap[st.id];
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-3.5 leading-relaxed text-slate-800">
                          <span className="font-mono font-bold text-sky-700 mr-1.5">{idx + 1}.</span>
                          {st.text}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleSelectBS(currentQuestion.id, st.id, 'Benar')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-colors cursor-pointer ${
                              picked === 'Benar'
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Benar
                          </button>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleSelectBS(currentQuestion.id, st.id, 'Salah')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-colors cursor-pointer ${
                              picked === 'Salah'
                                ? 'bg-red-600 border-red-600 text-white'
                                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Salah
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* BAR TOMBOL NAVIGASI CBT ANBK: MERAH (SEBELUMNYA), KUNING (RAGU-RAGU), BIRU (BERIKUTNYA) */}
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            {/* Tombol Merah: Soal Sebelumnya */}
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Soal Sebelumnya</span>
            </button>

            {/* Tombol Kuning: Ragu-ragu seperti CBT ANBK */}
            <button
              type="button"
              onClick={() => toggleDoubtful(currentQuestion.id)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isCurrentDoubtful
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-700'
                  : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
              }`}
            >
              <input
                type="checkbox"
                checked={isCurrentDoubtful}
                readOnly
                className="w-4 h-4 accent-slate-900 pointer-events-none"
              />
              <span>Ragu-ragu</span>
            </button>

            {/* Tombol Biru: Soal Berikutnya / Selesai Ujian */}
            {currentIndex < shuffledQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.min(shuffledQuestions.length - 1, i + 1))}
                className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>Soal Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmSubmitModal(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesai & Kumpulkan</span>
              </button>
            )}
          </div>
        </section>
      </main>

      {/* MODAL DAFTAR SOAL (NOMOR 1 - 20) */}
      {showQuestionListModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Daftar Navigasi Nomor Soal (1 – 20)</h3>
                <p className="text-xs text-slate-500">
                  Urutan soal telah diacak khusus untuk peserta: <strong>{loggedInStudent.nama}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuestionListModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {shuffledQuestions.map((q, idx) => {
                const answered = isQuestionAnswered(q, answers[q.id]);
                const doubtful = Boolean(doubtfulMap[q.id]);
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowQuestionListModal(false);
                    }}
                    className={`p-3 rounded-xl font-mono text-sm font-bold border-2 transition-colors flex flex-col items-center justify-center cursor-pointer tabular-nums ${
                      isCurrent ? 'ring-2 ring-sky-600 ring-offset-1 ' : ''
                    }${
                      doubtful
                        ? 'bg-amber-400 border-amber-500 text-slate-950'
                        : answered
                        ? 'bg-[#0284C7] border-[#0369A1] text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span className="text-[10px] font-sans font-normal mt-0.5">
                      {doubtful ? 'Ragu' : answered ? 'Terjawab' : 'Kosong'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#0284C7] inline-block" /> Dijawab ({answeredCount})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-400 inline-block" /> Ragu-ragu (
                  {Object.values(doubtfulMap).filter(Boolean).length})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-200 inline-block" /> Belum ({20 - answeredCount})
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowQuestionListModal(false);
                  setShowConfirmSubmitModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Kumpulkan Ujian Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI SELESAI UJIAN */}
      {showConfirmSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Konfirmasi Pengumpulan Ujian CBT</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
               Anda telah menjawab <strong>{answeredCount} dari 20 soal</strong>. Apakah Anda yakin ingin mengakhiri
              ujian dan menyimpan seluruh jawaban ke Google Spreadsheet (<span className="font-mono">sheet JawabanUjian</span>)?
            </p>
            {Object.values(doubtfulMap).some(Boolean) && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Perhatian: Masih terdapat soal yang ditandai <strong>Ragu-ragu</strong>.
              </div>
            )}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowConfirmSubmitModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmitExam}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                {isSubmitting ? 'Menyimpan ke Spreadsheet...' : 'Ya, Selesai & Simpan Jawaban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
