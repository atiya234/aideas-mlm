
import React, { useState, useContext, useEffect } from "react";
import { KYCContext } from "../Context/KYCContext";
import { FaIdCard } from "react-icons/fa";
import { apiFetch } from "../api/apiFetch";

function KYC() {
  const [panNumber, setPanNumber] = useState("");
  const [panDocument, setPanDocument] = useState(null);
  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const {
    kycStatus,
    kycLoading,
    kycError,
    fetchKycStatus,
  } = useContext(KYCContext);

  // Create document preview
  useEffect(() => {
    if (!panDocument) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(panDocument);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [panDocument]);

  // PAN validation
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  const isPanValid = panRegex.test(panNumber);

  // File validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setPanDocument(null);
      setFileError("");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFileError(
        "Only PDF, JPG, JPEG and PNG files are allowed."
      );
      setPanDocument(null);
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size must not exceed 5 MB.");
      setPanDocument(null);
      e.target.value = "";
      return;
    }

    setPanDocument(file);
    setFileError("");
  };

  // Submit KYC to Django
  const submitDocument = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (
      kycLoading ||
      loading ||
      kycError ||
      kycStatus !== "Not Submitted"
    ) {
      return;
    }

    if (!isPanValid || !panDocument) {
      setSubmitError(
        "Please enter a valid PAN and select a document."
      );
      return;
    }

    const token = sessionStorage.getItem("access");

    if (!token) {
      setSubmitError("Please log in first.");
      return;
    }

    const formData = new FormData();
    formData.append("pan_number", panNumber);
    formData.append("document", panDocument);

    try {
      setLoading(true);

      const response = await apiFetch("/api/kyc/submit/", {
        method: "POST",
        body: formData,
      });

      const contentType =
        response.headers.get("content-type") || "";

      const data = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.detail ||
            (data ? JSON.stringify(data) : null) ||
            `KYC submission failed: ${response.status}`
        );
      }

      // Refresh actual status from Django
      await fetchKycStatus();

      setPanNumber("");
      setPanDocument(null);

      const fileInput = document.getElementById("panDocument");
      if (fileInput) {
        fileInput.value = "";
      }

      alert("KYC submitted successfully!");
    } catch (error) {
      console.error("KYC submission error:", error);
      setSubmitError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isSubmissionDisabled =
    loading ||
    kycLoading ||
    !!kycError ||
    !isPanValid ||
    !panDocument ||
    kycStatus !== "Not Submitted";

  const statusColor =
    kycStatus === "Verified"
      ? "bg-green-100 text-green-700"
      : kycStatus === "Pending Verification"
      ? "bg-yellow-100 text-yellow-700"
      : kycStatus === "Rejected"
      ? "bg-red-100 text-red-700"
      : "bg-slate-200 text-slate-700";

  return (
    <main className="min-h-screen bg-[#eef2ff] p-4 md:p-8">

      {/* PAGE HEADING */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
          KYC Verification
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Submit your identity details for verification.
        </p>
      </div>

      {/* KYC CARD */}
      <section className="mx-auto max-w-3xl rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="rounded-xl bg-indigo-100 p-4">
            <FaIdCard className="text-2xl text-indigo-600" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Identity Verification
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Enter your PAN details for verification.
            </p>
          </div>
        </div>

        {/* STATUS */}
        <div className="mt-8 flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">
            Verification Status
          </p>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
          >
            {kycLoading ? "Loading..." : kycStatus}
          </span>
        </div>

        {kycError && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            <p>{kycError}</p>

            <button
              type="button"
              onClick={fetchKycStatus}
              className="mt-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {kycStatus === "Verified" && (
          <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            Your KYC has been approved by the admin.
          </p>
        )}

        {kycStatus === "Pending Verification" && (
          <p className="mt-4 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
            Your KYC documents have been submitted and
            are awaiting admin verification.
          </p>
        )}

        {kycStatus === "Rejected" && (
          <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Your KYC was rejected. Please contact support
            for further instructions.
          </p>
        )}

        {/* PAN NUMBER */}
        <div className="mt-8">
          <label
            htmlFor="panNumber"
            className="mb-3 block text-sm font-semibold text-slate-700"
          >
            PAN Number
          </label>

          <input
            id="panNumber"
            type="text"
            placeholder="ABCDE1234F"
            value={panNumber}
            onChange={(e) =>
              setPanNumber(e.target.value.toUpperCase())
            }
            maxLength={10}
            autoComplete="off"
            disabled={
              loading ||
              kycLoading ||
              kycStatus !== "Not Submitted"
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium uppercase tracking-wider text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          />

          {panNumber.length > 0 && (
            <p
              className={`mt-3 text-sm font-medium ${
                isPanValid
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {isPanValid
                ? "Valid PAN format"
                : "PAN must contain 5 letters, 4 numbers and 1 letter"}
            </p>
          )}

          <p className="mt-3 text-xs text-slate-400">
            Example: ABCDE1234F
          </p>
        </div>

        {/* DOCUMENT UPLOAD */}
        <div className="mt-6">
          <label
            htmlFor="panDocument"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Upload PAN Document
          </label>

          <input
            id="panDocument"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={
              loading ||
              kycLoading ||
              kycStatus !== "Not Submitted"
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          />

          {fileError && (
            <p className="mt-2 text-sm text-red-500">
              {fileError}
            </p>
          )}

          {/* DOCUMENT PREVIEW */}
          {panDocument && previewUrl && (
            <div className="mt-4">
              <p className="mb-3 text-sm font-medium text-green-600">
                Selected File: {panDocument.name}
              </p>

              {panDocument.type === "application/pdf" ? (
                <iframe
                  src={previewUrl}
                  title="PAN Document Preview"
                  className="h-80 w-full rounded-xl border border-slate-200"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="PAN Document Preview"
                  className="max-h-80 w-full rounded-xl border border-slate-200 object-contain"
                />
              )}
            </div>
          )}
        </div>

        {/* SUBMISSION ERROR */}
        {submitError && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {submitError}
          </p>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="button"
          onClick={submitDocument}
          disabled={isSubmissionDisabled}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {loading
            ? "Submitting..."
            : kycLoading
            ? "Checking KYC Status..."
            : kycStatus === "Pending Verification"
            ? "Pending Verification"
            : kycStatus === "Verified"
            ? "KYC Verified"
            : kycStatus === "Rejected"
            ? "KYC Rejected"
            : "Submit for Verification"}
        </button>

      </section>
    </main>
  );
}

export default KYC;
