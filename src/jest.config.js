module.exports = {
    roots: ["tests"],
    transform: {
        "^.+\\.ts?$": "ts-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)$",
    moduleFileExtensions: ["ts", "js", "json", "node"],
    collectCoverage: true
};