export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { playerId, state } = req.body;
  globalThis.db = globalThis.db || {};
  globalThis.db[playerId] = state;

  res.status(200).json({ success: true });
}