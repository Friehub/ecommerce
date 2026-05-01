const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist/api/index.js'))) {
  module.exports = require('./dist/api/index.js');
} else {
  module.exports = require('./index.ts');
}
