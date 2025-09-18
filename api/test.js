export default function handler(req, res) {
  res.status(200).json({
    url: process.env.SUPABASE_URL || "❌ MISSING",
    key: process.env.SUPABASE_ANON_KEY ? "✅ PRESENT" : "❌ MISSING"
  });
}
