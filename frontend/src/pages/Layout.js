import React from "react";
import SideBar from "../components/reusable/Sidebar";

function Layout() {
  return (
    <div className="d-flex vh-100">
      <SideBar />
      <div className="container p-4 vh-100"> Content</div>
    </div>
  );
}

export default Layout;
