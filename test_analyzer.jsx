import { useState } from "react";

const TEST_COMMANDS = {
  1:  ["LOAD_P3"],
  2:  ["LOAD_P3", "LIST_P3"],
  3:  ["LOAD_P3", "RANGE_P3"],
  4:  ["LOAD_P3", "BUILD_P3"],
  5:  ["LOAD_P3", "BUILD_P3", "FIND_P3"],
  6:  ["LOAD_P3", "BUILD_P3", "FIND_P3"],
  7:  ["LOAD_P3", "LIST_P3", "RANGE_P3", "BUILD_P3", "FIND_P3"],
  8:  ["LOAD_P3", "LIST_P3", "RANGE_P3", "BUILD_P3", "DELETE_P3", "FIND_P3"],
  9:  ["LOAD_P3", "LIST_P3", "RANGE_P3", "BUILD_P3", "DELETE_P3", "FIND_P3"],
  10: ["LOAD_P3", "BUILD_P3", "LIMITS_P3"],
  11: ["LOAD_P3", "DELETE_P3", "LIMITS_P3"],
  12: ["LOAD_P3", "BUILD_P3", "LIMITS_P3"],
};

const TEST_NOTES = {
  11: ["no-tree failure case"],
};

const KNOWN_EDGE_CASES = [
  {
    affectedTests: [7, 8, 9],
    command: "FIND_P3",
    source: "@echometer",
    input: "BUILD_P3 SL.TLF.0714.WK.TM\nFIND_P3 40.3 greater",
    description: "I failed test cases 7, 8, & 9 because of this, the output for FIND_P3 should include Cambodia",
  },
];

const COMMAND_INFO = {
  LOAD_P3: {
    description: "Loads all countries from lab2_multidata.csv into the countries[512] array",
    file: "Data.cpp",
    functions: ["Data::loadAllCountries()"],
  },
  LIST_P3: {
    description: "Finds a country by name and prints its code + all series names",
    file: "main.cpp + CountryData.cpp",
    functions: ["CountryData::listCountry()", "CountryData::getCountryName()"],
  },
  RANGE_P3: {
    description: "Finds min and max mean across all countries for a given series code",
    file: "main.cpp + TimeSeries.cpp",
    functions: ["TimeSeries::mean() (via myMean)", "RANGE_P3 loop in main.cpp"],
  },
  BUILD_P3: {
    description: "Builds the interval tree for a given series code",
    file: "IntervalTree.cpp",
    functions: ["IntervalTree constructor", "IntervalTree::buildTree() (recursive)"],
  },
  FIND_P3: {
    description: "Queries the tree for countries satisfying less/equal/greater than a mean",
    file: "IntervalTree.cpp",
    functions: ["IntervalTree::query(double mean, string operation)"],
  },
  LIMITS_P3: {
    description: "Returns countries in the leftmost (lowest) or rightmost (highest) leaf",
    file: "IntervalTree.cpp",
    functions: ["IntervalTree::query(bool highest)"],
  },
  DELETE_P3: {
    description: "Removes a country from all nodes in the tree; removes empty leaves. Test 11 specifically tests the failure case when no tree exists.",
    file: "IntervalTree.cpp",
    functions: ["IntervalTree::remove(string countryName)"],
  },
};

const COMMAND_COLORS = {
  LOAD_P3:   "bg-blue-100 text-blue-800 border-blue-300",
  LIST_P3:   "bg-purple-100 text-purple-800 border-purple-300",
  RANGE_P3:  "bg-yellow-100 text-yellow-800 border-yellow-300",
  BUILD_P3:  "bg-green-100 text-green-800 border-green-300",
  FIND_P3:   "bg-orange-100 text-orange-800 border-orange-300",
  LIMITS_P3: "bg-pink-100 text-pink-800 border-pink-300",
  DELETE_P3: "bg-red-100 text-red-800 border-red-300",
};

export default function App() {
  const [failed, setFailed] = useState(new Set());

  const toggle = (n) => {
    setFailed((prev) => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  };

  const selectAll = () => setFailed(new Set(Object.keys(TEST_COMMANDS).map(Number)));
  const clearAll  = () => setFailed(new Set());

  const commandCounts = {};
  for (const n of failed) {
    for (const cmd of TEST_COMMANDS[n]) {
      if (!commandCounts[cmd]) commandCounts[cmd] = new Set();
      commandCounts[cmd].add(n);
    }
  }

  const suspects = Object.entries(commandCounts)
    .filter(([cmd]) => cmd !== "LOAD_P3" || Object.keys(commandCounts).length === 1)
    .sort((a, b) => b[1].size - a[1].size);

  const loadFailed = commandCounts["LOAD_P3"]?.size > 0 && suspects.length === 0;

  const relevantEdgeCases = KNOWN_EDGE_CASES.filter((ec) =>
    ec.affectedTests.some((t) => failed.has(t))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-mono">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">P3 Test Failure Analyzer</h1>
        <p className="text-gray-500 text-sm mb-6">Select the test cases you failed — see what to fix.</p>

        {/* Test grid */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-600">Failed tests</span>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-blue-600 hover:underline">all</button>
              <span className="text-gray-300">|</span>
              <button onClick={clearAll}  className="text-xs text-gray-400 hover:underline">clear</button>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {Object.keys(TEST_COMMANDS).map(Number).map((n) => {
              const isFailed = failed.has(n);
              return (
                <button
                  key={n}
                  onClick={() => toggle(n)}
                  className={`rounded-lg border-2 py-3 text-sm font-bold transition-all ${
                    isFailed
                      ? "bg-red-500 border-red-600 text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-400"
                  }`}
                >
                  {String(n).padStart(2, "0")}
                </button>
              );
            })}
          </div>
        </div>

        {/* What each failed test contains */}
        {failed.size > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <p className="text-sm font-semibold text-gray-600 mb-3">Commands in failed tests</p>
            <div className="flex flex-col gap-2">
              {[...failed].sort((a, b) => a - b).map((n) => (
                <div key={n} className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-red-500 w-12">test{String(n).padStart(2, "0")}</span>
                  {TEST_COMMANDS[n].map((cmd) => (
                    <span key={cmd} className={`text-xs px-2 py-0.5 rounded border font-semibold ${COMMAND_COLORS[cmd]}`}>
                      {cmd}
                    </span>
                  ))}
                  {(TEST_NOTES[n] || []).map((note) => (
                    <span key={note} className="text-xs text-gray-400 italic">({note})</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Known edge cases */}
        {relevantEdgeCases.length > 0 && (
          <div className="bg-white rounded-xl border border-amber-300 p-4 mb-4">
            <p className="text-sm font-semibold text-amber-700 mb-3">⚠ Known edge cases from other students</p>
            <div className="flex flex-col gap-3">
              {relevantEdgeCases.map((ec, i) => (
                <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded border font-bold ${COMMAND_COLORS[ec.command]}`}>{ec.command}</span>
                    <span className="text-xs text-gray-400">affects tests {ec.affectedTests.map(t => `test${String(t).padStart(2,"0")}`).join(", ")}</span>
                    <span className="text-xs text-gray-400 ml-auto italic">— {ec.source}</span>
                  </div>
                  <pre className="text-xs bg-gray-900 text-green-300 rounded p-2 mb-2 whitespace-pre">{ec.input}</pre>
                  <p className="text-xs text-amber-800">{ec.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnosis */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">
            {failed.size === 0 ? "Select failed tests above" : "Most likely culprits"}
          </p>

          {failed.size === 0 && (
            <p className="text-gray-300 text-sm">Nothing selected yet.</p>
          )}

          {loadFailed && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm font-bold text-blue-800">LOAD_P3 is broken</p>
              <p className="text-xs text-blue-600 mt-1">Data::loadAllCountries() is likely the issue — everything depends on this.</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {suspects.map(([cmd, testSet], i) => {
              const info = COMMAND_INFO[cmd];
              const relatedEdgeCases = KNOWN_EDGE_CASES.filter(
                (ec) => ec.command === cmd && ec.affectedTests.some((t) => failed.has(t))
              );
              return (
                <div key={cmd} className={`rounded-lg border p-3 ${i === 0 ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {i === 0 && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">TOP SUSPECT</span>}
                    <span className={`text-xs px-2 py-0.5 rounded border font-bold ${COMMAND_COLORS[cmd]}`}>{cmd}</span>
                    <span className="text-xs text-gray-400">appears in {testSet.size} failed test{testSet.size > 1 ? "s" : ""}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{info.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {info.functions.map((fn) => (
                      <span key={fn} className="text-xs bg-gray-800 text-green-300 px-2 py-0.5 rounded font-mono">{fn}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">→ {info.file}</p>
                  {relatedEdgeCases.map((ec, j) => (
                    <div key={j} className="mt-2 rounded bg-amber-50 border border-amber-200 p-2">
                      <p className="text-xs text-amber-700 font-semibold mb-1">⚠ Known edge case — {ec.source}</p>
                      <p className="text-xs text-amber-800">{ec.description}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-300 text-center mt-4">Never tested: COUNTRY_MIN_P3, TRACE_P3</p>
      </div>
    </div>
  );
}
