/**
 * Type Definitions
 * File holds all type definitions required for TypeScript support for the Loggify project
 * Note: The assets imported from ansi file and emojis files are required, since some of the types are dynamically built
 */

/** Import assets to dynamically build types */
import { ansiCodes } from './ansi';
import { emojis } from './emojis';

/**
 * LogLevel defines how detailed the log information will be
 * - 'off' = no logs at all (only errors)
 * - 'minimal' = only important logs
 * - 'full' = all logs
 */
export type LogLevel = 'off' | 'minimal' | 'full';

/** Timestamp mode for logging */
export type LogTimestampMode = 'time' | 'dateTime';

/** Context modes for context presentation */
export type ContextMode = 'off' | 'startEnd' | 'full';

/**
 * Control the timestamp logging by either enabling or disabling it or decide whether you want time only be logged to
 * save some space or go with the full date and time
 */
export interface LogTimestampOptions {
    enabled?: boolean;            // optional
    mode?: LogTimestampMode;      // optional 'time' | 'dateTime'
}

/**
 * Options for console logs. Control specificly wheter to hide the timestamp in this particular output, join an output 
 * to a context or provide metrics for a standardized way of presenting durations
 */
export interface LogConsoleOptions {
    // Timestamp
    timestamp?: boolean;

    // Log Level
    logLevel?: LogLevel;

    // Custom caller stack level
    callerInformation?: {
        overwriteCallerStackLevel?: number;
        hideFunctionInfo?: boolean;
    }

    // Context
    context?: {
        id?: string | symbol;
        title?: string;
        mode?: ContextMode;
        color?: AnsiColorCodesOnlyDynamicTypes;
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

    // GrafanaLoki
    grafanaLoki?: {
        doNotPush?: boolean;
        levelOverwrite?: string;
        labels?: GrafanaLokiLabels;
    }
}

/** Fixed or static log types  */
export type FixedLogTypes = 'none' | 'okay' | 'success' | 'info' | 'debug' | 'warn' | 'warning' | 'error' | 'metrics';

/** Dynamically build types based on the ansi code object  */
export type AnsiCodeDynamicTypes = keyof typeof ansiCodes;
export type AnsiColorCodesOnlyDynamicTypes = Exclude<keyof typeof ansiCodes, 'reset' | 'bold' | 'dim' | 'italic' | 'underline' | 'inverse' | 'hidden' | 'strikethrough'>;

/** Dynamically build types based on the emoji object */
export type EmojiDynamicTypes = keyof typeof emojis;

/** Build a custom type with static start and dynamic end */
export type CustomLogTypes = `custom=${string}`; // e.g. 'custom=TRIGGER', 'custom=IMPORT'
export type LogType = FixedLogTypes | EmojiDynamicTypes | CustomLogTypes;

/** Connection status */
export type ConnectionStatus = undefined | 'connecting' | 'connected' | 'error';

/** LogTypeBadge */
export type LogTypeBadge = 'off' | 'emoji' | 'tiny' | 'mini' | 'full';

/** Constructor options */
export interface ConstructorOptions {
    initSilent?: boolean;
    loglevel?: LogLevel;
    logTypeBadge?: LogTypeBadge;
    logTimestamp?: LogTimestampOptions;
    logCallerInformation?: boolean;
    defaultCallerCallStackLevel?: number;
    logMemoryUsage?: boolean;
    grafanaLoki?: GrafanaLoki;
}

/** Flush Options */
export interface FlushOptions {
    discardContextLog?: boolean;
}

/** Object size response */
export interface ObjectSizeResponse {
    size: string;
    bytes: number;
    chars: number;
}

/** Grafana Loki Object */
export interface GrafanaLoki {
    isSecure?: boolean;
    hostname?: string;
    port?: number;
    path?: string;
    labels?: GrafanaLokiLabels;
    auth?: {
        type?: AuthType;
        user?: string;
        pass?: string;
        bearerToken?: string;
    }
    connection?: {
        status?: ConnectionStatus;
        message?: string;
    }
    serverInfo?: {
        connectionTested?: boolean;
        version?: string;
        revision?: string;
        branch?: string;
        buildUser?: string;
        buildDate?: string;
        goVersion?: string;
    }
}

/** Auth Token  */
export type AuthType = 'none' | 'basic' | 'bearer';

/** Grafana Loki Entry structure */
export interface GrafanaLokiEntry {
    ts?: string;
    line: any;
}

/** Grafana Loki Label structure - only flat object with key-value-pairs as string */
export type GrafanaLokiLabels = Partial<{
    app: string;
    job: string;
    env: string;
    level: string;
    host: string;
}> & {
    [key: string]: any;
};