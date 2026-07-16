// lib/queue-store.ts
// Simple in-memory queue store for Vercel deployment

export interface JoinRecord {
  username: string;
  masked: string;
  joinedAt: string;
}

interface QueueData {
  totalJoined: number;
  usernames: string[];
  ips: string[];
  recentJoins: JoinRecord[];
}

const MAX_QUEUE = 5000;
const INITIAL_TOTAL = 987;

let memoryStore: QueueData = {
  totalJoined: INITIAL_TOTAL,
  usernames: [],
  ips: [],
  recentJoins: [],
};

function maskUsername(username: string): string {
  if (username.length <= 4) {
    return username[0] + '***';
  }
  const start = username.slice(0, 3);
  const end = username.slice(-2);
  return `${start}***${end}`;
}

export async function getQueueStatus() {
  return {
    totalJoined: memoryStore.totalJoined,
    remaining: Math.max(0, MAX_QUEUE - memoryStore.totalJoined),
    recentJoins: memoryStore.recentJoins.slice(0, 8),
    maxQueue: MAX_QUEUE,
  };
}

export async function checkCanJoin(username: string, ip: string) {
  const lowerUsername = username.toLowerCase().trim();

  if (memoryStore.usernames.includes(lowerUsername)) {
    return { canJoin: false, reason: 'USERNAME_USED' as const };
  }
  if (memoryStore.ips.includes(ip)) {
    return { canJoin: false, reason: 'IP_USED' as const };
  }
  if (memoryStore.totalJoined >= MAX_QUEUE) {
    return { canJoin: false, reason: 'QUEUE_FULL' as const };
  }
  return { canJoin: true };
}

export async function joinQueue(username: string, ip: string) {
  const lowerUsername = username.toLowerCase().trim();

  const check = await checkCanJoin(username, ip);
  if (!check.canJoin) {
    return { success: false, reason: check.reason };
  }

  const now = new Date().toISOString();
  const masked = maskUsername(username);

  memoryStore.usernames.push(lowerUsername);
  memoryStore.ips.push(ip);
  memoryStore.totalJoined += 1;

  memoryStore.recentJoins.unshift({
    username: lowerUsername,
    masked,
    joinedAt: now,
  });

  if (memoryStore.recentJoins.length > 20) {
    memoryStore.recentJoins.pop();
  }

  const position = memoryStore.totalJoined;

  return {
    success: true,
    position,
    totalJoined: memoryStore.totalJoined,
    remaining: Math.max(0, MAX_QUEUE - memoryStore.totalJoined),
    masked,
  };
}

export async function getAllUsernames() {
  return memoryStore.usernames;
}

export async function resetQueue() {
  memoryStore = {
    totalJoined: INITIAL_TOTAL,
    usernames: [],
    ips: [],
    recentJoins: [],
  };
  return { success: true };
}
