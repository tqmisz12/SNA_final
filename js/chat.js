//firebase
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
var chatsRef = db.ref("chats");
var usersRef = db.ref("users");
var unreadRef = db.ref("unread");
var store = firebase.storage();
var storeRef = store.ref();
var currentUser;
var clickedUser;
var historyUID;
var historyUsers = [];
var usersLastMessage = [];
var token;
var listenRef;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    currentUser = user.toJSON();

    getUsersID();
    resetUnread();
  } else {
    alert("您尚未登入")
  }
});

function getUsersID() {
  $.get("https://sna-final.firebaseio.com/chats/" + currentUser.uid + ".json?shallow=true", function(data) {
    historyUID = Object.keys(data)
    getUsersInfo(historyUID)
  })
}

function getUsersInfo(historyUID) {
  //清除左側朋友列表
  $('.recent-friends').empty();
  for (i = 0; i < historyUID.length; i++) {
    //console.log(historyUID[i]);
    usersRef.child(historyUID[i]).child("userData").once('value').then(function(snapshot) {
      if (null != snapshot.val()) {
        historyUsers.push(snapshot.val());

        var rone = $("<div></div>").addClass('recent-one');
        var ronel = $("<div></div>").addClass('recent-one__logo');
        var ronei = $("<div></div>").addClass('recent-one__img');
        var img = $("<img/>").attr("src", snapshot.val().photoURL);
        ronei.append(img);
        ronel.append(ronei);
        rone.append(ronel);
        var roneb = $("<div></div>").addClass('recent-one__body');
        var roneh = $("<div></div>").addClass('recent-one_head');
        var ronen = $("<div></div>").addClass('recent-one__name').text(snapshot.val().displayName);
        roneh.append(ronen);
        roneb.append(roneh);
        rone.append(roneb);

        $('.recent-friends').append(rone);
        leftClickFun();
      }
      // var username = snapshot.val().displayName;
    })
  }
  console.log(historyUsers);
  refreshLeftUsers(historyUsers);
}

function refreshLeftUsers(historyUsers) {
  console.log(historyUsers.length);
  for (i = 0; i < historyUsers.length; i++) {
    console.log(i);
    var recentPostsRef = myChatsRef.child(historyUsers[i].uid).limitToLast(1);
    recentPostsRef.once('value').then(function(snapshot) {
      console.log(snapshot.value);
    })
  }
}

function leftClickFun() {
  $('.recent-one').click(function(o) {
    console.log("recent");
    $('.recent-one__active').removeClass('recent-one__active');
    $(this).addClass('recent-one__active')

    //TODO setUserName
    var name = $(this).find('.recent-one__name').text();
    $('.messenger__user-name').text(name);

    $('.messenger__list').empty();
    //TODO add messenger

    var leftUserElement;
    leftUserElement = $('.recent-friends').find('.recent-one');
    console.log(leftUserElement);
    console.log(historyUID);

    var clicked = leftUserElement.toArray().indexOf($(this).get(0));
    console.log(historyUsers[clicked])
    clickedUser = historyUsers[clicked];

    chatsRef.child(currentUser.uid).child(clickedUser.uid).off();
    chatsRef.child(currentUser.uid).child(clickedUser.uid).off();

    loadMessage();
    listenToDb(true);

  })

}

function loadMessage() {
  var myChatsRef = chatsRef.child(currentUser.uid).child(clickedUser.uid);
  myChatsRef.once('value', function(snap) {
    snap.forEach(function(item) {
      var itemVal = item.val();
      // console.log(itemVal);
      addMessage(itemVal);
    });
    $(".messenger__list").animate({
      scrollTop: $('.messenger__list').prop("scrollHeight")
    }, 50)
  });
}

function addMessage(textModel) {
  var m;

  if (textModel.meSend == true) {
    m = $("<div></div>").addClass('message');
  } else {
    m = $("<div></div>").addClass('message message_left');
  }

  var mb = $("<div></div>").addClass('message__body').html(textModel.message);
  var mf = $("<div></div>").addClass('message__footer');
  var time = $("<time></time>").text(textModel.time);
  mf.append(time);

  m.append(mb);
  m.append(mf);
  $(".messenger__list").append(m);
  $('.acceptChange').click(function(){
    var classlist = $('.acceptChange').attr('class').split(/\s+/);
    user1 = classlist[3]
    user2 = classlist[4]
    changeArt = classlist[5]
    console.log(classlist[3],classlist[4],classlist[5]);
    db.ref('/articles/'+changeArt).once('value').then(function(data){
      var art = data.val();
      var aid = art.aid
      var title = art.title;
      var change = art.change;
      var learn = art.learn;
      var newPostKey1 = usersRef.child(user1).child('record').push().key;
      var newPostKey2 = usersRef.child(user1).child('record').push().key;
      var post = {
        user1 :user1,
        user2 :user2,
        title :title,
        change :change,
        learn :learn,
      }
      var update1 = {}
      var update2 = {}
      update1['/users/'+user1+'/record/'+newPostKey1]=post
      update2['/users/'+user2+'/record/'+newPostKey2]=post
      firebase.database().ref().update(update1);
      firebase.database().ref().update(update2);
      txt="<div><p>交換完成後請按此鈕</p>"+"<button class='btn btn-primary doneChange "+user1+" "+user2+" "+aid+"'>交換完畢</button></div>"
      if (txt == null || txt == "") {} else {

        var myChatsRef = chatsRef.child(this.currentUser.uid);

        var postData = {
          read: false,
          meSend: true,
          message: txt,
          time: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + ' ' + new Date().getHours() + ':' + new Date().getMinutes(),
        }

        var newPostKey = myChatsRef.child(user1).push().key;

        var updates = {};
        updates['/' + user1 + '/' + newPostKey] = postData;
        myChatsRef.update(updates)

        newPostKey = chatsRef.child(user1).child(this.currentUser.uid).push().key;

        postData.meSend = false;
        var updates2 = {};
        updates2['/' + user1 + '/' + user2 + '/' + newPostKey] = postData;
        chatsRef.update(updates2);
        console.log("sended");
        var otherUnreadRef = unreadRef.child(user1);
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
    })
  })
  $('.doneChange').click(function(){
    var classlist = $('.doneChange').attr('class').split(/\s+/);
    user1 = classlist[3]
    user2 = classlist[4]
    changeArt = classlist[5]
    console.log(classlist[3],classlist[4],classlist[5]);
    db.ref('/articles/'+changeArt).once('value').then(function(data){
      var art = data.val();
      var aid = art.aid
      var title = art.title;
      var change = art.change;
      var learn = art.learn;
      var newPostKey1 = usersRef.child(user1).child('record').push().key;
      var newPostKey2 = usersRef.child(user1).child('record').push().key;
      var post = {
        user1 :user1,
        user2 :user2,
        title :title,
        change :change,
        learn :learn,
      }
      var update1 = {}
      var update2 = {}
      update1['/users/'+user1+'/endrecord/'+newPostKey1]=post
      update2['/users/'+user2+'/endrecord/'+newPostKey2]=post
      firebase.database().ref().update(update1);
      firebase.database().ref().update(update2);
    })
  })
}

console.log("js loaded")
$('#send_bt').click(function() {

  var text = $("#send_input").val();
  if (text != "") {
    sendMsg(text);
    $(".messenger__list").animate({
      scrollTop: $('.messenger__list').prop("scrollHeight")
    }, 500)
    $("#send_input").val("");
  }
  return;
})

function listenToDb(firstClick) {
  listenRef = chatsRef.child(currentUser.uid).child(clickedUser.uid);
  console.log("listenToDb");

  listenRef.limitToLast(1).on('value', function(snapshot) {
    console.log("db change");

    snapshot.forEach(function(item) {
      var itemVal = item.val();
      console.log(itemVal);
      //第一次點選不同使用者不加入訊息
      if (!firstClick) {
        addMessage(itemVal);
        resetUnread();
      } else {
        firstClick = false;
      }
      $(".messenger__list").animate({
        scrollTop: $('.messenger__list').prop("scrollHeight")
      }, 50)
    });
  });
}

function sendMsg(text) {
  console.log(text);
  var myChatsRef = chatsRef.child(currentUser.uid);
  var postData = {
    read: false,
    meSend: true,
    message: text,
    time: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + ' ' + new Date().getHours() + ':' + new Date().getMinutes(),
  }
  // addMessage(postData);
  // var newPostKey = myChatsRef.child('101').push().key;
  var newPostKey = myChatsRef.child(clickedUser.uid).push().key;

  // console.log(newPostKey);
  var updates = {};
  updates['/' + clickedUser.uid + '/' + newPostKey] = postData;
  myChatsRef.update(updates)

  // newPostKey = chatsRef.child(currentUser.uid).push().key;
  newPostKey = chatsRef.child(clickedUser.uid).child(currentUser.uid).push().key;

  postData.meSend = false;
  var updates2 = {};
  updates2['/' + clickedUser.uid + '/' + currentUser.uid + '/' + newPostKey] = postData;
  chatsRef.update(updates2);
  console.log("sended");

  var otherUnreadRef = unreadRef.child(clickedUser.uid);
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

$("#send_input").keydown(function(e) {
  if (e.keyCode == 13) {
    enter_send_msg();
    return false;
  }
})

function enter_send_msg() {
  var text = $("#send_input").val();
  if (text != "") {
    sendMsg(text);
    $(".messenger__list").animate({
      scrollTop: $('.messenger__list').prop("scrollHeight")
    }, 500)
    $("#send_input").val("");
  }
}

function resetUnread() {
  var myUnreadRef = unreadRef.child(currentUser.uid);

  myUnreadRef.update({
    "count": 0
  });
}
