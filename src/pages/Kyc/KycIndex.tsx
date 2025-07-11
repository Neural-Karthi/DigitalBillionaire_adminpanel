import React from "react";
import KycLists from "./Components/KycLists";

const Kycpage: React.FC = () => {
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
      <p className="mb-6 text-gray-600">
        Review and verify customer KYC details below. Use the filters,<br/> document previews, and verification actions to manage submissions efficiently.
      </p>
      <KycLists/>
    </div>
  );
};

export default Kycpage;
