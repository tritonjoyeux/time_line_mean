const path = require("path");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));

let posts = [];

io.on('connection', socket => {

    const currentUser = {
        pseudo: null
    };

    socket.on('login', pseudo => {
        currentUser.pseudo = pseudo;

        socket.emit('postList', posts);

        socket.on('getId', () => {
            socket.emit("id", guid());
        });

        socket.on('post', (post) => {
            posts.push(post);
            socket.broadcast.emit('post', post)
        });

        socket.on('deletePost', (objSend) => {
            for (var i = 0; i < posts.length; i++) {
                var obj = posts[i];
                if (obj.id === objSend.id) {
                    posts.splice(i, 1);
                }
            }
            socket.broadcast.emit('deletePost', objSend);
        });

        socket.on('likePost', (params) => {
            for (var i = 0; i < posts.length; i++) {
                var obj = posts[i];
                if (obj.id === params.obj.id) {
                    if (posts[i].like.indexOf(params.pseudo) === -1) {
                        posts[i].like.push(params.pseudo);
                    }else {
                        posts[i].like.splice(posts[i].like.indexOf(params.pseudo), 1);
                    }
                    socket.broadcast.emit('postIsLike', {obj: params.obj, pseudo: params.pseudo});
                }
            }
        });

        socket.on('dislikePost', (params) => {
            for (var i = 0; i < posts.length; i++) {
                var obj = posts[i];
                if (obj.id === params.obj.id) {
                    if (posts[i].dislike.indexOf(params.pseudo) === -1) {
                        posts[i].dislike.push(params.pseudo);
                    }else {
                        posts[i].dislike.splice(posts[i].dislike.indexOf(params.pseudo), 1);
                    }
                    socket.broadcast.emit('postIsDislike', {obj: params.obj, pseudo: params.pseudo});
                }
            }
        });
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Le serveur écoute sur le port ${port}`));


// stackoverflow
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}