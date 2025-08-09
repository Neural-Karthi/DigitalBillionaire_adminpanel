import React from "react";
import Fundaccountlist from "./components/Fundaccountlist";
const Fundaccount: React.FC = () => {
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-2">Fund Account List</h1>
      <p className="mb-6 text-gray-600">
        This is the list of Razorpay fund accounts associated with customers. 
        Review the details, apply filters, and manage verification or updates as needed.
      </p>
      <Fundaccountlist/>
    </div>
  );
};

export default Fundaccount;
