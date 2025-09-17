import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;
app.use(cors());

app.get('/api/health', (req, res) => {
    res.json({ status: "ok", message: "Backend is running!" });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
