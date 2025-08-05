# Backend Repository for Kit-IT 🏢

This repository contains the backend code for **Kit-IT**, a school project focused on building a web service platform for IT service management. 

This backend handles server logic, API endpoints, and database operations.

---

## Project Summary (School Context)

Kit-IT is a fictional IT service company. The project includes:

- Account registration and login (JWT-based auth)
- Appointment booking and service browsing
- Real-time customer support via chat
- User data and order management
  
---

## Technologies Used

- **Node.js / Express** – Server-side logic
- **PostgreSQL** – Relational database
- **JWT** – Authentication
- **dotenv, cookie-parser, cors** – Environment & security tools
- **Jest** – Unit testing

---

## Getting Started

1. Clone the repo:

```bash
git clone <repository-url>
cd main
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```env
DATABASE_URL=<your-database-url>
JWT_SECRET=<your-secret>
PORT=<your-port>
```

4. Start the server:

```bash
npm start
```

---

## API Routes

### `/api/auth`
- `POST /login` – Login
- `POST /register` – Register
- `POST /clearCookie` – Logout

### `/api/user`
- Manage user data

### `/api/products`
- View/manage products

### `/api/appointments`
- Bookings (with time validation)

---

## CI/CD

GitHub Actions automates simple testing and simple npm publishing on pull requests.

---

## Contributor  
[jhalmekosk](https://github.com/jhalmeko)

> ⚠️ This project is part of a **school assignment** intended for learning and educational purposes only. It is **not intended for real-world business use** and is not in active production.

