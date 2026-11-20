import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racksFile = path.join(__dirname, '../data/racks.json');
const devicesFile = path.join(__dirname, '../data/devices.json');

async function readFile(file) {
  const text = await fs.readFile(file, 'utf-8');
  return JSON.parse(text);
}

async function writeFile(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

export const getRacks = () => readFile(racksFile);
export const saveRacks = (data) => writeFile(racksFile, data);
export const getDevices = () => readFile(devicesFile);
export const saveDevices = (data) => writeFile(devicesFile, data);
