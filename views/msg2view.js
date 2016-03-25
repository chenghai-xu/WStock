function view_user(req){
    var user = {auth: req.isAuthenticated(), account: 'anonymous'};
    if(req.isAuthenticated()){
        user.account=req.user.account;
    }
    return user;
}

function view_json(req){
    var json={};
    json.user=view_user(req);
    return json;
}
module.exports = {
    msg: view_json
};

