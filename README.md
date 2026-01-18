# Subscription Tracker API

> A RESTful API for managing subscription services with automated email reminders

Built with Node.js, Express, MongoDB, and Upstash Workflow

---

## Features

**Authentication**  
JWT-based auth with secure password hashing

**Subscription Management**  
Full CRUD operations for tracking subscriptions

**Automated Reminders**  
Smart email notifications at 7, 5, 2, and 1 days before renewal

**Security**  
Rate limiting and bot detection via Arcjet

**Workflow Automation**  
Powered by Upstash Workflow for reliable reminder delivery

**Multi-Currency**  
Support for USD, EGP, KWD, EUR, GBP

**Auto Status Updates**  
Subscriptions automatically marked as expired when due

---

## Tech Stack

```
Runtime       → Node.js (v20+)
Framework     → Express.js
Database      → MongoDB with Mongoose ODM
Auth          → JWT (jsonwebtoken)
Security      → Arcjet, bcryptjs
Email         → Nodemailer
Workflow      → Upstash Workflow & QStash
Dev Tools     → Nodemon, ESLint
```

---

## Prerequisites

· Node.js >= 20.19.0  
· MongoDB instance (local or cloud)  
· Upstash account for QStash  
· Arcjet account for security features  
· Gmail account for email notifications (or other SMTP service)

---

## Installation

**1. Clone the repository**
```bash
git clone <repository-url>
cd subscription-tracker-api
```

**2. Install dependencies**
```bash
npm install
```

**3. Environment Setup**

Create environment files for different environments:

`.env.development.local`
```env
NODE_ENV=development
PORT=3000
SERVER_URL=http://localhost:3000

# Database
DB_URI=mongodb://localhost:27017/subscription-tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Arcjet
ARCJET_KEY=your-arcjet-key
ARCJET_ENV=development

# Upstash QStash
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=your-current-signing-key
QSTASH_NEXT_SIGNING_KEY=your-next-signing-key

# Email
EMAIL_PASSWORD=your-gmail-app-password
```

`.env.production.local`
```env
NODE_ENV=production
PORT=3000
SERVER_URL=https://your-production-domain.com

# ... (same structure as development)
```

**4. Run the application**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

---

## API Documentation

### Authentication Endpoints

**Sign Up**
```http
POST /api/v1/auth/sign-up
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response →
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Sign In**
```http
POST /api/v1/auth/sign-in
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Subscription Endpoints

All subscription endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer your-jwt-token
```

**Create Subscription**
```http
POST /api/v1/subscriptions
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "name": "Netflix",
  "price": 15.99,
  "currency": "USD",
  "frequency": "monthly",
  "category": "entertainment",
  "paymentMethod": "Credit Card",
  "startDate": "2024-01-01"
}
```

**Get User Subscriptions**
```http
GET /api/v1/subscriptions/:userId
Authorization: Bearer your-jwt-token
```

### User Endpoints

**Get All Users**
```http
GET /api/v1/users
```

**Get User by ID**
```http
GET /api/v1/users/:id
Authorization: Bearer your-jwt-token
```

---

## Email Reminder System

The system automatically schedules email reminders when a subscription is created:

· 7 days before renewal → First reminder  
· 5 days before renewal → Second reminder  
· 2 days before renewal → Third reminder  
· 1 day before renewal → Final reminder

Reminders are powered by Upstash Workflow and include subscription details, renewal date, plan information, price, payment method, and quick action links.

---

## Project Structure

```
subscription-tracker-api/
├── config/
│   ├── arcjet.js          # Security configuration
│   ├── env.js             # Environment variables
│   ├── nodemailer.js      # Email configuration
│   └── upstash.js         # Workflow client
├── controllers/
│   ├── auth.controller.js
│   ├── subscription.controller.js
│   ├── user.controller.js
│   └── workflow.controller.js
├── database/
│   └── mongodb.js
├── middleware/
│   ├── arcjet.middleware.js
│   ├── auth.middleware.js
│   └── error.middleware.js
├── models/
│   ├── subscription.model.js
│   └── user.model.js
├── routes/
│   ├── auth.routes.js
│   ├── subscription.routes.js
│   ├── user.routes.js
│   └── workflow.routes.js
├── utils/
│   ├── email-template.js
│   └── send-email.js
├── app.js
└── package.json
```

---

## Security Features

· JWT Authentication → Secure token-based authentication  
· Password Hashing → bcryptjs with salt rounds  
· Rate Limiting → 10 requests per 10 seconds per IP (via Arcjet)  
· Bot Detection → Automated bot traffic blocking  
· Input Validation → Mongoose schema validation  
· Error Handling → Centralized error middleware

---

## Data Models

**User Schema**
```javascript
{
  name: String (2-50 chars),
  email: String (unique, validated),
  password: String (hashed, min 6 chars),
  timestamps: true
}
```

**Subscription Schema**
```javascript
{
  name: String (2-100 chars),
  price: Number (0-1000),
  currency: Enum ['USD', 'EGP', 'KWD', 'EUR', 'GBP'],
  frequency: Enum ['daily', 'weekly', 'monthly', 'yearly'],
  category: Enum ['entertainment', 'education', 'productivity', 'health', 'other'],
  paymentMethod: String,
  status: Enum ['active', 'paused', 'canceled', 'expired'],
  startDate: Date,
  renewalDate: Date (auto-calculated),
  user: ObjectId (ref: User),
  timestamps: true
}
```

---

## Development

**Running Tests**
```bash
npm test  # (You'll need to add test scripts)
```

**Linting**
```bash
npx eslint .
```

**Database Migrations**  
The app uses Mongoose schemas with auto-validation. No migrations needed for development.

---

## Troubleshooting

**MongoDB Connection Failed**  
→ Check your `DB_URI` in the environment file  
→ Ensure MongoDB is running  
→ Verify network connectivity

**Email Not Sending**  
→ Use Gmail App Password (not regular password)  
→ Enable "Less secure app access" or use OAuth2  
→ Check spam folder

**QStash Workflow Not Triggering**  
→ Verify `QSTASH_TOKEN` is correct  
→ Ensure `SERVER_URL` is publicly accessible  
→ Check Upstash dashboard for logs

**Rate Limit Issues**  
→ Adjust token bucket settings in `config/arcjet.js`  
→ Check Arcjet dashboard

---

## TODO / Improvements Needed

See the implementation document for a detailed list of missing features.

---

## Contributing

```
1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request
```

---

## License

This project is licensed under the MIT License.

---

## Author

**Your Name**  
nourinawad@gmail.com  
[@yourusername](https://github.com/nourinawadd)

---

## Acknowledgments

Built with:  
[Upstash](https://upstash.com/) · [Arcjet](https://arcjet.com/) · [MongoDB](https://www.mongodb.com/) · [Express.js](https://expressjs.com/)
