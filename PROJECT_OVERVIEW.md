# All You Can Eat Restaurant Management System

## 1. Background & Target Users

This project focuses on improving operational and business efficiency for All You Can Eat restaurants in Thailand. It is designed for SMEs, small-scale SMEs, and entrepreneurs who want more control over their restaurant management.

## 2. Problem Overview

Many restaurants currently depend on prefab management systems that restrict customization. Table layouts are difficult to adjust, which makes it challenging to scale seating capacity or respond to peak hours. Staff also struggle to track dining times per table, leading to service delays and inefficiencies.

From a business perspective, owners lack detailed insights into branch performance. Without accurate customer and sales data, decisions related to stock management and investment are often based on guesswork rather than real metrics. This makes it hard to determine which branches are profitable or need improvement.

## 3. Proposed Solution

This project proposes a centralized web-based management system tailored specifically to All You Can Eat operations. The system allows each restaurant branch to design and update its dining layout in just a few taps. Staff can assign customer seats quickly, while a real-time dining countdown helps manage turnaround times.

Food ordering becomes more efficient with QR codes unique to each table. Customers can browse menus and order from their phones, reducing wait time and workload for staff. Owners gain access to an analytics dashboard that highlights customer volume, preferred pricing, customer demographics, and time-based trends for smarter decision-making.

## 4. Key Features

| Feature | Description |
|---------|-------------|
| Flexible Table Management | Easily add, remove, or resize tables to match real-time demand |
| Smart Seating Assignment & QR Orders | Assign seats and generate QR codes for direct customer ordering |
| Menu Configuration | Manage menu items, pricing options, and stock availability |
| Data Analytics Dashboard | Track customer activity, performance metrics, and branch profitability |

## 5. Benefits

This solution enhances service speed, improves customer flow management and enables data-driven growth strategies. It empowers restaurant owners to evaluate performance and make informed investment decisions while improving the overall dining experience.

---

## System Roles & Access

### Customer Role
- **Access Method**: Can only access website through QR code generated after getting a seat
- **Functionality**: 
  - View menu and place orders
  - Order system similar to typical All You Can Eat websites in Thailand
  - No login required

### Staff Role
- **Access Method**: Must login to system
- **Dashboard Access**:
  - Real-time display of free tables
  - Real-time table status view
  - Current amount of active customers
  - Other useful operational metrics
  
- **Pages**:
  1. **Table Management Page**:
     - View which seats are occupied with start/end times
     - See how many tables are free
     - Assign seats to customers
     - Select food tier for customers
     - Process check bill requests
     - Show estimated queue wait time when all tables are full

### Admin Role
- **Access Method**: Must login to system
- **All Staff Capabilities**: Can perform all staff functions
- **Dashboard Access**: Same as staff + additional metrics
  
- **Additional Pages**:
  1. **Table Management (Enhanced)**:
     - Adjust table positions and layout
     - Configure amount of customers each table can handle
     - All staff table management features
  
  2. **Menu and Tier Management**:
     - **Menu Management**:
       - Add new menu items
       - Edit existing menu items
       - Delete menu items
       - Disable/Enable menu items
     - **Tier Management**:
       - Add new pricing tiers
       - Edit existing tiers
       - Disable/Enable tiers
  
  3. **Analytics Dashboard**:
     - Data visualization with graphs and charts
     - Date range selection for reports
     - Key metrics:
       - Revenue per customer in specific date range
       - Customer count trends over time
       - Tier preference analysis (which pricing tiers are most popular)
       - Peak hour analysis
       - Table turnover rates
       - Average dining duration
       - Customer demographics
       - Branch performance comparison
       - Additional insights from log table database

---

## Technical Overview

### Technology Stack
- **Frontend**: Next.js, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Containerization**: Docker

### Key Technical Features
- Real-time table status updates
- QR code generation per table
- Session-based customer ordering
- Role-based access control (RBAC)
- Data logging for analytics
- Responsive design for mobile and desktop

---

## Database Structure

The system uses MySQL with the following core tables:
- Tables management (layout, capacity, status)
- Menu items and categories
- Pricing tiers
- Customer sessions
- Orders and order items
- Staff and admin accounts
- Activity logs for analytics

---

## Project Goals

1. **Operational Efficiency**: Streamline table management and order processing
2. **Customer Experience**: Reduce wait times and improve service quality
3. **Business Intelligence**: Provide actionable insights through data analytics
4. **Scalability**: Support multiple branches with centralized management
5. **Customization**: Allow flexible configuration to meet specific business needs
