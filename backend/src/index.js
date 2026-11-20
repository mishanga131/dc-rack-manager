import express from 'express';
import cors from 'cors';
import racksRouter from './routes/racks.js';
import devicesRouter from './routes/devices.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/racks', racksRouter);
app.use('/api/devices', devicesRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не знайдено' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Некоректний JSON' });
  }
  res.status(500).json({ message: 'Помилка сервера' });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
