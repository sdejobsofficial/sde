import {
  jobSeekerEmailRegister,
  jobSeekerEmailLogin,
  logout,
  recruiterEmailLogin,
  recruiterEmailRegister,
  resendVerificationEmail,
  handlePremiumUpgrade,
  exchangeCodeForSession,
  sendPasswordResetEmail,
  updatePassword,
} from "@/clients/authClient";
import {
  jobSeekerGoogleAuth,
  recruiterGoogleAuth,
} from "@/clients/googleAuthClient";
import {
  getCurrentUser,
  updateJobSeekerMeta,
  updateCompanyMeta,
  getCurrentSession,
} from "@/clients/userClient";
import {
  RegisterJobSeekerDTO,
  UpdateCompanyMetaDTO,
  UpdateJobSeekerMetaDTO,
} from "@/models/userModel";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const getAuthErrorMessage = (error: Error, fallback: string) => {
  const message = error.message.toLowerCase();

  if (
    (message.includes("already") && message.includes("registered")) ||
    message.includes("already exists") ||
    message.includes("already in use") ||
    message.includes("duplicate")
  ) {
    return "This email already exists. Please use a different email or sign in.";
  }

  if (
    message.includes("invalid login") ||
    message.includes("invalid_grant") ||
    message.includes("invalid credentials") ||
    message.includes("wrong password")
  ) {
    return "Invalid email or password.";
  }

  if (
    message.includes("weak password") ||
    message.includes("password should be") ||
    message.includes("password is too weak")
  ) {
    return "Please choose a stronger password.";
  }

  if (
    message.includes("email not confirmed") ||
    message.includes("confirm your email") ||
    message.includes("email_not_confirmed")
  ) {
    return "Please verify your email before signing in.";
  }

  if (
    message.includes("invalid email") ||
    message.includes("email format")
  ) {
    return "Please enter a valid email address.";
  }

  if (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("temporarily unavailable")
  ) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  return fallback;
};

export const useJobSeekerEmailRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterJobSeekerDTO) =>
      jobSeekerEmailRegister(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/onboarding");
      // toast.success("Please check your email to verify your account.");
      toast.success("Registration successful! Please complete your profile.");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error, "Registration failed. Please try again or use a different email."));
    },
  });
};

export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: (email: string) => resendVerificationEmail(email),
    onSuccess: () => {
      toast.success("Verification email resent! Please check your inbox.");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error, "Failed to resend. Please try again."));
    },
  });
};

export const useJobSeekerEmailLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      jobSeekerEmailLogin(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/jobs");
      toast.success("Login successful!");
    },
    onError: (error: Error) => {
      toast.error(
        getAuthErrorMessage(error, "Login failed. Please check your credentials."),
      );
    },
  });
};

export const useJobSeekerGoogleLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => jobSeekerGoogleAuth(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => getCurrentUser(),
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => logout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log out.");
    },
  });
};

export const useRecruiterEmailLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      recruiterEmailLogin(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/recruiter/dashboard");
      toast.success("Login successful!");
    },
    onError: (error: Error) => {
      toast.error(
        getAuthErrorMessage(error, "Login failed. Please check your credentials."),
      );
    },
  });
};

export const useRecruiterGoogleLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => recruiterGoogleAuth(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

export const useRecruiterEmailRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      email,
      password,
      phone,
      companyName,
    }: {
      email: string;
      password: string;
      phone: string;
      companyName: string;
    }) => recruiterEmailRegister(email, password, phone, companyName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/recruiter/onboarding");
      toast.success(
        "Registration successful! Please complete your company profile.",
      );
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error, "Registration failed. Please try again or use a different email."));
    },
  });
};

export const useUpdateJobSeekerMeta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meta: UpdateJobSeekerMetaDTO) => updateJobSeekerMeta(meta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile updated successfully!");
    },
  });
};

export const useUpdateCompanyMeta = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      meta,
      name,
      phone,
    }: {
      meta: UpdateCompanyMetaDTO;
      name: string;
      phone: number;
    }) => updateCompanyMeta(meta, name, phone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/recruiter/dashboard");
      toast.success("Profile updated successfully!");
    },
  });
};

export const useGetCurrentSession = () => {
  return useQuery({
    queryKey: ["currentSession"],
    queryFn: async () => getCurrentSession(),
  });
};

export const useHandlePremiumUpgrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, type }: { userId: string; type?: "tech" | "non-tech" }) => handlePremiumUpgrade(userId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Subscription upgraded successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upgrade subscription.");
    },
  });
};

export const useSendPasswordResetEmail = () => {
  return useMutation({
    mutationFn: (email: string) => sendPasswordResetEmail(email),
    onSuccess: () => {
      toast.success("Reset link sent! Please check your inbox.");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error, "Failed to send reset email. Try again."));
    },
  });
};

export const useUpdatePassword = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (newPassword: string) => updatePassword(newPassword),
    onSuccess: () => {
      toast.success("Password updated! Please sign in with your new password.");
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error, "Failed to update password. Try again."));
    },
  });
};

export const useExchangeCodeForSession = () => {
  return useMutation({
    mutationFn: (code: string) => exchangeCodeForSession(code),
    onError: (error: Error) => {
      toast.error(
        getAuthErrorMessage(error, "This reset link is invalid or has expired."),
      );
    },
  });
};
