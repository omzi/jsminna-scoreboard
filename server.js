const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.listen(PORT, () => console.log(`Server started on ${PORT}`));

require('isomorphic-fetch');

app.get('/results.json', (req, res) => {
  fetch("https://jsmx-leaderboard.herokuapp.com/leaderboard/results.json")
    .then(res => res.json())
    .then((data) => {
      res.status(200).send(data)
    })
    .catch((error) => {
      res.status(500).send({ code: 500, errorType: error.name })
    })
})

app.use((req, res, next) => {
  res.status(404).end(fs.readFileSync(path.join(__dirname, '/public/404.html'), { encoding: 'utf8' }))
})