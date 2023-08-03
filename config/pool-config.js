const { Pool } = require('pg');
module.exports = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Amiwitos_bbdd',
    password: 'Ch1c2l3t4',
    port: 5432,
  });