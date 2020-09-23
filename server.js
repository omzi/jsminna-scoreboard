const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
})

require('isomorphic-fetch');

app.get('/results.json', (req, res) => {
  fetch('https://jsmx-leaderboard.herokuapp.com/leaderboard/results.json')
	.then(response => response.json())
	.then(data => {
    res.status(200);
    res.send(data);
  })
  .catch((error) => {
    res.status(500);
    res.send({
      code: 500,
      errorType: error.name,
      errorMessage: error.name + ' : ' + error.message
    })
  })
})

app.use((req, res, next) => {
  res.status(404).render(__dirname + '/public/404.html')
})