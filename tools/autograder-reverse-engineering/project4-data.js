(function initProject4Data(global) {
  const project4Data = {
    TEST_COMMANDS: {
      1: ["LOAD_P3", "LOOKUP_P4"],
      2: ["LOAD_P3", "LOOKUP_P4"],
      3: ["LOAD_P3", "REMOVE_P4", "LOOKUP_P4"],
      4: ["LOAD_P3", "REMOVE_P4"],
      5: ["LOAD_P3", "BUILD_P3", "REMOVE_P4", "LIMITS_P3"],
      6: ["LOAD_P3", "INSERT_P4", "REMOVE_P4", "LOOKUP_P4"],
      7: ["LOAD_P3", "LIST_P3"],
      8: ["LOAD_P3", "INSERT_P4", "BUILD_P3", "TRACE_P3", "REMOVE_P4", "CLEAN_P4", "LOOKUP_P4"],
      9: ["LOAD_P3", "RANGE_P3", "BUILD_P3", "DELETE_P3", "FIND_P3"],
    },
    TEST_NOTES: {
      1: [
        { text: "success-path LOOKUPs only; has collisions (searches > 1)" },
      ],
      2: [
        { text: "failure-path LOOKUPs only; no successful lookups" },
      ],
      3: [
        { text: "has collisions (searches > 1); has failure LOOKUPs" },
      ],
      5: [
        {
          text: "test 5 is deleting a country with a tree present, there might be more though",
          source: "@theendisnear",
        },
        {
          text: "LIMITS_P3 highest is called after REMOVE_P4; removing a country must correctly update the tree (delete empty leaf nodes) or LIMITS_P3 will return stale/dead nodes",
        },
      ],
      7: [
        {
          text: "Does not care about TRACE_P3",
          source: "@cqn1ne",
        },
        {
          text: "Does not care about tree, only uses the array",
          source: "@cqn1ne",
        },
        {
          text: "Pure P3 regression. Exclusively tests LIST_P3 to ensure the underlying data structures can still be scanned and formatted correctly after loading.",
        },
      ],
      8: [
        { text: "search count does NOT matter; exact post-CLEAN indices do" },
      ],
      9: [
        {
          text: "Does not care about TRACE_P3",
          source: "@cqn1ne",
        },
        {
          text: "Comprehensive P3 regression. Tests RANGE_P3, then builds a tree to test the old DELETE_P3 command (not REMOVE_P4), and follows up with FIND_P3 to ensure tree integrity.",
        },
      ],
    },
    CONTRIBUTORS: ["@axiumin", "@cqn1ne", "@milohmiao", "@theendisnear"],
    KNOWN_EDGE_CASES: [
      {
        affectedTests: [5],
        command: "REMOVE_P4",
        source: "",
        input: "BUILD_P3 SeriesCode\nREMOVE_P4 CountryCode\nLIMITS_P3 highest",
        description:
          "If the country removed was the only one in its leaf, the leaf must be deleted and parent pointers nullified. Failing to prune causes LIMITS_P3 to return a blank line.",
      },
      {
        affectedTests: [9],
        command: "DELETE_P3",
        source: "",
        input: "LOAD_P3\nRANGE_P3 SeriesCode\nBUILD_P3 SeriesCode\nDELETE_P3 CountryName",
        description:
          "Test 9 checks Project 3 regressions specifically. Ensure that the old DELETE_P3 (which takes a Name) still functions correctly alongside the new REMOVE_P4 (which takes a Code).",
      },
    ],
    COMMAND_INFO: {
      LOAD_P3: {
        description:
          "Loads all countries from lab2_multidata.csv into the hash table. All P4 test files begin with this command. [cite: 7, 8]",
      },
      LIST_P3: {
        description: "Finds a country by name (linear search allowed) and prints its code + all series names. [cite: 81]",
      },
      RANGE_P3: {
        description: "Finds min and max mean across all countries for a given series code.",
      },
      BUILD_P3: {
        description: "Builds the interval tree for a given series code.",
      },
      FIND_P3: {
        description: "Queries the tree for countries satisfying less/equal/greater than a mean.",
      },
      LIMITS_P3: {
        description: "Returns countries in the leftmost (lowest) or rightmost (highest) leaf.",
      },
      DELETE_P3: {
        description: "Removes a country by name from the tree. Failure if no tree exists.",
      },
      TRACE_P3: {
        description: "Prints left/right interval of every node from root to leaf for a given country.",
      },
      COUNTRY_MIN_P3: {
        description: "Returns the series code with the smallest mean for a given country code.",
      },
      LOOKUP_P4: {
        description:
          "Looks up a country code in the hash table. Outputs 'index X searches Y' on success (Y >= 1 always), or 'failure' if not found. [cite: 91]",
      },
      REMOVE_P4: {
        description:
          "Removes a country from the hash table by marking its slot as a tombstone. Also removes from tree if one exists. [cite: 42, 91]",
      },
      INSERT_P4: {
        description:
          "Reads a country from lab2_multidata.csv and inserts into hash table. success if not already present, failure if duplicate. [cite: 91]",
      },
      CLEAN_P4: {
        description:
          "Rehashes the table: collect occupied entries, sort A→Z by country code, clear all 512 slots, reinsert in sorted order. Always outputs success. Does not affect the tree. [cite: 57, 60, 64, 65, 93]",
      },
    },
    NEVER_TESTED: ["COUNTRY_MIN_P3"],
  };

  const wattheHex = global.WatTheHex || (global.WatTheHex = {});
  wattheHex.project4Data = project4Data;
})(globalThis);