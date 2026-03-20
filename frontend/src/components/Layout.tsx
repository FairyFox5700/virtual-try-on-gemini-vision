import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;
