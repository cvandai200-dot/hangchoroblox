// lib/queue-store.ts
// Simple in-memory queue store for dev (resets on server restart)
// For production on Vercel: Replace with @vercel/kv (Redis)

import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'queue-data.json');

export interface JoinRecord {
  username: string;
  masked: string;
  joinedAt: string; // ISO string
}

interface QueueData {
  totalJoined: number;
  usernames: string[]; // for quick check
  ips: string[]; // for IP limit
  recentJoins: JoinRecord[];
}

const MAX_QUEUE = 5000;
const INITIAL_TOTAL = 987; // ~1k like rich leaderboard feel

let memoryStore: QueueData | null = null;

async function loadStore(): Promise<QueueData> {
  if (memoryStore) return memoryStore;

  try {
    const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
    memoryStore = JSON.parse(fileContent);
    return memoryStore!;
  } catch {
    // Init new
    memoryStore = {
      totalJoined: INITIAL_TOTAL,
      usernames: [],
      ips: [],
      recentJoins: [],
    };
    await saveStore();
    return memoryStore;
  }
}

async function saveStore() {
  if (!memoryStore) return;
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(memoryStore, null, 2));
  } catch (e) {
    console.error('Failed to save queue data:', e);
  }
}

function maskUsername(username: string): string {
  if (username.length <= 4) {
    return username[0] + '***';
  }
  const start = username.slice(0, 3);
  const end = username.slice(-2);
  return `${start}***${end}`;
}

export async function getQueueStatus() {
  const store = await loadStore();
  return {
    totalJoined: store.totalJoined,
    remaining: Math.max(0, MAX_QUEUE - store.totalJoined),
    recentJoins: store.recentJoins.slice(0, 8), // last 8
    maxQueue: MAX_QUEUE,
  };
}

export async function checkCanJoin(username: string, ip: string) {
  const store = await loadStore();
  const lowerUsername = username.toLowerCase().trim();

  if (store.usernames.includes(lowerUsername)) {
    return { canJoin: false, reason: 'USERNAME_USED' as const };
  }
  if (store.ips.includes(ip)) {
    return { canJoin: false, reason: 'IP_USED' as const };
  }
  if (store.totalJoined >= MAX_QUEUE) {
    return { canJoin: false, reason: 'QUEUE_FULL' as const };
  }
  return { canJoin: true };
}

export async function joinQueue(username: string, ip: string) {
  const store = await loadStore();
  const lowerUsername = username.toLowerCase().trim();

  // Double check
  const check = await checkCanJoin(username, ip);
  if (!check.canJoin) {
    return { success: false, reason: check.reason };
  }

  const now = new Date().toISOString();
  const masked = maskUsername(username);

  // Add
  store.usernames.push(lowerUsername);
  store.ips.push(ip);
  store.totalJoined += 1;

  // Add to recent (newest first)
  store.recentJoins.unshift({
    username: lowerUsername,
    masked,
    joinedAt: now,
  });

  // Keep only last 20 in memory
  if (store.recentJoins.length > 20) {
    store.recentJoins.pop();
  }

  await saveStore();

  const position = store.totalJoined;

  return {
    success: true,
    position,
    totalJoined: store.totalJoined,
    remaining: Math.max(0, MAX_QUEUE - store.totalJoined),
    masked,
  };
}

// For admin
export async function getAllUsernames() {
  const store = await loadStore();
  return store.usernames;
}

export async function resetQueue() {
  memoryStore = {
    totalJoined: INITIAL_TOTAL,
    usernames: [],
    ips: [],
    recentJoins: [],
  };
  await saveStore();
  return { success: true };
}
