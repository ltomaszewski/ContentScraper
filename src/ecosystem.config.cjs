module.exports = {
    apps: [
        {
            "name": "CONTENT_FETCHER",
            "script": "dist/index.js",
            "args": "--runmode=producation",
            "exp_backoff_restart_delay": 10000,
            "watch": true
        }
    ]
};
