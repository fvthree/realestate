//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  postFakeLogin,
  postJwtLogin,
  getMe,
} from "../../../helpers/fakebackend_helper";

import { loginSuccess, logoutUserSuccess, apiError, reset_login_flag } from './reducer';
import { setAuthorization } from "../../../helpers/api_helper";

export const loginUser = (user : any, history : any) => async (dispatch : any) => {
  try {
    let response;
    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      let fireBaseBackend : any = getFirebaseBackend();
      response = fireBaseBackend.loginUser(
        user.email,
        user.password
      );
    } else if (process.env.REACT_APP_DEFAULTAUTH === "jwt" || !process.env.REACT_APP_DEFAULTAUTH) {
      response = postJwtLogin({
        email: user.email,
        password: user.password
      });
    } else if (process.env.REACT_APP_DEFAULTAUTH === "fake") {
      response = postFakeLogin({
        email: user.email,
        password: user.password,
      });
    }

    var data = await response;

    if (data) {
      // Check if response indicates an error
      if (data.status === "error" || data.error) {
        const errorMessage = data.message || data.error || "Login failed. Please try again.";
        dispatch(apiError(errorMessage));
        return;
      }

      if (process.env.REACT_APP_DEFAULTAUTH === "fake") {
        var finallogin : any = JSON.stringify(data);
        finallogin = JSON.parse(finallogin)
        data = finallogin.data;
        if (finallogin.status === "success") {
          if (data?.access_token) {
            setAuthorization(data.access_token);
          }
          dispatch(loginSuccess(data));
          history('/dashboard')
        } 
        else {
          const errorMessage = finallogin.message || "Login failed. Please try again.";
          dispatch(apiError(errorMessage));
        }
      } else {
        if (data?.access_token) {
          setAuthorization(data.access_token);
        }

        // Fetch authenticated agent profile immediately after login
        // so protected routes rely on real /api/me identity.
        let me: any = null;
        try {
          me = await getMe();
        } catch (meError) {
          // If /me fails, still keep login response fallback
          // so the UI can show a recoverable error state.
          console.error("Failed to fetch /me after login", meError);
        }

        const sessionUser = {
          id: me?.id || data?.id || null,
          email: me?.email || data?.email || user.email || null,
          name: me?.name || data?.name || null,
          token: data?.access_token || null,
        };

        sessionStorage.setItem("user", JSON.stringify(sessionUser));
        dispatch(loginSuccess(sessionUser));
        history('/dashboard')
      }
    }
  } catch (error: any) {
    // Handle different types of errors
    let errorMessage = "An error occurred during login";

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.data) {
        errorMessage = error.response.data.message ||
                      error.response.data.error ||
                      error.response.statusText ||
                      "Invalid credentials";
      } else {
        errorMessage = error.response.statusText || "Server error";
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = "No response from server. Please check your connection.";
    } else if (error.message) {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    dispatch(apiError(errorMessage));
  }
};

export const logoutUser = () => async (dispatch : any) => {
  try {
    // Clear user data from sessionStorage
    sessionStorage.removeItem("user");
    setAuthorization("");
    // HttpOnly cookie is automatically cleared by the backend
    let fireBaseBackend : any = getFirebaseBackend();
    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const response = fireBaseBackend.logout;
      dispatch(logoutUserSuccess(response));
    } else {
      dispatch(logoutUserSuccess(true));
    }

  } catch (error) {
    dispatch(apiError(error));
  }
};

export const socialLogin = (type : any, history : any) => async (dispatch : any) => {
  try {
    let response;

    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const fireBaseBackend : any = getFirebaseBackend();
      response = fireBaseBackend.socialLoginUser(type);
    }
    //  else {
      //   response = postSocialLogin(data);
      // }
      
      const socialdata = await response;
    if (socialdata) {
      // Only store non-sensitive user data (token is in HttpOnly cookie)
      sessionStorage.setItem("user", JSON.stringify({
        email: socialdata.email,
        name: socialdata.name,
        id: socialdata.id,
      }));
      dispatch(loginSuccess(socialdata));
      history('/dashboard')
    }

  } catch (error) {
    dispatch(apiError(error));
  }
};

export const resetLoginFlag = () => async (dispatch : any) => {
  try {
    return dispatch(reset_login_flag());
  } catch (error) {
    dispatch(apiError(error));
  }
};