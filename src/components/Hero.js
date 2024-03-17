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
        // Extracting latitude and longitude using exifr library
        const exifData = await exifr.gps(file);
        setLatitude(exifData.latitude);
        setLongitude(exifData.longitude);
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
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsLoading(false); // End loading
      }
    }
  };

  return (
    <div className="text-center hero my-5">
      <h1 className="mb-4">Save The Trash</h1>
      <p className="lead">
        Share a picture of your trash and we can help you find ways to reuse it!
      </p>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "block", margin: "0 auto" }}
        />
        <button onClick={handleUpload}>Upload</button>
        {isLoading ? <Loading /> : image && (
          <div>
            <img src={image} alt="Uploaded" style={{ maxWidth: "100%" }} />
            {(latitude && longitude) ? (
              <p>
                Latitude: {latitude}, Longitude: {longitude}
              </p>
            ) : (
              <p>No latitude and longitude found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
