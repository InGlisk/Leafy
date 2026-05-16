'use client';

import { useState } from 'react';
import {
  getTasksForSeason,
  getDaysUntilDue,
  getStatusColor,
  type Season,
} from '@/lib/plants';
import type { PlantWithLogs } from '@/app/page';

const TASK_ICONS: Record<string, string> = {
  water:       '💧',
  repot:       '🪴',
  fertilise:   '🌿',
  mist:        '💨',
  wipe_leaves: '🧻',
  check:       '👀',
};

const TASK_LABELS: Record<string, string> = {
  water:       'Water',
  repot:       'Repot',
  fertilise:   'Fertilise',
  mist:        'Mist',
  wipe_leaves: 'Wipe leaves',
  check:       'Health check',
};

interface Props {
  plant: PlantWithLogs;
  season: Season;
  onLogCare: (plantId: string, taskType: string, doneBy?: string) => Promise<void>;
  onArchive: (plantId: string) => Promise<void>;
}

export default function PlantCard({ plant, season, onLogCare, onArchive }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [logging, setLogging] = useState<string | null>(null);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  const tasks = getTasksForSeason(plant.template, season);

  const getLastLog = (taskType: string) =>
    plant.logs.find((l) => l.task_type === taskType);

  const handleLog = async (taskType: string) => {
    setLogging(taskType);
    await onLogCare(plant.id, taskType);
    setLogging(null);
  };

  const overdueTasks = tasks.filter((t) => {
    const last = getLastLog(t.type);
    return getDaysUntilDue(last?.done_at ?? null, t.intervalDays) <= 0;
  });

  const dueSoonTasks = tasks.filter((t) => {
    const last = getLastLog(t.type);
    const days = getDaysUntilDue(last?.done_at ?? null, t.intervalDays);
    return days > 0 && days <= 2;
  });

  const worstStatus =
    overdueTasks.length > 0 ? 'overdue' :
    dueSoonTasks.length > 0 ? 'due-soon' : 'ok';

  const statusStyles = {
    overdue:   'border-red-700/50',
    'due-soon': 'border-amber-700/50',
    ok:        'border-leaf-700/40',
  };

  return (
    <div className={`plant-card border ${statusStyles[worstStatus]} animate-slide-up`}>
      {/* Card header */}
      <button
        className="w-full text-left px-4 py-4 flex items-center gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-3xl">{plant.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-lg text-leaf-100 leading-tight">{plant.name}</h2>
            {overdueTasks.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full status-overdue">
                {overdueTasks.length} overdue
              </span>
            )}
            {overdueTasks.length === 0 && dueSoonTasks.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full status-due-soon">
                due soon
              </span>
            )}
          </div>
          <p className="text-leaf-500 text-xs mt-0.5">{plant.template.lightNeeds}</p>
        </div>
        <span className="text-leaf-600 text-lg">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Quick action row — always visible for overdue tasks */}
      {overdueTasks.length > 0 && !expanded && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {overdueTasks.map((t) => (
            <button
              key={t.type}
              onClick={() => handleLog(t.type)}
              disabled={logging === t.type}
              className="task-pill status-overdue hover:opacity-80"
            >
              <span>{TASK_ICONS[t.type]}</span>
              <span>{logging === t.type ? '…' : TASK_LABELS[t.type]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-5 space-y-4 border-t border-leaf-800/40 pt-4">
          {/* Winter care note */}
          {(season === 'winter' || season === 'autumn') && (
            <div className="bg-soil-950/60 border border-soil-800/40 rounded-xl px-3 py-2.5 text-sm text-soil-300">
              <span className="font-medium">Winter tip: </span>
              {plant.template.winterCare}
            </div>
          )}

          {/* Tasks */}
          <div className="space-y-2">
            {tasks.map((task) => {
              const lastLog = getLastLog(task.type);
              const daysUntil = getDaysUntilDue(lastLog?.done_at ?? null, task.intervalDays);
              const status = getStatusColor(daysUntil);

              let dueLabel: string;
              if (!lastLog) dueLabel = 'Never done';
              else if (daysUntil <= 0) dueLabel = `${Math.abs(daysUntil)}d overdue`;
              else if (daysUntil === 1) dueLabel = 'Due tomorrow';
              else dueLabel = `In ${daysUntil}d`;

              const lastDoneStr = lastLog
                ? new Date(lastLog.done_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
                : null;

              return (
                <div key={task.type} className={`task-pill justify-between status-${status}`}>
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="text-base mt-0.5">{TASK_ICONS[task.type]}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-leaf-100">{TASK_LABELS[task.type]}</p>
                      <p className="text-xs text-leaf-500 leading-tight mt-0.5">{task.notes}</p>
                      {lastDoneStr && (
                        <p className="text-xs text-leaf-600 mt-0.5">
                          Last: {lastDoneStr}
                          {lastLog?.done_by ? ` by ${lastLog.done_by}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap status-${status}`}>
                      {dueLabel}
                    </span>
                    <button
                      onClick={() => handleLog(task.type)}
                      disabled={logging === task.type}
                      className="text-xs bg-leaf-600 hover:bg-leaf-500 text-white px-2.5 py-1 rounded-lg transition-colors active:scale-95"
                    >
                      {logging === task.type ? '…' : 'Done ✓'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pet-safe / toxicity note */}
          {plant.template.toxicToPets && (
            <p className="text-xs text-amber-400/80">
              ⚠️ Toxic to pets and irritant to humans — wash hands after handling.
            </p>
          )}

          {/* Remove plant */}
          {showConfirmRemove ? (
            <div className="flex gap-2">
              <button
                onClick={() => onArchive(plant.id)}
                className="flex-1 text-sm bg-red-900/60 text-red-300 border border-red-700/50 px-3 py-2 rounded-xl"
              >
                Yes, remove
              </button>
              <button
                onClick={() => setShowConfirmRemove(false)}
                className="flex-1 text-sm bg-leaf-900/60 text-leaf-400 border border-leaf-700/40 px-3 py-2 rounded-xl"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmRemove(true)}
              className="text-xs text-leaf-700 hover:text-red-400 transition-colors"
            >
              Remove plant
            </button>
          )}
        </div>
      )}
    </div>
  );
}
