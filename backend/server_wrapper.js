try {
  console.log('--- STARTING SERVER WRAPPER ---');
  require('./server.js');
} catch (err) {
  console.error('SERVER CRASH DETECTED:');
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
}
