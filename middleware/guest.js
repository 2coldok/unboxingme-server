import { v4 as uuidv4 } from 'uuid';

export function assignGuestId(req, res, next) {
  console.log('---cookies---');
  console.log(req.cookies);
  console.log('-------------');
  if (!req.cookies.guestId) {
    const guestId = uuidv4();

    res.cookie('guestId', guestId, {
      maxAge: 5 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    req.guestId = guestId;
    return next();
  }

  req.guestId = req.cookies.guestId;
  return next();
}
