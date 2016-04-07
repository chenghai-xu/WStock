var path       = require('path');

var settings = {
  users       : "sqlite:./data/users.db?debug=false",
  notes       : "sqlite:./data/notes.db?debug=false",
  quotes      : "sqlite:./data/quotes.db?debug=false"
};

module.exports = settings;
