import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Printer, Filter, FileDown } from 'lucide-react';
import { User, InventoryItem } from '../types';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ReportView({ user }: { user: User }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [mutations, setMutations] = useState<any[]>([]);
  const [opnames, setOpnames] = useState<any[]>([]);
  const [procurements, setProcurements] = useState<any[]>([]);
  const [reportType, setReportType] = useState('inventaris');
  const [filter, setFilter] = useState({ category: '', status: 'aktif' });
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    const title = getReportTitle();
    
    doc.setFontSize(18);
    doc.text("SMK NEGERI CONTOH JAKARTA", 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(title, 105, 25, { align: 'center' });
    doc.text(`Periode: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`, 105, 32, { align: 'center' });

    const tableData: any[] = [];
    const headers: string[] = [];

    if (reportType === 'inventaris') {
      headers.push('No', 'Barcode', 'Nama Barang', 'Merk/Spek', 'Tahun', 'Kondisi', 'Lokasi');
      items.forEach((item, idx) => {
        tableData.push([idx + 1, item.barcode, item.name, `${item.brand} / ${item.specification}`, item.year_acquired, item.condition.toUpperCase(), item.room_name]);
      });
    } else if (reportType === 'mutasi') {
      headers.push('No', 'Tanggal', 'Nama Barang', 'Dari', 'Ke', 'Alasan');
      mutations.forEach((m, idx) => {
        tableData.push([idx + 1, new Date(m.mutation_date).toLocaleDateString('id-ID'), m.item_name, m.from_room_name, m.to_room_name, m.reason]);
      });
    } else if (reportType === 'opname') {
      headers.push('No', 'Tanggal', 'Nama Barang', 'Awal', 'Akhir', 'Catatan');
      opnames.forEach((o, idx) => {
        tableData.push([idx + 1, new Date(o.check_date).toLocaleDateString('id-ID'), o.item_name, o.condition_before.toUpperCase(), o.condition_after.toUpperCase(), o.notes]);
      });
    } else if (reportType === 'pengadaan') {
      headers.push('No', 'Nama Barang', 'Qty', 'Harga', 'Status', 'Pengaju');
      procurements.forEach((p, idx) => {
        tableData.push([idx + 1, p.item_name, p.quantity, `Rp ${p.estimated_price.toLocaleString('id-ID')}`, p.status.toUpperCase(), p.requester_name]);
      });
    }

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  const fetchData = async () => {
    if (reportType === 'inventaris') {
      const params = new URLSearchParams(filter);
      const res = await fetch(`/api/inventory?${params.toString()}`);
      const data = await res.json();
      setItems(data);
    } else if (reportType === 'mutasi') {
      const res = await fetch('/api/mutations');
      const data = await res.json();
      setMutations(data);
    } else if (reportType === 'opname') {
      const res = await fetch('/api/opname');
      const data = await res.json();
      setOpnames(data);
    } else if (reportType === 'pengadaan') {
      const res = await fetch('/api/procurement');
      const data = await res.json();
      setProcurements(data);
    }
  };

  useEffect(() => { fetchData(); }, [reportType, filter]);

  const getReportTitle = () => {
    switch(reportType) {
      case 'inventaris': return `Laporan Inventaris Barang ${filter.category ? filter.category.toUpperCase() : ''} (${filter.status.toUpperCase()})`;
      case 'mutasi': return 'Laporan Mutasi Barang Inventaris';
      case 'opname': return 'Laporan Hasil Stock Opname (Cek Kondisi)';
      case 'pengadaan': return 'Laporan Pengadaan Barang Inventaris';
      default: return 'Laporan Sarpras';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Laporan Profesional</h3>
          <p className="text-slate-500">Generate berbagai jenis laporan sarpras sekolah</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportPDF} className="btn btn-secondary flex items-center gap-2 text-indigo-600 border-indigo-200">
            <FileDown size={18} /> Export PDF
          </button>
          <button onClick={() => handlePrint()} className="btn btn-secondary flex items-center gap-2">
            <Printer size={18} /> Cetak Laporan
          </button>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Jenis Laporan</label>
          <select 
            className="input w-64"
            value={reportType}
            onChange={e => setReportType(e.target.value)}
          >
            <option value="inventaris">Laporan Inventaris</option>
            <option value="mutasi">Laporan Mutasi</option>
            <option value="opname">Laporan Stock Opname</option>
            <option value="pengadaan">Laporan Pengadaan</option>
          </select>
        </div>
        {reportType === 'inventaris' && (
          <>
            <div>
              <label className="label">Kategori</label>
              <select 
                className="input w-48"
                value={filter.category}
                onChange={e => setFilter({ ...filter, category: e.target.value })}
              >
                <option value="">Semua Kategori</option>
                <option value="umum">Umum</option>
                <option value="tanah">Tanah</option>
                <option value="bangunan">Bangunan</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select 
                className="input w-48"
                value={filter.status}
                onChange={e => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="aktif">Aktif</option>
                <option value="non-aktif">Non-Aktif</option>
              </select>
            </div>
          </>
        )}
        <button onClick={fetchData} className="btn btn-primary flex items-center gap-2">
          <Filter size={18} /> Refresh Data
        </button>
      </div>

      <div className="card bg-white shadow-xl" ref={componentRef}>
        <div className="p-12">
          {/* Header Laporan */}
          <div className="text-center mb-10 border-b-4 border-double border-slate-900 pb-6">
            <h1 className="text-3xl font-black uppercase tracking-tighter">PEMERINTAH KOTA ADMINISTRASI</h1>
            <h2 className="text-2xl font-bold uppercase tracking-tight">DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
            <h3 className="text-xl font-bold uppercase">SMK NEGERI CONTOH JAKARTA</h3>
            <p className="text-sm italic">Jl. Pendidikan No. 123, Jakarta Selatan | Telp: (021) 12345678</p>
          </div>

          <div className="text-center mb-8">
            <h4 className="text-xl font-bold underline uppercase">{getReportTitle()}</h4>
            <p className="text-slate-600">Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Tabel Konten Berdasarkan Jenis Laporan */}
          {reportType === 'inventaris' && (
            <table className="w-full text-left border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase text-center">No</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Barcode</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Nama Barang</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Merk/Spek</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase text-center">Tahun</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Kondisi</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="border border-slate-400 px-4 py-2 text-sm text-center">{idx + 1}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm font-mono">{item.barcode}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm font-bold">{item.name}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm">{item.brand} / {item.specification}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm text-center">{item.year_acquired}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm uppercase">{item.condition.replace('_', ' ')}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm">{item.room_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'mutasi' && (
            <table className="w-full text-left border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase text-center">No</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Tanggal</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Nama Barang</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Dari Ruang</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Ke Ruang</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Alasan</th>
                </tr>
              </thead>
              <tbody>
                {mutations.map((m, idx) => (
                  <tr key={m.id}>
                    <td className="border border-slate-400 px-4 py-2 text-sm text-center">{idx + 1}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm">{new Date(m.mutation_date).toLocaleDateString('id-ID')}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm font-bold">{m.item_name}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm">{m.from_room_name}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm font-bold">{m.to_room_name}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm">{m.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'opname' && (
            <table className="w-full text-left border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase text-center">No</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Tanggal Cek</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Nama Barang</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Kondisi Awal</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Kondisi Akhir</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {opnames.map((o, idx) => (
                  <tr key={o.id}>
                    <td className="border border-slate-400 px-4 py-2 text-sm text-center">{idx + 1}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm">{new Date(o.check_date).toLocaleDateString('id-ID')}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm font-bold">{o.item_name}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm uppercase">{o.condition_before.replace('_', ' ')}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm uppercase font-bold">{o.condition_after.replace('_', ' ')}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm">{o.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'pengadaan' && (
            <table className="w-full text-left border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase text-center">No</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Nama Barang</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase text-center">Qty</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Estimasi Harga</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Status</th>
                  <th className="border border-slate-400 px-4 py-2 text-xs font-bold uppercase">Pengaju</th>
                </tr>
              </thead>
              <tbody>
                {procurements.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="border border-slate-400 px-4 py-2 text-sm text-center">{idx + 1}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm font-bold">{p.item_name}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm text-center">{p.quantity}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm">Rp {p.estimated_price.toLocaleString('id-ID')}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm uppercase font-bold">{p.status}</td>
                    <td className="border border-slate-400 px-4 py-2 text-sm">{p.requester_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Footer Tanda Tangan */}
          <div className="mt-16 grid grid-cols-2 gap-20">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p className="mb-24">Kepala Sekolah SMKN Contoh</p>
              <p className="font-bold underline">DR. H. BUDI SANTOSO, M.Pd</p>
              <p className="text-sm">NIP. 19700101 199501 1 001</p>
            </div>
            <div className="text-center">
              <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="mb-24">Kepala Sarana Prasarana</p>
              <p className="font-bold underline">{user.name}</p>
              <p className="text-sm">NIP. .......................................</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
