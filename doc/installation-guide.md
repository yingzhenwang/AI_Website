# FoodVision Installation Guide

This guide will help you set up the FoodVision application on your local machine for development and testing purposes.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Docker Deployment](#docker-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+**
- **Node.js 14+**
- **MongoDB**
- **Git**
- **pip and npm** (package managers)
- **DeepSeek-V3 API key** (for recipe generation)

### Optional Requirements
- Docker and Docker Compose (for containerized deployment)
- Redis (for caching)

## Backend Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/foodvision.git
cd foodvision
```

2. **Create and activate a virtual environment**

```bash
# For Linux/macOS
cd backend
python -m venv venv
source venv/bin/activate

# For Windows
cd backend
python -m venv venv
venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Install YOLOv8 model**

```bash
# Create model directory
mkdir -p ml_models

# Download pre-trained model
curl -L https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8m.pt -o ml_models/yolov8m.pt
```

## Frontend Setup

1. **Navigate to the frontend directory**

```bash
cd ../frontend
```

2. **Install dependencies**

```bash
npm install
```

## Configuration

### Backend Configuration

1. **Create environment file**

```bash
cd ../backend
cp .env.example .env
```

2. **Edit the .env file**

Open the `.env` file in your preferred text editor and set the following variables:

```ini
# Flask configuration
FLASK_APP=app
FLASK_ENV=development
SECRET_KEY=your_secret_key_here

# MongoDB configuration
MONGO_URI=mongodb://localhost:27017/foodvision

# JWT configuration
JWT_SECRET_KEY=your_jwt_secret_key_here

# DeepSeek-V3 API configuration
DEEPSEEK_API_KEY=your_deepseek_v3_api_key

# Redis configuration (optional)
REDIS_URL=redis://localhost:6379/0
```

### Frontend Configuration

1. **Create environment file**

```bash
cd ../frontend
cp .env.example .env
```

2. **Edit the .env file**

```ini
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Starting the Backend

1. **Ensure the virtual environment is activated**

```bash
# If not already activated
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Start the Flask server**

```bash
flask run
```

The backend server will start on http://localhost:5000.

### Starting the Frontend

1. **Open a new terminal and navigate to the frontend directory**

```bash
cd frontend
```

2. **Start the React development server**

```bash
npm start
```

The frontend development server will start on http://localhost:3000.

## Docker Deployment

For easier deployment, you can use Docker and Docker Compose.

1. **Build and start the containers**

```bash
docker-compose up --build
```

This will start:
- The MongoDB container
- The Flask backend container
- The React frontend container
- The Redis container (for caching)

2. **Access the application**

After the containers are up and running, you can access the application at http://localhost:3000.

## Troubleshooting

### YOLOv8 Installation Issues

If you encounter issues with YOLOv8:

```bash
# Install directly from ultralytics
pip install ultralytics

# Verify installation
python -c "from ultralytics import YOLO; print('YOLOv8 installed successfully')"
```

### MongoDB Connection Issues

If you have trouble connecting to MongoDB:

```bash
# Check if MongoDB is running
sudo service mongodb status  # On Linux
brew services list  # On macOS

# Start MongoDB if it's not running
sudo service mongodb start  # On Linux
brew services start mongodb-community  # On macOS
```

### Python Dependencies Issues

If you encounter issues with Python dependencies:

```bash
# Update pip
python -m pip install --upgrade pip

# Install dependencies one by one
pip install flask
pip install flask-jwt-extended
pip install pymongo
pip install ultralytics
pip install opencv-python
# Continue with other dependencies as needed
```

### Node.js and NPM Issues

If you encounter issues with Node.js dependencies:

```bash
# Clear npm cache
npm cache clean --force

# Update npm
npm install -g npm@latest

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### API Key Issues

If the DeepSeek-V3 API integration is not working:

1. Verify your API key is correctly set in the `.env` file
2. Check you have sufficient credits in your DeepSeek-V3 account
3. Test the API key with a simple curl request:

```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Camera Access Issues

If camera access is not working in the browser:

1. Ensure your browser has camera permissions enabled
2. Check that your device has a working camera
3. Try using a different browser
4. For local development, make sure you're using HTTPS or localhost (which is exempt from secure context requirements)

## Development Tips

### Working with the YOLOv8 Model

For customizing or fine-tuning the YOLOv8 model:

```bash
cd backend/scripts
python train_model.py --data path/to/dataset --epochs 100 --batch-size 16
```

### Testing API Endpoints

You can use tools like Postman or curl to test API endpoints:

```bash
# Example: Test the login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "password123"}'
```

### Database Backup and Restore

To backup and restore your MongoDB database:

```bash
# Backup
mongodump --db foodvision --out ./backup

# Restore
mongorestore --db foodvision ./backup/foodvision
```

## Next Steps

After successfully installing the application, you might want to:

1. Create a user account through the registration page
2. Add test food items to your inventory
3. Explore the recipe recommendation functionality
4. Test the camera-based food detection feature

For more information, refer to the [User Guide](USER_GUIDE.md) and [Developer Documentation](TECHNICAL_DOCUMENTATION.md).

Happy coding!