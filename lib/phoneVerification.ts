"use server";

import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
);

const SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID!;

export const sendPhoneOtp = async (phone: string) => {
  // phone should be in E.164 format e.g. +919876543210
  const verification = await client.verify.v2
    .services(SERVICE_SID)
    .verifications.create({ to: phone, channel: "sms" });

  if (verification.status !== "pending") {
    throw new Error("Failed to send OTP. Please try again.");
  }
  return { success: true };
};

export const verifyPhoneOtp = async (phone: string, code: string) => {
  const result = await client.verify.v2
    .services(SERVICE_SID)
    .verificationChecks.create({ to: phone, code });

  if (result.status !== "approved") {
    throw new Error("Invalid or expired OTP. Please try again.");
  }
  return { success: true };
};
