import React, { useState } from 'react';
import {
  LEARNING_OBJECTIVES,
  PERTANYAAN_PEMANTIK,
  KATA_KUNCI_MATERI,
  REFLEKSI_ITEMS,
} from '../data/materiData';
import { BookOpen, CheckCircle2, ArrowRight, Compass, HelpCircle, Layers } from 'lucide-react';

interface TujuanPembelajaranViewProps {
  onNavigate: (tab: 'home' | 'tujuan' | 'materi' | 'kuis' | 'admin') => void;
}

export const TujuanPembelajaranView: React.FC<TujuanPembelajaranViewProps> = ({ onNavigate }) => {
  const [filterBab, setFilterBab] = useState<'all' | 'bab2' | 'bab3'>('all');
  const [checkedReflections, setCheckedReflections] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    3: true,
  });

  const filteredObjectives = LEARNING_OBJECTIVES.filter((item) => {
    if (filterBab === 'bab2') return item.bab.includes('Bab 2');
    if (filterBab === 'bab3') return item.bab.includes('Bab 3');
    return true;
  });

  const toggleReflection = (idx: number) => {
    setCheckedReflections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedReflectionCount = Object.values(checkedReflections).filter(Boolean).length;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-medium text-sky-700">
              Kurikulum Merdeka · Matematika SMP/MTs Kelas VII Fase D · Tahun Ajaran 2026/2027
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Tujuan Pembelajaran & Peta Kompetensi
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Disusun berdasarkan Buku Teks Utama Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi
              (Bab 2: Bilangan Rasional Halaman 61–82 & Bab 3: Rasio Halaman 83–100) yang diampu oleh{' '}
              <span className="font-semibold text-slate-900">Bapak Suwarto</span> di SMP Negeri 1 Wanaraya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('materi')}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Pelajari Materi & Infografis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('kuis')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Mulai Ujian CBT (20 Soal)
            </button>
          </div>
        </div>

        {/* Bagan Materi (Sesuai Halaman 87 Buku) */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Bagan Alur Materi Kelas VII Fase D (Halaman 61–100)</span>
            </h2>
            <span className="text-xs text-slate-500">Sumber: Buku Matematika SMP/MTs Kelas VII Kemendikbudristek</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bagan Bab 2 */}
            <div className="p-5 rounded-xl bg-sky-50/70 border border-sky-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-sky-950">Bab 2 · Bilangan Rasional</span>
                <span className="text-xs text-sky-800 font-mono tabular-nums">Hlm. 61 – 82</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-white border border-sky-100">
                  <div className="font-semibold text-slate-900 mb-1">01. Penjumlahan & Pengurangan</div>
                  <p className="text-slate-600">Operasi gabungan pecahan & desimal (Strategi Siswa A & B)</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-sky-100">
                  <div className="font-semibold text-slate-900 mb-1">02. Perkalian & Pembagian</div>
                  <p className="text-slate-600">Takaran resep Nagasari, model luas persegi & resiprokal</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-sky-100">
                  <div className="font-semibold text-slate-900 mb-1">03. Aplikasi Kontekstual</div>
                  <p className="text-slate-600">Diskon harga, kurs mata uang KRW-IDR & rumus IMT</p>
                </div>
              </div>
            </div>

            {/* Bagan Bab 3 */}
            <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-950">Bab 3 · Rasio</span>
                <span className="text-xs text-emerald-800 font-mono tabular-nums">Hlm. 83 – 100</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-white border border-emerald-100">
                  <div className="font-semibold text-slate-900 mb-1">01. Konsep Rasio (a : b)</div>
                  <p className="text-slate-600">Perbandingan susu cokelat, perbedaan rasio vs pecahan & selisih</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-emerald-100">
                  <div className="font-semibold text-slate-900 mb-1">02. Skala & Proporsi</div>
                  <p className="text-slate-600">Ukuran kertas A0–A4, rasio ekuivalen & kunci rasio gambar</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-emerald-100">
                  <div className="font-semibold text-slate-900 mb-1">03. Laju Perubahan Satuan</div>
                  <p className="text-slate-600">Kemudahan bidang miring, konsentrasi alkohol & kecepatan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Daftar Tujuan Pembelajaran */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Rincian Tujuan Pembelajaran & Indikator Ketercapaian
            </h2>
            <p className="text-sm text-slate-600">
              Setelah mempelajari Bab 2 dan Bab 3, peserta didik kelas VII SMP Negeri 1 Wanaraya diharapkan mampu:
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start">
            <button
              onClick={() => setFilterBab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterBab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Bab (6 TP)
            </button>
            <button
              onClick={() => setFilterBab('bab2')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterBab === 'bab2' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bab 2: Bilangan Rasional
            </button>
            <button
              onClick={() => setFilterBab('bab3')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterBab === 'bab3' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bab 3: Rasio
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredObjectives.map((obj) => (
            <div
              key={obj.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-sky-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-sky-700">{obj.bab}</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">{obj.code}</span>
                  <span>·</span>
                  <span>{obj.bookPage}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">{obj.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{obj.description}</p>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Indikator Kompetensi:</div>
                  <ul className="space-y-1.5">
                    {obj.indicators.map((ind, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                        <span className="text-sky-600 font-bold mt-0.5">✓</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pertanyaan Pemantik & Refleksi Siswa (Sesuai Halaman 75 & 86 Buku) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pertanyaan Pemantik & Kata Kunci */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-sky-600" />
              <span>Pertanyaan Pemantik (Hlm. 75 & 86)</span>
            </h3>
            <ul className="space-y-3">
              {PERTANYAAN_PEMANTIK.map((q, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-3 leading-relaxed">
                  <span className="font-mono font-semibold text-xs text-sky-700 mt-1 tabular-nums">
                    0{idx + 1}.
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-5 border-t border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Kata Kunci Materi</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {KATA_KUNCI_MATERI.join('  ·  ')}
            </p>
          </div>
        </div>

        {/* Ceklis Refleksi Mandiri Siswa (Halaman 75 Buku) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>Refleksi Pemahaman Siswa (Buku Hlm. 75)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Centang pernyataan di bawah ini untuk memeriksa kesiapanmu sebelum mengikuti Kuis CBT ANBK.
              </p>
            </div>
            <div className="text-xs font-mono font-semibold text-emerald-700 tabular-nums shrink-0">
              Kesiapan: {completedReflectionCount} / {REFLEKSI_ITEMS.length} Tercapai
            </div>
          </div>

          <div className="space-y-2.5">
            {REFLEKSI_ITEMS.map((item, idx) => {
              const isChecked = Boolean(checkedReflections[idx]);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleReflection(idx)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-colors flex items-start gap-3 cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-300 text-slate-900'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <CheckCircle2
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isChecked ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-sm leading-snug">{item}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
