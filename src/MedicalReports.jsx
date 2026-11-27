import { useEffect, useMemo, useRef, useState } from "react";
import { CloudUpload, FileText, X } from "lucide-react";
import Navbar_main from "./Navbar_main.jsx";

const API_BASE = "http://localhost:8081/api/v1/medical-reports";
const AI_API = "http://127.0.0.1:8000/api/process-report";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const CATEGORIES = [
  "All Reports",
  "Lab Results",
  "Imaging",
  "Consultation",
  "Prescription",
];

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest First" },
  { value: "name", label: "Name (A-Z)" },
];

const STATUS_STYLES = {
  Reviewed: "text-[#00B494] bg-[#00C9A7]/10 border-[#00C9A7]",
  Pending: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]",
  "Pending Review": "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]",
  "AI Processed": "text-[#00B494] bg-[#00C9A7]/10 border-[#00C9A7]",
  "Action Required": "text-[#EF4444] bg-[#EF4444]/10 border-[#F87171]",
};

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

const todayISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const guessCategory = (fileName) => {
  const name = fileName.toLowerCase().replace(/_/g, " ");
  if (/\b(x-?ray|mri|ct|scan|ultrasound|imaging)\b/.test(name)) return "Imaging";
  if (/\b(prescription|rx|refill)\b/.test(name)) return "Prescription";
  if (/\b(consult|consultation|summary|discharge)\b/.test(name)) return "Consultation";
  return "Lab Results";
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Login session nahi mila. Please dobara login karo.");
  }
  return { Authorization: `Bearer ${token}` };
};

// Backend response ko existing UI ke expected format mein convert karta hai.
const mapReport = (item) => ({
  id: item.id,
  title: (item.originalFileName || "Medical Report").replace(/\.[^.]+$/, ""),
  date: item.reportDate || (item.uploadedAt ? item.uploadedAt.slice(0, 10) : todayISO()),
  category: CATEGORIES.includes(item.category) && item.category !== "All Reports"
    ? item.category
    : "Lab Results",
  // Backend mein abhi review-status field nahi hai, isliye Pending fallback hai.
  status: item.status || "Pending",
  fileType: item.contentType,
  fileUrl: null,
});

const CategoryTag = ({ label }) => (
  <span className="px-2.5 text-sm py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-500">
    {label}
  </span>
);

const StatusBadge = ({ status }) => (
  <span
    className={`px-3 py-1 text-sm font-medium rounded-md border ${
      STATUS_STYLES[status] ?? "text-slate-500 bg-slate-50 border-slate-200"
    }`}
  >
    {status}
  </span>
);

const ReportRow = ({ report, onView }) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_260px_minmax(0,1fr)] items-center gap-6 px-6 py-5 rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
    <div className="flex items-center gap-4 min-w-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00C9A7]/10">
        <FileText size={20} className="text-[#00C9A7]" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-[#0B1A2E] truncate">{report.title}</p>
        <p className="text-sm text-slate-500">{formatDate(report.date)}</p>
        <div className="flex items-center gap-2 mt-2 md:hidden">
          <CategoryTag label={report.category} />
          <StatusBadge status={report.status} />
        </div>
      </div>
    </div>

    <div className="hidden md:flex items-center gap-2">
      <div className="w-[112px] shrink-0">
        <CategoryTag label={report.category} />
      </div>
      <StatusBadge status={report.status} />
    </div>

    <button
      type="button"
      onClick={() => onView(report)}
      className="justify-self-end px-5 py-2 text-sm font-medium text-[#0B1A2E] bg-white border border-[#0B1A2E] rounded-full hover:bg-[#0B1A2E] hover:text-white transition-colors"
    >
      View Report
    </button>
  </div>
);

const ReportViewer = ({ report, onClose }) => {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isPdf = report.fileType === "application/pdf";
  const isImage = report.fileType?.startsWith("image/");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={report.title}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-auto rounded-2xl bg-white p-6 shadow-xl flex flex-col gap-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-[#0B1A2E]">{report.title}</h2>
            <p className="text-sm text-slate-500">{formatDate(report.date)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <CategoryTag label={report.category} />
          <StatusBadge status={report.status} />
        </div>

        {report.fileUrl && isPdf && (
          <iframe
            src={report.fileUrl}
            title={report.title}
            className="w-full h-[60vh] rounded-xl border border-slate-200"
          />
        )}
        {report.fileUrl && isImage && (
          <img
            src={report.fileUrl}
            alt={report.title}
            className="max-h-[60vh] w-full object-contain rounded-xl border border-slate-200"
          />
        )}
        {!report.fileUrl && (
          <p className="text-sm text-slate-500">
            The file preview isn&apos;t available for this report yet.
          </p>
        )}
      </div>
    </div>
  );
};

const MedicalReports = () => {
  const [reports, setReports] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All Reports");
  const [sortBy, setSortBy] = useState("recent");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [analysisResults, setAnalysisResults] = useState([]);
const [isUploading, setIsUploading] = useState(false);
const getDisplayStatus = (report) => {
  // Preserve an existing human review status.
  if (
    report.status === "Reviewed" ||
    report.status === "Action Required"
  ) {
    return report.status;
  }

  // Check whether Python successfully generated an AI summary.
  const reportName = report.title.trim().toLowerCase();

  const aiProcessed = analysisResults.some((result) => {
    if (result.summary_status !== "success") return false;

    const processedFileName = (result.fileName || "")
      .replace(/\.[^.]+$/, "")
      .trim()
      .toLowerCase();

    return processedFileName === reportName;
  });

  return aiProcessed ? "AI Processed" : "Pending Review";
};
  const fileInputRef = useRef(null);
  const dragDepth = useRef(0);
  const objectUrls = useRef(new Set());

  const createPreviewUrl = (blob) => {
    const url = URL.createObjectURL(blob);
    objectUrls.current.add(url);
    return url;
  };

  const fetchReports = async () => {
    const response = await fetch(API_BASE, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Reports load nahi hue (${response.status}).`);
    }

    const data = await response.json();
    setReports(Array.isArray(data) ? data.map(mapReport) : []);
  };

  useEffect(() => {
    fetchReports().catch((error) => setUploadError(error.message));
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current.clear();
    };
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = async (fileList) => {
  const files = Array.from(fileList ?? []);
  if (files.length === 0 || isUploading) return;

  const errors = [];
  const accepted = [];

  files.forEach((file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: only PDF, JPG or PNG files are supported.`);
    } else if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: file is larger than 10MB.`);
    } else {
      accepted.push(file);
    }
  });

  if (accepted.length === 0) {
    setUploadError(errors.join(" "));
    return;
  }

  setIsUploading(true);
  const newResults = [];
  const processingErrors = [];

  try {
    const headers = getAuthHeaders();

    for (const file of accepted) {
      // STEP A: Save the report using the Java backend.
      const body = new FormData();
      body.append("file", file);
      body.append("category", guessCategory(file.name));
      body.append("reportDate", todayISO());

      const saveResponse = await fetch(API_BASE, {
        method: "POST",
        headers,
        body,
      });

      if (!saveResponse.ok) {
        const message = await saveResponse.text();
        throw new Error(
          message || `${file.name} upload failed (${saveResponse.status}).`
        );
      }

      // STEP B: Process PDF reports using the Python AI backend.
      if (file.type === "application/pdf") {
        try {
          const aiBody = new FormData();
          aiBody.append("file", file);

          const aiResponse = await fetch(AI_API, {
            method: "POST",
            body: aiBody,
          });

          const aiData = await aiResponse.json().catch(() => ({}));

          if (!aiResponse.ok) {
            const detail = Array.isArray(aiData.detail)
              ? aiData.detail.map((item) => item.msg || String(item)).join(", ")
              : aiData.detail;

            processingErrors.push(
              `${file.name}: ${detail || `AI processing failed (${aiResponse.status}).`}`
            );
            continue;
          }

          newResults.push({
            id: `${Date.now()}-${file.name}`,
            fileName: file.name,
            ...aiData,
          });
        } catch (error) {
          processingErrors.push(
            `${file.name}: saved successfully, but AI processing failed. ${error.message}`
          );
        }
      } else {
        newResults.push({
          id: `${Date.now()}-${file.name}`,
          fileName: file.name,
          summary_status: "not_available",
          message: "Report saved successfully. AI processing is currently available for PDF reports only.",
        });
      }
    }

    // Refresh the report list from Java backend.
    await fetchReports();

    // Keep AI results in React state.
    setAnalysisResults((previous) => [...newResults, ...previous]);

    setUploadError([...errors, ...processingErrors].join(" "));
  } catch (error) {
    setUploadError(error.message || "Report upload nahi ho paya.");
  } finally {
    setIsUploading(false);
  }
};
  const handleView = async (report) => {
    try {
      const response = await fetch(`${API_BASE}/${report.id}/view`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Preview load nahi hua (${response.status}).`);
      }

      const blob = await response.blob();
      const fileUrl = createPreviewUrl(blob);
      setSelectedReport({ ...report, fileUrl });
    } catch (error) {
      setUploadError(error.message || "Report preview nahi ho paya.");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const visibleReports = useMemo(() => {
    const filtered =
      activeCategory === "All Reports"
        ? reports
        : reports.filter((report) => report.category === activeCategory);

    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title);
      if (sortBy === "oldest") return a.date.localeCompare(b.date);
      return b.date.localeCompare(a.date);
    });
  }, [reports, activeCategory, sortBy]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Navbar_main />
      </div>

      <main className="w-full px-6 sm:px-10 lg:px-20 pt-12 pb-16 flex flex-col gap-8">
        <div>
          <h1 className="font-serif text-5xl tracking-tight text-[#0B1A2E]">Medical Reports</h1>
          <p className="text-base text-slate-500 pt-3">
            Upload, organize and track your medical documents securely
          </p>
        </div>

        <div
          onDragEnter={(event) => {
            event.preventDefault();
            dragDepth.current += 1;
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => {
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center py-9 px-6 rounded-3xl border-2 border-dashed border-[#00C9A7] transition-colors ${
            isDragging ? "bg-[#00C9A7]/10" : "bg-white"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00C9A7]/10">
            <CloudUpload size={26} className="text-[#00C9A7]" />
          </div>
          <p className="mt-5 text-lg font-semibold text-[#0B1A2E]">Drag and drop your files here</p>
          <p className="mt-1 text-slate-500 font-serif">Support for PDF, JPG, PNG up to 10MB</p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = "";
            }}
          />

          <button
  type="button"
  disabled={isUploading}
  onClick={() => fileInputRef.current?.click()}
  className="mt-5 px-8 py-2.5 rounded-full bg-[#00C9A7] text-lg font-semibold text-[#0B1A2E] hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isUploading ? "Uploading and Processing..." : "Upload Medical Report"}
</button>

          {uploadError && (
            <p role="alert" className="mt-4 text-sm text-red-500 text-center">
              {uploadError}
            </p>
          )}
        </div>
        {analysisResults.length > 0 && (
  <section className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <h2 className="font-serif text-2xl text-[#0B1A2E]">
        AI Report Analysis
      </h2>

      <button
        type="button"
        onClick={() => setAnalysisResults([])}
        className="text-sm text-slate-500 hover:text-red-500"
      >
        Clear results
      </button>
    </div>

    {analysisResults.map((result) => {
      const summary =
        result.final_summary ||
        result.ai_summary ||
        result.fallback_summary;

      return (
        <article
          key={result.id}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-[#0B1A2E]">
              {result.fileName}
            </h3>

            <span className="rounded-full bg-[#00C9A7]/10 px-3 py-1 text-sm text-[#008F78]">
              {result.summary_status === "success"
                ? "AI Summary"
                : result.summary_status === "fallback"
                ? "Fallback Summary"
                : "Saved"}
            </span>
          </div>

          {summary ? (
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {String(summary).replace(/\*\*/g, "")}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              {result.message}
            </p>
          )}

          {result.extraction_metadata && (
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
              Pages: {result.extraction_metadata.total_pages}
              {" | "}
              Extracted characters: {result.extraction_metadata.total_characters}
              {" | "}
              Method: {result.extraction_metadata.methods?.join(", ")}
            </p>
          )}
        </article>
      );
    })}
  </section>
)}

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                    activeCategory === category
                      ? "bg-[#0B1A2E] border-[#0B1A2E] text-white font-medium"
                      : "bg-white border-slate-200 text-black/60 hover:border-slate-400 font-semibold"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-500 ">
              Sort by:
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="px-2 py-2 rounded-md border border-slate-200 bg-white text-sm font-medium text-[#0B1A2E] cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-4">
            {visibleReports.length > 0 ? (
              visibleReports.map((report) => (
                <ReportRow
  key={report.id}
  report={{
    ...report,
    status: getDisplayStatus(report),
  }}
  onView={handleView}
/>
              ))
            ) : (
              <p className="text-center text-slate-500 py-10">
                No {activeCategory === "All Reports" ? "" : `${activeCategory.toLowerCase()} `}
                reports yet. Upload one above to get started.
              </p>
            )}
          </div>
        </div>
      </main>

      {selectedReport && (
        <ReportViewer report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
};

export default MedicalReports;
