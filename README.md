# DISMS - Digital Identity & Sovereign Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.0.0-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%5E6.0-green)](https://www.mongodb.com/)

A comprehensive digital identity management system for Cameroon, enabling secure, privacy-preserving credential management with blockchain integration, biometric authentication, and selective disclosure capabilities.

## 🌟 Features

### Core Functionality
- **Multi-Role Support**: Citizens, Issuers, and Verifiers with role-based access control
- **Digital Credentials**: Government, educational, financial, professional, and personal credentials
- **Blockchain Integration**: Ethereum-based credential verification and immutable storage
- **IPFS Storage**: Distributed storage for credential metadata and documents

### Security & Privacy
- **Biometric Authentication**: WebAuthn-based fingerprint, face, and voice recognition
- **Zero-Knowledge Proofs**: Privacy-preserving credential verification
- **Selective Disclosure**: Share only necessary attributes while keeping others private
- **End-to-End Encryption**: AES-256-GCM encryption with user-specific keys
- **Hardware Security Module**: Secure key generation, storage, and management

### User Experience
- **QR Code Sharing**: Secure credential sharing with customizable expiration and usage limits
- **Real-time Dashboard**: Activity tracking, notifications, and credential statistics
- **Mobile-First Design**: Progressive Web App (PWA) with offline capabilities
- **Multi-language Support**: English and French language support

### Compliance & Standards
- **GDPR Compliant**: Data protection and privacy by design
- **W3C Standards**: Verifiable Credentials and Decentralized Identifiers (DIDs)
- **OpenAPI Documentation**: Comprehensive API documentation with Swagger UI
- **Audit Trails**: Complete activity logging and compliance tracking

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React PWA     │    │  Node.js API    │    │   MongoDB       │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Biometric     │    │   Blockchain    │    │      IPFS       │
│   WebAuthn      │    │   Ethereum      │    │   Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16.0.0 or higher)
- MongoDB (v6.0 or higher)
- Git
- Modern web browser with WebAuthn support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/disms.git
   cd disms
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment templates
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. **Configure Environment Variables**

   **Server (.env)**:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/disms

   # JWT
   JWT_SECRET=your-super-secure-jwt-secret-key
   JWT_EXPIRE=7d

   # Encryption
   ENCRYPTION_SECRET=your-encryption-secret-key
   ENCRYPTION_SALT=your-encryption-salt

   # Email (Optional)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Blockchain (Optional)
   ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
   PRIVATE_KEY=your-ethereum-private-key

   # IPFS (Optional)
   IPFS_API_URL=http://localhost:5001
   ```

   **Client (.env)**:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_APP_NAME=DISMS
   ```

5. **Start the Application**
   ```bash
   # Start MongoDB (if running locally)
   mongod

   # Start the backend server
   cd server
   npm run dev

   # In a new terminal, start the frontend
   cd client
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api/docs

## 📚 Usage

### For Citizens
1. **Register** with email and create your digital identity
2. **Verify** your email and set up biometric authentication
3. **Create Credentials** by uploading documents or taking photos
4. **Share Credentials** using QR codes or secure links with selective disclosure
5. **Manage** your digital identity and track credential usage

### For Issuers
1. **Register** as an issuer organization
2. **Verify** credentials submitted by citizens
3. **Issue** verified digital credentials
4. **Manage** issued credentials and revocation

### For Verifiers
1. **Register** as a verifier organization
2. **Request** credential verification from citizens
3. **Verify** credentials using QR codes or verification requests
4. **Access** verified information with privacy preservation

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# Run all tests
npm run test:all
```

### Test Coverage
```bash
# Generate coverage report
cd server
npm run test:coverage
```

## 📖 API Documentation

The API documentation is automatically generated and available at:
- **Development**: http://localhost:5000/api/docs
- **Swagger JSON**: http://localhost:5000/api/docs/openapi.json

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/biometric/register` - Register biometric

#### Credentials
- `GET /api/credentials` - List user credentials
- `POST /api/credentials` - Create new credential
- `PUT /api/credentials/:id` - Update credential
- `DELETE /api/credentials/:id` - Delete credential

#### Sharing
- `POST /api/sharing/generate-qr` - Generate QR code for sharing
- `POST /api/sharing/generate-link` - Generate shareable link
- `GET /api/sharing/verify/:shareId` - Verify shared credential

#### Verification
- `POST /api/verify/credential` - Verify a credential
- `POST /api/verify/batch` - Batch verify credentials
- `GET /api/verify/history` - Get verification history

## 🔧 Development

### Project Structure
```
disms/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS and styling
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   └── tests/            # Test files
├── blockchain/           # Smart contracts
│   ├── contracts/        # Solidity contracts
│   ├── migrations/       # Deployment scripts
│   └── test/             # Contract tests
└── docs/                 # Documentation
```

### Development Scripts

**Backend**:
```bash
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run docs         # Generate API documentation
```

**Frontend**:
```bash
npm start            # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run eject        # Eject from Create React App
```

### Code Style

This project uses:
- **ESLint** for JavaScript linting
- **Prettier** for code formatting
- **Husky** for Git hooks
- **Conventional Commits** for commit messages

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build

# The build folder contains the production build
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t disms-backend ./server
docker build -t disms-frontend ./client
```

### Environment Variables for Production
Ensure all environment variables are properly set for production:
- Use strong, unique secrets for JWT and encryption
- Configure proper database connections
- Set up email service for notifications
- Configure blockchain and IPFS endpoints

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code of Conduct
Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.disms.cm](https://docs.disms.cm)
- **Issues**: [GitHub Issues](https://github.com/your-org/disms/issues)
- **Email**: support@disms.cm
- **Community**: [Discord Server](https://discord.gg/disms)

## 🙏 Acknowledgments

- Government of Cameroon for digital identity initiatives
- W3C for Verifiable Credentials standards
- Ethereum Foundation for blockchain infrastructure
- Open source community for amazing tools and libraries

---

**Built with ❤️ for digital identity sovereignty in Cameroon**
