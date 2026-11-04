# Cartify — Simple Shopping Application (MERN Stack)
### Shiv Nadar University Chennai &bull; Department of Computer Science & Engineering
**CS3801 — Web Technologies Lab &bull; Exercise-8**

---

## 📌 Project Overview
**Cartify** is a clean, minimal shopping application developed using the **MERN Stack** (MongoDB Atlas, Express.js, React.js with Vite, and Node.js). 

It fulfills all requirements for **Exercise-8**:
- User Registration with duplicate email checking (`POST /api/users`)
- User Login validation with exact lab error messages (`POST /api/login`)
- Product catalog retrieval using **only HTTP GET** (`GET /api/products`) with authentication protection
- Products dynamically fetched from Fakestore API (`https://fakestoreapi.com/products`) into MongoDB
- User profile management utilizing RESTful API operations:
  - `PUT /api/users?emailId=...` &mdash; Update complete profile
  - `PATCH /api/users?emailId=...` &mdash; Update selected fields
  - `DELETE /api/users?emailId=...` &mdash; Delete user registration
- Minimalist monochrome aesthetic matching the lab exercise reference.

---

## 📁 Project Structure

```text
Cartify/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection using Mongoose
│   ├── data/
│   │   └── seedData.js         # 8 Default products & auto-seed utility
│   ├── models/
│   │   ├── User.js             # Users collection schema
│   │   └── Product.js          # Products collection schema
│   ├── routes/
│   │   ├── userRoutes.js       # Registration, Login, PUT, PATCH, DELETE
│   │   └── productRoutes.js    # Auth-protected GET /api/products
│   ├── .env                    # PORT, MONGO_URI, JWT_SECRET
│   ├── package.json
│   └── server.js               # Express application entry point
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation bar with branding & view switcher
│   │   │   ├── UserRegistration.jsx     # Page 1: User Registration
│   │   │   ├── UserLogin.jsx            # Page 2: User Login
│   │   │   ├── ProductCatalog.jsx       # Page 3: Products Display
│   │   │   ├── ProductCard.jsx          # Individual product card component
│   │   │   └── UserProfileManagement.jsx# Section 3: REST API Profile Management
│   │   ├── App.css
│   │   ├── App.jsx                      # App state & session management
│   │   ├── index.css                    # Clean monochrome brutalist styles
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js                   # Vite config with API proxy
│   └── package.json
├── package.json
└── README.md
```

---

## 🗄️ Database Design (MongoDB)

### 1. Products Collection (`Products`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `productId` | `String` | Unique product identifier (e.g., `P101`, `P102`) |
| `productName` | `String` | Product title |
| `productPrice` | `Number` | Price in INR (₹) |
| `category` | `String` | Category (e.g., Apparel, Electronics, Accessories) |
| `quantity` | `Number` | Available stock count |
| `description` | `String` | Detailed product summary |

### 2. Users Collection (`Users`)
*(The same Users collection is used for both registration and login)*
| Field | Type | Description |
| :--- | :--- | :--- |
| `username` | `String` | Name of the user |
| `emailId` | `String` | Unique email address |
| `age` | `Number` | Age of user |
| `password` | `String` | User password |

---

## 🚀 REST API Specification

| HTTP Method | Endpoint | Query Param | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/users` | - | `{ username, emailId, age, password }` | Register a new user |
| **POST** | `/api/login` | - | `{ emailId, password }` | Validate user credentials |
| **GET** | `/api/products` | *(Optional auth query/header)* | - | Retrieve all products (Auth required) |
| **PUT** | `/api/users` | `?emailId=user@example.com` | `{ username, age, password }` | Update complete profile details |
| **PATCH** | `/api/users` | `?emailId=user@example.com` | `{ username? , age? , password? }` | Update selected profile fields |
| **DELETE** | `/api/users` | `?emailId=user@example.com` | - | Delete user registration record |

---

## ⚡ Running the Application

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
- Server will run on: `http://localhost:5000`
- Automatically connects to MongoDB Atlas and auto-seeds the 8 initial catalog items if empty.

### 2. Start Frontend Client
```bash
cd frontend
npm run dev
```
- Client runs on: `http://localhost:3000` (or Vite's assigned port).
- Proxies `/api` requests to backend at `http://localhost:5000`.

---

## 🧪 Testing with Postman / Thunder Client

### 1. User Registration
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/users`
- **Body (JSON):**
  ```json
  {
    "username": "Raghavendra",
    "emailId": "raghavendra@snu.edu.in",
    "age": 21,
    "password": "password123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Successfully registered! Welcome, Raghavendra.",
    "user": {
      "username": "Raghavendra",
      "emailId": "raghavendra@snu.edu.in",
      "age": 21
    }
  }
  ```

### 2. User Login
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/login`
- **Body (JSON):**
  ```json
  {
    "emailId": "raghavendra@snu.edu.in",
    "password": "password123"
  }
  ```
- **Error Responses:**
  - If unregistered: `404 Not Found` &rarr; `{"message": "User Not Registered."}`
  - If password wrong: `401 Unauthorized` &rarr; `{"message": "Invalid Password."}`

### 3. Retrieve Products (GET Only)
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/products`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "count": 8,
    "products": [ ... ]
  }
  ```

### 4. PUT Complete Update
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/users?emailId=raghavendra@snu.edu.in`
- **Body (JSON):**
  ```json
  {
    "username": "Raghavendra Rao",
    "age": 22,
    "password": "newpassword456"
  }
  ```

### 5. PATCH Selected Update
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/users?emailId=raghavendra@snu.edu.in`
- **Body (JSON):**
  ```json
  {
    "username": "Raghavendra R."
  }
  ```

### 6. DELETE User Record
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/users?emailId=raghavendra@snu.edu.in`
