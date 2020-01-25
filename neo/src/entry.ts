import { createApp } from './createApp';

const app = createApp();
const port = process.env.JB_NEO_PORT || 3001;
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
