import React from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";

type Props = {
    children: React.ReactNode;
};

export default function RootLayout({children}: Props) {
    // console.log(session);
  return (
    <div className="flex">
      <div className="hidden md:inline-flex">
        <Sidebar />
      </div>
      {/* Notifications */}
      <Toaster />
      {children}
    </div>
  );
}
