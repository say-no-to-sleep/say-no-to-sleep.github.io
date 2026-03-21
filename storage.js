(function () {
  "use strict";

  const DATABASE_NAME = "watthehex";
  const DATABASE_VERSION = 1;
  const STORE_NAME = "entries";

  let dbPromise;

  function openDatabase() {
    if (!("indexedDB" in globalThis)) {
      return Promise.reject(new Error("IndexedDB is not available in this browser."));
    }

    if (dbPromise) {
      return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.addEventListener("upgradeneeded", () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      });

      request.addEventListener("success", () => {
        resolve(request.result);
      });

      request.addEventListener("error", () => {
        reject(request.error || new Error("Failed to open IndexedDB."));
      });
    });

    return dbPromise;
  }

  function runTransaction(mode, executor) {
    return openDatabase().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);

        executor(store, resolve, reject);

        transaction.addEventListener("error", () => {
          reject(transaction.error || new Error("IndexedDB transaction failed."));
        });
      });
    });
  }

  function init() {
    return openDatabase().then(() => undefined);
  }

  function get(key) {
    return runTransaction("readonly", (store, resolve, reject) => {
      const request = store.get(key);

      request.addEventListener("success", () => {
        resolve(request.result ? request.result.value : null);
      });

      request.addEventListener("error", () => {
        reject(request.error || new Error("Failed to read from IndexedDB."));
      });
    });
  }

  function set(key, value) {
    return runTransaction("readwrite", (store, resolve, reject) => {
      const request = store.put({ key, value, updatedAt: new Date().toISOString() });

      request.addEventListener("success", () => {
        resolve(value);
      });

      request.addEventListener("error", () => {
        reject(request.error || new Error("Failed to write to IndexedDB."));
      });
    });
  }

  function remove(key) {
    return runTransaction("readwrite", (store, resolve, reject) => {
      const request = store.delete(key);

      request.addEventListener("success", () => {
        resolve(undefined);
      });

      request.addEventListener("error", () => {
        reject(request.error || new Error("Failed to delete from IndexedDB."));
      });
    });
  }

  function list(prefix = "") {
    return runTransaction("readonly", (store, resolve, reject) => {
      const entries = [];
      const request = store.openCursor();

      request.addEventListener("success", () => {
        const cursor = request.result;

        if (!cursor) {
          resolve(entries);
          return;
        }

        if (!prefix || String(cursor.key).startsWith(prefix)) {
          entries.push({
            key: cursor.value.key,
            value: cursor.value.value
          });
        }

        cursor.continue();
      });

      request.addEventListener("error", () => {
        reject(request.error || new Error("Failed to list IndexedDB entries."));
      });
    });
  }

  function applyViewportOverflowClip() {
    if (!document.documentElement || !document.body) {
      return;
    }

    if (!globalThis.CSS || !CSS.supports("overflow-x", "clip")) {
      return;
    }

    document.documentElement.style.overflowX = "clip";
    document.body.style.overflowX = "clip";
  }

  function initViewportOverflowClip() {
    applyViewportOverflowClip();

    if ("requestAnimationFrame" in globalThis) {
      requestAnimationFrame(() => {
        applyViewportOverflowClip();
      });
    }

    globalThis.addEventListener("pageshow", applyViewportOverflowClip);
  }

  initViewportOverflowClip();

  window.WatTheHex = window.WatTheHex || {};
  window.WatTheHex.storage = {
    init,
    get,
    set,
    remove,
    list
  };
})();
