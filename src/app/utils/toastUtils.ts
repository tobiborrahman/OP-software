import { toast } from "react-hot-toast";

export const warningToast = (message: string): void => {
  toast(message, {
    icon: "⚠️",
    duration: 3000,
    style: {
      background: "#F57C00",
      color: "#FFFFFF",
      borderRadius: "8px",
    },
  });
};
