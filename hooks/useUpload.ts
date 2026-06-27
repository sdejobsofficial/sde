import { imageUpload, fileUpload } from "@/clients/uploadClient";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ─── useImageUpload ───────────────────────────────────────────────────────

export const useImageUpload = () => {
  return useMutation({
    mutationFn: ({ file, userId }: { file: File; userId: string }) =>
      imageUpload(file, userId),
    onError: (error) => {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    },
  });
};

// ─── useFileUpload ────────────────────────────────────────────────────────

export const useFileUpload = () => {
  return useMutation({
    mutationFn: ({ file, userId }: { file: File; userId: string }) =>
      fileUpload(file, userId),
    onError: (error) => {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    },
  });
};