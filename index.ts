/**
 * ^Console class
 * This is a common library that handels all console operations. It's purpose is to provide a fast and powerful package
 * of methods and features that allows to go from zero to hero in no time using standards accross all projects.
 */
import os from 'os';
import { basename } from "path";
import util from 'util';
import { ansiCodes } from './ansi.js';
import { emojis } from './emojis.js';
import type { LogType, LogConsoleOptions, LogLevel, LogTypeBadge, GrafanaLoki, GrafanaLokiEntry, GrafanaLokiLabels, ConstructorOptions, ObjectSizeResponse, FlushOptions } from './types';

/**
 * Todo section
 */
//TODO: Prepare everything to make everything v1.0.0 ready

/**
 * Console class
 */
export default class Loggify {
    private logLevel: LogLevel = 'full';
    private logTimestamp: boolean = true;
    private logTimestampType: string = 'time';
    private logTypeBadge: LogTypeBadge = 'emoji';
    private logCallerInformation: boolean = true;
    private logCallerCallStackLevel: number = 3;
    private logMemory: boolean = true;
    private logBuffer: any = new Map();
    private grafanaLoki: GrafanaLoki = {};
    private ansi = ansiCodes;
    private emoji = emojis;

    /**
     * Initializing the log class to be used over console.log, as it should hopefully be faster and less resource 
     * demanding, while supporting quite some nice features, such as ANSI coloring and styling without requiring third
     * party packages.
     * @param {ConstructorOptions} options Constructor Options
     */
    constructor(options?: ConstructorOptions) {
        // Init/set class
        if (options?.loglevel) this.logLevel = options.loglevel;
        if (typeof options?.logTypeBadge === 'string') this.logTypeBadge = options.logTypeBadge;
        if (typeof options?.logTimestamp?.enabled === 'boolean') this.logTimestamp = options.logTimestamp.enabled;
        if (typeof options?.logTimestamp?.mode === 'string') this.logTimestampType = options.logTimestamp.mode;
        if (typeof options?.logCallerInformation === 'boolean') this.logCallerInformation = options.logCallerInformation;
        if (!isNaN(parseInt(`${options?.defaultCallerCallStackLevel}`))) this.logCallerCallStackLevel = parseInt(`${options?.defaultCallerCallStackLevel}`);
        if (typeof options?.logMemoryUsage === 'boolean') this.logMemory = options.logMemoryUsage;

        // Initialize GrafanaLoki
        if (options?.grafanaLoki) {
            this.grafanaLokiInit(options.grafanaLoki);
        }

        // Output (info)
        if (options?.initSilent !== true) {
            this.logInit();
        }
    }

    /** Logs the current initialization and setup of Loggify */
    logInit() {
        this.console(`╭ Loggify (@pbrgld/loggify) loaded [ansi:reset]`, `init`, { logLevel: 'off', callerInformation: { overwriteCallerStackLevel: this.logCallerCallStackLevel + 2 } });
        this.console(`├─── Log level: [ansi:magenta]${this.logLevel}[ansi:reset]`, undefined, { logLevel: 'off', callerInformation: { overwriteCallerStackLevel: this.logCallerCallStackLevel + 2 } });
        this.console(`├─── Log timestamp: [ansi:magenta]${this.logTimestamp}[ansi:reset]`, undefined, { logLevel: 'off', callerInformation: { overwriteCallerStackLevel: this.logCallerCallStackLevel + 2 } });
        if (this.logTimestamp) this.console(`├─── Timestamp format: [ansi:magenta]${this.logTimestampType}[ansi:reset]`, undefined, { logLevel: 'off', callerInformation: { overwriteCallerStackLevel: this.logCallerCallStackLevel + 2 } });
        this.console(`├─── Log type badge: [ansi:magenta]${this.logTypeBadge}[ansi:reset]`, undefined, { logLevel: 'off', callerInformation: { overwriteCallerStackLevel: this.logCallerCallStackLevel + 2 } });
        this.console(`├─── Log caller information: [ansi:magenta]${this.logCallerInformation}[ansi:reset]`, undefined, { logLevel: 'off', callerInformation: { overwriteCallerStackLevel: this.logCallerCallStackLevel + 2 } });
        this.console(`├─── Default caller information level: [ansi:magenta]${this.logCallerCallStackLevel}[ansi:reset]`, undefined, { logLevel: 'off', callerInformation: { overwriteCallerStackLevel: this.logCallerCallStackLevel + 2 } });
        this.console(`╰─── Log memory usage: [ansi:magenta]${this.logMemory}[ansi:reset]`, undefined, { logLevel: 'off', callerInformation: { overwriteCallerStackLevel: this.logCallerCallStackLevel + 2 } });
    }

    /** Method to set/change the log level */
    setLogLevel(logLevel: LogLevel) {
        // Save current log level
        const currentLogLevel: string = this.logLevel;

        // Log Level has been changed
        if (currentLogLevel != logLevel) {
            this.logLevel = logLevel;
            this.console(`Loggify @LogLevel: "[ansi:brightBlue]${currentLogLevel}[ansi:reset]" => "[ansi:brightGreen]${this.logLevel}[ansi:reset]"`, 'info', { logLevel: 'off', callerInformation: { overwriteCallerStackLevel: this.logCallerCallStackLevel + 1 } });
            return true;
        }

        // No change required - new value equals current value
        else {
            this.console(`Loggify @LogLevel: already set to "${logLevel}"`, 'warn', { logLevel: 'minimal', callerInformation: { overwriteCallerStackLevel: this.logCallerCallStackLevel + 1 } });
            return false;
        }
    }

    /** Initialize Grafana Loki */
    grafanaLokiInit(options: GrafanaLoki) {
        // Manipulate/optimized init object
        // Correct hostname
        if (options.isSecure === true) {
            options.hostname = `https://${options.hostname?.replaceAll('http://', '').replaceAll('https://', '')}`;
        }
        else if (options.isSecure === false) {
            options.hostname = `http://${options.hostname?.replaceAll('http://', '').replaceAll('https://', '')}`;
        }
        else if (!options.isSecure) {
            options.hostname = `http://${options.hostname?.replaceAll('http://', '').replaceAll('https://', '')}`;
        }

        //* Connection -> Connecting
        if (options.hostname && options.port) options.connection = {
            status: 'connecting',
            message: `Connecting to "${options.hostname}" via port "${options.port}" ...`
        }
        //° Connection -> Invalid = undefined
        else options.connection = {
            status: undefined,
            message: `Incomplete connection setup! Require hostname and port!`
        }

        // Store object in calls property
        this.grafanaLoki = options;

        // Test connection
        this.grafanaLokiTestConnection();
    }

    /**
     * Build Authorization Header Value for GrafanaLoki REST API requests
     * This is done based on the auth initialozation of the GrafanaLoki configuration. Will either use none/empty value,
     * basic auth - using user name and password or bearer token
     * @returns {String} Returns either empty string for none, basic or bearer token value string for HTTP request header
     */
    grafanaLokiAuthorizationHeader(): string {
        // Init
        let authorization = '';

        // Build Basic Authorization Header Value
        if (this.grafanaLoki.auth?.type === 'basic') {
            authorization = `Basic ${Buffer.from(`${this.grafanaLoki.auth.user}:${this.grafanaLoki.auth.pass}`).toString('base64')}`;
        }

        // Build Bearer Authorization Header Value
        else if (this.grafanaLoki.auth?.type === 'bearer') {
            authorization = `Bearer ${this.grafanaLoki.auth.bearerToken}`;
        }

        return authorization;
    }

    /**
     * Test connection to Grafana Loki will test the server and port settings provided as well as user and password or 
     * bearer token. In case of success the endpoint will provide some information such as version and revision into
     * the server info object and the function returns TRUE in case of success and FALSE in case of an error
     * @returns {Boolean}
     */
    async grafanaLokiTestConnection(): Promise<boolean> {
        //! GrafanaLoki not instantiated
        if (Object.keys(this.grafanaLoki).length === 0 || !this.grafanaLoki.connection?.status) {
            this.console('GrafanaLoki: [ansi:red]Not initialized![ansi:reset] Cannot test connection!', 'error', { logLevel: 'off' });
            return false;
        }
        //! GrafanaLoki missing hostname
        if (this.grafanaLoki.hostname === 'http://' || this.grafanaLoki.hostname === 'https://') {
            this.grafanaLoki.connection = {
                status: 'error',
                message: 'Incomplete setup! Missing hostname!'
            }
            return false;
        }

        // Init
        const pathTest: string = '/loki/api/v1/status/buildinfo';
        let serverInfo = {
            connectionTested: false,
            version: '',
            revision: '',
            branch: '',
            buildUser: '',
            buildDate: '',
            goVersion: ''
        };

        // Request to GrafanaLoki Server
        try {
            const response = await fetch(`${this.grafanaLoki.hostname}:${this.grafanaLoki.port}${pathTest}`, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json', 'Authorization': this.grafanaLokiAuthorizationHeader()
                }
            });

            // Response => 200 OK
            if (response.status === 200) {
                const body: any = await response.json();

                if (body.version) {
                    serverInfo.version = body.version;
                    serverInfo.connectionTested = true;
                }
                if (body.revision) serverInfo.revision = body.revision;
                if (body.branch) serverInfo.branch = body.branch;
                if (body.buildUser) serverInfo.buildUser = body.buildUser;
                if (body.buildDate) serverInfo.buildDate = body.buildDate;
                if (body.goVersion) serverInfo.goVersion = body.goVersion;

                this.grafanaLoki.serverInfo = serverInfo;

                this.grafanaLoki.connection = {
                    status: 'connected',
                    message: `Connected to "${this.grafanaLoki.hostname}:${this.grafanaLoki.port}${pathTest}"!`
                }

                this.console(`GrafanaLoki: [ansi:green]Connection successfully tested![ansi:reset] v${serverInfo.version}(${serverInfo.revision}) [ansi:gray][${serverInfo.buildDate}][ansi:reset]`, 'okay', { logLevel: 'minimal' });

                return true;
            }

            //° Failed to connect ==> error
            else {
                // Update connection info
                this.grafanaLoki.connection = {
                    status: 'error',
                    message: `Bad response connecting to "${this.grafanaLoki.hostname}:${this.grafanaLoki.port}${pathTest}" => ${response.status} - ${response.statusText}`
                }

                this.console(`GrafanaLoki: [ansi:yellow]Testing connection failed![ansi:reset] => ${response.status} - ${response.statusText}`, 'error', { logLevel: 'off' });
                return false;
            }

        }
        catch (error: any) {
            // Update connection info
            this.grafanaLoki.connection = {
                status: 'error',
                message: `Failed connecting to "${this.grafanaLoki.hostname}:${this.grafanaLoki.port}${pathTest}" => ${error.toString()}`
            }
            this.console(`GrafanaLoki: [ansi:red]Error while testing connection![ansi:reset] => ${error.toString()}`, 'error', { logLevel: 'off' });
            return false
        }
    }

    /**
     * Pushes stream with a set of labels and a set of log records to the connected GrafanaLoki Server. Will not do anythins when there is no tested connection is class property
     * @param {GrafanaLokiEntry} entries Array of records you want to log. TS will be automatically set if not provided, must be in nanoseconds. Message can be either a string or an object which will be stringified and can be parsed by GrafanaLoki later
     * @param {GrafanaLokiLabels} labels A set of labels defining the stream combining the global labels set during GrafanaLoki init and this method. NOTE: Globals will overwrite locals 
     * @param {any} options Options - not yet implemented 
     * @returns {Boolean} In case of SUCCESS will return TRUE otherwise will return FALSE
     */
    async grafanaLokiPush(entries: Array<GrafanaLokiEntry>, labels?: GrafanaLokiLabels, options?: any): Promise<boolean> {
        //° Connection still connecting
        if (this.grafanaLoki.connection?.status === "connecting") {
            const timeoutMs = 15000;
            const intervallMs = 100;
            const start = Date.now();

            while (this.grafanaLoki.connection.status === "connecting") {
                if (Date.now() - start >= timeoutMs) {
                    if (options?.silent !== true) this.console(`GrafanaLoki: [ansi:yellow]Connection timeout reached[ansi:reset] connecting to "${this.grafanaLoki.hostname}"`, 'warn');
                    this.grafanaLoki.connection = {
                        status: 'error',
                        message: `Connection timeout reached connecting to "${this.grafanaLoki.hostname}"`
                    }
                    return false;
                }

                await new Promise(resolve => setTimeout(resolve, intervallMs));
            }

            // Ab hier ist x !== "connecting"
            this.grafanaLoki.connection.status = 'connected';
        }

        //! No connection setup
        if (Object.keys(this.grafanaLoki).length === 0 || !this.grafanaLoki.connection?.status) {
            if (options?.silent !== true) this.console(`GrafanaLoki: [ansi:red]Cannot push![ansi:reset] No connection setup!`, 'error');
            return false;
        }

        //! Connection is in error state
        if (this.grafanaLoki.connection?.status === "error") {
            if (options?.silent !== true) this.console(`GrafanaLoki: [ansi:red]Cannot push![ansi:reset] Connection error => ${this.grafanaLoki.connection.message}!`, 'error');
            return false;
        }

        //° Empty array -> no entries
        if (entries.length === 0) {
            if (options?.silent !== true) this.console('GrafanaLoki: [ansi:yellow]Nothing to push![ansi:reset] => No records provided in entries!');
            return false;
        }

        //* Init
        const path: string = `/loki/api/v1/push`;
        const payload: any = { streams: [] };
        const appLabels = this.grafanaLoki.labels;
        let streamRecord: any = {};
        let entriesModified: any = [];

        // Merge lebels from function level and app level
        //° Note: keys defined on function level will overwrite keys on app level
        const stream: any = { ...appLabels, ...labels };

        // Find host reference to this and replace with hostname
        if (stream?.host === 'this') {
            const ip = Object.values(os.networkInterfaces()).flat().find(i => i?.family === 'IPv4' && !i.internal)?.address;
            stream.host = `${os.hostname()}[${ip}]`;
        }
        streamRecord.stream = stream;

        // Iterate through entries
        for (let i = 0; i < entries.length; i++) {
            // Fix missing timestamp
            if (!entries[i]!.ts) {
                entries[i]!.ts = `${Date.now() * 1_000_000}`;
            }
            if (typeof entries[i]?.line === 'object') entries[i]!.line = JSON.stringify(entries[i]?.line);

            // To Array
            entriesModified[i] = [`${entries[i]?.ts}`, `${entries[i]?.line}`];

        }
        streamRecord.values = entriesModified;

        // Push to payload
        payload.streams.push(streamRecord);

        try {
            const response: Response = await fetch(`${this.grafanaLoki.hostname}:${this.grafanaLoki.port}${path}`, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.grafanaLokiAuthorizationHeader()
                }
            });

            //* ==> 204 = Successful
            //§ HTTP 204 - no Content appears to be the standard response on success from GrafanaLoki
            if (response.status === 204) {
                if (options?.silent !== true) this.console(`GrafanaLoki: [ansi:green]Successfully pushed![ansi:reset] ==> ${this.grafanaLoki.hostname}:${this.grafanaLoki.port}`, 'okay', { logLevel: 'full' });
                return true;
            }
            //° ==> 4xx Bad response
            else {
                if (options?.silent !== true) this.console(`GrafanaLoki: [ansi:yellow]Bad response while pushing![ansi:reset] ==> ${response.status} ${response.statusText}`, 'warn', { logLevel: 'off' });
                return false;
            }
        }
        catch (error: any) {
            if (options?.silent !== true) this.console(`GrafanaLoki: [ansi:red]Push failed![ansi:reset] ==> ${error.toString()}`, 'error', { logLevel: 'off' });
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
    console(message?: string | object | number, type?: LogType, options?: LogConsoleOptions, object?: any) {
        // Log level control
        if (this.logLevel == 'off' && options?.logLevel != 'off') return false;
        if (this.logLevel == 'minimal' && options?.logLevel != 'off' && options?.logLevel != 'minimal') return false;

        // Init
        let typeTag: any = '';
        let timestamp: string = '';
        let contextId: string | symbol | undefined = options?.context?.id || undefined;
        const contextColor: string = options?.context?.color || this.logBuffer.get(contextId)?.color || 'orange';
        let callerInformation: string | undefined = undefined;
        let memory: string = '';

        // Auto-Handle Object as a message and check message for a string
        if (typeof message === 'object') {
            object = message;
            message = 'Found object in message => object:';
        }
        else if (typeof message === 'number') message = `${message}`;
        else if (typeof message !== 'string') {
            message = `Invalid data type [ansi:red]"${typeof message}"[ansi:reset] for message! Must be either string, number or object`;
            type = 'error';
            if (options) options.logLevel = 'off';
            else options = { logLevel: 'off' };
        }

        /** Check for context and initialize if needed */
        if (contextId) {
            // Init
            const contextMode: string = options?.context?.mode || 'full';

            if (!this.logBuffer.has(contextId)) {
                // Initialize context in log buffer
                this.logBuffer.set(contextId, { title: options?.context?.title, mode: contextMode, color: contextColor, start: performance.now(), end: 0, logs: [] });

                // Define context start element Full Header and push to context in log buffer
                if (contextMode == 'full') {
                    const contextFrame: string = this.replaceAnsi(`[ansi:${contextColor}]╔═══════════════< Context start: ${options?.context?.title || `contextId: ${options?.context?.id?.toString()}`}[ansi:reset]`);
                    this.logBuffer.get(contextId)!.logs.push(`${contextFrame}\n`);
                }

                // Define context start element as small start End Title only and push to context in log buffer
                else if (contextMode == 'startEnd') {
                    const headerStart: string = this.replaceAnsi(`[ansi:${contextColor}]<───────────────| Context start: ${options?.context?.title || `contextId: ${options?.context?.id?.toString()}`}[ansi:reset]`);
                    const headerEnd: string = this.replaceAnsi(`[ansi:${contextColor}] |───────────────>[ansi:reset]`);
                    this.logBuffer.get(contextId)!.logs.push(`${headerStart}${headerEnd}\n`);
                }
            }

            // Update end time - will always be overwritten with the last log
            else this.logBuffer.get(contextId)!.end = performance.now();
        }

        /** Log type badge is off */
        if (this.logTypeBadge === 'off') {
            typeTag = '';
        }

        /** Log type badge is set to use Emoji */
        else if (this.logTypeBadge === 'emoji') {
            // Determine correct emoji from Emoji object to render
            typeTag = Object.entries(this.emoji).find(([k]) => k === type)?.[1];

            // When no matcing emoji could be determined
            if (!typeTag) typeTag = '  '; // No emoji aparently must be 2 blank spaces

            // Add an additional space in the and
            typeTag = `${typeTag} `;
        }

        /** Log type badge is set to tiny or mini */
        else if (this.logTypeBadge === 'tiny' || this.logTypeBadge === 'mini') {
            // Init
            let spacer: string = ' '; // set value for tiny
            if (this.logTypeBadge === 'mini') spacer = '   '; // change for mini

            // Build Tags
            if (type == 'okay') typeTag = `[ansi:green][ansi:inverse]${spacer}`;
            else if (type == 'success') typeTag = `[ansi:green][ansi:inverse]${spacer}`;
            else if (type == 'info') typeTag = `[ansi:cyan][ansi:inverse]${spacer}`;
            else if (type == 'debug') typeTag = `[ansi:blue][ansi:inverse]${spacer}`;
            else if (type == 'warn' || type == 'warning') typeTag = `[ansi:yellow][ansi:inverse]${spacer}`;
            else if (type == 'error') typeTag = `[ansi:red][ansi:inverse]${spacer}`;
            else if (type == 'create' || type == 'add') typeTag = `[ansi:green][ansi:inverse]${spacer}`;
            else if (type == 'remove') typeTag = `[ansi:brightRed][ansi:inverse]${spacer}`;
            else if (type == 'metrics') typeTag = `[ansi:brightMagenta][ansi:inverse]${spacer}`;
            else if (type == 'init') typeTag = `[ansi:orange][ansi:inverse]${spacer}`;
            else if (type == 'finished') typeTag = `[ansi:gray][ansi:inverse]${spacer}`;
            else if (type?.startsWith('custom=')) typeTag = `${type.split('=')[1]}${spacer}`;
            else if (type) typeTag = `${spacer}`;
            else typeTag = spacer;

            // Replace ANSI colors and Styles
            typeTag = this.replaceAnsi(typeTag);

            // Add ANSI reset
            typeTag = typeTag + this.ansi.reset + ' ';
        }

        /** Log type badge is set to full */
        else if (this.logTypeBadge === 'full') {
            // Build Tags
            if (type == 'okay') typeTag = '[ansi:green][ansi:inverse]OKAY';
            else if (type == 'success') typeTag = '[ansi:green][ansi:inverse]SUCCESS';
            else if (type == 'info') typeTag = '[ansi:cyan][ansi:inverse]INFO';
            else if (type == 'debug') typeTag = '[ansi:blue][ansi:inverse]DEBUG';
            else if (type == 'warn' || type == 'warning') typeTag = '[ansi:yellow][ansi:inverse]WARNING';
            else if (type == 'error') typeTag = '[ansi:red][ansi:inverse]ERROR';
            else if (type == 'create') typeTag = '[ansi:green][ansi:inverse]CREATE';
            else if (type == 'add') typeTag = '[ansi:green][ansi:inverse]Add';
            else if (type == 'remove') typeTag = '[ansi:brightRed][ansi:inverse]REMOVE';
            else if (type == 'metrics') typeTag = '[ansi:brightMagenta][ansi:inverse]METRICS';
            else if (type == 'init') typeTag = '[ansi:orange][ansi:inverse]INIT';
            else if (type == 'finished') typeTag = '[ansi:gray][ansi:inverse]FINISHED';
            else if (type?.startsWith('custom=')) typeTag = `${type.split('=')[1]}${type.split('=')[2]}`;
            else if (type) typeTag = '';
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
            const location = this.getCallerLocation(options?.callerInformation?.overwriteCallerStackLevel || this.logCallerCallStackLevel); // Set the level how deep you want look-up the caller. usualy you would be looking for level 2 when initialized in each file and 3 when using a global or one-instance approach
            //* Caller information found
            if (location) {
                let functionInfo: string = '';
                if (location?.function && !options?.callerInformation?.hideFunctionInfo) functionInfo = `[ansi:brightMagenta](Func:${location.function})[ansi:reset]`;
                callerInformation = this.replaceAnsi(`[ansi:blue]${basename(`${location?.file}`)}[ansi:reset]:[ansi:yellow]${location.line}[ansi:reset]${functionInfo}`) + ' ';
            }
            //! No caller information found
            else callerInformation = this.replaceAnsi('[ansi:red]Caller unknown![ansi:reset] ');
            //° Caller information disabled
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
                let contextFrame: string = '';
                let contextMode: string = this.logBuffer.get(contextId)?.mode;

                // Context Frame Full
                if (contextMode == 'full') {
                    // Context frame
                    contextFrame = this.replaceAnsi(`[ansi:${contextColor}]║[ansi:reset] `);
                }

                // Push to log buffer
                this.logBuffer.get(contextId)!.logs.push(`${contextFrame}${typeTag}${timestamp}${memory}${callerInformation}${message}\n`);
            }

            // Send to standard output
            else process.stdout.write(`${typeTag}${timestamp}${memory}${callerInformation}${message}\n`);
        }

        /** Render object to console */
        if (object && typeof object === 'object') {
            // JSON pretty format and use colors - custom colors 
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
            if (contextId) {
                // init
                let contextFrame: string = '';

                // Frame mode Full
                if (!options?.context?.mode || options.context.mode === 'full') {
                    // Context frame
                    contextFrame = this.replaceAnsi(`[ansi:${contextColor}]║[ansi:reset] `);
                }

                const linePrefix: string = `${contextFrame}         `;

                const objectIndented = objectFormatted
                    .split('\n')
                    .map(line => `${linePrefix}${line}`)
                    .join('\n');


                this.logBuffer.get(contextId)!.logs.push(`${objectIndented}\n${linePrefix}${objectInfoMessage}\n`);
            }

            // Send to standard output
            else {
                // Indent object
                const linePrefix: string = `         `;

                const objectIndented = objectFormatted
                    .split('\n')
                    .map(line => `${linePrefix}${line}`)
                    .join('\n');

                process.stdout.write(`${objectIndented}\n${linePrefix}${objectInfoMessage}\n`);
            }
        }

        /** Push to GrafanaLoki */
        if (!options?.grafanaLoki?.doNotPush || options.grafanaLoki.doNotPush !== true) {
            if (this.grafanaLoki?.connection?.status === 'connected' || this.grafanaLoki?.connection?.status === 'connecting') {
                // Init
                let line: any = {};
                let labels: GrafanaLokiLabels = { level: type }

                // Add to line object if valid
                if (message) line.message = this.stripAnsi(message).replaceAll('╭', '').replaceAll('├', '').replaceAll('╰', '').replaceAll('─', '').trim();
                if (object && typeof object === 'object') line.object = object;
                if (options?.context?.id) labels.contextId = options?.context?.id;

                // Push to GrafanaLoki
                this.grafanaLokiPush([{ ts: `${Date.now() * 1_000_000}`, line }], labels, { silent: true });
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
     * @param {FlushOptions} options Options like discarding the logs and not render to console
     * @returns {Boolean} Returns FALSE when context ID cannot found in log buffer, otherwise will return TRUE
     */
    flush(contextId: string, options?: FlushOptions): boolean {
        //! ContextId not found in LogBuffer
        if (!this.logBuffer.has(contextId)) {
            this.console(`Context ID "[ansi:yellow]${contextId}[ansi:reset] does not exist in log buffer!`, 'error', { logLevel: 'off' });
            return false;
        }

        // Init - when ContextID exists
        const contextColor: string = this.logBuffer.get(contextId)?.color || 'orange';

        // Do not render to console when discard is explicitly set
        if (options?.discardContextLog != true) {
            // Iterate through log records
            for (const record of this.logBuffer.get(contextId).logs) {
                process.stdout.write(record);
            }

            // Frame mode Full
            if (!this.logBuffer.get(contextId).mode || this.logBuffer.get(contextId).mode === 'full') {
                // Render context closing frame
                const contextFrame: string = this.replaceAnsi(`[ansi:${contextColor}]╚═══════════════> Context end: ${this.logBuffer.get(contextId).title || `contextID: ${contextId}`}[ansi:reset] | [ansi:magenta]Duration:[ansi:reset] ${this.formatDuration(this.logBuffer.get(contextId).end - this.logBuffer.get(contextId).start)}\n`);
                process.stdout.write(contextFrame);
            }

            // Start End mode
            else if (this.logBuffer.get(contextId).mode === 'startEnd') {
                // Render context closing frame
                const footerStart: string = this.replaceAnsi(`[ansi:${contextColor}]┌───────────────│ Context end:${this.logBuffer.get(contextId).title || `contextID: ${contextId}`}[ansi:reset]\n`);
                const footerEnd: string = this.replaceAnsi(`[ansi:${contextColor}]└───────────────> [ansi:magenta]Duration:[ansi:reset] ${this.formatDuration(this.logBuffer.get(contextId).end - this.logBuffer.get(contextId).start)}\n`);
                process.stdout.write(`${footerStart}${footerEnd}`);
            }
        }

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
        str = str.replace(/\[ansi:(\w+)\]/g, (_, key: keyof typeof this.ansi) => this.ansi[key] || `[ansi:${key}]`);
        return str;
    }

    /**
     * Strip all ANSI code from String and return a clean string
     * @param {String} str Provide a string that may or may not have ANSI code in it 
     * @returns {String} Receive a string stripped by ANSI code
     */
    stripAnsi(str: string): string {
        const ansiRegex =
            // Matches most common ANSI escape sequences
            /[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
        return str.replace(ansiRegex, '');
    }

    /**
     * Replace emoji code to actual emojis in string
     * @param {String} str String to be searched for emoji commands and replace them with actual emojis. 
     * @returns {String} String with actual emoji icons
     */
    replaceEmojis(str: string) {
        str = str.replace(/\[emoji:(\w+)\]/g, (_, key: keyof typeof this.emoji) => this.emoji[key] || `[emoji:${key}]`);
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