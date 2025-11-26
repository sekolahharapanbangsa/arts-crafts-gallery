#!/bin/bash

# PostgreSQL Setup Script for Arts & Crafts Gallery
# This script sets up PostgreSQL for development

echo "🐘 Setting up PostgreSQL for Arts & Crafts Gallery..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Installing..."
    
    # Install PostgreSQL based on OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        sudo apt update
        sudo apt install -y postgresql postgresql-contrib
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install postgresql
            brew services start postgresql
        else
            echo "❌ Please install Homebrew first: https://brew.sh/"
            exit 1
        fi
    else
        echo "❌ Unsupported OS. Please install PostgreSQL manually."
        exit 1
    fi
else
    echo "✅ PostgreSQL is already installed"
fi

# Start PostgreSQL service
echo "🚀 Starting PostgreSQL service..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
elif [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start postgresql
fi

# Create database and user
echo "📊 Creating database and user..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS arts_crafts_gallery;"
sudo -u postgres psql -c "CREATE DATABASE arts_crafts_gallery;"
sudo -u postgres psql -c "DROP USER IF EXISTS arts_user;"
sudo -u postgres psql -c "CREATE USER arts_user WITH PASSWORD 'arts_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE arts_crafts_gallery TO arts_user;"

# Test connection
echo "🔗 Testing database connection..."
if PGPASSWORD=arts_password psql -h localhost -U arts_user -d arts_crafts_gallery -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed!"
    exit 1
fi

echo "🎉 PostgreSQL setup complete!"
echo ""
echo "📋 Your connection details:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: arts_crafts_gallery"
echo "   Username: arts_user"
echo "   Password: arts_password"
echo ""
echo "📝 Update your .env file with:"
echo "   DATABASE_URL=\"postgresql://arts_user:arts_password@localhost:5432/arts_crafts_gallery\""
echo ""
echo "🚀 Now run: npm run db:push"