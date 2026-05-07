# JWT Authentication System

## Overview
This project implements a complete JWT (JSON Web Token) authentication system with the following features:

- User registration with email verification
- JWT token generation and validation
- Protected routes with middleware
- Token-based authentication
- Logout functionality

## Backend Implementation

### Dependencies
```bash
npm install jsonwebtoken @types/jsonwebtoken
```

### Environment Variables
Create a `.env` file with:
```env
JWT_SECRET=your-super-secret-jwt-key-here
DATABASE_URL=postgresql://username:password@localhost:5432/matcha
GMAIL_MAIL=your-email@gmail.com
GMAIL_APP_PWD=your-app-password
FRONTEND_URL=http://localhost:3000
```

### JWT Flow

#### 1. Token Generation (Login)
```typescript
const token = jwt.sign(
    {
        id: user.id,
        email: user.email,
        username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
);
```

#### 2. Token Verification (Middleware)
```typescript
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = decoded as User;
        next();
    });
};
```

#### 3. Protected Routes
```typescript
app.get("/user/profile", authenticateToken, (req: AuthRequest, res) => {
    // Access req.user for authenticated user data
});
```

## Frontend Implementation

### Auth Context
The frontend uses React Context for global authentication state:

```typescript
const { user, token, login, logout, isAuthenticated } = useAuth();
```

### API Calls with JWT
```typescript
const response = await fetch('/api/protected-route', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    },
});
```

## API Endpoints

### Authentication
- `POST /user/register` - Register new user
- `POST /user/check-email-token` - Verify email
- `POST /user/login` - Login and get JWT
- `POST /user/logout` - Logout

### Protected Routes
- `GET /user/profile` - Get user profile (requires JWT)

## Usage Examples

### Login Flow
1. User submits login form
2. Backend validates credentials and email verification
3. JWT token is generated and returned
4. Frontend stores token in localStorage and context
5. Subsequent requests include `Authorization: Bearer ${token}` header

### Accessing Protected Routes
```javascript
// Frontend
const { token } = useAuth();

fetch('/user/profile', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

### Logout
1. Call logout endpoint (optional)
2. Clear token from localStorage and context
3. Redirect to home page

## Security Features

- JWT tokens expire after 24 hours
- Email verification required before login
- Password hashing with bcrypt
- CORS configuration for secure headers
- Token validation on protected routes

## Testing the System

1. Register a new user
2. Check email for verification link
3. Verify email using the token
4. Login to get JWT token
5. Access protected routes with the token
6. Test logout functionality