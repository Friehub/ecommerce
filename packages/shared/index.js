const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist/index.js'))) {
  module.exports = require('./dist/index.js');
} else {
  module.exports = require('./src/index.ts');
}
