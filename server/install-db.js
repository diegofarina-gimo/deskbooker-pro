
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function installDatabase() {
  console.log('=== Database Installation ===');
  
  try {
    // Get database credentials from user
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'host',
        message: 'Database host:',
        default: process.env.DB_HOST || 'localhost',
      },
      {
        type: 'input',
        name: 'user',
        message: 'Database username:',
        default: process.env.DB_USER || 'root',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Database password:',
        default: process.env.DB_PASSWORD || '',
      },
      {
        type: 'input',
        name: 'database',
        message: 'Database name:',
        default: process.env.DB_NAME || 'booking_app',
      },
    ]);

    // Create connection without database
    const connection = await mysql.createConnection({
      host: answers.host,
      user: answers.user,
      password: answers.password,
    });

    // Create database if it doesn't exist
    console.log(`Creating database ${answers.database} if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${answers.database}`);

    // Switch to the database
    await connection.query(`USE ${answers.database}`);

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    console.log('Importing database schema...');
    for (const statement of statements) {
      await connection.query(statement);
    }

    // Update .env file with new credentials
    const envPath = path.join(__dirname, '.env');
    let envContent;
    
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (err) {
      // Create .env file if it doesn't exist
      envContent = `PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=booking_app
JWT_SECRET=${require('crypto').randomBytes(32).toString('hex')}`;
    }

    // Update env variables
    envContent = envContent
      .replace(/DB_HOST=.*$/m, `DB_HOST=${answers.host}`)
      .replace(/DB_USER=.*$/m, `DB_USER=${answers.user}`)
      .replace(/DB_PASSWORD=.*$/m, `DB_PASSWORD=${answers.password}`)
      .replace(/DB_NAME=.*$/m, `DB_NAME=${answers.database}`);

    // Write updated .env file
    fs.writeFileSync(envPath, envContent);

    console.log('Database installation successful!');
    console.log(`.env file updated with database credentials.`);

    await connection.end();
  } catch (error) {
    console.error('Error installing database:', error.message);
    console.error('Please check your database credentials and try again.');
    process.exit(1);
  }
}

// Run the installation
installDatabase();
