import { createApp } from './app';

const PORT = Number(process.env.PORT) || 4001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Mock E-Commerce API is running on http://localhost:${PORT}`);
});
