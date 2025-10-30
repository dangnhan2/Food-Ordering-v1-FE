declare module "sonner" {
  import * as React from "react";

  export interface ToasterProps {
    position?:
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right"
      | "top-center"
      | "bottom-center";
    richColors?: boolean;
  }

  export const Toaster: React.FC<ToasterProps>;

  export interface ToastAPI {
    success: (message: string, options?: any) => void;
    error: (message: string, options?: any) => void;
    info: (message: string, options?: any) => void;
    warning: (message: string, options?: any) => void;
    message: (message: string, options?: any) => void;
  }

  export const toast: ToastAPI;
}


