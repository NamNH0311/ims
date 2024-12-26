import { Typography } from "@mui/material";
import React from "react";

function CandidateBreadCrumb() {
  return (
    <div className="container-fluid">
      <div className="row p-2">
        <div className="col-auto p-0">
          <a
            href="/home"
            className="text-primary"
            style={{ fontWeight: "400" }}
          >
            Home
          </a>
        </div>
        <div className="col-auto">/</div>
        <div className="col-auto p-0">
          <Typography variant="body1" gutterBottom className="my-0">
            {"Candidate"}↔{"Candidate Management"}
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default CandidateBreadCrumb;
