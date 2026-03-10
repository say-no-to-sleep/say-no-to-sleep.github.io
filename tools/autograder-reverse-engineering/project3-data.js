(function initProject3Data(global) {
  const project3Data = {
    TEST_COMMANDS: {
      1: ["LOAD_P3"],
      2: ["LOAD_P3", "LIST_P3"],
      3: ["LOAD_P3", "RANGE_P3"],
      4: ["LOAD_P3", "BUILD_P3"],
      5: ["LOAD_P3", "BUILD_P3", "FIND_P3"],
      6: ["LOAD_P3", "BUILD_P3", "FIND_P3"],
      7: ["LOAD_P3", "LIST_P3", "RANGE_P3", "BUILD_P3", "FIND_P3"],
      8: ["LOAD_P3", "LIST_P3", "RANGE_P3", "BUILD_P3", "DELETE_P3", "FIND_P3"],
      9: ["LOAD_P3", "LIST_P3", "RANGE_P3", "BUILD_P3", "DELETE_P3", "FIND_P3"],
      10: ["LOAD_P3", "BUILD_P3", "LIMITS_P3"],
      11: ["LOAD_P3", "DELETE_P3", "LIMITS_P3"],
      12: ["LOAD_P3", "BUILD_P3", "LIMITS_P3"],
    },
    TEST_NOTES: {
      11: [
        {
          text: "no-tree failure case",
          source: "",
        },
        {
          text: "tests limits_p3 for failure condition",
          source: "@arcnyxx",
        }
      ],
    },
    CONTRIBUTORS: ["@echometer", "@arcnyxx"],
    KNOWN_EDGE_CASES: [
      {
        affectedTests: [7, 8, 9],
        command: "FIND_P3",
        source: "@echometer",
        input: "BUILD_P3 SL.TLF.0714.WK.TM\nFIND_P3 40.3 greater",
        description:
          "I failed test cases 7, 8, & 9 because of this, the output for FIND_P3 should include Cambodia",
      },
    ],
    COMMAND_INFO: {
      LOAD_P3: {
        description: "Loads all countries from lab2_multidata.csv into the countries[512] array",
      },
      LIST_P3: {
        description: "Finds a country by name and prints its code + all series names",
      },
      RANGE_P3: {
        description: "Finds min and max mean across all countries for a given series code",
      },
      BUILD_P3: {
        description: "Builds the interval tree for a given series code",
      },
      FIND_P3: {
        description: "Queries the tree for countries satisfying less/equal/greater than a mean",
      },
      LIMITS_P3: {
        description: "Returns countries in the leftmost (lowest) or rightmost (highest) leaf",
      },
      DELETE_P3: {
        description:
          "Removes a country from all nodes in the tree; removes empty leaves. Test 11 specifically tests the failure case when no tree exists.",
      },
    },
    NEVER_TESTED: ["COUNTRY_MIN_P3", "TRACE_P3"],
  };

  const wattheHex = global.WatTheHex || (global.WatTheHex = {});
  wattheHex.project3Data = project3Data;
})(globalThis);
