import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

// Helper to read cookie value
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

// Helper to write cookie value
function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/`;
}

export const useReferralTracker = () => {
  const [visitorId, setVisitorId] = useState<string>("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountActive, setDiscountActive] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Initialize visitorId and check existing cookie
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Resolve visitor identity
    let cachedId = localStorage.getItem("refernest_visitor_id");
    if (!cachedId) {
      cachedId = crypto.randomUUID();
      localStorage.setItem("refernest_visitor_id", cachedId);
    }
    setVisitorId(cachedId);

    // 2. Check for active cookie
    const activeCookie = getCookie("refernest_ref");
    if (activeCookie) {
      setAppliedCode(activeCookie);
      setDiscountActive(true);
    }
  }, []);

  // Validate a code against the API
  const validateCode = useCallback(
    async (codeToValidate: string): Promise<{ isOk: boolean; name?: string; type?: string } | null> => {
      try {
        const res = await fetch("/api/referral/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: codeToValidate }),
        });

        const result = await res.json();
        if (result.isOk && result.data) {
          return {
            isOk: true,
            name: result.data.name,
            type: result.data.type,
          };
        }
        return null;
      } catch (error) {
        console.error("Referral validation failed:", error);
        return null;
      }
    },
    []
  );

  // Track visit event (specifically for sales analytics)
  const trackVisit = useCallback(
    async (codeToTrack: string, currentVisitorId: string) => {
      try {
        await fetch("/api/referral/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: codeToTrack,
            visitorId: currentVisitorId,
            referrerUrl: document.referrer,
          }),
        });
      } catch (error) {
        console.error("Failed to track visitor click:", error);
      }
    },
    []
  );

  // Parse URL search parameters on load
  useEffect(() => {
    if (!visitorId || typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");

    if (refParam) {
      const code = refParam.toUpperCase().trim();
      const activeCookie = getCookie("refernest_ref");

      // Only hit validation if there is a new code in the URL differing from our stored cookie
      if (code !== activeCookie) {
        Promise.resolve().then(() => {
          setIsValidating(true);
          validateCode(code)
            .then((details) => {
              if (details) {
                // Valid: Log visit clicks, set cookie for 30 days, update price state
                trackVisit(code, visitorId);
                setCookie("refernest_ref", code, 30);
                setAppliedCode(code);
                setDiscountActive(true);
                toast.success(`Referral applied: ${details.name}`);
              } else {
                // Invalid URL param: Keep existing cookie if any, otherwise standard pricing
                console.warn(`Invalid referral code in URL parameter: ${code}`);
              }
            })
            .finally(() => setIsValidating(false));
        });
      }
    }
  }, [visitorId, validateCode, trackVisit]);

  // Manually input a referral code from the UI
  const applyManualCode = useCallback(
    async (code: string): Promise<boolean> => {
      if (!code || !visitorId) return false;
      const normalizedCode = code.toUpperCase().trim();

      setIsValidating(true);
      const details = await validateCode(normalizedCode);
      setIsValidating(false);

      if (details) {
        // Track visit, save cookie, and apply price discount
        await trackVisit(normalizedCode, visitorId);
        setCookie("refernest_ref", normalizedCode, 30);
        setAppliedCode(normalizedCode);
        setDiscountActive(true);
        toast.success(`Referral applied: ${details.name}`);
        return true;
      } else {
        toast.error("Invalid referral code");
        return false;
      }
    },
    [visitorId, validateCode, trackVisit]
  );

  // Clear cookie and discount state
  const clearReferral = useCallback(() => {
    if (typeof document === "undefined") return;
    document.cookie = "refernest_ref=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setAppliedCode(null);
    setDiscountActive(false);
    toast.success("Referral discount removed");
  }, []);

  return {
    visitorId,
    appliedCode,
    discountActive,
    isValidating,
    applyManualCode,
    clearReferral,
  };
};
