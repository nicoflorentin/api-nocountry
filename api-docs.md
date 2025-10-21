### crud user
create user
get user by id
get all users
delete user by id

### crud doctor
create doctor
get doctor by id
get all doctors
get doctors by patient id
edit doctor by id
delete doctor by id

### crud patient
create patient
get patient by id
get all patients
edit patient by id
delete patient by id

### crud health summarie
create health summarie
get health summarie by id
get health summaries by patient
edit health summarie by id
delete health summarie by id

### crud availabilities
create availabilitie
get all availabilities by doctor
edit availabilitie by id
delete availabilities by id

### crud appointments
create appointment
get all appointments by patient id
get all appointments by doctor id
edit appointment by id
delete appointments by id

### crud medical consultation detail
create medical consultation detail
get all medical consultation detail by patient id
get all medical consultation detail by doctor id
edit medical consultation detail by id
delete medical consultation detail by id

### crud attached documentation
create attached documentation
get all attached documentation by medical consultation detail id
edit attached documentation by id
delete attached documentation by id



# 🏥 API Endpoints - Sistema Médico Completo

## 🔐 Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token
GET    /api/auth/me
PATCH  /api/auth/change-password
```

## 👤 Users
```
POST   /api/users                    // Create user (admin only)
GET    /api/users                    // Get all users (admin only)
GET    /api/users/:id                // Get user by id
PATCH  /api/users/:id                // Edit user
DELETE /api/users/:id                // Delete user (admin only)
PATCH  /api/users/:id/activate       // Activate/deactivate
POST   /api/users/:id/avatar         // Upload avatar
```

## 🩺 Doctors
```
POST   /api/doctors                  // Create doctor
GET    /api/doctors                  // Get all doctors
GET    /api/doctors/:id              // Get doctor by id
GET    /api/doctors/patient/:id      // Get doctors by patient id
GET    /api/doctors/specialty/:id    // Get doctors by specialty
GET    /api/doctors/search           // Search (query params)
PATCH  /api/doctors/:id              // Edit doctor
DELETE /api/doctors/:id              // Delete doctor
```

## 🤒 Patients
```
POST   /api/patients                 // Create patient
GET    /api/patients                 // Get all patients
GET    /api/patients/:id             // Get patient by id
GET    /api/patients/search          // Search (query params)
PATCH  /api/patients/:id             // Edit patient
DELETE /api/patients/:id             // Delete patient
GET    /api/patients/:id/medical-history    // Complete medical history
GET    /api/patients/:id/timeline            // Medical timeline
```

## 🏥 Specialties
```
POST   /api/specialties              // Create specialty
GET    /api/specialties              // Get all specialties
GET    /api/specialties/:id          // Get specialty by id
PATCH  /api/specialties/:id          // Edit specialty
DELETE /api/specialties/:id          // Delete specialty
```

## 🔗 Doctor-Patients Relationship
```
POST   /api/doctor-patients                    // Assign patient to doctor
GET    /api/doctor-patients/doctor/:id         // Get patients of doctor
GET    /api/doctor-patients/patient/:id        // Get doctors of patient
PATCH  /api/doctor-patients/:id/status         // Change status (active/inactive)
DELETE /api/doctor-patients/:id                // Unlink relationship
```

## 📊 Health Summaries
```
POST   /api/health-summaries                   // Create health summary
GET    /api/health-summaries/:id               // Get health summary by id
GET    /api/health-summaries/patient/:id       // Get by patient
GET    /api/health-summaries/patient/:id/latest // Latest summary
PATCH  /api/health-summaries/:id               // Edit health summary
DELETE /api/health-summaries/:id               // Delete health summary
```

## 📅 Availabilities
```
POST   /api/availabilities                     // Create availability
POST   /api/availabilities/bulk                // Create multiple
GET    /api/availabilities/doctor/:id          // Get all by doctor
GET    /api/availabilities/:id                 // Get by id
PATCH  /api/availabilities/:id                 // Edit availability
DELETE /api/availabilities/:id                 // Delete availability
GET    /api/availabilities/doctor/:id/slots    // Generate time slots
```

## 🗓️ Appointments
```
POST   /api/appointments                       // Create appointment
GET    /api/appointments/patient/:id           // Get by patient id
GET    /api/appointments/doctor/:id            // Get by doctor id
GET    /api/appointments/:id                   // Get by id
GET    /api/appointments/available/:doctorId   // Available slots
GET    /api/appointments/upcoming/:patientId   // Upcoming appointments
GET    /api/appointments/history/:patientId    // Appointment history (no es prioridad)
PATCH  /api/appointments/:id                   // Edit appointment
PATCH  /api/appointments/:id/cancel            // Cancel appointment
PATCH  /api/appointments/:id/complete          // Mark as completed
PATCH  /api/appointments/:id/confirm           // Confirm appointment
DELETE /api/appointments/:id                   // Delete appointment
```

## 📝 Medical Consultations Detail
```
POST   /api/medical-consultations              // Create consultation
GET    /api/medical-consultations/:id          // Get by id
GET    /api/medical-consultations/patient/:id  // Get by patient id
GET    /api/medical-consultations/doctor/:id   // Get by doctor id
GET    /api/medical-consultations/appointment/:id // Get by appointment
PATCH  /api/medical-consultations/:id          // Edit consultation
DELETE /api/medical-consultations/:id          // Delete consultation
```

## 📎 Attached Documentation
```
POST   /api/attachments                        // Create attachment
GET    /api/attachments/consultation/:id       // Get by consultation id
GET    /api/attachments/patient/:id            // Get by patient id
GET    /api/attachments/:id                    // Get by id
PATCH  /api/attachments/:id                    // Edit attachment (no es prioridad)
DELETE /api/attachments/:id                    // Delete attachment
POST   /api/attachments/upload                 // Upload file
```

## 📊 Dashboard & Statistics
```
GET    /api/dashboard/admin                    // Admin dashboard stats
GET    /api/dashboard/doctor/:id               // Doctor dashboard
GET    /api/dashboard/patient/:id              // Patient dashboard
GET    /api/stats/appointments                 // Appointment statistics
GET    /api/stats/patients                     // Patient statistics
GET    /api/stats/doctors                      // Doctor statistics
```

## 🔔 Notifications (Opcional)
```
GET    /api/notifications/:userId              // Get user notifications
POST   /api/notifications                      // Create notification
PATCH  /api/notifications/:id/read             // Mark as read
DELETE /api/notifications/:id                  // Delete notification
```

---

## 📌 Notas Importantes

### Query Parameters Comunes
```typescript
// Paginación
?page=1&limit=10

// Ordenamiento
?sortBy=created_at&order=desc

// Filtros
?status=active&date=2025-01-01

// Búsqueda
?search=john&searchFields=first_name,last_name
```

### Response Format Estándar
```typescript
{
  success: boolean,
  data: any,
  message?: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```
