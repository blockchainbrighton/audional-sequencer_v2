// SelectionTool.js

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

class SelectionTool {
    /**
     * @param {Object} [options] - Optional configurations.
     * @param {string} [options.logLevel='INFO'] - Logging level: DEBUG, INFO, WARN, ERROR.
     */
    constructor(options = {}) {
        this.logger = new Logger(options.logLevel || 'INFO');
        this.logger.info('SelectionTool: Initializing SelectionTool instance.');

        this.container = null;
        this.selectionBox = null;
        this.isSelecting = false;
        this.startX = 0;
        this.endX = 0;
        this.totalDuration = 0;
        this.containerWidth = 0;
        this.onSelectionCallback = null;

        // Binding methods to ensure proper 'this' context
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
    }

    /**
     * Initializes the selection tool.
     * @param {HTMLElement} containerElement - The waveform container element.
     * @param {number} totalDuration - Total duration of the audio in seconds.
     */
    initialize(containerElement, totalDuration) {
        this.logger.debug('SelectionTool: Initialize method called with containerElement:', containerElement, 'and totalDuration:', totalDuration);

        if (!(containerElement instanceof HTMLElement)) {
            this.logger.error('SelectionTool: Provided containerElement is not a valid HTMLElement.', containerElement);
            return;
        }

        if (typeof totalDuration !== 'number' || totalDuration <= 0) {
            this.logger.warn(`SelectionTool: Invalid totalDuration provided (${totalDuration}). It must be a positive number.`);
            return;
        }

        this.container = containerElement;
        this.totalDuration = totalDuration;
        this.containerWidth = containerElement.clientWidth;

        // Add event listeners
        this.container.addEventListener('mousedown', this._onMouseDown);
        this.container.addEventListener('mousemove', this._onMouseMove);
        this.container.addEventListener('mouseup', this._onMouseUp);

        this.logger.info('SelectionTool: Event listeners for mouse interactions added.');

        // Create selection box
        this.selectionBox = document.createElement('div');
        this.selectionBox.style.position = 'absolute';
        this.selectionBox.style.top = '0';
        this.selectionBox.style.height = '100%';
        this.selectionBox.style.backgroundColor = 'rgba(0, 0, 255, 0.3)';
        this.selectionBox.style.display = 'none';
        this.container.appendChild(this.selectionBox);

        this.logger.info('SelectionTool: Selection box element created and appended to container.');
    }

    /**
     * Registers a callback for selection events.
     * @param {Function} callback - Function to call with selection start and end times.
     */
    onSelection(callback) {
        this.logger.debug('SelectionTool: onSelection callback registered.');
        this.onSelectionCallback = callback;
    }

    /**
     * Sets the total duration of the audio.
     * @param {number} duration - Total duration in seconds.
     */
    setTotalDuration(duration) {
        this.totalDuration = duration;
    }


    /**
     * Cleans up event listeners and selections.
     */
    destroy() {
        this.logger.debug('SelectionTool: Destroy method called.');
        if (this.container) {
            this.container.removeEventListener('mousedown', this._onMouseDown);
            this.container.removeEventListener('mousemove', this._onMouseMove);
            this.container.removeEventListener('mouseup', this._onMouseUp);
            this.logger.info('SelectionTool: Event listeners removed.');
        }

        if (this.selectionBox && this.selectionBox.parentNode) {
            this.selectionBox.parentNode.removeChild(this.selectionBox);
            this.logger.info('SelectionTool: Selection box element removed from DOM.');
        } else {
            this.logger.warn('SelectionTool: Selection box element does not exist or is already removed.');
        }

        this.selectionBox = null;
        this.container = null;
    }

    // Private methods

    _onMouseDown(event) {
        this.logger.debug(`SelectionTool: Mouse down event at offsetX=${event.offsetX}px.`);
        this.isSelecting = true;
        this.startX = event.offsetX;
        this.selectionBox.style.left = `${this.startX}px`;
        this.selectionBox.style.width = '0px';
        this.selectionBox.style.display = 'block';
        this.logger.info(`SelectionTool: Selection started at x=${this.startX}px.`);
    }

    _onMouseMove(event) {
        if (!this.isSelecting) {
            return;
        }
        this.logger.debug(`SelectionTool: Mouse move event at offsetX=${event.offsetX}px while selecting.`);
        this.endX = event.offsetX;
        const width = this.endX - this.startX;
        if (width >= 0) {
            this.selectionBox.style.left = `${this.startX}px`;
            this.selectionBox.style.width = `${width}px`;
        } else {
            this.selectionBox.style.left = `${this.endX}px`;
            this.selectionBox.style.width = `${-width}px`;
        }
        this.logger.debug(`SelectionTool: Selection box updated - left: ${this.selectionBox.style.left}, width: ${this.selectionBox.style.width}.`);
    }

    _onMouseUp(event) {
        if (!this.isSelecting) {
            this.logger.warn('SelectionTool: Mouse up event detected but no selection was in progress.');
            return;
        }
        this.logger.debug(`SelectionTool: Mouse up event at offsetX=${event.offsetX}px.`);
        this.isSelecting = false;
        this.selectionBox.style.display = 'none';

        const selectedStartX = Math.min(this.startX, this.endX);
        const selectedEndX = Math.max(this.startX, this.endX);

        const startTime = (selectedStartX / this.containerWidth) * this.totalDuration;
        const endTime = (selectedEndX / this.containerWidth) * this.totalDuration;

        this.logger.info(`SelectionTool: Selection completed from ${startTime.toFixed(2)}s to ${endTime.toFixed(2)}s.`);

        if (this.onSelectionCallback) {
            this.logger.debug('SelectionTool: Invoking onSelection callback with selected times:', { startTime, endTime });
            this.onSelectionCallback({ startTime, endTime });
        }
    }
}

// Export the module
export default SelectionTool;
