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
                { text: "Known sample input. No UPDATE_EDGES_P5 calls." },
            ],
            2: [
                { text: "No UPDATE_EDGES_P5 calls — graph remains totally disconnected. ADJACENT_P5 hits both the failure and none output paths." },
            ],
            3: [
                { text: "Exactly 1 UPDATE_EDGES_P5 call, outputs success." },
            ],
            4: [
                { text: "Exactly 2 UPDATE_EDGES_P5 calls. Call 1 outputs success, call 2 outputs failure (either duplicate relationship or no countries qualify)." },
            ],
            5: [
                { text: "Exactly 1 UPDATE_EDGES_P5 call. ADJACENT_P5 returns real country names." },
            ],
            6: [
                { text: "Exactly 2 UPDATE_EDGES_P5 calls. ADJACENT_P5 returns real country names." },
            ],
            7: [
                { text: "Exactly 2 UPDATE_EDGES_P5 calls. ADJACENT_P5 is called multiple times: at least once returning none and at least once returning real neighbors." },
            ],
            8: [
                { text: "ADJACENT_P5 hits all three output cases in one test: failure, none, and real neighbor names. Most comprehensive ADJACENT test." },
            ],
            9: [
                { text: "Exactly 2 UPDATE_EDGES_P5 calls. ADJACENT_P5 returns real neighbors. PATH_P5 returns true." },
            ],
            10: [
                { text: "At least 3 UPDATE_EDGES_P5 calls (exact count unknown). ADJACENT_P5 returns real neighbors. PATH_P5 returns true." },
            ],
            11: [
                { text: "Known sample input. Exactly 2 UPDATE_EDGES_P5 calls with different thresholds on the same series. RELATIONSHIPS_P5 called on the same pair twice and on a pair with no edge (outputs none)." },
            ],
        },
        CONTRIBUTORS: ["@echometer"],
        KNOWN_EDGE_CASES: [
            {
                affectedTests: [2, 5, 6, 7, 8, 9, 10],
                command: "ADJACENT_P5",
                source: "@echometer",
                input: "",
                description: "ADJACENT_P5 should not output the country it is called on.",
            },
            {
                affectedTests: [6, 7, 8, 10],
                command: "UPDATE_EDGES_P5",
                source: "Anonymous",
                input: "UPDATE_EDGES_P5 SeriesCode threshold relation",
                description:
                    "(P3 Bug) The IntervalTree query must explore both subtrees when the threshold falls within a node's range, not just tunnel down one branch. Greedy single-path traversal skips valid countries in the opposite subtree, causing edges to be missing and downstream ADJACENT_P5 and PATH_P5 to return wrong results.",
            },
            {
                affectedTests: [4],
                command: "UPDATE_EDGES_P5",
                source: "@echometer",
                input: "",
                description: "Call 1 succeeds, call 2 fails. The failure on call 2 is likely a duplicate relationship (same series/threshold/relation combo) or a combo where no countries qualify. Tuple equality uses == on all three components, not tolerance.",
            },
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
