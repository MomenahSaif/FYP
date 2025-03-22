const API_URL = process.env.REACT_APP_API_URL;

export const loginUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // Ensure cookies are sent
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const signupUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    throw error;
  }
};
export const getSessionUser = async () => {
  try {
    const response = await fetch(`${API_URL}/session`, {
      method: 'GET',
      credentials: 'include', // Ensure cookies/session are sent
    });

    console.log("Raw response:", response); // Debugging

    const data = await response.json();
    console.log("Fetched session user:", data); // Debugging

    return data.email || null; 
  } catch (error) {
    console.error("Error fetching session user:", error);
    return null;
  }
};
