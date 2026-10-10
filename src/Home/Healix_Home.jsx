import Navbar_main from "../Navbar_main";
import Home_Card from "./Home_Card";
import { useState } from "react";
import { Link } from "react-router-dom";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedOutlinedIcon from "@mui/icons-material/RadioButtonUncheckedOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { Shield } from "lucide-react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ImportContactsOutlinedIcon from "@mui/icons-material/ImportContactsOutlined";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
const Home = () => {
  const [profileSetup, setProfileSetup]=useState(true);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [medicalReports, setMedicalReports]=useState(false);
  return (
    <div className="flex flex-col gap-8">
      <div className="sticky top-0 z-50 w-full">
        <Navbar_main />
      </div>
      <div className="Welcome w-screen">
        <div className="flex justify-between px-12 items-center">
          <div>
            <h1 className="font-serif text-5xl">
              Welcome to Healix, Alexandra
            </h1>
            <p className="text-base text-black/60 tracking-wider py-2">
              Your setup is complete. Your next step toward understanding your
              health starts here.
            </p>
          </div>
          <div>
            <h3 className="text-base rounded-xl w-fit px-3 py-1 bg-[#00C9A7]/10 text-[#00C9A7] flex items-center">
              <CheckCircleRoundedIcon className="text-[#00C9A7]" />
              &nbsp; Setup complete
            </h3>
          </div>
        </div>

        <div className="cards flex w-screen px-12 mt-6 gap-4">
          <div className="flex flex-col w-[65%] gap-8 py-5 px-8 rounded-xl border-2 border-[#00C9A7]  bg-[#00C9A7]/15">
            <div>
              <div className="flex items-center gap-2 text-[#00C9A7]">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <p className="font-semibold">RECOMMENDED FIRST STEP</p>
              </div>
            </div>
            <div>
              <h1 className="font-serif text-4xl">
                Start your first Health Assessment
              </h1>
              <p className="text-base text-black/60 tracking-wider py-2">
                Tell us about your symptoms, medical history and lifestyle to
                help you understand what to explore next.
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <Link
                to="/HealthAssesment"
                className="border-[#00C9A7] border-2 px-4 py-2 rounded-3xl text-black bg-[#00C9A7] font-semibold transition-transform duration-500 hover:scale-105"
              >
                Start Health Assesment →
              </Link>
              <p className="text-black/60">Not Started Yet</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-[35%] px-10 border-2 border-black/10 py-4 bg-white rounded-xl shadow-md">
            <h1 className="font-serif text-3xl">You’re ready to begin</h1>
            <div className="flex justify-between">
              <p className="font-serif">
                {profileSetup ? (
                  <CheckCircleOutlinedIcon
                    fontSize="small"
                    className="text-[#00C9A7]"
                  />
                ) : (
                  <RadioButtonUncheckedOutlinedIcon fontSize="small" />
                )}
                &nbsp; Profile Setup
              </p>
              <p
                className={`font-serif ${
                  profileSetup ? "text-[#00C9A7]" : "text-black/80"
                }`}
              >
                {profileSetup ? "Complete" : "Not Complete"}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="font-serif  text-black/80  items-center">
                {assessmentComplete ? (
                  <CheckCircleOutlinedIcon
                    fontSize="small"
                    className="text-[#00C9A7]"
                  />
                ) : (
                  <RadioButtonUncheckedOutlinedIcon fontSize="small" />
                )}
                &nbsp; Health Assessment
              </p>
              <p
                className={`font-serif ${
                  assessmentComplete ? "text-[#00C9A7]" : "text-black/80"
                }`}
              >
                {assessmentComplete ? "Complete" : "Not started"}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="font-serif  text-black/80">
                {medicalReports ? (
                  <CheckCircleOutlinedIcon
                    fontSize="small"
                    className="text-[#00C9A7]"
                  />
                ) : (
                  <RadioButtonUncheckedOutlinedIcon fontSize="small" />
                )}
                &nbsp; Medical Reports
              </p>
              <p
                className={`font-serif ${
                  assessmentComplete ? "text-[#00C9A7]" : "text-black/80"
                }`}
              >
                {medicalReports ? "Complete" : "No Reports Added"}
              </p>
            </div>
            <hr />
            <p className="text-black/60">
              Take it at your own pace. You can explore any of the tools below
              whenever you’re ready.
            </p>
          </div>
        </div>

        <div className="mt-6 px-12">
          <h1 className="font-serif text-4xl">Your health, All in one place</h1>
          <p className="text-base text-black/60 tracking-wider py-2">
            Choose what you need today. Everything is here when you need it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-12 mt-6">
          <Home_Card
            path="/Dashboard"
            header="Dashboard"
            info="See your health overview and activity as you complete assessments and add reports."
            link="Open Dashboard"
            icon={<DashboardIcon />}
          />
          <Home_Card
            path="/MedicalReports"
            header="Medical Reports"
            info="Upload and organize your lab results, prescriptions and other medical documents securely."
            link="Add your report"
            icon={<DescriptionOutlinedIcon />}
          />
          <Home_Card
            path="/Guidance"
            header="Health Guidance"
            info="Explore clear, practical information on everyday wellbeing and your health interests."
            link="Explore guidance"
            icon={<ImportContactsOutlinedIcon />}
          />
          <Home_Card
            path="/HealthCare"
            header="Find Healthcare"
            info="See your health overview and activity as you complete assessments and add reports."
            link="Find a provider"
            icon={<FmdGoodOutlinedIcon />}
          />
          <Home_Card
            path="/CostEstimator"
            header="Cost Estimator"
            info="Explore estimated costs for visits and procedures to plan ahead with more confidence."
            link="Estimate a cost"
            icon={<CalculateOutlinedIcon />}
          />
          <Home_Card
            path="/AskHealix"
            header="Ask Healix"
            info="Ask a health question, understand medical terms or get help finding your next step."
            link="Start a conversation"
            icon={<QuestionAnswerRoundedIcon />}
          />
        </div>

        {/* <div className="border-t border-2 border-white/10 mx-12"></div> */}
        <div className="mt-12 ml-12 mr-12 flex justify-between border-t-2 border-black/40 p-4">
          <div className="w-full flex gap-3">
            <Shield className="text-sm" />
            <p className="text-base ">
              Healix provides health information, not medical diagnoses. Always
              consult a healthcare professional for medical advice.
            </p>
          </div>
          <p className="underline font-serif text-[#00C9A7]">Need_help?</p>
        </div>
      </div>
    </div>
  );
}
export default Home