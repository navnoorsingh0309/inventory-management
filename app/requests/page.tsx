import RequestsTabular from "@/components/RequestsPage/requestsTabular";
import React from "react";

const RequestsPage = async () => {
  return (
    <div className="mt-10 mx-5 rounded-xl p-3 shadow-lg border border-gray-200 relative mb-5">
      <RequestsTabular />
    </div>
  );
};

export default RequestsPage;
