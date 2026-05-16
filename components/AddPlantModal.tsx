'use client';

import { useState } from 'react';
import { supabase, PLANT_LIBRARY } from '@/lib/plants';

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

export default function AddPlantModal({ onClose, onAdded }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [saving, setSaving] = useState(false);

  const template = PLANT_LIBRARY.find((p) => p.id === selected);

  const handleAdd = async () => {
    if (!template) return;
    setSaving(true);
    await supabase.from('plants').insert({
      template_id: template.id,
      name: customName.trim() || template.name,
      emoji: template.emoji,
    });
    setSaving(false);
    onAdded();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-leaf-950/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-leaf-900 border border-leaf-700/50 rounded-t-3xl pb-safe animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-leaf-700 rounded-full" />
        </div>

        <div className="px-5 pb-6">
          <h2 className="font-display text-2xl text-leaf-100 mt-2 mb-4">Add a plant</h2>

          {/* Plant picker */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {PLANT_LIBRARY.map((plant) => (
              <button
                key={plant.id}
                onClick={() => { setSelected(plant.id); setCustomName(''); }}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-left transition-all
                  ${selected === plant.id
                    ? 'bg-leaf-700/60 border-leaf-500 text-leaf-100'
                    : 'bg-leaf-950/40 border-leaf-800/50 text-leaf-400 hover:border-leaf-600'
                  }`}
              >
                <span className="text-xl">{plant.emoji}</span>
                <span className="text-sm font-medium leading-tight">{plant.name}</span>
              </button>
            ))}
          </div>

          {/* Custom name */}
          {template && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="text-xs text-leaf-500 mb-1 block">
                  Custom name (optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={template.name}
                  className="w-full bg-leaf-950/60 border border-leaf-700/50 rounded-xl px-3 py-2.5 text-leaf-100 placeholder-leaf-600 text-sm focus:outline-none focus:border-leaf-500"
                />
              </div>

              {/* Light suitability note */}
              <div className="bg-leaf-950/40 border border-leaf-800/40 rounded-xl px-3 py-2.5 text-sm">
                <p className="text-leaf-400">
                  <span className="text-leaf-300 font-medium">NW window: </span>
                  {template.nwWindowSuitability === 'ideal' && '✅ Ideal spot for this plant.'}
                  {template.nwWindowSuitability === 'good' && '✅ Good — will thrive here.'}
                  {template.nwWindowSuitability === 'tolerable' && '⚠️ Manageable — may grow slowly.'}
                  {template.nwWindowSuitability === 'needs-supplement' && '⚠️ Consider a grow light in winter.'}
                </p>
                {template.toxicToPets && (
                  <p className="text-amber-400/80 text-xs mt-1">⚠️ Toxic to pets</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-leaf-700/50 text-leaf-400 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!selected || saving}
              className="flex-1 py-3 rounded-xl bg-leaf-600 hover:bg-leaf-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
            >
              {saving ? 'Adding…' : 'Add plant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
