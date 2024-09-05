import Mongoose from 'mongoose';

const statsSchema = new Mongoose.Schema({
  totalPandoras: { type: Number, required: true, default: 0 },
  totalOpenedPandoras: { type: Number, required: true, default: 0 },
  totalChallengers: { type: Number, required: true, default: 0 },
}, { timestamps: true, versionKey: false });

const Stats = Mongoose.model('Stats', statsSchema);

export default Stats;
