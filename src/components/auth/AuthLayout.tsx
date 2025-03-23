import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full bg-[rgba(255,255,255,0.8)] backdrop-blur-md border-b border-[#f5f5f7]/30">
        <div className="max-w-[980px] mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl text-green-600">
              JobSoko
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-7 text-sm font-light">
            <Link to="/" className="hover:text-green-600">
              Features
            </Link>
            <Link to="/" className="hover:text-green-600">
              Find Jobs
            </Link>
            <Link to="/" className="hover:text-green-600">
              Post a Job
            </Link>
            <Link to="/" className="hover:text-green-600">
              About Us
            </Link>
            <Link to="/" className="hover:text-green-600">
              Support
            </Link>
          </nav>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center pt-12">
        <div className="max-w-md w-full px-4">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🏗️</span>
              </div>
            </div>
            <h2 className="text-4xl font-semibold tracking-tight">JobSoko</h2>
            <p className="text-xl font-medium text-gray-500 mt-2">
              Connect with local job opportunities
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
