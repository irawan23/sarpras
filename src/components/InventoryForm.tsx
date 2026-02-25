import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Printer } from 'lucide-react';
import { InventoryItem, Room, ItemCategory, ItemCondition, ItemStatus } from '../types';
import Barcode from 'react-barcode';

interface InventoryFormProps {
  item: InventoryItem | null;
  category: ItemCategory;
  onClose: () => void;
  onSuccess: () => void;
}

export function InventoryForm({ item, category, onClose, onSuccess }: InventoryFormProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formData, setFormData] = useState({
    barcode: item?.barcode || `BRC-${Date.now()}`,
    name: item?.name || '',
    category: category,
    brand: item?.brand || '',
    specification: item?.specification || '',
    year_acquired: item?.year_acquired || new Date().getFullYear(),
    source_fund: item?.source_fund || '',
    price: item?.price || 0,
    condition: item?.condition || 'baik' as ItemCondition,
    status: item?.status || 'aktif' as ItemStatus,
    room_id: item?.room_id || 0,
    pic_name: item?.pic_name || '',
    notes: item?.notes || ''
  });

  useEffect(() => {
    fetch('/api/rooms').then(res => res.json()).then(setRooms);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = item ? `/api/inventory/${item.id}` : '/api/inventory';
    const method = item ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {item ? 'Detail / Edit Inventaris' : 'Tambah Inventaris Baru'}
            </h3>
            <p className="text-sm text-slate-500">Kategori: {category}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
              <Barcode value={formData.barcode} width={1.5} height={50} fontSize={12} />
              <p className="mt-2 text-xs font-mono text-slate-500">{formData.barcode}</p>
              <button type="button" className="mt-4 text-indigo-600 text-sm font-medium flex items-center gap-1 hover:underline">
                <Printer size={14} /> Cetak Label
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">Nama Barang</label>
                <input 
                  type="text" className="input" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Merk / Brand</label>
                  <input 
                    type="text" className="input" 
                    value={formData.brand} 
                    onChange={e => setFormData({ ...formData, brand: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="label">Tahun Perolehan</label>
                  <input 
                    type="number" className="input" 
                    value={formData.year_acquired} 
                    onChange={e => setFormData({ ...formData, year_acquired: parseInt(e.target.value) })} 
                  />
                </div>
              </div>
              <div>
                <label className="label">Spesifikasi</label>
                <textarea 
                  className="input h-24 resize-none" 
                  value={formData.specification} 
                  onChange={e => setFormData({ ...formData, specification: e.target.value })} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Sumber Dana</label>
                <input 
                  type="text" className="input" 
                  value={formData.source_fund} 
                  onChange={e => setFormData({ ...formData, source_fund: e.target.value })} 
                />
              </div>
              <div>
                <label className="label">Harga Satuan</label>
                <input 
                  type="number" className="input" 
                  value={formData.price} 
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Kondisi</label>
                <select 
                  className="input" 
                  value={formData.condition} 
                  onChange={e => setFormData({ ...formData, condition: e.target.value as ItemCondition })}
                >
                  <option value="baik">Baik</option>
                  <option value="rusak_ringan">Rusak Ringan</option>
                  <option value="rusak_berat">Rusak Berat</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select 
                  className="input" 
                  value={formData.status} 
                  onChange={e => setFormData({ ...formData, status: e.target.value as ItemStatus })}
                >
                  <option value="aktif">Aktif</option>
                  <option value="non-aktif">Non-Aktif</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Lokasi Ruangan</label>
              <select 
                className="input" 
                value={formData.room_id} 
                onChange={e => setFormData({ ...formData, room_id: parseInt(e.target.value) })}
                required
              >
                <option value={0}>Pilih Ruangan...</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.code})</option>)}
              </select>
            </div>

            <div>
              <label className="label">Penanggung Jawab (PIC)</label>
              <input 
                type="text" className="input" 
                value={formData.pic_name} 
                onChange={e => setFormData({ ...formData, pic_name: e.target.value })} 
              />
            </div>

            <div>
              <label className="label">Catatan Tambahan</label>
              <textarea 
                className="input h-20 resize-none" 
                value={formData.notes} 
                onChange={e => setFormData({ ...formData, notes: e.target.value })} 
              />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Save size={18} />
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
