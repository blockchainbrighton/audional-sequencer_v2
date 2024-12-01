// PlaybackController.js

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

class PlaybackController {
    /**
     * @param {Object} [options] - Optional configurations.
     * @param {string} [options.logLevel='INFO'] - Logging level: DEBUG, INFO, WARN, ERROR.
     */
    constructor(options = {}) {
        this.logger = new Logger(options.logLevel || 'INFO');
        this.logger.info('PlaybackController: Initializing PlaybackController instance.');

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sourceNode = null;
        this.audioBuffer = null;
        this.startTime = 0;
        this.pauseTime = 0;
        this.isPlaying = false;
        this.playbackRate = 1;
        this.onTimeUpdateCallback = null;
        this.onPlayCallback = null;
        this.onPauseCallback = null;
        this.onStopCallback = null;
        this.timeUpdateInterval = null;
    }

    /**
     * Initializes the controller with an audio buffer.
     * @param {AudioBuffer} audioBuffer - The audio buffer to play.
     */
    initialize(audioBuffer) {
        this.logger.debug('PlaybackController: Initializing with provided audio buffer.');
        this.audioBuffer = audioBuffer;
    }

    /**
     * Starts playback.
     */
    play() {
        this.logger.debug('PlaybackController: Play method called.');
        if (this.isPlaying) {
            this.logger.warn('PlaybackController: Play called while already playing.');
            return;
        }

        if (!this.audioBuffer) {
            this.logger.error('PlaybackController: No audio buffer initialized.');
            return;
        }

        this.sourceNode = this.audioContext.createBufferSource();
        this.sourceNode.buffer = this.audioBuffer;
        this.sourceNode.playbackRate.value = this.playbackRate;
        this.sourceNode.connect(this.audioContext.destination);

        const offset = this.pauseTime % this.audioBuffer.duration;
        this.startTime = this.audioContext.currentTime - offset;
        this.sourceNode.start(0, offset);

        this.isPlaying = true;
        this.logger.info(`PlaybackController: Playback started at offset ${offset.toFixed(2)}s.`);
        this._startTimeUpdate();

        if (this.onPlayCallback) {
            this.logger.debug('PlaybackController: Invoking onPlay callback.');
            this.onPlayCallback();
        }

        // Handle playback end
        this.sourceNode.onended = () => {
            if (this.isPlaying) { // Ensures it wasn't stopped manually
                this.logger.info('PlaybackController: Playback ended naturally.');
                this.stop(); // Automatically stop and reset
            }
        };
    }

    /**
     * Pauses playback.
     */
    pause() {
        this.logger.debug('PlaybackController: Pause method called.');
        if (!this.isPlaying) {
            this.logger.warn('PlaybackController: Pause called while not playing.');
            return;
        }
        try {
            this.sourceNode.stop();
            this.pauseTime = this.getCurrentTime();
            this.isPlaying = false;
            this._stopTimeUpdate();

            this.logger.info(`PlaybackController: Playback paused at ${this.pauseTime.toFixed(2)}s.`);

            if (this.onPauseCallback) {
                this.logger.debug('PlaybackController: Invoking onPause callback.');
                this.onPauseCallback();
            }
        } catch (error) {
            this.logger.error('PlaybackController: Error while pausing playback:', error);
        }
    }

    /**
     * Stops playback and resets position.
     */
    stop() {
        this.logger.debug('PlaybackController: Stop method called.');
        if (this.sourceNode) {
            try {
                this.sourceNode.stop();
                this.logger.info('PlaybackController: Playback stopped.');
            } catch (error) {
                this.logger.error('PlaybackController: Error while stopping playback:', error);
            }
        }
        this.pauseTime = 0;
        this.isPlaying = false;
        this._stopTimeUpdate();

        if (this.onStopCallback) {
            this.logger.debug('PlaybackController: Invoking onStop callback.');
            this.onStopCallback();
        }
    }

    /**
     * Jumps to a specific time in seconds.
     * @param {number} time - The time to seek to.
     */
    seek(time) {
        this.logger.debug(`PlaybackController: Seek called with time ${time}s.`);
        if (time < 0 || time > this.audioBuffer.duration) {
            this.logger.warn(`PlaybackController: Seek time ${time}s is out of bounds.`);
            return;
        }
        this.pauseTime = time;
        if (this.isPlaying) {
            this.logger.debug('PlaybackController: Seeking while playing. Restarting playback.');
            this.pause();
            this.play();
        } else {
            this.logger.info(`PlaybackController: Seeked to ${time}s while paused.`);
        }
    }

    /**
     * Adjusts playback speed.
     * @param {number} rate - The new playback rate.
     */
    setPlaybackRate(rate) {
        this.logger.debug(`PlaybackController: Setting playback rate to ${rate}.`);
        if (rate <= 0) {
            this.logger.warn('PlaybackController: Invalid playback rate. Must be greater than 0.');
            return;
        }
        this.playbackRate = rate;
        if (this.isPlaying && this.sourceNode) {
            this.sourceNode.playbackRate.value = rate;
            this.logger.info(`PlaybackController: Playback rate set to ${rate}.`);
        }
    }

    /**
     * Returns the current playback time.
     * @returns {number} - Current playback time in seconds.
     */
    getCurrentTime() {
        if (this.isPlaying) {
            const currentTime = (this.audioContext.currentTime - this.startTime) * this.playbackRate;
            this.logger.debug(`PlaybackController: Current playback time is ${currentTime.toFixed(2)}s.`);
            return currentTime;
        } else {
            this.logger.debug(`PlaybackController: Current playback time is ${this.pauseTime.toFixed(2)}s (paused).`);
            return this.pauseTime;
        }
    }

    /**
     * Registers a callback for time updates.
     * @param {Function} callback - Function to call on time update.
     */
    onTimeUpdate(callback) {
        this.logger.debug('PlaybackController: onTimeUpdate callback registered.');
        this.onTimeUpdateCallback = callback;
    }

    /**
     * Event callbacks.
     */
    onPlay(callback) {
        this.logger.debug('PlaybackController: onPlay callback registered.');
        this.onPlayCallback = callback;
    }

    onPause(callback) {
        this.logger.debug('PlaybackController: onPause callback registered.');
        this.onPauseCallback = callback;
    }

    onStop(callback) {
        this.logger.debug('PlaybackController: onStop callback registered.');
        this.onStopCallback = callback;
    }

    // Private methods

    _startTimeUpdate() {
        this.logger.debug('PlaybackController: Starting time update interval.');
        this.timeUpdateInterval = setInterval(() => {
            if (this.onTimeUpdateCallback) {
                const currentTime = this.getCurrentTime();
                this.onTimeUpdateCallback(currentTime);
                this.logger.debug(`PlaybackController: Time update callback invoked with time ${currentTime.toFixed(2)}s.`);
            }
        }, 100); // Update every 100ms
    }

    _stopTimeUpdate() {
        this.logger.debug('PlaybackController: Stopping time update interval.');
        clearInterval(this.timeUpdateInterval);
        this.timeUpdateInterval = null;
    }
}

// Export the module
export default PlaybackController;
