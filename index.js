const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Build API',
      description: 'API for managing construction aggregate materials',
      version: '1.0.0',
      contact: {
        name: 'API Support'
      },
      servers: [{
        url: `http://0.0.0.0:${port}`
      }]
    }
  },
  apis: ['index.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
// Configure CORS - adjust allowed origins as needed
const corsOptions = {
  origin: '*', // Allow all origins, or specify your client domains: ['https://example.com', 'https://app.example.com']
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Create database connection
const db = new sqlite3.Database('./aggregates.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the aggregates database.');
    
    // Create table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS Aggregates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      looseDensity REAL,
      compactedDensity REAL,
      category TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Aggregates table ready');
      }
    });
  }
});

// CRUD Endpoints

/**
 * @swagger
 * components:
 *   schemas:
 *     Aggregate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the aggregate
 *         name:
 *           type: string
 *           description: The name of the aggregate material
 *         looseDensity:
 *           type: number
 *           description: The loose density of the aggregate (kg/m³)
 *         compactedDensity:
 *           type: number
 *           description: The 95% compacted density of the aggregate (kg/m³)
 *         category:
 *           type: string
 *           description: The category of the aggregate (e.g., Base Material, Fine Aggregate)
 *       example:
 *         id: 1
 *         name: Crushed Stone
 *         looseDensity: 1450
 *         compactedDensity: 1650
 *         category: Base Material
 */

/**
 * @swagger
 * /api/aggregates:
 *   get:
 *     summary: Returns the list of all aggregates
 *     tags: [Aggregates]
 *     responses:
 *       200:
 *         description: The list of aggregates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Aggregate'
 *       500:
 *         description: Internal server error
 */
app.get('/api/aggregates', (req, res) => {
  db.all('SELECT * FROM Aggregates', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/aggregates/{id}:
 *   get:
 *     summary: Get an aggregate by id
 *     tags: [Aggregates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The aggregate id
 *     responses:
 *       200:
 *         description: The aggregate description
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aggregate'
 *       404:
 *         description: The aggregate was not found
 *       500:
 *         description: Internal server error
 */
app.get('/api/aggregates/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM Aggregates WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Aggregate not found' });
    }
    res.json(row);
  });
});

/**
 * @swagger
 * /api/aggregates:
 *   post:
 *     summary: Create a new aggregate
 *     tags: [Aggregates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the aggregate
 *               looseDensity:
 *                 type: number
 *                 description: The loose density of the aggregate
 *               compactedDensity:
 *                 type: number
 *                 description: The 95% compacted density of the aggregate
 *               category:
 *                 type: string
 *                 description: The category of the aggregate
 *     responses:
 *       201:
 *         description: The aggregate was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aggregate'
 *       400:
 *         description: Aggregate name is required
 *       500:
 *         description: Internal server error
 */
app.post('/api/aggregates', (req, res) => {
  const { name, looseDensity, compactedDensity, category } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Aggregate name is required' });
  }
  
  db.run(
    'INSERT INTO Aggregates (name, looseDensity, compactedDensity, category) VALUES (?, ?, ?, ?)',
    [name, looseDensity, compactedDensity, category],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json({ 
        id: this.lastID,
        name, 
        looseDensity, 
        compactedDensity, 
        category 
      });
    }
  );
});

/**
 * @swagger
 * /api/aggregates/{id}:
 *   put:
 *     summary: Update an aggregate by id
 *     tags: [Aggregates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The aggregate id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the aggregate
 *               looseDensity:
 *                 type: number
 *                 description: The loose density of the aggregate
 *               compactedDensity:
 *                 type: number
 *                 description: The 95% compacted density of the aggregate
 *               category:
 *                 type: string
 *                 description: The category of the aggregate
 *     responses:
 *       200:
 *         description: The aggregate was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aggregate'
 *       400:
 *         description: Aggregate name is required
 *       404:
 *         description: Aggregate not found
 *       500:
 *         description: Internal server error
 */
app.put('/api/aggregates/:id', (req, res) => {
  const id = req.params.id;
  const { name, looseDensity, compactedDensity, category } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Aggregate name is required' });
  }
  
  db.run(
    'UPDATE Aggregates SET name = ?, looseDensity = ?, compactedDensity = ?, category = ? WHERE id = ?',
    [name, looseDensity, compactedDensity, category, id],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Aggregate not found' });
      }
      
      res.json({ 
        id: parseInt(id), 
        name, 
        looseDensity, 
        compactedDensity, 
        category 
      });
    }
  );
});

/**
 * @swagger
 * /api/aggregates/{id}:
 *   delete:
 *     summary: Delete an aggregate by id
 *     tags: [Aggregates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The aggregate id
 *     responses:
 *       200:
 *         description: Aggregate deleted successfully
 *       404:
 *         description: Aggregate not found
 *       500:
 *         description: Internal server error
 */
app.delete('/api/aggregates/:id', (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM Aggregates WHERE id = ?', [id], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Aggregate not found' });
    }
    
    res.status(200).json({ message: 'Aggregate deleted successfully' });
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Construction Aggregates API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
          }
          h1, h2 {
            color: #333;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          }
          .button:hover {
            background-color: #45a049;
          }
          code {
            background-color: #f4f4f4;
            padding: 2px 5px;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <h1>Construction Aggregates API</h1>
        <p>Your API for managing construction aggregate materials is running successfully.</p>
        <h2>Available Endpoints:</h2>
        <ul>
          <li><code>GET /api/aggregates</code> - List all aggregates</li>
          <li><code>GET /api/aggregates/:id</code> - Get a specific aggregate</li>
          <li><code>POST /api/aggregates</code> - Create a new aggregate</li>
          <li><code>PUT /api/aggregates/:id</code> - Update an existing aggregate</li>
          <li><code>DELETE /api/aggregates/:id</code> - Delete an aggregate</li>
        </ul>
        <a href="/api-docs" class="button">View API Documentation</a>
      </body>
    </html>
  `);
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});

// Handle application shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    process.exit(0);
  });
});
