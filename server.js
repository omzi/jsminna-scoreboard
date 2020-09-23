const { response } = require('express');
const express = require('express');
const handlebars = require('hbs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'handlebars');

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
})

require('isomorphic-fetch');

fetch('https://jsmx-leaderboard.herokuapp.com/leaderboard/results.json')
	.then(res => res.json())
	.then(data => {
		console.log(data);
  })
  .catch((error) => {
    throw new Error(error);
  })