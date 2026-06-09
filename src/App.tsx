import { DocumentProvider } from "./context/DocumentContext";
import NavBar from "./components/layouts/NavBar";
import { Outlet, useLocation } from "react-router";
import Footer from "./components/layouts/Footer";

export default function App () {
  const location = useLocation()
  const isHome = location.pathname === "/"
  return (
    <DocumentProvider>
      <NavBar isHome={isHome} />
      <Outlet />
      {isHome && <Footer />}
    </DocumentProvider>
  );
}