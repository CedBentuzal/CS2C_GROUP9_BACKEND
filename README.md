# Backend API

## Overview

This is the backend service for user authentication and registration. It provides APIs for user signup, including email verification.

## Technologies Used

- **Node.js** with **Express.js**
- **PostgreSQL** for database
- **bcrypt** for password hashing
- **crypto** for generating verification tokens
- **nodemailer** for sending verification emails

## Installation & Setup

### Prerequisites

- Node.js (Latest LTS version recommended)
- PostgreSQL database

### Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by creating a `.env` file:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```
4. Run database migrations (if applicable):
   ```bash
   npm run migrate
   ```
5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### **User Signup**

**Endpoint:** `POST /api/signup`

- **Request Body:**
  ```json
  {
    "username": "exampleUser",
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User created! Please verify your email."
  }
  ```

## Debugging & Troubleshooting

- **400 Bad Request:** Ensure all required fields are provided and valid.
- **500 Internal Server Error:** Check the logs for database connection or syntax errors.
- **Cannot connect to PostgreSQL:** Ensure the database is running and the connection string is correct.

## License

This project is licensed under the MIT License.

## Contributors

- **Ced** - Developer

Project Status: In Development
