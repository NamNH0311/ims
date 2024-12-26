import { Typography } from "@mui/material";
import React from "react";

function JobBreadcrumb() {
  return (
    <div className="container-fluid">
      <div className="row p-2">
        <div className="col-auto p-0">
          <a
            href="/job"
            className="text-primary"
            style={{ fontWeight: "400" }}
          >
            Home
          </a>
        </div>
        <div className="col-auto">/</div>
        <div className="col-auto p-0">
          <Typography variant="body1" gutterBottom className="my-0">
            {"Job"}↔{"Job Management"}
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default JobBreadcrumb;
