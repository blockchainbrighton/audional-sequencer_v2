// src/components/PlaybackControls.js
import React from 'react';

function PlaybackControls({ audioBuffer, audioContext, sourceNodeRef, isPlayingRef }) {
  const playAudio = () => {
    if (audioBuffer && !isPlayingRef.current) {
      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(audioContext.destination);
      sourceNode.start();
      sourceNode.onended = () => {
        isPlayingRef.current = false;
      };
      sourceNodeRef.current = sourceNode;
      isPlayingRef.current = true;
    }
  };

  const stopAudio = () => {
    if (isPlayingRef.current && sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      isPlayingRef.current = false;
    }
  };

  return (
    <div className="playback-controls">
      <button onClick={playAudio}>Play</button>
      <button onClick={stopAudio}>Stop</button>
    </div>
  );
}

export default PlaybackControls;