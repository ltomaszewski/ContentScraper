// Enumeration representing different environment modes: Development and Production
export enum Env {
    Dev = 'DEV_',
    Prod = ''
}

// DatabaseHost - the hostname of the RethinkDB server
export const DatabaseHost = '192.168.50.101';
// DatabasePort - the port number of the RethinkDB server
export const DatabasePort = 28015;
// DatabaseForceDrop - indicates whether the database should be forcefully dropped (true/false)
export const DatabaseForceDrop = false;

export const baseDatabaseName = "CONTENT_FETCHER";
export const baseNewsAggregatorDatabaseName = "NEWS_AGGREGATOR";

function getEnvVar(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

export interface ProcessEnv {
    NARF_AI_KEY: string;
}

export const dotEnv: ProcessEnv = {
    NARF_AI_KEY: getEnvVar('NARF_AI_KEY')
};