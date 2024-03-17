import React, { useState, useEffect } from "react";
import logo from "../assets/logo.svg";
import Loading from './Loading';
import exifr from "exifr";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

const Hero = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [file, setFile] = useState(null); // New state variable for file
  const { getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [analyzeData, setAnalyzeData] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await getAccessTokenSilently();
      setToken(fetchedToken);
    };

    fetchToken();
  }, [getAccessTokenSilently]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = async () => {
      try {
        setImage(reader.result);
      } catch (error) {
        console.error("Error reading EXIF data:", error);
      }
    };
  
    if (file) {
      reader.readAsDataURL(file);
      setFile(file); // Set the file state variable
    }
  };

  const handleUpload = async () => { // New function to handle upload
    if (file) {
      setIsLoading(true);
      try {
        // Create a FormData instance
        const formData = new FormData();
        // Append the file to the form data
        formData.append("file", file);
  
        // Send a POST request to your backend
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/upload-file`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Error uploading file");
        }

        const responseData = await response.json();
        setUploadResponse(responseData);
        setIsUploaded(true);
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsLoading(false); // End loading
      }
    }
  };

  const handleAnalyze = async () => {
    if (uploadResponse) {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/analyze`, {
          method: "POST",
          body: JSON.stringify({ data: uploadResponse.data }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error analyzing file");
        }

        const analyzeData = await response.json();
        setAnalyzeData(analyzeData); // Log the analyze data or do something with it
      } catch (error) {
        console.error("Analyze failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReset = () => {
    setIsUploaded(false);
    setUploadResponse(null);
    setAnalyzeData(null);
  };

  return (
    <div className="text-center hero my-5">
      {isLoading && <Loading />}
      {isUploaded ? (
        <>
          {image && (
            <div>
              Selected Image:
              <img src={image} alt="Uploaded" style={{ maxWidth: "100%" }} />
            </div>
          )}
          <button onClick={handleAnalyze}>Analyze</button>
          <button onClick={handleReset}>Upload Another</button>
          {analyzeData && (
            <div>
              <pre>{JSON.stringify(analyzeData, null, 2)}</pre>
            </div>
          )}
        </>
      ) : (
        <>
          <h1 className="mb-4">Save The Trash</h1>
          <p className="lead">
            Share a picture of your trash and we can help you find ways to reuse it!
          </p>
          <div>
          {image && (
            <div>
              Selected Image:
              <img src={image} alt="Uploaded" style={{ maxWidth: "100%" }} />
            </div>
          )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "block", margin: "0 auto" }}
            />
            <button onClick={handleUpload}>Upload</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Hero;
