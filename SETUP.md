# AYCE Management System

All You Can Eat Restaurant Management System - A comprehensive web-based solution for managing All You Can Eat restaurants in Thailand.

## 🚀 Features

### Customer Features
- **QR Code Access**: Customers scan QR codes to access the menu
- **Digital Menu**: Browse menu items organized by categories
- **Easy Ordering**: Add items to cart and place orders directly from mobile devices
- **Real-time Updates**: Order status updates in real-time

### Staff Features
- **Dashboard**: Real-time metrics for sales, customers, and table status
- **Table Management**: View all tables with occupancy status
- **Seat Assignment**: Quick seat assignment with tier selection
- **Order Management**: View and manage customer orders

### Admin Features
- **Menu Management**: Add, edit, and manage menu items
- **Analytics Dashboard**: Detailed insights with charts and graphs
- **Tier Management**: Configure pricing tiers
- **Performance Metrics**: Track revenue, customer preferences, and peak hours

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd AYCE-Management
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Start with Docker Compose**
```bash
docker-compose up -d --build
```

This will start:
- PostgreSQL database on port 5432
- Next.js application on port 3000

5. **Initialize the database**
```bash
npm run db:init
```

6. **Access the application**
- Main page: http://localhost:3000
- Staff Login: http://localhost:3000/staff/login
- Menu (demo): http://localhost:3000/menu/demo-session

## 👤 Demo Credentials

### Staff Account
- Username: `staff`
- Password: `staff123`

### Admin Account
- Username: `admin`
- Password: `admin123`

## 📱 Pages Overview

### Customer Pages
- `/menu/[sessionId]` - Menu and ordering interface (QR code accessible)

### Staff/Admin Pages
- `/staff/login` - Authentication page
- `/staff/dashboard` - Main dashboard with metrics
- `/staff/tables` - Table layout and management
- `/staff/menu` - Menu item management
- `/staff/analytics` - Analytics and reporting

## 🗃️ Database Schema

The system uses PostgreSQL with the following main tables:
- `restaurant_tables` - Table information and layout
- `tiers` - Pricing tiers (buffet prices)
- `menu_items` - Menu items and categories
- `sessions` - Customer dining sessions
- `orders` - Customer orders
- `session_logs` - Analytics data

## 🔄 API Endpoints

- `POST /api/auth/login` - Staff/admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Check current session
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/tables` - Get all tables with status
- `POST /api/tables` - Create new session
- `GET /api/tiers` - Get active pricing tiers
- `GET /api/menu` - Get menu items
- `POST /api/orders` - Place order
- `GET /api/analytics` - Get analytics data

## 🎨 Design

The application features a clean, minimal design with:
- Red color scheme (#EF4444) for primary actions
- Responsive layout for mobile and desktop
- Real-time updates for table status
- Easy-to-use interface for staff and customers

## 📦 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── menu/              # Customer menu pages
│   ├── staff/             # Staff/admin pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utilities and helpers
│   ├── db.ts             # Database connection
│   ├── database.ts       # Database queries
│   ├── auth.ts           # Authentication
│   └── types.ts          # TypeScript types
├── init-scripts/         # Database initialization
└── public/               # Static assets
```

## 🔐 Security Notes

- Session-based authentication (in production, use secure session store like Redis)
- Environment variables for sensitive data
- HTTPS recommended for production
- Password hashing recommended (currently using plain text for demo)

## 🚀 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📝 Environment Variables

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
DB_NAME=ayce_db
SESSION_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is for educational purposes.

## 📞 Support

For issues and questions, please open an issue in the repository.
