# preparing a libgen dump to teatime

1. spin up the database using `docker-compose up`
2. install JS dependencies with `npm install`
3. start the migration `node migrate.js` - it will take some time
4. process the SQLite file using `process.sql`
5. create a new directory to hold the splitted db `mkdir db`
6. split the DB and create a config using `create.db results.db db` (the script is from the sql.js-httpvfs project)
