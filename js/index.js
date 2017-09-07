// Initialize Firebase
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
var db          = firebase.database() ;
var rootRef     = db.ref() ;
var usersRef    = db.ref("users");
var unreadRef   = db.ref("unread")
var currentUid

var loginState = (function (){
	var isLogin = false;
	var pub = {};

	pub.changeState = function (state){
		isLogin = state
	};

	pub.getState = function(){
		return isLogin;
	}
  return pub;
}());

$(document).ready(function(){
  firebase.auth().onAuthStateChanged(function(user) {
    currentUid = user.uid
    console.log(currentUid);
    var vm=this;
      if (user){
        // save usr public data  (*1)
        console.log(currentUid);
        var userData = user.toJSON();
        usersRef.child (userData.uid).child("userData").update(userData).catch(errorCallback)
        // update vue to login status
        $('.log-in').css('display','none')
        $('.loged').css('display','block')
        $('.userImg').attr('src',user.photoURL);
        $('.userImg').attr('alt',user.displayName)
        loginState.changeState(true);
      }else{
        // update vue to logout status
        $('.log-in').css('display','block')
        $('.loged').css('display','none')
        loginState.changeState(false);
      }
      unreadRef.child(currentUid).once('value',function(data){
        var count = data.val()
        console.log(count.count);
        $('.unread').text(count.count)
      })
    })
})

var errorCallback = function(error){ alert(error.message)}
$('.profile').click(function(){
  window.location="profile.html?uid="+currentUid
})
$('.log-in').click(function(){
  firebase.auth().signInWithPopup(provider).then(function(result) {
  // This gives you a Facebook Access Token. You can use it to access the Facebook API.
  var token = result.credential.accessToken;
  var user = result.user;
  console.log(token);
  console.log(user);
}).catch(function(error) {
  var errorCode = error.code;
  var errorMessage = error.message;
  var email = error.email;
  var credential = error.credential;
  })
  if($('#skillModal').is(':visible'))
	{
		$('#skillModal').modal('hide')
	}
	if($('#shareModal').is(':visible'))
	{
		$('#shareModal').modal('hide')
	}
	if($('#chatRoomModal').is(':visible'))
	{
		$('#chatRoomModal').modal('hide')
	}
	if($('#keywordModal').is(':visible'))
	{
		$('#keywordModal').modal('hide')
	}
	if($('#rareModal').is(':visible'))
	{
		$('#rareModal').modal('hide')
	}
	if($('#recommendModal').is(':visible'))
	{
		$('#recommendModal').modal('hide')
	}
})
$('.log-out').click(function(){
  firebase.auth().signOut()
})

$('.profileBut').click(function(){
    console.log("come")
	console.log(loginState.getState())
	if (loginState.getState()){
		console.log("gotoProfile");
		location.href = "./profile.html";
	}
	else{
		$('#unlogwarningModal').modal('show');
	}
})

$('.chatBut').click(function(){
    console.log("come")
	if (loginState.getState()){
		console.log("gotoChat")
		location.href = "./chat.html";
	}
	else{
		$('#unlogwarningModal').modal('show');
	}
})

$('.searchBut').click(function(){
    console.log("come")
	if (loginState.getState()){
		console.log("gotoskillsearch")
		location.href = "./skillSearch.html";
	}
	else{
		$('#unlogwarningModal').modal('show');
	}
})

//function for footer bar onclick

var click_footerBut = function(ID){
	if (loginState.getState()){
		if (ID == 'prof_')
			location.href = "./profile.html";
		else if (ID == 'chat_')
			location.href = "./chat.html";
		else if (ID == 'skill_')
			location.href = "./skillSearch.html";
	}
	else {
		if (ID == 'prof_'){
		$('html, body').animate({
			scrollTop: $(".Profile").offset().top}, 800);}
		else if (ID == 'chat_'){
		$('html, body').animate({
			scrollTop: $(".Chatroom").offset().top}, 800);}
		else if (ID == 'skill_'){
		$('html, body').animate({
			scrollTop: $(".Search").offset().top}, 1000);}
	}
}

$('.skills').click(function(){
	$('html, body').animate({
		scrollTop: 0}, 800);
})
