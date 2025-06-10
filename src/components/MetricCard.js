// src/components/MetricCard.js
import React from "react";

function MetricCard({ title, value, textColor = "#ffffff", bgColor = "#007bff" }) {
  return (
    <div
      className="card shadow-sm"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="card-body">
        <h6 className="card-title">{title}</h6>
        <h3 className="card-text">{value}</h3>
      </div>
    </div>
  );
}

export default MetricCard;
