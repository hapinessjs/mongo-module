const debug = require('debug')('hapiness:mongo-module');

export class Debugger {
    private _className: string;

    constructor(classname) {
        this._className = classname;
    }

    private _debug(txt: string): void {
        debug(`${this._className}#${txt}`);
    }

    public debug(method: string, txt: string): void {
        this._debug(`${method} --> ${txt}`);
    }
}
