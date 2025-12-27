const jwt = require('jsonwebtoken');

const TOKEN_COOKIE_NAME = "TapeTrackToken";

const API_SECRET = process.env.API_SECRET_KEY
if (!API_SECRET) {
  throw new Error(
    "API_SECRET_KEY environment variable is not defined. Authentication cannot work."
  );
}

exports.TokenMiddleware = (req, res, next) => {
  // We will look for the token in two places:
  // 1. A cookie in case of a browser
  // 2. The Authorization header in case of a different client
  let token = null;
  if(req.cookies[TOKEN_COOKIE_NAME]) { //We do have a cookie with a token
    token = req.cookies[TOKEN_COOKIE_NAME]; //Get token from cookie
  }
  else { //No cookie, so let's check Authorization header
    const authHeader = req.get('Authorization');
    if(authHeader && authHeader.startsWith("Bearer ")) {
      //Format should be "Bearer token" but we only need the token
      token = authHeader.split(" ")[1].trim();
    }
  }
  
  

  if(!token) { // If we don't have a token
    res.status(401).json({error: 'Not authenticated'});
    return;
  }

  try {
    const decodedPayload = jwt.verify(token, API_SECRET);
    req.user = decodedPayload.user;
    next(); //Make sure we call the next middleware
  }
  catch(err) { //Token is invalid
    res.status(401).json({error: 'Not authenticated'});
    return;
  }


}

exports.generateToken = (req, res, user) => {
  let payload = {
    user: user,
    // Use the exp registered claim to expire token in 1 hour
    exp: Math.floor(Date.now() / 1000) + (60 * 60)
  }

  const token = jwt.sign(payload, API_SECRET);

  //send token in cookie to client
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 1000 // Session expires in 1 hour
  });
};


exports.removeToken = (req, res) => {
  //send session ID in cookie to client
  res.cookie(TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    maxAge: -360000 //A date in the past
  });
};

