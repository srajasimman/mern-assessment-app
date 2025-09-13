# MERN Assessment Platform

A modern full-stack web application built with MongoDB, Express.js, React.js, and **Bun.js** that enables administrators to create interactive assessments and users to take them through unique shareable links.

## 🚀 Features

### 👨‍💼 Admin Features
- **Assessment Management**: Create, edit, and delete assessments with intuitive UI
- **Question Builder**: Add multiple-choice questions with customizable options
- **Results Analytics**: View detailed results and analytics for each assessment
- **Unique Links**: Generate and share unique assessment URLs
- **Real-time Updates**: Live dashboard updates as responses come in

### 👥 User Features
- **Seamless Access**: Access assessments via unique links (no registration required)
- **Step-by-step Interface**: Clean, intuitive question-by-question navigation
- **Instant Results**: View detailed feedback immediately after submission
- **Progress Tracking**: Visual progress indicator throughout the assessment
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🏗️ Architecture

This application follows modern containerized microservices architecture:

- **Frontend**: React SPA with TypeScript and Material-UI
- **Backend**: Express.js API server powered by **Bun.js runtime**
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Docker containers with production-ready configuration
- **Reverse Proxy**: Nginx for static file serving and load balancing

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React.js, TypeScript, Material-UI, React Router v6 |
| **Backend** | **Bun.js**, Express.js, Mongoose ODM |
| **Database** | MongoDB |
| **Development** | **Bun.js** (package manager), Hot reloading, TypeScript |
| **Deployment** | Docker, Docker Compose, Nginx |
| **HTTP Client** | Axios |
| **Testing** | React Testing Library, Jest |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **[Node.js](https://nodejs.org)** (v18.0 or higher) - JavaScript runtime
- **[pnpm](https://pnpm.io)** (v8.0 or higher) - Fast, disk space efficient package manager
- **[MongoDB](https://www.mongodb.com/try/download/community)** (v5.0+) or MongoDB Atlas account
- **[Docker](https://www.docker.com/get-started)** and **Docker Compose** (for containerized deployment)
- **Git** for version control

### Installing pnpm

```bash
# On macOS/Linux/Windows
npm install -g pnpm

# Or using Homebrew on macOS
brew install pnpm

# Verify installation
pnpm --version
```

## 🚀 Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/srajasimman/mern-assessment-app.git
cd mern-assessment-app
```

### 2️⃣ Install Dependencies

Use our convenient setup script to install all dependencies:

```bash
# Install all dependencies for root, server, and client
pnpm run install-all

# Or install manually:
bun install                    # Root dependencies
bun install --cwd server      # Server dependencies
bun install --cwd client      # Client dependencies
```

### 3️⃣ Environment Configuration

Create environment files for local development:

**Server environment** (`server/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/assessment-platform
# Optional: Add JWT secret for future auth features
# JWT_SECRET=your-super-secret-jwt-key
```

**Client environment** (`client/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
# Optional: Add other environment-specific variables
# REACT_APP_ENVIRONMENT=development
```

### 4️⃣ Start Development Servers

```bash
# Start both client and server with hot reloading
pnpm run dev

# Or start them individually:
pnpm run server    # Start server only (http://localhost:5000)
pnpm run client    # Start client only (http://localhost:3000)
```

🎉 **That's it!** Your application should now be running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api## 💻 Development Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start both client and server in development mode |
| `pnpm run server` | Start server only with hot reloading |
| `pnpm run server:dev` | Start server in development mode |
| `pnpm run client` | Start client development server |
| `pnpm start` | Start both services in production mode |
| `pnpm run install-all` | Install dependencies for all projects |
| `pnpm --filter client run build` | Build client for production |

## 🐳 Docker Deployment

### Development with Docker

```bash
# Start all services (MongoDB, Server, Client)
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Production Deployment

The application includes a comprehensive deployment setup:

```bash
# Build and deploy production environment
./setup.sh start

# View deployment status
./setup.sh status

# View logs from all services
./setup.sh logs

# Stop all services
./setup.sh stop

# Complete cleanup
./setup.sh clean
```

### Environment Variables for Docker

You can customize deployment using environment variables:

```bash
# Set environment variables
export APP_NAME=my-assessment-app
export REGISTRY_REPO=myregistry/myuser
export SERVER_VERSION=v1.0.0
export CLIENT_VERSION=v1.0.0

# Deploy with custom settings
docker compose up -d
```

## 📁 Project Structure

```
mern-assessment-app/
├── 📁 client/                    # React.js Frontend
│   ├── 📁 public/                # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/        # React components
│   │   │   ├── 📁 admin/         # Admin dashboard components
│   │   │   ├── 📁 assessment/    # Assessment taking components
│   │   │   └── 📁 layout/        # Shared layout components
│   │   ├── 📁 services/          # API service functions
│   │   ├── 📁 types/             # TypeScript type definitions
│   │   └── 📄 App.tsx            # Main React application
│   ├── 📄 Dockerfile             # Client container configuration
│   ├── 📄 nginx.conf             # Nginx config for production
│   └── 📄 package.json           # Client dependencies
│
├── 📁 server/                    # Bun.js Backend
│   ├── 📁 config/                # Database and app configuration
│   ├── 📁 controllers/           # API endpoint controllers
│   ├── 📁 middleware/            # Express middleware functions
│   ├── 📁 models/                # Mongoose data models
│   ├── 📁 routes/                # API route definitions
│   ├── 📄 server.js              # Main server entry point
│   ├── 📄 Dockerfile             # Server container configuration
│   └── 📄 package.json           # Server dependencies
│
├── 📁 sample-assessments/        # Example assessment data
├── 📁 backups/                   # Database backup files
├── 📄 docker-compose.yml         # Multi-container configuration
├── 📄 docker-bake.hcl            # Advanced Docker build config
├── 📄 setup.sh                   # Development setup script
├── 📄 MIGRATION.md               # Bun.js migration documentation
└── 📄 README.md                  # This file
```

## 🔌 API Documentation

### Assessment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/assessments` | Retrieve all assessments | ❌ |
| `GET` | `/api/assessments/:id` | Get specific assessment (public view) | ❌ |
| `GET` | `/api/assessments/:id/with-answers` | Get assessment with correct answers | ❌ |
| `POST` | `/api/assessments` | Create new assessment | ❌ |
| `PUT` | `/api/assessments/:id` | Update existing assessment | ❌ |
| `DELETE` | `/api/assessments/:id` | Delete assessment | ❌ |

### Response Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/responses` | Submit assessment response | ❌ |
| `GET` | `/api/responses/:id` | Get specific response | ❌ |
| `GET` | `/api/responses/assessment/:assessmentId` | Get all responses for assessment | ❌ |
| `DELETE` | `/api/responses/:id` | Delete response | ❌ |

### Example API Usage

**Create Assessment:**
```bash
curl -X POST http://localhost:5000/api/assessments \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Basics",
    "description": "Test your knowledge of JavaScript fundamentals",
    "questions": [
      {
        "question": "What is the output of typeof null?",
        "options": ["null", "undefined", "object", "string"],
        "correctAnswer": 2
      }
    ]
  }'
```

**Submit Response:**
```bash
curl -X POST http://localhost:5000/api/responses \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentId": "assessment_id_here",
    "responses": [{ "questionIndex": 0, "selectedOption": 2 }]
  }'
```

## 🚀 Performance & Benefits

### Why pnpm?

| Feature | pnpm | npm |
|---------|------|-----|
| **Package Installation** | ⚡ Up to 2x faster | ⏳ Standard speed |
| **Disk Space** | 💾 Symlinked storage, saves ~70% space | 📊 Duplicated packages |
| **Security** | 🔒 Strict dependency isolation | 🌐 Flat node_modules |
| **Monorepo Support** | ✅ Built-in workspace support | 🔧 Requires workspaces config |
| **Dependency Management** | 📦 Strict by default | 📈 Hoisting issues possible |

### Benchmarks
- **Package Install**: ~30% faster than npm
- **Disk Usage**: Up to 70% less space used
- **CI/CD Performance**: Faster cache hits and installs
- **Workspace Management**: Superior monorepo handling

## 🛠️ Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill processes using ports 3000 or 5000
lsof -ti:3000,5000 | xargs kill -9

# Or use different ports
PORT=3001 pnpm run client
PORT=5001 pnpm run server
```

**MongoDB Connection Issues:**
```bash
# Start MongoDB locally
brew services start mongodb-community

# Or use Docker
docker run --name mongodb -d -p 27017:27017 mongo:latest

# Check MongoDB status
brew services list | grep mongo
```

**pnpm Installation Issues:**
```bash
# Reinstall pnpm
npm install -g pnpm

# Clear pnpm cache
pnpm store prune

# Verify installation
pnpm --version
```

**Build Errors:**
```bash
# Clear all node_modules and reinstall
rm -rf node_modules server/node_modules client/node_modules
rm -f pnpm-lock.yaml server/pnpm-lock.yaml client/pnpm-lock.yaml
pnpm run install-all
```

## 🔮 Roadmap & Future Enhancements

### 🎯 Phase 1 (Current)
- ✅ Assessment creation and management
- ✅ Multiple-choice questions
- ✅ Real-time results
- ✅ Bun.js migration
- ✅ Docker containerization

### 🚀 Phase 2 (Upcoming)
- 🔐 **Authentication & Authorization**: JWT-based admin authentication
- ⏱️ **Timed Assessments**: Configurable time limits per assessment
- 📊 **Enhanced Analytics**: Detailed performance metrics and insights
- 📧 **Email Notifications**: Automated result delivery
- 🎨 **Theming**: Customizable assessment appearance

### 💡 Phase 3 (Future)
- 🧠 **Question Types**: True/false, fill-in-the-blank, essay questions
- 📈 **Advanced Reporting**: Exportable reports (PDF/CSV)
- 🔗 **Integrations**: LMS integration, webhooks
- 🌐 **Multi-language**: i18n support
- 📱 **Mobile App**: React Native companion app

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/mern-assessment-app.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Install** dependencies: `bun run install-all`
5. **Make** your changes
6. **Test** thoroughly: `bun test`
7. **Commit** changes: `git commit -m 'Add amazing feature'`
8. **Push** to branch: `git push origin feature/amazing-feature`
9. **Submit** a Pull Request

### Code Standards

- **TypeScript**: Use TypeScript for type safety
- **ESLint**: Follow the configured linting rules
- **Prettier**: Use consistent code formatting
- **Testing**: Write tests for new features
- **Documentation**: Update README and inline comments

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Bun.js Team** for the amazing runtime and package manager
- **React Team** for the excellent frontend framework
- **MongoDB** for the flexible document database
- **Docker** for containerization platform
- **Material-UI** for the beautiful component library

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ and ☕ by [srajasimman](https://github.com/srajasimman)

[🐛 Report Bug](https://github.com/srajasimman/mern-assessment-app/issues) •
[✨ Request Feature](https://github.com/srajasimman/mern-assessment-app/issues) •
[💬 Discussions](https://github.com/srajasimman/mern-assessment-app/discussions)

</div>
