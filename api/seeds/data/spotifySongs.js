const parse = require('csv-parse');
const fs = require('fs');

function loadCsv() {
  const csv = fs.readFileSync(__dirname + '/spotify_import.csv', {
    encoding: 'utf-8',
  });

  return new Promise((resolve, reject) => {
    parse(csv, (err, output) => {
      if (err) {
        reject(err);
      } else {
        resolve(output);
      }
    });
  });
}

module.exports = async function createSpotifySongs() {
  const rows = await loadCsv();

  return rows.slice(1).map((row) => {
    return {
      title: row[0],
      artists: [row[1]],
      album: row[2],
      created_at: row[3],
      spotify_id: row[4].split('/').slice(-1)[0],
    };
  });
};
