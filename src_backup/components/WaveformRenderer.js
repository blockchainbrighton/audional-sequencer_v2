// src/components/WaveformRenderer.js
import React, { useEffect, useRef } from 'react';

function WaveformRenderer({ audioBuffer, zoomLevel }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (audioBuffer) {
      const canvas = canvasRef.current;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const context = canvas.getContext('2d');

      // Clear the canvas
      context.clearRect(0, 0, canvasWidth, canvasHeight);

      // Get audio data
      const rawData = audioBuffer.getChannelData(0); // Use first channel

      // Determine number of samples to process
      let samples = Math.floor(canvasWidth * zoomLevel);
      if (samples < 1) samples = 1;
      if (samples > rawData.length) samples = rawData.length;

      const blockSize = Math.floor(rawData.length / samples);
      if (blockSize < 1) {
        console.warn('Block size is less than 1. Adjusting to 1 to prevent errors.');
        blockSize = 1;
      }

      const filteredData = [];
      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      // Normalize data
      const maxVal = Math.max(...filteredData);
      const multiplier = maxVal ? canvasHeight / 2 / maxVal : 0;
      const normalizedData = filteredData.map(n => n * multiplier);

      // Draw the waveform
      context.fillStyle = '#2196f3';
      const middle = canvasHeight / 2;
      for (let i = 0; i < normalizedData.length; i++) {
        const x = (i / normalizedData.length) * canvasWidth;
        const height = normalizedData[i] || 0;
        context.fillRect(x, middle - height, 1, height * 2);
      }
    }
  }, [audioBuffer, zoomLevel]);

  return (
    <div className="waveform-container">
      <canvas ref={canvasRef} width={800} height={200} id="waveform-canvas"></canvas>
    </div>
  );
}

export default WaveformRenderer;