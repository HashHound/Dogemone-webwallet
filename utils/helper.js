"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = debounce;
// utils/helper.ts
function debounce(func, delay) {
    var timer;
    return function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timer);
        timer = setTimeout(function () { return func.apply(_this, args); }, delay);
    };
}
