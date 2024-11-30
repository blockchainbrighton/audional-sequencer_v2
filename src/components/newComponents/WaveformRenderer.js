// WaveformRenderer.js

class WaveformRenderer {
    constructor() {
        console.log('WaveformRenderer: Initializing WaveformRenderer instance.');
        this.canvas = null;
        this.context = null;
        this.options = {};
    }

    /**
     * Initializes the renderer with a container element and options.
     * @param {HTMLElement} containerElement - The HTML element to render the waveform in.
     * @param {Object} options - Rendering options (e.g., colors).
     */
    initialize(containerElement, options = {}) {
        console.log('WaveformRenderer: Initializing with container:', containerElement, 'and options:', options);
        this.options = {
            waveColor: options.waveColor || '#00AAFF',
            backgroundColor: options.backgroundColor || '#FFFFFF',
            ...options,
        };

        // Create and append canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = containerElement.clientWidth;
        this.canvas.height = containerElement.clientHeight;
        containerElement.appendChild(this.canvas);
        console.log('WaveformRenderer: Canvas element created and appended to container.');

        // Get drawing context
        this.context = this.canvas.getContext('2d');
        console.log('WaveformRenderer: Canvas 2D context obtained.');

        // Set background color
        this.context.fillStyle = this.options.backgroundColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('WaveformRenderer: Background color set to', this.options.backgroundColor);
    }

    /**
     * Renders the waveform using the provided data.
     * @param {Float32Array} waveformData - Array of waveform data points.
     */
    render(waveformData) {
        console.log('WaveformRenderer: Starting render with waveformData length:', waveformData.length);
        const { width, height } = this.canvas;
        const { waveColor } = this.options;

        // Clear canvas
        this.context.clearRect(0, 0, width, height);
        console.log('WaveformRenderer: Canvas cleared.');

        // Draw waveform
        this.context.fillStyle = waveColor;
        const step = Math.ceil(waveformData.length / width);
        const amp = height / 2;

        for (let i = 0; i < width; i++) {
            const dataIndex = i * step;
            const min = waveformData[dataIndex] * amp;
            const max = waveformData[dataIndex + 1] * amp;
            this.context.fillRect(i, (amp - min), 1, Math.max(1, max - min));
        }

        console.log('WaveformRenderer: Waveform rendered successfully.');
    }

    /**
     * Updates rendering options dynamically.
     * @param {Object} newOptions - New rendering options.
     */
    updateOptions(newOptions) {
        console.log('WaveformRenderer: Updating options with:', newOptions);
        this.options = { ...this.options, ...newOptions };
        // Optionally, you might want to re-render or update the canvas here
    }

    /**
     * Cleans up and releases resources.
     */
    destroy() {
        console.log('WaveformRenderer: Destroying renderer and cleaning up resources.');
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            console.log('WaveformRenderer: Canvas element removed from DOM.');
        }
        this.canvas = null;
        this.context = null;
    }
}

// Export the module for use in other scripts
export default WaveformRenderer;
