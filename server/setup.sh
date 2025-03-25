
#!/bin/bash
set -e

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Booking App On-Premises Setup ===${NC}"
echo "This script will set up the application for local use."

# Check for Node.js
echo -e "\n${YELLOW}Checking for Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js (v14 or higher) and try again.${NC}"
    echo "Visit https://nodejs.org/ to download and install Node.js."
    exit 1
fi

# Display Node.js version
NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js is installed (${NODE_VERSION})${NC}"

# Check for npm
echo -e "\n${YELLOW}Checking for npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

# Display npm version
NPM_VERSION=$(npm -v)
echo -e "${GREEN}npm is installed (${NPM_VERSION})${NC}"

# Check for MySQL/MariaDB
echo -e "\n${YELLOW}Checking for MySQL/MariaDB...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}MySQL/MariaDB CLI is not installed or not in PATH.${NC}"
    echo "Please install MySQL (https://dev.mysql.com/downloads/) or MariaDB (https://mariadb.org/download/)."
    echo -e "${YELLOW}You'll need to manually create the database using the schema.sql file.${NC}"
    DB_MANUAL=true
else
    echo -e "${GREEN}MySQL/MariaDB CLI is installed${NC}"
    DB_MANUAL=false
fi

# Install server dependencies
echo -e "\n${YELLOW}Installing server dependencies...${NC}"
cd "$(dirname "$0")"
npm install
echo -e "${GREEN}Server dependencies installed successfully${NC}"

# Install client dependencies
echo -e "\n${YELLOW}Installing client dependencies...${NC}"
cd ..
npm install
echo -e "${GREEN}Client dependencies installed successfully${NC}"

# Create .env file if it doesn't exist
echo -e "\n${YELLOW}Setting up environment configuration...${NC}"
cd server
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOL
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=booking_app
JWT_SECRET=$(openssl rand -hex 32)
EOL
    
    echo -e "${GREEN}.env file created${NC}"
    echo -e "${YELLOW}Please edit the .env file to set your database credentials:${NC}"
    echo -e "  ${YELLOW}server/.env${NC}"
else
    echo -e "${GREEN}.env file already exists${NC}"
fi

# Database setup instructions
if [ "$DB_MANUAL" = true ]; then
    echo -e "\n${YELLOW}Database Setup Instructions:${NC}"
    echo "1. Create a database named 'booking_app' in your MySQL/MariaDB server"
    echo "2. Run the schema.sql file to create the tables:"
    echo "   mysql -u your_username -p booking_app < schema.sql"
    echo -e "3. Update the .env file with your database credentials"
else
    echo -e "\n${YELLOW}Would you like to set up the database now? (y/n)${NC}"
    read -p "Choice: " setup_db

    if [ "$setup_db" = "y" ] || [ "$setup_db" = "Y" ]; then
        echo -e "\n${YELLOW}Please enter your MySQL/MariaDB credentials:${NC}"
        read -p "Username (default: root): " db_user
        db_user=${db_user:-"root"}
        
        read -sp "Password: " db_password
        echo ""
        
        # Create database and tables
        echo -e "\n${YELLOW}Creating database and tables...${NC}"
        
        # Try to create the database and import schema
        if mysql -u "$db_user" ${db_password:+-p"$db_password"} -e "CREATE DATABASE IF NOT EXISTS booking_app;" && \
           mysql -u "$db_user" ${db_password:+-p"$db_password"} booking_app < schema.sql; then
            
            # Update .env file with user provided credentials
            sed -i.bak "s/DB_USER=root/DB_USER=$db_user/" .env
            if [ -n "$db_password" ]; then
                sed -i.bak "s/DB_PASSWORD=/DB_PASSWORD=$db_password/" .env
            fi
            rm -f .env.bak
            
            echo -e "${GREEN}Database set up successfully${NC}"
        else
            echo -e "${RED}Failed to set up database.${NC}"
            echo "Please manually run the database setup:"
            echo "1. Create a database named 'booking_app'"
            echo "2. Import schema.sql into the database:"
            echo "   mysql -u your_username -p booking_app < schema.sql"
            echo "3. Update the .env file with your credentials"
        fi
    else
        echo -e "${YELLOW}Please set up the database manually:${NC}"
        echo "1. Create a database named 'booking_app'"
        echo "2. Import schema.sql into the database:"
        echo "   mysql -u your_username -p booking_app < schema.sql"
        echo "3. Update the .env file with your credentials"
    fi
fi

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}To start the application:${NC}"
echo "1. Start the server: cd server && npm run dev"
echo "2. In a separate terminal, start the client: npm run dev"
echo -e "\nYou can also use the provided start.sh script to start both the server and client at once."

# Make the start script executable
chmod +x start.sh 2>/dev/null || true

echo -e "\n${GREEN}Thank you for installing the Booking App!${NC}"
