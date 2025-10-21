const { AppDataSource } = require('../dist/data-source');

async function initDB() {
  try {
    // Temporarily modify synchronize to create tables
    AppDataSource.options.synchronize = true;
    await AppDataSource.initialize();
    console.log('Database initialized successfully');
    await AppDataSource.destroy();
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

initDB();
