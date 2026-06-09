import { useLocation } from "react-router";

export default function Footer () {
  const location = useLocation()

  const isHome = location.pathname === "/"

  return (
    <>
      {isHome && <h1>Footer Component</h1>}
    </>
  );
}