import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const token = sessionStorage.getItem("access");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;