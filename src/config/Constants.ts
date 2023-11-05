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
export const DatabaseForceDrop = true;

export const baseDatabaseName = "CONTENT_FETCHER";
export const baseNewsAggregatorDatabaseName = "NEWS_AGGREGATOR";