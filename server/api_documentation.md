# Event Sphere API Documentation

This document describes the available API endpoints for the Event Sphere Event Management System.

## Base URL
`http://localhost:5000/api`

---

## 🔐 Authentication APIs (`/auth`)

### 1. User Signup
*   **Method**: `POST`
*   **Endpoint**: `/register`
*   **Access**: Public
*   **Body**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "mypassword123",
      "role": "user" // Optional: 'user' (default) or 'organizer'
    }
    ```

### 2. User Login
*   **Method**: `POST`
*   **Endpoint**: `/login`
*   **Access**: Public
*   **Body**:
    ```json
    {
      "email": "jane@example.com",
      "password": "mypassword123"
    }
    ```

### 3. Get Current User (Profile)
*   **Method**: `GET`
*   **Endpoint**: `/me`
*   **Access**: Private (Requires JWT in Bearer Token or Cookie)

### 4. User Logout
*   **Method**: `GET`
*   **Endpoint**: `/logout`
*   **Access**: Public

### 5. Update User Details
*   **Method**: `PUT`
*   **Endpoint**: `/updatedetails`
*   **Access**: Private
*   **Body**:
    ```json
    {
      "name": "Updated Name",
      "email": "updated@example.com"
    }
    ```

### 6. Update Password
*   **Method**: `PUT`
*   **Endpoint**: `/updatepassword`
*   **Access**: Private
*   **Body**:
    ```json
    {
      "currentPassword": "oldpassword123",
      "newPassword": "newpassword456"
    }
    ```

### 7. Continue with Google (Redirect-based)
*   **Method**: `GET`
*   **Endpoint**: `/google`
*   **Access**: Public
*   **Description**: Redirects user to Google sign-in.
*   **Callback**: `/google/callback`

### 8. Google Login (Token-based for SPAs)
*   **Method**: `POST`
*   **Endpoint**: `/google`
*   **Access**: Public
*   **Body**:
    ```json
    {
      "googleId": "123456789",
      "email": "jane@example.com",
      "name": "Jane Doe"
    }
    ```

### 9. Forgot Password
*   **Method**: `POST`
*   **Endpoint**: `/forgotpassword`
*   **Access**: Public
*   **Body**:
    ```json
    { "email": "user@example.com" }
    ```
*   **Response**: Sends an email with a reset token.

### 10. Reset Password
*   **Method**: `PUT`
*   **Endpoint**: `/resetpassword/:resettoken`
*   **Access**: Public
*   **Body**:
    ```json
    { "password": "newpassword123" }
    ```

---

## 📅 Event APIs (`/events`)

### 1. Get All Events
*   **Method**: `GET`
*   **Endpoint**: `/`
*   **Access**: Public

### 2. Get Single Event
*   **Method**: `GET`
*   **Endpoint**: `/:id`
*   **Access**: Public

### 3. Find Nearby Events (Location Based)
*   **Method**: `GET`
*   **Endpoint**: `/radius/:lat/:lng/:distance`
*   **Access**: Public
*   **Parameters**:
    *   `lat`: User's latitude (e.g., 28.6139)
    *   `lng`: User's longitude (e.g., 77.2090)
    *   `distance`: Radius in Kilometers (e.g., 50)
*   **Description**: Find all events within a specific radius of the user's current location.

### 4. Create Event
*   **Method**: `POST`
*   **Endpoint**: `/`
*   **Access**: Private (Organizers & Admins)
*   **Body**: Event details (title, description, date, price, location, etc.)

### 5. Update Event
*   **Method**: `PUT`
*   **Endpoint**: `/:id`
*   **Access**: Private (Organizers & Admins)

### 6. Delete Event
*   **Method**: `DELETE`
*   **Endpoint**: `/:id`
*   **Access**: Private (Organizers & Admins)

### 7. Upload Event Image
*   **Method**: `PUT`
*   **Endpoint**: `/:id/photo`
*   **Access**: Private (Organizers & Admins)
*   **Content-Type**: `multipart/form-data`
*   **Body**: `image` (File)
*   **Description**: Upload an image file for the event. Returns the image path.

---

## 🎫 Booking APIs (`/bookings`)

### 1. Create a Booking
*   **Method**: `POST`
*   **Endpoint**: `/`
*   **Access**: Private (Logged-in User)
*   **Body**:
    ```json
    { "eventId": "event_mongo_id" }
    ```

### 2. Get My Bookings
*   **Method**: `GET`
*   **Endpoint**: `/my-bookings`
*   **Access**: Private (Logged-in User)

### 3. Get Event Bookings
*   **Method**: `GET`
*   **Endpoint**: `/event/:eventId`
*   **Access**: Private (Organizers & Admins Only)

### 4. Generate QR Code Ticket
*   **Method**: `GET`
*   **Endpoint**: `/:id/qrcode`
*   **Access**: Private (Attendee or Admin)
*   **Description**: Returns a Base64 Image URL of the QR code for a confirmed booking.

### 5. Cancel Booking
*   **Method**: `DELETE`
*   **Endpoint**: `/:id`
*   **Access**: Private (Owner or Admin)
*   **Description**: Cancels a booking and restores event ticket availability.

### 6. Create Payment Order (Razorpay)
*   **Method**: `POST`
*   **Endpoint**: `/:bookingId/pay`
*   **Access**: Private (Logged-in User)
*   **Description**: Creates a Razorpay Order ID for payment processing.

### 7. Verify Payment
*   **Method**: `POST`
*   **Endpoint**: `/verify`
*   **Access**: Private (Logged-in User)
*   **Body**:
    ```json
    {
      "razorpay_order_id": "order_ID",
      "razorpay_payment_id": "pay_ID",
      "razorpay_signature": "signature"
    }
    ```
*   **Description**: Verifies payment signature and confirms booking.

---

## 🔑 Admin APIs (`/admin`)

### 1. Get All Users
*   **Method**: `GET`
*   **Endpoint**: `/users`
*   **Access**: Private (Admin Only)

### 2. Delete User
*   **Method**: `DELETE`
*   **Endpoint**: `/users/:id`
*   **Access**: Private (Admin Only)

### 3. Get System Statistics (Revenue, Users, Events)
*   **Method**: `GET`
*   **Endpoint**: `/stats`
*   **Access**: Private (Admin Only)

---

## 🤖 AI Concierge APIs (`/ai`)

### 1. AI Chat & Recommendations
*   **Method**: `POST`
*   **Endpoint**: `/chat`
*   **Access**: Public
*   **Body**:
    ```json
    { "message": "Suggest some events for me" }
    ```
*   **Description**: Get intelligent event recommendations and answers from the AI assistant.

---

## 🛠️ Environment Variables Configuration

Ensure your `.env` file contains:
```env
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d

# SMTP (For Forgot Password)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_email@example.com
SMTP_PASSWORD=your_password
FROM_EMAIL=noreply@eventsphere.com
FROM_NAME=EventSphere

# Google OAuth
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
CLIENT_URL=http://localhost:5173

# Razorpay (For Ticket Payments)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```
