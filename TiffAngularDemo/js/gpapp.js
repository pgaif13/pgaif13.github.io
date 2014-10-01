function MenuItem(itemName, itemTarget, iconUrl) {
    this.itemName = itemName;
    this.itemTarget = itemTarget;
    this.iconUrl = iconUrl;
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function DoSearch() {
    var qsearch = $('#searchq').val();
    if (qsearch != "") {
        window.location = "search.html?q=" + qsearch;
    }    
}

var gpApp = angular.module('gpApp', ['gpAppControllers', 'ngRoute', 'ngSanitize']);

gpApp.config(function ($httpProvider) {
    $httpProvider.responseInterceptors.push('myHttpInterceptor');

    var spinnerFunction = function spinnerFunction(data, headersGetter) {
        $("#spinner").show();
        return data;
    };

    $httpProvider.defaults.transformRequest.push(spinnerFunction);
});

gpApp.factory('myHttpInterceptor', function ($q, $window) {
    return function (promise) {
        return promise.then(function (response) {
            $("#spinner").hide();
            return response;
        }, function (response) {
            $("#spinner").hide();
            return $q.reject(response);
        });
    };
});

gpApp.factory('myTiffService', function ($http) {
    return {
        getTiffApiData: function (apiurl) {           
            return $http.get(apiurl).then(function (result) {
                return result.data;
            },
            function () { return "Error"; });
        }
    }
});

var gpAppControllers = angular.module('gpAppControllers', [], function ($locationProvider) {
    $locationProvider.html5Mode(true);
});

gpAppControllers.controller('HomeCtrl', ['$scope',
  function ($scope) {
      $scope.mymenuitems = [
      new MenuItem("Film List", "listnav.html", "img/movieicon2.png"),
      new MenuItem("Public Schedule", "schedule.html", "img/calendaricon2.png"),
      new MenuItem("P&I Schedule", "pischedule.html", "img/calendaricon2.png"),
      new MenuItem("Programmes", "programmes_all.html", "img/movieicon2.png")
      ];
      $scope.pagename = "Home Page";
  }]);

gpAppControllers.controller('ListNavCtrl', ['$scope', 'myTiffService',
  function ($scope, $myTiffService) {
      var apiurl = "https://apps.tiff.net/industry/api/emsproxy/eventcollection/festival?gettitlenav=true&mode=json";
      $scope.pagename = "Film List By Initial";  
      $myTiffService.getTiffApiData(apiurl).then(function (data) {         
          if (data == "Error") {
              $scope.pagename = "Film List By Initial. Error!";
              $scope.navdata = "Error getting data. Check cross domain issues?";
          } else {
              $scope.pagename = "Film List By Initial.";
              var navlist = data.TiffTitleNav.split(",");
              $scope.navdata = navlist;
          }  
      });
  }]);

gpAppControllers.controller('ListByTitleCtrl', ['$scope', 'myTiffService',
  function ($scope, $myTiffService) {
      $scope.pagename = "Film List - ";
      var titlevalue = getUrlVars()["title"];      
      var apiurl = "https://apps.tiff.net/industry/api/emsproxy/eventcollection/festival?filtername=title&filtervalue=" + titlevalue + "&trimresult=true&mode=json";
      $scope.pagename = "Film List - " + titlevalue.toUpperCase();      
      $myTiffService.getTiffApiData(apiurl).then(function (data) {
          if (data == "Error") {
              $scope.pagename = "Film List - Error";
              $scope.navdata = "Error getting data. Check cross domain issues?";
          } else {
              $scope.pagename = "Film List - " + titlevalue.toUpperCase() + ".";
              $scope.navdata = data;
          }
      });
  }]);

gpAppControllers.controller('EventCtrl', ['$scope', 'myTiffService', '$sce',
  function ($scope, $myTiffService, $sce) {
      //$sce is used to render html in filmnote and filmpitch data
      $scope.pagename = "Tiff - ";
      $scope.havechildren = false;
      $scope.haveparent = false;
      var eventid = getUrlVars()["eventid"];
      //var apiurl = "/emsproxy/event/" + eventid + "?mode=json";
      var apiurl = "https://apps.tiff.net/industry/api/emsproxy/event/" + eventid + "?mode=json";
      $myTiffService.getTiffApiData(apiurl).then(function (data) {
          if (data == "Error") {
              $scope.pagename = "Event Detail - Error";
              $scope.eventdata = "Error getting data. Check cross domain issues?";
          } else {              
              $scope.eventdata = data;
              $scope.filmpitch = "";
              $scope.filmnote = "";
              var eventitle = "";
              if (data.EventCollection[0] != null) {
                  if (data.EventCollection[0].article != null) {
                      eventitle = eventitle + data.EventCollection[0].article + " ";
                  }
                  if (data.EventCollection[0].title != null) {
                      eventitle = eventitle + data.EventCollection[0].title;
                  }
                  if (data.EventCollection[0].filmpitch != null) {
                      $scope.filmpitch = $sce.trustAsHtml(data.EventCollection[0].filmpitch);
                  }
                  if (data.EventCollection[0].filmnote != null) {
                      $scope.filmnote = $sce.trustAsHtml(data.EventCollection[0].filmnote);
                  }
                  if (data.EventCollection[0].children != null) {
                      if (data.EventCollection[0].children[0] != null) {
                          $scope.havechildren = true;
                      }
                  }
                  if (data.EventCollection[0].parents != null) {
                      if (data.EventCollection[0].parents[0] != null) {
                          $scope.haveparent = true;
                          // todo merge parent schedule into event schedule for display in child page
                          //for (var i = 0, l = data.EventCollection[0].parents.length; i < l; i++) {
                          //    if (data.EventCollection[0].parents[i].schedule != null) {
                          //        for (var j = 0, m = data.EventCollection[0].parents[i].schedule[j]; j < m; j++) {
                          //            data.EventCollection[0].schedule.push(data.EventCollection[0].parents[i].schedule[j]);
                          //        }
                          //    }
                          //}
                      }
                  }
                  // sample code to create the carousel data
                  if (data.EventCollection[0].relatedmedia != null) {
                      if (data.EventCollection[0].relatedmedia.length > 0) {
                          for (var i = 0, l = data.EventCollection[0].relatedmedia.length; i < l; i++) {
                              var imgtag = '<img id="carousel_'+ i.toString()+'" src="' + data.EventCollection[0].relatedmedia[i].url + '" style="width:100%" />';
                              // data in some films have the placeholder as valid image
                              // ignore if film has more than one image
                              if (l > 1) {
                                  if (imgtag.indexOf("placeholder_film_still") == -1) {
                                      $('.cycle-slideshow').cycle('add', imgtag);
                                  }
                              } else {
                                  $('.cycle-slideshow').cycle('add', imgtag);
                              }
                          }
                      } else {
                          var imgtag = '<img src="img/placeholder_film_still.gif" style="width:100%" />';
                          $('.cycle-slideshow').cycle('add', imgtag);
                      }
                  } else {
                      var imgtag = '<img src="img/placeholder_film_still.gif" style="width:100%" />';
                      $('.cycle-slideshow').cycle('add', imgtag);
                  }
              }
              $scope.pagename = eventitle;
          }
      });      
  }]);

gpAppControllers.controller('ScheduleCtrl', ['$scope',
  function ($scope) {
      $scope.mymenuitems = [
      new MenuItem("Thursday, Sept 4", "scheddate.html?day=04-09-2014", "img/calendaricon2.png"),
      new MenuItem("Friday, Sept 5", "scheddate.html?day=05-09-2014", "img/calendaricon2.png"),
      new MenuItem("Saturday, Sept 6", "scheddate.html?day=06-09-2014", "img/calendaricon2.png"),
      new MenuItem("Sunday, Sept 7", "scheddate.html?day=07-09-2014", "img/calendaricon2.png"),
      new MenuItem("Monday, Sept 8", "scheddate.html?day=08-09-2014", "img/calendaricon2.png"),
      new MenuItem("Tuesday, Sept 9", "scheddate.html?day=09-09-2014", "img/calendaricon2.png"),
      new MenuItem("Wednesday, Sept 10", "scheddate.html?day=10-09-2014", "img/calendaricon2.png"),
      new MenuItem("Thursday, Sept 11", "scheddate.html?day=11-09-2014", "img/calendaricon2.png"),
      new MenuItem("Friday, Sept 12", "scheddate.html?day=12-09-2014", "img/calendaricon2.png"),
      new MenuItem("Saturday, Sept 13", "scheddate.html?day=13-09-2014", "img/calendaricon2.png"),
      new MenuItem("Sunday, Sept 14", "scheddate.html?day=14-09-2014", "img/calendaricon2.png")
      ];
      $scope.pagename = "Festival Public Schedule";
  }]);

gpAppControllers.controller('PIScheduleCtrl', ['$scope',
  function ($scope) {
      $scope.mymenuitems = [
      new MenuItem("Thursday, Sept 4", "pischeddate.html?day=04-09-2014", "img/calendaricon2.png"),
      new MenuItem("Friday, Sept 5", "pischeddate.html?day=05-09-2014", "img/calendaricon2.png"),
      new MenuItem("Saturday, Sept 6", "pischeddate.html?day=06-09-2014", "img/calendaricon2.png"),
      new MenuItem("Sunday, Sept 7", "pischeddate.html?day=07-09-2014", "img/calendaricon2.png"),
      new MenuItem("Monday, Sept 8", "pischeddate.html?day=08-09-2014", "img/calendaricon2.png"),
      new MenuItem("Tuesday, Sept 9", "pischeddate.html?day=09-09-2014", "img/calendaricon2.png"),
      new MenuItem("Wednesday, Sept 10", "pischeddate.html?day=10-09-2014", "img/calendaricon2.png"),
      new MenuItem("Thursday, Sept 11", "pischeddate.html?day=11-09-2014", "img/calendaricon2.png"),
      new MenuItem("Friday, Sept 12", "pischeddate.html?day=12-09-2014", "img/calendaricon2.png")      
      ];
      $scope.pagename = "Festival P&I Schedule";
  }]);

gpAppControllers.controller('SchedDateCtrl', ['$scope', 'myTiffService',
  function ($scope, $myTiffService) {
      var scheddate = getUrlVars()["day"]
      var apiurl = "https://apps.tiff.net/industry/api/emsproxy/schedule/" + scheddate + "?mode=json";
      $scope.pagename = "Tiff Schedule - " + scheddate;  
      $myTiffService.getTiffApiData(apiurl).then(function (data) {
          if (data == "Error") {
              $scope.pagename = "Tiff Schedule - Error";
              $scope.scheddata = "Error getting data. Check cross domain issues?";
          } else {
              $scope.scheddata = data;
              $scope.pagename = "Tiff Schedule - " + scheddate + ".";
          }
      });
  }]);

gpAppControllers.controller('PISchedDateCtrl', ['$scope', 'myTiffService',
  function ($scope, $myTiffService) {
      var scheddate = getUrlVars()["day"]
      var apiurl = "https://apps.tiff.net/industry/api/emsproxy/schedule/" + scheddate + "?scheduletypes=1&mode=json";
      $scope.pagename = "Tiff Schedule - " + scheddate;      
      $myTiffService.getTiffApiData(apiurl).then(function (data) {
          if (data == "Error") {
              $scope.pagename = "Tiff P&I Schedule - Error";
              $scope.scheddata = "Error getting data. Check cross domain issues?";
          } else {
              $scope.scheddata = data;
              $scope.pagename = "Tiff P&I Schedule - " + scheddate + ".";
          }
      });
  }]);

gpAppControllers.controller('ProgrammesCtrl', ['$scope',
  function ($scope) {
      $scope.mymenuitems = [
      new MenuItem("Gala Presentations", "programme.html?programme=Gala+Presentation", "img/movieicon2.png"),
      new MenuItem("Masters", "programme.html?programme=Masters", "img/movieicon2.png"),
      new MenuItem("Special Presentations", "programme.html?programme=Special+Presentation", "img/movieicon2.png"),
      new MenuItem("Mavericks", "programme.html?programme=Mavericks", "img/movieicon2.png"),
      new MenuItem("Discovery", "programme.html?programme=Discovery", "img/movieicon2.png"),
      new MenuItem("Tiff Docs", "programme.html?programme=Tiff+Docs", "img/movieicon2.png"),
      new MenuItem("Contemporary World Cinema", "programme.html?programme=Contemporary+World+Cinema", "img/movieicon2.png"),
      new MenuItem("Wavelengths", "programme.html?programme=Wavelengths", "img/movieicon2.png"),
      new MenuItem("Tiff Kids", "programme.html?programme=Tiff+Kids", "img/movieicon2.png"),
      new MenuItem("City To City", "programme.html?programme=City+To+City", "img/movieicon2.png"),
      new MenuItem("Short Cuts Canada", "programme.html?programme=Short+Cuts+Canada", "img/movieicon2.png"),
      new MenuItem("Short Cuts International", "programme.html?programme=Short+Cuts+International", "img/movieicon2.png"),
      new MenuItem("Tiff Cinematheque", "programme.html?programme=Tiff+Cinematheque", "img/movieicon2.png"),
      new MenuItem("Future Projections", "programme.html?programme=Future+Projections", "img/movieicon2.png"),
      new MenuItem("Vanguard", "programme.html?programme=Vanguard", "img/movieicon2.png"),
      new MenuItem("Midnight Madness", "programme.html?programme=Midnight+Madness", "img/movieicon2.png"),
      new MenuItem("Next Wave", "programme.html?programme=Next+Wave", "img/movieicon2.png"),
      new MenuItem("Manifesto", "programme.html?programme=Manifesto", "img/movieicon2.png")
      ];
      $scope.pagename = "Festival Programmes";
  }]);

gpAppControllers.controller('SingleProgrammeCtrl', ['$scope', 'myTiffService',
  function ($scope, $myTiffService) {
      var myprogramme = getUrlVars()["programme"];
      // deal with exception where we filter by tags instead of programmes data
      var myfiltername = "programmes.programmeSeries";
      if (myprogramme == "Manifesto" || myprogramme == "Next+Wave") {
          myfiltername = "tags.tagText";
      }
      var apiurl = "https://apps.tiff.net/industry/api/emsproxy/eventcollection/festival?filtername=" + myfiltername + "&filtervalue=" + myprogramme + "&trimresult=true&mode=json";
      $scope.pagename = "Film List - " + myprogramme.replace("+", " ");
      $myTiffService.getTiffApiData(apiurl).then(function (data) {
          if (data == "Error") {
              $scope.pagename = "Film List - Error";
              $scope.navdata = "Error getting data. Check cross domain issues?";
          } else {
              $scope.pagename = "Film List - " + myprogramme.replace("+", " ") + ".";
              $scope.navdata = data;
          }
      });
  }]);

gpAppControllers.controller('SearchCtrl', ['$scope', 'myTiffService',
  function ($scope, $myTiffService) {
      var mysearch = getUrlVars()["q"];
      var apiurl = "https://apps.tiff.net/industry/api/emsproxy/eventcollection/festivalsearch?q=" + mysearch + "&trimresult=true&mode=json";
      $scope.pagename = "Film Search - " + mysearch.replace("+", " ");     
      $myTiffService.getTiffApiData(apiurl).then(function (data) {
          if (data == "Error") {
              $scope.pagename = "Film Search - Error";
              $scope.navdata = "Error getting data. Check cross domain issues?";
          } else {
              $scope.pagename = "Film Search Results For: " + mysearch.replace("+", " ");
              $scope.navdata = data;
          }
      });
  }]);














