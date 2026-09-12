# SaaSFlow

SaaSFlow is a full-stack SaaS analytics dashboard built to demonstrate modern frontend and backend development practices.

It provides a centralized interface for monitoring customers, subscriptions, revenue, churn, plans, and business activity with role-based access for Admin and Member users.

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

### Backend

- Node.js
- Express.js
- TypeScript
- REST API
- JWT Authentication

### Database

- PostgreSQL
- Prisma ORM

### Development & Deployment

- Git & GitHub
- Vercel
- Render
- Neon PostgreSQL

> The project is designed to run entirely using free-tier or open-source services.

---

## Features

- User registration and login
- JWT-based authentication
- Role-based access control
- SaaS overview dashboard
- Revenue and customer analytics
- Customer management
- Subscription management
- Product plans
- Activity tracking
- Search, filtering, and pagination
- Responsive dashboard UI
- Dark mode
- Loading, error, and empty states
- Realistic seeded demo data

---

## User Roles

### Admin

- Access all dashboard features
- Manage customers
- Manage subscriptions
- Manage team members
- Change user roles
- Manage settings

### Member

- View dashboard
- View customers
- View subscriptions
- View analytics
- View activity
- Cannot perform administrative actions

---

## Project Structure

```text
saas-dashboard/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   └── types/
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── customers/
│   │   │   ├── plans/
│   │   │   ├── subscriptions/
│   │   │   ├── transactions/
│   │   │   ├── analytics/
│   │   │   └── activity/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── config/
│   │
│   └── prisma/
│
└── README.md
```

---

## Main Pages

- `/login`
- `/register`
- `/dashboard`
- `/customers`
- `/customers/:id`
- `/subscriptions`
- `/analytics`
- `/activity`
- `/settings`

---

## API

The backend exposes REST APIs for:

```text
/api/auth
/api/users
/api/customers
/api/plans
/api/subscriptions
/api/transactions
/api/analytics
/api/activity
/api/settings
```

---

## Database

The application uses PostgreSQL with Prisma ORM.

Core entities include:

```text
User
Organization
Customer
Plan
Subscription
Transaction
ActivityLog
```

The project includes seed data to populate the application with realistic SaaS data for development and demonstration.

---

## Authentication & Authorization

SaaSFlow uses JWT-based authentication.

Protected API routes verify the authenticated user before processing requests, while role-based authorization controls administrative operations.

---

## Running Locally

### Prerequisites

- Node.js
- npm
- PostgreSQL

### Clone the repository

```bash
git clone <repository-url>
cd saas-dashboard
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"
PORT=5000
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Seed the database:

```bash
npx prisma db seed
```

Start the backend:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

Start the frontend:

```bash
npm run dev
```

The application will then be available at:

```text
http://localhost:3000
```

---

## Environment Variables

### Backend

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

### Frontend

```env
NEXT_PUBLIC_API_URL=
```

Never commit `.env` or `.env.local` files to the repository.

---

## Deployment

The application is designed to be deployed using free-tier services:

```text
Next.js Frontend
        ↓
      Vercel

Node.js / Express API
        ↓
      Render

PostgreSQL
        ↓
      Neon
```

---

## Project Goals

SaaSFlow is primarily a portfolio project demonstrating:

- Full-stack application architecture
- Modern React/Next.js development
- REST API design
- PostgreSQL database design
- Prisma ORM
- Authentication and authorization
- Role-based access control
- Data visualization
- Responsive UI development
- Production-style error handling and validation
- Deployment of a full-stack application

---

## Scope

SaaSFlow does **not** process real payments or integrate with external billing providers.

The following are intentionally outside the initial scope:

- Real payment processing
- Email infrastructure
- AI features
- Mobile applications
- Microservices
- Kubernetes
- Complex third-party integrations

---

## License

This project is built for portfolio and educational purposes.
