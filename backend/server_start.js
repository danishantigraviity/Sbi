// server_start.js
console.log('--- STARTING SERVER BOOTSTRAP ---');
try {
  require('./server.js');
  console.log('--- SERVER LOADED SUCCESSFULLY ---');
} catch (e) {
  console.error('--- BOOTSTRAP FAILED ---');
  console.error(e.message);
  console.error(e.stack);
  process.exit(1);
}
