# 🛒 Mini Amazon - E-Commerce Store

A modern, full-stack e-commerce application built with Next.js 14, TypeScript, MongoDB, and Stripe. Features a complete shopping experience with user authentication, product management, shopping cart, secure checkout, and admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-green)
![Stripe](https://img.shields.io/badge/Stripe-Payment-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue)

## ✨ Features

### 🛍️ Customer Features
- **Authentication**: Secure user registration and login
- **Product Browsing**: Advanced filtering and search functionality
- **Shopping Cart**: Persistent cart with quantity management
- **Checkout**: Secure payment processing with Stripe
- **Order Management**: Order history and tracking
- **Profile Management**: User account management

### 👨‍💼 Admin Features
- **Dashboard**: Analytics and overview
- **Product Management**: Full CRUD operations for products
- **Image Upload**: Cloudinary integration for product images
- **Order Management**: View and manage customer orders
- **User Management**: Admin user controls

### 🔧 Technical Features
- **Clean Architecture**: Layered architecture with DTOs and services
- **Type Safety**: Full TypeScript implementation
- **Validation**: Zod schema validation
- **Testing**: Unit and integration tests
- **Responsive Design**: Mobile-first approach
- **Performance**: Optimized for speed and SEO

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js v5** - Authentication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Services
- **Stripe** - Payment processing
- **Cloudinary** - Image storage and optimization

### Testing
- **Jest** - Unit testing framework
- **Supertest** - API testing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB (local or Atlas)
- Stripe account
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abdulrasaq1515/VELSYNC-INTERNSHIP
   cd VELSYNC-INTERNSHIP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/your-database-name
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key-minimum-32-characters-long
   
   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
   
   # Admin
   ADMIN_EMAIL=admin@yourdomain.com
   
   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up MongoDB**
   
   **Option A: Local MongoDB**
   - Install MongoDB and MongoDB Compass
   - Start MongoDB service
   - Connect to `mongodb://localhost:27017`
   
   **Option B: MongoDB Atlas**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a cluster and get connection string
   - Update `MONGODB_URI` in `.env`

5. **Set up Stripe**
   - Create account at [Stripe](https://stripe.com)
   - Get API keys from Dashboard → Developers → API keys
   - Add keys to `.env`
   - For webhooks (development):
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```

6. **Set up Cloudinary**
   - Create account at [Cloudinary](https://cloudinary.com)
   - Get credentials from Dashboard
   - Add to `.env`

7. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

8. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

9. **Create admin user**
   - Register a normal user account
   - Update user role in MongoDB:
     ```javascript
     // In MongoDB Compass or mongosh
     db.users.updateOne(
       { email: "your-admin-email@example.com" },
       { $set: { role: "admin" } }
     )
     ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── orders/            # Order management
│   ├── products/          # Product pages
│   └── profile/           # User profile
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── cart/             # Cart components
│   ├── layout/           # Layout components
│   ├── products/         # Product components
│   └── ui/               # Reusable UI components
├── lib/                  # Core business logic
│   ├── config/           # Configuration
│   ├── dto/              # Data Transfer Objects
│   ├── models/           # Database models
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic layer
│   ├── utils/            # Utility functions
│   └── validators/       # Validation schemas
└── types/                # TypeScript type definitions
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables from `.env.example` in your deployment platform:

- `MONGODB_URI` - Your MongoDB connection string
- `NEXTAUTH_URL` - Your production domain
- `NEXTAUTH_SECRET` - Secure random string (32+ characters)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `CLOUDINARY_URL` - Cloudinary URL
- `ADMIN_EMAIL` - Admin user email
- `NEXT_PUBLIC_APP_URL` - Your production domain

### Stripe Webhooks for Production

Update your Stripe webhook endpoint to point to your production domain:
`https://yourdomain.com/api/stripe/webhook`

## 🔐 Security Best Practices

- **Environment Variables**: Never commit `.env` files to version control
- **API Keys**: Use different keys for development and production
- **Database**: Use strong passwords and enable authentication
- **HTTPS**: Always use HTTPS in production
- **Webhooks**: Verify webhook signatures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Stripe](https://stripe.com/) - Payment processing
- [MongoDB](https://www.mongodb.com/) - Database
- [Cloudinary](https://cloudinary.com/) - Image management
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI components

---

**Built with ❤️ using Next.js, TypeScript, MongoDB, and Stripe**