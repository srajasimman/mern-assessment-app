# Assessment Platform

A full-stack web application built using the MERN stack (MongoDB, Express, React, Node.js) that enables administrators to create assessments with multiple-choice questions, and users to take these assessments via unique links and view their results upon completion.

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

## Tech Stack

- **Frontend**: React.js with TypeScript, Material UI
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **State Management**: React Hooks
- **Routing**: React Router v6
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (local instance or MongoDB Atlas)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd assessment-platform
   ```

2. Install dependencies for the server, client, and root:
   ```
   npm run install-all
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

- Development mode (with hot reloading for both client and server):
  ```
  npm run dev
  ```

- Production mode:
  ```
  npm start
  ```

- Run server only:
  ```
  npm run server
  ```

- Run client only:
  ```
  npm run client
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

## Future Enhancements

- Admin authentication using JWT
- Assessment timer
- Result exports (PDF/CSV)
- Email notifications
- Analytics dashboard

## License

This project is licensed under the MIT License.