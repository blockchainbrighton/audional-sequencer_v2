// src/components/TimelineController.js
import React from 'react';

function TimelineController({ zoomLevel, setZoomLevel }) {
  const zoomIn = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 1));
  };

  const zoomOut = () => {
    setZoomLevel(prev => prev * 1.2);
  };

  return (
    <div className="timeline-controller">
      <button onClick={zoomIn}>Zoom In</button>
      <button onClick={zoomOut}>Zoom Out</button>
    </div>
  );
}

export default TimelineController;