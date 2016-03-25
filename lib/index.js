'use strict';

var hoek = require('hoek');
var util = require('util');

exports.name = 'HTTP Forwarder';
exports.version = '1.0.0';

var internals = {};

internals.defaults = {
    from: 'http',
    to: 'https',
    auth: false
};

exports.register = function (server, opts, next) {
    var settings = hoek.applyToDefaults(internals.defaults, opts);
    var origin = server.select(settings.from);
    var destination = server.select(settings.to);
    if (origin.connections.length > 0 && destination.connections.length > 0 && origin.connections[0] !== destination.connections[0]) {
        server.log(['HTTP Redirector', 'plugin', 'info'], util.format('Redirecting requests from %s to %s', origin.connections[0].info.uri, destination.connections[0].info.uri));
        origin.route({
            method: 'GET',
            path: '/{path*}',
            config: {
                auth: settings.auth,
                handler: function (req, reply) {
                    reply().redirect(util.format('%s://%s:%d/%s', destination.connections[0].info.protocol, req.info.host.split(':')[0], destination.connections[0].info.port, req.params.path || ''));
                }
            }
        });
    }
    next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};