import * as FileSystem from 'expo-file-system';

function getMissionFile() {
  const dir = FileSystem.documentDirectory;
  if (!dir) return null;
  return dir + 'gomile_mission_queue.json';
}

export async function saveMissionQueue(missionQueue, missionStates, focusedMissionId) {
  const file = getMissionFile();
  if (!file) return;
  try {
    await FileSystem.writeAsStringAsync(
      file,
      JSON.stringify({ missionQueue, missionStates, focusedMissionId })
    );
  } catch {}
}

export async function loadMissionQueue() {
  const file = getMissionFile();
  if (!file) return null;
  try {
    const info = await FileSystem.getInfoAsync(file);
    if (!info.exists) return null;
    const content = await FileSystem.readAsStringAsync(file);
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.missionQueue)) return null;
    return parsed;
  } catch {
    return null;
  }
}
