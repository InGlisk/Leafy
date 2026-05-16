import { NextRequest, NextResponse } from 'next/server';
import * as webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import { PLANT_LIBRARY, getSeason, getTasksForSeason, getDaysUntilDue } from '@/lib/plants';

// Server-side Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  // Initialise VAPID here (not at module level) so build-time doesn't run with placeholder keys
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  const secret = req.nextUrl.searchParams.get('secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const season = getSeason();

  // Fetch all active plants and their logs
  const [{ data: plants }, { data: logs }, { data: subs }] = await Promise.all([
    supabase.from('plants').select('*').eq('archived', false),
    supabase.from('care_logs').select('*').order('done_at', { ascending: false }),
    supabase.from('push_subscriptions').select('*'),
  ]);

  if (!plants || !subs || subs.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Find all overdue tasks
  const overdueItems: { plant: string; emoji: string; task: string }[] = [];

  for (const plant of plants) {
    const template = PLANT_LIBRARY.find((t) => t.id === plant.template_id);
    if (!template) continue;
    const tasks = getTasksForSeason(template, season);
    for (const task of tasks) {
      const lastLog = (logs ?? [])
        .filter((l: any) => l.plant_id === plant.id && l.task_type === task.type)[0];
      const days = getDaysUntilDue(lastLog?.done_at ?? null, task.intervalDays);
      if (days <= 0) {
        overdueItems.push({ plant: plant.name, emoji: plant.emoji, task: task.label });
      }
    }
  }

  if (overdueItems.length === 0) {
    return NextResponse.json({ sent: 0, message: 'All plants are happy 🌿' });
  }

  // Build notification body
  const body = overdueItems
    .slice(0, 3)
    .map((i) => `${i.emoji} ${i.plant}: ${i.task}`)
    .join('\n');
  const extra = overdueItems.length > 3 ? `\n+${overdueItems.length - 3} more` : '';
  const title = overdueItems.length === 1
    ? `${overdueItems[0].emoji} ${overdueItems[0].plant} needs care`
    : `${overdueItems.length} plants need attention`;

  // Send to all subscribers
  let sent = 0;
  const staleEndpoints: string[] = [];

  await Promise.all(
    subs.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body: body + extra, url: '/' })
        );
        sent++;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          staleEndpoints.push(sub.endpoint);
        }
      }
    })
  );

  // Clean up expired subscriptions
  if (staleEndpoints.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', staleEndpoints);
  }

  return NextResponse.json({ sent, overdueCount: overdueItems.length });
}
