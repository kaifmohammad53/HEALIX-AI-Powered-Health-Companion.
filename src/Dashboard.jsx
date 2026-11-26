import Navbar_main from "./Navbar_main.jsx";
import { Shield, FileText, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CloudUpload,
  BookOpen,
  MapPin,
  DollarSign,
  MessageSquare,
} from "lucide-react";

const ContributingFactor = ({ factor, info }) => {
  return (
    <div className="border px-5 py-3 rounded-xl">
      <p className="font-serif font-semibold text-black/80">{factor}</p>
      <p className="text-black/60">{info}</p>
    </div>
  );
};

const ReportsGrid = ({ documentName, documentDate, documentStatus }) => {
  return (
    <div className="flex justify-between px-5 py-3 border rounded-xl items-center">
      <div className="flex gap-5 items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <FileText size={18} className="text-emerald-500" />
        </div>

        <div className="flex flex-col">
          <p className="font-serif font-semibold text-black/80">
            {documentName}
          </p>
          <p className="text-black/60">{documentDate}</p>
        </div>
      </div>

      <div>
        <p
          className={`${
            documentStatus === "Action Required"
              ? "text-[#F59E0B] bg-[#F59E0B]/20 border-[#F59E0B]"
              : documentStatus === "Completed"
                ? "text-[#00C9A7] bg-[#00C9A7]/20 border-[#00C9A7]"
                : "text-black/60 bg-black/10 border-black/60"
          } px-2 py-1 border-2 font-serif rounded-lg`}
        >
          {documentStatus}
        </p>
      </div>
    </div>
  );
};

const QuickActions = ({ actionIcon: ActionIcon, actionName }) => {
  return (
    <div className="flex py-5 px-10 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
        <ActionIcon size={30} className="text-teal-500" strokeWidth={2} />
      </div>

      <p className="text-sm font-serif font-semibold text-black/80">
        {actionName}
      </p>
    </div>
  );
};

const RecentActivity = ({ activityTitle, info, activityDate }) => {
  return (
    <div className="flex gap-2">
      <div>
        <Circle size={8} fill="currentColor" className="text-[#00C9A7]" />
      </div>

      <div className="flex flex-col">
        <p className="font-serif font-semibold text-black/80">
          {activityTitle}
        </p>
        <p className="text-black/60">{info}</p>
        <p className="text-black/60">{activityDate}</p>
      </div>
    </div>
  );
};

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const getDisplayName = (user) => {
  if (!user) return "there";

  const name = user.firstName || user.fullName || user.name || user.username;

  if (typeof name === "string" && name.trim()) {
    return name.trim().split(/\s+/)[0];
  }

  if (typeof user.email === "string" && user.email.includes("@")) {
    return user.email.split("@")[0];
  }

  return "there";
};

const Dashboard = () => {
  const [userName] = useState(() => getDisplayName(getStoredUser()));

  const [latestAssessment, setLatestAssessment] = useState(null);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [assessmentLoading, setAssessmentLoading] = useState(true);

  const [currentDate] = useState(() =>
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    const loadDashboardData = async () => {
      if (!token) {
        setAssessmentLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        const [latestResponse, historyResponse] = await Promise.all([
          fetch("http://localhost:8081/api/v1/assessments/latest", {
            headers,
          }),
          fetch("http://localhost:8081/api/v1/assessments", {
            headers,
          }),
        ]);

        if (latestResponse.ok) {
          const latestData = await latestResponse.json();
          setLatestAssessment(latestData);

          localStorage.setItem(
            "healixLatestAssessment",
            JSON.stringify(latestData),
          );
        } else if (latestResponse.status === 404) {
          setLatestAssessment(null);
          localStorage.removeItem("healixLatestAssessment");
        } else {
          console.error(
            "Latest assessment request failed:",
            latestResponse.status,
          );
        }

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();

          if (Array.isArray(historyData)) {
            setAssessmentCount(historyData.length);

            localStorage.setItem(
              "healixAssessmentHistory",
              JSON.stringify(historyData),
            );
          }
        } else {
          console.error(
            "Assessment history request failed:",
            historyResponse.status,
          );
        }
      } catch (error) {
        console.error("Unable to load dashboard assessments:", error);
      } finally {
        setAssessmentLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const completedDate = latestAssessment?.completedAt
    ? new Date(latestAssessment.completedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const predictions = Array.isArray(latestAssessment?.predictions)
    ? latestAssessment.predictions
    : [];

  const reportedSymptoms = Array.isArray(latestAssessment?.symptoms)
    ? latestAssessment.symptoms
    : [];

  const topPrediction = [...predictions].sort(
    (a, b) =>
      Number(b.model_score_percent ?? 0) - Number(a.model_score_percent ?? 0),
  )[0];

  const topCondition = topPrediction?.condition || "No prediction available";

  const topScore = topPrediction?.model_score_percent;

  return (
    <div className="flex flex-col gap-8">
      <div className="sticky top-0 z-50 w-full">
        <Navbar_main />
      </div>

      {/* Greeting */}
      <div className="flex justify-between px-12 items-center">
        <div>
          <h1 className="font-serif text-5xl">Good Morning, {userName}</h1>

          <p className="text-base text-black/60 tracking-wider py-2">
            {currentDate} • Your health profile is up to date.
          </p>
        </div>

        <div>
          <h3 className="text-base rounded-xl w-fit px-3 py-1 bg-[#00C9A7]/10 text-[#00C9A7] flex items-center">
            <Shield className="text-[#00C9A7]" />
            &nbsp; HIPAA Secured Profile
          </h3>
        </div>
      </div>

      {/* Main dashboard cards */}
      <div className="w-full flex gap-5 px-8">
        {/* Latest Model Result */}
        <div className="border-2 rounded-xl p-5 flex flex-col gap-3 w-1/3 shadow-sm">
          <p className="text-black/60 font-serif tracking-wider text-xl">
            Latest Model Result
          </p>

          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-4">
            <p className="font-serif text-3xl font-semibold text-orange-500 break-words">
              {assessmentLoading ? "Loading..." : topCondition}
            </p>

            {topScore !== undefined && topScore !== null && (
              <p className="text-lg text-black/60">Model score: {topScore}%</p>
            )}

            <p className="text-black/60  text-base font-serif">
              AI model output is not a diagnosis.
            </p>

            <span className="text-[#00C9A7] bg-[#00C9A7]/20 border-[#00C9A7] p-2 border-2 font-serif font-semibold rounded-xl">
              Assessments completed: {assessmentCount}
            </span>

            {latestAssessment && (
              <Link
                to="/AssessmentResults"
                state={{ assessment: latestAssessment }}
                className="text-[#00C9A7] font-serif text-lg font-medium"
              >
                View Assessment →
              </Link>
            )}
          </div>
        </div>

        {/* Latest Assessment Analysis */}
        <div className="border-2 rounded-xl w-2/3 flex flex-col gap-5 px-8 shadow-sm py-5">
          <div className="w-full flex justify-between items-center">
            <p className="text-black/60 font-serif tracking-wider text-xl">
              Latest Assessment Analysis
            </p>

            <p className="text-black/60 font-serif tracking-wider text-sm">
              {assessmentLoading
                ? "Loading..."
                : completedDate
                  ? `Completed ${completedDate}`
                  : "No saved assessment"}
            </p>
          </div>

          {latestAssessment ? (
            <>
              <p className="font-serif text-black/80">
                <span className="text-[#00C9A7] bg-[#00C9A7]/20 border-[#00C9A7] p-2 border-2 font-serif font-semibold rounded-xl">
                  Assessment Saved
                </span>
                &nbsp;&nbsp;
                {reportedSymptoms.length
                  ? `Reported symptoms: ${reportedSymptoms.join(", ")}`
                  : "Your assessment has been saved."}
              </p>

              <hr />

              <p className="text-black/60 font-serif tracking-wider text-xl">
                Model Predictions
              </p>

              <div className="flex flex-wrap gap-5">
                {predictions.length > 0 ? (
                  predictions.map((prediction, index) => (
                    <ContributingFactor
                      key={`${prediction.condition || "prediction"}-${index}`}
                      factor={prediction.condition || "Model prediction"}
                      info={`Model score: ${
                        prediction.model_score_percent ?? "N/A"
                      }%`}
                    />
                  ))
                ) : (
                  <p className="text-black/60">
                    No model predictions were saved.
                  </p>
                )}
              </div>

              <Link
                to="/AssessmentResults"
                state={{ assessment: latestAssessment }}
                className="text-[#00C9A7] font-medium"
              >
                View Full Assessment →
              </Link>
            </>
          ) : (
            <>
              <p className="font-serif text-black/80">
                {assessmentLoading
                  ? "Loading your assessment..."
                  : "Complete a health assessment to see your latest results here."}
              </p>

              <hr />

              <p className="text-black/60 font-serif tracking-wider text-xl">
                Model Predictions
              </p>

              <div className="flex flex-wrap gap-5">
                <ContributingFactor
                  factor="No saved assessment"
                  info="Your model predictions will appear here."
                />
              </div>

              <Link
                to="/HealthAssesment"
                className="text-[#00C9A7] font-medium"
              >
                Start Health Assessment →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent Medical Reports and Recent Activity */}
      <div className="w-full px-8 flex gap-5">
        <div className="border-2 rounded-xl w-2/3 flex flex-col gap-5 px-8 shadow-sm py-5">
          <div className="flex justify-between items-center">
            <h1 className="font-serif text-3xl">Recent Medical Reports</h1>

            <Link to="/MedicalReports" className="text-[#00C9A7]">
              View all reports →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <ReportsGrid
              documentName="Annual Physical Labs"
              documentDate="Oct 10, 2024"
              documentStatus="Completed"
            />

            <ReportsGrid
              documentName="Symptom Analysis Report"
              documentDate="Oct 05, 2024"
              documentStatus="Reviewed"
            />

            <ReportsGrid
              documentName="Cardiology Consult Summary"
              documentDate="Sep 28, 2024"
              documentStatus="Action Required"
            />
          </div>
        </div>

        <div className="w-1/3 border-2 rounded-xl flex flex-col gap-5 px-8 shadow-sm py-5">
          <h1 className="font-serif text-3xl">Recent Activity</h1>

          {latestAssessment ? (
            <RecentActivity
              activityTitle="Completed Health Assessment"
              info={
                reportedSymptoms.length
                  ? `Reported: ${reportedSymptoms.join(", ")}`
                  : "Assessment saved."
              }
              activityDate={completedDate || "Recently completed"}
            />
          ) : (
            <>
              <RecentActivity
                activityTitle="No recent assessment"
                info="Your assessment activity will appear here."
                activityDate="Not available"
              />

              <RecentActivity
                activityTitle="Health profile"
                info="Complete an assessment to update your dashboard."
                activityDate="Awaiting assessment"
              />
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <p className="text-xl text-black/60 tracking-wider pt-2 font-bold px-8">
        QUICK ACTIONS
      </p>

      <div className="flex justify-between px-8 pb-10">
        <Link to="/HealthAssesment">
          <QuickActions actionIcon={Activity} actionName="New Assessment" />
        </Link>

        <Link to="/MedicalReports">
          <QuickActions actionIcon={CloudUpload} actionName="Upload Reports" />
        </Link>

        <Link to="/HealthGuidance">
          <QuickActions actionIcon={BookOpen} actionName="Health Guidance" />
        </Link>

        <Link to="/FindHealthcare">
          <QuickActions actionIcon={MapPin} actionName="Find Healthcare" />
        </Link>

        <Link to="/CostEstimator">
          <QuickActions actionIcon={DollarSign} actionName="Cost Estimator" />
        </Link>

        <Link to="/AskHealix">
          <QuickActions actionIcon={MessageSquare} actionName="Ask Healix" />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
