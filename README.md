# TicketSphere – MERN Ticketing Management System

TicketSphere is a full-stack ticketing and support management system built using the MERN stack (MongoDB, Express.js, React, Node.js).

The platform provides a professional helpdesk workflow with separate User and Admin authentication, structured ticket management, conversation threads, priority handling, and multi-file attachment support.

TicketSphere enables users to create and track support requests while allowing administrators to manage ticket queues, respond to users, and resolve issues efficiently.

---

## Platform Overview

TicketSphere is designed as a modern support and issue-tracking platform with two main roles:

### Users
Users can create and manage their own support tickets.

### Admins
Admins manage all tickets, respond to users, and resolve issues.

The system follows a client-server architecture with a React frontend communicating with a Node.js/Express backend through REST APIs.

---

## Technology Stack

### Frontend
- React
- React Router
- REST API integration
- Component-based UI architecture

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer for file uploads

---

## System Architecture

React Frontend  
      │  
      │ REST API  
      ▼  
Node.js / Express Backend  
      │  
      ▼  
MongoDB Database  

The backend manages authentication, ticket logic, messaging threads, and attachment storage.

---

## Core Features

### User Features

Users can interact with the support system through a dedicated user dashboard.

User capabilities include:

- Register and login
- Create support tickets
- Select ticket category and priority
- Provide contact information
- Upload multiple attachments (up to 6 files)
- View personal ticket list
- Search and filter tickets
- View ticket details and conversation history
- Edit ticket details before resolution
- Send messages inside the ticket thread

---

### Admin Features

Administrators manage the support queue and resolve issues.

Admin capabilities include:

- Admin login
- View all submitted tickets
- Manage ticket queue
- Update ticket status
- Update ticket priority
- Reply to users inside ticket threads
- Add resolution summaries
- Mark tickets as resolved

---

## Ticket Workflow

1. User creates a ticket  
2. Admin reviews the ticket  
3. Admin communicates with the user  
4. Admin updates status and priority if needed  
5. Admin resolves the issue and adds resolution notes  

Once a ticket is resolved, editing is disabled.

---

## File Attachment Support

TicketSphere supports multi-file attachments.

Attachment Rules:

- Maximum 6 files per ticket
- Maximum 15MB per file

Files are stored locally in:

server/uploads/

Files are served through:

/uploads/<filename>

For production environments, cloud storage such as Amazon S3 or Cloudinary is recommended.

---

## Project Structure

TicketSphere

client/  
server/  
server/uploads/.gitkeep  
README.md  
.gitignore  

---

## Environment Configuration

Create a `.env` file inside the **server folder** and add:

PORT=5000  
ATLAS_URI=mongodb://127.0.0.1:27017/ticketsphere  
JWT_SECRET=change_this_to_a_long_random_secret  
ADMIN_REGISTER_CODE=ADMIN123  

Environment Variables:

PORT – Port used by backend server  
ATLAS_URI – MongoDB connection string  
JWT_SECRET – Secret key used for JWT authentication  
ADMIN_REGISTER_CODE – Secret code required for admin registration  

Important: Do NOT upload your `.env` file to GitHub.

---

## Backend Setup

Navigate to the server folder:

```
cd server
```

Install dependencies:

```
npm install
```

Run the backend server:

```
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## Frontend Setup

Install dependencies:

```
npm install
```

Run the React application:

```
npm start
```

Frontend runs on:

```
http://localhost:3000
```

The frontend communicates with the backend API at:

```
http://localhost:5000/api
```

You can override it using:

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

---

## Routes

### Public Routes

/  
/user/login  
/user/register  
/admin/login  
/admin/register  

---

### User Routes (Protected)

/user/dashboard  
/user/tickets  
/user/tickets/new  
/user/tickets/:id  
/user/tickets/:id/edit  

---

### Admin Routes (Protected)

/admin/dashboard  
/admin/tickets  
/admin/tickets/:id  

---

## Security

TicketSphere uses JWT-based authentication and role-based authorization.

Sensitive configuration values such as database connection strings and secrets should always be stored in environment variables.

---

## Future Improvements

Possible future enhancements include:

- Email notifications
- Real-time ticket updates
- Ticket assignment to specific admins
- Admin analytics dashboard
- SLA tracking
- Cloud storage integration
- Docker deployment

---

## Project Status

TicketSphere is a full-stack helpdesk and ticket management system prototype demonstrating authentication, ticket lifecycle management, messaging threads, attachment handling, and admin resolution workflows.

The system can be extended into a production-ready helpdesk platform with additional enterprise features.

---

## Author

Chanuth Jayasekera