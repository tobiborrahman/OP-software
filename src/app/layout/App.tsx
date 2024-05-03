import { useEffect } from "react";
import Header from "./Header";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/configureStore";
import { fetchCurrentUser } from "../../features/UserAccount/accountSlice";
import { Toaster } from "react-hot-toast";
import LoadingComponent from "./LoadingComponent";

const App = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const publicPaths = ['/login', '/reset-password', '/not-found'];
    const path = window.location.pathname;

    if (publicPaths.includes(path)) {
      return; // Skip fetching user for public paths
    }

    dispatch(fetchCurrentUser())
      .unwrap()
      .catch((error) => {
        console.error("Error fetching current user:", error);
        navigate("/login");
      });
  }, [dispatch, navigate]);

  const toastOptions = {
    success: {
      style: {
        background: "#4CAF50",
        color: "#FFFFFF",
        borderRadius: "8px",
      },
    },
    error: {
      style: {
        background: "#FF5252",
        color: "#FFFFFF",
        borderRadius: "8px",
      },
    },
    duration: 3000,
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={toastOptions} />
      <Header />
      <Outlet />
      <LoadingComponent />
    </>
  );
};

export default App;
