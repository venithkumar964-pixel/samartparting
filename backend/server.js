import 'dotenv/config';
import cors from 'cors';
import express from 'express';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API listening on port ${port}`));

