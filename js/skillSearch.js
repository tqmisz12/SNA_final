var config = {
  apiKey: "AIzaSyCjkfmg2MFFocIDBdQuplLOOflyD2roLQM",
  authDomain: "sna-final.firebaseapp.com",
  databaseURL: "https://sna-final.firebaseio.com",
  projectId: "sna-final",
  storageBucket: "sna-final.appspot.com",
  messagingSenderId: "296131393218"
};
firebase.initializeApp(config);

var provider = new firebase.auth.FacebookAuthProvider();
var db = firebase.database();
var rootRef = db.ref();
var usersRef = db.ref("users");
var articlesRef = db.ref("articles");
var chatsRef = db.ref("chats");
var unreadRef = db.ref("unread");
var currentUser

var app = new Vue({
  el: '#app',
  data: {
    currentUser,
    skill_list: [],
    suggest_list: {},
    favorite_list: {},
    control: {
      tab: "all",
      filter: "",
      sort: ""
    }
  },
  methods: {
    articleModal: function() {
      $('#publishArticle').modal('show')
    },
    articleSubmit: function() {
      var vm = this;
      var dataArr = $("#articleForm").serializeArray();
      var newPostKey = firebase.database().ref().child('articles').push().key;
      // Write the new post's data simultaneously in the posts list and the user's post list.
      var postData = {
        uid: vm.currentUser.uid,
        aid: newPostKey,
        author: vm.currentUser.displayName,
        title: dataArr[0].value,
        change: dataArr[1].value,
        learn: dataArr[2].value,
        content: dataArr[3].value.replace(/\n/g, "<br />"),
        time: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + ' ' + new Date().toLocaleTimeString(),
        changed: false
      }
      var updates = {};
      updates['/articles/' + newPostKey] = postData;
      //updates['/user-articles/' + currentUser.uid + '/' + newPostKey] = postData;

      return firebase.database().ref().update(updates);
    },
    toggle_like: function(aid) {
      var vm = this
      var favorite = {}
      favorite[aid] = true
      usersRef.child(vm.currentUser.uid).child("favorite").child(aid).once('value', function(data) {
        if (data.val()) {
          usersRef.child(vm.currentUser.uid).child("favorite").child(aid).remove()
        } else {
          usersRef.child(vm.currentUser.uid).child("favorite").update(favorite)
        }
      })
      this.$set(this.favorite_list, aid, this.favorite_list[aid] ? false : true)
      console.log(this.favorite_list);
    },
    logList: function() {
      console.log(this.skill_list);
    },
    edit_article: function(a) {
      $('#editArticle').modal('show')
      $('#edittitle').val(a.title)
      $('#editchange').val(a.change)
      $('#editlearn').val(a.learn)
      $('#editarticleContent').val(a.content.replace(/<br\s*\/?>/gi, '\n'))
      $('#aid').val(a.aid)
      console.log(a);
    },
    editSubmit: function() {
      var vm = this;
      var aid = $('#aid').val()
      var dataArr = $("#editForm").serializeArray();
      console.log(aid);
      var postData = {
        uid: vm.currentUser.uid,
        aid: aid,
        author: vm.currentUser.displayName,
        title: dataArr[0].value,
        change: dataArr[1].value,
        learn: dataArr[2].value,
        content: dataArr[3].value.replace(/\n/g, "<br />"),
        time: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + ' ' + new Date().toLocaleTimeString(),
        changed: false
      }
      console.log(aid)
      var updates = {};
      updates['/articles/' + aid] = postData;
      //updates['/user-articles/' + currentUser.uid + '/' + newPostKey] = postData;
      return firebase.database().ref().update(updates);
    },
    queryUrl: function(uid) {
      window.location = "profile.html?uid=" + uid
    },
    sendMessage: function(title,author,uid,aid) {
      //var txt = prompt("傳個訊息給他吧", "");
      console.log(uid);
      var name = currentUser.displayName;
      var current = currentUser.uid;
      txt="<div><p>"+name+"在看見“"+title+"”貼文後有興趣邀請您交換，您是否接受邀請？</p>"+"<button class='btn btn-primary acceptChange "+current+" "+uid+" "+aid+"'>接受交換</button></div>"
      if (txt == null || txt == "") {} else {

        var myChatsRef = chatsRef.child(this.currentUser.uid);

        var postData = {
          read: false,
          meSend: true,
          message: txt,
          time: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + ' ' + new Date().getHours() + ':' + new Date().getMinutes(),
        }

        var newPostKey = myChatsRef.child(uid).push().key;

        var updates = {};
        updates['/' + uid + '/' + newPostKey] = postData;
        myChatsRef.update(updates)

        newPostKey = chatsRef.child(uid).child(this.currentUser.uid).push().key;

        postData.meSend = false;
        var updates2 = {};
        updates2['/' + uid + '/' + this.currentUser.uid + '/' + newPostKey] = postData;
        chatsRef.update(updates2);
        console.log("sended");
        var otherUnreadRef = unreadRef.child(uid);
        otherUnreadRef.once('value').then(function(snapshot) {
          if (null != snapshot.val()) {
            var unreadCount = snapshot.val().count + 1;
            otherUnreadRef.update({
              "count": unreadCount
            })
          } else {

            otherUnreadRef.update({
              "count": 1
            });
          }

        });
      }
      $('#changeModal').modal('hide')
    }





    // favorite :function(aid){
    //   var result =[];
    //   usersRef.child(currentUser.uid).child("favorite").child(aid).on('value',function(data){
    //     console.log(data.val())
    //     if(data.val()){
    //       result=['favorite']
    //     }else{
    //       result = [""]
    //     }
    //   })
    //   return result
    // }
  },
  computed: {
    current_skill_list: function() {
      var vm = this
      var current = []
      switch (vm.control.tab) {
        case "all":
          current = vm.skill_list
          break
        case "star":
          current = vm.skill_list.filter(function(a) {
            return vm.favorite_list[a.aid]
          })
      }
      if (vm.control.filter && vm.control.filter.length > 0) {
        var filter = []
        current = current.filter(function(s) {
          var search = vm.control.filter.toLowerCase()
          var title = s.title.toLowerCase()
          var change = s.change.toLowerCase()
          var learn = s.learn.toLowerCase()
          var content = s.content.toLowerCase()
          return (title.indexOf(search) > -1 || change.indexOf(search) > -1 || learn.indexOf(search) > -1 || content.indexOf(search) > -1)
        })
      }

      return current;
    }
  },
  created: function() {
    var vm = this;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        currentUser = user
        vm.currentUser = user;
      } else {
        alert("您尚未登入")
      }
      usersRef.child(vm.currentUser.uid).child("favorite").once('value', function(data) {
        if (data.val()) {
          var fArticles = Object.keys(data.val())
          console.log(fArticles);
          for (var i = 0; i < fArticles.length; i++) {
            app.$set(app.favorite_list, fArticles[i], app.favorite_list[fArticles[i]] ? false : true)
          }
        }
      })
    });
    var vm = this;
    articlesRef.once('value', function(data) {
      var allArticles = data.val()
      var obj = $.map(allArticles, function(value, index) {
        var re = [value]
        re.reverse()
        return re;
      });
      obj = obj.reverse();
      vm.skill_list = obj
    })
  }
})
