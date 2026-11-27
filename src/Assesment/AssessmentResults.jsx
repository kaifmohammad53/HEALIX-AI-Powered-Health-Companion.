import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Download } from "lucide-react";
import Navbar_main from "../Navbar_main";

const hasScore = (value) =>
  value !== null &&
  value !== undefined &&
  value !== "" &&
  !Number.isNaN(Number(value));

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value)));

const SectionTitle = ({ children }) => (
  <h2 className="text-sm font-semibold uppercase tracking-wider text-black/60">
    {children}
  </h2>
);

const ScoreBar = ({ value, className = "" }) => (
  <div className={`h-2 rounded-full bg-black/5 ${className}`}>
    <div
      className="h-full rounded-full bg-amber-400"
      style={{ width: `${clampPercent(value)}%` }}
    />
  </div>
);

const AssessmentResults = () => {
  const navigate = useNavigate();

  const [prediction, setPrediction] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Always load the latest saved assessment from the backend.
  // Do not use stale sessionStorage or previous navigation state.
  useEffect(() => {
    const controller = new AbortController();

    const fetchLatestAssessment = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please sign in to view your latest assessment.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:8081/api/v1/assessments/latest",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          },
        );

        if (response.status === 404) {
          setPrediction(null);
          setFormData({});
          setError("");
          return;
        }

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error(
              "Your session could not be verified. Please sign in again.",
            );
          }

          throw new Error(
            `Unable to load the latest assessment (HTTP ${response.status}).`,
          );
        }

        const payload = await response.json();
        const assessment = payload?.assessment ?? payload?.data ?? payload;

        if (!assessment || typeof assessment !== "object") {
          throw new Error("The server returned an invalid assessment.");
        }

        const savedPredictions = Array.isArray(assessment.predictions)
          ? [...assessment.predictions].sort(
              (a, b) =>
                Number(b.model_score_percent ?? -1) -
                Number(a.model_score_percent ?? -1),
            )
          : [];

        // Keep the existing UI data shape, but use only the backend record.
        setPrediction({
          ...assessment,
          predictions: savedPredictions,
        });

        setFormData({
          ...(assessment.answers || {}),
          symptoms: Array.isArray(assessment.symptoms)
            ? assessment.symptoms
            : [],
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch latest assessment:", err);
          setError(err.message || "Unable to load your latest assessment.");
          setPrediction(null);
          setFormData({});
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchLatestAssessment();

    return () => controller.abort();
  }, []);

  const predictions = Array.isArray(prediction?.predictions)
    ? prediction.predictions
    : [];

  // The first item is now the highest-scoring prediction.
  const top = predictions[0];

  const symptoms = Array.isArray(formData?.symptoms) ? formData.symptoms : [];

  const basedOn =
    symptoms.length > 0
      ? `Based on your reported symptoms: ${symptoms
          .slice(0, 3)
          .join(", ")
          .toLowerCase()}${symptoms.length > 3 ? " and more" : ""}.`
      : "Based on the symptoms you reported.";

  const details = [
    ["Severity", formData?.symptomsSeverity],
    ["Duration", formData?.symptomsDuration],
    ["Physical activity", formData?.activityLevel],
    ["Sleep duration", formData?.sleepDuration],
    ["Stress level", formData?.stressLevel],
  ];

  const actions = [
    [
      "Consult a healthcare professional",
      "Share these results and your symptoms with a qualified doctor, especially if your symptoms persist.",
    ],
    [
      "Keep track of your symptoms",
      "Note when symptoms start, how severe they are and what makes them better or worse, and bring this to your appointment.",
    ],
    [
      "Know when to seek urgent care",
      "Get medical help right away for severe, sudden or rapidly worsening symptoms, such as chest pain or trouble breathing.",
    ],
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="sticky top-0 z-50 w-full print:hidden">
        <Navbar_main />
      </div>

      <main className="px-6 py-8 sm:px-12">
        <div className="mx-auto max-w-4xl">
          <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-md sm:p-10 print:border-0 print:shadow-none">
            <header className="mb-8 text-center">
              <span className="inline-flex rounded-full border border-amber-400 bg-amber-50 px-4 py-1 text-sm font-semibold tracking-wider text-amber-600">
                ASSESSMENT COMPLETE
              </span>

              <h1 className="mt-4 font-serif text-5xl text-[#0B1A2E]">
                Assessment Findings
              </h1>
            </header>

            {loading ? (
              <section className="rounded-xl border border-black/10 p-8 text-center">
                <p className="text-base text-black/60">
                  Loading your latest saved assessment...
                </p>
              </section>
            ) : error ? (
              <section className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                <p className="text-base text-red-700">{error}</p>

                <button
                  type="button"
                  onClick={() => navigate("/Healix_Home")}
                  className="mt-5 rounded-3xl border-2 border-[#00C9A7] bg-[#00C9A7] px-5 py-2 text-base font-semibold text-black transition-transform duration-300 hover:scale-105"
                >
                  Back to Home
                </button>
              </section>
            ) : !prediction ? (
              <section className="rounded-xl border border-black/10 p-8 text-center">
                <p className="text-base text-black/60">
                  No saved assessment was found. Please complete your assessment
                  to see your findings.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/HealthAssesment")}
                  className="mt-5 rounded-3xl border-2 border-[#00C9A7] bg-[#00C9A7] px-5 py-2 text-lg font-semibold text-black transition-transform duration-300 hover:scale-105"
                >
                  Start Assessment →
                </button>
              </section>
            ) : (
              <>
                {/* Top model prediction */}
                <section className="rounded-xl border border-black/10 px-6 py-8 text-center">
                  <p className="text-sm font-semibold uppercase tracking-wider text-black/60">
                    Top model prediction
                  </p>

                  <h2 className="mt-3 break-words font-serif text-4xl font-semibold text-amber-500">
                    {top?.condition || "No prediction available"}
                  </h2>

                  {hasScore(top?.model_score_percent) ? (
                    <>
                      <ScoreBar
                        value={top.model_score_percent}
                        className="mx-auto mt-4 w-72 max-w-full"
                      />

                      <p className="mt-2 text-sm text-black/60">
                        Model score: {top.model_score_percent}%
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-black/60">
                      Score unavailable
                    </p>
                  )}

                  <p className="mt-4 text-base tracking-wide text-black/60">
                    {basedOn}
                  </p>
                </section>

                {/* Disclaimer */}
                <section className="mt-5 flex items-start gap-3 rounded-xl border border-black/10 p-4">
                  <AlertTriangle
                    size={20}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <p className="text-base leading-6 text-black/70">
                    <strong className="text-black">
                      Important Disclaimer:
                    </strong>{" "}
                    {prediction.disclaimer ||
                      "HEALIX is a digital companion for health education only. This is not a clinical medical diagnosis. Please consult a qualified healthcare professional."}
                  </p>
                </section>

                {/* Reported symptoms */}
                <section className="mt-9">
                  <SectionTitle>Reported symptoms</SectionTitle>

                  <div className="mt-3 rounded-xl border border-black/10 p-5">
                    <div className="flex flex-wrap gap-2">
                      {symptoms.length > 0 ? (
                        symptoms.map((symptom) => (
                          <span
                            key={symptom}
                            className="rounded-full border border-[#00C9A7] bg-[#00C9A7]/10 px-3 py-1 text-sm font-medium text-[#008C78]"
                          >
                            {symptom}
                          </span>
                        ))
                      ) : (
                        <p className="text-base text-black/60">
                          No symptoms recorded.
                        </p>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {details.map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-xl bg-[#F8F9FB] px-4 py-3"
                        >
                          <p className="text-sm text-black/60">{label}</p>

                          <p className="mt-1 text-base font-semibold text-[#0B1A2E]">
                            {value || "Not specified"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {formData?.primaryHealthConcern && (
                      <div className="mt-5">
                        <p className="text-sm text-black/60">
                          Primary health concern
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-base text-[#0B1A2E]">
                          {formData.primaryHealthConcern}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* All model predictions */}
                <section className="mt-9">
                  <SectionTitle>Model predictions</SectionTitle>

                  <div className="mt-3 rounded-xl border border-black/10 p-5">
                    <div className="flex flex-col gap-3">
                      {predictions.map((item, index) => (
                        <div
                          key={`${item.condition}-${index}`}
                          className="flex items-center gap-4 rounded-xl border border-black/10 p-4"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E5F9F5] text-base font-semibold text-[#008C78]">
                            {index + 1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="break-words font-serif text-xl text-[#0B1A2E]">
                              {item.condition}
                            </p>

                            {hasScore(item.model_score_percent) && (
                              <ScoreBar
                                value={item.model_score_percent}
                                className="mt-2 max-w-xs"
                              />
                            )}
                          </div>

                          {hasScore(item.model_score_percent) ? (
                            <span className="shrink-0 rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
                              {item.model_score_percent}%
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full border border-black/10 px-3 py-1 text-sm text-black/60">
                              Unavailable
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-xl bg-[#F8F9FB] p-5">
                      <p className="text-base font-semibold text-[#0B1A2E]">
                        Important note
                      </p>

                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-black/70">
                        <li>
                          Scores are outputs of a trained model for the symptoms
                          you selected. They are not calibrated disease
                          probabilities.
                        </li>

                        <li>
                          A model prediction is not a diagnosis and does not
                          replace a clinical evaluation.
                        </li>

                        <li>
                          If a score cannot be calculated it is shown as
                          unavailable, never as 0%.
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Recommended actions */}
                <section className="mt-9">
                  <SectionTitle>Recommended actions</SectionTitle>

                  <ol className="mt-3 flex flex-col gap-4">
                    {actions.map(([title, text], index) => (
                      <li key={title} className="flex items-start gap-4">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5F9F5] text-sm font-semibold text-[#008C78]">
                          {index + 1}
                        </span>

                        <div>
                          <p className="font-serif text-xl text-[#0B1A2E]">
                            {title}
                          </p>

                          <p className="mt-1 text-base leading-6 text-black/60">
                            {text}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                <footer className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-6 print:hidden">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-2 rounded-3xl border-2 border-black/10 px-5 py-2 text-base font-semibold text-black transition-transform duration-300 hover:scale-105"
                  >
                    <Download size={18} />
                    Download PDF Report
                  </button>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/Dashboard")}
                      className="rounded-3xl border-2 border-black/10 px-5 py-2 text-base font-semibold text-black transition-transform duration-300 hover:scale-105"
                    >
                      Dashboard
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/HealthCare")}
                      className="rounded-3xl border-2 border-[#00C9A7] bg-[#00C9A7] px-5 py-2 text-base font-semibold text-black transition-transform duration-300 hover:scale-105"
                    >
                      Find Healthcare
                    </button>
                  </div>
                </footer>
              </>
            )}
          </article>
        </div>
      </main>
    </div>
  );
};

export default AssessmentResults;
