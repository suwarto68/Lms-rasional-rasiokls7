import { EXAM_QUESTIONS, QuestionItem } from '../data/questionsData';
import { AnswerValue } from '../types/cbtTypes';

/**
 * Mengacak urutan soal secara konsisten untuk setiap siswa berdasarkan identitas (username/kode)
 */
export function getShuffledQuestionsForStudent(seedString: string): QuestionItem[] {
  const list = [...EXAM_QUESTIONS];
  let hash = 2166136261;
  for (let i = 0; i < seedString.length; i++) {
    hash ^= seedString.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let seed = Math.abs(hash) || 12345;
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    const temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }

  return list;
}

/**
 * Mengecek apakah sebuah soal sudah dijawab oleh siswa
 */
export function isQuestionAnswered(question: QuestionItem, ans: AnswerValue | undefined): boolean {
  if (!ans) return false;
  if (question.type === 'PG') {
    return typeof ans === 'string' && ans.length > 0;
  }
  if (question.type === 'PGK') {
    return Array.isArray(ans) && ans.length > 0;
  }
  if (question.type === 'BS') {
    if (typeof ans !== 'object' || Array.isArray(ans)) return false;
    const keys = Object.keys(ans);
    return keys.length > 0;
  }
  return false;
}

/**
 * Format jawaban tiap nomor untuk disimpan ke Google Spreadsheet (sheet JawabanUjian)
 */
export function formatAnswerForSheet(question: QuestionItem, ans: AnswerValue | undefined): string {
  if (!ans) return '-';
  if (question.type === 'PG') {
    return String(ans);
  }
  if (question.type === 'PGK') {
    if (Array.isArray(ans)) {
      return ans.slice().sort().join(', ') || '-';
    }
    return '-';
  }
  if (question.type === 'BS') {
    if (typeof ans === 'object' && !Array.isArray(ans) && question.statements) {
      return question.statements
        .map((st, idx) => `${idx + 1}:${ans[st.id] ? (ans[st.id] === 'Benar' ? 'B' : 'S') : '?'}`)
        .join(' | ');
    }
    return '-';
  }
  return '-';
}

/**
 * Menghitung skor per butir soal (Maksimal 5 poin per soal -> 20 soal = 100 poin)
 * Komposisi:
 * - Pemahaman (2 soal x 5) = 10%
 * - Aplikasi (8 soal x 5)  = 40%
 * - Penalaran (10 soal x 5)= 50%
 */
export function scoreSingleQuestion(question: QuestionItem, ans: AnswerValue | undefined): number {
  const maxPoints = question.weightPercent; // 5 poin
  if (!ans) return 0;

  if (question.type === 'PG') {
    return ans === question.correctOption ? maxPoints : 0;
  }

  if (question.type === 'PGK' && question.correctOptions) {
    if (!Array.isArray(ans)) return 0;
    const correctSet = new Set(question.correctOptions);
    let correctPicked = 0;
    let wrongPicked = 0;
    for (const pick of ans) {
      if (correctSet.has(pick)) {
        correctPicked++;
      } else {
        wrongPicked++;
      }
    }
    if (correctPicked === 2 && wrongPicked === 0) return maxPoints;
    if (correctPicked === 1 && wrongPicked === 0) return maxPoints * 0.5;
    return 0;
  }

  if (question.type === 'BS' && question.statements) {
    if (typeof ans !== 'object' || Array.isArray(ans)) return 0;
    let correctCount = 0;
    for (const st of question.statements) {
      const expected = st.isTrue ? 'Benar' : 'Salah';
      if (ans[st.id] === expected) {
        correctCount++;
      }
    }
    if (correctCount === 3) return maxPoints;
    if (correctCount === 2) return maxPoints * 0.5;
    return 0;
  }

  return 0;
}

export function calculateExamScores(answers: Record<number, AnswerValue>) {
  let skorPemahaman = 0;
  let skorAplikasi = 0;
  let skorPenalaran = 0;
  const jawabanFormatted: Record<number, string> = {};

  for (const q of EXAM_QUESTIONS) {
    const ans = answers[q.id];
    const pts = scoreSingleQuestion(q, ans);
    jawabanFormatted[q.id] = formatAnswerForSheet(q, ans);

    if (q.level === 'Pemahaman') skorPemahaman += pts;
    else if (q.level === 'Aplikasi') skorAplikasi += pts;
    else if (q.level === 'Penalaran') skorPenalaran += pts;
  }

  skorPemahaman = Math.round(skorPemahaman * 10) / 10;
  skorAplikasi = Math.round(skorAplikasi * 10) / 10;
  skorPenalaran = Math.round(skorPenalaran * 10) / 10;
  const skorAkhir = Math.round((skorPemahaman + skorAplikasi + skorPenalaran) * 10) / 10;

  return {
    skorPemahaman,
    skorAplikasi,
    skorPenalaran,
    skorAkhir,
    jawabanFormatted,
  };
}
