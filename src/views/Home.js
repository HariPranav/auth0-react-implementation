import React, { Fragment, useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Loading from "../components/Loading";
import logo from '../assets/recycle-bin.png';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [file, setFile] = useState(null); // New state variable for file
  const { user,isAuthenticated, getAccessTokenSilently } = useAuth0();
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
    setImage(null);
  };
  
  const mainView = (
    <div className="d-flex flex-column align-items-center mt-5">
      <div>
        <h2 className="display-6">Lets Recycle and Reuse!</h2>
      </div>
      <p className="lead">
        Share a picture of your trash and we can help you find ways to reuse it!
      </p>
      <div className="d-flex justify-content-between">
        <div style={{ height: "50vh", width: "400px", border: "5px dashed"}} className="m-2 d-flex align-items-center justify-content-center">
          {image ? (
            <div style={{ height: "100%" }}>
              <img src={image} alt="Uploaded" style={{ maxWidth: "100%", maxHeight: "100%"}} />
            </div>
          ) : (
            <div>
              No Image Selected
            </div>
          )}
        </div>
        <div className="m-2 d-flex flex-column align-items-center justify-content-center" style={{width: "350px"}}>
            {
              !isUploaded ?
              (
                <>
                  <div className="m-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="d-block mx-auto"
                    />
                  </div>
                  <div className="m-2 w-100">
                    <button className="btn btn-primary w-100 shadow-sm" onClick={handleUpload} disabled={isLoading} onMouseOver={() => this.classList.add('btn-hover')} onMouseOut={() => this.classList.remove('btn-hover')}>Upload</button>
                  </div>
                  <div className="m-2 w-100">
                    {isLoading ? (
                        <div className="d-flex justify-content-center">
                          <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                          </div>
                        </div>
                      ) : (
                        <div>&nbsp;</div>
                    )}
                  </div>
                </>
              ): (
                <>
                <div className="m-2 w-100">
                  <button onClick={handleReset} className="btn btn-light w-100 shadow-sm" disabled={isLoading}>Upload Another</button>
                </div>
                <div className="m-2 w-100">
                  <button onMouseOver={() => this.classList.add('btn-hover')} onMouseOut={() => this.classList.remove('btn-hover')} onClick={handleAnalyze} className="btn btn-primary w-100 shadow-sm" disabled={isLoading}>Analyze</button>
                </div>
                <div className="m-2 w-100">
                    {isLoading ? (
                      <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <div>&nbsp;Our algorithms are analyzing the image</div>
                      </div>
                    ) : (
                      <div>&nbsp;</div>
                    )}
                  </div>
                </>
              )
            }
        </div>
      </div>
      <div className="m-2 d-flex flex-column align-items-center justify-content-center">
        {analyzeData && (
          <div className="lead">
            Products that can be made
          </div>
        )}
        <div className="d-flex justify-content-center flex-wrap gap-3">
          {analyzeData && analyzeData.products.map((product, index) => (
            <div className="card" style={{width: "30rem", margin: "10px"}} key={index}>
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">Required Items</h6>
                <p className="card-text">
                  <ul>
                    {product.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </p>
                <h6 className="card-subtitle mb-2 text-muted">Steps</h6>
                <p className="card-text">
                  <ol>
                    {product.steps.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ol>
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex flex-column align-items-center">
          <div className="lead">
          {analyzeData &&
            (
              <>
                Locations to recycle
              </>
            )
          }
          </div>
          <div className="d-flex justify-content-center flex-wrap gap-3">
            {analyzeData && analyzeData.locations.map((location, index) => (
                <div className="card" style={{width: "30rem", margin: "10px"}} key={index}>
                  <div className="card-body">
                    <h5 className="card-title">{location.name}</h5>
                    <a href={location.map} target="_blank" rel="noopener noreferrer">Maps Link</a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <Fragment>
      <div>
        { !isAuthenticated ? (
          <div className="d-flex flex-column align-items-center">
            <div className="d-flex flex-column align-items-center vh-100 justify-content-center">
              <div className="d-flex flex-column align-items-center">
                <img src={logo} alt="Logo" className="mb-4" style={{maxWidth: "50%", height: "auto"}}/>
              </div>
              <div>
                <h1 className="display-4">Save The Trash</h1>
              </div>
              <div>
                <p className="lead">Don't trash the trash, Recycle and Reuse!</p>
              </div>
            </div>
            <div className="d-flex flex-column align-items-center vh-100 justify-content-center">
              <div>
                <p className="lead">Why Recycling is Important</p>
              </div>
              <div className="d-flex flex-column align-items-center">
                <iframe style={{width: "50vw", height: "50vh"}} src="https://www.youtube.com/embed/MFc4k5UOW1Q" title="Recycling Perks Graphic Animation" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {mainView}
          </div>
        )}
      </div>
    </Fragment>
  );
}

export default Home;
