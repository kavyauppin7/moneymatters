# 💰 MoneyMatters - Smart Expense Tracker

A modern, full-stack expense tracking application built with Next.js, MongoDB, and React. Track your finances with automatic categorization, shared budgets, detailed analytics, and professional PDF reports.

![MoneyMatters Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)

## ✨ Features

### 🎯 Core Functionality
- **Smart Expense Tracking** - Add, edit, and categorize transactions
- **Automatic Categorization** - AI-powered expense categorization
- **Income & Expense Management** - Track both income and expenses
- **Real-time Analytics** - Interactive charts and financial insights

### 📊 Analytics & Reporting
- **Professional PDF Reports** - Generate detailed monthly financial reports
- **Interactive Charts** - Income vs expenses, category breakdowns
- **Financial Insights** - AI-powered spending analysis and recommendations
- **Monthly Trends** - Track financial performance over time

### 👥 Collaboration
- **Shared Budgets** - Collaborate with family or roommates
- **Role-based Access** - Owner, admin, and member roles
- **Budget Invitations** - Invite users via email

### 🔐 Security & Authentication
- **JWT Authentication** - Secure user authentication
- **Password Hashing** - bcrypt password security
- **Protected Routes** - Secure API endpoints
- **User Sessions** - Persistent login sessions

### 🎨 Modern UI/UX
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Theme** - Theme switching support
- **Modern Components** - Built with Radix UI and Tailwind CSS
- **Smooth Animations** - Polished user experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/moneymatters.git
   cd moneymatters
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moneymatters
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id (optional)
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret (optional)
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
moneymatters/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── transactions/         # Transaction CRUD
│   │   ├── analytics/            # Analytics endpoints
│   │   ├── budgets/              # Budget management
│   │   └── reports/              # PDF report generation
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Main dashboard
│   └── layout.tsx                # Root layout
├── components/                   # React Components
│   ├── ui/                       # Reusable UI components
│   ├── auth/                     # Authentication forms
│   ├── analytics/                # Charts and analytics
│   ├── transactions/             # Transaction management
│   ├── budgets/                  # Budget components
│   └── reports/                  # Report components
├── lib/                          # Utilities and configurations
│   ├── auth-context.tsx          # Authentication context
│   ├── pdf-generator.tsx         # PDF report generator
│   └── utils.ts                  # Helper functions
├── api/                          # Backend utilities (legacy)
│   ├── db/                       # Database connection
│   ├── middleware/               # Auth middleware
│   └── models/                   # Data models
└── styles/                       # Global styles
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js
- **Database**: MongoDB with native driver
- **Authentication**: JWT + bcrypt
- **PDF Generation**: React PDF
- **API**: Next.js API Routes

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Build Tool**: Next.js (Turbopack)

## 📱 API Documentation

### Authentication Endpoints
```
POST /api/auth/signup     # Create new user account
POST /api/auth/signin     # User login
POST /api/auth/google     # Google OAuth login
```

### Transaction Endpoints
```
GET    /api/transactions           # Get user transactions
POST   /api/transactions           # Create new transaction
PUT    /api/transactions/[id]      # Update transaction
DELETE /api/transactions/[id]      # Delete transaction
```

### Analytics Endpoints
```
GET /api/analytics/summary         # Monthly financial summary
GET /api/analytics/monthly-trend   # Multi-month trend data
```

### Budget Endpoints
```
GET  /api/budgets                  # Get user budgets
POST /api/budgets                  # Create new budget
POST /api/budgets/[id]/invite      # Invite user to budget
```

### Reports Endpoints
```
GET /api/reports/monthly           # Generate PDF report
```

## 🎨 Features in Detail

### Professional PDF Reports
- **Comprehensive Analysis**: Income, expenses, net income, transaction count
- **Visual Elements**: Progress bars for category spending
- **Financial Insights**: AI-powered recommendations and analysis
- **Professional Design**: Corporate-style layout with proper branding
- **Detailed Breakdown**: Transaction tables, daily spending patterns

### Smart Analytics
- **Real-time Charts**: Interactive income vs expense charts
- **Category Breakdown**: Pie charts showing spending distribution
- **Trend Analysis**: Multi-month financial trends
- **Performance Metrics**: Key financial indicators

### Collaborative Budgets
- **Multi-user Support**: Share budgets with family or roommates
- **Role Management**: Owner, admin, and member permissions
- **Email Invitations**: Invite users via email addresses
- **Access Control**: Secure budget sharing

## 🔧 Configuration

### Database Setup
1. Create a MongoDB Atlas cluster
2. Create a database named `moneymatters`
3. Collections will be created automatically:
   - `users` - User accounts
   - `transactions` - Financial transactions
   - `budgets` - Shared budgets

### Environment Variables
```env
# Required
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Optional (for Google OAuth)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```


### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/geeky-rish/moneymatters/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers 



*MoneyMatters - Take control of your finances with smart expense tracking*