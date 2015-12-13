// ==UserScript==
// @name         Keybr github
// @namespace    https://github.com/anka-213
// @version      0.1
// @description  Type a github repo using keybr.com
// @author       Andreas Källberg <anka.213@gmail.com> https://github.com/anka-213
// @homepageURL  https://github.com/anka-213/userscripts#readme
// @updateURL    https://raw.githubusercontent.com/anka-213/userscripts/master/keybr-github.user.js, https://openuserjs.org/install/anka-213/Keybr_github.user.js
// @match        http://www.keybr.com/*
// @grant        unsafeWindow
// ==/UserScript==
/* jshint -W097, esnext:true */
/* globals unsafeWindow: false */
'use strict';
(function(LessonFactory, MODE, CustomGenerator, CustomLesson) {

    LessonFactory.loadLessonOrig = LessonFactory.loadLessonOrig || LessonFactory.loadLesson;
    Promise.prototype.done = Promise.prototype.then; // Ugly hack. Convert to real "P" promise instead.
    Promise.prototype.fail = Promise.prototype.catch; 
    
    var log = x=>console.log(x);
    
    var processStatus = function(response) {
        // status "0" to handle local files fetching (e.g. Cordova/Phonegap etc.)
        if (response.status === 200 || response.status === 0) {
            return response;
        } else {
            throw new Error(response.statusText);
        }
    }
    ;
    
    var fetchOK = url=>fetch(url).then(processStatus);
    var fetchText = url=>fetchOK(url).then(ans=>ans.text());
    var fetchJson = url=>fetchOK(url).then(ans=>ans.json());
    var getBlobPaths = json=>json.tree.filter(a=>a.type=="blob").map(a=>a.path);
    var getDownloadUrl = a => downloadURL + a;
    
    function getRandom(arr) {
        var i = Math.floor(Math.random() * arr.length);
        return arr[i];
    }
    function fetchAll(urls) {
        var contentPromises = urls.map(fetchText);
        return Promise.all(contentPromises);
    }

function getGithub(url) {
    var repo = url[1];
    var branch = "master";
    var downloadURL = "https://raw.githubusercontent.com/" + repo + "/" + branch + "/";
    var apiUrl = 'https://api.github.com/repos/' + repo + '/git/trees/' + branch + '?recursive=1';
    
    // Get random file
    var p = fetchJson(apiUrl)
    .then(getBlobPaths)
    .then(getRandom)
    .then(function (path) {
	   console.log(path);
	   return fetchText(downloadURL + path).then(txt => path + "\n" + txt);
	});
    
    /*
       // Get all files
       var p = fetchJson(apiUrl)
               .then(getBlobUrls)
               .then(fetchAll);
    */
    
    p.catch(console.error.bind(console));
    return p;
}

LessonFactory.loadLesson = function(settings) {
    var url;
    if (MODE.IMPORT_WEBSITE === settings.mode && (url = settings.text.url.match("https://github.com/([^/]*/[^/]*)"))) {
        console.log(url);
        var github = getGithub(url);
        return github.then(text => new CustomLesson(settings,new CustomGenerator(settings, text)));
    } else {
        return LessonFactory.loadLessonOrig(settings);
    }

};

})(unsafeWindow.LessonFactory, unsafeWindow.MODE, unsafeWindow.CustomGenerator, unsafeWindow.CustomLesson);
