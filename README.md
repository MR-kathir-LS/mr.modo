
# MR.MODO - Appointment Booking Backend

A robust backend API for an appointment booking system built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Dual User Roles**: Support for clients and service providers
- **Appointment Management**: Book, confirm, reschedule, and cancel appointments
- **Availability Management**: Providers can set available time slots
- **Ratings & Reviews**: Clients can rate and review appointments
- **Provider Profiles**: Business information and availability hours
- **Validation**: Comprehensive input validation and error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Validation**: express-validator

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MR-kathir-LS/mr.modo.git
   cd mr.modo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the server**
   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Appointments
- `POST /api/appointments` - Book an appointment
- `GET /api/appointments/user/:userId` - Get user's appointments
- `GET /api/appointments/:appointmentId` - Get appointment details
- `PATCH /api/appointments/:appointmentId/status` - Update appointment status
- `DELETE /api/appointments/:appointmentId` - Cancel appointment
- `PATCH /api/appointments/:appointmentId/review` - Add review/rating

### Users
- `GET /api/users` - Get all providers
- `GET /api/users/profile/:userId` - Get user profile
- `PUT /api/users/profile/:userId` - Update user profile
- `GET /api/users/stats/:providerId` - Get provider statistics

### Availability
- `POST /api/availability` - Create availability slot (Provider only)
- `GET /api/availability/provider/:providerId` - Get provider's availability
- `PUT /api/availability/:availabilityId` - Update availability
- `DELETE /api/availability/:availabilityId` - Delete availability

## Usage Examples

### Register as a Client
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "password123",
    "role": "user"
  }'
```

### Register as a Provider
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "0987654321",
    "password": "password123",
    "role": "provider",
    "businessName": "Smith Consulting",
    "businessDescription": "Professional consulting services"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Book an Appointment
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "providerId": "PROVIDER_ID",
    "title": "Consultation",
    "serviceType": "Consulting",
    "startTime": "2024-10-15T10:00:00Z",
    "endTime": "2024-10-15T11:00:00Z",
    "location": "Office",
    "description": "Initial consultation"
  }'
```

### Create Availability Slot
```bash
curl -X POST http://localhost:5000/api/availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "date": "2024-10-20",
    "startTime": "09:00",
    "endTime": "17:00",
    "slots": 5
  }'
```

## Database Models

### User
- name, email, phone
- password (hashed)
- role (user/provider)
- businessName, businessDescription
- availabilityHours
- profileImage
- timestamps

### Appointment
- clientId, providerId
- title, description, serviceType
- startTime, endTime, duration
- status (pending/confirmed/completed/cancelled/rescheduled)
- location, notes
- rating, feedback
- timestamps

### Availability
- providerId
- date, startTime, endTime
- slots, bookedSlots
- isRecurring, recurringPattern
- timestamps

## Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Error message here"
}
```

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT-based authentication
- Role-based authorization
- Input validation with express-validator
- CORS enabled for frontend integration

## Future Enhancements

- Email notifications for appointment confirmations
- SMS reminders
- Payment integration
- Google Calendar sync
- Video conferencing integration
- Admin dashboard
- Advanced analytics
- Two-factor authentication

## License

MIT

## Author

MR-kathir-LS
