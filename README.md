# TicketSphere – MERN Ticketing Management System

TicketSphere is a full-stack ticketing and support management system built using the MERN stack (MongoDB, Express.js, React, Node.js).

The platform provides a professional helpdesk workflow with separate User and Admin authentication, structured ticket management, conversation threads, priority handling, and multi-file attachment support.

---

## Technology Stack

### Frontend
- React
- React Router
- REST API integration

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer (file uploads)

---

## Features

### User
- Register and login
- Create support tickets
- Add category and priority
- Upload multiple attachments (up to 6 files)
- View ticket history
- Search and filter tickets
- View conversation thread
- Edit tickets before resolution
- Send messages to admin

### Admin
- Admin login
- View all tickets
- Manage ticket queue
- Update ticket status and priority
- Reply to users
- Add resolution summaries
- Resolve tickets

---

## File Upload Support

Attachments are stored locally in:

```
server/uploads/
```

Files are served through:

```
/uploads/<filename>
```

For production environments, cloud storage such as AWS S3 or Cloudinary is recommended.

---

## Backend Setup

Create a `.env` file inside the server folder.

Example:

```
PORT=5000
ATLAS_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ticket_system
JWT_SECRET=your_jwt_secret
ADMIN_REGISTER_CODE=admin_secret_code
```

Run backend:

```
cd server
npm install
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## Frontend Setup

```
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

Frontend communicates with:

```
http://localhost:5000/api
```

---

## Routes

### Public
- `/`
- `/user/login`
- `/user/register`
- `/admin/login`
- `/admin/register`

### User
- `/user/dashboard`
- `/user/tickets`
- `/user/tickets/new`
- `/user/tickets/:id`
- `/user/tickets/:id/edit`

### Admin
- `/admin/dashboard`
- `/admin/tickets`
- `/admin/tickets/:id`

---

## Future Improvements

- Email notifications
- Real-time ticket updates
- Ticket assignment to admins
- Analytics dashboard
- Cloud storage integration
- Docker deployment

---

Project Status

TicketSphere is a full-stack support and ticket management system prototype demonstrating structured issue tracking, secure authentication, ticket conversations, attachment handling, and admin resolution workflows.

It can be extended into a production-ready helpdesk solution with cloud deployment and enterprise-level support features.

## Author

Chanuth Jayasekera