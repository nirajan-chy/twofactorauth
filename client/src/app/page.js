import RegistrationSystem from "@/components/Register";
import React from "react";
import OtpPage from "./otp/page";
import DashboardPage from "@/components/Dashboard";

const page = () => {
  return (
    <>
      <RegistrationSystem />
      <OtpPage />
      <DashboardPage />
    </>
  );
};

export default page;
