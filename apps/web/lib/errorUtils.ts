export interface FormattedApiError {
  title: string;
  message: string;
  status?: number | string;
}

/**
 * Translates technical API/network error objects into clean, human-readable UI messages.
 * In non-production environments, logs full technical error details to the browser console.
 */
export function formatApiError(error: any, context?: "login" | "register" | "action"): FormattedApiError {
  if (process.env.NODE_ENV !== "production") {
    console.error("[API Technical Error]:", error);
  }

  if (!error) {
    return {
      title: "Unexpected error",
      message: "An unknown error occurred. Please try again.",
    };
  }

  const status = error.status;
  const rawData = error.data;
  const rawMessage =
    typeof rawData === "object" && rawData?.message
      ? String(rawData.message)
      : typeof rawData === "string"
      ? rawData
      : error.message
      ? String(error.message)
      : "";

  // 1. Network / Server Unreachable Errors
  if (
    status === "FETCH_ERROR" ||
    status === "PARSING_ERROR" ||
    status === 503 ||
    status === 504 ||
    rawMessage.includes("Failed to fetch") ||
    rawMessage.includes("NetworkError") ||
    rawMessage.includes("ECONNREFUSED")
  ) {
    return {
      title: "Connection problem",
      message: "We couldn't connect to the server. Please check your internet connection and try again.",
      status: "FETCH_ERROR",
    };
  }

  // 2. Authentication Errors (401)
  if (
    status === 401 ||
    rawMessage.toLowerCase().includes("unauthorized") ||
    rawMessage.toLowerCase().includes("no token") ||
    rawMessage.toLowerCase().includes("token expired") ||
    rawMessage.toLowerCase().includes("invalid token")
  ) {
    if (context === "login") {
      return {
        title: "Unable to sign in",
        message: "The email or password you entered is incorrect. Please check your details and try again.",
        status: 401,
      };
    }
    return {
      title: "Session expired",
      message: "Your session has expired. Please sign in again to continue.",
      status: 401,
    };
  }

  // 3. Permission / Forbidden Errors (403)
  if (
    status === 403 ||
    rawMessage.toLowerCase().includes("forbidden") ||
    rawMessage.toLowerCase().includes("permission")
  ) {
    return {
      title: "Access restricted",
      message: "You don't have permission to access this section.",
      status: 403,
    };
  }

  // 4. Not Found Errors (404)
  if (status === 404) {
    return {
      title: "Not found",
      message: "The page or item you're looking for doesn't exist or may have been moved.",
      status: 404,
    };
  }

  // 5. Conflict (409)
  if (
    status === 409 ||
    rawMessage.toLowerCase().includes("already in use") ||
    rawMessage.toLowerCase().includes("already exists")
  ) {
    return {
      title: context === "register" ? "Account already exists" : "Conflict",
      message: rawMessage.toLowerCase().includes("email")
        ? "An account with this email address already exists. Please sign in instead."
        : "This record already exists in the system.",
      status: 409,
    };
  }

  // 6. Server Errors (500)
  if (status === 500) {
    return {
      title: "Service temporarily unavailable",
      message: "Our servers encountered an issue processing your request. Please try again in a few moments.",
      status: 500,
    };
  }

  // 7. Generic user-safe validation error message fallback
  if (
    rawMessage &&
    !rawMessage.includes("{") &&
    !rawMessage.includes("Error:") &&
    !rawMessage.includes("at ") &&
    !rawMessage.includes("JWT") &&
    !rawMessage.includes("AxiosError")
  ) {
    return {
      title: "Request could not be processed",
      message: rawMessage,
      status,
    };
  }

  return {
    title: "Something went wrong",
    message: "We couldn't complete your request. Please try again.",
    status,
  };
}
