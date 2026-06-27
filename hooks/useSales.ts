import { validateReferralCode } from "@/clients/salesClient";
import { useMutation } from "@tanstack/react-query";

export const useValidateReferralCode = () =>
  useMutation({
    mutationFn: (code: string) => validateReferralCode(code),
  });
