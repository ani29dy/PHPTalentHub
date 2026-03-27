# PHP Talent Hub

A MERN-based platform that connects businesses with verified PHP developers through an efficient hiring system.

## 🚀 Features

### For Developers

- Create and manage professional profiles
- Showcase skills, experience, and portfolio
- Request verification for credibility
- Apply to job opportunities

### For Businesses

- Search and filter verified developers
- Post job listings
- View detailed developer profiles
- Contact potential candidates

### For Admins

- Manage user accounts
- Approve developer verifications
- Oversee platform data

## 🛠️ Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd php-talent-hub
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/php-talent-hub
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows (if installed as service)
net start MongoDB

# Or run manually
mongod
```

### 5. Create Admin User

After starting the backend, you can create an admin user by registering with role "admin" through the frontend registration form.

### 6. Start the Application

**Backend** (Terminal 1):

```bash
cd backend
npm run dev
```

**Frontend** (Terminal 2):

```bash
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5174
- Backend API: http://localhost:5000

## 📊 Database Schema

### Users Collection

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (developer/business/admin),
  createdAt: Date
}
```

### Profiles Collection

```javascript
{
  userId: ObjectId (ref: User),
  skills: [String],
  experience: String,
  location: String,
  portfolio: String,
  verified: Boolean,
  verificationRequested: Boolean,
  bio: String
}
```

### Jobs Collection

```javascript
{
  title: String,
  description: String,
  skills: [String],
  location: String,
  salary: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

## 🔐 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Profiles

- `GET /api/profiles` - Get all verified profiles (with filters)
- `GET /api/profiles/:userId` - Get profile by user ID
- `POST /api/profiles` - Create/update profile
- `POST /api/profiles/request-verification` - Request verification

### Jobs

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (business only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Admin

- `GET /api/admin/users` - Get all users
- `GET /api/admin/verification-requests` - Get verification requests
- `PUT /api/admin/approve-verification/:profileId` - Approve verification
- `PUT /api/admin/reject-verification/:profileId` - Reject verification

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Search & Filters**: Advanced filtering for developers
- **Role-based Access**: Different dashboards for each user type
- **Verification System**: Trusted developer badges

## 🚀 Deployment

### Environment Variables

Update the `.env` file with production values:

```env
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
PORT=5000
```

### Build Commands

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For questions or support, please contact the development team.
