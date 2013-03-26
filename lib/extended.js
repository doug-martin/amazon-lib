module.exports = require("extended")()
    .register(require("object-extended"))
    .register(require("promise-extended"))
    .register(require("is-extended"))
    .register("declare", require("declare.js"));