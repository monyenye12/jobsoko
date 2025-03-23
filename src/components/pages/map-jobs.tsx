import React from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import MapJobView from "../job/MapJobView";

const MapJobsPage = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activeItem="Map View" />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <MapJobView />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MapJobsPage;
