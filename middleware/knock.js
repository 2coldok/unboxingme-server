import * as userDB from '../data/user.js';
import * as pandoraDB from '../data/pandora.js';
import * as recordDB from '../data/record.js';

export async function knock(req, res, next) {
  const { answer } = req.body;
  const pandoraId = req.params.id;
  const pandora = await pandoraDB.findById(pandoraId);
  
  if (answer === pandora.problems[0].answer) {
    req.pandora = pandora;
    next();
  } else {
    res.status(200).json({  })
  }
}