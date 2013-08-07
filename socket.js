var socketio = require('socket.io');

module.exports = function (server) {
    return socketio.listen(server);
};