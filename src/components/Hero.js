import React, { useState } from "react";
import logo from "../assets/logo.svg";
import exifr from "exifr";

const Hero = () => {
  const [image, setImage] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

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
    }
  };

  return (
    <div className="text-center hero my-5">
      <img className="mb-3 app-logo" src={logo} alt="React logo" width="120" />
      <h1 className="mb-4">React.js Sample Project</h1>
      <p className="lead">
        This is a sample application that demonstrates an authentication flow for
        an SPA, using <a href="https://reactjs.org">React.js</a>
      </p>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "block", margin: "0 auto" }}
        />
        {image && (
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
