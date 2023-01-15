/**
 * Environment: name storage.
 */

class Environment {
    /**
     * Creates an environment with the given record.
     */
    constructor(record = {}) {
        this.record = record;
    }

    /**
     * Create a variable with the given name and value.
     */
    define(name, value) {
        this.record[name] = value;
        return value;
    }
}

module.exports = Environment;