import User from "../model/user.js";

/**
 * googleData = {
 *   googleId: string
 *   googleName: string
 *   googleEmail: string
 *   googlePhoto: string
 * }
 */
export async function findUserAndUpdate(googleData) {
  const { googleId, ...rest } = googleData;
  const updatedUser = await User.findOneAndUpdate(
    { googleId: googleId },
    { $set: rest },
    { new: true, runValidators: true })
    .select('-_id googleId googleName googleEmail googlePhoto nickName password')
    .lean()
    .exec();

  return updatedUser;
}

/**
 * googleData = {
 *   googleId: string
 *   googleName: string
 *   googleEmail: string
 *   googlePhoto: string
 * }
 */
export async function createUser(googleData) {
  const newUser = new User({
    googleId: googleData.googleId,
    googleName: googleData.googleName,
    googleEmail: googleData.googleEmail,
    googlePhoto: googleData.googlePhoto
  });

  await newUser.save();
}

/**
 * 
 */
export async function findUserByGoogleId(googleId) {
  const user = await User
    .findOne({ googleId: googleId })
    .select('googleName googleEmail googlePhoto nickName')
    .lean()
    .exec();
  
  return user;  
}
