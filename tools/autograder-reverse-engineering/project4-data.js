(function initProject4Data(global) {
  const project4Data = {
    TEST_COMMANDS: {
      1: ["LOAD_P3", "LOOKUP_P4"],
      2: ["LOAD_P3", "LOOKUP_P4"],
      3: ["LOAD_P3", "REMOVE_P4", "LOOKUP_P4"],
      4: ["LOAD_P3", "REMOVE_P4"],
      5: ["LOAD_P3", "BUILD_P3", "REMOVE_P4", "LIMITS_P3"],
      6: ["LOAD_P3", "INSERT_P4", "REMOVE_P4", "LOOKUP_P4"],
      7: ["LOAD_P3", "UNKNOWN"],
      8: ["LOAD_P3", "INSERT_P4", "BUILD_P3", "TRACE_P3", "REMOVE_P4", "CLEAN_P4", "LOOKUP_P4"],
      9: ["LOAD_P3", "UNKNOWN"],
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
          text: "LIMITS_P3 highest is called after REMOVE_P4; removing a country must correctly update the tree or LIMITS_P3 will return stale/dead nodes",
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
      ],
      8: [
        { text: "search count does NOT matter; exact post-CLEAN indices do" },
      ],
      9: [
        {
          text: "Does not care about TRACE_P3",
          source: "@cqn1ne",
        },
      ],
    },
    CONTRIBUTORS: ["@axiumin", "@cqn1ne", "@milohmiao", "@theendisnear"],
    KNOWN_EDGE_CASES: [],
    COMMAND_INFO: {
      LOAD_P3: {
        description:
          "Loads all countries from lab2_multidata.csv into the hash table. All P4 test files begin with this command.",
      },
      LIST_P3: {
        description: "Finds a country by name (linear search allowed) and prints its code + all series names.",
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
          "Looks up a country code in the hash table. Outputs 'index X searches Y' on success (Y >= 1 always), or 'failure' if not found.",
      },
      REMOVE_P4: {
        description:
          "Removes a country from the hash table by marking its slot as a tombstone. Also removes from tree if one exists.",
      },
      INSERT_P4: {
        description:
          "Reads a country from lab2_multidata.csv and inserts into hash table. success if not already present, failure if duplicate.",
      },
      CLEAN_P4: {
        description:
          "Rehashes the table: collect occupied entries, sort A→Z by country code, clear all 512 slots, reinsert in sorted order. Always outputs success. Does not affect the tree.",
      },
      UNKNOWN: {
        description:
          "Placeholder for test07 and test09 — confirmed pure P3 regressions but exact commands not yet determined.",
      },
    },
    NEVER_TESTED: ["COUNTRY_MIN_P3"],
  };

  const wattheHex = global.WatTheHex || (global.WatTheHex = {});
  wattheHex.project4Data = project4Data;
})(globalThis);