import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Check, RefreshCcw, Plus, XCircle } from 'lucide-react';

const FoodDetectionComponent = () => {
  const [activeTab, setActiveTab] = useState('camera');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedItems, setDetectedItems] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  
  // Sample food database for detection simulation
  const foodDatabase = [
    { id: 1, name: 'Apple', category: 'fruits', confidence: 0.98 },
    { id: 2, name: 'Banana', category: 'fruits', confidence: 0.97 },
    { id: 3, name: 'Orange', category: 'fruits', confidence: 0.96 },
    { id: 4, name: 'Tomato', category: 'vegetables', confidence: 0.95 },
    { id: 5, name: 'Carrot', category: 'vegetables', confidence: 0.94 },
    { id: 6, name: 'Broccoli', category: 'vegetables', confidence: 0.93 },
    { id: 7, name: 'Chicken', category: 'meat', confidence: 0.92 },
    { id: 8, name: 'Beef', category: 'meat', confidence: 0.91 },
    { id: 9, name: 'Milk', category: 'dairy', confidence: 0.90 },
    { id: 10, name: 'Cheese', category: 'dairy', confidence: 0.89 }
  ];
  
  // Initialize camera
  useEffect(() => {
    if (activeTab === 'camera') {
      initializeCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [activeTab]);
  
  const initializeCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };
  
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };
  
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data as base64
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
    }
  };
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const detectFood = () => {
    setIsProcessing(true);
    
    // Simulate detection delay
    setTimeout(() => {
      // Randomly select 2-4 items from the food database
      const count = Math.floor(Math.random() * 3) + 2;
      const shuffled = [...foodDatabase].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);
      
      setDetectedItems(selected);
      setIsProcessing(false);
      setShowResults(true);
    }, 2000);
  };
  
  const resetDetection = () => {
    setCapturedImage(null);
    setDetectedItems([]);
    setShowResults(false);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const getConfidenceColor = (confidence) => {
    if (confidence > 0.95) return 'text-green-600';
    if (confidence > 0.85) return 'text-blue-600';
    return 'text-orange-600';
  };
  
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'fruits':
        return '🍎';
      case 'vegetables':
        return '🥦';
      case 'meat':
        return '🍗';
      case 'dairy':
        return '🥛';
      default:
        return '🍽️';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Food Detection</h1>
      
      {!capturedImage ? (
        <div>
          {/* Tabs */}
          <div className="flex border-b mb-4">
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'camera' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('camera')}
            >
              <div className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Camera
              </div>
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'upload' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('upload')}
            >
              <div className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload
              </div>
            </button>
          </div>
          
          {/* Camera Tab */}
          {activeTab === 'camera' && (
            <div>
              <div className="relative bg-black rounded-lg overflow-hidden mb-4 aspect-video flex items-center justify-center">
                <video 
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {!cameraStream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
                    <Camera className="w-12 h-12 mb-2" />
                    <p>Camera initializing...</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={captureImage}
                  disabled={!cameraStream}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center disabled:opacity-50"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Image
                </button>
              </div>
            </div>
          )}
          
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div>
              <div 
                onClick={triggerFileInput}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors mb-4"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">Click to upload an image</p>
                <p className="text-gray-500 text-sm mt-1">PNG, JPG, or JPEG</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Preview & Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preview */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Image Preview</h2>
              <div className="bg-black rounded-lg overflow-hidden mb-4">
                <img 
                  src={capturedImage} 
                  alt="Captured food" 
                  className="w-full object-contain"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={resetDetection}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                {!showResults && (
                  <button
                    onClick={detectFood}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex-1 flex items-center justify-center disabled:opacity-70"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Detect Food
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {/* Results */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Detection Results</h2>
              {showResults ? (
                <>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                    <ul className="divide-y divide-gray-200">
                      {detectedItems.map(item => (
                        <li key={item.id} className="p-4">
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <span className="text-xl mr-2">{getCategoryIcon(item.category)}</span>
                              <div>
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-gray-600">{item.category}</p>
                              </div>
                            </div>
                            <div className={`text-sm font-medium ${getConfidenceColor(item.confidence)}`}>
                              {(item.confidence * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <div className="flex items-center">
                              <label className="text-sm text-gray-600 mr-2">Quantity:</label>
                              <input 
                                type="number" 
                                min="1" 
                                defaultValue="1"
                                className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm"
                              />
                              <select className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm">
                                <option>piece(s)</option>
                                <option>g</option>
                                <option>kg</option>
                                <option>ml</option>
                                <option>L</option>
                              </select>
                            </div>
                            <button className="text-red-600 hover:text-red-800">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium w-full flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Inventory
                  </button>
                </>
              ) : (
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center">
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-600 font-medium">Analyzing image...</p>
                      <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
                    </>
                  ) : (
                    <>
                      <Camera className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-600 font-medium">No detection results yet</p>
                      <p className="text-gray-500 text-sm mt-1">Click "Detect Food" to analyze the image</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDetectionComponent;