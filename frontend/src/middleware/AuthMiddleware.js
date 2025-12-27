const cookie_token = "TapeTrackToken";

exports.AuthMiddleware = (req, res, next) => {

  req.cookies[cookie_token] ? res.locals.authenticated = true : res.locals.authenticated = false;

  next();
}