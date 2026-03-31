import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import LoadingState from "./LoadingState";
import { getMyPSWProfileRequest } from "../services/pswProfileApi";

const PSWApprovedRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const checkApproval = async () => {
      setIsLoading(true);
      try {
        const data = await getMyPSWProfileRequest();
        setIsApproved(data?.profile?.verificationStatus === "approved");
      } catch (_error) {
        // No profile or failed fetch means user should stay in setup flow.
        setIsApproved(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkApproval();
  }, []);

  if (isLoading) {
    return <LoadingState label="Checking approval status..." />;
  }

  if (!isApproved) {
    return (
      <Navigate
        to="/psw/profile"
        replace
        state={{ activeTab: "about", approvalRequired: true }}
      />
    );
  }

  return <Outlet />;
};

export default PSWApprovedRoute;
