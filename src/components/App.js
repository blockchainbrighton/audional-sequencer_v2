// src/components/App.js
import React, { useState, useRef } from 'react';
import AudioLoader from './AudioLoader';
import WaveformRenderer from './WaveformRenderer';
import TimelineController from './TimelineController';
import PlaybackControls from './PlaybackControls';
import './App.css';

function App() {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const sourceNodeRef = useRef(null);
  const isPlayingRef = useRef(false);

  return (
    <div className="App">
      <h1>Audio Arrangement Tool Prototype</h1>
      <AudioLoader setAudioBuffer={setAudioBuffer} audioContext={audioContextRef.current} />
      <TimelineController zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      <WaveformRenderer
        audioBuffer={audioBuffer}
        zoomLevel={zoomLevel}
        audioContext={audioContextRef.current}
        isPlayingRef={isPlayingRef}
      />
      <PlaybackControls
        audioBuffer={audioBuffer}
        audioContext={audioContextRef.current}
        sourceNodeRef={sourceNodeRef}
        isPlayingRef={isPlayingRef}
      />
    </div>
  );
}

export default App;