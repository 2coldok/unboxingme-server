import express from 'express';
import { connectDB } from './database/database.js';
import { config } from './config.js';

const app = express();

app.get('/', (req, res, next) => {
  res.send('Hello world!');
})

connectDB().then(() => {
  console.log('connected to MongoDB');
  app.listen(config.host.port);
});
