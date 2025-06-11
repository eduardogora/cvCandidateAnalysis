import React from "react";
import Header from "@/components/ui/header";
import { SearchBar } from "@/components/search-bar";
import { JobGrid } from "@/components/job-grid"
import { CreateJobPanel } from "@/components/create-job-panel"
import { getJobs } from "@/app/actions/job-actions"

const PisaManager = async () => {
  // Fetch jobs server-side
  const jobs = await getJobs()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome a PiSa Manager</h1>
          <p className="text-gray-600">Select a candidate has never been this easy!</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Create Job Panel */}
          <div className="lg:w-1/4">
            <CreateJobPanel />
          </div>

          {/* Right side - Search and Job Grid */}
          <div className="lg:w-3/4">
            <SearchBar />
            <div className="mt-6">
              <JobGrid initialJobs={jobs} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PisaManager;