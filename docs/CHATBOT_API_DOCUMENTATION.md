# 🤖 Melanoma API - Chat & Consultation Feature Documentation

**Version:** v1  
**Last Updated:** 2026-06-11  
**Status:** Production Ready ✅

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Real-time Features](#real-time-features)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)
9. [Testing](#testing)
10. [FAQ](#faq)

---

## Overview

Chat & Consultation Feature memungkinkan komunikasi real-time antara **Patient** dan **Doctor** untuk diskusi tentang scan hasil AI analysis.

### Key Features

✅ **Consultation Management**
- Patient dapat menginisiasi konsultasi ke doctor
- Doctor dapat menerima dan mengelola multiple consultations
- Status tracking (OPEN/CLOSED)

✅ **Messaging System**
- Send/receive messages dengan attachments
- Pagination support
- Read receipts
- Real-time notifications via SSE

✅ **AI Integration**
- AI analysis details tersedia untuk doctor review
- Confidence scores dan multiple predictions
- Growth tracking untuk follow-up scans

✅ **Prescription Management**
- Doctor dapat membuat prescription dalam konsultasi
- Automated tracking

✅ **Report Generation**
- Automatic report creation ketika konsultasi ditutup
- PDF export support
- Email notification to patient

---

## Quick Start

### 1. Setup Postman Collection

1. Download: `postman-chatbot-api-complete.collection.json`
2. Import ke Postman
3. Update `{{baseUrl}}` variable:
   - **Dev**: `http://localhost:3300`
   - **Staging**: `https://api-staging.myskin.local`
   - **Production**: `https://api.myskin.local`

### 2. Login & Get Tokens

**Patient Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "sarah.johnson@myskin.local",
  "password": "password123"
}

Response:
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "user-123",
    "email": "sarah.johnson@myskin.local",
    "name": "Sarah Johnson",
    "role": "patient"
  }
}
```

**Doctor Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "elena.aris@myskin.local",
  "password": "password123"
}
```

### 3. Get Doctor Profile

```bash
GET /api/v1/doctor/profile
Authorization: Bearer {{doctorToken}}

Response:
{
  "status": "success",
  "data": {
    "id": "doctor-profile-123",
    "userId": "user-456",
    "clinicId": "clinic-kosambi-demo",
    "verificationStatus": "verified",
    "specialization": "Senior Dermatologist"
  }
}
```

### 4. Initiate Consultation

```bash
POST /api/v1/patient/consultations/initiate
Authorization: Bearer {{patientToken}}
Content-Type: application/json

{
  "doctorId": "doctor-profile-123",
  "scanId": "SCAN-SARAH-MAY-2026",
  "initialMessage": "Halo dokter, saya ingin konsultasi terkait hasil scan saya."
}

Response:
{
  "status": "success",
  "message": "Consultation initiated successfully",
  "data": {
    "id": "consultation-123",
    "status": "OPEN",
    "patientId": "patient-123",
    "doctorId": "doctor-123",
    "scanId": "SCAN-SARAH-MAY-2026",
    "createdAt": "2026-06-11T10:30:00Z"
  }
}
```

### 5. Send & Receive Messages

**Patient sends message:**
```bash
POST /api/v1/patient/consultations/consultation-123/messages
Authorization: Bearer {{patientToken}}
Content-Type: application/json

{
  "message": "Dokter, apakah hasil scan ini perlu pemeriksaan lanjutan?"
}

Response:
{
  "status": "success",
  "data": {
    "id": "message-456",
    "message": "Dokter, apakah hasil scan ini perlu pemeriksaan lanjutan?",
    "timestamp": "2026-06-11T10:31:00Z",
    "senderId": "patient-123",
    "sender": {
      "name": "Sarah Johnson",
      "role": "patient"
    }
  }
}
```

**Doctor responds:**
```bash
POST /api/v1/doctor/consultations/consultation-123/messages
Authorization: Bearer {{doctorToken}}
Content-Type: application/json

{
  "message": "Hasil scan menunjukkan benign nevus dengan confidence 86%. Pantau perubahan ukuran dan warna selama 3 bulan ke depan."
}
```

### 6. Get Chat History

```bash
GET /api/v1/patient/consultations/consultation-123/messages?page=1&limit=20
Authorization: Bearer {{patientToken}}

Response:
{
  "status": "success",
  "data": [
    {
      "id": "message-123",
      "message": "Halo dokter...",
      "timestamp": "2026-06-11T10:30:00Z",
      "senderId": "patient-123",
      "sender": { "name": "Sarah Johnson", "role": "patient" }
    },
    {
      "id": "message-456",
      "message": "Dokter, apakah hasil scan ini perlu pemeriksaan lanjutan?",
      "timestamp": "2026-06-11T10:31:00Z",
      "senderId": "patient-123",
      "sender": { "name": "Sarah Johnson", "role": "patient" }
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### 7. Close Consultation

```bash
PATCH /api/v1/doctor/consultations/consultation-123/close
Authorization: Bearer {{doctorToken}}
Content-Type: application/json

{
  "diagnosis": "Benign Melanocytic Nevus",
  "recommendation": "Pantau perubahan ukuran, warna, dan bentuk. Kontrol ulang jika ada perubahan mencurigakan.",
  "notes": "Tidak ada tanda-tanda keganasan.",
  "caseDisposition": "case_resolved",
  "finalClinicalNotes": "Lesion benign berdasarkan gambar dan history.",
  "emailClinicalSummary": true
}

Response:
{
  "status": "success",
  "data": {
    "id": "consultation-123",
    "status": "CLOSED",
    "report": {
      "id": "report-789",
      "title": "Sarah Johnson - Lesion Review Report",
      "diagnosis": "Benign Melanocytic Nevus",
      "recommendation": "...",
      "pdfUrl": "/uploads/reports/report-789.pdf"
    }
  }
}
```

---

## Authentication

### Token-Based Authentication

Semua authenticated endpoints memerlukan JWT token dalam Authorization header:

```
Authorization: Bearer {{token}}
```

### Token Lifecycle

1. **Login** → Dapatkan token (validity: 24 hours)
2. **Use token** → Dalam Authorization header
3. **Token expires** → Login kembali untuk dapatkan token baru

### Refresh Token (Jika diimplementasikan)

```bash
POST /api/auth/refresh-token
Body: {
  "refreshToken": "{{refreshToken}}"
}
```

---

## API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### 👤 Patient Consultation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/patient/consultations/initiate` | Create new consultation |
| GET | `/api/v1/patient/consultations` | List patient consultations |
| GET | `/api/v1/patient/consultations/:id` | Get consultation detail |
| POST | `/api/v1/patient/consultations/:id/messages` | Send message |
| GET | `/api/v1/patient/consultations/:id/messages` | Get chat messages |
| PATCH | `/api/v1/patient/consultations/:id/read` | Mark messages as read |
| PATCH | `/api/v1/patient/consultations/:id/read-all` | Mark all as read |

### 👨‍⚕️ Doctor Consultation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/doctor/consultations` | List doctor consultations |
| GET | `/api/v1/doctor/consultations/:id` | Get consultation detail |
| POST | `/api/v1/doctor/consultations/:id/messages` | Send message |
| GET | `/api/v1/doctor/consultations/:id/messages` | Get chat messages |
| GET | `/api/v1/doctor/consultations/:id/ai-analysis` | Get AI analysis detail |
| PATCH | `/api/v1/doctor/consultations/:id/close` | Close consultation |
| POST | `/api/v1/doctor/consultations/:id/prescriptions` | Create prescription |
| DELETE | `/api/v1/doctor/consultations/:id` | Delete closed consultation |

### 🔄 Real-time

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/patient/consultations/:id/events` | Stream SSE events |
| GET | `/api/v1/doctor/consultations/:id/events` | Stream SSE events |
| POST | `/api/v1/patient/consultations/:id/typing` | Send typing status |
| POST | `/api/v1/doctor/consultations/:id/typing` | Send typing status |

---

## Data Models

### Consultation Model

```json
{
  "id": "consultation-123",
  "scanId": "SCAN-SARAH-MAY-2026",
  "patientId": "patient-123",
  "doctorId": "doctor-profile-456",
  "status": "OPEN",
  "createdAt": "2026-06-11T10:30:00Z",
  "updatedAt": "2026-06-11T10:31:00Z",
  "patient": { /* user object */ },
  "doctor": { /* doctor profile object */ },
  "scan": { /* scan object */ },
  "messages": [ /* chat messages */ ],
  "report": null
}
```

### ChatMessage Model

```json
{
  "id": "message-123",
  "consultationId": "consultation-123",
  "senderId": "patient-123",
  "message": "Halo dokter...",
  "timestamp": "2026-06-11T10:31:00Z",
  "sender": {
    "id": "patient-123",
    "name": "Sarah Johnson",
    "role": "patient",
    "avatarUrl": "/uploads/avatars/sarah.jpg"
  },
  "attachments": [
    {
      "id": "file-123",
      "filename": "photo.jpg",
      "url": "/uploads/chat-attachments/file-123.jpg",
      "mimeType": "image/jpeg",
      "size": 204800
    }
  ],
  "readReceipts": [
    {
      "userId": "doctor-123",
      "readAt": "2026-06-11T10:32:00Z"
    }
  ]
}
```

### Scan Model (in Consultation)

```json
{
  "id": "scan-456",
  "scanId": "SCAN-SARAH-MAY-2026",
  "patientId": "patient-123",
  "imageUrl": "/uploads/demo/lesion-followup-2.jpg",
  "complaint": "Follow-up scan after noticing the spot became slightly darker.",
  "bodySite": "Left forearm",
  "isAnalyzed": true,
  "aiPrediction": "Melanocytic Nevus",
  "aiConfidence": 0.86,
  "aiDetails": {
    "source": "demo-seed",
    "growthPercentage": 14,
    "labels": [
      { "label": "Melanocytic Nevus", "confidence": 0.86 },
      { "label": "Malignant Melanoma", "confidence": 0.14 }
    ]
  },
  "analyzeCompletedAt": "2026-05-12T09:00:00Z",
  "uploadedAt": "2026-05-12T08:45:00Z"
}
```

### Report Model (when consultation closed)

```json
{
  "id": "report-789",
  "scanId": "scan-456",
  "patientId": "patient-123",
  "title": "Sarah Johnson - Lesion Review Report",
  "description": "Report from consultation dated 2026-06-11",
  "diagnosis": "Benign Melanocytic Nevus",
  "recommendation": "Pantau perubahan ukuran, warna, dan bentuk. Kontrol ulang jika ada perubahan.",
  "caseDisposition": "case_resolved",
  "finalClinicalNotes": "Lesion benign berdasarkan gambar dan history.",
  "status": "approved",
  "approvedByDoctorId": "doctor-456",
  "approvedAt": "2026-06-11T10:35:00Z",
  "pdfUrl": "/uploads/reports/report-789.pdf",
  "createdAt": "2026-06-11T10:35:00Z"
}
```

---

## Real-time Features

### Server-Sent Events (SSE)

Endpoint untuk stream real-time events:

```bash
GET /api/v1/patient/consultations/:consultationId/events
Authorization: Bearer {{patientToken}}
```

**Event Types:**

| Event Type | Description | Payload |
|------------|-------------|---------|
| `connection:ready` | Connection established | `{ userId, consultationId }` |
| `message:new` | New message received | `{ message object }` |
| `typing:status` | User typing indicator | `{ userId, isTyping }` |
| `message:read` | Message marked as read | `{ messageId, userId }` |
| `status:change` | Consultation status changed | `{ status, changedAt }` |
| `keep-alive` | Keep-alive ping | `: keep-alive` |

**Example Client Implementation (JavaScript):**

```javascript
const eventSource = new EventSource(
  'http://localhost:3300/api/v1/patient/consultations/consultation-123/events',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

eventSource.addEventListener('message:new', (e) => {
  const message = JSON.parse(e.data);
  console.log('New message:', message);
  // Update UI
});

eventSource.addEventListener('typing:status', (e) => {
  const { userId, isTyping } = JSON.parse(e.data);
  console.log(`User ${userId} is ${isTyping ? 'typing' : 'not typing'}`);
  // Show/hide typing indicator
});

eventSource.addEventListener('error', () => {
  eventSource.close();
  // Reconnect logic
});
```

### Typing Status

Publish typing status untuk consultation participants:

```bash
POST /api/v1/patient/consultations/consultation-123/typing
Authorization: Bearer {{patientToken}}
Content-Type: application/json

{
  "isTyping": true
}
```

**Best Practices:**
- Send `isTyping: true` ketika user mulai mengetik
- Send `isTyping: false` ketika user berhenti (atau max 3 detik)
- Don't spam: debounce requests (max 1x per 300ms)

---

## Error Handling

### Standard Error Response

```json
{
  "status": "error",
  "message": "Deskripsi error yang user-friendly",
  "code": "ERROR_CODE",
  "timestamp": "2026-06-11T10:35:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request berhasil |
| 201 | Created | Resource dibuat |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Token tidak valid |
| 403 | Forbidden | Tidak punya akses |
| 404 | Not Found | Resource tidak ditemukan |
| 409 | Conflict | Resource sudah ada |
| 500 | Server Error | Error di server |

### Common Error Cases

#### 1. Consultation Not Found
```json
{
  "status": "error",
  "message": "Consultation not found",
  "code": "CONSULTATION_NOT_FOUND"
}
```

#### 2. Unauthorized Access
```json
{
  "status": "error",
  "message": "You do not have permission to access this consultation",
  "code": "UNAUTHORIZED_ACCESS"
}
```

#### 3. Consultation Already Closed
```json
{
  "status": "error",
  "message": "Cannot send message to a closed consultation",
  "code": "CONSULTATION_CLOSED"
}
```

#### 4. Doctor Profile Not Found
```json
{
  "status": "error",
  "message": "Doctor profile not found",
  "code": "DOCTOR_NOT_FOUND"
}
```

---

## Best Practices

### 1. Message Handling

✅ **DO:**
- Validate message content before sending
- Handle attachment uploads asynchronously
- Implement pagination for chat history
- Cache messages locally for better UX

❌ **DON'T:**
- Send empty messages
- Upload files > 5MB each
- Send more than 5 attachments per message
- Poll for new messages (use SSE instead)

### 2. Real-time Features

✅ **DO:**
- Keep SSE connection alive
- Implement auto-reconnect on disconnect
- Debounce typing status updates
- Use exponential backoff for retries

❌ **DON'T:**
- Create multiple SSE connections
- Send typing status every keystroke
- Ignore connection errors
- Hard-code keep-alive interval

### 3. Consultation Workflow

✅ **DO:**
- Get doctor profile before initiate consultation
- Check consultation status before sending messages
- Provide helpful error messages to users
- Log events for debugging

❌ **DON'T:**
- Initiate multiple consultations for same scan
- Try to close already closed consultation
- Send messages to closed consultation
- Delete active consultations

### 4. Token Management

✅ **DO:**
- Store token securely (httpOnly cookie atau secure storage)
- Refresh token before expiry
- Handle 401 errors gracefully
- Clear token on logout

❌ **DON'T:**
- Store token in localStorage (XSS risk)
- Send token in URL parameters
- Reuse token across devices
- Ignore token expiry

### 5. Performance

✅ **DO:**
- Implement pagination for lists
- Cache doctor profiles
- Debounce API calls
- Lazy load messages

❌ **DON'T:**
- Load all messages at once
- Make blocking API calls
- Repeat API calls for same data
- Poll for updates frequently

---

## Testing

### Manual Testing with Postman

1. **Import Collection**: `postman-chatbot-api-complete.collection.json`
2. **Run Workflows**: Gunakan pre-built workflows
3. **Check Response**: Verify status dan data structure

### Automated Testing

```javascript
// Example Jest test
describe('Chat Consultation API', () => {
  let patientToken, doctorToken, consultationId;

  test('Patient can login', async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'sarah.johnson@myskin.local',
        password: 'password123'
      })
    });
    
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.token).toBeTruthy();
    patientToken = data.token;
  });

  test('Doctor can receive consultation', async () => {
    const res = await fetch('/api/v1/doctor/consultations', {
      headers: {
        'Authorization': `Bearer ${doctorToken}`
      }
    });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('Can send message in consultation', async () => {
    const res = await fetch(
      `/api/v1/patient/consultations/${consultationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${patientToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Test message'
        })
      }
    );
    
    expect(res.status).toBe(201);
  });
});
```

### Test Scenarios

1. **Happy Path**: Full consultation workflow
2. **Error Cases**: Invalid inputs, unauthorized access
3. **Edge Cases**: Empty messages, concurrent requests
4. **Performance**: Large message history, many consultations

---

## FAQ

### Q1: Berapa lama token valid?
**A:** Token valid 24 jam. Setelah itu, user harus login kembali.

### Q2: Bagaimana jika SSE connection terputus?
**A:** Client harus implement auto-reconnect logic dengan exponential backoff.

### Q3: Apakah bisa mengirim file dalam pesan?
**A:** Ya, support attachment hingga 5 file per pesan (max 5MB per file).

### Q4: Bagaimana jika consultation dihapus?
**A:** Hanya closed consultation yang bisa dihapus oleh doctor yang create.

### Q5: Apakah report otomatis digenerate?
**A:** Ya, report otomatis dibuat ketika doctor close consultation.

### Q6: Berapa attachment size limit?
**A:** Max 5MB per file, max 5 file per message. Total max 25MB per message.

### Q7: Bisa patient lihat AI analysis?
**A:** Patient bisa melihat basic AI info. Full analysis hanya untuk doctor.

### Q8: Bagaimana handle timeout consultation?
**A:** Consultation tidak ada auto-close. Hanya doctor yang bisa close.

### Q9: Support multiple language?
**A:** Depend pada client implementation. API tidak restrict language.

### Q10: Bagaimana track conversation history?
**A:** Semua messages disimpan di database dengan timestamp. Support pagination.

---

## Support & Contact

- **API Documentation**: [docs.myskin.local](https://docs.myskin.local)
- **Bug Report**: [github.com/melanoma-api/issues](https://github.com/melanoma-api/issues)
- **Email Support**: support@myskin.local
- **Slack Channel**: #melanoma-api-support

---

**Last Updated:** 2026-06-11  
**API Version:** v1  
**Status:** Production Ready ✅
