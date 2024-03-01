import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import EditorPage from "./components/EditorPage";
import { Toaster } from "react-hot-toast";
function App() {
  // we can constomize our toaster
  const createToast = {
    success: {
      theme: {
        primary: "#09fcf6",
      },
    },
  };
  return (
    <>
      <div>
        <Toaster position="top-center" toastOptions={createToast}></Toaster>
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:roomId" element={<EditorPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
