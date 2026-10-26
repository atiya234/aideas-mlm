
import {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { apiFetch } from "../api/apiFetch";

export const KYCContext = createContext();

export function KYCProvider({ children }) {
  const [kycStatus, setKycStatus] = useState("Loading");
  const [kycLoading, setKycLoading] = useState(true);
  const [kycError, setKycError] = useState("");

  const fetchKycStatus = useCallback(async () => {
    const token = sessionStorage.getItem("access");

    if (!token) {
      setKycStatus("Not Submitted");
      setKycError("");
      setKycLoading(false);
      return;
    }

    try {
      setKycLoading(true);
      setKycError("");

      const response = await apiFetch("/api/kyc/status/");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch KYC status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.status === "approved") {
        setKycStatus("Verified");
      } else if (data.status === "pending") {
        setKycStatus("Pending Verification");
      } else if (data.status === "rejected") {
        setKycStatus("Rejected");
      } else {
        setKycStatus("Not Submitted");
      }
    } catch (error) {
      console.error("KYC status error:", error);
      setKycError(error.message);
      setKycStatus("Unavailable");
    } finally {
      setKycLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKycStatus();
  }, [fetchKycStatus]);

  return (
    <KYCContext.Provider
      value={{
        kycStatus,
        setKycStatus,
        kycLoading,
        kycError,
        fetchKycStatus,
      }}
    >
      {children}
    </KYCContext.Provider>
  );
}
