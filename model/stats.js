import Mongoose from 'mongoose';
import { setupStatsSchema } from '../database/database.js';

const statsSchema = new Mongoose.Schema({
  totalPandoras: { type: Number, required: true, default: 0 },
  totalOpenedPandoras: { type: Number, required: true, default: 0 },
  totalChallengers: { type: Number, required: true, default: 0 },
}, { timestamps: true, versionKey: false });

setupStatsSchema(statsSchema);

const Stats = Mongoose.model('Stats', statsSchema);

export default Stats;
