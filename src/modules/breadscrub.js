/**
 * ALIAS: breadscrub.js -> breadcrumb.js
 * Purpose: Direct alias for Breadcrumb module
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./breadcrumb'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = require('./breadcrumb');
  } else {
    root.ArcadeBreadcrumb = root.ArcadeBreadcrumb || factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  return (typeof ArcadeBreadcrumb !== 'undefined') ? ArcadeBreadcrumb : {};
});
