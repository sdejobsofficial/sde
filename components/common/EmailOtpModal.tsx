"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, MessageSquare, X } from "lucide-react";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/emailVerification";

interface EmailOtpModalProps {
  email: string;
  onVerified: () => void;
  onClose: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 30;

export default function EmailOtpModal({
  email,
  onVerified,
  onClose,
}: EmailOtpModalProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [sent, setSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasSentRef = useRef(false);

  const handleSendOtp = async () => {
    setSending(true);
    setError("");
    try {
      await sendEmailOtp(email);
      setSent(true);
      setCountdown(RESEND_COUNTDOWN);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send OTP.");
    } finally {
      setSending(false);
    }
  };

  // Auto-send once on mount — ref guard prevents double-fire in React Strict Mode
  useEffect(() => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;
    // Defer to next microtask so the effect body itself is synchronous
    void Promise.resolve().then(() => handleSendOtp());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!sent || countdown === 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [sent, countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length === OTP_LENGTH && index === 0) {
      const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
      setOtp(digits);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      return;
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }
    setVerifying(true);
    setError("");
    try {
      await verifyEmailOtp(email, code);
      setVerified(true);
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>

        {verified ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="text-green-500" size={36} />
            </div>
            <p className="font-bold text-foreground text-lg">Verified!</p>
            <p className="text-sm text-muted-foreground text-center">
              Your email has been verified successfully.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <MessageSquare className="text-primary" size={22} />
              </div>
              <h3 className="text-xl font-extrabold text-foreground tracking-tight">
                Verify your email
              </h3>
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                {sending
                  ? "Sending OTP…"
                  : `We sent a 6-digit code to ${email}`}
              </p>
            </div>

            <div className="flex gap-2 justify-center mb-2">
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={i === 0 ? OTP_LENGTH : 1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={cn(
                    "w-11 h-13 text-center text-lg font-bold rounded-xl border-border bg-muted/50 focus:bg-card focus:border-primary/60 transition-all p-0",
                    error && "border-red-400",
                    digit && "border-primary/50 bg-primary/5",
                  )}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center font-medium mb-2">
                {error}
              </p>
            )}

            <Button
              type="button"
              onClick={handleVerify}
              disabled={verifying || otp.join("").length < OTP_LENGTH}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm mt-3 shadow-lg shadow-primary/20"
            >
              {verifying ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Verifying…
                </span>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="mt-4 text-center">
              {countdown > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Resend OTP in{" "}
                  <span className="text-primary font-bold">{countdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sending}
                  className="text-xs text-primary font-bold hover:underline disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Resend OTP"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
