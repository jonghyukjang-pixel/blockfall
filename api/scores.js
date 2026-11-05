// Vercel serverless function: /api/scores
//   GET  /api/scores?limit=10  -> top scores
//   POST /api/scores           -> { name, score, lines, level }
const { topScores, addScore } = require('./_lib/db');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await topScores(req.query && req.query.limit));
    }
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: '잘못된 요청입니다' }); }
      }
      const out = await addScore(body);
      return res.status(out.status).json(out.body);
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
};
