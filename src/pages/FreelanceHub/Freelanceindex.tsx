import React from "react";
import FreelanceApplicationsList from "./Component/Freelancelist";
const Freelanceindex: React.FC = () => {
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-2">Freelance Opportunities</h1>
      <p className="mb-6 text-gray-600">
        Review submitted freelance applications at <strong>DigitalBillionaire</strong>. <br />
        Track applicant details, view submissions, and manage freelance onboarding.
      </p>
      <FreelanceApplicationsList/>
    </div>
  );
};

export default Freelanceindex;
