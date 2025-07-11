import React from "react";
import Contactuslist from './components/contactuslist'
const ContactUs: React.FC = () => {
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-2">Contact Inquiries</h1>
      <p className="mb-6 text-gray-600">
        Review and manage user inquiries submitted via the <strong>Contact Us</strong> form on the DigitalBillionaire platform. <br />
        Respond to messages, track communication status, and ensure timely support for user concerns.
      </p>
      <Contactuslist/>
    </div>
  );
};

export default ContactUs;
