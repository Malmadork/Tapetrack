const express = require('express');
const router = express.Router();

const apiRouter = require('./APIRoutes');
const websocketRouter = require('./websocket/WebSocketRoutes')

router.use('/', apiRouter);
router.use('/', websocketRouter);

module.exports = router;