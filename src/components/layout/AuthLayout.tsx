
interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">{children}</main>
      <footer className="py-4 text-center text-sm text-gray-500">
        © 2024 Trade Journal. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
