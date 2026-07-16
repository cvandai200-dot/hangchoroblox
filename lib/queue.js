import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'queue.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
}

export function getQueue() {
  ensureDataDir();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addToQueue(entry) {
  ensureDataDir();
  const queue = getQueue();
  
  // Check duplicate username or IP
  const exists = queue.find(item => 
    item.username.toLowerCase() === entry.username.toLowerCase() || 
    item.ip === entry.ip
  );

  if (exists) {
    return { success: false, message: 'Tên Roblox hoặc IP đã tham gia' };
  }

  queue.push({
    ...entry,
    joinedAt: new Date().toISOString()
  });

  fs.writeFileSync(DATA_FILE, JSON.stringify(queue, null, 2));
  return { success: true };
}

export function getAllParticipants() {
  return getQueue();
}

export function resetQueue() {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  return { success: true };
}
