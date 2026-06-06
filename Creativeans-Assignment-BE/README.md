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
go run app.go -prod=true -port=:8080
```

## 🏗 Development Commands

- **Generate SQLC**: If you modify `.sql` files in the database layer, regenerate the Go code:
  ```bash
  sqlc generate
  ```


