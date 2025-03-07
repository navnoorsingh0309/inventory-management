import RequestsTabular from "@/components/RequestsPage/requestsTabular";
import React from "react";

const RequestsPage = async () => {

  return (
    <div className="p-6 rounded-lg shadow-lg border border-gray-200">
      <RequestsTabular />
    </div>
  );
};

export default RequestsPage;
