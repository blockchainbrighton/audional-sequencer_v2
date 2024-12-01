// PlaybackIndicator.js

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

class PlaybackIndicator {
    /**
     * @param {Object} [options] - Optional configurations.
     * @param {string} [options.logLevel='INFO'] - Logging level: DEBUG, INFO, WARN, ERROR.
     */
    constructor(options = {}) {
        this.logger = new Logger(options.logLevel || 'INFO');
        this.logger.info('PlaybackIndicator: Initializing PlaybackIndicator instance.');

        this.container = null;
        this.cursor = null;
        this.totalDuration = 0;
        this.containerWidth = 0;
    }

    /**
     * Initializes the indicator.
     * @param {HTMLElement} containerElement - The waveform container element.
     */
    initialize(containerElement) {
        this.logger.debug('PlaybackIndicator: Initialize method called with containerElement:', containerElement);
        
        if (!(containerElement instanceof HTMLElement)) {
            this.logger.error('PlaybackIndicator: Provided containerElement is not a valid HTMLElement.', containerElement);
            return;
        }

        this.container = containerElement;
        this.containerWidth = containerElement.clientWidth;

        // Create cursor element
        this.cursor = document.createElement('div');
        this.cursor.style.position = 'absolute';
        this.cursor.style.top = '0';
        this.cursor.style.bottom = '0';
        this.cursor.style.width = '2px';
        this.cursor.style.backgroundColor = 'red';
        this.cursor.style.pointerEvents = 'none';
        this.container.appendChild(this.cursor);

        this.logger.info('PlaybackIndicator: Cursor element created and appended to container.');
    }

    /**
     * Sets the total duration of the audio.
     * @param {number} duration - Total duration in seconds.
     */
    setTotalDuration(duration) {
        this.logger.debug(`PlaybackIndicator: Setting totalDuration to ${duration}s.`);
        if (typeof duration !== 'number' || duration <= 0) {
            this.logger.warn(`PlaybackIndicator: Invalid duration provided (${duration}). Duration must be a positive number.`);
            return;
        }
        this.totalDuration = duration;
    }

    /**
     * Moves the cursor to represent the current time.
     * @param {number} currentTime - Current playback time in seconds.
     */
    updatePosition(currentTime) {
        this.logger.debug(`PlaybackIndicator: updatePosition called with currentTime=${currentTime}s.`);
        
        if (this.totalDuration === 0) {
            this.logger.warn('PlaybackIndicator: Total duration is not set. Cannot update cursor position.');
            return;
        }

        if (typeof currentTime !== 'number' || currentTime < 0 || currentTime > this.totalDuration) {
            this.logger.warn(`PlaybackIndicator: Invalid currentTime provided (${currentTime}s). It must be between 0 and ${this.totalDuration}s.`);
            return;
        }

        const position = (currentTime / this.totalDuration) * this.containerWidth;
        this.cursor.style.left = `${position}px`;

        this.logger.debug(`PlaybackIndicator: Cursor moved to ${position}px (currentTime=${currentTime}s).`);
    }

    /**
     * Removes the cursor and cleans up resources.
     */
    destroy() {
        this.logger.debug('PlaybackIndicator: Destroy method called.');
        if (this.cursor && this.cursor.parentNode) {
            this.cursor.parentNode.removeChild(this.cursor);
            this.logger.info('PlaybackIndicator: Cursor element removed from DOM.');
        } else {
            this.logger.warn('PlaybackIndicator: Cursor element does not exist or is already removed.');
        }
        this.cursor = null;
        this.container = null;
    }
}

// Export the module
export default PlaybackIndicator;
