import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface RoomFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function RoomForm({ onClose, onSuccess }: RoomFormProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    pic_name: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Tambah Ruangan Baru</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Kode Ruangan</label>
            <input 
              type="text" className="input" placeholder="LAB-01"
              value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })}
              required 
            />
          </div>
          <div>
            <label className="label">Nama Ruangan</label>
            <input 
              type="text" className="input" placeholder="Laboratorium Komputer"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              required 
            />
          </div>
          <div>
            <label className="label">Penanggung Jawab (PIC)</label>
            <input 
              type="text" className="input" placeholder="Nama Guru/Staff"
              value={formData.pic_name} onChange={e => setFormData({ ...formData, pic_name: e.target.value })}
              required 
            />
          </div>
          <div>
            <label className="label">Keterangan</label>
            <textarea 
              className="input h-24 resize-none"
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">Batal</button>
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Save size={18} /> Simpan Ruangan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
