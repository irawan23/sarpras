import React, { useState } from 'react';
import { Sparkles, Loader2, BrainCircuit, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion } from 'motion/react';
import Markdown from 'react-markdown';

export function AIAnalyst() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all necessary data for analysis
      const [summaryRes, inventoryRes, procurementRes, opnameRes, mutationRes] = await Promise.all([
        fetch('/api/reports/summary'),
        fetch('/api/inventory'),
        fetch('/api/procurement'),
        fetch('/api/opname'),
        fetch('/api/mutations')
      ]);

      const summary = await summaryRes.json();
      const inventory = await inventoryRes.json();
      const procurement = await procurementRes.json();
      const opname = await opnameRes.json();
      const mutations = await mutationRes.json();

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          Anda adalah Chief Financial Officer (CFO) dan Konsultan Strategis Sarpras Pendidikan Senior. 
          Tugas Anda adalah melakukan audit komprehensif dan memberikan "Strategic Roadmap" untuk SMK NEGERI CONTOH JAKARTA.

          DATA SISTEM UNTUK AUDIT:
          1. RINGKASAN EKSEKUTIF: ${JSON.stringify(summary)}
          2. DATA INVENTARIS LENGKAP: ${JSON.stringify(inventory)}
          3. USULAN PENGADAAN SAAT INI: ${JSON.stringify(procurement)}
          4. RIWAYAT PEMELIHARAAN (OPNAME): ${JSON.stringify(opname)}
          5. LOGISTIK & MUTASI: ${JSON.stringify(mutations)}

          INSTRUKSI ANALISIS TINGKAT TINGGI:
          
          A. AUDIT KESEHATAN ASET (Asset Health Audit):
          - Hitung persentase depresiasi aset berdasarkan tahun perolehan.
          - Identifikasi "Critical Assets" yang memiliki tingkat kerusakan tinggi namun vital bagi operasional.
          - Analisis efisiensi penggunaan ruang berdasarkan distribusi barang.

          B. FORECASTING ANGGARAN (Budget Forecasting):
          - Berdasarkan data pengadaan pending dan tren kerusakan, estimasikan total anggaran yang dibutuhkan untuk 1 tahun ke depan.
          - Berikan rekomendasi penghematan biaya (Cost-Saving Measures) tanpa mengurangi kualitas pendidikan.
          - Bandingkan estimasi harga pengadaan dengan benchmark harga pasar industri pendidikan.

          C. ANALISIS KUALITAS & VENDOR (Quality & Vendor Analysis):
          - Evaluasi performa merk (brand) yang ada. Manakah yang paling "Cost-Effective" (Harga vs Durabilitas)?
          - Berikan rekomendasi spesifikasi teknis minimal untuk pengadaan berikutnya agar aset lebih tahan lama.

          D. MANAJEMEN RISIKO (Risk Management):
          - Identifikasi risiko keselamatan jika barang rusak tidak segera ditangani (misal: bangunan, alat listrik).
          - Berikan jadwal pemeliharaan preventif (Preventive Maintenance Schedule) yang disarankan.

          E. ROADMAP STRATEGIS 12 BULAN:
          - Bagi rekomendasi menjadi: Jangka Pendek (1-3 bulan), Menengah (3-6 bulan), dan Panjang (6-12 bulan).

          FORMAT OUTPUT:
          - Gunakan Markdown yang sangat elegan dan profesional.
          - Gunakan Tabel untuk perbandingan data yang kompleks.
          - Gunakan Header yang jelas dan Poin-poin yang tajam.
          - Gunakan Bahasa Indonesia yang sangat formal, otoritatif, namun solutif.
          - Tambahkan bagian "Executive Summary" di paling atas untuk Kepala Sekolah.
        `,
      });

      setAnalysis(response.text || "Gagal menghasilkan analisis.");
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan saat menghubungi AI. Pastikan API Key sudah terkonfigurasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="text-indigo-600" />
            Analis AI Sarpras
          </h3>
          <p className="text-slate-500">Gunakan kecerdasan buatan untuk menganalisis data dan mendapatkan rekomendasi strategis.</p>
        </div>
        <button 
          onClick={runAnalysis} 
          disabled={loading}
          className="btn btn-primary flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 border-none shadow-lg shadow-indigo-200"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
          {loading ? 'Menganalisis...' : 'Mulai Analisis AI'}
        </button>
      </div>

      {!analysis && !loading && !error && (
        <div className="card p-12 text-center space-y-4 bg-gradient-to-b from-white to-slate-50">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
            <Sparkles size={40} />
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="text-xl font-bold text-slate-900">Siap Mengoptimalkan Sarpras?</h4>
            <p className="text-slate-500">Klik tombol di atas untuk memproses seluruh data inventaris, mutasi, dan pengadaan Anda melalui model AI tercanggih.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <TrendingUp className="text-emerald-500 mx-auto mb-2" size={24} />
              <p className="text-xs font-bold uppercase text-slate-400">Analisis Tren</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <AlertCircle className="text-amber-500 mx-auto mb-2" size={24} />
              <p className="text-xs font-bold uppercase text-slate-400">Deteksi Masalah</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <CheckCircle2 className="text-blue-500 mx-auto mb-2" size={24} />
              <p className="text-xs font-bold uppercase text-slate-400">Rekomendasi</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="card p-20 flex flex-col items-center justify-center space-y-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="text-indigo-600"
          >
            <BrainCircuit size={64} />
          </motion.div>
          <div className="text-center">
            <h4 className="text-lg font-bold text-slate-900">AI sedang berpikir...</h4>
            <p className="text-slate-500">Menganalisis ribuan data inventaris dan riwayat pemeliharaan.</p>
          </div>
          <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 15 }}
              className="bg-indigo-600 h-full"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="card p-6 border-red-200 bg-red-50 flex items-center gap-4 text-red-700">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      )}

      {analysis && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-white shadow-xl overflow-hidden"
        >
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <span className="font-bold">Hasil Analisis Strategis AI</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Gemini 3 Flash</span>
          </div>
          <div className="p-8 prose prose-slate max-w-none">
            <div className="markdown-body">
              <Markdown>{analysis}</Markdown>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button 
              onClick={() => window.print()} 
              className="btn btn-secondary text-sm"
            >
              Cetak Analisis
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
