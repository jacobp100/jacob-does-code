/* global Worker */
importScripts(require.resolve("/assets/technicalc/dist/worker.min.js"));

Worker.make(self);
