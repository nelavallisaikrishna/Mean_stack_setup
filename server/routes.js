var requireDir = require('require-dir');
var controllers = requireDir('./controller/api');

module.exports.register = function (router) {
    console.log('going to  --------- routes');

    // router.route('/registerUser').post(controllers.userAPI.createUser);
    // router.route('/login').post(controllers.userAPI.loginUser);
    // router.route('/getUserByEmailUser').post(controllers.userAPI.getUserByEmailUser);

};