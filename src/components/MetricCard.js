// src/components/MetricCard.js
import React from "react";

function MetricCard({ title, value, percentage, bgColor = "#ffffff", textColor = "#000000" }) {
  return (
    <div
      className="card shadow-sm"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="card-body">
        <h6 className="card-title">{title}</h6>
        <h3 className="card-text mb-1">{value}</h3>
        {percentage !== undefined && (
          <p className="card-subtitle" style={{ fontSize: "0.9rem" }}>
            {percentage.toFixed(1)}%
          </p>
        )}
      </div>
    </div>
  );
}


export default MetricCard;
