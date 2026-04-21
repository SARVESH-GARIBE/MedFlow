## MedFlow Backend API Documentation

Base URL: `/api/v1`

---

## Patient APIs

### Register Patient

- **URL**: `POST /api/v1/patients/register`
- **Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123",
  "phone": "9876543210",
  "gender": "male",
  "dateOfBirth": "1990-01-01"
}
```

- **Example Response**:

```json
{
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "_id": "665f1f6c9a7c3a0012a1bcde",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "gender": "male",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "createdAt": "2024-06-05T12:00:00.000Z",
    "updatedAt": "2024-06-05T12:00:00.000Z"
  }
}
```

### Login Patient

- **URL**: `POST /api/v1/patients/login`
- **Body**:

```json
{
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

- **Example Response**:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "665f1f6c9a7c3a0012a1bcde",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "gender": "male",
    "dateOfBirth": "1990-01-01T00:00:00.000Z"
  }
}
```

---

## Doctor APIs

### Create Doctor

- **URL**: `POST /api/v1/doctors`
- **Body**:

```json
{
  "name": "Dr. Smith",
  "email": "drsmith@example.com",
  "password": "StrongPassword123",
  "specialization": "Cardiology",
  "fee": 800,
  "experience": "10 years",
  "qualifications": "MBBS, MD",
  "location": "City Hospital",
  "about": "Experienced cardiologist"
}
```

- **Example Response**:

```json
{
  "availability": "Available",
  "patients": "",
  "rating": 0,
  "fee": 800,
  "_id": "665f200b9a7c3a0012a1bcdf",
  "name": "Dr. Smith",
  "email": "drsmith@example.com",
  "specialization": "Cardiology",
  "experience": "10 years",
  "qualifications": "MBBS, MD",
  "location": "City Hospital",
  "about": "Experienced cardiologist",
  "schedule": {},
  "createdAt": "2024-06-05T12:10:00.000Z",
  "updatedAt": "2024-06-05T12:10:00.000Z"
}
```

### List Doctors

- **URL**: `GET /api/v1/doctors`
- **Example Response**:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "665f200b9a7c3a0012a1bcdf",
      "name": "Dr. Smith",
      "email": "drsmith@example.com",
      "specialization": "Cardiology",
      "fee": 800,
      "availability": "Available",
      "schedule": {},
      "patients": "",
      "rating": 0
    }
  ]
}
```

### Update Doctor Availability

- **URL**: `PATCH /api/v1/doctors/:id/availability`
- **Body**:

```json
{
  "availability": "Unavailable"
}
```

- **Example Response**:

```json
{
  "success": true,
  "data": {
    "_id": "665f200b9a7c3a0012a1bcdf",
    "name": "Dr. Smith",
    "email": "drsmith@example.com",
    "availability": "Unavailable",
    "specialization": "Cardiology",
    "fee": 800
  }
}
```

### Update Doctor Schedule

- **URL**: `PATCH /api/v1/doctors/:id/schedule`
- **Body**:

```json
{
  "schedule": {
    "monday": ["10:00 AM", "11:00 AM"],
    "tuesday": ["02:00 PM", "03:00 PM"]
  }
}
```

- **Example Response**:

```json
{
  "success": true,
  "data": {
    "_id": "665f200b9a7c3a0012a1bcdf",
    "name": "Dr. Smith",
    "schedule": {
      "monday": ["10:00 AM", "11:00 AM"],
      "tuesday": ["02:00 PM", "03:00 PM"]
    }
  }
}
```

---

## Appointment APIs

### Book Appointment

- **URL**: `POST /api/v1/appointments`
- **Body**:

```json
{
  "patient": "665f1f6c9a7c3a0012a1bcde",
  "doctor": "665f200b9a7c3a0012a1bcdf",
  "appointmentDate": "2024-06-10T10:00:00.000Z",
  "timeSlot": "10:00 AM",
  "symptoms": "Chest pain"
}
```

- **Example Response**:

```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "665f20d79a7c3a0012a1bce0",
    "patient": "665f1f6c9a7c3a0012a1bcde",
    "doctor": "665f200b9a7c3a0012a1bcdf",
    "department": "Cardiology",
    "appointmentDate": "2024-06-10T10:00:00.000Z",
    "timeSlot": "10:00 AM",
    "symptoms": "Chest pain",
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2024-06-05T12:15:00.000Z",
    "updatedAt": "2024-06-05T12:15:00.000Z"
  }
}
```

### Get Patient Appointments

- **URL**: `GET /api/v1/appointments/patient/:patientId`
- **Example Response**:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "665f20d79a7c3a0012a1bce0",
      "patient": "665f1f6c9a7c3a0012a1bcde",
      "doctor": {
        "_id": "665f200b9a7c3a0012a1bcdf",
        "name": "Dr. Smith",
        "specialization": "Cardiology"
      },
      "appointmentDate": "2024-06-10T10:00:00.000Z",
      "timeSlot": "10:00 AM",
      "status": "pending",
      "paymentStatus": "pending"
    }
  ]
}
```

### Get Doctor Appointments

- **URL**: `GET /api/v1/appointments/doctor/:doctorId`
- **Example Response**:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "665f20d79a7c3a0012a1bce0",
      "patient": {
        "_id": "665f1f6c9a7c3a0012a1bcde",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "doctor": "665f200b9a7c3a0012a1bcdf",
      "appointmentDate": "2024-06-10T10:00:00.000Z",
      "timeSlot": "10:00 AM",
      "status": "pending",
      "paymentStatus": "pending"
    }
  ]
}
```

### Update Appointment Status

- **URL**: `PATCH /api/v1/appointments/:id/status`
- **Body**:

```json
{
  "status": "confirmed"
}
```

- **Example Response**:

```json
{
  "success": true,
  "message": "Appointment status updated",
  "data": {
    "_id": "665f20d79a7c3a0012a1bce0",
    "status": "confirmed",
    "paymentStatus": "pending"
  }
}
```

---

## Payment APIs

### Create Razorpay Order

- **URL**: `POST /api/v1/payments/create-order`
- **Body**:

```json
{
  "appointmentId": "665f20d79a7c3a0012a1bce0"
}
```

- **Example Response**:

```json
{
  "success": true,
  "order": {
    "id": "order_N1234567890",
    "amount": 80000,
    "currency": "INR",
    "receipt": "665f20d79a7c3a0012a1bce0",
    "status": "created"
  }
}
```

### Verify Razorpay Payment

- **URL**: `POST /api/v1/payments/verify`
- **Body**:

```json
{
  "razorpay_order_id": "order_N1234567890",
  "razorpay_payment_id": "pay_N0987654321",
  "razorpay_signature": "generated_signature_here",
  "appointmentId": "665f20d79a7c3a0012a1bce0"
}
```

- **Example Response**:

```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

---

## Admin APIs

### Get All Appointments (Admin)

- **URL**: `GET /api/v1/admin/appointments`
- **Example Response**:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "665f20d79a7c3a0012a1bce0",
      "patient": {
        "_id": "665f1f6c9a7c3a0012a1bcde",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "doctor": {
        "_id": "665f200b9a7c3a0012a1bcdf",
        "name": "Dr. Smith",
        "specialization": "Cardiology"
      },
      "appointmentDate": "2024-06-10T10:00:00.000Z",
      "timeSlot": "10:00 AM",
      "status": "confirmed",
      "paymentStatus": "paid"
    }
  ]
}
```

