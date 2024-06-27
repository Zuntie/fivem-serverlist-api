function Log(type, msg) {
    if (type === '') {
        console.log(msg);
        return;
    }
    console[type](type + ' | ' + msg);
}

module.exports = Log;