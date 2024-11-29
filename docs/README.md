# Campaign Manager API Documentation

## Overview

This API provides endpoints for managing campaign-related activities, including user authentication, task management, event planning, and resource allocation.

## Authentication

All API requests (except registration and login) require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

## Base URLs

- Development: `http://localhost:5000/api`
- Production: `https://api.campaignmanager.com/api`

## Rate Limiting

API requests are limited to:
- 100 requests per 15 minutes per IP address
- Authenticated endpoints have higher limits

## Common Response Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Server Error

## Error Response Format

```json
{
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

#### POST /auth/login
Authenticate user and receive JWT token.

### Tasks

#### GET /tasks
Get list of tasks with pagination and filtering options.

#### POST /tasks
Create a new task.

#### GET /tasks/{id}
Get specific task details.

#### PATCH /tasks/{id}
Update an existing task.

#### DELETE /tasks/{id}
Delete a task.

## Testing the API

You can test the API using the following tools:
1. Swagger UI (available at `/api-docs`)
2. Postman Collection (available in `/docs/postman`)
3. cURL examples (below)

### Example cURL Requests

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "description": "Task description",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59Z"
  }'
```

## WebSocket Events

The API also supports real-time updates through WebSocket connections:

### Events
- `task-update`: Emitted when a task is updated
- `new-message`: Emitted when a new message is created
- `status-change`: Emitted when task status changes

### Example WebSocket Usage
```javascript
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('task-update', (data) => {
  console.log('Task updated:', data);
});
```

## Rate Limits and Quotas

| Endpoint | Rate Limit |
|----------|------------|
| /auth/* | 20 req/15min |
| /tasks/* | 100 req/15min |
| /events/* | 100 req/15min |

## Support

For API support, please contact:
- Email: api-support@campaignmanager.com
- Documentation Issues: Create an issue in the GitHub repository