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
var provider    = new firebase.auth.FacebookAuthProvider();
var db          = firebase.database() ;
var rootRef     = db.ref() ;
var usersRef    = db.ref("users");
var store       = firebase.storage();
var storeRef    = store.ref();
var currentUser
var pageUid = {};
var urlobj;
var urllist = [];

$(window).ready(function(){
  var query = location.search.substr(1);
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    pageUid= decodeURIComponent(item[1]);
  });
  console.log(pageUid);

})

firebase.auth().onAuthStateChanged(function(user) {
  currentUser = firebase.auth().currentUser;
	if(user){
    // window.location = '/profile.html'
		// $('.userName').text(user.displayName)
    var currentUid = currentUser.uid
    if(pageUid=="") {pageUid = currentUid}
    console.log(pageUid);
    usersRef.once('value',function(snapShot){
      var userInfo = snapShot.val()[pageUid].userInfo

      //初次登入填表單
      if(userInfo == undefined){
        console.log("nice");
        $('#firstLogin').modal({
          backdrop: 'static',
          keyboard: false
        })
        $('#infoForm').submit(function(){
          var name = $('#yourName').val()
          var change = $('#youCanChange').val().split(" ")
          var learn = $('#youWantLearn').val().split(" ")
          var aboutYou = $('#aboutYou').val()
          usersRef.child(currentUid).update({
            "userInfo":{
              "name": name,
              "youCanChange": change,
              "youWantLearn": learn,
              "aboutYou": aboutYou
            }
          })
        })
      }
      //顯示資料
      $('.userName').text(userInfo.name)
      $('.mid-left-content').html(userInfo.aboutYou.replace(/\n/g,"<br />"))
      $('.change-content').text(userInfo.youCanChange)
      $('.learn-content').text(userInfo.youWantLearn)
    })
    var urlRef = usersRef.child(currentUid).child('userData').child('userImgurl');
    // var container = document.getElementById('imageContainer');
    var allurlRef = urlRef.once('value',function(data){
      var allurl = data.val()
      obj = $.map(allurl,function(value, index){
        var re = [value]
        re.reverse()
        return re;
      });
      obj = obj.reverse();
      console.log(Object.keys(obj).length);
      for(var i = 0 ;  i < Object.keys(obj).length ; i++){
        // console.log(obj[i].Imgurl);
        urllist[i]= obj[i].Imgurl;
        console.log(urllist[i]);
        // var img = document.createElement('img');
        // img.src = urllist[i];
        // container.appendChild(img);
        // console.log("1");
        if(i==1){
        $("#img1").attr('src', urllist[i]);
        $("#ref1").attr('href', urllist[i]);
      }
        else if(i==2){
          $("#img2").attr('src', urllist[i]);
          $("#ref2").attr('href', urllist[i]);
        }
        else if(i==3){
          $("#img3").attr('src', urllist[i]);
          $("#ref3").attr('href', urllist[i]);
        }
      }
      console.log(obj);
    })
}else{
  alert("您尚未登入")
}
})
//上傳作品
$('.test-btn').click(function(){
  window.location.search="uid="+currentUser.uid
})
var localFileVideoPlayer =function(){
	'use strict'
  var URL = window.URL || window.webkitURL
  var displayMessage = function (message, isError) {
    var element = document.querySelector('#message')
    element.innerHTML = message
    element.className = isError ? 'error' : 'info'
  }
  var playSelectedFile = function (event) {
    var file = this.files[0]
    var type = file.type
    var videoNode = document.querySelector('video')
    // var canPlay = videoNode.canPlayType(type)
    // if (canPlay === '') canPlay = 'no'
    // var message = 'Can play type "' + type + '": ' + canPlay
    // var isError = canPlay === 'no'
    // displayMessage(message, isError)

    // if (isError) {
    //   return
    // }

    var fileURL = URL.createObjectURL(file)
    videoNode.src = fileURL
  }
  var inputNode = document.querySelector('input')
  inputNode.addEventListener('change', playSelectedFile, false)
}
surepost.addEventListener("click", function(user) {
  var currentUser = firebase.auth().currentUser;
  var currentUid = currentUser.uid
  var file = document.getElementById('file').files[0];
  if (file) {
    var metedata = {
      contentType: file.type
    };
    storeRef.child('/userImage/' + currentUid + '/' + file.name).put(file, metedata).then(function(snapshot) {
      console.log('上傳完成' + snapshot);
      storeRef.child('/userImage/' + currentUid + '/' + file.name).getDownloadURL().then(function(url) {
        console.log(url);
        usersRef.child(currentUid).child('userData').child('userImgurl').push().set({
          "Imgurl": url
        })
      })
    });

  } else {
    console.log('upload failed');
  }
})

//中間捲軸動畫
$('.message').hover(function(){
	$('.message-text').css('opacity',1);
},function(){
	$('.message-text').css('opacity',0)
})

$('.mid-left-btn').click(function(){
	$('.mid-left').animate({marginLeft:"0"},{duration:500,queue:false})
	$('.mid-right').animate({marginRight:"-100%"},{duration:100,queue:false})
	$('.mid-left-btn').animate({left:"100%"},{duration:500,queue:false})
	$('.mid-right-btn').animate({right:"0"},{duration:100,queue:false})
	// setTimeout(function(){$('.mid-right-btn').css('display','block')},1000)
	$('.mid-right-btn').delay(850).fadeIn("slow")
	setTimeout(function(){$('.mid-left-btn').css('display','none')},1000)

})

$('.mid-right-btn').click(function(){
	$('.mid-right-btn').animate({right:"100%"},{duration:100,queue:false})
	$('.mid-left-btn').animate({left:"0"},{duration:100,queue:false})
	$('.mid-right').animate({marginRight:"0"},{duration:500,queue:false})
	$('.mid-left').animate({marginLeft:"-100%"},{duration:100,queue:false})
	$('.mid-left-btn').delay(500).fadeIn("slow")
	setTimeout(function(){$('.mid-right-btn').css('display','none')},1000)
})


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    currentUser = user
  } else {
    alert("您尚未登入")
  }
  usersRef.child(currentUser.uid).child("record").once('value', function(data) {
    var allrecord = data.val()
    var obj = $.map(allrecord, function(value, index) {
      var re = [value]
      return re;
    });
    obj = obj.reverse();
    console.log(obj);
    $('.record').html(`<div class="record-box">
      <h4>`+obj[0].title+`</h4>
      <div class="skill-box"><p>可交換：`+obj[0].change+`</p></div>
      <div class="skill-box"><p>欲學習：`+obj[0].learn+`</p></div>
    </div>`)
  })
  usersRef.child(currentUser.uid).child("endrecord").once('value', function(data) {
    var allendrecord = data.val()
    var obj = $.map(allendrecord, function(value, index) {
      var re = [value]
      re.reverse()
      return re;
    });
    obj = obj.reverse();
    console.log(obj);
    $('.endRecord').html(`<div class="record-box">
      <h4>`+obj[0].title+`</h4>
      <div class="skill-box"><p>可交換：`+obj[0].change+`</p></div>
      <div class="skill-box"><p>欲學習：`+obj[0].learn+`</p></div>
    </div>`)
  })
});
