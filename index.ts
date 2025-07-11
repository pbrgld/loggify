/**
 * ^Console class
 * This is a common library that handels all console operations. It's purpose is to provide a fast and powerful package
 * of methods and features that allows to go from zero to hero in no time using standards accross all projects.
 */
import { basename } from "path";
import util from 'util';

/**
 * Todo section
 */
//TODO: Prepare everything to make everything v1.0.0 ready
//TODO: Implement a method or extend option to .flush() - clearing the logs from memory but not send to console
//TODO: Append to file? Not sure if this is needed (Wait for community to request)
//TODO: Optimize Class name and version, remove from class and see if can be used from package.json
//TODO: Add init silent option to not log any class logging info, if even needed
//TODO: Add documentation for set log level

/**
 * Console class
 */
export default class Loggify {
    private className: string = 'Console';
    private versionMajor: number = 0;
    private versionMinor: number = 1;
    private versionPatch: number = 0;
    private version: string = `${this.versionMajor}.${this.versionMinor}.${this.versionPatch}`;
    private logLevel: LogLevel = 'full';
    private logTimestamp: boolean = true;
    private logTimestampType: string = 'time';
    private typeTagUseEmoji: boolean = true;
    private logCallerInformation: boolean = true;
    private logCallerCallStackLevel: number = 3;
    private logMemory: boolean = true;
    private logBuffer: any = new Map();
    private ansi: any = {
        // Colors
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',

        // BRight colors
        brightBlack: '\x1b[90m',
        brightRed: '\x1b[91m',
        brightGreen: '\x1b[92m',
        brightYellow: '\x1b[93m',
        brightBlue: '\x1b[94m',
        brightMagenta: '\x1b[95m',
        brightCyan: '\x1b[96m',
        brightWhite: '\x1b[97m',

        // Additional colors
        orange: '\x1b[38;5;208m',
        gray: '\x1b[90m',

        // Special options
        reset: '\x1b[0m',
        bold: '\x1b[1m',
        underline: '\x1b[4m',
        inverse: '\x1b[7m'
    };
    private emoji: any = emojis;

    /**
     * Initializing the log class to be used over console.log, as it should hopefully be faster and less resource 
     * demanding, while supporting quite some nice features, such as ANSI coloring and styling without requiring third
     * party packages.
     * @param {ConstructorOptions} options Constructor Options
     */
    constructor(options?: ConstructorOptions) {
        // Init/set class
        if (options?.loglevel) this.logLevel = options.loglevel;
        if (typeof options?.useEmojiAsLogType === 'boolean') this.typeTagUseEmoji = options.useEmojiAsLogType;
        if (typeof options?.logTimestamp?.enabled === 'boolean') this.logTimestamp = options.logTimestamp.enabled;
        if (typeof options?.logTimestamp?.mode === 'string') this.logTimestampType = options.logTimestamp.mode;
        if (typeof options?.logCallerInformation === 'boolean') this.logCallerInformation = options.logCallerInformation;
        if (!isNaN(parseInt(`${options?.defaultCallerCallStackLevel}`))) this.logCallerCallStackLevel = parseInt(`${options?.defaultCallerCallStackLevel}`);
        if (typeof options?.logMemoryUsage === 'boolean') this.logMemory = options.logMemoryUsage;

        // Output (info)
        this.console(`Class ${this.className} v${this.version} loaded from [ansi:cyan]${basename(__filename)}[ansi:reset]`, `init`, { logLevel: 'off', customLogCallerCallStackLevel: this.logCallerCallStackLevel + 1 });
        this.console(`Log level: [ansi:magenta]${this.logLevel}[ansi:reset]`, undefined, { logLevel: 'off', customLogCallerCallStackLevel: this.logCallerCallStackLevel + 1 });
        this.console(`Log timestamp: [ansi:magenta]${this.logTimestamp}[ansi:reset]`, undefined, { logLevel: 'off', customLogCallerCallStackLevel: this.logCallerCallStackLevel + 1 });
        if (this.logTimestamp) this.console(`Timestamp format: [ansi:magenta]${this.logTimestampType}[ansi:reset]`, undefined, { logLevel: 'off', customLogCallerCallStackLevel: this.logCallerCallStackLevel + 1 });
        this.console(`Log type as emojis: [ansi:magenta]${this.typeTagUseEmoji}[ansi:reset]`, undefined, { logLevel: 'off', customLogCallerCallStackLevel: this.logCallerCallStackLevel + 1 });
        this.console(`Log caller information: [ansi:magenta]${this.logCallerInformation}[ansi:reset]`, undefined, { logLevel: 'off', customLogCallerCallStackLevel: this.logCallerCallStackLevel + 1 });
        this.console(`Default caller information level: [ansi:magenta]${this.logCallerCallStackLevel}[ansi:reset]`, undefined, { logLevel: 'off', customLogCallerCallStackLevel: this.logCallerCallStackLevel + 1 });
        this.console(`Log memory usage: [ansi:magenta]${this.logMemory}[ansi:reset]`, undefined, { logLevel: 'off', customLogCallerCallStackLevel: this.logCallerCallStackLevel + 1 });
    }

    /** Method to set/change the log level */
    setLogLevel(logLevel: LogLevel) {
        // Save current log level
        const currentLogLevel: string = this.logLevel;

        // Log Level has been changed
        if (currentLogLevel != logLevel) {
            this.logLevel = logLevel;
            this.console(`Class ${this.className} @LogLevel: "[ansi:brightBlue]${currentLogLevel}[ansi:reset]" => "[ansi:brightGreen]${this.logLevel}[ansi:reset]"`, 'info', { logLevel: 'off', customLogCallerCallStackLevel: this.logCallerCallStackLevel + 1 });
            return true;
        }

        // No change required - new value equals current value
        else {
            this.console(`Class ${this.className} @LogLevel: already set to "${logLevel}"`, 'warn', { logLevel: 'minimal', customLogCallerCallStackLevel: this.logCallerCallStackLevel + 1 });
            return false;
        }
    }

    /**
     * Console output
     * Based on the log level and the type lines will be added to the console
     * @param {String} message Message you want to display - can contain ANSI colors and styling
     * @param {String} type Type of styling to be applied to output (e.g. info, error, success, debug, etc ...) 
     * @param {Object} object Along with the message provide an object to be displayed within the output 
     * @param {Object} options Set of options to be applied to the output (e.g. timestamp: true) 
     */
    console(message?: string, type?: LogType, options?: LogConsoleOptions, object?: any) {
        // Log level control
        if (this.logLevel == 'off' && options?.logLevel != 'off') return false;
        if (this.logLevel == 'minimal' && options?.logLevel != 'off' && options?.logLevel != 'minimal') return false;

        // Init
        let typeTag: any = '';
        let timestamp: string = '';
        let contextId: string | symbol | undefined = options?.context?.id || undefined;
        let callerInformation: string | undefined = undefined;
        let memory: string = '';

        /** Check for context and initialize if needed */
        if (contextId) {
            if (!this.logBuffer.has(contextId)) {
                // Initialize context in log buffer
                this.logBuffer.set(contextId, { title: options?.context?.title, start: performance.now(), end: 0, logs: [] });

                // Define context start element and push to  context in log buffer
                const contextFrame: string = this.replaceAnsi(`[ansi:orange]╔═══════════════< Context start: ${options?.context?.title}[ansi:reset]`);
                this.logBuffer.get(contextId)!.logs.push(`${contextFrame}\n`);
            }

            // Update end time - will always be overwritten with the last log
            else this.logBuffer.get(contextId)!.end = performance.now();
        }

        /** Type tag: use Emoji */
        if (this.typeTagUseEmoji) {
            // Specials & overwrites
            if (type === 'metrics') typeTag = `${this.emoji.timer} `;

            // Determine correct emoji from Emoji object to render
            else typeTag = Object.entries(this.emoji).find(([k]) => k === type)?.[1];

            // When no matcing emoji could be determined
            if (!typeTag) typeTag = '  '; // No emoji aparently must be 2 blank spaces

            // Add an additional space in the and
            typeTag = `${typeTag} `;
        }

        /** Type tag: DO NOT USE EMOJI */
        else {
            // Build Tags
            if (type == 'okay') typeTag = '[ansi:green][ansi:inverse]OKAY';
            else if (type == 'success') typeTag = '[ansi:green][ansi:inverse]SUCCESS';
            else if (type == 'info') typeTag = '[ansi:white][ansi:inverse]INFO';
            else if (type == 'debug') typeTag = '[ansi:blue][ansi:inverse]DEBUG';
            else if (type == 'warn' || type == 'warning') typeTag = '[ansi:yellow][ansi:inverse]WARNING';
            else if (type == 'error') typeTag = '[ansi:red][ansi:inverse]ERROR';
            else if (type == 'metrics') typeTag = '[ansi:brightMagenta][ansi:inverse]METRICS';
            else if (type?.startsWith('custom=')) typeTag = `${type.split('=')[1]}${type.split('=')[2]}`;
            else if (type) typeTag = '[ansi:gray][ansi:inverse]UNKNOWN';
            else typeTag = '';

            // Replace ANSI colors and Styles
            typeTag = this.replaceAnsi(typeTag);

            // Stretch Type Tag to a fixed limit
            typeTag = this.padEndAnsiSafe(typeTag, 11, ' ', true);

            // Add ANSI reset
            typeTag = typeTag + this.ansi.reset + ' ';
        }

        /** Option: Timestamp */
        if (this.logTimestamp || options?.timestamp) {
            if (this.logTimestampType === 'dateTime') timestamp = `${this.getLocalDateString()} ${this.getLocalTimeString()}`;
            else timestamp = this.getLocalTimeString();

            // Add an empty string char at end of timestamp
            timestamp = this.replaceAnsi(`[ansi:gray]~${timestamp}~[ansi:reset] `);
        }

        /** Caller information */
        if (this.logCallerInformation) {
            const location = this.getCallerLocation(options?.customLogCallerCallStackLevel || this.logCallerCallStackLevel); // Set the level how deep you want look-up the caller. usualy you would be looking for level 2 when initialized in each file and 3 when using a global or one-instance approach
            if (!location) return false;
            callerInformation = this.replaceAnsi(`[ansi:blue]${basename(`${location?.file}`)}[ansi:reset]:[ansi:yellow]${location.line}[ansi:reset]${location?.function ? `[ansi:brightMagenta](Func:${location.function})[ansi:reset]` : ''}`) + ' ';
        } else callerInformation = '';

        /** Memory usage */
        if (this.logMemory) {
            // Get memory usage
            const { heapUsed, heapTotal, rss } = process.memoryUsage();
            memory = this.replaceAnsi(`[ansi:gray][[ansi:reset][ansi:cyan]${(heapUsed / 1024 / 1024).toFixed(2)}MB[ansi:reset][ansi:gray] of [ansi:reset][ansi:brightBlue]${(heapTotal / 1024 / 1024).toFixed(2)}MB[ansi:reset][ansi:gray]|[ansi:reset][ansi:white]${(rss / 1024 / 1024).toFixed(2)}MB[ansi:reset][ansi:gray]][ansi:reset] `);
        }

        /** Render message to console */
        if (message) {
            // Replace [ansi:xxx] pattern with matching ANSI color/option
            message = this.replaceAnsi(message);

            // Replace [emoji:xxx] pattern with matching emoji
            message = this.replaceEmojis(message);

            // Metrics Special: When metrics start and end are defined prefix duration
            if (options?.metrics?.start && options?.metrics?.end) {
                message = this.replaceAnsi(`[ansi:gray][[ansi:reset][ansi:magenta]Duration: [ansi:reset]${this.formatDuration(options.metrics.end - options.metrics.start)}[ansi:gray]][ansi:reset]`) + ' ' + message;
            }
            // Metrics Special: When metrics duration is provided
            if (options?.metrics?.duration) {
                message = this.replaceAnsi(`[ansi:gray][[ansi:reset][ansi:magenta]Duration: [ansi:reset]${this.formatDuration(options.metrics.duration)}[ansi:gray]][ansi:reset]`) + ' ' + message;
            }

            // Push to logBuffer: when contextId is set
            if (contextId) {
                // Context frame
                const contextFrame: string = this.replaceAnsi(`[ansi:orange]║[ansi:reset] `);

                // Push to log buffer
                this.logBuffer.get(contextId)!.logs.push(`${contextFrame}${typeTag}${timestamp}${memory}${callerInformation}${message}\n`);
            }

            // Send to standard output
            else process.stdout.write(`${typeTag}${timestamp}${memory}${callerInformation}${message}\n`);
        }

        /** Render object to console */
        if (object && typeof object === 'object') {
            // JSON schön formatieren mit Farben
            const objectFormatted = util.inspect(this.flattenObject(object), {
                colors: false,      // Disable ANSI colors - to use own
                depth: null,       // Show all levels
                compact: false     // pretty print
            })
                .replace(/(.*?):/g, `${this.ansi.cyan}$1${this.ansi.reset}:`)   // colorize keys
                .replace(/: '(.*?)'/g, `: ${this.ansi.brightGreen}"$1"${this.ansi.reset}`) // colorize strings
                .replace(/: "(.*?)"/g, `: ${this.ansi.brightGreen}"$1"${this.ansi.reset}`) // colorize strings
                .replace(/: (\d+)/g, `: ${this.ansi.yellow}$1${this.ansi.reset}`)// colorize numbers
                .replace(/(?<!["'])\btrue\b(?!["'])/g, `${this.ansi.magenta}true${this.ansi.reset}`) // colorize boolean true
                .replace(/(?<!["'])\bfalse\b(?!["'])/g, `${this.ansi.magenta}false${this.ansi.reset}`) // colorize boolean false
                .replace(/(?<!["'])\bundefined\b(?!["'])/g, `${this.ansi.gray}undefined${this.ansi.reset}`) // colorize undefined
                .replace(/\s*'([^']+)'\s*(?=,|\])/g, (_, str) => ` '${this.ansi.orange}${str}${this.ansi.reset}'`) // coloirze strings within an array

            // Object size information
            const objectInfo: ObjectSizeResponse = this.getObjectSize(object);
            const objectInfoMessage: string = this.replaceAnsi(`[ansi:gray]Object has "${objectInfo.chars}" characters with a total size of ${objectInfo.size} [ansi:reset]`);

            // Push to logBuffer: when contextId is set
            if (contextId) this.logBuffer.get(contextId)!.logs.push(`${objectFormatted}\n${objectInfoMessage}\n`);

            // Send to standard output
            else {
                process.stdout.write(`${objectFormatted}\n${objectInfoMessage}\n`);
            }
        }
    }

    /**
     * A function that uses the trick to throw an error to access the call stack and extract the levels of them
     * @param {number} depth Put in the number of the level you want to scan 
     * @returns {Object} Information from where the function has been called, such as path to file and line
     */
    getCallerLocation(depth: number = 2) {
        const err = new Error();
        const stack = err.stack?.split('\n');

        if (!stack || stack.length <= depth) return null;

        if (!stack[depth]) return null;
        const line = stack[depth].trim();

        const regexWithFunc = /^at (.+?) \((.+):(\d+):(\d+)\)$/;
        const regexNoFunc = /^at (.+):(\d+):(\d+)$/;

        let match = line.match(regexWithFunc);
        if (match) {
            const [, func, file, lineNum, colNum] = match;
            return { function: func, file, line: Number(lineNum), column: Number(colNum) };
        }

        match = line.match(regexNoFunc);
        if (match) {
            const [, file, lineNum, colNum] = match;
            return { function: null, file, line: Number(lineNum), column: Number(colNum) };
        }

        return null;
    }

    /**
     * Flatten object is required to make to logging of object work with certain outputs.
     * @param {Object} obj Object to be flattened 
     * @returns {Object} flattened object
     */
    flattenObject(obj: any) {
        const flat: Record<string, any> = {};
        let proto = obj;

        while (proto && proto !== Object.prototype) {
            for (const key of Object.getOwnPropertyNames(proto)) {
                if (!(key in flat)) {
                    try {
                        const value = obj[key];
                        flat[key] = typeof value === 'function' ? '[Function]' : value;
                    } catch {
                        flat[key] = '[unreadable]';
                    }
                }
            }
            proto = Object.getPrototypeOf(proto);
        }

        return flat;
    }

    /**
     * Generates a unique context ID to be used grouping functions and parallel executions together
     * @returns {String} Unique context ID
     */
    generateContextId() {
        const contextId = (): string => {
            const rand = (globalThis.crypto as Crypto | undefined)?.getRandomValues?.(new Uint32Array(1));
            return (rand?.[0] ?? Date.now()).toString(36);
        };
        return contextId();
    }

    /**
     * Flush specific context from log buffer will dump a specific log record set to the standard output and remove it
     * from log buffer. When a context ID is not found or does not exist anymore the function will log an error and
     * return FALSE, welse it will print the logs and return TRUE.
     * @param {String} contextId Unique ID to identify the context area that holds all relevant logs 
     * @returns {Boolean} Returns FALSE when context ID cannot found in log buffer, otherwise will return TRUE
     */
    flush(contextId: string) {
        //! ContextId not found in LogBuffer
        if (!this.logBuffer.has(contextId)) {
            this.console(`Context ID "[ansi:yellow]${contextId}[ansi:reset] does not exist in log buffer!`, 'error', { logLevel: 'off' });
            return false;
        }

        // Iterate through log records
        for (const record of this.logBuffer.get(contextId).logs) {
            process.stdout.write(record);
        }

        // Render context closing frame
        const contextFrame: string = this.replaceAnsi(`[ansi:orange]╚═══════════════> Context end: ${this.logBuffer.get(contextId).title}[ansi:reset] | [ansi:magenta]Duration:[ansi:reset] ${this.formatDuration(this.logBuffer.get(contextId).end - this.logBuffer.get(contextId).start)}\n`);
        process.stdout.write(contextFrame);

        // Delete context from log buffer after written output
        this.logBuffer.delete(contextId);

        // End function
        return true;
    }

    /**
     * Replace ANSI style commands to ANSI CODE in String
     * @param {String} str String to be searched for ANSI commands and replaced into ANSI code 
     * @returns {String} String with ANSI characters
     */
    replaceAnsi(str: string) {
        str = str.replace(/\[ansi:(\w+)\]/g, (_, key) => this.ansi[key] || `[ansi:${key}]`);
        return str;
    }

    /**
     * Replace emoji code to actual emojis in string
     * @param {String} str String to be searched for emoji commands and replace them with actual emojis. 
     * @returns {String} String with actual emoji icons
     */
    replaceEmojis(str: string) {
        str = str.replace(/\[emoji:(\w+)\]/g, (_, key) => this.emoji[key] || `[emoji:${key}]`);
        return str;
    }

    /**
     * ANSI Safe version of padEnd() Function
     * @param {String} str Message or label you want to handle 
     * @param {Number} targetLength The target length of chars you want to stretch the label to 
     * @param {String} padChar The character you want to use filling up the space  
     * @param {Boolean} center If TRUE, the label will be displayed in center and the ANSI style of the last field will be applied to the front of str filling chars 
     * @returns 
     */
    padEndAnsiSafe(str: string = '', targetLength: number, padChar = ' ', center: boolean = false) {
        const ansiRegex = /\x1b\[[0-9;]*m/g;
        const RESET = '\x1b[0m';

        // Visible length without ANSI
        const visibleLength = str.replace(ansiRegex, '').length;
        const totalPadding = Math.max(0, targetLength - visibleLength);

        if (totalPadding <= 0) return str;

        // Track active ANSI code (that not has been reset by \x1b[0m )
        const ansiCodes: string[] = [];
        let match: RegExpExecArray | null;
        ansiRegex.lastIndex = 0;
        while ((match = ansiRegex.exec(str))) {
            const code = match[0];
            if (code === RESET) {
                ansiCodes.length = 0; // Reset delets previous style
            } else {
                ansiCodes.push(code); // Track all active codes
            }
        }

        const stylePrefix = ansiCodes.join('');
        const styleReset = stylePrefix ? RESET : '';

        if (!center) {
            return str + padChar.repeat(totalPadding);
        }

        const padLeft = Math.floor(totalPadding / 2);
        const padRight = totalPadding - padLeft;

        const leftPad = stylePrefix + padChar.repeat(padLeft) + styleReset;
        const rightPad = padChar.repeat(padRight);

        return leftPad + str + rightPad;
    }

    /**
     * Fast way to determine the current date based on the current plattform's time zone. Not using UTC!
     * @returns {String} Local date in current time zone
     */
    getLocalDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 0-basiert
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Fast way to determine the current time based on the current plattform's time zone. Not using UTC!
     * @returns {String} Local time in current time zone
     */
    getLocalTimeString() {
        const now = new Date();
        const time = now.toLocaleTimeString(undefined, { hour12: false });
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        return `${time}.${ms}`;
    }

    /**
     * Converts miliseconds (ms) into human readable time
     * @param {Number} ms Provide the miliseconds you want to convert into human readabe time 
     * @returns {String} Returns human readable string
     */
    formatDuration(ms: number): string {
        const msInSec = 1000;
        const msInMin = 60 * msInSec;
        const msInHour = 60 * msInMin;

        const hours = Math.floor(ms / msInHour);
        const minutes = Math.floor((ms % msInHour) / msInMin);
        const seconds = Math.floor((ms % msInMin) / msInSec);
        const milliseconds = Math.floor(ms % msInSec);

        const parts = [];
        if (hours) parts.push(`${hours}h`);
        if (minutes) parts.push(`${minutes}m`);
        if (seconds || (!hours && !minutes)) {
            parts.push(`${seconds}.${String(milliseconds).padStart(3, '0')}s`);
        }

        return parts.join(' ');
    }

    /**
     * Converts object into string and than calculates the size
     * @param {Object} obj Object you want to calculate the size of 
     * @returns {String} Returns a size formatted string of the object
     */
    getObjectSize(obj: any): ObjectSizeResponse {
        let size: string = '';
        let bytes: number = 0;
        let chars: number = 0;

        const objectStringified: string = JSON.stringify(obj);
        const bytesUtf8 = Buffer.byteLength(objectStringified, 'utf8');

        // Determine size
        if (bytesUtf8 < 1024) size = `${bytesUtf8} Bytes`;
        if (bytesUtf8 < 1024 * 1024) size = `${(bytesUtf8 / 1024).toFixed(2)} KB`;
        else size = `${(bytesUtf8 / 1024 / 1024).toFixed(2)} MB`;

        // Assign bytes and chars
        bytes = bytesUtf8;
        chars = objectStringified.length

        return { size, bytes, chars }
    }

}

/** Assets on top level */
/** Emojis */
const emojis = {
    // Common
    okay: '✅',
    success: '✅',
    info: 'ℹ️ ',
    warn: '⚠️ ',
    error: '❌',

    // Specials
    connect: '🛜',
    timer: '⏱️',
    explosion: '💥',
    fuck: '🖕',
    shit: '💩',
    star: '⭐️',
    rocket: '🚀',
    init: '🔸',
    finished: '🏁',

    // Hearts
    heart: '❤️',
    heartBroken: '💔',
    heartMagenta: '🩷',
    heartRed: '❤️',
    heartOrange: '🧡',
    heartYellow: '💛',
    heartGreen: '💚',
    heartCyan: '🩵',
    heartBlue: '💙',
    heartPurple: '💜',
    heartBlack: '🖤',
    heartGray: '🩶',
    heartWhite: '🤍',
    heartBrown: '🤎',

    // Circles
    circleRed: '🔴',
    circleOrange: '🟠',
    circleYellow: '🟡',
    circleGreen: '🟢',
    circleBlue: '🔵',
    circlePurple: '🟣',
    circleBlack: '⚫️',
    circleWhite: '⚪️',
    circleBrown: '🟤',

    // Squares
    squareRed: '🟥',
    squareOrange: '🟧',
    squareYellow: '🟨',
    squareGreen: '🟩',
    squareBlue: '🟦',
    squarePurple: '🟪',
    squareBlack: '⬛️',
    squareWhite: '⬜️',
    squareBrown: '🟫'
} as const;

/** Type Definitions */

/**
 * LogLevel defines how detailed the log information will be
 * - 'off' = no logs at all (only errors)
 * - 'minimal' = only important logs
 * - 'full' = all logs
 */
export type LogLevel = 'off' | 'minimal' | 'full';

/** Timestamp mode for logging */
type LogTimestampMode = 'time' | 'dateTime';

/**
 * Control the timestamp logging by either enabling or disabling it or decide whether you want time only be logged to
 * save some space or go with the full date and time
 */
interface LogTimestampOptions {
    enabled?: boolean;            // optional
    mode?: LogTimestampMode;      // optional 'time' | 'dateTime'
}

/**
 * Options for console logs. Control specificly wheter to hide the timestamp in this particular output, join an output 
 * to a context or provide metrics for a standardized way of presenting durations
 */
interface LogConsoleOptions {
    // Timestamp
    timestamp?: boolean;

    // Log Level
    logLevel?: LogLevel;

    // Custom caller stack level
    customLogCallerCallStackLevel?: number;

    // Context
    context?: {
        id?: string | symbol;
        title?: string;
        readonly start?: number;
        readonly end?: number;
        readonly logs?: Array<string>;
    }

    // Metrics
    metrics?: {
        start?: number;
        end?: number;
        duration?: number;
    }
}

/** Fixed or static log types  */
type FixedLogTypes = 'okay' | 'success' | 'info' | 'debug' | 'warn' | 'warning' | 'error' | 'metrics';
/** Dynamically build types based on the emoji ley object */
type DynamicLogTypes = keyof typeof emojis;
/** Build a custom type with static start and dynamic end */
type CustomLogTypes = `custom=${string}`; // e.g. 'custom=TRIGGER', 'custom=IMPORT'
type LogType = FixedLogTypes | DynamicLogTypes | CustomLogTypes;

/** Constructor options */
interface ConstructorOptions {
    loglevel?: LogLevel;
    useEmojiAsLogType?: boolean;
    logTimestamp?: LogTimestampOptions;
    logCallerInformation?: boolean;
    defaultCallerCallStackLevel?: number;
    logMemoryUsage?: boolean;
}

interface ObjectSizeResponse {
    size: string;
    bytes: number;
    chars: number;
}
