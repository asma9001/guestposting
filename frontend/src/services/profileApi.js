import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const getFormDataHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Update Profile
export const updateProfile = async (userId, formData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}api/userProfileSettings/profile/${userId}`,
      formData,
      {
        headers: getFormDataHeaders(),
      }
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update profile",
    };
  }
};

// Update Password
export const updatePassword = async (userId, passwordData) => {
  try {
    console.log("Updating password for userId:", userId);
    console.log("Password data:", passwordData);

    const response = await axios.put(
      `${API_BASE_URL}api/userProfileSettings/update_password/${userId}`,
      {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      },
      {
        headers: getHeaders(),
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Password update error:", error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update password",
    };
  }
};

// Update Business
export const updateBusiness = async (userId, businessData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}api/userProfileSettings/update_business/${userId}`,
      businessData,
      {
        headers: getHeaders(),
      }
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update business",
    };
  }
};