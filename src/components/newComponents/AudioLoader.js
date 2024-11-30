// AudioLoader.js

class AudioLoader {
    constructor() {
        console.log('AudioLoader: Initializing AudioLoader instance.');
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioBuffer = null;
        this.waveformData = null;
        this.onLoadCallback = null;
        this.onErrorCallback = null;
    }

    /**
     * Initiates loading and decoding of the audio file.
     * @param {string|File} audioSource - URL string or File object.
     */
    load(audioSource) {
        console.log('AudioLoader: Load method called with source:', audioSource);
        if (typeof audioSource === 'string') {
            console.log('AudioLoader: Loading audio from URL.');
            this._loadFromURL(audioSource);
        } else if (audioSource instanceof File) {
            console.log('AudioLoader: Loading audio from File object.');
            this._loadFromFile(audioSource);
        } else {
            console.error('AudioLoader: Invalid audio source provided.', audioSource);
            this._triggerError('Invalid audio source provided.');
        }
    }

    /**
     * Registers a callback for when loading is complete.
     * @param {Function} callback - Function to call on load completion.
     */
    onLoad(callback) {
        console.log('AudioLoader: onLoad callback registered.');
        this.onLoadCallback = callback;
    }

    /**
     * Registers a callback for handling errors.
     * @param {Function} callback - Function to call on error.
     */
    onError(callback) {
        console.log('AudioLoader: onError callback registered.');
        this.onErrorCallback = callback;
    }

    /**
     * Returns the decoded waveform data.
     * @returns {Float32Array} - Waveform data array.
     */
    getWaveformData() {
        return this.waveformData;
    }

    /**
     * Returns the decoded audio buffer.
     * @returns {AudioBuffer} - Decoded audio buffer.
     */
    getAudioBuffer() {
        return this.audioBuffer;
    }

    // Private methods

    _loadFromURL(url) {
        console.log(`AudioLoader: Fetching audio data from URL: ${url}`);
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                console.log('AudioLoader: Audio data fetched successfully.');
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                console.log('AudioLoader: Decoding audio data from URL.');
                this._decodeAudioData(arrayBuffer);
            })
            .catch(error => {
                console.error('AudioLoader: Error loading audio from URL:', error);
                this._triggerError(error);
            });
    }

    _loadFromFile(file) {
        console.log('AudioLoader: Reading audio data from File object.');
        const reader = new FileReader();
        reader.onload = (event) => {
            console.log('AudioLoader: FileReader successfully read the file.');
            this._decodeAudioData(event.target.result);
        };
        reader.onerror = (error) => {
            console.error('AudioLoader: FileReader encountered an error:', error);
            this._triggerError(error);
        };
        reader.readAsArrayBuffer(file);
    }

    _decodeAudioData(arrayBuffer) {
        console.log('AudioLoader: Decoding audio data.');
        this.audioContext.decodeAudioData(arrayBuffer)
            .then(audioBuffer => {
                console.log('AudioLoader: Audio data decoded successfully.');
                this.audioBuffer = audioBuffer;
                this._extractWaveformData();
                if (this.onLoadCallback) {
                    console.log('AudioLoader: Invoking onLoad callback.');
                    this.onLoadCallback();
                }
            })
            .catch(error => {
                console.error('AudioLoader: Error decoding audio data:', error);
                this._triggerError(error);
            });
    }

    _extractWaveformData() {
        console.log('AudioLoader: Extracting waveform data.');
        const rawData = this.audioBuffer.getChannelData(0); // Use the first channel
        const samples = 1000; // Number of samples to extract
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];

        for (let i = 0; i < samples; i++) {
            let blockStart = blockSize * i;
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(rawData[blockStart + j]);
            }
            filteredData.push(sum / blockSize);
        }

        this.waveformData = new Float32Array(filteredData);
        console.log('AudioLoader: Waveform data extraction complete.');
    }

    _triggerError(error) {
        if (this.onErrorCallback) {
            console.error('AudioLoader: Invoking onError callback with error:', error);
            this.onErrorCallback(error);
        } else {
            console.error('AudioLoader:', error);
        }
    }
}

// Export the module
export default AudioLoader;
