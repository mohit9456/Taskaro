import axios from "axios";

const baseURL = `${process.env.NEXT_PUBLIC_HOST}/api`;

//api for public data
export const Api = axios.create({
  baseURL,
  headers: {},
});

//get api for secure credentials

export const protectedApiGet = async (path, params) => {
  try {
    const response = await Api.get(
      path,
      { params },
      //use cookies in next backend using o-auth
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    // console.error(error);
    throw error;
  }
};

//post api secure credentials
export const protectedApiPost = async (path, data) => {
  try {
    const response = await Api.post(
      path,
      data,
      //use cookies in next backend using o-auth
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    // console.error(error);
    throw error;
  }
};

// patch api secure credentials
export const protectedApiPatch = async (path, data) => {
  try {
    const response = await Api.patch(
      path,
      data,
      //use cookies in next backend using o-auth
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    // console.error(error);
    throw error;
  }
};
