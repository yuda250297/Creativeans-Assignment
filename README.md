# Assignment Backend

A high-performance Go backend service built with [Fiber v3](https://docs.gofiber.io/), utilizing [SQLC](https://sqlc.dev/) for type-safe database operations and a clean Service-Repository architecture.

## 🚀 Features

- **Fiber v3**: Fast, minimalist web framework for Go.
- **SQLC**: Generates type-safe Go code from SQL queries.
- **Clean Architecture**: Decoupled business logic (Services) from data access (Repositories).
- **Dependency Injection**: Centralized container management for services and repositories.
- **Database Migrations**: Automated database schema management.
- **CORS & Security**: Configurable middleware for cross-origin requests and recovery.

## 📂 Project Structure

```text
.
├── app.go               # Application entry point & middleware setup
├── database/            # Database connection and migration logic
│   └── sqlc/            # Generated SQLC models and query methods
├── models/              # Request/Response DTOs and business models
├── provider/            # Dependency Injection (DI) container
├── routes/              # API route definitions
├── services/            # Business logic layer
└── .env                 # Environment configuration (local)
```

## 🛠 Prerequisites

- **Go**: 1.21 or higher
- **PostgreSQL**: 14 or higher
- **SQLC**: (Optional) For regenerating database code

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd assignment-be
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory, copy from env.example file provided:
   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/dbname?sslmode=disable
   ALLOW_ORIGINS=http://localhost:3000
   ```

3. **Install Dependencies**:
   ```bash
   go mod tidy
   ```

## 🏃 Running the Application

### Development Mode
```bash
go run app.go
```
By default, the server starts on port `:3031`. It will run the migrations based on db connection set in the .env file.

### Database Seeding
```bash
go run cmd/seeder/main.go
```

### Production Mode
Enables Fiber's prefork for multi-core performance:
```bash
go run app.go -prod=true -port=:3031
```

## 🏗 Development Commands

- **Generate SQLC**: If you modify `.sql` files in the database layer, regenerate the Go code:
  ```bash
  sqlc generate
  ```


# Assignment Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
A modern, responsive e-commerce storefront built with Next.js 14 (App Router), featuring advanced product filtering, secure authentication, and a polished UI using Tailwind CSS and Shadcn UI.

First, run the development server:
## 🚀 Features

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
- **Product Catalog**: Dynamic product listing with server-side pagination support.
- **Advanced Filtering**: Real-time filtering by category, price range, stock status, and keyword search with URL state synchronization.
- **Product Details**: Rich product views with image galleries and detailed specifications.
- **Authentication**: JWT-based authentication flow with Google OAuth integration via the Go backend.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop views.
- **Type Safety**: Built with TypeScript and Zod for robust data validation.

Open http://localhost:3000 with your browser to see the result.
## 📂 Project Structure

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
```text
app/
├── (auth)/             # Authentication related pages (Login/Register)
├── product/            # Product listing and detail pages
│   ├── [productID]/    # Dynamic route for product details
│   └── product-filter.tsx # Complex filtering component logic
├── components/         # Shared UI components (Shadcn UI)
│   └── ui/             # Low-level primitive components
├── lib/                # Utility functions and shared logic
│   ├── api.ts          # Axios instance for backend communication
│   ├── auth.ts         # Authentication helpers and OAuth logic
│   ├── cookies.ts      # Token management logic
│   └── utils.ts        # Tailwind class merging and other utils
└── public/             # Static assets
```

This project uses `next/font` to automatically optimize and load Geist, a new font family for Vercel.
## 🛠 Tech Stack

## Learn More
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React
- **HTTP Client**: Axios

To learn more about Next.js, take a look at the following resources:
## ⚙️ Getting Started

- Next.js Documentation - learn about Next.js features and API.
- Learn Next.js - an interactive Next.js tutorial.
### Prerequisites
- Node.js 18.x or higher
- npm / yarn / pnpm

You can check out the Next.js GitHub repository - your feedback and contributions are welcome!
### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

