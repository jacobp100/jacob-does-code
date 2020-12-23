/* global Worker */

// HACK - technicalc/dist is compiled with webpack's umd, but doesn't work in web workers
self.window = self;

importScripts("/assets/technicalc/dist/worker.js");

Worker.make(self);
