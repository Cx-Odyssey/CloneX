export default function handler(req, res) {
  globalThis.db = globalThis.db || {};
  const leaderboard = Object.entries(globalThis.db)
    .map(([id, state]) => ({ id, gp: state.gp || 0 }))
    .sort((a, b) => b.gp - a.gp)
    .slice(0, 10);

  res.status(200).json({ leaderboard });
}