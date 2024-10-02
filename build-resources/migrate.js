const mysql = require("mysql2");
const sqlite3 = require("sqlite3").verbose();

const batchSize = 1000; // Set batch size
let offset = 0;

// MySQL connection
const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "PASSWORD",
  database: "mydatabase",
});

// SQLite connection
const sqliteDb = new sqlite3.Database("results.db");

// Create the table in SQLite (if not exists)
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    year INTEGER,
    lang TEXT,
    size INTEGER,
    ext TEXT,
    md5 TEXT,
    ipfs_cid TEXT
  );
`;

sqliteDb.run(createTableQuery, (err) => {
  if (err) throw err;

  // Fetch and save data in batches
  fetchAndSaveBatch();
});

function fetchAndSaveBatch() {
  // Query to fetch data in batches
  const query = `
    SELECT u.ID,
           u.Title,
           u.Author,
           u.Year,
           u.Language,
           u.Filesize,
           u.Extension,
           u.MD5,
           h.ipfs_cid
    FROM updated u
    LEFT JOIN hashes h ON u.MD5 = h.md5
    LIMIT ${batchSize} OFFSET ${offset}
  `;

  mysqlConnection.query(query, (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      const insertQuery = `
        INSERT INTO books (title, author, year, lang, size, ext, md5, ipfs_cid)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      results.forEach((row) => {
        sqliteDb.run(
          insertQuery,
          [
            row.Title,
            row.Author,
            row.Year,
            row.Language,
            row.Filesize,
            row.Extension,
            row.MD5,
            row.ipfs_cid,
          ],
          (err) => {
            if (err) throw err;
          },
        );
      });

      offset += batchSize; // Increase the offset
      console.log(`Batch processed, next offset: ${offset}`);

      // Fetch the next batch
      fetchAndSaveBatch();
    } else {
      // No more data to fetch
      console.log("All data processed");

      // Close connections
      mysqlConnection.end();
      sqliteDb.close((err) => {
        if (err) throw err;
        console.log("SQLite database closed");
      });
    }
  });
}
