module.exports = (server) => {
    /*
    Initialize Socket IO Connection
    */
    const io = require('socket.io').listen(server);

    io.on('connect', onConnect);

    function onConnect(socket){
        socket.on('disconnect', () => console.log('disconnect ' + socket.id));
    }
    return io;
};
