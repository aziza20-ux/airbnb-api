# Airbnb API

A REST API for Airbnb-like listing, booking, user, and AI-assisted property management built with Express.js, TypeScript, and Prisma ORM.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Caching**: Redis
- **AI**: LangChain-powered LLM workflows for search, description generation, and chat
- **Documentation**: Swagger/OpenAPI 3.0
- **Development**: tsx, nodemon

## 📋 Features

- User authentication and authorization (JWT-based)
- User management (register, login, profile, password reset)
- Listing management (create, read, update, delete listings)
- Booking management with conflict detection
- Photo uploads (user avatars and listing photos)
- AI-powered listing search, description generation, and chat assistant
- Rate limiting and request throttling
- Swagger API documentation with interactive UI
- Health check endpoint
- Global error handling
- Request logging with Morgan
- Response compression

## 🏗️ Project Structure

```
src/
├── config/              # Configuration files
│   ├── cache.ts        # Redis caching setup
│   ├── cloudinary.ts   # Cloudinary configuration
│   ├── email.config.ts # Email service setup
│   ├── multer.ts       # File upload middleware
│   ├── prisma.ts       # Prisma client configuration
│   └── swagger.ts      # Swagger/OpenAPI setup
├── controllers/        # Business logic
│   ├── auth.controller.ts
│   ├── users.controller.ts
│   ├── listings.controller.ts
│   ├── bookings.controller.ts
│   ├── ai.controllers.ts
│   └── upload.controller.ts
├── middlewares/        # Express middlewares
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── ratelimit.middleware.ts
├── routes/            # API routes
│   └── v1/           # API v1 routes
│       ├── auth.routes.ts
│       ├── users.routes.ts
│       ├── listings.routes.ts
│       ├── bookings.routes.ts
│       ├── ai.routes.ts
│       ├── upload.routes.ts
│       └── index.ts
├── templates/        # Email templates
├── utils/            # Utility functions
├── generated/        # Generated Prisma client
└── index.ts          # Application entry point

prisma/
├── schema.prisma     # Database schema
├── seed.ts          # Database seeding
└── migrations/      # Database migrations
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/airbnb_api"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1d"

# Email
EMAIL_FROM="noreply@example.com"
EMAIL_PASSWORD="your-email-password"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"

# Cloudinary
CLOUDINARY_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Redis
REDIS_URL="redis://localhost:6379"

# Server
PORT=3000
NODE_ENV="development"
API_URL="http://localhost:3000"
```

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd airbnb-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npx prisma migrate deploy
npx prisma db seed
```

## 🚀 Running the Project

### Development
```bash
npm run dev
```

Starts the server with hot reload at `http://localhost:3000`

### Production
```bash
npm run build
npm start
```

### Database Commands
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

## 📚 API Documentation

### Swagger UI

Access the interactive API documentation:

- **Development**: http://localhost:3000/api-docs or http://localhost:3000/api/v1/docs
- **Production**: https://airbnb-api-vzuk.onrender.com/api/v1/docs

### OpenAPI JSON

- **Development**: http://localhost:3000/api-docs.json or http://localhost:3000/api/v1/docs.json
- **Production**: https://airbnb-api-vzuk.onrender.com/api/v1/docs.json

## 🔐 Authentication

The API uses JWT bearer tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Auth
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user profile
- `PATCH /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/forgot-password` - Request password reset

#### Users
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/stats` - Get user statistics
- `GET /api/v1/users/{id}` - Get user profile
- `GET /api/v1/users/{id}/bookings` - Get user bookings
- `PUT /api/v1/users/{id}` - Update user profile
- `DELETE /api/v1/users/{id}` - Delete user account

#### Listings
- `GET /api/v1/listings` - List all listings
- `POST /api/v1/listings` - Create new listing (HOST only)
- `GET /api/v1/listings/{id}` - Get listing details
- `GET /api/v1/listings/search` - Search listings
- `GET /api/v1/listings/stats` - Get listing statistics
- `PUT /api/v1/listings/{id}` - Update listing (HOST only)
- `DELETE /api/v1/listings/{id}` - Delete listing (HOST only)

#### AI
- `POST /api/v1/ai/search` - Extract search filters from natural language and return matching listings
- `POST /api/v1/ai/description` - Generate an Airbnb-style listing description
- `POST /api/v1/ai/chat` - Chat with the Airbnb assistant using session-based conversation history

#### Bookings
- `GET /api/v1/bookings` - List all bookings
- `POST /api/v1/bookings` - Create booking (GUEST only)
- `GET /api/v1/bookings/{id}` - Get booking details
- `PATCH /api/v1/bookings/{id}/status` - Update booking status
- `DELETE /api/v1/bookings/{id}` - Cancel booking

#### Uploads
- `POST /api/v1/usersuploads/{id}/avatar` - Upload user avatar
- `DELETE /api/v1/usersuploads/{id}/avatar` - Delete user avatar
- `POST /api/v1/usersuploads/listings/{id}/photos` - Upload listing photos
- `DELETE /api/v1/usersuploads/listings/{id}/photos/{photoId}` - Delete listing photo

#### Health
- `GET /api/v1/health` - Health check endpoint

## 🤖 AI Features

The API includes three AI-powered endpoints:

- Natural language search that converts a plain-English query into listing filters
- Listing description generation for hosts creating or improving properties
- A chat assistant that answers listing and booking questions with short-term session memory

### Example Requests

#### Search
```json
{
  "query": "Find a villa in Miami for 4 guests under 300 dollars"
}
```

#### Description
```json
{
  "title": "Sunset Villa",
  "location": "Miami",
  "type": "VILLA",
  "guests": 4,
  "amenities": ["Pool", "WiFi", "Kitchen"],
  "pricePerNight": 280
}
```

#### Chat
```json
{
  "message": "Show me listings with a pool near the beach",
  "sessionId": "session-123"
}
```

## 🗄️ Database Schema

The database includes the following models:

- **User** - User accounts with roles (HOST, GUEST, ADMIN)
- **Listing** - Property listings with details, amenities, and photos
- **Booking** - Booking records with check-in/out dates and status
- **ListingPhoto** - Photos associated with listings
- **AI** - AI search, description, and chat flows backed by the app's listing data

See `prisma/schema.prisma` for the complete schema.

## 🔒 Security Features

- JWT authentication with configurable expiration
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS support
- Request validation
- Error handling and logging
- SQL injection prevention via Prisma ORM

## 📊 Caching

The API uses Redis for caching:

- Listing statistics (5 minutes TTL)
- User statistics (5 minutes TTL)
- Custom cache keys for frequently accessed data

## 🐛 Error Handling

The API returns standardized error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `P2002` - Unique constraint violation
- `P2025` - Record not found
- `P2003` - Foreign key constraint failure

## 🚢 Deployment

The API is configured for deployment on Render.com.

### Build Process
```bash
npm install
npx prisma generate
npm run build
npx prisma migrate deploy
```

### Start Command
```bash
tsx src/index.ts
```

### Environment Variables on Render
Set the following in the Render dashboard:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT
- `CLOUDINARY_*` - Cloudinary credentials
- `REDIS_URL` - Redis connection string
- `NODE_ENV` - Set to "production"

## 📝 Scripts

```bash
npm run dev                 # Start development server
npm run build              # Build TypeScript to JavaScript
npm start                  # Start production server
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Run database migrations
npm run db:reset           # Reset database
npm run db:seed            # Seed database with sample data
npm run db:studio          # Open Prisma Studio
npm run db:push            # Push schema to database
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run build` to verify TypeScript compilation
4. Submit a pull request

## 📄 License

ISC

## 🆘 Support

For issues or questions, please create an issue in the repository.
