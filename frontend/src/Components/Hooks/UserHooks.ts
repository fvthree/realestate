import { useEffect, useState } from "react";
import { getLoggedinUser } from "../../helpers/api_helper";

const useProfile = () => {
  const userProfileSession = getLoggedinUser();
  const token = userProfileSession && userProfileSession["token"];
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(
    userProfileSession ? userProfileSession : null
  );

  useEffect(() => {
    const userProfileSession = getLoggedinUser();
    const token = userProfileSession && userProfileSession["token"];
    setUserProfile(userProfileSession ? userProfileSession : null);
    setLoading(false);
  }, []);


  return { userProfile, loading,token };
};

export { useProfile };