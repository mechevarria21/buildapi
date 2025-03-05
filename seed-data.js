
const sqlite3 = require('sqlite3').verbose();

// Create database connection
const db = new sqlite3.Database('./aggregates.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  
  console.log('Connected to the aggregates database.');
  
  // Sample aggregates data
  const sampleAggregates = [
    {
      name: 'Sand (Fine)',
      looseDensity: 1450,
      compactedDensity: 1650,
      category: 'Fine Aggregate'
    },
    {
      name: 'Gravel (20mm)',
      looseDensity: 1520,
      compactedDensity: 1750,
      category: 'Coarse Aggregate'
    },
    {
      name: 'Recycled Concrete',
      looseDensity: 1350,
      compactedDensity: 1580,
      category: 'Recycled Material'
    },
    {
      name: 'Limestone (Crushed)',
      looseDensity: 1400,
      compactedDensity: 1700,
      category: 'Base Material'
    },
    {
      name: 'River Rock',
      looseDensity: 1550,
      compactedDensity: 1800,
      category: 'Decorative Aggregate'
    }
  ];
  
  // Insert sample data
  console.log('Adding sample aggregates...');
  
  // Use a transaction for bulk insert
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    const stmt = db.prepare(
      'INSERT INTO Aggregates (name, looseDensity, compactedDensity, category) VALUES (?, ?, ?, ?)'
    );
    
    sampleAggregates.forEach(aggregate => {
      stmt.run(
        aggregate.name,
        aggregate.looseDensity,
        aggregate.compactedDensity,
        aggregate.category
      );
    });
    
    stmt.finalize();
    
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('Error committing transaction:', err.message);
      } else {
        console.log('Sample data added successfully!');
      }
      
      // Close the database connection
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        }
        console.log('Database connection closed.');
      });
    });
  });
});
