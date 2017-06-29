angular.module('timeLineApp', []).controller('timeLineController', ['$scope', function ($scope) {
    var timeLine = this;
    timeLine.isDisconnected = true;
    timeLine.pseudo = "";
    timeLine.picture = "";
    timeLine.content = "";
    timeLine.socket = io('ws://localhost:3000');
    timeLine.posts = [];

    let imgDefault = [
        "https://www.buzz2000.com/coloriage/plante-aromatique/coloriage-plante-aromatique-19208.jpg",
        "http://data-cache.abuledu.org/256/dessin-de-chauve-souris-566acf40.jpg",
        "http://data-cache.abuledu.org/256/telephone-52d86074.jpg",
        "https://blogdunecrevetteencolere.files.wordpress.com/2015/03/crevettepirate6.png",
        "http://data-cache.abuledu.org/256/dessin-de-toile-d-araignee-566b182d.jpg"
    ];

    timeLine.loginUser = function () {
        timeLine.isDisconnected = false;
        timeLine.socket.emit('login', timeLine.pseudo);

        //list of posts
        timeLine.socket.on('postList', function (list) {
            timeLine.posts = list.reverse();
            $scope.$apply();
        });

        //new post from people
        timeLine.socket.on('post', function (post) {
            timeLine.posts.unshift(post);
            $scope.$apply();
        });

        //get new id for post and then send post
        timeLine.socket.on("id", (id) => {
            var currentPost = {
                id: id,
                pseudo: timeLine.pseudo,
                url: timeLine.picture,
                content: timeLine.content,
                date: new Date(),
                like: [],
                dislike: [],
                displayLike: false
            };

            currentPost.url = currentPost.url === '' ? imgDefault[Math.floor(Math.random() * imgDefault.length)] : currentPost.url;
            timeLine.posts.unshift(currentPost);
            timeLine.content = "";
            timeLine.picture = "";

            timeLine.socket.emit('post', currentPost);
            $scope.$apply();
        });

        //delete post
        timeLine.socket.on('deletePost', (objSend) => {
            for (var i = 0; i < timeLine.posts.length; i++) {
                var obj = timeLine.posts[i];
                if (obj.id === objSend.id) {
                    timeLine.posts.splice(i, 1);
                }
            }
            $scope.$apply();
        });

        timeLine.socket.on('postIsLike', (params) => {
            for (var i = 0; i < timeLine.posts.length; i++) {
                var obj = timeLine.posts[i];
                if (obj.id === params.obj.id) {
                    if (timeLine.posts[i].like.indexOf(params.pseudo) === -1) {
                        timeLine.posts[i].like.push(params.pseudo);
                    }else {
                        timeLine.posts[i].like.splice(obj.like.indexOf(params.pseudo), 1);
                    }
                }
            }
            $scope.$apply();
        });

        timeLine.socket.on('postIsDislike', (params) => {
            for (var i = 0; i < timeLine.posts.length; i++) {
                var obj = timeLine.posts[i];
                if (obj.id === params.obj.id) {
                    if (timeLine.posts[i].dislike.indexOf(params.pseudo) === -1) {
                        timeLine.posts[i].dislike.push(params.pseudo);
                    }else {
                        timeLine.posts[i].dislike.splice(obj.dislike.indexOf(params.pseudo), 1);
                    }
                }
            }
            $scope.$apply();
        });
    };

    //submit form post
    timeLine.post = function () {
        if (timeLine.content.trim() === '' && timeLine.picture.trim() === '')return;
        timeLine.socket.emit("getId");
    };

    //ng-click delete post
    timeLine.deletePost = function (id) {
        for (var i = 0; i < timeLine.posts.length; i++) {
            var obj = timeLine.posts[i];
            if (obj.id === id) {
                timeLine.socket.emit('deletePost', obj);
                timeLine.posts.splice(i, 1);
            }
        }
    };

    timeLine.likePost = function (id) {
        for (var i = 0; i < timeLine.posts.length; i++) {
            var obj = timeLine.posts[i];
            if (obj.id === id) {
                if (obj.like.indexOf(timeLine.pseudo) === -1) {
                    timeLine.socket.emit('likePost', {obj: obj, pseudo: timeLine.pseudo});
                    timeLine.posts[i].like.push(timeLine.pseudo);
                }else {
                    timeLine.socket.emit('likePost', {obj: obj, pseudo: timeLine.pseudo});
                    timeLine.posts[i].like.splice(obj.like.indexOf(timeLine.pseudo), 1);
                }
            }
        }
    };

    timeLine.dislikePost = function (id) {
        for (var i = 0; i < timeLine.posts.length; i++) {
            var obj = timeLine.posts[i];
            if (obj.id === id) {
                if (obj.dislike.indexOf(timeLine.pseudo) === -1) {
                    timeLine.socket.emit('dislikePost', {obj: obj, pseudo: timeLine.pseudo});
                    timeLine.posts[i].dislike.push(timeLine.pseudo);
                }else {
                    timeLine.socket.emit('dislikePost', {obj: obj, pseudo: timeLine.pseudo});
                    timeLine.posts[i].dislike.splice(obj.dislike.indexOf(timeLine.pseudo), 1);
                }
            }
        }
    };

    timeLine.showMe = function(id) {
        for (var i = 0; i < timeLine.posts.length; i++) {
            var obj = timeLine.posts[i];
            if (obj.id === id) {
                console.log(obj.displayLike);
                if (obj.displayLike === false) {
                    timeLine.posts[i].displayLike = true;
                }else {
                    timeLine.posts[i].displayLike = false;
                }
            }
        }
    }
}]);