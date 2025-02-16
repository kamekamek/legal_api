require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// ジオコーディングエンドポイント
app.post('/api/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    const response = await axios.get('https://api.zenrin.io/geocode/search', {
      params: {
        address,
        api_key: process.env.ZENRIN_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'ジオコーディングに失敗しました' });
  }
});

// 用途地域情報取得エンドポイント
app.get('/api/landuse', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const response = await axios.get('https://api.zenrin.io/landuse', {
      params: {
        lat,
        lng,
        api_key: process.env.ZENRIN_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Landuse error:', error);
    res.status(500).json({ error: '用途地域情報の取得に失敗しました' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
