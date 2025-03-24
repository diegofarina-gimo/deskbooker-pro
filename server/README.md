
# Booking App - Local Setup

This folder contains the local server setup for running the booking app with a MySQL/MariaDB database instead of Supabase.

## Prerequisites

- Node.js (v14+)
- MySQL or MariaDB installed locally
- npm or yarn

## Setup Instructions

1. **Install MySQL/MariaDB**

   Follow the installation instructions for your operating system:
   - [MySQL](https://dev.mysql.com/downloads/)
   - [MariaDB](https://mariadb.org/download/)

2. **Create the database**

   Log in to MySQL/MariaDB and run the schema.sql file:
   ```bash
   mysql -u root -p < schema.sql
   ```
   
   Alternatively, you can copy-paste the contents of schema.sql into a MySQL client.

3. **Configure environment variables**

   Update the `.env` file with your database credentials:
   ```
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your-password
   DB_NAME=booking_app
   JWT_SECRET=your-secret-jwt-key-change-this-in-production
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Start the server**

   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Update frontend to use local API**

   The React app has been configured to use this local API instead of Supabase. Make sure the API_URL in src/integrations/api/client.ts points to your local server (default: http://localhost:3001).

## API Endpoints

- **Authentication**
  - POST `/auth/login` - Log in with email and password
  - POST `/auth/register` - Register a new user
  - POST `/auth/setup-test-user` - Create a test admin user

- **Data**
  - GET `/resources` - Get all desk and meeting room resources
  - GET `/maps` - Get all floor maps
  - GET `/bookings` - Get all bookings
  - GET `/teams` - Get all teams
  - GET `/profiles` - Get all user profiles

## Note

This is a simplified local setup meant for development and testing. For production use, you would need to:

1. Add more security measures (rate limiting, input validation, etc.)
2. Add more robust error handling
3. Optimize database queries
4. Add proper logging
5. Set up proper database migration tools
