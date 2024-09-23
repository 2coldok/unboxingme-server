
/**
 * user = {
 *   googleName: string,
 *   googleEmail: string,
 *   googlePhoto: string,
 *   nickname: string | null
 * }
 */
export function mProfile(user) {
  return {
    displayName: user.googleName,
    email: user.googleEmail,
    photo: user.googlePhoto,
    nickname: user.nickname
  }
}

/**
 * isTokenValid: boolean
 */
export function mMe(isTokenValid) {
  return {
    isTokenValid: isTokenValid
  };
}
