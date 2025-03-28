# FoodVision: Intelligent Fridge Management

![FoodVision Banner](assets/banner.png)

## Overview

FoodVision is an intelligent fridge management system that uses:
- **Computer Vision** (YOLOv8) for food detection
- **DeepSeek-V3** for recipe generation
- **React** frontend
- **Automated Inventory Management**: Keeps track of available ingredients with expiry dates
- **User-Friendly Interface**: Web-based interface for easy access on any device
- **Shopping List Generation**: Creates shopping lists based on missing ingredients for desired recipes

## Demo

[Watch Demo Video](https://youtu.be/your-demo-link)

![Screenshot](assets/screenshot.png)

## Technologies Used

- **Frontend**: React.js, CSS3, HTML5
- **Backend**: Flask (Python)
- **Computer Vision**: YOLOv8, OpenCV
- **Language Models**: GPT-4 API
- **Database**: MongoDB
- **Deployment**: Docker, AWS

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB
- API keys for OpenAI GPT-4

### Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/yourusername/foodvision.git
cd foodvision
```

2. Set up backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. Set up frontend
```bash
cd ../frontend
npm install
```

5. Start the application
```bash
# In one terminal (backend)
cd backend
source venv/bin/activate
flask run

# In another terminal (frontend)
cd frontend
npm start
```

6. Open your browser and navigate to `http://localhost:3000`

## Project Architecture

The application follows a client-server architecture:

1. **Frontend** (React.js):
   - User interface for capturing images and displaying results
   - Recipe browsing and filtering interface
   - Inventory management dashboard

2. **Backend** (Flask):
   - YOLOv8 model for food recognition
   - GPT-4 integration for recipe generation
   - API endpoints for frontend interaction
   - Database management

3. **Database** (MongoDB):
   - Stores user profiles
   - Maintains food inventory data
   - Caches recipe recommendations

![Architecture Diagram](assets/architecture.png)

## Usage

### Food Recognition
1. Click the "Capture" button or upload an image of your fridge contents
2. The system will identify food items and add them to your inventory
3. Review and adjust the detected items if needed

### Recipe Recommendations
1. Navigate to the "Recipes" tab
2. View automatically generated recipe suggestions based on your inventory
3. Filter by cuisine type, preparation time, or dietary preferences
4. Select a recipe to view detailed instructions and nutritional information

### Inventory Management
1. View your current food inventory on the "Inventory" dashboard
2. Set expiry dates and receive notifications for items nearing expiration
3. Manually add or remove items as needed

## Future Enhancements

- Mobile application with barcode scanning
- Integration with smart refrigerators
- Meal planning and nutrition tracking
- Community recipe sharing
- Voice command support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Dr. [Your Professor's Name] for project guidance
- The University of Sydney for resources and support
- YOLOv8 and OpenAI for their amazing models and APIs

## Contact

Yingzhen Wang - [yingzhenhw@gmail.com](mailto:yingzhenhw@gmail.com)

Project Link: [https://github.com/yourusername/foodvision](https://github.com/yourusername/foodvision)
