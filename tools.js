module.exports = tools = {
    error: function (errno, message) {
        return JSON.stringify({
            errno: errno,
            message: message
        });
    },

    webok: function (data, message) {
        var res = {errno: 0};
        if (data) {
            res.data = data;
        }
        if (message) {
            res.message = message;
        }
        return JSON.stringify(res);
    }
};