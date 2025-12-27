const express = require('express');

const app = express();
const PORT = process.env.PORT;

const expressWs = require('express-ws')(app);

app.use(express.json());

const routes = require('./routes');
app.use(routes);

// As our server to listen for incoming connections
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));