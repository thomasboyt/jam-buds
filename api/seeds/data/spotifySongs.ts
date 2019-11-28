import parse from 'csv-parse';
import * as fs from 'fs';

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

interface SongRow {
  title: string;
  artists: string[];
  album: string;
  created_at: string;
  spotify_id: string;
}

export async function getSpotifySongs(): Promise<SongRow[]> {
  const rows = await loadCsv();

  if (!Array.isArray(rows)) {
    throw new Error(`invalid spotify songs csv: ${rows}`);
  }

  return rows.slice(1).map((row) => {
    return {
      title: row[0],
      artists: [row[1]],
      album: row[2],
      created_at: row[3],
      spotify_id: row[4].split('/').slice(-1)[0],
    };
  });
}
