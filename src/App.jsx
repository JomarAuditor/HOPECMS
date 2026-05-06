import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import ProtectedRoute from "./components/ProtectedRoute"; // COMMENT THIS OUT
// import AppShell from "./components/AppShell"; // COMMENT THIS OUT
import Login from "./pages/Login";
// import Register from "./pages/Register"; // COMMENT THIS OUT

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Comment out these routes because the files are missing in this branch */}
        {/* <Route path="/register" element={<Register />} /> */}
        
        {/* Redirect everything else to Login for now */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;