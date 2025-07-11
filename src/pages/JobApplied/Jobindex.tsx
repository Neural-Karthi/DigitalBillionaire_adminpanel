import React from "react";
import JobAppliedlist from './Components/JobAppliedlist'
const Jobindex: React.FC = () => {
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-2">Job Applications</h1>
      <p className="mb-6 text-gray-600">
        Review submitted job applications at <strong>DigitalBillionaire</strong>. <br />
        Track applicant information, monitor application statuses, and manage the hiring process efficiently.
      </p>
      <JobAppliedlist/>
    </div>
  );
};

export default Jobindex;
