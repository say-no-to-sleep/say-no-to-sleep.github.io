(function initProject5Data(global) {
    const project5Data = {
        TEST_COMMANDS: {
            1: ["LOAD_P3", "INITIALIZE_P5"],
            2: ["LOAD_P3", "INITIALIZE_P5", "ADJACENT_P5"],
            3: ["LOAD_P3", "INITIALIZE_P5", "UPDATE_EDGES_P5"],
            4: ["LOAD_P3", "INITIALIZE_P5", "UPDATE_EDGES_P5"],
            5: ["LOAD_P3", "INITIALIZE_P5", "UPDATE_EDGES_P5", "ADJACENT_P5"],
            6: ["LOAD_P3", "INITIALIZE_P5", "UPDATE_EDGES_P5", "ADJACENT_P5"],
            7: ["LOAD_P3", "INITIALIZE_P5", "UPDATE_EDGES_P5", "ADJACENT_P5"],
            8: ["LOAD_P3", "INITIALIZE_P5", "UPDATE_EDGES_P5", "ADJACENT_P5"],
            9: ["LOAD_P3", "INITIALIZE_P5", "UPDATE_EDGES_P5", "ADJACENT_P5", "PATH_P5"],
            10: ["LOAD_P3", "INITIALIZE_P5", "UPDATE_EDGES_P5", "ADJACENT_P5", "PATH_P5"],
            11: ["LOAD_P3", "INITIALIZE_P5", "UPDATE_EDGES_P5", "RELATIONSHIPS_P5"],
        },
        TEST_NOTES: {
            1: [
                { text: "Known sample input." },
            ],
            2: [
                { text: "Graph remains disconnected after INITIALIZE. ADJACENT_P5 is called on countries that either don't exist in the graph or have no neighbors, hitting both the failure and none output paths." },
            ],
            3: [
                { text: "Only tests that UPDATE_EDGES_P5 succeeds (at least one new relationship added)." },
            ],
            4: [
                { text: "UPDATE_EDGES_P5 produces both success and failure outputs." },
            ],
            5: [
                { text: "ADJACENT_P5 returns real country names (non-empty, non-failure). Graph has at least one pair of connected countries." },
            ],
            6: [
                { text: "Possibly same structure as test 5. ADJACENT_P5 returns real country names." },
            ],
            7: [
                { text: "ADJACENT_P5 is called multiple times: at least once returning none and at least once returning real neighbors. Tests that the graph is only partially connected." },
            ],
            8: [
                { text: "ADJACENT_P5 hits all three output cases in one test: failure, none, and real neighbor names. Most comprehensive ADJACENT test." },
            ],
            9: [
                { text: "PATH_P5 returns true. The two countries queried are connected by a path in the graph." },
            ],
            10: [
                { text: "Same structure as test 9. PATH_P5 also returns true." },
            ],
            11: [
                { text: "Known sample inpu.t" },
            ],
        },
        CONTRIBUTORS: [],
        KNOWN_EDGE_CASES: [
        ],
        COMMAND_INFO: {
            LOAD_P3: {
                description: "Loads all countries from lab2_multidata.csv. Always first, called exactly once.",
            },
            INITIALIZE_P5: {
                description: "Builds the graph nodes with no edges. Called exactly once per file, right after LOAD_P3.",
            },
            UPDATE_EDGES_P5: {
                description: "Adds relationship tuples to edges between qualifying country pairs. success if anything new was added, failure otherwise.",
            },
            ADJACENT_P5: {
                description: "Lists neighbors of a country by code. failure if country not in graph, none if no neighbors.",
            },
            PATH_P5: {
                description: "Checks if two countries are connected by any path. true or false.",
            },
            RELATIONSHIPS_P5: {
                description: "Lists all relationship tuples on the edge between two countries. none if no edge exists.",
            },
        },
        NEVER_TESTED: [],
    };

    const wattheHex = global.WatTheHex || (global.WatTheHex = {});
    wattheHex.project5Data = project5Data;
})(globalThis);