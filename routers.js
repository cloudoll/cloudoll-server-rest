module.exports = routers = {
    "h1": function(req, res){
        console.log(req.query);
        setTimeout(function (){
            res.end("h1");
        }, 1000);
    },
    "h2": function(req, res){
        console.log(req.query);
        console.log(req.body);
        setTimeout(function (){
            res.end("h2 2 2 2 2 2 2 ");
        }, 1000);

    }
};