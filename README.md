![brave_sCMhg9nXZ8](https://github.com/user-attachments/assets/60a0143e-2fc1-4d17-94a9-4645ba00317f)

# PISA Job Application System

![Next.js](https://img.shields.io/badge/Next.js-13+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![Python](https://img.shields.io/badge/Python-3.11+-blue)

An intelligent job application system that uses Machine Learning to match candidates with job positions. This application helps HR departments and recruiters identify the best candidates for specific roles using AI-powered scoring and comprehensive analytics.

## Features

### For Job Seekers
- **Easy Application Process**: Submit applications with personal information, education, experience, skills, and projects
- **Real-time Scoring**: Get instant feedback on job compatibility using ML algorithms
- **Project Portfolio**: Showcase your projects with detailed technology stacks
- **Skills Assessment**: Highlight your technical and soft skills

### For Recruiters/HR
- **Candidate Management**: View and manage all job applications in one place
- **AI-Powered Scoring**: Automatic candidate scoring based on job requirements
- **Analytics Dashboard**: Comprehensive insights with charts and statistics
- **Job Management**: Create, edit, and manage job postings
- **Filtering & Search**: Advanced filtering options to find the right candidates

### Technical Features
- **Machine Learning Integration**: Custom ML model for candidate-job matching
- **Real-time Updates**: Live data synchronization across the platform
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Data Visualization**: Interactive charts and analytics
- **Secure Authentication**: Protected routes and data encryption

## Technology Stack

### Frontend
- **Next.js 13+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Recharts** - Data visualization library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **FastAPI** - High-performance Python web framework
- **Prisma** - Database ORM and migration tool
- **PostgreSQL** - Primary database
- **Sentence Transformers** - ML embeddings for text analysis
- **Scikit-learn** - Machine learning algorithms
- **Pandas & NumPy** - Data processing

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Vercel/Netlify** - Frontend deployment
- **GitHub Actions** - CI/CD pipeline

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Python** (v3.11 or higher)
- **PostgreSQL** database
- **Docker** and **Docker Compose** (optional, for containerized setup)

## Installation & Setup

### Option 1: Local Development Setup

1. **Clone the repository**
```bash
git clone <https://github.com/LimpStone/pisa-job-application.git>
cd pisa-job-application
```

2. **Install Node.js dependencies**
```bash
npm install
```

3. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/pisa_db"

# API Configuration
FASTAPI_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

```

5. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Optional: Seed the database
npx prisma db seed
```

6. **Start the FastAPI server**
```bash
# Option 1: Direct Python execution
cd scripts
python predict_applications.py

# Option 2: Using the provided script
./scripts/start_api.sh  # Linux/Mac
scripts/start_api.bat   # Windows
```

7. **Start the Next.js development server**
```bash
npm run dev
```

8. **Access the application**
- Frontend: [http://localhost:3000](http://localhost:3000)
- FastAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Option 2: Docker Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd pisa-job-application
```

2. **Build and start services**
```bash
docker-compose up --build
```

3. **Access the application**
- Frontend: [http://localhost:3000](http://localhost:3000)
- FastAPI: [http://localhost:8000](http://localhost:8000)
- PostgreSQL: `localhost:5432`

For detailed Docker setup instructions, see [DOCKER_SETUP.md](DOCKER_SETUP.md).

## Usage

### Creating Job Postings
1. Navigate to the PisaManager section
2. Click "Add New Job"
3. Fill in job details including requirements and responsibilities
4. Save and publish the job posting

### Applying for Jobs
1. Browse available jobs on the homepage
2. Click "Apply Now" for your desired position
3. Fill out the comprehensive application form:
   - Personal information
   - Education background
   - Work experience
   - Skills and competencies
   - Project portfolio
   - Cover letter
4. Submit your application for AI scoring

### Managing Applications
1. Access the PisaManager dashboard
2. View all applications with AI-generated scores
3. Use filters to sort by score, experience, education, etc.
4. Review detailed candidate profiles and analytics

## API Documentation

The FastAPI backend provides several endpoints:

### Health Check
```
GET /health
```

### Prediction Endpoint
```
POST /predict
Content-Type: application/json

{
  "applicationId": "string",
  "skills": ["skill1", "skill2"],
  "education": {
    "highestLevel": "Bachelor's Degree",
    "field": "Computer Science"
  },
  "experience": {
    "totalYears": "1-3 years",
    "currentPosition": "Developer",
    "achievements": ["achievement1"]
  },
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["React", "Node.js"]
    }
  ],
  "Job": {
    "requirements": "Job requirements",
    "responsibilities": "Job responsibilities"
  }
}
```

Full API documentation is available at `/docs` when running the FastAPI server.

## Machine Learning Model

The application uses a custom ML model that:
- Analyzes candidate profiles using natural language processing
- Compares skills, experience, and projects against job requirements
- Generates compatibility scores based on multiple factors
- Provides interpretable results for hiring decisions

### Model Features
- **Text Embeddings**: Uses multilingual sentence transformers
- **Similarity Analysis**: Cosine similarity for skill matching
- **Experience Weighting**: Considers years of experience and relevance
- **Multi-factor Scoring**: Combines education, skills, and project relevance

## Testing

Run the test suite:
```bash
# Frontend tests
npm test

# Backend tests
pytest scripts/tests/

# End-to-end tests
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation as needed
- Follow the existing code style and conventions

## Troubleshooting

### Common Issues

**Database Connection Error**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database exists and is accessible

**FastAPI Model Loading Error**
- Verify `PisaModel.pkl` exists in scripts directory
- Check Python dependencies are installed
- Ensure sufficient memory for model loading

**Frontend Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all environment variables are set

**Port Already in Use**
- Change ports in configuration files
- Kill existing processes: `lsof -ti:3000 | xargs kill -9`

## License

This project is for educational purposes and is not intended for commercial use.

## Acknowledgments

- Built as a school project to demonstrate ML integration in web applications
- Uses open-source libraries and frameworks
- Inspired by modern recruiting and HR technology solutions

## Contact

For questions, issues, or contributions, please open an issue in this repository.

---

**Note**: This application is still in development. Features and documentation may change as the project evolves.
