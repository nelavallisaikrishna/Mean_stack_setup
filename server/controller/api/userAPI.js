var Users = require('../../model/Users');
var passport = require('passport');
//var
// var OTP = require('../../model/OTP');
// var emailLib = require('./emailAPI');
var bcrypt = require('bcryptjs');
var _ = require('lodash');

function createUserAPI(req, res) {
    var createUser = new Users(req.body);
    console.log('req ----------' + JSON.stringify(createUser));
    getUserByUsername(req, function (userExistsRes) {
        if (userExistsRes.result == false) {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(createUser.password, salt, function (err, hash) {
                    createUser.password = hash;
                    createUser.userType = "CUSTOMER";
                    createUser.status = "ACTIVE";
                    createUser.save(function (err, result) {
                        res.json({result: result, status: true});
                    });
                });
            });
        } else {
            userExistsRes.status = false;
            res.json(userExistsRes);
        }
    });
}


function getUserByUsername(req, res) {
    var loginDetail = {
        'username': req.body.username
    };
    Users.findOne(loginDetail, function (req, results) {
        if (results !== null) {
            res({result: 'User Already exists', status: true});
        } else {
            res({result: false, status: false});
        }
    })
}
function _comparePassword(requestPassword, user, cb) {
    bcrypt.compare(requestPassword, user.password, cb);
}

function loginUserPOST(req, res) {
    console.log('req -----------' + JSON.stringify(req.body));
    var loginDetail = {
        'username': req.body.username
    };
    var errMsgs = [],
        focus = null;

    function _sendError(err) {
        if (!errMsgs.length) {
            errMsgs.push(err.message);
        }
        cb(err, {
            focus: focus,
            form: _.omit(req.body, 'password'),
            messages: errMsgs
        });
    }

    // Validation.
    if (_.isEmpty(req.body.username)) {
        errMsgs.push('<strong>Username</strong> is required.');
        focus = focus || 'username';
    } else if (/ /.test(req.body.username)) {
        errMsgs.push('<strong>Username</strong> cannot have a space.');
        focus = focus || 'username';
    }

    if (_.isEmpty(req.body.password)) {
        errMsgs.push('<strong>Password</strong> is required.');
        focus = focus || 'password';
    } else if (/ /.test(req.body.password)) {
        errMsgs.push('<strong>Password</strong> cannot have a space.');
        focus = focus || 'password';
    }

    // Return error.
    if (errMsgs.length) {
        return _sendError(new Error(S(errMsgs[0] || '').stripTags().s));
    }

    // Transform data.
    req.body.username = (req.body.username || '').toLowerCase();

    // Authentication.
    Users.findOne(loginDetail, function (errUser, results) {
        if (results !== null) {
            _comparePassword(req.body.password, results, function (err, comparedRes) {
                if (comparedRes) {
                    var userData = Users.getSafeJSON(results);
                    res.json({result: userData, status: true});
                } else {
                    res.json({result: 'Password Wrong', status: false});
                }
            });
        } else {
            res.json({result: 'User not found', status: false});
        }
    });
}

function getUserByEmailUser(req,res){
   var query = {
       email : req.body.email
   };
   Users.findOne(query, function (errUser, results) {
       if (results !== null) {
           var userData = Users.getSafeJSON(results);
           res.json({result: userData, status: true});
       } else {
           res.json({result: 'User not found', status: false});
       }
   });
}

function updateAdress(req, res) {
    var result = {
        response : [],
        status : false
    };

  if(req.body.action === 'UPDATE'){
        var query = {_id : req.body.address.id};
      Users.findOne(query,function (err, response) {
            if (response !== null) {

                if(req.body.address.address){
                    response.address.fullAddress = req.body.address.address;
                }
                response.save(function (err, response) {
                    if (response !== null) {
                        result.response = response;
                        result.status = true;
                        res.json(result);
                    } else {
                        res.json(result);
                    }
                });
            } else {
                res.json(result);
            }
        })
    }
}

function forgotPassword(req,res) {
    var result = {
        response : [],
        status : false
    };

    if(req.body.action === 'CREATE'){
        var userFindQuery={
            email: req.body.email
        };
        Users.findOne(userFindQuery,function (err, response) {
            if (response !== null) {
                var passCode = Math.floor(1000 + Math.random() * 9000);
                var data={
                    passCode: passCode,
                    email: req.body.email,
                    otpSource : 'DELI_FORGET_PASSWORD'
                };
                OTP.create(data, function (err, OTP) {
                    if(!err){
                        emailLib.sendOtp(data,function(emailReponse){
                            if(emailReponse.status){
                                result.status = true;
                            }
                            res.json(result);
                        })
                    }else{
                        result.errorMessage = 'Error in Otp';
                        res.json(result);
                    }
                });
            } else {
                result.errorMessage = 'User Not Found';
                res.json(result);
            }
        })

    }else if(req.body.action === 'VERIFY'){
        var verifyData = {
            email :  req.body.email,
            otpSource : 'DELI_FORGET_PASSWORD',
            passCode : req.body.otp
        };
        OTP.find(verifyData, function (err, OTP) {
            if(err || OTP == null){
                result.errorMessage = 'OTP Not Found';
                res.json(result);
            }else{
                var query = {
                    email : req.body.email
                };
                Users.findOne(query, function (errUser, userData) {
                    if (userData !== null) {
                        bcrypt.genSalt(10, function (err, salt) {
                            bcrypt.hash(req.body.password, salt, function (err, hash) {
                                userData.password = hash;
                                userData.save(function (err, newDataresult) {
                                    if(!err){
                                        result.status = true;
                                        result.message = 'Password Changed';

                                    }else{
                                        result.message = 'Password Changed Issue';
                                    }
                                    res.json(result);
                                });
                            });
                        });
                    } else {
                        res.json({result: 'User not found', status: false});
                    }
                });

            }
        });
    }else{
        result.errorMessage = 'action  not Found';
        res.json(result);
    }

}


module.exports.createUser = createUserAPI;
module.exports.loginUser = loginUserPOST;
module.exports.getUserByEmailUser = getUserByEmailUser;
module.exports.updateAdress = updateAdress;
module.exports.forgotPassword = forgotPassword;

// module.exports.sendOtp = sendOtp;

