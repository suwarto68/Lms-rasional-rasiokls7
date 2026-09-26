export type KelasOption = '7A' | '7B';

export interface StudentUser {
  id?: string;
  kode: string;        // Kode Peserta (misal: 7A-001)
  username: string;    // Username login
  password: string;    // Password login
  nama: string;        // Nama Peserta
  kelas: KelasOption;  // Kelas dropdown: 7A atau 7B
  token: string;       // Token ujian (misal: WNRY26)
  createdAt?: string;
}

export type AnswerValue =
  | 'A' | 'B' | 'C' | 'D'                    // Untuk PG
  | ('A' | 'B' | 'C' | 'D')[]                // Untuk PGK (2 jawaban benar)
  | Record<string, 'Benar' | 'Salah'>;       // Untuk BS (S1, S2, S3 -> Benar / Salah)

export interface ExamSubmission {
  id: string;
  waktu: string;
  kode: string;
  username: string;
  nama: string;
  kelas: KelasOption;
  token: string;
  durasiDetik: number;
  jawaban: Record<number, AnswerValue>;
  jawabanFormatted: Record<number, string>;
  skorPemahaman: number; // Max 10 (10%)
  skorAplikasi: number;  // Max 40 (40%)
  skorPenalaran: number; // Max 50 (50%)
  skorAkhir: number;     // Max 100
  syncedToSheet?: boolean;
}

export interface AppSettings {
  appsScriptUrl: string;
  spreadsheetId: string;
  spreadsheetName: string;
  examDurationMinutes: number;
  examToken: string;
  teacherName: string;
  schoolYear: string;
  schoolName: string;
}

export interface ConnectionStatus {
  connected: boolean;
  mode: 'google_sheets_live' | 'server_database_ready' | 'syncing' | 'error';
  message: string;
  lastSync: string;
  latencyMs: number;
  totalUsers: number;
  totalResults: number;
  appsScriptUrlConfigured: boolean;
}
