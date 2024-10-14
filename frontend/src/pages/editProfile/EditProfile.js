import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../components/card/Card.jsx";
import Loader from "../../components/loader/Loader.jsx";
import { selectuser } from "../../redux/feactures/auth/authSlice.js";
import { toast } from "react-toastify";
import { updateUser } from "../../services/AuthService.jsx";
import ChangePassword from "../../components/changePassword/ChangePassword.js";

const EditProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector(selectuser);
  const { email } = user;

  useEffect(() => {
    if (!email) {
      navigate("/profile");
    }
  }, [email, navigate]);

  const initialState = {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    photo: user?.photo || "",
  };

  const [profile, setProfile] = useState(initialState);
  const [profileImage, setProfileImage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image (JPEG, JPG, PNG)");
        return;
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setProfileImage(file);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let imageURL = profile.photo; // Default to existing photo

      // Handle Image upload if a new image is selected
      if (
        profileImage &&
        ["image/jpeg", "image/jpg", "image/png"].includes(profileImage.type)
      ) {
        const formData = new FormData();
        formData.append("file", profileImage);
        formData.append("upload_preset", "dwusavx2w"); // Ensure this preset is correctly configured in Cloudinary

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/zinotrust/image/upload",
          { method: "post", body: formData }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error.message || "Image upload failed");
        }

        const imgData = await response.json();
        imageURL = imgData.url; // Updated image URL
      } else if (profileImage) {
        // If the image type is invalid
        throw new Error("Unsupported image format. Please upload JPEG, JPG, or PNG.");
      }

      // Prepare form data for profile update
      const formData = {
        name: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        photo: imageURL,
      };

      const data = await updateUser(formData);
      console.log("Profile updated successfully:", data);
      toast.success("User updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Inline Styles
  const styles = {
    profileContainer: {
      padding: "20px",
      maxWidth: "700px",
      margin: "0 auto",
    },
    profilePhoto: {
      textAlign: "center",
      marginBottom: "20px",
    },
    profileImage: {
      width: "100%",
      maxWidth: "350px",
      paddingRight: "1rem",
      paddingLeft: "1rem",
      borderRadius: "50%", 
    },
    profileData: {
      margin: "0 1rem",
    },
    profileDataItem: {
      borderTop: "1px solid #ccc",
      padding: "5px 0",
    },
    editButtonContainer: {
      marginTop: "20px",
      textAlign: "center",
    },
    editButton: {
      padding: "10px 20px",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
  };

  return (
    <div className="profile --my2" style={styles.profileContainer}>
      {isLoading && <Loader />}

      <Card cardClass={"card --flex-dir-column"}>
        <span className="profile-photo" style={styles.profilePhoto}>
          <img
            src={profile.photo || "/default-profile.png"} // Fallback image
            alt="profilepic"
            style={styles.profileImage}
          />
        </span>
        <form className="--form-control --m" onSubmit={saveProfile}>
          <span className="profile-data" style={styles.profileData}>
            <p style={styles.profileDataItem}>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                name="name"
                id="name"
                value={profile.name}
                onChange={handleInputChange}
                required
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </p>
            <p style={styles.profileDataItem}>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                name="email"
                id="email"
                value={profile.email}
                disabled
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  backgroundColor: "#f0f0f0",
                }}
              />
              <br />
              <code style={{ color: "#666" }}>Email cannot be changed.</code>
            </p>
            <p style={styles.profileDataItem}>
              <label htmlFor="phone">Phone:</label>
              <input
                type="text"
                name="phone"
                id="phone"
                value={profile.phone}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </p>
            <p style={styles.profileDataItem}>
              <label htmlFor="bio">Bio:</label>
              <textarea
                name="bio"
                id="bio"
                value={profile.bio}
                onChange={handleInputChange}
                cols="30"
                rows="5"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  resize: "vertical",
                }}
              ></textarea>
            </p>
            <p style={styles.profileDataItem}>
              <label htmlFor="photo">Photo:</label>
              <input
                type="file"
                name="image"
                id="photo"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "block", marginTop: "5px" }}
              />
            </p>
            <div style={styles.editButtonContainer}>
              <button
                type="submit"
                className="--btn --btn-primary"
                style={styles.editButton}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Edit Profile"}
              </button>
            </div>
          </span>
        </form>
      </Card>
      <br />
      <ChangePassword />
    </div>
  );
};

export default EditProfile;
