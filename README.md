# Manual Testing AI Agent

A modern web application for generating structured manual test cases using AI. Built with React frontend and FastAPI backend, integrated with Qwen AI model through OpenRouter.

## Features

- 🤖 AI-powered test case generation using Qwen 2.5 72B model
- 🎨 Modern dark theme UI with responsive design
- 📊 Structured test case output with ID, description, preconditions, and steps
- 📁 Export test cases as CSV
- 🔧 Configurable test case types (Functional, Regression, Security, Performance, Usability)
- ⚙️ Environment-based configuration
- 🌐 CORS-enabled for cross-origin requests

## Project Structure

```
manustarter/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   └── env.example            # Environment variables template
├── frontend/
│   ├── public/
│   │   └── index.html         # Main HTML file
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── App.css            # Component styles
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Global styles
│   └── package.json           # Node.js dependencies
└── README.md                  # This file
```

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- OpenRouter API key (for Qwen AI model)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create environment file:
   ```bash
   cp env.example .env
   ```

6. Edit `.env` file with your configuration:
   ```env
   # OpenAI/OpenRouter Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   SITE_URL=http://localhost:3000
   SITE_NAME=Manual Testing AI Agent

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
   ALLOWED_HEADERS=*

   # Server Configuration
   HOST=0.0.0.0
   PORT=8000
   ```

7. Start the backend server:
   ```bash
   python main.py
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Select the type of test cases you want to generate
3. Enter the module or feature name to test
4. Choose the number of test cases (5-28)
5. Click "Generate Test Cases"
6. View the generated test cases in the table
7. Optionally download as CSV

## API Endpoints

- `GET /` - Health check
- `GET /health` - Service health status
- `POST /generate-test-cases` - Generate test cases

### Example API Request

```bash
curl -X POST "http://localhost:8000/generate-test-cases" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_type": "Functional Test Cases",
    "module_name": "email verification",
    "num_test_cases": 8
  }'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key for Qwen AI | Required |
| `SITE_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `SITE_NAME` | Application name | `Manual Testing AI Agent` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://127.0.0.1:3000` |
| `ALLOWED_METHODS` | CORS allowed methods | `GET,POST,PUT,DELETE,OPTIONS` |
| `ALLOWED_HEADERS` | CORS allowed headers | `*` |
| `HOST` | Backend host | `0.0.0.0` |
| `PORT` | Backend port | `8000` |

## Technologies Used

### Backend
- FastAPI - Modern web framework for Python
- OpenAI - Python client for AI models
- Pydantic - Data validation
- python-dotenv - Environment variable management
- uvicorn - ASGI server

### Frontend
- React 18 - UI library
- Axios - HTTP client
- React Icons - Icon library
- CSS3 - Styling with dark theme

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
