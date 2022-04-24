/*
 Copyright (c) 2012-2018 Open Lab
 Written by Roberto Bicchierai and Silvia Chelazzi http://roberto.open-lab.com
 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var data='pre';
var app = 'cfaf51af';
var accessToken = "d14c365b-6d53-428c-b375-8ce3445f0a40";
var userQueId = "35358940";
var userid = 668005;
var projectApp = "849c7437";
var detailApp = "cfaf51af";
var sortApp = "76bb501d";


var projectMap = {
  //项目经理
  "projectManager" : {
    "queId": 35358612,
    "queType": 5,
    "values":[
      {
        value:""
      }
    ]
  }
  ,
  //项目名称
  "projectName" : {
    "queId": 34410012,
    "queType": 2,
    "values":[
      {
        value:""
      }
    ]
  }
}

var map = {
  //项目名称
  "projectName": {
    "queId": 34575335,
    "queType": 19,
    "values":[
      {
        value:""
      }
    ]
  },
  //"任务名称"
  "name": {
    "queId": 34568684,
    "queType": 2,
    "values":[
      {
        value:""
      }
    ]
  },
  //任务描述
  "description": {
    "queId": 35038608,
    "queType": 16,
    "values":[
      {
        value:""
      }
    ]
  },
  //实际开始时间
  "start": {
    "queId": 51666578,
    "queType": 8,
    "values":[
      {
        value:""
      }
    ]
  },
  //实际完成时间
  "end": {
    "queId": 51666579,
    "queType": 8,
    "values":[
      {
        value:""
      }
    ]
  }
  ,
  //parentid
  "parentid": {
    "queId": 51467269,
    "queType": 8,
    "values":[
      {
        value:""
      }
    ]
  }
  ,
  //rank
  "rank": {
    "queId": 51467270,
    "queType": 8,
    "values":[
      {
        value:""
      }
    ]
  }
  ,
  //depend
  "depend": {
    "queId": 51496179,
    "queType": 8,
    "values":[
      {
        value:""
      }
    ]
  }
  ,
  //status
  "status": {
    "queId": 51540683,
    "queType": 2,
    "values":[
      {
        value:""
      }
    ]
  }
}

var sortMap = {
  //taskIds
  "taskIds" : {
    "queId": 51612487,
    "queType": 2,
    "values":[
      {
        value:""
      }
    ]
  }
  ,
  //项目名称
  "projectName" : {
    "queId": 51612486,
    "queType": 2,
    "values":[
      {
        value:""
      }
    ]
  }
  ,
  //levels
  "levels" : {
    "queId": 51642032,
    "queType": 2,
    "values":[
      {
        value:""
      }
    ]
  }
}


function buildQueIdNameMap(map){
  res = {};
  for(var key in map){
    var que = map[key].queId

    res[que] = key;
  }
  return res;
}

var detailsQueIdMap = buildQueIdNameMap(map);


function clone(obj) {
  var o;
  if (typeof obj == "object") {
      if (obj === null) {
          o = null;
      } else {
          if (obj instanceof Array) {
              o = [];
              for (var i = 0, len = obj.length; i < len; i++) {
                  o.push(clone(obj[i]));
              }
          } else {
              o = {};
              for (var j in obj) {
                  o[j] = clone(obj[j]);
              }
          }
      }
  } else {
      o = obj;
  }
  return o;
}

function sleep(ms) {
  var start = (new Date()).getTime();
  while ((new Date()).getTime() - start < ms) {
    continue;
  }
}

function getResNTimes(requestId, n){
  var count = 0;
  var res = null;
  while(count < n){
    console.log(count);
    count += 1;
    sleep(1000);
    res = getOperationResult(requestId);

    if(res != null && res.result != null){
      break;
    }
  }
  return res;
}


function getOperationResult(requestId){
  console.info( requestId );
  var res = null;
    $.ajax({
      url: 'http://localhost/api/operation/' + requestId,
      type: 'get',
      headers: {
        "accessToken": accessToken
      },
      async: false,
      success: function( data, textStatus, jQxhr ){
        res = data;
      },
      error: function( jqXhr, textStatus, errorThrown ){
          console.info( errorThrown );
          res = errorThrown;
      }
    })
  
  return res;
}

function getSelectUrl(app){
  return "http://localhost/api/app/" + app + "/apply/filter";
}

function getProjectByUser(app, userid){
  var res = null;
  $.ajax({
    url: getSelectUrl(app),
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    headers: {
      "accessToken": accessToken
    },
    data: JSON.stringify( { 
      "pageSize": 1000, 
      "pageNum": 1,
      "queries": [
        {
          //config
            "queId": projectMap.projectManager.queId,
            "searchUserIds": userid
        }
      ]
    } ),
    async : false,
    success: function( data, textStatus, jQxhr ){
      res = data.result.result;
    },
    error: function( jqXhr, textStatus, errorThrown ){
        console.info( errorThrown );
    }
  })
  return res;
}

function getDetailsByUser(app, userid){
  var res = null;
  $.ajax({
    url: getSelectUrl(app),
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    headers: {
      "accessToken": accessToken
    },
    data: JSON.stringify( { 
      "pageSize": 1000, 
      "pageNum": 1,
      "queries": [
        {
            "queId": userQueId,
            "searchUserIds": userid
        }
      ]
    } ),
    async : false,
    success: function( data, textStatus, jQxhr ){
      res = data.result.result;
    },
    error: function( jqXhr, textStatus, errorThrown ){
        console.info( errorThrown );
    }
  })
  return res;
}

function getDetailsByProject(app, projectName){
  var res = null;
  $.ajax({
    url: getSelectUrl(app),
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    headers: {
      "accessToken": accessToken
    },
    data: JSON.stringify( { 
      "pageSize": 1000, 
      "pageNum": 1,
      "queries": [
        {
          //config
            "queId": 34575335,
            "searchKey": projectName
        }
      ]
    } ),
    async : false,
    success: function( data, textStatus, jQxhr ){
      res = data.result.result;
    },
    error: function( jqXhr, textStatus, errorThrown ){
        console.info( errorThrown );
    }
  })
  return res;
}

function getTaskIdsByProject(app, projectName){
  var res = null;
  $.ajax({
    url: getSelectUrl(app),
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    headers: {
      "accessToken": accessToken
    },
    data: JSON.stringify( { 
      "pageSize": 1000, 
      "pageNum": 1,
      "queries": [
        {
          //config
            "queId": sortMap.projectName.queId,
            "searchKey": projectName
        }
      ]
    } ),
    async : false,
    success: function( data, textStatus, jQxhr ){
      res = data.result.result;
    },
    error: function( jqXhr, textStatus, errorThrown ){
        console.info( errorThrown );
    }
  })
  return res;
}

function getDeleteUrl(app){
  return "http://localhost/api/app/" + app + "/apply";
}


function deleteById(app, applyId){
  var res = null;
  $.ajax({
    url: getDeleteUrl(app),
    dataType: 'json',
    type: 'delete',
    contentType: 'application/json',
    headers: {
      "accessToken": accessToken
    },
    data: JSON.stringify( {  
      "queries": [],  
      "applyIds": applyId
} ),
    async: false,
    success: function( data, textStatus, jQxhr ){
      console.info(data);
      res = getResNTimes(data.result.requestId, 10) ;
    },
    error: function( jqXhr, textStatus, errorThrown ){
        console.info( errorThrown );
    }
  })
  return res;
}


function buildInsertPostBody(para){
  var postBody = [];  
  var post = clone(map);

  for(var key in map){
    if(para[key] != null){
      post[key].values[0].value = para[key];
      postBody.push(post[key]);  
    }
  }

  return postBody;
}

function getInsertUrl(app){
  return "http://localhost/api/app/" + app + "/apply";
}


function insert(app, paraMap){
  var postBody = buildInsertPostBody(paraMap);
  var res = null;
  $.ajax({
    url: getInsertUrl(app),
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    headers: {
      "accessToken": accessToken
    },
    async: false,
    data: JSON.stringify( {
      "answers": 
        postBody
    } ),
    success: function( data, textStatus, jQxhr ){
      res = getResNTimes(data.result.requestId, 10) ;
    },
    error: function( jqXhr, textStatus, errorThrown ){
        console.info( errorThrown );
    }
  })
  return res;
}


function update(id, paraMap){
  var postBody = buildInsertPostBody(paraMap);
  var res = null;
  $.ajax({
    url: 'http://localhost/api/apply/' + id,
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    headers: {
      "accessToken": accessToken
    },
    async: false,
    data: JSON.stringify( {
      "answers": 
        postBody
    } ),
    success: function( data, textStatus, jQxhr ){
      res = getResNTimes(data.result.requestId, 10) ;
      //res = data;
    },
    error: function( jqXhr, textStatus, errorThrown ){
        console.info( errorThrown );
    }
  })
  return res;
}

function buildTasksByProjectName(projectName){
  var detailArray = getDetailsByProject(detailApp,projectName);
  var res = [];
  for(var index in detailArray){
    res.push(parseDetail(detailArray[index], detailsQueIdMap));
  }
  return res;
}

var taskTemplate = {"id": -1, "name": "Gantt editor", "progress": 0, "progressByWorklog": false, "relevance": 0, "type": "", "typeId": "", "description": "", "code": "", "level": 0, "status": "STATUS_ACTIVE", "depends": "", "canWrite": true, "start": 1396994400000, "duration": 20, "end": 1399586399999, "startIsMilestone": false, "endIsMilestone": false, "collapsed": false, "assigs": [], "hasChild": true};

function parseDetail(detail, queIdMap){
  var res = clone(taskTemplate);
  res.id = detail.applyId;

  for(var index in detail.answers){
    var column = detail.answers[index];
    var queId = column.queId;
    
    if(queId in queIdMap){
      res[queIdMap[queId]] = column.values[0].value;
    }
  }

  if(!("depend" in res)){
    res.depend = "";
  }
  console.info(new Date(res.start).getTime());


  return res;
}





function  testDelay(){
  var n = 0;
  while (n < 10){
    n+=1;
    sleep(500);
    console.info( n );
    // setTimeout(() => {
    //   console.info( n );
    // }, 500 * n);
  }
  return null;
  
}




function test(){
  var para = paraMap;
  var post = clone(map);
  var postBody = [];


  for(var key in post){
    post[key].values[0].value = para[key];
    console.info( key + " : " + post[key].values[0].value );
    console.info( para[key] );
    postBody.push(post[key]);
    //post[key]
    
  }
  return postBody;
}




