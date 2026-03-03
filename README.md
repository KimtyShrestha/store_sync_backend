# StoreSync - Retail Analytics API

Author: Kimti Shrestha  
Coventry ID: 14811014  
Project: WEB API DEVELOPMENT  

---

## Overview

StoreSync Backend is a RESTful API built using Express and MongoDB that powers the StoreSync retail analytics platform.

It provides secure authentication, role-based access control, financial record management, branch management, and analytical data aggregation.

The system is designed using modular architecture with separation of concerns between routes, controllers, services, and repositories.

---

## Architecture

The backend follows a layered architecture:

- Routes Layer – Handles HTTP requests
- Controller Layer – Request validation and response handling
- Service Layer – Business logic
- Repository Layer – Database interaction
- Middleware Layer – Authentication and authorization
- Database Layer – MongoDB with Mongoose ODM

This structure ensures maintainability, scalability, and clean separation of concerns.

---

## Tech Stack

### Core
- Node.js
- Express.js
- TypeScript

### Database
- MongoDB
- Mongoose ODM

### Authentication & Security
- JWT (JSON Web Tokens)
- httpOnly Cookies
- Authorization Header fallback
- bcrypt password hashing
- Role-based middleware

### Validation
- Zod (DTO validation)

### API Testing
- Postman

---

## Authentication Strategy

The system implements JWT-based authentication.

- Tokens are generated upon login.
- Tokens are stored in httpOnly cookies.
- Middleware verifies token from:
  1. Cookie (primary)
  2. Authorization header (fallback for testing)

Role-based access control ensures:
- Owners can manage branches and managers.
- Managers can submit daily records.
- Superadmin has full control.

---

## Database Models

### User
- email
- password (hashed)
- role (owner / manager / superadmin)
- status
- firstName
- lastName

---

### Branch
- name
- location
- ownerId
- managerId

---

### DailyRecord
- branchId
- managerId
- date
- salesItems (array)
- expenseItems (array)
- purchaseItems (array)
- totalSales
- totalExpense
- totalPurchases

---

## Key API Endpoints

### Authentication

POST `/api/auth/register`  
POST `/api/auth/login`

---

### Owner Routes

POST `/api/owner/create-manager`  
GET `/api/owner/managers`  
DELETE `/api/owner/delete-manager/:managerId`

---

### Branch Routes

POST `/api/branch/create`  
GET `/api/branch/my-branches`  
PUT `/api/branch/assign-manager`  

---

### Daily Records

POST `/api/daily-record`  
GET `/api/daily-record`  

---

### Dashboard

GET `/api/dashboard`  

Returns:
- totalSales
- totalExpense
- totalPurchases
- netProfit
- averageDailySales
- branchComparison
- salesTrend

---

## Business Logic

Net Profit Calculation:
netProfit = totalSales - (totalExpense + totalPurchases)


Average Daily Sales:
averageDailySales = totalSales / numberOfUniqueDays


Branch ranking is calculated by sorting branches based on profit.

All aggregations are performed using MongoDB aggregation pipelines.

---

## Installation

### 1. Clone Repository

git clone https://github.com/KimtyShrestha/Store_sync_backend.git

cd Store_sync_backend


---

### 2. Install Dependencies


npm install


---

### 3. Environment Variables

Create `.env` file:


PORT=5000
MONGO_URI=<your-mongodb-connection>
JWT_SECRET=<your-secret>


---

### 4. Run Server


npm run dev


Server runs at:


http://localhost:5000


---

## Security Considerations

- Passwords hashed using bcrypt
- JWT stored in httpOnly cookies
- CORS configured with credentials support
- Protected routes via middleware
- Input validation using Zod DTOs

---

## Testing

API tested using Postman:

- Authentication tests
- Role-based access tests
- Dashboard aggregation tests
- Multi-day financial record tests
- Profit ranking verification

---

## System Flow

1. User logs in
2. JWT token issued and stored in cookie
3. Middleware validates token
4. Protected routes accessed
5. Dashboard aggregates financial data
6. Frontend visualizes analytics

---

## Status

Authentication implemented  
Role-based authorization implemented  
Dashboard aggregation implemented  
Multi-day filtering implemented  
Cookie-based security implemented  

---

## Future Improvements

- Unit testing with Jest
- Swagger API documentation
- Rate limiting
- Logging middleware
- Deployment to cloud server

---

## Author

Kimti Shrestha  
StoreSync Retail Analytics Platform

