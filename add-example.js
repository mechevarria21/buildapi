
const sqlite3 = require('sqlite3').verbose();

// Create database connection
const db = new sqlite3.Database('./aggregates.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the aggregates database.');
    
    // Insert an example aggregate
    const exampleAggregate = {
      name: 'Crushed Stone',
      looseDensity: 1450,
      compactedDensity: 1650,
      category: 'Base Material'
    };
    
    db.run(
      'INSERT INTO Aggregates (name, looseDensity, compactedDensity, category) VALUES (?, ?, ?, ?)',
      [exampleAggregate.name, exampleAggregate.looseDensity, exampleAggregate.compactedDensity, exampleAggregate.category],
      function(err) {
        if (err) {
          console.error('Error inserting example aggregate:', err.message);
        } else {
          console.log(`Example aggregate added with ID: ${this.lastID}`);
          
          // Query to show it was inserted
          db.get('SELECT * FROM Aggregates WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
              console.error('Error fetching example:', err.message);
            } else {
              console.log('Added example aggregate:');
              console.log(row);
            }
            
            // Close the database connection
            db.close();
          });
        }
      }
    );
  }
});
