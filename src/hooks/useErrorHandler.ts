import { notifications } from "@mantine/notifications";
import { useCallback } from "react";

export type ErrorType = "validation" | "network" | "storage" | "general";

interface ErrorHandlerOptions {
  showNotification?: boolean;
  logToConsole?: boolean;
}

export function useErrorHandler() {
  const handleError = useCallback(
    (
      error: unknown,
      type: ErrorType = "general",
      options: ErrorHandlerOptions = {},
    ) => {
      const { showNotification = true, logToConsole = true } = options;

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (logToConsole) {
        console.error(`[${type.toUpperCase()}]`, error);
      }

      if (showNotification) {
        const titles: Record<ErrorType, string> = {
          validation: "Validation Error",
          network: "Network Error",
          storage: "Storage Error",
          general: "Error",
        };

        const messages: Record<ErrorType, string> = {
          validation: "Please check your input and try again.",
          network: "Please check your connection and try again.",
          storage: "There was a problem saving your data.",
          general: "An unexpected error occurred.",
        };

        notifications.show({
          title: titles[type],
          message: errorMessage || messages[type],
          color: "red",
          autoClose: 5000,
        });
      }
    },
    [],
  );

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      type: ErrorType = "general",
      options: ErrorHandlerOptions = {},
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error, type, options);
        return null;
      }
    },
    [handleError],
  );

  return {
    handleError,
    handleAsyncError,
  };
}
