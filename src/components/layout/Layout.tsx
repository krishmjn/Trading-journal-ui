import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <footer className="py-4 text-center text-sm text-gray-500">
        © 2024 Trade Journal. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
