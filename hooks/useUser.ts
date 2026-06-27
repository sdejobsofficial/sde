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

export const useJobSeekerEmailRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterJobSeekerDTO) =>
      jobSeekerEmailRegister(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      // router.push(`/verify?email=${encodeURIComponent(payload.Email)}`);
      router.push("/onboarding");
      // toast.success("Please check your email to verify your account.");
      toast.success("Registration successful! Please complete your profile.");
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
      toast.error(error.message || "Failed to resend. Please try again.");
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
        error.message || "Login failed. Please check your credentials.",
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
        error.message || "Login failed. Please check your credentials.",
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
    mutationFn: (userId: string) => handlePremiumUpgrade(userId),
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
      toast.error(error.message || "Failed to send reset email. Try again.");
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
      toast.error(error.message || "Failed to update password. Try again.");
    },
  });
};

export const useExchangeCodeForSession = () => {
  return useMutation({
    mutationFn: (code: string) => exchangeCodeForSession(code),
    onError: (error: Error) => {
      toast.error(
        error.message || "This reset link is invalid or has expired.",
      );
    },
  });
};
