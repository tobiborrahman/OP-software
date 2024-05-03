import toast from "react-hot-toast";

const handleApiErrors = (apiErrors: any) => {
  console.log("Server Error:", apiErrors); // For debugging purposes

  if (Array.isArray(apiErrors)) {
    apiErrors.forEach((error) => {
      if (typeof error === "string") {
        toast.error(error); // Display each string error message
      }
    });
  } else if (apiErrors && apiErrors.response && apiErrors.response.data) {
    const responseData = apiErrors.response.data;

    if (Array.isArray(responseData)) {
      responseData.forEach((error) => {
        if (typeof error === "string") {
          toast.error(error);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("An error occurred");
        }
      });
    } else if (typeof responseData === "string") {
      toast.error(responseData);
    } else if (responseData.message) {
      toast.error(responseData.message);
    } else {
      toast.error("An unexpected error occurred");
    }
  } else if (apiErrors && apiErrors.message) {
    toast.error(apiErrors.message);
  } else {
    toast.error("An unexpected error occurred");
  }

  return; // Added return statement to ensure the function returns by default
};

export default handleApiErrors;
