"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import ViewPendingModal from "./DashboardContent_StartUp/ViewPendingModal";
import ViewAcceptedModal from "./DashboardContent_StartUp/ViewAcceptedModal";
import ViewRejectedModal from "./DashboardContent_StartUp/ViewRejectedModal";
import { LuDot } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { scrollToTop } from "@/lib/utils";
import { getAllJobApplications } from "@/actions/action";


interface ApplicationCard {
  id: string;
  jobSeeker: {
    fullName: string;
    user: {
      email: string;
    }; 
    shortBio: string;
    portfolioLink?: string;
    resumeUrl: string;
    skills: string[];
    interests: string[];
  };
  jobRole: string;
  applicationDate: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

const Application: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationCard | null>(null);
  const [applications, setApplications] = useState<ApplicationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

    const updateApplicationStatus = (
      applicationId: string,
      newStatus: "ACCEPTED" | "REJECTED"
    ) => {
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);

        // Keeping your test token as requested
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");
        const response = await getAllJobApplications(token, 1, 4);

    const transformedApplications = response.applications.map((app) => ({
      id: app.id,
      jobSeeker: {
        fullName: app.jobSeeker.fullName,
        user : {email: app.jobSeeker.user.email},
        shortBio: app.jobSeeker.shortBio,
        portfolioLink: app.jobSeeker.portfolioLink, // optional
        resumeUrl: app.jobSeeker.resumeUrl,
        skills: app.jobSeeker.skills,
        interests: app.jobSeeker.interests,
      },
      jobRole: app.job.title,
      applicationDate: new Date(app.appliedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: app.status,
    }));



        setApplications(transformedApplications);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleViewApplication = (app: ApplicationCard) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center my-10 p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#1AC23F] text-white px-6 py-1 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full">
      {applications.length === 0 ? (
        <>
         <div className="bg-[#FFFFFF] border border-[#EDEFF2] rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-[#2A2A2A] cal_sans">
              Recent Applications
            </h2>
            <div className="flex flex-col items-center justify-center text-center bg-gray-100 border border-gray-200 rounded-lg custom-padding-y">
              <Image
                src="/assets/images/bear2.png"
                alt="No Jobs"
                width={124}
                height={132}
                priority
              />
              <h2 className="text-2xl font-semibold text-[#101828] mt-6 cal_sans">
                No Recent Applications for you
              </h2>
              <p className="text-[#667085] mt-2 DM_sans">
                You haven't made a post yet. <br /> Click the button below to
                get started
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="px-[4%] md:px-6 py-10 bg-white border border-[#EDEFF2] rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#2A2A2A] cal_sans">
              Recent Applications
            </h2>

            <div className="overflow-x-auto DM_sans">
              <div className="min-w-[500px] md:min-w-0">
                <div className="grid grid-cols-4 bg-gray-100 text-[#4D5461] p-4 font-semibold space-x-9">
                  <div className="text-left">NAME</div>
                  <div className="text-left">ROLE</div>
                  <div className="text-left">STATUS</div>
                  <div className="text-left">ACTION</div>
                </div>

                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="grid grid-cols-4 bg-white shadow-sm rounded-lg  items-center space-x-9 p-2"
                    >
                      <div className="flex items-center gap-4 text-[#1F2937] text-sm">
                        <Image
                          src="/assets/images/profile.png"
                          alt={`${app.jobSeeker.fullName}'s profile`}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        {app.jobSeeker.fullName}
                      </div>

                      <td className="p-3 text-sm text-[#1F2937]">{app.jobRole}</td>

                      <div
                        className={`font-medium flex items-center text-sm ${
                          app.status === "ACCEPTED"
                            ? "text-[#1AC23F]"
                            : app.status === "REJECTED"
                              ? "text-[#F9150B]"
                              : "text-[#777777]"
                        }`}
                      >
                        <LuDot size={30} />
                        {app.status}
                      </div>

                      <div>
                        <button
                          onClick={() => handleViewApplication(app)}
                          className="text-[#526F58] border border-[#9CB8A2] hover:border-green-200 hover:bg-green-200 hover:text-green-600 cal_sans px-5 py-2 rounded-md text-sm cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {isModalOpen && selectedApplication?.status === "PENDING" && (
                <ViewPendingModal
                  isOpen={isModalOpen}
                  setIsOpen={setIsModalOpen}
                  application={selectedApplication}
                  onStatusUpdate={(id, newStatus) => {
                    updateApplicationStatus(id, newStatus);
                  }}
                />
              )}
              {isModalOpen && selectedApplication?.status === "ACCEPTED" && (
                <ViewAcceptedModal
                  isOpen={isModalOpen}
                  setIsOpen={setIsModalOpen}
                  application={selectedApplication}
                />
              )}
              {isModalOpen && selectedApplication?.status === "REJECTED" && (
                <ViewRejectedModal
                  isOpen={isModalOpen}
                  setIsOpen={setIsModalOpen}
                  application={selectedApplication}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Application;