// ZoomController.js

/**
 * Simple Logger Utility with Controlled Logging Levels.
 * Levels: DEBUG < INFO < WARN < ERROR
 */
class Logger {
    constructor(level = 'INFO') {
        this.levels = { 'DEBUG': 1, 'INFO': 2, 'WARN': 3, 'ERROR': 4 };
        this.currentLevel = this.levels[level] || 2; // Default to INFO
    }

    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.currentLevel = this.levels[level];
            this.info(`Logger: Log level set to ${level}`);
        } else {
            this.error(`Logger: Invalid log level "${level}"`);
        }
    }

    debug(...args) {
        if (this.currentLevel <= this.levels['DEBUG']) {
            console.debug('[DEBUG]', ...args);
        }
    }

    info(...args) {
        if (this.currentLevel <= this.levels['INFO']) {
            console.info('[INFO]', ...args);
        }
    }

    warn(...args) {
        if (this.currentLevel <= this.levels['WARN']) {
            console.warn('[WARN]', ...args);
        }
    }

    error(...args) {
        if (this.currentLevel <= this.levels['ERROR']) {
            console.error('[ERROR]', ...args);
        }
    }
}

class ZoomController {
    /**
     * @param {Object} [options] - Optional configurations.
     * @param {string} [options.logLevel='INFO'] - Logging level: DEBUG, INFO, WARN, ERROR.
     */
    constructor(options = {}) {
        this.logger = new Logger(options.logLevel || 'INFO');
        this.logger.info('ZoomController: Initializing ZoomController instance.');

        this.waveformRenderer = null;
        this.zoomLevel = 1;
    }

    /**
     * Associates with a waveform renderer.
     * @param {WaveformRenderer} waveformRenderer - The waveform renderer instance.
     */
    initialize(waveformRenderer) {
        this.logger.debug('ZoomController: Initialize method called with waveformRenderer:', waveformRenderer);

        if (!waveformRenderer || typeof waveformRenderer !== 'object' || !waveformRenderer.canvas) {
            this.logger.error('ZoomController: Provided waveformRenderer is invalid or does not have a canvas property.', waveformRenderer);
            return;
        }

        this.waveformRenderer = waveformRenderer;
        this.logger.info('ZoomController: Associated with waveformRenderer.');
    }

    /**
     * Sets the zoom to a specific level.
     * @param {number} zoomLevel - The desired zoom level.
     */
    setZoomLevel(zoomLevel) {
        this.logger.debug(`ZoomController: setZoomLevel called with zoomLevel=${zoomLevel}.`);

        if (typeof zoomLevel !== 'number' || zoomLevel <= 0) {
            this.logger.warn(`ZoomController: Invalid zoomLevel (${zoomLevel}). Zoom level must be a positive number.`);
            return;
        }

        this.zoomLevel = zoomLevel;
        this.logger.info(`ZoomController: Zoom level set to ${this.zoomLevel}.`);
        this._applyZoom();
    }

    /**
     * Increases the zoom level.
     */
    zoomIn() {
        this.logger.debug('ZoomController: zoomIn method called.');
        const previousZoomLevel = this.zoomLevel;
        this.zoomLevel *= 1.2; // Increase by 20%
        this.logger.info(`ZoomController: Zoomed in from ${previousZoomLevel.toFixed(2)} to ${this.zoomLevel.toFixed(2)}.`);
        this._applyZoom();
    }

    /**
     * Decreases the zoom level.
     */
    zoomOut() {
        this.logger.debug('ZoomController: zoomOut method called.');
        const previousZoomLevel = this.zoomLevel;
        this.zoomLevel /= 1.2; // Decrease by 20%
        this.logger.info(`ZoomController: Zoomed out from ${previousZoomLevel.toFixed(2)} to ${this.zoomLevel.toFixed(2)}.`);
        this._applyZoom();
    }

    // Private method

    _applyZoom() {
        this.logger.debug('ZoomController: Applying zoom.');

        if (this.waveformRenderer && this.waveformRenderer.canvas) {
            const originalWidth = this.waveformRenderer.canvas.width;
            const newWidth = originalWidth * this.zoomLevel;
            this.waveformRenderer.canvas.style.width = `${newWidth}px`;
            this.logger.info(`ZoomController: Zoom applied. Canvas width set to ${newWidth}px (Zoom Level: ${this.zoomLevel.toFixed(2)}).`);
        } else {
            this.logger.warn('ZoomController: Cannot apply zoom because waveformRenderer or its canvas is not initialized.');
        }
    }
}

// Export the module
export default ZoomController;
