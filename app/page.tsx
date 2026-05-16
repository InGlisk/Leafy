'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/plants';
import {
  PLANT_LIBRARY,
  getSeason,
  getTasksForSeason,
  getDaysUntilDue,
  type PlantTemplate,
  type Season,
} from '@/lib/plants';
import AddPlantModal from '@/components/AddPlantModal';
import PlantCard from '@/components/PlantCard';
import NotificationSetup from '@/components/NotificationSetup';

export interface DbPlant {
  id: string;
  template_id: string;
  name: string;
  emoji: string;
  added_at: string;
  archived: boolean;
  notes: string | null;
}

export interface DbLog {
  id: string;
  plant_id: string;
  task_type: string;
  done_at: string;
  done_by: string | null;
  notes: string | null;
}

export interface PlantWithLogs extends DbPlant {
  template: PlantTemplate;
  logs: DbLog[];
}

export default function Home() {
  const [plants, setPlants] = useState<PlantWithLogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [season] = useState<Season>(getSeason());

  const fetchData = useCallback(async () => {
    const [{ data: dbPlants }, { data: dbLogs }] = await Promise.all([
      supabase.from('plants').select('*').eq('archived', false).order('added_at'),
      supabase.from('care_logs').select('*').order('done_at', { ascending: false }),
    ]);

    if (!dbPlants) return;

    const enriched: PlantWithLogs[] = (dbPlants as DbPlant[]).map((p) => {
      const template = PLANT_LIBRARY.find((t) => t.id === p.template_id)!;
      const logs = (dbLogs as DbLog[])?.filter((l) => l.plant_id === p.id) ?? [];
      return { ...p, template, logs };
    });

    setPlants(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    // Realtime subscription for collaborative updates
    const channel = supabase
      .channel('plant-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'care_logs' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plants' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const handleLogCare = async (plantId: string, taskType: string, doneBy?: string) => {
    await supabase.from('care_logs').insert({
      plant_id: plantId,
      task_type: taskType,
      done_by: doneBy ?? null,
    });
    fetchData();
  };

  const handleArchivePlant = async (plantId: string) => {
    await supabase.from('plants').update({ archived: true }).eq('id', plantId);
    fetchData();
  };

  const urgentCount = plants.filter((p) => {
    const tasks = getTasksForSeason(p.template, season);
    return tasks.some((t) => {
      const lastLog = p.logs.find((l) => l.task_type === t.type);
      return getDaysUntilDue(lastLog?.done_at ?? null, t.intervalDays) <= 0;
    });
  }).length;

  const seasonLabel: Record<Season, string> = {
    summer: 'Summer 🌞',
    autumn: 'Autumn 🍂',
    winter: 'Winter ❄️',
    spring: 'Spring 🌱',
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-leaf-950 via-leaf-950 to-leaf-900">
      {/* Header */}
      <header className="safe-top px-4 pt-6 pb-4 border-b border-leaf-800/50">
        <div className="max-w-lg mx-auto flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl text-leaf-100 leading-tight">Leafy</h1>
            <p className="text-leaf-400 text-sm mt-0.5">
              {seasonLabel[season]} · Melbourne
              {urgentCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 bg-red-900/60 text-red-300 text-xs px-2 py-0.5 rounded-full border border-red-700/40">
                  {urgentCount} need{urgentCount === 1 ? 's' : ''} attention
                </span>
              )}
            </p>
          </div>
          <NotificationSetup />
        </div>
      </header>

      {/* Plant list */}
      <section className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="text-center py-16 text-leaf-500 animate-pulse-soft">
            Loading your plants…
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🌱</p>
            <p className="text-leaf-300 text-lg font-display">No plants yet</p>
            <p className="text-leaf-500 text-sm mt-1">Add your first plant to get started</p>
          </div>
        ) : (
          plants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              season={season}
              onLogCare={handleLogCare}
              onArchive={handleArchivePlant}
            />
          ))
        )}
      </section>

      {/* Add plant FAB */}
      <div className="fixed bottom-6 right-4 safe-bottom">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-leaf-500 hover:bg-leaf-400 text-white font-medium px-5 py-3.5 rounded-2xl shadow-lg shadow-leaf-900/60 transition-all duration-200 active:scale-95"
        >
          <span className="text-xl leading-none">＋</span>
          <span>Add plant</span>
        </button>
      </div>

      {/* Add plant modal */}
      {showAdd && (
        <AddPlantModal
          onClose={() => setShowAdd(false)}
          onAdded={fetchData}
        />
      )}
    </main>
  );
}
