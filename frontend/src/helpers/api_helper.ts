import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import config from "../config";

const { api } = config;

// default
axios.defaults.baseURL = api.API_URL;
// content type
axios.defaults.headers.post["Content-Type"] = "application/json";

// Enable credentials for HttpOnly cookie-based authentication
axios.defaults.withCredentials = true;

// intercepting to log requests for debugging
axios.interceptors.request.use(
  function (config) {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: (config.baseURL || '') + (config.url || ''),
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  function (error) {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// intercepting to capture errors
axios.interceptors.response.use(
  function (response) {
    console.log('API Response Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response.data ? response.data : response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    let message;

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const responseData = error.response.data;

      // Try to extract error message from response data
      if (responseData?.message) {
        message = responseData.message;
      } else if (responseData?.error) {
        message = responseData.error;
      } else {
        // Use status-based messages as fallback
        switch (status) {
          case 500:
            message = "Internal Server Error";
            break;
          case 401:
            message = "Invalid credentials";
            break;
          case 404:
            message = "Sorry! the data you are looking for could not be found";
            break;
          case 400:
            message = "Bad Request";
            break;
          default:
            message = error.response.statusText || "An error occurred";
        }
      }

      // Return the full error object for better handling
      return Promise.reject({
        message: message,
        status: status,
        response: error.response,
        data: responseData
      });
    } else if (error.request) {
      // The request was made but no response was received
      message = "No response from server. Please check your connection.";
      return Promise.reject({
        message: message,
        request: error.request
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      message = error.message || "An error occurred";
      return Promise.reject({
        message: message
      });
    }
  }
);
/**
 * Sets the default authorization
 * @param {*} token
 */
const setAuthorization = (token : string) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    return;
  }
  delete axios.defaults.headers.common["Authorization"];
};

class APIClient {
  /**
   * Fetches data from the given URL
   */
  get = (url: string, params?: any): Promise<AxiosResponse> => {
    const cleanedParams =
      params && typeof params === "object"
        ? Object.entries(params).reduce((acc: Record<string, any>, [key, value]) => {
            if (value !== null && value !== undefined) {
              acc[key] = value;
            }
            return acc;
          }, {})
        : undefined;

    return axios.get(url, { params: cleanedParams });
  };

  /**
   * Posts the given data to the URL
   */
  create = (url: string, data: any): Promise<AxiosResponse> => {
    return axios.post(url, data);
  };

  /**
   * Updates data
   */
  update = (url: string, data: any): Promise<AxiosResponse> => {
    return axios.patch(url, data);
  };

  put = (url: string, data: any): Promise<AxiosResponse> => {
    return axios.put(url, data);
  };

  /**
   * Deletes data
   */
  delete = (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
    return axios.delete(url, { ...config });
  };
}

const getLoggedinUser = () => {
  const user = sessionStorage.getItem("user");
  if (!user) {
    return null;
  } else {
    return JSON.parse(user);
  }
};

export { APIClient, setAuthorization, getLoggedinUser };