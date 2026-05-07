import * as FileSystem from 'expo-file-system';

function getMissionFile() {
  const dir = FileSystem.documentDirectory;
  if (!dir) return null;
  return dir + 'gomile_active_mission.json';
}

export async function saveActiveMission(mission) {
  const file = getMissionFile();
  if (!file) return;
  try {
    if (!mission) {
      await FileSystem.deleteAsync(file, { idempotent: true });
    } else {
      await FileSystem.writeAsStringAsync(file, JSON.stringify(mission));
    }
  } catch {}
}

export async function loadActiveMission() {
  const file = getMissionFile();
  if (!file) return null;
  try {
    const info = await FileSystem.getInfoAsync(file);
    if (!info.exists) return null;
    const content = await FileSystem.readAsStringAsync(file);
    return JSON.parse(content);
  } catch {
    return null;
  }
}
