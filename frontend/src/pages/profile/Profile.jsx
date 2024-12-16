// src/pages/Profile/Profile.jsx

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Card from "../../components/card/Card";
import { SpinnerImg } from "../../components/loader/Loader";
import useRedirectLoggedOutUser from "../../costom hook/useRedirectUser";
import { SET_NAME, SET_USER } from "../../redux/feactures/auth/authSlice";
import { getUser } from "../../services/AuthService";

const Profile = () => {
  useRedirectLoggedOutUser("/login");
  const dispatch = useDispatch();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("Getting user data...");
    setIsLoading(true);
    async function getUserData() {
      try {
        const data = await getUser();
        console.log("User data retrieved:", data);

        setProfile(data);
        dispatch(SET_USER(data));
        dispatch(SET_NAME(data.name));
      } catch (error) {
        console.error("Error fetching user data:", error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }
    getUserData();
  }, [dispatch]);

  // Inline Styles
  const styles = {
    profileContainer: {
      margin: "2rem 0", // Equivalent to "--my2"
    },
    card: {
      maxWidth: "700px",
      display: "flex",
      justifyContent: "flex-start",
      padding: "1rem 0",
      margin: "0 auto", // Center the card
      flexDirection: "column", // Equivalent to "--flex-dir-column"
    },
    profilePhoto: {
      textAlign: "center",
      marginBottom: "1rem",
    },
    profileImage: {
      width: "100%",
      maxWidth: "350px",
      padding: "0 1rem",
      borderRadius: "50%", // Make the image circular
    },
    profileData: {
      margin: "0 1rem",
    },
    profileDataItem: {
      borderTop: "1px solid #ccc",
      padding: "5px 0",
    },
    editButtonContainer: {
      marginTop: "1rem",
      textAlign: "center",
    },
    editButton: {
      padding: "0.5rem 1rem",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    // Hover effect using inline styles requires additional handling
    // You can use onMouseEnter and onMouseLeave events to handle hover styles
  };

  // State to handle hover effect on the button
  const [isHovering, setIsHovering] = useState(false);
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  // Modify the editButton style based on hover state
  const combinedEditButtonStyle = {
    ...styles.editButton,
    backgroundColor: isHovering ? "#0056b3" : styles.editButton.backgroundColor,
  };

  return (
    <div style={styles.profileContainer}>
      {isLoading && <SpinnerImg />}
      {!isLoading && profile === null ? (
        <p>Something went wrong, please reload the page...</p>
      ) : (
        <Card cardClass="card --flex-dir-column" style={styles.card}>
          <span style={styles.profilePhoto}>
            <img
              src={profile?.photo || "/default-profile.png"} // Fallback image
              alt="profilepic"
              style={styles.profileImage}
            />
          </span>
          <span style={styles.profileData}>
            <p style={styles.profileDataItem}>
              <b>Name:</b> {profile?.name}
            </p>
            <p style={styles.profileDataItem}>
              <b>Email:</b> {profile?.email}
            </p>
            <p style={styles.profileDataItem}>
              <b>Phone:</b> {profile?.phone}
            </p>
            <p style={styles.profileDataItem}>
              <b>Bio:</b> {profile?.bio}
            </p>
            <div style={styles.editButtonContainer}>
              <Link to="/edit-profile">
                <button
                  style={combinedEditButtonStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  Edit Profile
                </button>
              </Link>
            </div>
          </span>
        </Card>
      )}
    </div>
  );
};

export default Profile;
