"use server";

import twilio from "twilio";

const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
};

const SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

export const sendEmailOtp = async (email: string) => {
  const client = getTwilioClient();
  if (!client || !SERVICE_SID) {
    console.warn("Twilio credentials not found. Using mock email OTP (code: 123456).");
    return { success: true };
  }

  try {
    const verification = await client.verify.v2
      .services(SERVICE_SID)
      .verifications.create({ to: email, channel: "email" });

    if (verification.status !== "pending") {
      throw new Error("Failed to send OTP. Please try again.");
    }
    return { success: true };
  } catch (error: any) {
    console.error("Twilio sendEmailOtp error:", error);
    throw new Error(error.message || "Failed to send OTP through Twilio.");
  }
};

export const verifyEmailOtp = async (email: string, code: string) => {
  const client = getTwilioClient();
  if (!client || !SERVICE_SID) {
    if (code === "123456") return { success: true };
    throw new Error("Invalid or expired OTP. Please try again.");
  }

  const result = await client.verify.v2
    .services(SERVICE_SID)
    .verificationChecks.create({ to: email, code });

  if (result.status !== "approved") {
    throw new Error("Invalid or expired OTP. Please try again.");
  }
  return { success: true };
};
