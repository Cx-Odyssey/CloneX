export default function handler(req, res) {
  const { playerId } = req.query;
  globalThis.db = globalThis.db || {};
  const state = globalThis.db[playerId] || null;

  res.status(200).json({ state });
}