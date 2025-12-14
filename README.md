# AYCE Management System

All You Can Eat Restaurant Management System - A comprehensive web-based solution designed for managing All You Can Eat restaurants in Thailand. This system empowers SMEs and small-scale restaurant entrepreneurs with tools for efficient table management, real-time order processing, and data-driven analytics.

## 🎯 Overview

This system addresses common challenges faced by All You Can Eat restaurants:
- **Flexible Table Management**: Easily adjust table layouts to accommodate peak hours
- **Real-time Operations**: Track dining times, manage customer flow, and handle orders efficiently
- **Data-Driven Insights**: Analytics dashboard for informed business decisions
- **QR Code Ordering**: Customers scan QR codes to browse menus and place orders directly from their phones
- **Multi-role Access**: Separate interfaces for customers, staff, and administrators

## 🚀 Key Features

### For Customers
- Access menu via QR code (no login required)
- Browse menu items organized by categories
- Place orders directly from mobile devices
- View order history for current session

### For Staff
- Real-time dashboard with key metrics (sales, customer count, table status)
- View and manage all tables with occupancy status
- Assign seats to customers with tier selection
- Process customer orders and checkout requests
- Track active dining sessions with countdown timers

### For Administrators
- All staff capabilities plus:
- Configure table layouts (add/remove/resize tables)
- Manage menu items (add, edit, enable/disable)
- Configure pricing tiers
- Analytics dashboard with:
  - Revenue per customer trends
  - Customer count over time
  - Tier preference analysis
  - Peak hour identification
  - Top-selling menu items
  - Payment method breakdown

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Server-side rendering)
- **Database**: PostgreSQL 16
- **Containerization**: Docker & Docker Compose
- **Session Management**: Cookie-based authentication
- **QR Code Generation**: qrcode library

## 📋 Prerequisites

- **Node.js** 20 or higher
- **Docker** and **Docker Compose**
- **npm** or **yarn** package manager

## 🔧 Setup & Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AYCE-Management
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_NAME=

# Next.js Configuration
NEXTCALLBACK=http://localhost:3000
```

**Environment Variables Explained:**
- `DB_USER`: PostgreSQL database username
- `DB_PASSWORD`: PostgreSQL database password
- `DB_HOST`: Database host (use `postgres` for Docker, `localhost` for local development)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name
- `NEXTCALLBACK`: Base URL for the application (used for callbacks and redirects)

### 3. Installation Methods

#### Option A: Docker Deployment (Recommended)

This method automatically sets up PostgreSQL and the Next.js application in containers.

```bash
# Start all services (database + web application)
docker-compose up -d

# Check container status
docker-compose ps

# View application logs
docker-compose logs -f web

# View database logs
docker-compose logs -f postgres
```

The application will be available at `http://localhost:3000`

**Default Admin Account:**
- Username: `admin`
- Password: `admin123`

#### Option B: Local Development

For development without Docker:

```bash
# Install dependencies
npm install

# Update .env file to use localhost for database
# DB_HOST=localhost

# Start PostgreSQL (must be running separately)
# Initialize database
npm run db:setup

# Start development server
npm run dev
```

Access the application at `http://localhost:3000`

## 🗄️ Database Management

### Database Scripts

```bash
# Initialize database schema only
npm run db:init

# Initialize database with sample accounts and data
npm run db:setup

# Run database migrations
npm run db:migrate
```

### Manual Database Access

```bash
# Access PostgreSQL container
docker exec -it ayce-postgres psql -U ayce_user -d ayce_db

# Backup database
docker exec ayce-postgres pg_dump -U ayce_user ayce_db > backup.sql

# Restore database
docker exec -i ayce-postgres psql -U ayce_user -d ayce_db < backup.sql
```

## 🚢 Deployment

### Docker Deployment to Production

1. **Update environment variables** for production in `.env`

2. **Build and deploy:**
```bash
# Build production images
docker-compose build

# Start services in detached mode
docker-compose up -d

# Scale web service (optional)
docker-compose up -d --scale web=3
```

3. **Set up reverse proxy** (nginx recommended) to handle:
   - SSL/TLS certificates
   - Load balancing
   - Static file caching

### Vercel/Cloud Deployment

For deploying the Next.js application to cloud platforms:

1. **Set up external PostgreSQL database** (e.g., Railway, Supabase, AWS RDS)

2. **Update environment variables** with cloud database credentials

3. **Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

4. **Initialize database:**
```bash
# Connect to your cloud database and run init scripts
psql <connection-string> -f init-scripts/AYCE.sql
psql <connection-string> -f init-scripts/seed-accounts.sql
```

## 📱 Usage

### Staff/Admin Login
1. Navigate to `http://localhost:3000/staff/login`
2. Enter credentials
3. Access the dashboard

### Customer Access
1. Staff assigns a table to customers
2. System generates a QR code
3. Customers scan QR code to access menu
4. Customers browse and place orders
5. Staff processes orders and checkout

## 🏗️ Project Structure

```
AYCE-Management/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── accounts/        # Account management
│   │   ├── analytics/       # Analytics data
│   │   ├── auth/           # Authentication
│   │   ├── menu/           # Menu management
│   │   ├── orders/         # Order processing
│   │   ├── tables/         # Table management
│   │   └── tiers/          # Tier management
│   ├── components/         # Reusable components
│   ├── menu/              # Customer menu interface
│   └── staff/             # Staff/admin pages
├── init-scripts/          # Database initialization
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication logic
│   ├── database.ts       # Database queries
│   └── db.ts             # Database connection
├── docker-compose.yml    # Docker configuration
├── Dockerfile           # Docker image definition
└── package.json         # Dependencies

```

## 📊 Documentation

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Detailed project requirements and features
- [FEATURES_IMPLEMENTATION.md](FEATURES_IMPLEMENTATION.md) - Feature implementation details
- [ACCOUNT_MANAGEMENT.md](ACCOUNT_MANAGEMENT.md) - Account and authentication system
- [DATABASE_QUERIES.md](DATABASE_QUERIES.md) - Complete query documentation

## 🔒 Security Notes

- Change default admin credentials immediately after deployment
- Use strong passwords for database and admin accounts
- Keep environment variables secure and never commit `.env` to version control
- Use HTTPS in production
- Regularly update dependencies

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server

# Production
npm run build           # Build for production
npm start              # Start production server

# Database
npm run db:init        # Initialize database schema
npm run db:setup       # Setup database with accounts
npm run db:migrate     # Run migrations

# Code Quality
npm run lint           # Run ESLint
```

## 🤝 Contributing

This is a private project for educational/business purposes. For contributions or suggestions, please contact the project owner.

## 📄 License

Proprietary - All rights reserved

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

### Port Conflicts
If port 3000 or 5432 is already in use, update `docker-compose.yml` to use different ports.

### Reset Database
```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Restart services
docker-compose up -d
```

---

Built with ❤️ for All You Can Eat Restaurant Management