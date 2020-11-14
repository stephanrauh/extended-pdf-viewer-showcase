const express = require('express');
const helmet = require("helmet");
var path = require('path');

const app = express();
const port = 4200;

app.use(helmet());
app.use(express.static(__dirname + '/'));

app.get('*', function (req, res, next) {
  res.sendFile(path.resolve('index.html'));
});

app.listen(port, () => {
  console.log('');
  console.log(` Listening at http://localhost:${port}`)
  console.log(' Press CTRL-C to stop');
  console.log('');
});
