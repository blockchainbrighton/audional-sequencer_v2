// src/components/AudioLoader.js
import React, { useState } from 'react';

function AudioLoader({ setAudioBuffer, audioContext }) {
  const [url, setUrl] = useState('');

  const handleLoadAudio = async () => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setAudioBuffer(audioBuffer);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  return (
    <div className="audio-loader">
      <input
        type="text"
        placeholder="Enter audio URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={handleLoadAudio}>Load Audio</button>
    </div>
  );
}

export default AudioLoader;