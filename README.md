# Assessment Platform

A full-stack web application built using the MERN stack (MongoDB, Express, React, Bun.js) that enables administrators to create assessments with multiple-choice questions, and users to take these assessments via unique links and view their results upon completion.

## Features

### Admin Features:
- Create assessments with titles and descriptions
- Add multiple-choice questions with one correct answer
- Edit and delete existing assessments
- Copy unique assessment URLs to share with responders

### Responder Features:
- Access assessments via unique links
- Answer multiple-choice questions using a step-by-step interface
- Submit responses and view results immediately
- See detailed feedback with correct and incorrect answers

## Architecture

This application follows a modern containerized architecture:

- React SPA client served via Webpack (dev) or Nginx (prod)
- Express.js backend with RESTful API endpoints powered by Bun.js runtime
- MongoDB database for persistent storage
- Docker containers for both development and production environments

## Tech Stack

- **Frontend**: React.js with TypeScript, Material UI
- **Backend**: Bun.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **State Management**: React Hooks
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Containerization**: Docker and Docker Compose
- **Web Server**: Nginx (production)

## Getting Started

### Prerequisites

- Bun.js (v1.1+) - install from [bun.sh](https://bun.sh)
- MongoDB (local instance or MongoDB Atlas)
- Docker and Docker Compose (for containerized deployment)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd assessment-platform
   ```

2. Install dependencies for the server, client, and root:
   ```
   bun run install-all
   ```

3. Configure environment variables:
   - Create a `.env` file in the server directory:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/assessment-platform
     NODE_ENV=development
     ```

   - The client `.env` file is already set up with:
     ```
     REACT_APP_API_URL=http://localhost:5000/api
     ```

### Running the Application

#### Local Development

- Development mode (with hot reloading for both client and server):
  ```
  bun run dev
  ```

- Production mode:
  ```
  bun start
  ```

- Run server only:
  ```
  bun run server
  ```

- Run client only:
  ```
  bun run client
  ```

#### Docker Deployment

##### Development Environment

```bash
# Start the development environment
docker-compose -f docker-compose.dev.yml up

# Stop the development environment
docker-compose -f docker-compose.dev.yml down
```

##### Production Environment

```bash
# Start the production environment
docker-compose -f docker-compose.prod.yml up -d

# Stop the production environment
docker-compose -f docker-compose.prod.yml down
```

##### Deployment Script

For automated production deployment:

```bash
# Make the script executable
chmod +x deploy-prod.sh

# Run the deployment script
./deploy-prod.sh
```

## Project Structure

```
assessment-platform/
├── client/                   # React frontend
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── admin/        # Admin dashboard components
│   │   │   ├── assessment/   # Assessment taking components
│   │   │   └── layout/       # Layout components
│   │   ├── services/         # API services
│   │   ├── types/            # TypeScript type definitions
│   │   └── App.tsx           # Main application component
│   ├── Dockerfile.dev        # Development Docker configuration
│   ├── Dockerfile.prod       # Production Docker configuration
│   └── nginx.conf            # Nginx configuration for production
│
├── server/                   # Express backend
│   ├── config/               # Server configuration
│   ├── controllers/          # API controllers
│   ├── middleware/           # Express middleware
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── Dockerfile.dev        # Development Docker configuration
│   ├── Dockerfile.prod       # Production Docker configuration
│   └── server.js             # Entry point
│
├── docker-compose.dev.yml    # Docker Compose for development
├── docker-compose.prod.yml   # Docker Compose for production
├── docker-bake.hcl           # Docker build configuration
└── deploy-prod.sh            # Production deployment script
```

## API Endpoints

### Assessments
- `GET /api/assessments` - Get all assessments
- `GET /api/assessments/:id` - Get assessment by ID (without answers)
- `GET /api/assessments/:id/with-answers` - Get assessment with answers
- `POST /api/assessments` - Create new assessment
- `PUT /api/assessments/:id` - Update assessment
- `DELETE /api/assessments/:id` - Delete assessment

### Responses
- `POST /api/responses` - Submit response
- `GET /api/responses/:id` - Get response by ID
- `GET /api/responses/assessment/:assessmentId` - Get all responses for an assessment
- `DELETE /api/responses/:id` - Delete response by ID

## Future Enhancements

- Admin authentication using JWT
- Assessment timer
- Result exports (PDF/CSV)
- Email notifications
- Analytics dashboard
- CI/CD pipeline integration

## License

This project is licensed under the [MIT License](./LICENSE).
