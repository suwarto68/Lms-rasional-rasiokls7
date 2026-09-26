import React, { useState } from 'react';
import {
  DEFAULT_INFOGRAPHIC_POSTERS,
  InfographicPosterData,
  imgInfografisRasional,
  imgInfografisRasio,
} from '../data/materiData';
import {
  BookOpen,
  Calculator,
  Sparkles,
  Printer,
  Maximize2,
  X,
  ArrowRight,
  Sliders,
  Beaker,
  Scale,
} from 'lucide-react';

interface MateriViewProps {
  onNavigate: (tab: 'home' | 'tujuan' | 'materi' | 'kuis' | 'admin') => void;
}

export const MateriView: React.FC<MateriViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'bab2' | 'bab3' | 'infografis'>('bab2');

  // Simulasi 1: Grid Perkalian Pecahan (Halaman 65-66)
  const [numA, setNumA] = useState(3);
  const [denB, setDenB] = useState(4);
  const [numC, setNumC] = useState(2);
  const [denD, setDenD] = useState(4);

  // Simulasi 2: Kalkulator IMT Pengayaan (Halaman 81)
  const [beratBadan, setBeratBadan] = useState(65);
  const [tinggiBadanCm, setTinggiBadanCm] = useState(168);

  // Simulasi 3: Kepekatan Susu Cokelat (Halaman 92-94)
  const [leftCokelat, setLeftCokelat] = useState(2);
  const [leftSusu, setLeftSusu] = useState(1);
  const [rightCokelat, setRightCokelat] = useState(5);
  const [rightSusu, setRightSusu] = useState(4);

  // State Poster Infografis & Generator
  const [posters, setPosters] = useState<InfographicPosterData[]>(DEFAULT_INFOGRAPHIC_POSTERS);
  const [selectedPresetTopic, setSelectedPresetTopic] = useState(
    'Perkalian & Pembagian Pecahan (Resep Kue Nagasari & Konsep Resiprokal)'
  );
  const [customTopic, setCustomTopic] = useState('');
  const [selectedBabGen, setSelectedBabGen] = useState('Bab 2 · Bilangan Rasional');
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [fullscreenPoster, setFullscreenPoster] = useState<InfographicPosterData | null>(null);

  // Perhitungan Simulasi 1 (Grid Pecahan)
  const safeNumA = Math.min(numA, denB);
  const safeNumC = Math.min(numC, denD);
  const prodNum = safeNumA * safeNumC;
  const prodDen = denB * denD;
  const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
  const commonDiv = gcd(prodNum, prodDen);

  // Perhitungan Simulasi 2 (IMT)
  const tinggiM = tinggiBadanCm / 100;
  const imtValue = beratBadan / (tinggiM * tinggiM);
  const getImtStatus = (val: number) => {
    if (val < 17.0) return { label: '▲ Kekurangan Berat Badan Tingkat Berat (< 17,0)', color: 'text-red-700 bg-red-50 border-red-200' };
    if (val <= 18.4) return { label: '▲ Kekurangan Berat Badan Tingkat Ringan (17,0 – 18,4)', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    if (val <= 25.0) return { label: '● Kategori Normal / Ideal (18,5 – 25,0)', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    if (val <= 27.0) return { label: '▲ Kelebihan Berat Badan Tingkat Ringan (25,1 – 27,0)', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    return { label: '▲ Kelebihan Berat Badan Tingkat Berat (> 27,0)', color: 'text-red-700 bg-red-50 border-red-200' };
  };
  const imtStatus = getImtStatus(imtValue);

  // Perhitungan Simulasi 3 (Susu Cokelat)
  const ratioLeft = leftCokelat / leftSusu;
  const ratioRight = rightCokelat / rightSusu;
  const diffLeft = leftCokelat - leftSusu;
  const diffRight = rightCokelat - rightSusu;

  // Handler Generate Poster Infografis Baru (Mendukung Server & Vercel Static Fallback)
  const handleGeneratePoster = async () => {
    const topicToUse = customTopic.trim() || selectedPresetTopic;
    setIsGeneratingPoster(true);
    const assignedImage = selectedBabGen.includes('Bab 2') ? imgInfografisRasional : imgInfografisRasio;

    try {
      const resp = await fetch('/api/infographic/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse,
          bab: selectedBabGen,
        }),
      });
      const contentType = resp.headers.get('content-type') || '';
      if (resp.ok && contentType.includes('application/json')) {
        const data = await resp.json();
        if (data.ok && data.poster) {
          const newPoster: InfographicPosterData = {
            ...data.poster,
            imageUrl: assignedImage,
          };
          setPosters((prev) => [newPoster, ...prev]);
          setCustomTopic('');
          return;
        }
      }
      throw new Error('Fallback client generator');
    } catch {
      // Fallback generator terstruktur di sisi klien (100% berjalan di Vercel)
      const fallbackPoster: InfographicPosterData = {
        id: `poster-gen-${Date.now()}`,
        title: `Infografis Materi: ${topicToUse}`,
        subtitle: `${selectedBabGen} · SMP Negeri 1 Wanaraya T.A. 2026/2027 (Pengampu: Suwarto)`,
        bab: selectedBabGen,
        imageUrl: assignedImage,
        keyFormulas: [
          {
            label: 'Konversi Pecahan & Desimal Ekuivalen',
            formula: 'a/b ± c,d = a/b ± (cd/10)  atau  (a÷b) ± c,d',
            note: 'Samakan bentuk ke pecahan seluruhnya (Siswa A) atau ke desimal seluruhnya (Siswa B).',
          },
          {
            label: 'Perkalian & Pembagian Rasional',
            formula: '(a/b) × (c/d) = ac/bd   |   (a/b) : (c/d) = (a/b) × (d/c)',
            note: 'Gunakan kebalikan (resiprokal) pembagi pada operasi pembagian pecahan.',
          },
          {
            label: 'Rasio & Proporsi Skala',
            formula: 'a : b = (a × k) : (b × k)',
            note: 'Rasio menyatakan perbandingan perkalian/pembagian, bukan selisih pengurangan.',
          },
        ],
        steps: [
          {
            number: '01',
            heading: 'Identifikasi Bentuk & Satuan Besaran',
            detail: 'Periksa apakah bilangan disajikan dalam pecahan, desimal, atau persen, serta pastikan satuan kedua besaran sudah disamakan.',
          },
          {
            number: '02',
            heading: 'Sederhanakan dengan FPB atau Konversi Ekuivalen',
            detail: 'Bagi kedua suku rasio atau pembilang-penyebut pecahan dengan Faktor Persekutuan Terbesar (FPB).',
          },
          {
            number: '03',
            heading: 'Verifikasi pada Permasalahan Kontekstual',
            detail: 'Periksa kembali apakah hasil perhitungan logis terhadap permasalahan takaran bahan, skala gambar, atau potongan diskon.',
          },
        ],
        kalselContext: `Penerapan Kontekstual Kalimantan Selatan (${topicToUse}): Perhitungan hasil panen padi rawa pasang surut Kecamatan Wanaraya, takaran resep kue tradisional Banjar, dan perbandingan muatan jukung di Pasar Terapung.`,
      };
      setPosters((prev) => [fallbackPoster, ...prev]);
      setCustomTopic('');
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner Materi */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-medium text-sky-700">
            Modul Pembelajaran Interaktif · SMP Negeri 1 Wanaraya · Guru Pengampu: Suwarto
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Materi Matematika Kelas VII Fase D & Poster Infografis
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Pelajari konsep mendalam Bab 2 (Operasi Hitung Bilangan Rasional) dan Bab 3 (Rasio & Proporsi),
            uji coba simulasi interaktif sesuai kegiatan Eksplorasi buku teks, serta generate Poster Infografis belajar.
          </p>
        </div>

        {/* Navigation Sub-tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('bab2')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'bab2' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Bab 2: Bilangan Rasional (Hlm. 61–82)
          </button>
          <button
            onClick={() => setActiveTab('bab3')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'bab3' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Bab 3: Rasio & Skala (Hlm. 83–100)
          </button>
          <button
            onClick={() => setActiveTab('infografis')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'infografis' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Poster Infografis & Generator ({posters.length})</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* TAB 1: BAB 2 - BILANGAN RASIONAL (HALAMAN 61 - 82)                */}
      {/* ================================================================= */}
      {activeTab === 'bab2' && (
        <div className="space-y-8">
          {/* Eksplorasi 2.7: Penjumlahan & Pengurangan Pecahan & Desimal */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-sky-700">Eksplorasi 2.7 · Buku Halaman 61 – 62</span>
                <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
                  1. Penjumlahan dan Pengurangan Bilangan Rasional (Pecahan & Desimal)
                </h2>
              </div>
              <span className="text-xs text-slate-500">Kegiatan Berpasangan Siswa A & Siswa B</span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Bagaimana melakukan operasi penjumlahan dan pengurangan yang memuat bilangan rasional dalam bentuk
              pecahan dan juga bentuk desimal sekaligus? Perhatikan perbandingan dua strategi penyelesaian berikut:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strategi Siswa A */}
              <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <div className="text-sm font-bold text-emerald-950">
                  Strategi Siswa A (Mengubah ke Bentuk Pecahan)
                </div>
                <div className="p-3.5 bg-white rounded-lg border border-emerald-100 font-mono text-xs sm:text-sm space-y-2 tabular-nums">
                  <div className="font-semibold text-slate-900">Kasus 1: 2/5 + 0,3 = ...</div>
                  <div className="text-slate-600">• Ubah 0,3 menjadi pecahan: 3/10</div>
                  <div className="text-slate-800">• 2/5 + 3/10 = 4/10 + 3/10 = 7/10</div>
                  <div className="pt-2 border-t border-slate-100 font-semibold text-slate-900">
                    Kasus 2: 3/20 - 0,75 = ...
                  </div>
                  <div className="text-slate-600">• Ubah 0,75 menjadi pecahan: 75/100</div>
                  <div className="text-slate-800">• 3/20 - 75/100 = 15/100 - 75/100 = -60/100 = -3/5</div>
                </div>
              </div>

              {/* Strategi Siswa B */}
              <div className="p-5 rounded-xl bg-sky-50/50 border border-sky-200 space-y-3">
                <div className="text-sm font-bold text-sky-950">
                  Strategi Siswa B (Mengubah ke Bentuk Desimal)
                </div>
                <div className="p-3.5 bg-white rounded-lg border border-sky-100 font-mono text-xs sm:text-sm space-y-2 tabular-nums">
                  <div className="font-semibold text-slate-900">Kasus 1: 2/5 + 0,3 = ...</div>
                  <div className="text-slate-600">• Ubah 2/5 menjadi desimal: 0,4</div>
                  <div className="text-slate-800">• 0,4 + 0,3 = 0,7 (Ekuivalen dengan 7/10)</div>
                  <div className="pt-2 border-t border-slate-100 font-semibold text-slate-900">
                    Kasus 2: 3/20 - 0,75 = ...
                  </div>
                  <div className="text-slate-600">• Ubah 3/20 menjadi desimal: 0,15</div>
                  <div className="text-slate-800">• 0,15 - 0,75 = -0,60 (Ekuivalen dengan -3/5)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Simulasi Interaktif 1: Two-Zone Sandbox Perkalian Pecahan & Resep Nagasari */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-sky-700">
                  Eksplorasi 2.8 & 2.9 · Buku Halaman 64 – 70
                </span>
                <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
                  2. Simulasi Interaktif Perkalian Luas Persegi & Pembagian Resiprokal
                </h2>
              </div>
              <span className="text-xs text-emerald-700 font-semibold">● Simulasi Interaktif Aktif</span>
            </div>

            {/* Two-Zone Sandbox Layout (Education Reference Guideline) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Zone (Interactive Visual Canvas - 7 Cols) */}
              <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-900">
                    Visualisasi Persegi 1 × 1 untuk Perkalian Pecahan
                  </div>
                  <div className="font-mono text-sm font-bold text-sky-700 tabular-nums">
                    ({safeNumA}/{denB}) × ({safeNumC}/{denD}) = {prodNum}/{prodDen} = {prodNum / commonDiv}/{prodDen / commonDiv}
                  </div>
                </div>

                {/* Grid Visual */}
                <div className="max-w-[340px] mx-auto aspect-square bg-white border-2 border-slate-800 rounded-lg overflow-hidden grid"
                  style={{
                    gridTemplateColumns: `repeat(${denB}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${denD}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: denD }).map((_, rIdx) =>
                    Array.from({ length: denB }).map((__, cIdx) => {
                      const isShaded = cIdx < safeNumA && rIdx < safeNumC;
                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`border border-dashed border-slate-400 flex items-center justify-center text-[11px] font-mono tabular-nums transition-colors ${
                            isShaded ? 'bg-emerald-500/80 text-white font-bold' : 'bg-white text-slate-400'
                          }`}
                        >
                          {isShaded ? '✓' : ''}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="text-xs text-slate-600 text-center leading-relaxed">
                  Daerah berwarna hijau mencakup <span className="font-mono font-bold text-slate-900">{prodNum}</span> bagian
                  dari total <span className="font-mono font-bold text-slate-900">{prodDen}</span> kotak kecil
                  ({safeNumA} kolom dari {denB} × {safeNumC} baris dari {denD}).
                </div>
              </div>

              {/* Right Zone (Control & Concept Deck - 5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-sky-600" />
                    <span>Pengatur Pecahan (a/b × c/d)</span>
                  </div>

                  {/* Slider Pecahan 1 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Pembilang Pertama (a):</span>
                      <span className="font-mono font-bold tabular-nums">{safeNumA} bagian</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={denB}
                      value={safeNumA}
                      onChange={(e) => setNumA(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />

                    <div className="flex justify-between text-xs font-medium">
                      <span>Penyebut Pertama / Kolom (b):</span>
                      <span className="font-mono font-bold tabular-nums">{denB} kolom</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={8}
                      value={denB}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setDenB(v);
                        if (numA > v) setNumA(v);
                      }}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  {/* Slider Pecahan 2 */}
                  <div className="space-y-2 pt-3 border-t border-slate-200">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Pembilang Kedua (c):</span>
                      <span className="font-mono font-bold tabular-nums">{safeNumC} bagian</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={denD}
                      value={safeNumC}
                      onChange={(e) => setNumC(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />

                    <div className="flex justify-between text-xs font-medium">
                      <span>Penyebut Kedua / Baris (d):</span>
                      <span className="font-mono font-bold tabular-nums">{denD} baris</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={8}
                      value={denD}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setDenD(v);
                        if (numC > v) setNumC(v);
                      }}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Konsep Pembagian Resiprokal (Halaman 69) */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                  <div className="font-bold text-amber-950">
                    Konsep Pembagian dengan Resiprokal (Buku Hlm. 69):
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Dua bilangan dikatakan saling <strong>resiprokal (berkebalikan)</strong> jika hasil kalinya sama dengan 1
                    (contoh: <span className="font-mono">3/4 × 4/3 = 1</span>). Untuk membagi pecahan, kalikan dengan resiprokal pembaginya:
                  </p>
                  <div className="p-2.5 bg-white rounded border border-amber-200 font-mono text-slate-900 tabular-nums">
                    3/8 : 1/2 = 3/8 × 2/1 = 6/8 = 3/4
                  </div>
                </div>
              </div>
            </div>

            {/* Tabel Ketercukupan Resep Kue Nagasari (Halaman 64) */}
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                Tabel 2.8 Ketercukupan Bahan Kue Nagasari untuk 6 Kali Resep (30 Porsi · Buku Hlm. 64)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                      <th className="py-2.5 px-4 font-semibold">Bahan Kue Nagasari</th>
                      <th className="py-2.5 px-4 font-semibold">Takaran 1 Resep (5 Porsi)</th>
                      <th className="py-2.5 px-4 font-semibold">Kebutuhan 6 Resep (30 Porsi)</th>
                      <th className="py-2.5 px-4 font-semibold">Bahan Tersedia</th>
                      <th className="py-2.5 px-4 font-semibold">Status Ketercukupan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                    <tr>
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-900">a. Tepung Beras</td>
                      <td className="py-2.5 px-4">1 3/4 cangkir</td>
                      <td className="py-2.5 px-4">6 × 7/4 = 10 1/2 cangkir</td>
                      <td className="py-2.5 px-4">6 cangkir</td>
                      <td className="py-2.5 px-4 font-sans font-semibold text-red-700">▲ Tidak Cukup (Kurang 4 1/2 cangkir)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-900">b. Gula Pasir</td>
                      <td className="py-2.5 px-4">8 1/2 sdm</td>
                      <td className="py-2.5 px-4">6 × 17/2 = 51 sdm</td>
                      <td className="py-2.5 px-4">60 sdm</td>
                      <td className="py-2.5 px-4 font-sans font-semibold text-emerald-700">● Cukup (Sisa 9 sdm)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-900">c. Santan Kelapa</td>
                      <td className="py-2.5 px-4">3 1/2 cangkir</td>
                      <td className="py-2.5 px-4">6 × 7/2 = 21 cangkir</td>
                      <td className="py-2.5 px-4">20 cangkir</td>
                      <td className="py-2.5 px-4 font-sans font-semibold text-red-700">▲ Tidak Cukup (Kurang 1 cangkir)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Simulasi Interaktif 2: Kalkulator Indeks Massa Tubuh (IMT) - Halaman 81 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-sky-700">Pengayaan Bab 2 · Buku Halaman 81 – 82</span>
                <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
                  3. Kalkulator Interaktif Indeks Massa Tubuh (IMT / Body Mass Index)
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-600">Rumus: IMT = BB (kg) / TB² (m²)</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Berat Badan (BB dalam kg):</span>
                    <span className="font-mono text-sm text-sky-700 tabular-nums">{beratBadan} kg</span>
                  </div>
                  <input
                    type="range"
                    min={35}
                    max={110}
                    value={beratBadan}
                    onChange={(e) => setBeratBadan(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Tinggi Badan (TB dalam cm / m):</span>
                    <span className="font-mono text-sm text-sky-700 tabular-nums">
                      {tinggiBadanCm} cm ({tinggiM.toFixed(2)} m)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={135}
                    max={195}
                    value={tinggiBadanCm}
                    onChange={(e) => setTinggiBadanCm(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setBeratBadan(80); setTinggiBadanCm(180); }}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                  >
                    Contoh Pak Ananta (80kg, 1,80m)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBeratBadan(50); setTinggiBadanCm(170); }}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                  >
                    Contoh Pak Bintoro (50kg, 1,70m)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBeratBadan(75); setTinggiBadanCm(165); }}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                  >
                    Contoh Pak Erlangga (75kg, 1,65m)
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="text-xs text-slate-500 font-medium">Hasil Perhitungan Bilangan Rasional Desimal:</div>
                  <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    IMT = {beratBadan} / ({tinggiM.toFixed(2)})² = {beratBadan} / {(tinggiM * tinggiM).toFixed(4)} ={' '}
                    <span className="text-sky-700">{imtValue.toFixed(2)}</span>
                  </div>
                  <div className={`p-3 rounded-lg border text-xs font-semibold ${imtStatus.color}`}>
                    {imtStatus.label}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: BAB 3 - RASIO & SKALA (HALAMAN 83 - 100)                   */}
      {/* ================================================================= */}
      {activeTab === 'bab3' && (
        <div className="space-y-8">
          {/* Simulasi Interaktif Susu Cokelat (Halaman 88 - 94) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-sky-700">
                  Eksplorasi 3.1 & Ayo Berpikir Kritis · Buku Halaman 88 – 94
                </span>
                <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
                  1. Simulasi Perbandingan Kepekatan Susu Cokelat (Rasio vs Selisih)
                </h2>
              </div>
              <span className="text-xs text-emerald-700 font-semibold">● Laboratorium Rasio Interaktif</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Stage: Visual Teko Kiri vs Teko Kanan */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Campuran Kiri */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Campuran Kiri (Gelas A)</span>
                    <span className="font-mono text-xs font-bold text-amber-900 tabular-nums">
                      Rasio {leftCokelat} : {leftSusu}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 py-2 min-h-[76px]">
                    {Array.from({ length: leftCokelat }).map((_, i) => (
                      <div
                        key={`lc-${i}`}
                        className="w-9 h-11 rounded-b-lg border-2 border-amber-900 bg-amber-800 text-white text-[10px] font-mono flex items-center justify-center shadow-2xs"
                        title="Gelas Cokelat"
                      >
                        Cok
                      </div>
                    ))}
                    {Array.from({ length: leftSusu }).map((_, i) => (
                      <div
                        key={`ls-${i}`}
                        className="w-9 h-11 rounded-b-lg border-2 border-slate-400 bg-white text-slate-700 text-[10px] font-mono flex items-center justify-center shadow-2xs"
                        title="Gelas Susu"
                      >
                        Susu
                      </div>
                    ))}
                  </div>

                  <div className="text-xs space-y-1 pt-2 border-t border-slate-200 font-mono tabular-nums">
                    <div>• Nilai Rasio (Cokelat/Susu): <strong>{ratioLeft.toFixed(2)}</strong></div>
                    <div>• Pecahan Cokelat: <strong>{leftCokelat}/{leftCokelat + leftSusu} ({Math.round((leftCokelat / (leftCokelat + leftSusu)) * 100)}%)</strong></div>
                    <div>• Selisih Gelas: <strong>{diffLeft} gelas</strong></div>
                  </div>
                </div>

                {/* Campuran Kanan */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Campuran Kanan (Gelas B)</span>
                    <span className="font-mono text-xs font-bold text-amber-900 tabular-nums">
                      Rasio {rightCokelat} : {rightSusu}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 py-2 min-h-[76px]">
                    {Array.from({ length: rightCokelat }).map((_, i) => (
                      <div
                        key={`rc-${i}`}
                        className="w-9 h-11 rounded-b-lg border-2 border-amber-900 bg-amber-700 text-white text-[10px] font-mono flex items-center justify-center shadow-2xs"
                        title="Gelas Cokelat"
                      >
                        Cok
                      </div>
                    ))}
                    {Array.from({ length: rightSusu }).map((_, i) => (
                      <div
                        key={`rs-${i}`}
                        className="w-9 h-11 rounded-b-lg border-2 border-slate-400 bg-white text-slate-700 text-[10px] font-mono flex items-center justify-center shadow-2xs"
                        title="Gelas Susu"
                      >
                        Susu
                      </div>
                    ))}
                  </div>

                  <div className="text-xs space-y-1 pt-2 border-t border-slate-200 font-mono tabular-nums">
                    <div>• Nilai Rasio (Cokelat/Susu): <strong>{ratioRight.toFixed(2)}</strong></div>
                    <div>• Pecahan Cokelat: <strong>{rightCokelat}/{rightCokelat + rightSusu} ({Math.round((rightCokelat / (rightCokelat + rightSusu)) * 100)}%)</strong></div>
                    <div>• Selisih Gelas: <strong>{diffRight} gelas</strong></div>
                  </div>
                </div>

                {/* Kesimpulan Otomatis */}
                <div className="sm:col-span-2 p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  <strong>Kesimpulan Analisis (Pendapat Siswa C pada Buku Hlm. 94):</strong>{' '}
                  {Math.abs(ratioLeft - ratioRight) < 0.001 ? (
                    <span>Kedua campuran memiliki kepekatan rasa cokelat yang <strong>SAMA KUAT</strong> karena nilai rasionya ekuivalen ({ratioLeft.toFixed(2)}).</span>
                  ) : ratioLeft > ratioRight ? (
                    <span>
                      <strong>Campuran Kiri ({leftCokelat} : {leftSusu})</strong> memiliki rasa cokelat <strong>PALING KUAT</strong> karena nilai rasionya ({ratioLeft.toFixed(2)}) lebih besar daripada Campuran Kanan ({ratioRight.toFixed(2)}).
                    </span>
                  ) : (
                    <span>
                      <strong>Campuran Kanan ({rightCokelat} : {rightSusu})</strong> memiliki rasa cokelat <strong>PALING KUAT</strong> karena nilai rasionya ({ratioRight.toFixed(2)}) lebih besar daripada Campuran Kiri ({ratioLeft.toFixed(2)}).
                    </span>
                  )}
                </div>
              </div>

              {/* Right Controls */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-sky-600" />
                  <span>Ubah Takaran Gelas Cokelat & Susu</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>Campuran Kiri — Gelas Cokelat:</span>
                      <span className="font-mono font-bold">{leftCokelat} gelas</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={leftCokelat}
                      onChange={(e) => setLeftCokelat(Number(e.target.value))}
                      className="w-full accent-amber-800 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>Campuran Kiri — Gelas Susu:</span>
                      <span className="font-mono font-bold">{leftSusu} gelas</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={leftSusu}
                      onChange={(e) => setLeftSusu(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between font-medium mb-1">
                      <span>Campuran Kanan — Gelas Cokelat:</span>
                      <span className="font-mono font-bold">{rightCokelat} gelas</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={rightCokelat}
                      onChange={(e) => setRightCokelat(Number(e.target.value))}
                      className="w-full accent-amber-800 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>Campuran Kanan — Gelas Susu:</span>
                      <span className="font-mono font-bold">{rightSusu} gelas</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={rightSusu}
                      onChange={(e) => setRightSusu(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLeftCokelat(2);
                    setLeftSusu(1);
                    setRightCokelat(5);
                    setRightSusu(4);
                  }}
                  className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Reset ke Kasus Gambar 3.13 Buku (2:1 vs 5:4)
                </button>
              </div>
            </div>
          </div>

          {/* Faktor Skala, Ukuran Kertas & Bidang Miring (Halaman 85 & 98-100) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-semibold text-sky-700">Eksplorasi 3.2 · Buku Halaman 85 & 98 – 100</span>
              <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
                2. Faktor Skala, Proporsi Ukuran & Kemudahan Bidang Miring
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-sky-600" />
                  <span>Tabel 3.4 Panjang terhadap Ketinggian Bidang Miring (Hlm. 99)</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kemudahan memindahkan drum ke atas truk dinyatakan dalam rasio{' '}
                  <strong>Panjang Bidang Miring : Ketinggian</strong>. Semakin besar rasionya, semakin ringan beban dorongnya.
                </p>
                <table className="w-full text-left border-collapse text-xs font-mono tabular-nums bg-white rounded-lg overflow-hidden border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="py-2 px-3">Bidang</th>
                      <th className="py-2 px-3">Panjang (cm)</th>
                      <th className="py-2 px-3">Tinggi (cm)</th>
                      <th className="py-2 px-3">Rasio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-3 font-bold">A</td>
                      <td className="py-2 px-3">150 cm</td>
                      <td className="py-2 px-3">100 cm</td>
                      <td className="py-2 px-3">3 : 2 (1,5)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold">B</td>
                      <td className="py-2 px-3">100 cm</td>
                      <td className="py-2 px-3">50 cm</td>
                      <td className="py-2 px-3">2 : 1 (2,0)</td>
                    </tr>
                    <tr className="bg-emerald-50/70">
                      <td className="py-2 px-3 font-bold text-emerald-900">C</td>
                      <td className="py-2 px-3">120 cm</td>
                      <td className="py-2 px-3">40 cm</td>
                      <td className="py-2 px-3 font-bold text-emerald-800">3 : 1 (3,0 · Paling Mudah)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>Tabel 3.2 Larutan Alkohol 100 ml (Buku Hlm. 97)</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Larutan alkohol 70% artinya dalam setiap 100 ml larutan terdapat 70 ml alkohol murni dan 30 ml air.
                </p>
                <table className="w-full text-left border-collapse text-xs font-mono tabular-nums bg-white rounded-lg overflow-hidden border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="py-2 px-3">Larutan (100 ml)</th>
                      <th className="py-2 px-3">Vol. Alkohol</th>
                      <th className="py-2 px-3">Vol. Air</th>
                      <th className="py-2 px-3">Rasio Alkohol : Air</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-3 font-bold">90%</td>
                      <td className="py-2 px-3">90 ml</td>
                      <td className="py-2 px-3">10 ml</td>
                      <td className="py-2 px-3">9 : 1</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold">80%</td>
                      <td className="py-2 px-3">80 ml</td>
                      <td className="py-2 px-3">20 ml</td>
                      <td className="py-2 px-3">4 : 1</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold">70%</td>
                      <td className="py-2 px-3">70 ml</td>
                      <td className="py-2 px-3">30 ml</td>
                      <td className="py-2 px-3">7 : 3</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: POSTER INFOGRAFIS & GENERATOR INFOGRAFIS MATERI            */}
      {/* ================================================================= */}
      {activeTab === 'infografis' && (
        <div className="space-y-8">
          {/* Studio Generator Poster Infografis */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-semibold text-emerald-700">
                  Generator Poster Infografis · Matematika Kelas 7 Fase D
                </span>
                <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
                  Buat & Generate Poster Infografis Materi Baru
                </h2>
              </div>
              <span className="text-xs text-slate-500">SMP Negeri 1 Wanaraya · Tahun Ajaran 2026/2027</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-3 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Pilih Bab Materi</label>
                <select
                  value={selectedBabGen}
                  onChange={(e) => setSelectedBabGen(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-600"
                >
                  <option value="Bab 2 · Bilangan Rasional">Bab 2 · Bilangan Rasional</option>
                  <option value="Bab 3 · Rasio & Skala">Bab 3 · Rasio & Skala</option>
                </select>
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Pilih Sub-Topik Buku</label>
                <select
                  value={selectedPresetTopic}
                  onChange={(e) => setSelectedPresetTopic(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-600"
                >
                  <option value="Penjumlahan & Pengurangan Pecahan dan Desimal (Strategi Siswa A & B)">
                    Eksplorasi 2.7: Penjumlahan & Pengurangan Pecahan-Desimal
                  </option>
                  <option value="Perkalian & Pembagian Pecahan (Resep Kue Nagasari & Konsep Resiprokal)">
                    Eksplorasi 2.8 & 2.9: Perkalian Luas & Pembagian Resiprokal
                  </option>
                  <option value="Literasi Finansial (Diskon, Nilai Tukar Mata Uang KRW-IDR) & Rumus IMT">
                    Uji Kompetensi & Pengayaan: Literasi Finansial & IMT
                  </option>
                  <option value="Konsep Rasio vs Pecahan & Kepekatan Campuran Susu Cokelat">
                    Eksplorasi 3.1: Konsep Rasio vs Selisih Susu Cokelat
                  </option>
                  <option value="Faktor Skala, Proporsi Ukuran Foto & Kemudahan Bidang Miring">
                    Eksplorasi 3.2: Faktor Skala & Kemudahan Bidang Miring
                  </option>
                </select>
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Atau Ketik Topik Kustom (Opsional)
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Misal: Rasio Hasil Panen Rawa Wanaraya"
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleGeneratePoster}
                  disabled={isGeneratingPoster}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeneratingPoster ? 'Generating...' : 'Generate Poster'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Galeri Poster Infografis */}
          <div className="space-y-8">
            {posters.map((poster) => (
              <div
                key={poster.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Header Poster */}
                <div className="bg-sky-700 text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-sky-200 font-medium">
                      {poster.bab} · Poster Infografis Resmi SMP Negeri 1 Wanaraya
                    </div>
                    <h3 className="text-xl font-bold font-display">{poster.title}</h3>
                    <p className="text-xs text-sky-100">{poster.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 no-print">
                    <button
                      type="button"
                      onClick={() => setFullscreenPoster(poster)}
                      className="px-3 py-2 bg-sky-800 hover:bg-sky-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Perbesar Poster</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-2 bg-white text-sky-900 hover:bg-sky-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak / PDF</span>
                    </button>
                  </div>
                </div>

                {/* Isi Poster Infografis: Gambar Visual Kiri + Ringkasan Rumus & Langkah Kanan */}
                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-5 space-y-3">
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={poster.imageUrl}
                        alt={poster.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-amber-950">Konteks Lokal Kalimantan Selatan:</strong>{' '}
                      {poster.kalselContext}
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-6">
                    {/* Rumus Inti */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                        Rumus Kunci & Konsep Matematika
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {poster.keyFormulas.map((kf, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <div className="text-xs font-bold text-sky-800">{kf.label}</div>
                            <div className="p-2 bg-white rounded border border-slate-200 font-mono text-xs font-semibold text-slate-900 tabular-nums">
                              {kf.formula}
                            </div>
                            <p className="text-[11px] text-slate-600 leading-normal">{kf.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Langkah Strategis */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                        Langkah Penyelesaian sistematis
                      </h4>
                      <div className="space-y-2.5">
                        {poster.steps.map((st, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-100 flex items-start gap-3"
                          >
                            <span className="font-mono text-sm font-bold text-sky-700 tabular-nums mt-0.5">
                              {st.number}.
                            </span>
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold text-slate-900">{st.heading}</div>
                              <p className="text-xs text-slate-600 leading-relaxed">{st.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <div className="text-base font-bold">Sudah memahami seluruh materi & infografis Bab 2 dan Bab 3?</div>
          <p className="text-xs text-slate-300">
            Uji kemampuanmu pada Kuis Ujian Online CBT ANBK Matematika (20 Butir Soal Kontekstual Kalimantan Selatan).
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('kuis')}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <span>Masuk ke Menu Kuis CBT</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal Fullscreen Poster */}
      {fullscreenPoster && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-xs font-semibold text-sky-700">{fullscreenPoster.bab}</div>
                <h3 className="text-xl font-bold text-slate-900 font-display">{fullscreenPoster.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenPoster(null)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <img
                src={fullscreenPoster.imageUrl}
                alt={fullscreenPoster.title}
                referrerPolicy="no-referrer"
                className="w-full rounded-xl border border-slate-200"
              />
              <div className="space-y-4">
                {fullscreenPoster.keyFormulas.map((f, i) => (
                  <div key={i} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-xs font-bold text-sky-800">{f.label}</div>
                    <div className="font-mono text-xs font-semibold text-slate-900">{f.formula}</div>
                    <div className="text-xs text-slate-600">{f.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
