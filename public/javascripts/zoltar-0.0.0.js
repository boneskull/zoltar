'use strict';

angular.module('zoltarApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

'use strict';

angular.module('zoltarApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

/**
 * @license AngularJS v1.1.5
 * (c) 2010-2012 Google, Inc. http://angularjs.org
 * License: MIT
 *
 * TODO(vojta): wrap whole file into closure during build
 */

/**
 * @ngdoc overview
 * @name angular.mock
 * @description
 *
 * Namespace from 'angular-mocks.js' which contains testing related code.
 */
angular.mock = {};

/**
 * ! This is a private undocumented service !
 *
 * @name ngMock.$browser
 *
 * @description
 * This service is a mock implementation of {@link ng.$browser}. It provides fake
 * implementation for commonly used browser apis that are hard to test, e.g. setTimeout, xhr,
 * cookies, etc...
 *
 * The api of this service is the same as that of the real {@link ng.$browser $browser}, except
 * that there are several helper methods available which can be used in tests.
 */
angular.mock.$BrowserProvider = function() {
  this.$get = function(){
    return new angular.mock.$Browser();
  };
};

angular.mock.$Browser = function() {
  var self = this;

  this.isMock = true;
  self.$$url = "http://server/";
  self.$$lastUrl = self.$$url; // used by url polling fn
  self.pollFns = [];

  // TODO(vojta): remove this temporary api
  self.$$completeOutstandingRequest = angular.noop;
  self.$$incOutstandingRequestCount = angular.noop;


  // register url polling fn

  self.onUrlChange = function(listener) {
    self.pollFns.push(
      function() {
        if (self.$$lastUrl != self.$$url) {
          self.$$lastUrl = self.$$url;
          listener(self.$$url);
        }
      }
    );

    return listener;
  };

  self.cookieHash = {};
  self.lastCookieHash = {};
  self.deferredFns = [];
  self.deferredNextId = 0;

  self.defer = function(fn, delay) {
    delay = delay || 0;
    self.deferredFns.push({time:(self.defer.now + delay), fn:fn, id: self.deferredNextId});
    self.deferredFns.sort(function(a,b){ return a.time - b.time;});
    return self.deferredNextId++;
  };


  self.defer.now = 0;


  self.defer.cancel = function(deferId) {
    var fnIndex;

    angular.forEach(self.deferredFns, function(fn, index) {
      if (fn.id === deferId) fnIndex = index;
    });

    if (fnIndex !== undefined) {
      self.deferredFns.splice(fnIndex, 1);
      return true;
    }

    return false;
  };


  /**
   * @name ngMock.$browser#defer.flush
   * @methodOf ngMock.$browser
   *
   * @description
   * Flushes all pending requests and executes the defer callbacks.
   *
   * @param {number=} number of milliseconds to flush. See {@link #defer.now}
   */
  self.defer.flush = function(delay) {
    if (angular.isDefined(delay)) {
      self.defer.now += delay;
    } else {
      if (self.deferredFns.length) {
        self.defer.now = self.deferredFns[self.deferredFns.length-1].time;
      } else {
        throw Error('No deferred tasks to be flushed');
      }
    }

    while (self.deferredFns.length && self.deferredFns[0].time <= self.defer.now) {
      self.deferredFns.shift().fn();
    }
  };
  /**
   * @name ngMock.$browser#defer.now
   * @propertyOf ngMock.$browser
   *
   * @description
   * Current milliseconds mock time.
   */

  self.$$baseHref = '';
  self.baseHref = function() {
    return this.$$baseHref;
  };
};
angular.mock.$Browser.prototype = {

/**
  * @name ngMock.$browser#poll
  * @methodOf ngMock.$browser
  *
  * @description
  * run all fns in pollFns
  */
  poll: function poll() {
    angular.forEach(this.pollFns, function(pollFn){
      pollFn();
    });
  },

  addPollFn: function(pollFn) {
    this.pollFns.push(pollFn);
    return pollFn;
  },

  url: function(url, replace) {
    if (url) {
      this.$$url = url;
      return this;
    }

    return this.$$url;
  },

  cookies:  function(name, value) {
    if (name) {
      if (value == undefined) {
        delete this.cookieHash[name];
      } else {
        if (angular.isString(value) &&       //strings only
            value.length <= 4096) {          //strict cookie storage limits
          this.cookieHash[name] = value;
        }
      }
    } else {
      if (!angular.equals(this.cookieHash, this.lastCookieHash)) {
        this.lastCookieHash = angular.copy(this.cookieHash);
        this.cookieHash = angular.copy(this.cookieHash);
      }
      return this.cookieHash;
    }
  },

  notifyWhenNoOutstandingRequests: function(fn) {
    fn();
  }
};


/**
 * @ngdoc object
 * @name ngMock.$exceptionHandlerProvider
 *
 * @description
 * Configures the mock implementation of {@link ng.$exceptionHandler} to rethrow or to log errors passed
 * into the `$exceptionHandler`.
 */

/**
 * @ngdoc object
 * @name ngMock.$exceptionHandler
 *
 * @description
 * Mock implementation of {@link ng.$exceptionHandler} that rethrows or logs errors passed
 * into it. See {@link ngMock.$exceptionHandlerProvider $exceptionHandlerProvider} for configuration
 * information.
 *
 *
 * <pre>
 *   describe('$exceptionHandlerProvider', function() {
 *
 *     it('should capture log messages and exceptions', function() {
 *
 *       module(function($exceptionHandlerProvider) {
 *         $exceptionHandlerProvider.mode('log');
 *       });
 *
 *       inject(function($log, $exceptionHandler, $timeout) {
 *         $timeout(function() { $log.log(1); });
 *         $timeout(function() { $log.log(2); throw 'banana peel'; });
 *         $timeout(function() { $log.log(3); });
 *         expect($exceptionHandler.errors).toEqual([]);
 *         expect($log.assertEmpty());
 *         $timeout.flush();
 *         expect($exceptionHandler.errors).toEqual(['banana peel']);
 *         expect($log.log.logs).toEqual([[1], [2], [3]]);
 *       });
 *     });
 *   });
 * </pre>
 */

angular.mock.$ExceptionHandlerProvider = function() {
  var handler;

  /**
   * @ngdoc method
   * @name ngMock.$exceptionHandlerProvider#mode
   * @methodOf ngMock.$exceptionHandlerProvider
   *
   * @description
   * Sets the logging mode.
   *
   * @param {string} mode Mode of operation, defaults to `rethrow`.
   *
   *   - `rethrow`: If any errors are passed into the handler in tests, it typically
   *                means that there is a bug in the application or test, so this mock will
   *                make these tests fail.
   *   - `log`: Sometimes it is desirable to test that an error is thrown, for this case the `log` mode stores an
   *            array of errors in `$exceptionHandler.errors`, to allow later assertion of them.
   *            See {@link ngMock.$log#assertEmpty assertEmpty()} and
   *             {@link ngMock.$log#reset reset()}
   */
  this.mode = function(mode) {
    switch(mode) {
      case 'rethrow':
        handler = function(e) {
          throw e;
        };
        break;
      case 'log':
        var errors = [];

        handler = function(e) {
          if (arguments.length == 1) {
            errors.push(e);
          } else {
            errors.push([].slice.call(arguments, 0));
          }
        };

        handler.errors = errors;
        break;
      default:
        throw Error("Unknown mode '" + mode + "', only 'log'/'rethrow' modes are allowed!");
    }
  };

  this.$get = function() {
    return handler;
  };

  this.mode('rethrow');
};


/**
 * @ngdoc service
 * @name ngMock.$log
 *
 * @description
 * Mock implementation of {@link ng.$log} that gathers all logged messages in arrays
 * (one array per logging level). These arrays are exposed as `logs` property of each of the
 * level-specific log function, e.g. for level `error` the array is exposed as `$log.error.logs`.
 *
 */
angular.mock.$LogProvider = function() {

  function concat(array1, array2, index) {
    return array1.concat(Array.prototype.slice.call(array2, index));
  }


  this.$get = function () {
    var $log = {
      log: function() { $log.log.logs.push(concat([], arguments, 0)); },
      warn: function() { $log.warn.logs.push(concat([], arguments, 0)); },
      info: function() { $log.info.logs.push(concat([], arguments, 0)); },
      error: function() { $log.error.logs.push(concat([], arguments, 0)); }
    };

    /**
     * @ngdoc method
     * @name ngMock.$log#reset
     * @methodOf ngMock.$log
     *
     * @description
     * Reset all of the logging arrays to empty.
     */
    $log.reset = function () {
      /**
       * @ngdoc property
       * @name ngMock.$log#log.logs
       * @propertyOf ngMock.$log
       *
       * @description
       * Array of messages logged using {@link ngMock.$log#log}.
       *
       * @example
       * <pre>
       * $log.log('Some Log');
       * var first = $log.log.logs.unshift();
       * </pre>
       */
      $log.log.logs = [];
      /**
       * @ngdoc property
       * @name ngMock.$log#warn.logs
       * @propertyOf ngMock.$log
       *
       * @description
       * Array of messages logged using {@link ngMock.$log#warn}.
       *
       * @example
       * <pre>
       * $log.warn('Some Warning');
       * var first = $log.warn.logs.unshift();
       * </pre>
       */
      $log.warn.logs = [];
      /**
       * @ngdoc property
       * @name ngMock.$log#info.logs
       * @propertyOf ngMock.$log
       *
       * @description
       * Array of messages logged using {@link ngMock.$log#info}.
       *
       * @example
       * <pre>
       * $log.info('Some Info');
       * var first = $log.info.logs.unshift();
       * </pre>
       */
      $log.info.logs = [];
      /**
       * @ngdoc property
       * @name ngMock.$log#error.logs
       * @propertyOf ngMock.$log
       *
       * @description
       * Array of messages logged using {@link ngMock.$log#error}.
       *
       * @example
       * <pre>
       * $log.log('Some Error');
       * var first = $log.error.logs.unshift();
       * </pre>
       */
      $log.error.logs = [];
    };

    /**
     * @ngdoc method
     * @name ngMock.$log#assertEmpty
     * @methodOf ngMock.$log
     *
     * @description
     * Assert that the all of the logging methods have no logged messages. If messages present, an exception is thrown.
     */
    $log.assertEmpty = function() {
      var errors = [];
      angular.forEach(['error', 'warn', 'info', 'log'], function(logLevel) {
        angular.forEach($log[logLevel].logs, function(log) {
          angular.forEach(log, function (logItem) {
            errors.push('MOCK $log (' + logLevel + '): ' + String(logItem) + '\n' + (logItem.stack || ''));
          });
        });
      });
      if (errors.length) {
        errors.unshift("Expected $log to be empty! Either a message was logged unexpectedly, or an expected " +
          "log message was not checked and removed:");
        errors.push('');
        throw new Error(errors.join('\n---------\n'));
      }
    };

    $log.reset();
    return $log;
  };
};


(function() {
  var R_ISO8061_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?:\:?(\d\d)(?:\:?(\d\d)(?:\.(\d{3}))?)?)?(Z|([+-])(\d\d):?(\d\d)))?$/;

  function jsonStringToDate(string){
    var match;
    if (match = string.match(R_ISO8061_STR)) {
      var date = new Date(0),
          tzHour = 0,
          tzMin  = 0;
      if (match[9]) {
        tzHour = int(match[9] + match[10]);
        tzMin = int(match[9] + match[11]);
      }
      date.setUTCFullYear(int(match[1]), int(match[2]) - 1, int(match[3]));
      date.setUTCHours(int(match[4]||0) - tzHour, int(match[5]||0) - tzMin, int(match[6]||0), int(match[7]||0));
      return date;
    }
    return string;
  }

  function int(str) {
    return parseInt(str, 10);
  }

  function padNumber(num, digits, trim) {
    var neg = '';
    if (num < 0) {
      neg =  '-';
      num = -num;
    }
    num = '' + num;
    while(num.length < digits) num = '0' + num;
    if (trim)
      num = num.substr(num.length - digits);
    return neg + num;
  }


  /**
   * @ngdoc object
   * @name angular.mock.TzDate
   * @description
   *
   * *NOTE*: this is not an injectable instance, just a globally available mock class of `Date`.
   *
   * Mock of the Date type which has its timezone specified via constructor arg.
   *
   * The main purpose is to create Date-like instances with timezone fixed to the specified timezone
   * offset, so that we can test code that depends on local timezone settings without dependency on
   * the time zone settings of the machine where the code is running.
   *
   * @param {number} offset Offset of the *desired* timezone in hours (fractions will be honored)
   * @param {(number|string)} timestamp Timestamp representing the desired time in *UTC*
   *
   * @example
   * !!!! WARNING !!!!!
   * This is not a complete Date object so only methods that were implemented can be called safely.
   * To make matters worse, TzDate instances inherit stuff from Date via a prototype.
   *
   * We do our best to intercept calls to "unimplemented" methods, but since the list of methods is
   * incomplete we might be missing some non-standard methods. This can result in errors like:
   * "Date.prototype.foo called on incompatible Object".
   *
   * <pre>
   * var newYearInBratislava = new TzDate(-1, '2009-12-31T23:00:00Z');
   * newYearInBratislava.getTimezoneOffset() => -60;
   * newYearInBratislava.getFullYear() => 2010;
   * newYearInBratislava.getMonth() => 0;
   * newYearInBratislava.getDate() => 1;
   * newYearInBratislava.getHours() => 0;
   * newYearInBratislava.getMinutes() => 0;
   * newYearInBratislava.getSeconds() => 0;
   * </pre>
   *
   */
  angular.mock.TzDate = function (offset, timestamp) {
    var self = new Date(0);
    if (angular.isString(timestamp)) {
      var tsStr = timestamp;

      self.origDate = jsonStringToDate(timestamp);

      timestamp = self.origDate.getTime();
      if (isNaN(timestamp))
        throw {
          name: "Illegal Argument",
          message: "Arg '" + tsStr + "' passed into TzDate constructor is not a valid date string"
        };
    } else {
      self.origDate = new Date(timestamp);
    }

    var localOffset = new Date(timestamp).getTimezoneOffset();
    self.offsetDiff = localOffset*60*1000 - offset*1000*60*60;
    self.date = new Date(timestamp + self.offsetDiff);

    self.getTime = function() {
      return self.date.getTime() - self.offsetDiff;
    };

    self.toLocaleDateString = function() {
      return self.date.toLocaleDateString();
    };

    self.getFullYear = function() {
      return self.date.getFullYear();
    };

    self.getMonth = function() {
      return self.date.getMonth();
    };

    self.getDate = function() {
      return self.date.getDate();
    };

    self.getHours = function() {
      return self.date.getHours();
    };

    self.getMinutes = function() {
      return self.date.getMinutes();
    };

    self.getSeconds = function() {
      return self.date.getSeconds();
    };

    self.getMilliseconds = function() {
      return self.date.getMilliseconds();
    };

    self.getTimezoneOffset = function() {
      return offset * 60;
    };

    self.getUTCFullYear = function() {
      return self.origDate.getUTCFullYear();
    };

    self.getUTCMonth = function() {
      return self.origDate.getUTCMonth();
    };

    self.getUTCDate = function() {
      return self.origDate.getUTCDate();
    };

    self.getUTCHours = function() {
      return self.origDate.getUTCHours();
    };

    self.getUTCMinutes = function() {
      return self.origDate.getUTCMinutes();
    };

    self.getUTCSeconds = function() {
      return self.origDate.getUTCSeconds();
    };

    self.getUTCMilliseconds = function() {
      return self.origDate.getUTCMilliseconds();
    };

    self.getDay = function() {
      return self.date.getDay();
    };

    // provide this method only on browsers that already have it
    if (self.toISOString) {
      self.toISOString = function() {
        return padNumber(self.origDate.getUTCFullYear(), 4) + '-' +
              padNumber(self.origDate.getUTCMonth() + 1, 2) + '-' +
              padNumber(self.origDate.getUTCDate(), 2) + 'T' +
              padNumber(self.origDate.getUTCHours(), 2) + ':' +
              padNumber(self.origDate.getUTCMinutes(), 2) + ':' +
              padNumber(self.origDate.getUTCSeconds(), 2) + '.' +
              padNumber(self.origDate.getUTCMilliseconds(), 3) + 'Z'
      }
    }

    //hide all methods not implemented in this mock that the Date prototype exposes
    var unimplementedMethods = ['getUTCDay',
        'getYear', 'setDate', 'setFullYear', 'setHours', 'setMilliseconds',
        'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate', 'setUTCFullYear',
        'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds',
        'setYear', 'toDateString', 'toGMTString', 'toJSON', 'toLocaleFormat', 'toLocaleString',
        'toLocaleTimeString', 'toSource', 'toString', 'toTimeString', 'toUTCString', 'valueOf'];

    angular.forEach(unimplementedMethods, function(methodName) {
      self[methodName] = function() {
        throw Error("Method '" + methodName + "' is not implemented in the TzDate mock");
      };
    });

    return self;
  };

  //make "tzDateInstance instanceof Date" return true
  angular.mock.TzDate.prototype = Date.prototype;
})();

/**
 * @ngdoc function
 * @name angular.mock.createMockWindow
 * @description
 *
 * This function creates a mock window object useful for controlling access ot setTimeout, but mocking out
 * sufficient window's properties to allow Angular to execute.
 *
 * @example
 *
 * <pre>
    beforeEach(module(function($provide) {
      $provide.value('$window', window = angular.mock.createMockWindow());
    }));

    it('should do something', inject(function($window) {
      var val = null;
      $window.setTimeout(function() { val = 123; }, 10);
      expect(val).toEqual(null);
      window.setTimeout.expect(10).process();
      expect(val).toEqual(123);
    });
 * </pre>
 *
 */
angular.mock.createMockWindow = function() {
  var mockWindow = {};
  var setTimeoutQueue = [];

  mockWindow.document = window.document;
  mockWindow.getComputedStyle = angular.bind(window, window.getComputedStyle);
  mockWindow.scrollTo = angular.bind(window, window.scrollTo);
  mockWindow.navigator = window.navigator;
  mockWindow.setTimeout = function(fn, delay) {
    setTimeoutQueue.push({fn: fn, delay: delay});
  };
  mockWindow.setTimeout.queue = setTimeoutQueue;
  mockWindow.setTimeout.expect = function(delay) {
    if (setTimeoutQueue.length > 0) {
      return {
        process: function() {
          var tick = setTimeoutQueue.shift();
          expect(tick.delay).toEqual(delay);
          tick.fn();
        }
      };
    } else {
      expect('SetTimoutQueue empty. Expecting delay of ').toEqual(delay);
    }
  };

  return mockWindow;
};

/**
 * @ngdoc function
 * @name angular.mock.dump
 * @description
 *
 * *NOTE*: this is not an injectable instance, just a globally available function.
 *
 * Method for serializing common angular objects (scope, elements, etc..) into strings, useful for debugging.
 *
 * This method is also available on window, where it can be used to display objects on debug console.
 *
 * @param {*} object - any object to turn into string.
 * @return {string} a serialized string of the argument
 */
angular.mock.dump = function(object) {
  return serialize(object);

  function serialize(object) {
    var out;

    if (angular.isElement(object)) {
      object = angular.element(object);
      out = angular.element('<div></div>');
      angular.forEach(object, function(element) {
        out.append(angular.element(element).clone());
      });
      out = out.html();
    } else if (angular.isArray(object)) {
      out = [];
      angular.forEach(object, function(o) {
        out.push(serialize(o));
      });
      out = '[ ' + out.join(', ') + ' ]';
    } else if (angular.isObject(object)) {
      if (angular.isFunction(object.$eval) && angular.isFunction(object.$apply)) {
        out = serializeScope(object);
      } else if (object instanceof Error) {
        out = object.stack || ('' + object.name + ': ' + object.message);
      } else {
        out = angular.toJson(object, true);
      }
    } else {
      out = String(object);
    }

    return out;
  }

  function serializeScope(scope, offset) {
    offset = offset ||  '  ';
    var log = [offset + 'Scope(' + scope.$id + '): {'];
    for ( var key in scope ) {
      if (scope.hasOwnProperty(key) && !key.match(/^(\$|this)/)) {
        log.push('  ' + key + ': ' + angular.toJson(scope[key]));
      }
    }
    var child = scope.$$childHead;
    while(child) {
      log.push(serializeScope(child, offset + '  '));
      child = child.$$nextSibling;
    }
    log.push('}');
    return log.join('\n' + offset);
  }
};

/**
 * @ngdoc object
 * @name ngMock.$httpBackend
 * @description
 * Fake HTTP backend implementation suitable for unit testing applications that use the
 * {@link ng.$http $http service}.
 *
 * *Note*: For fake HTTP backend implementation suitable for end-to-end testing or backend-less
 * development please see {@link ngMockE2E.$httpBackend e2e $httpBackend mock}.
 *
 * During unit testing, we want our unit tests to run quickly and have no external dependencies so
 * we don’t want to send {@link https://developer.mozilla.org/en/xmlhttprequest XHR} or
 * {@link http://en.wikipedia.org/wiki/JSONP JSONP} requests to a real server. All we really need is
 * to verify whether a certain request has been sent or not, or alternatively just let the
 * application make requests, respond with pre-trained responses and assert that the end result is
 * what we expect it to be.
 *
 * This mock implementation can be used to respond with static or dynamic responses via the
 * `expect` and `when` apis and their shortcuts (`expectGET`, `whenPOST`, etc).
 *
 * When an Angular application needs some data from a server, it calls the $http service, which
 * sends the request to a real server using $httpBackend service. With dependency injection, it is
 * easy to inject $httpBackend mock (which has the same API as $httpBackend) and use it to verify
 * the requests and respond with some testing data without sending a request to real server.
 *
 * There are two ways to specify what test data should be returned as http responses by the mock
 * backend when the code under test makes http requests:
 *
 * - `$httpBackend.expect` - specifies a request expectation
 * - `$httpBackend.when` - specifies a backend definition
 *
 *
 * # Request Expectations vs Backend Definitions
 *
 * Request expectations provide a way to make assertions about requests made by the application and
 * to define responses for those requests. The test will fail if the expected requests are not made
 * or they are made in the wrong order.
 *
 * Backend definitions allow you to define a fake backend for your application which doesn't assert
 * if a particular request was made or not, it just returns a trained response if a request is made.
 * The test will pass whether or not the request gets made during testing.
 *
 *
 * <table class="table">
 *   <tr><th width="220px"></th><th>Request expectations</th><th>Backend definitions</th></tr>
 *   <tr>
 *     <th>Syntax</th>
 *     <td>.expect(...).respond(...)</td>
 *     <td>.when(...).respond(...)</td>
 *   </tr>
 *   <tr>
 *     <th>Typical usage</th>
 *     <td>strict unit tests</td>
 *     <td>loose (black-box) unit testing</td>
 *   </tr>
 *   <tr>
 *     <th>Fulfills multiple requests</th>
 *     <td>NO</td>
 *     <td>YES</td>
 *   </tr>
 *   <tr>
 *     <th>Order of requests matters</th>
 *     <td>YES</td>
 *     <td>NO</td>
 *   </tr>
 *   <tr>
 *     <th>Request required</th>
 *     <td>YES</td>
 *     <td>NO</td>
 *   </tr>
 *   <tr>
 *     <th>Response required</th>
 *     <td>optional (see below)</td>
 *     <td>YES</td>
 *   </tr>
 * </table>
 *
 * In cases where both backend definitions and request expectations are specified during unit
 * testing, the request expectations are evaluated first.
 *
 * If a request expectation has no response specified, the algorithm will search your backend
 * definitions for an appropriate response.
 *
 * If a request didn't match any expectation or if the expectation doesn't have the response
 * defined, the backend definitions are evaluated in sequential order to see if any of them match
 * the request. The response from the first matched definition is returned.
 *
 *
 * # Flushing HTTP requests
 *
 * The $httpBackend used in production, always responds to requests with responses asynchronously.
 * If we preserved this behavior in unit testing, we'd have to create async unit tests, which are
 * hard to write, follow and maintain. At the same time the testing mock, can't respond
 * synchronously because that would change the execution of the code under test. For this reason the
 * mock $httpBackend has a `flush()` method, which allows the test to explicitly flush pending
 * requests and thus preserving the async api of the backend, while allowing the test to execute
 * synchronously.
 *
 *
 * # Unit testing with mock $httpBackend
 *
 * <pre>
   // controller
   function MyController($scope, $http) {
     $http.get('/auth.py').success(function(data) {
       $scope.user = data;
     });

     this.saveMessage = function(message) {
       $scope.status = 'Saving...';
       $http.post('/add-msg.py', message).success(function(response) {
         $scope.status = '';
       }).error(function() {
         $scope.status = 'ERROR!';
       });
     };
   }

   // testing controller
   var $httpBackend;

   beforeEach(inject(function($injector) {
     $httpBackend = $injector.get('$httpBackend');

     // backend definition common for all tests
     $httpBackend.when('GET', '/auth.py').respond({userId: 'userX'}, {'A-Token': 'xxx'});
   }));


   afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });


   it('should fetch authentication token', function() {
     $httpBackend.expectGET('/auth.py');
     var controller = scope.$new(MyController);
     $httpBackend.flush();
   });


   it('should send msg to server', function() {
     // now you don’t care about the authentication, but
     // the controller will still send the request and
     // $httpBackend will respond without you having to
     // specify the expectation and response for this request
     $httpBackend.expectPOST('/add-msg.py', 'message content').respond(201, '');

     var controller = scope.$new(MyController);
     $httpBackend.flush();
     controller.saveMessage('message content');
     expect(controller.status).toBe('Saving...');
     $httpBackend.flush();
     expect(controller.status).toBe('');
   });


   it('should send auth header', function() {
     $httpBackend.expectPOST('/add-msg.py', undefined, function(headers) {
       // check if the header was send, if it wasn't the expectation won't
       // match the request and the test will fail
       return headers['Authorization'] == 'xxx';
     }).respond(201, '');

     var controller = scope.$new(MyController);
     controller.saveMessage('whatever');
     $httpBackend.flush();
   });
   </pre>
 */
angular.mock.$HttpBackendProvider = function() {
  this.$get = ['$rootScope', createHttpBackendMock];
};

/**
 * General factory function for $httpBackend mock.
 * Returns instance for unit testing (when no arguments specified):
 *   - passing through is disabled
 *   - auto flushing is disabled
 *
 * Returns instance for e2e testing (when `$delegate` and `$browser` specified):
 *   - passing through (delegating request to real backend) is enabled
 *   - auto flushing is enabled
 *
 * @param {Object=} $delegate Real $httpBackend instance (allow passing through if specified)
 * @param {Object=} $browser Auto-flushing enabled if specified
 * @return {Object} Instance of $httpBackend mock
 */
function createHttpBackendMock($rootScope, $delegate, $browser) {
  var definitions = [],
      expectations = [],
      responses = [],
      responsesPush = angular.bind(responses, responses.push);

  function createResponse(status, data, headers) {
    if (angular.isFunction(status)) return status;

    return function() {
      return angular.isNumber(status)
          ? [status, data, headers]
          : [200, status, data];
    };
  }

  // TODO(vojta): change params to: method, url, data, headers, callback
  function $httpBackend(method, url, data, callback, headers, timeout) {
    var xhr = new MockXhr(),
        expectation = expectations[0],
        wasExpected = false;

    function prettyPrint(data) {
      return (angular.isString(data) || angular.isFunction(data) || data instanceof RegExp)
          ? data
          : angular.toJson(data);
    }

    function wrapResponse(wrapped) {
      if (!$browser && timeout && timeout.then) timeout.then(handleTimeout);

      return handleResponse;

      function handleResponse() {
        var response = wrapped.response(method, url, data, headers);
        xhr.$$respHeaders = response[2];
        callback(response[0], response[1], xhr.getAllResponseHeaders());
      }

      function handleTimeout() {
        for (var i = 0, ii = responses.length; i < ii; i++) {
          if (responses[i] === handleResponse) {
            responses.splice(i, 1);
            callback(-1, undefined, '');
            break;
          }
        }
      }
    }

    if (expectation && expectation.match(method, url)) {
      if (!expectation.matchData(data))
        throw Error('Expected ' + expectation + ' with different data\n' +
            'EXPECTED: ' + prettyPrint(expectation.data) + '\nGOT:      ' + data);

      if (!expectation.matchHeaders(headers))
        throw Error('Expected ' + expectation + ' with different headers\n' +
            'EXPECTED: ' + prettyPrint(expectation.headers) + '\nGOT:      ' +
            prettyPrint(headers));

      expectations.shift();

      if (expectation.response) {
        responses.push(wrapResponse(expectation));
        return;
      }
      wasExpected = true;
    }

    var i = -1, definition;
    while ((definition = definitions[++i])) {
      if (definition.match(method, url, data, headers || {})) {
        if (definition.response) {
          // if $browser specified, we do auto flush all requests
          ($browser ? $browser.defer : responsesPush)(wrapResponse(definition));
        } else if (definition.passThrough) {
          $delegate(method, url, data, callback, headers, timeout);
        } else throw Error('No response defined !');
        return;
      }
    }
    throw wasExpected ?
        Error('No response defined !') :
        Error('Unexpected request: ' + method + ' ' + url + '\n' +
              (expectation ? 'Expected ' + expectation : 'No more request expected'));
  }

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#when
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new backend definition.
   *
   * @param {string} method HTTP method.
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP request body.
   * @param {(Object|function(Object))=} headers HTTP headers or function that receives http header
   *   object and returns true if the headers match the current definition.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   *   request is handled.
   *
   *  - respond – `{function([status,] data[, headers])|function(function(method, url, data, headers)}`
   *    – The respond method takes a set of static data to be returned or a function that can return
   *    an array containing response status (number), response data (string) and response headers
   *    (Object).
   */
  $httpBackend.when = function(method, url, data, headers) {
    var definition = new MockHttpExpectation(method, url, data, headers),
        chain = {
          respond: function(status, data, headers) {
            definition.response = createResponse(status, data, headers);
          }
        };

    if ($browser) {
      chain.passThrough = function() {
        definition.passThrough = true;
      };
    }

    definitions.push(definition);
    return chain;
  };

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#whenGET
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new backend definition for GET requests. For more info see `when()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(Object|function(Object))=} headers HTTP headers.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   * request is handled.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#whenHEAD
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new backend definition for HEAD requests. For more info see `when()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(Object|function(Object))=} headers HTTP headers.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   * request is handled.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#whenDELETE
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new backend definition for DELETE requests. For more info see `when()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(Object|function(Object))=} headers HTTP headers.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   * request is handled.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#whenPOST
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new backend definition for POST requests. For more info see `when()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP request body.
   * @param {(Object|function(Object))=} headers HTTP headers.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   * request is handled.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#whenPUT
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new backend definition for PUT requests.  For more info see `when()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP request body.
   * @param {(Object|function(Object))=} headers HTTP headers.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   * request is handled.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#whenJSONP
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new backend definition for JSONP requests. For more info see `when()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   * request is handled.
   */
  createShortMethods('when');


  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expect
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new request expectation.
   *
   * @param {string} method HTTP method.
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP request body.
   * @param {(Object|function(Object))=} headers HTTP headers or function that receives http header
   *   object and returns true if the headers match the current expectation.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   *  request is handled.
   *
   *  - respond – `{function([status,] data[, headers])|function(function(method, url, data, headers)}`
   *    – The respond method takes a set of static data to be returned or a function that can return
   *    an array containing response status (number), response data (string) and response headers
   *    (Object).
   */
  $httpBackend.expect = function(method, url, data, headers) {
    var expectation = new MockHttpExpectation(method, url, data, headers);
    expectations.push(expectation);
    return {
      respond: function(status, data, headers) {
        expectation.response = createResponse(status, data, headers);
      }
    };
  };


  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectGET
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new request expectation for GET requests. For more info see `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {Object=} headers HTTP headers.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   * request is handled. See #expect for more info.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectHEAD
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new request expectation for HEAD requests. For more info see `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {Object=} headers HTTP headers.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   *   request is handled.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectDELETE
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new request expectation for DELETE requests. For more info see `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {Object=} headers HTTP headers.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   *   request is handled.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectPOST
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new request expectation for POST requests. For more info see `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP request body.
   * @param {Object=} headers HTTP headers.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   *   request is handled.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectPUT
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new request expectation for PUT requests. For more info see `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP request body.
   * @param {Object=} headers HTTP headers.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   *   request is handled.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectPATCH
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new request expectation for PATCH requests. For more info see `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP request body.
   * @param {Object=} headers HTTP headers.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   *   request is handled.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectJSONP
   * @methodOf ngMock.$httpBackend
   * @description
   * Creates a new request expectation for JSONP requests. For more info see `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @returns {requestHandler} Returns an object with `respond` method that control how a matched
   *   request is handled.
   */
  createShortMethods('expect');


  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#flush
   * @methodOf ngMock.$httpBackend
   * @description
   * Flushes all pending requests using the trained responses.
   *
   * @param {number=} count Number of responses to flush (in the order they arrived). If undefined,
   *   all pending requests will be flushed. If there are no pending requests when the flush method
   *   is called an exception is thrown (as this typically a sign of programming error).
   */
  $httpBackend.flush = function(count) {
    $rootScope.$digest();
    if (!responses.length) throw Error('No pending request to flush !');

    if (angular.isDefined(count)) {
      while (count--) {
        if (!responses.length) throw Error('No more pending request to flush !');
        responses.shift()();
      }
    } else {
      while (responses.length) {
        responses.shift()();
      }
    }
    $httpBackend.verifyNoOutstandingExpectation();
  };


  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#verifyNoOutstandingExpectation
   * @methodOf ngMock.$httpBackend
   * @description
   * Verifies that all of the requests defined via the `expect` api were made. If any of the
   * requests were not made, verifyNoOutstandingExpectation throws an exception.
   *
   * Typically, you would call this method following each test case that asserts requests using an
   * "afterEach" clause.
   *
   * <pre>
   *   afterEach($httpBackend.verifyExpectations);
   * </pre>
   */
  $httpBackend.verifyNoOutstandingExpectation = function() {
    $rootScope.$digest();
    if (expectations.length) {
      throw Error('Unsatisfied requests: ' + expectations.join(', '));
    }
  };


  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#verifyNoOutstandingRequest
   * @methodOf ngMock.$httpBackend
   * @description
   * Verifies that there are no outstanding requests that need to be flushed.
   *
   * Typically, you would call this method following each test case that asserts requests using an
   * "afterEach" clause.
   *
   * <pre>
   *   afterEach($httpBackend.verifyNoOutstandingRequest);
   * </pre>
   */
  $httpBackend.verifyNoOutstandingRequest = function() {
    if (responses.length) {
      throw Error('Unflushed requests: ' + responses.length);
    }
  };


  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#resetExpectations
   * @methodOf ngMock.$httpBackend
   * @description
   * Resets all request expectations, but preserves all backend definitions. Typically, you would
   * call resetExpectations during a multiple-phase test when you want to reuse the same instance of
   * $httpBackend mock.
   */
  $httpBackend.resetExpectations = function() {
    expectations.length = 0;
    responses.length = 0;
  };

  return $httpBackend;


  function createShortMethods(prefix) {
    angular.forEach(['GET', 'DELETE', 'JSONP'], function(method) {
     $httpBackend[prefix + method] = function(url, headers) {
       return $httpBackend[prefix](method, url, undefined, headers)
     }
    });

    angular.forEach(['PUT', 'POST', 'PATCH'], function(method) {
      $httpBackend[prefix + method] = function(url, data, headers) {
        return $httpBackend[prefix](method, url, data, headers)
      }
    });
  }
}

function MockHttpExpectation(method, url, data, headers) {

  this.data = data;
  this.headers = headers;

  this.match = function(m, u, d, h) {
    if (method != m) return false;
    if (!this.matchUrl(u)) return false;
    if (angular.isDefined(d) && !this.matchData(d)) return false;
    if (angular.isDefined(h) && !this.matchHeaders(h)) return false;
    return true;
  };

  this.matchUrl = function(u) {
    if (!url) return true;
    if (angular.isFunction(url.test)) return url.test(u);
    return url == u;
  };

  this.matchHeaders = function(h) {
    if (angular.isUndefined(headers)) return true;
    if (angular.isFunction(headers)) return headers(h);
    return angular.equals(headers, h);
  };

  this.matchData = function(d) {
    if (angular.isUndefined(data)) return true;
    if (data && angular.isFunction(data.test)) return data.test(d);
    if (data && !angular.isString(data)) return angular.toJson(data) == d;
    return data == d;
  };

  this.toString = function() {
    return method + ' ' + url;
  };
}

function MockXhr() {

  // hack for testing $http, $httpBackend
  MockXhr.$$lastInstance = this;

  this.open = function(method, url, async) {
    this.$$method = method;
    this.$$url = url;
    this.$$async = async;
    this.$$reqHeaders = {};
    this.$$respHeaders = {};
  };

  this.send = function(data) {
    this.$$data = data;
  };

  this.setRequestHeader = function(key, value) {
    this.$$reqHeaders[key] = value;
  };

  this.getResponseHeader = function(name) {
    // the lookup must be case insensitive, that's why we try two quick lookups and full scan at last
    var header = this.$$respHeaders[name];
    if (header) return header;

    name = angular.lowercase(name);
    header = this.$$respHeaders[name];
    if (header) return header;

    header = undefined;
    angular.forEach(this.$$respHeaders, function(headerVal, headerName) {
      if (!header && angular.lowercase(headerName) == name) header = headerVal;
    });
    return header;
  };

  this.getAllResponseHeaders = function() {
    var lines = [];

    angular.forEach(this.$$respHeaders, function(value, key) {
      lines.push(key + ': ' + value);
    });
    return lines.join('\n');
  };

  this.abort = angular.noop;
}


/**
 * @ngdoc function
 * @name ngMock.$timeout
 * @description
 *
 * This service is just a simple decorator for {@link ng.$timeout $timeout} service
 * that adds a "flush" and "verifyNoPendingTasks" methods.
 */ 

angular.mock.$TimeoutDecorator = function($delegate, $browser) {

  /**
   * @ngdoc method
   * @name ngMock.$timeout#flush
   * @methodOf ngMock.$timeout
   * @description
   *
   * Flushes the queue of pending tasks.
   */
  $delegate.flush = function() {
    $browser.defer.flush();
  };

  /**
   * @ngdoc method
   * @name ngMock.$timeout#verifyNoPendingTasks
   * @methodOf ngMock.$timeout
   * @description
   *
   * Verifies that there are no pending tasks that need to be flushed.
   */
  $delegate.verifyNoPendingTasks = function() {
    if ($browser.deferredFns.length) {
      throw Error('Deferred tasks to flush (' + $browser.deferredFns.length + '): ' +
          formatPendingTasksAsString($browser.deferredFns));
    }
  };

  function formatPendingTasksAsString(tasks) {
    var result = [];
    angular.forEach(tasks, function(task) {
      result.push('{id: ' + task.id + ', ' + 'time: ' + task.time + '}');
    });

    return result.join(', ');
  }

  return $delegate;
};

/**
 *
 */
angular.mock.$RootElementProvider = function() {
  this.$get = function() {
    return angular.element('<div ng-app></div>');
  }
};

/**
 * @ngdoc overview
 * @name ngMock
 * @description
 *
 * The `ngMock` is an angular module which is used with `ng` module and adds unit-test configuration as well as useful
 * mocks to the {@link AUTO.$injector $injector}.
 */
angular.module('ngMock', ['ng']).provider({
  $browser: angular.mock.$BrowserProvider,
  $exceptionHandler: angular.mock.$ExceptionHandlerProvider,
  $log: angular.mock.$LogProvider,
  $httpBackend: angular.mock.$HttpBackendProvider,
  $rootElement: angular.mock.$RootElementProvider
}).config(function($provide) {
  $provide.decorator('$timeout', angular.mock.$TimeoutDecorator);
});

/**
 * @ngdoc overview
 * @name ngMockE2E
 * @description
 *
 * The `ngMockE2E` is an angular module which contains mocks suitable for end-to-end testing.
 * Currently there is only one mock present in this module -
 * the {@link ngMockE2E.$httpBackend e2e $httpBackend} mock.
 */
angular.module('ngMockE2E', ['ng']).config(function($provide) {
  $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
});

/**
 * @ngdoc object
 * @name ngMockE2E.$httpBackend
 * @description
 * Fake HTTP backend implementation suitable for end-to-end testing or backend-less development of
 * applications that use the {@link ng.$http $http service}.
 *
 * *Note*: For fake http backend implementation suitable for unit testing please see
 * {@link ngMock.$httpBackend unit-testing $httpBackend mock}.
 *
 * This implementation can be used to respond with static or dynamic responses via the `when` api
 * and its shortcuts (`whenGET`, `whenPOST`, etc) and optionally pass through requests to the
 * real $httpBackend for specific requests (e.g. to interact with certain remote apis or to fetch
 * templates from a webserver).
 *
 * As opposed to unit-testing, in an end-to-end testing scenario or in scenario when an application
 * is being developed with the real backend api replaced with a mock, it is often desirable for
 * certain category of requests to bypass the mock and issue a real http request (e.g. to fetch
 * templates or static files from the webserver). To configure the backend with this behavior
 * use the `passThrough` request handler of `when` instead of `respond`.
 *
 * Additionally, we don't want to manually have to flush mocked out requests like we do during unit
 * testing. For this reason the e2e $httpBackend automatically flushes mocked out requests
 * automatically, closely simulating the behavior of the XMLHttpRequest object.
 *
 * To setup the application to run with this http backend, you have to create a module that depends
 * on the `ngMockE2E` and your application modules and defines the fake backend:
 *
 * <pre>
 *   myAppDev = angular.module('myAppDev', ['myApp', 'ngMockE2E']);
 *   myAppDev.run(function($httpBackend) {
 *     phones = [{name: 'phone1'}, {name: 'phone2'}];
 *
 *     // returns the current list of phones
 *     $httpBackend.whenGET('/phones').respond(phones);
 *
 *     // adds a new phone to the phones array
 *     $httpBackend.whenPOST('/phones').respond(function(method, url, data) {
 *       phones.push(angular.fromJSON(data));
 *     });
 *     $httpBackend.whenGET(/^\/templates\//).passThrough();
 *     //...
 *   });
 * </pre>
 *
 * Afterwards, bootstrap your app with this new module.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#when
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Creates a new backend definition.
 *
 * @param {string} method HTTP method.
 * @param {string|RegExp} url HTTP url.
 * @param {(string|RegExp)=} data HTTP request body.
 * @param {(Object|function(Object))=} headers HTTP headers or function that receives http header
 *   object and returns true if the headers match the current definition.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 *
 *  - respond – `{function([status,] data[, headers])|function(function(method, url, data, headers)}`
 *    – The respond method takes a set of static data to be returned or a function that can return
 *    an array containing response status (number), response data (string) and response headers
 *    (Object).
 *  - passThrough – `{function()}` – Any request matching a backend definition with `passThrough`
 *    handler, will be pass through to the real backend (an XHR request will be made to the
 *    server.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenGET
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Creates a new backend definition for GET requests. For more info see `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @param {(Object|function(Object))=} headers HTTP headers.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenHEAD
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Creates a new backend definition for HEAD requests. For more info see `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @param {(Object|function(Object))=} headers HTTP headers.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenDELETE
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Creates a new backend definition for DELETE requests. For more info see `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @param {(Object|function(Object))=} headers HTTP headers.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenPOST
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Creates a new backend definition for POST requests. For more info see `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @param {(string|RegExp)=} data HTTP request body.
 * @param {(Object|function(Object))=} headers HTTP headers.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenPUT
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Creates a new backend definition for PUT requests.  For more info see `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @param {(string|RegExp)=} data HTTP request body.
 * @param {(Object|function(Object))=} headers HTTP headers.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenPATCH
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Creates a new backend definition for PATCH requests.  For more info see `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @param {(string|RegExp)=} data HTTP request body.
 * @param {(Object|function(Object))=} headers HTTP headers.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenJSONP
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Creates a new backend definition for JSONP requests. For more info see `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @returns {requestHandler} Returns an object with `respond` and `passThrough` methods that
 *   control how a matched request is handled.
 */
angular.mock.e2e = {};
angular.mock.e2e.$httpBackendDecorator = ['$rootScope', '$delegate', '$browser', createHttpBackendMock];


angular.mock.clearDataCache = function() {
  var key,
      cache = angular.element.cache;

  for(key in cache) {
    if (cache.hasOwnProperty(key)) {
      var handle = cache[key].handle;

      handle && angular.element(handle.elem).unbind();
      delete cache[key];
    }
  }
};


window.jstestdriver && (function(window) {
  /**
   * Global method to output any number of objects into JSTD console. Useful for debugging.
   */
  window.dump = function() {
    var args = [];
    angular.forEach(arguments, function(arg) {
      args.push(angular.mock.dump(arg));
    });
    jstestdriver.console.log.apply(jstestdriver.console, args);
    if (window.console) {
      window.console.log.apply(window.console, args);
    }
  };
})(window);


(window.jasmine || window.mocha) && (function(window) {

  var currentSpec = null;

  beforeEach(function() {
    currentSpec = this;
  });

  afterEach(function() {
    var injector = currentSpec.$injector;

    currentSpec.$injector = null;
    currentSpec.$modules = null;
    currentSpec = null;

    if (injector) {
      injector.get('$rootElement').unbind();
      injector.get('$browser').pollFns.length = 0;
    }

    angular.mock.clearDataCache();

    // clean up jquery's fragment cache
    angular.forEach(angular.element.fragments, function(val, key) {
      delete angular.element.fragments[key];
    });

    MockXhr.$$lastInstance = null;

    angular.forEach(angular.callbacks, function(val, key) {
      delete angular.callbacks[key];
    });
    angular.callbacks.counter = 0;
  });

  function isSpecRunning() {
    return currentSpec && (window.mocha || currentSpec.queue.running);
  }

  /**
   * @ngdoc function
   * @name angular.mock.module
   * @description
   *
   * *NOTE*: This function is also published on window for easy access.<br>
   *
   * This function registers a module configuration code. It collects the configuration information
   * which will be used when the injector is created by {@link angular.mock.inject inject}.
   *
   * See {@link angular.mock.inject inject} for usage example
   *
   * @param {...(string|Function)} fns any number of modules which are represented as string
   *        aliases or as anonymous module initialization functions. The modules are used to
   *        configure the injector. The 'ng' and 'ngMock' modules are automatically loaded.
   */
  window.module = angular.mock.module = function() {
    var moduleFns = Array.prototype.slice.call(arguments, 0);
    return isSpecRunning() ? workFn() : workFn;
    /////////////////////
    function workFn() {
      if (currentSpec.$injector) {
        throw Error('Injector already created, can not register a module!');
      } else {
        var modules = currentSpec.$modules || (currentSpec.$modules = []);
        angular.forEach(moduleFns, function(module) {
          modules.push(module);
        });
      }
    }
  };

  /**
   * @ngdoc function
   * @name angular.mock.inject
   * @description
   *
   * *NOTE*: This function is also published on window for easy access.<br>
   *
   * The inject function wraps a function into an injectable function. The inject() creates new
   * instance of {@link AUTO.$injector $injector} per test, which is then used for
   * resolving references.
   *
   * See also {@link angular.mock.module module}
   *
   * Example of what a typical jasmine tests looks like with the inject method.
   * <pre>
   *
   *   angular.module('myApplicationModule', [])
   *       .value('mode', 'app')
   *       .value('version', 'v1.0.1');
   *
   *
   *   describe('MyApp', function() {
   *
   *     // You need to load modules that you want to test,
   *     // it loads only the "ng" module by default.
   *     beforeEach(module('myApplicationModule'));
   *
   *
   *     // inject() is used to inject arguments of all given functions
   *     it('should provide a version', inject(function(mode, version) {
   *       expect(version).toEqual('v1.0.1');
   *       expect(mode).toEqual('app');
   *     }));
   *
   *
   *     // The inject and module method can also be used inside of the it or beforeEach
   *     it('should override a version and test the new version is injected', function() {
   *       // module() takes functions or strings (module aliases)
   *       module(function($provide) {
   *         $provide.value('version', 'overridden'); // override version here
   *       });
   *
   *       inject(function(version) {
   *         expect(version).toEqual('overridden');
   *       });
   *     ));
   *   });
   *
   * </pre>
   *
   * @param {...Function} fns any number of functions which will be injected using the injector.
   */
  window.inject = angular.mock.inject = function() {
    var blockFns = Array.prototype.slice.call(arguments, 0);
    var errorForStack = new Error('Declaration Location');
    return isSpecRunning() ? workFn() : workFn;
    /////////////////////
    function workFn() {
      var modules = currentSpec.$modules || [];

      modules.unshift('ngMock');
      modules.unshift('ng');
      var injector = currentSpec.$injector;
      if (!injector) {
        injector = currentSpec.$injector = angular.injector(modules);
      }
      for(var i = 0, ii = blockFns.length; i < ii; i++) {
        try {
          injector.invoke(blockFns[i] || angular.noop, this);
        } catch (e) {
          if(e.stack && errorForStack) e.stack +=  '\n' + errorForStack.stack;
          throw e;
        } finally {
          errorForStack = null;
        }
      }
    }
  };
})(window);

/*
 AngularJS v1.1.5
 (c) 2010-2012 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(B,f,w){'use strict';f.module("ngResource",["ng"]).factory("$resource",["$http","$parse",function(x,y){function u(b,d){this.template=b;this.defaults=d||{};this.urlParams={}}function v(b,d,e){function j(c,b){var p={},b=m({},d,b);l(b,function(a,b){k(a)&&(a=a());var g;a&&a.charAt&&a.charAt(0)=="@"?(g=a.substr(1),g=y(g)(c)):g=a;p[b]=g});return p}function c(c){t(c||{},this)}var n=new u(b),e=m({},z,e);l(e,function(b,d){b.method=f.uppercase(b.method);var p=b.method=="POST"||b.method=="PUT"||b.method==
"PATCH";c[d]=function(a,d,g,A){function f(){h.$resolved=!0}var i={},e,o=q,r=null;switch(arguments.length){case 4:r=A,o=g;case 3:case 2:if(k(d)){if(k(a)){o=a;r=d;break}o=d;r=g}else{i=a;e=d;o=g;break}case 1:k(a)?o=a:p?e=a:i=a;break;case 0:break;default:throw"Expected between 0-4 arguments [params, data, success, error], got "+arguments.length+" arguments.";}var h=this instanceof c?this:b.isArray?[]:new c(e),s={};l(b,function(a,b){b!="params"&&b!="isArray"&&(s[b]=t(a))});s.data=e;n.setUrlParams(s,m({},
j(e,b.params||{}),i),b.url);i=x(s);h.$resolved=!1;i.then(f,f);h.$then=i.then(function(a){var d=a.data,g=h.$then,e=h.$resolved;if(d)b.isArray?(h.length=0,l(d,function(a){h.push(new c(a))})):(t(d,h),h.$then=g,h.$resolved=e);(o||q)(h,a.headers);a.resource=h;return a},r).then;return h};c.prototype["$"+d]=function(a,b,g){var e=j(this),f=q,i;switch(arguments.length){case 3:e=a;f=b;i=g;break;case 2:case 1:k(a)?(f=a,i=b):(e=a,f=b||q);case 0:break;default:throw"Expected between 1-3 arguments [params, success, error], got "+
arguments.length+" arguments.";}c[d].call(this,e,p?this:w,f,i)}});c.bind=function(c){return v(b,m({},d,c),e)};return c}var z={get:{method:"GET"},save:{method:"POST"},query:{method:"GET",isArray:!0},remove:{method:"DELETE"},"delete":{method:"DELETE"}},q=f.noop,l=f.forEach,m=f.extend,t=f.copy,k=f.isFunction;u.prototype={setUrlParams:function(b,d,e){var j=this,c=e||j.template,n,k,m=j.urlParams={};l(c.split(/\W/),function(b){b&&RegExp("(^|[^\\\\]):"+b+"(\\W|$)").test(c)&&(m[b]=!0)});c=c.replace(/\\:/g,
":");d=d||{};l(j.urlParams,function(b,a){n=d.hasOwnProperty(a)?d[a]:j.defaults[a];f.isDefined(n)&&n!==null?(k=encodeURIComponent(n).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"%20").replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+"),c=c.replace(RegExp(":"+a+"(\\W|$)","g"),k+"$1")):c=c.replace(RegExp("(/?):"+a+"(\\W|$)","g"),function(b,a,c){return c.charAt(0)=="/"?c:a+c})});c=c.replace(/\/+$/,"");c=c.replace(/\/\.(?=\w+($|\?))/,".");
b.url=c.replace(/\/\\\./,"/.");l(d,function(c,a){if(!j.urlParams[a])b.params=b.params||{},b.params[a]=c})}};return v}])})(window,window.angular);

/*
 AngularJS v1.1.5
 (c) 2010-2012 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(M,T,p){'use strict';function lc(){var b=M.angular;M.angular=mc;return b}function Xa(b){return!b||typeof b.length!=="number"?!1:typeof b.hasOwnProperty!="function"&&typeof b.constructor!="function"?!0:b instanceof R||ga&&b instanceof ga||Ea.call(b)!=="[object Object]"||typeof b.callee==="function"}function n(b,a,c){var d;if(b)if(H(b))for(d in b)d!="prototype"&&d!="length"&&d!="name"&&b.hasOwnProperty(d)&&a.call(c,b[d],d);else if(b.forEach&&b.forEach!==n)b.forEach(a,c);else if(Xa(b))for(d=
0;d<b.length;d++)a.call(c,b[d],d);else for(d in b)b.hasOwnProperty(d)&&a.call(c,b[d],d);return b}function qb(b){var a=[],c;for(c in b)b.hasOwnProperty(c)&&a.push(c);return a.sort()}function nc(b,a,c){for(var d=qb(b),e=0;e<d.length;e++)a.call(c,b[d[e]],d[e]);return d}function rb(b){return function(a,c){b(c,a)}}function Fa(){for(var b=ba.length,a;b;){b--;a=ba[b].charCodeAt(0);if(a==57)return ba[b]="A",ba.join("");if(a==90)ba[b]="0";else return ba[b]=String.fromCharCode(a+1),ba.join("")}ba.unshift("0");
return ba.join("")}function sb(b,a){a?b.$$hashKey=a:delete b.$$hashKey}function t(b){var a=b.$$hashKey;n(arguments,function(a){a!==b&&n(a,function(a,c){b[c]=a})});sb(b,a);return b}function N(b){return parseInt(b,10)}function tb(b,a){return t(new (t(function(){},{prototype:b})),a)}function q(){}function qa(b){return b}function S(b){return function(){return b}}function C(b){return typeof b=="undefined"}function B(b){return typeof b!="undefined"}function L(b){return b!=null&&typeof b=="object"}function E(b){return typeof b==
"string"}function Ya(b){return typeof b=="number"}function ra(b){return Ea.apply(b)=="[object Date]"}function F(b){return Ea.apply(b)=="[object Array]"}function H(b){return typeof b=="function"}function sa(b){return b&&b.document&&b.location&&b.alert&&b.setInterval}function U(b){return E(b)?b.replace(/^\s*/,"").replace(/\s*$/,""):b}function oc(b){return b&&(b.nodeName||b.bind&&b.find)}function Za(b,a,c){var d=[];n(b,function(b,g,i){d.push(a.call(c,b,g,i))});return d}function Ga(b,a){if(b.indexOf)return b.indexOf(a);
for(var c=0;c<b.length;c++)if(a===b[c])return c;return-1}function ta(b,a){var c=Ga(b,a);c>=0&&b.splice(c,1);return a}function V(b,a){if(sa(b)||b&&b.$evalAsync&&b.$watch)throw Error("Can't copy Window or Scope");if(a){if(b===a)throw Error("Can't copy equivalent objects or arrays");if(F(b))for(var c=a.length=0;c<b.length;c++)a.push(V(b[c]));else{c=a.$$hashKey;n(a,function(b,c){delete a[c]});for(var d in b)a[d]=V(b[d]);sb(a,c)}}else(a=b)&&(F(b)?a=V(b,[]):ra(b)?a=new Date(b.getTime()):L(b)&&(a=V(b,{})));
return a}function pc(b,a){var a=a||{},c;for(c in b)b.hasOwnProperty(c)&&c.substr(0,2)!=="$$"&&(a[c]=b[c]);return a}function ia(b,a){if(b===a)return!0;if(b===null||a===null)return!1;if(b!==b&&a!==a)return!0;var c=typeof b,d;if(c==typeof a&&c=="object")if(F(b)){if((c=b.length)==a.length){for(d=0;d<c;d++)if(!ia(b[d],a[d]))return!1;return!0}}else if(ra(b))return ra(a)&&b.getTime()==a.getTime();else{if(b&&b.$evalAsync&&b.$watch||a&&a.$evalAsync&&a.$watch||sa(b)||sa(a))return!1;c={};for(d in b)if(!(d.charAt(0)===
"$"||H(b[d]))){if(!ia(b[d],a[d]))return!1;c[d]=!0}for(d in a)if(!c[d]&&d.charAt(0)!=="$"&&a[d]!==p&&!H(a[d]))return!1;return!0}return!1}function $a(b,a){var c=arguments.length>2?ka.call(arguments,2):[];return H(a)&&!(a instanceof RegExp)?c.length?function(){return arguments.length?a.apply(b,c.concat(ka.call(arguments,0))):a.apply(b,c)}:function(){return arguments.length?a.apply(b,arguments):a.call(b)}:a}function qc(b,a){var c=a;/^\$+/.test(b)?c=p:sa(a)?c="$WINDOW":a&&T===a?c="$DOCUMENT":a&&a.$evalAsync&&
a.$watch&&(c="$SCOPE");return c}function ha(b,a){return JSON.stringify(b,qc,a?"  ":null)}function ub(b){return E(b)?JSON.parse(b):b}function ua(b){b&&b.length!==0?(b=I(""+b),b=!(b=="f"||b=="0"||b=="false"||b=="no"||b=="n"||b=="[]")):b=!1;return b}function va(b){b=w(b).clone();try{b.html("")}catch(a){}var c=w("<div>").append(b).html();try{return b[0].nodeType===3?I(c):c.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/,function(a,b){return"<"+I(b)})}catch(d){return I(c)}}function vb(b){var a={},c,d;n((b||
"").split("&"),function(b){b&&(c=b.split("="),d=decodeURIComponent(c[0]),a[d]=B(c[1])?decodeURIComponent(c[1]):!0)});return a}function wb(b){var a=[];n(b,function(b,d){a.push(wa(d,!0)+(b===!0?"":"="+wa(b,!0)))});return a.length?a.join("&"):""}function ab(b){return wa(b,!0).replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+")}function wa(b,a){return encodeURIComponent(b).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,a?"%20":"+")}function rc(b,
a){function c(a){a&&d.push(a)}var d=[b],e,g,i=["ng:app","ng-app","x-ng-app","data-ng-app"],f=/\sng[:\-]app(:\s*([\w\d_]+);?)?\s/;n(i,function(a){i[a]=!0;c(T.getElementById(a));a=a.replace(":","\\:");b.querySelectorAll&&(n(b.querySelectorAll("."+a),c),n(b.querySelectorAll("."+a+"\\:"),c),n(b.querySelectorAll("["+a+"]"),c))});n(d,function(a){if(!e){var b=f.exec(" "+a.className+" ");b?(e=a,g=(b[2]||"").replace(/\s+/g,",")):n(a.attributes,function(b){if(!e&&i[b.name])e=a,g=b.value})}});e&&a(e,g?[g]:[])}
function xb(b,a){var c=function(){b=w(b);a=a||[];a.unshift(["$provide",function(a){a.value("$rootElement",b)}]);a.unshift("ng");var c=yb(a);c.invoke(["$rootScope","$rootElement","$compile","$injector","$animator",function(a,b,c,d,e){a.$apply(function(){b.data("$injector",d);c(b)(a)});e.enabled(!0)}]);return c},d=/^NG_DEFER_BOOTSTRAP!/;if(M&&!d.test(M.name))return c();M.name=M.name.replace(d,"");Ha.resumeBootstrap=function(b){n(b,function(b){a.push(b)});c()}}function bb(b,a){a=a||"_";return b.replace(sc,
function(b,d){return(d?a:"")+b.toLowerCase()})}function cb(b,a,c){if(!b)throw Error("Argument '"+(a||"?")+"' is "+(c||"required"));return b}function xa(b,a,c){c&&F(b)&&(b=b[b.length-1]);cb(H(b),a,"not a function, got "+(b&&typeof b=="object"?b.constructor.name||"Object":typeof b));return b}function tc(b){function a(a,b,e){return a[b]||(a[b]=e())}return a(a(b,"angular",Object),"module",function(){var b={};return function(d,e,g){e&&b.hasOwnProperty(d)&&(b[d]=null);return a(b,d,function(){function a(c,
d,e){return function(){b[e||"push"]([c,d,arguments]);return m}}if(!e)throw Error("No module: "+d);var b=[],c=[],j=a("$injector","invoke"),m={_invokeQueue:b,_runBlocks:c,requires:e,name:d,provider:a("$provide","provider"),factory:a("$provide","factory"),service:a("$provide","service"),value:a("$provide","value"),constant:a("$provide","constant","unshift"),animation:a("$animationProvider","register"),filter:a("$filterProvider","register"),controller:a("$controllerProvider","register"),directive:a("$compileProvider",
"directive"),config:j,run:function(a){c.push(a);return this}};g&&j(g);return m})}})}function Ia(b){return b.replace(uc,function(a,b,d,e){return e?d.toUpperCase():d}).replace(vc,"Moz$1")}function db(b,a){function c(){var e;for(var b=[this],c=a,i,f,h,j,m,k;b.length;){i=b.shift();f=0;for(h=i.length;f<h;f++){j=w(i[f]);c?j.triggerHandler("$destroy"):c=!c;m=0;for(e=(k=j.children()).length,j=e;m<j;m++)b.push(ga(k[m]))}}return d.apply(this,arguments)}var d=ga.fn[b],d=d.$original||d;c.$original=d;ga.fn[b]=
c}function R(b){if(b instanceof R)return b;if(!(this instanceof R)){if(E(b)&&b.charAt(0)!="<")throw Error("selectors not implemented");return new R(b)}if(E(b)){var a=T.createElement("div");a.innerHTML="<div>&#160;</div>"+b;a.removeChild(a.firstChild);eb(this,a.childNodes);this.remove()}else eb(this,b)}function fb(b){return b.cloneNode(!0)}function ya(b){zb(b);for(var a=0,b=b.childNodes||[];a<b.length;a++)ya(b[a])}function Ab(b,a,c){var d=ca(b,"events");ca(b,"handle")&&(C(a)?n(d,function(a,c){gb(b,
c,a);delete d[c]}):C(c)?(gb(b,a,d[a]),delete d[a]):ta(d[a],c))}function zb(b){var a=b[Ja],c=Ka[a];c&&(c.handle&&(c.events.$destroy&&c.handle({},"$destroy"),Ab(b)),delete Ka[a],b[Ja]=p)}function ca(b,a,c){var d=b[Ja],d=Ka[d||-1];if(B(c))d||(b[Ja]=d=++wc,d=Ka[d]={}),d[a]=c;else return d&&d[a]}function Bb(b,a,c){var d=ca(b,"data"),e=B(c),g=!e&&B(a),i=g&&!L(a);!d&&!i&&ca(b,"data",d={});if(e)d[a]=c;else if(g)if(i)return d&&d[a];else t(d,a);else return d}function La(b,a){return(" "+b.className+" ").replace(/[\n\t]/g,
" ").indexOf(" "+a+" ")>-1}function Cb(b,a){a&&n(a.split(" "),function(a){b.className=U((" "+b.className+" ").replace(/[\n\t]/g," ").replace(" "+U(a)+" "," "))})}function Db(b,a){a&&n(a.split(" "),function(a){if(!La(b,a))b.className=U(b.className+" "+U(a))})}function eb(b,a){if(a)for(var a=!a.nodeName&&B(a.length)&&!sa(a)?a:[a],c=0;c<a.length;c++)b.push(a[c])}function Eb(b,a){return Ma(b,"$"+(a||"ngController")+"Controller")}function Ma(b,a,c){b=w(b);for(b[0].nodeType==9&&(b=b.find("html"));b.length;){if(c=
b.data(a))return c;b=b.parent()}}function Fb(b,a){var c=Na[a.toLowerCase()];return c&&Gb[b.nodeName]&&c}function xc(b,a){var c=function(c,e){if(!c.preventDefault)c.preventDefault=function(){c.returnValue=!1};if(!c.stopPropagation)c.stopPropagation=function(){c.cancelBubble=!0};if(!c.target)c.target=c.srcElement||T;if(C(c.defaultPrevented)){var g=c.preventDefault;c.preventDefault=function(){c.defaultPrevented=!0;g.call(c)};c.defaultPrevented=!1}c.isDefaultPrevented=function(){return c.defaultPrevented||
c.returnValue==!1};n(a[e||c.type],function(a){a.call(b,c)});Z<=8?(c.preventDefault=null,c.stopPropagation=null,c.isDefaultPrevented=null):(delete c.preventDefault,delete c.stopPropagation,delete c.isDefaultPrevented)};c.elem=b;return c}function la(b){var a=typeof b,c;if(a=="object"&&b!==null)if(typeof(c=b.$$hashKey)=="function")c=b.$$hashKey();else{if(c===p)c=b.$$hashKey=Fa()}else c=b;return a+":"+c}function za(b){n(b,this.put,this)}function Hb(b){var a,c;if(typeof b=="function"){if(!(a=b.$inject))a=
[],c=b.toString().replace(yc,""),c=c.match(zc),n(c[1].split(Ac),function(b){b.replace(Bc,function(b,c,d){a.push(d)})}),b.$inject=a}else F(b)?(c=b.length-1,xa(b[c],"fn"),a=b.slice(0,c)):xa(b,"fn",!0);return a}function yb(b){function a(a){return function(b,c){if(L(b))n(b,rb(a));else return a(b,c)}}function c(a,b){if(H(b)||F(b))b=k.instantiate(b);if(!b.$get)throw Error("Provider "+a+" must define $get factory method.");return m[a+f]=b}function d(a,b){return c(a,{$get:b})}function e(a){var b=[];n(a,function(a){if(!j.get(a))if(j.put(a,
!0),E(a)){var c=Aa(a);b=b.concat(e(c.requires)).concat(c._runBlocks);try{for(var d=c._invokeQueue,c=0,f=d.length;c<f;c++){var g=d[c],o=k.get(g[0]);o[g[1]].apply(o,g[2])}}catch(h){throw h.message&&(h.message+=" from "+a),h;}}else if(H(a))try{b.push(k.invoke(a))}catch(l){throw l.message&&(l.message+=" from "+a),l;}else if(F(a))try{b.push(k.invoke(a))}catch(i){throw i.message&&(i.message+=" from "+String(a[a.length-1])),i;}else xa(a,"module")});return b}function g(a,b){function c(d){if(typeof d!=="string")throw Error("Service name expected");
if(a.hasOwnProperty(d)){if(a[d]===i)throw Error("Circular dependency: "+h.join(" <- "));return a[d]}else try{return h.unshift(d),a[d]=i,a[d]=b(d)}finally{h.shift()}}function d(a,b,e){var f=[],j=Hb(a),g,o,h;o=0;for(g=j.length;o<g;o++)h=j[o],f.push(e&&e.hasOwnProperty(h)?e[h]:c(h));a.$inject||(a=a[g]);switch(b?-1:f.length){case 0:return a();case 1:return a(f[0]);case 2:return a(f[0],f[1]);case 3:return a(f[0],f[1],f[2]);case 4:return a(f[0],f[1],f[2],f[3]);case 5:return a(f[0],f[1],f[2],f[3],f[4]);
case 6:return a(f[0],f[1],f[2],f[3],f[4],f[5]);case 7:return a(f[0],f[1],f[2],f[3],f[4],f[5],f[6]);case 8:return a(f[0],f[1],f[2],f[3],f[4],f[5],f[6],f[7]);case 9:return a(f[0],f[1],f[2],f[3],f[4],f[5],f[6],f[7],f[8]);case 10:return a(f[0],f[1],f[2],f[3],f[4],f[5],f[6],f[7],f[8],f[9]);default:return a.apply(b,f)}}return{invoke:d,instantiate:function(a,b){var c=function(){},e;c.prototype=(F(a)?a[a.length-1]:a).prototype;c=new c;e=d(a,c,b);return L(e)?e:c},get:c,annotate:Hb,has:function(b){return m.hasOwnProperty(b+
f)||a.hasOwnProperty(b)}}}var i={},f="Provider",h=[],j=new za,m={$provide:{provider:a(c),factory:a(d),service:a(function(a,b){return d(a,["$injector",function(a){return a.instantiate(b)}])}),value:a(function(a,b){return d(a,S(b))}),constant:a(function(a,b){m[a]=b;l[a]=b}),decorator:function(a,b){var c=k.get(a+f),d=c.$get;c.$get=function(){var a=u.invoke(d,c);return u.invoke(b,null,{$delegate:a})}}}},k=m.$injector=g(m,function(){throw Error("Unknown provider: "+h.join(" <- "));}),l={},u=l.$injector=
g(l,function(a){a=k.get(a+f);return u.invoke(a.$get,a)});n(e(b),function(a){u.invoke(a||q)});return u}function Cc(){var b=!0;this.disableAutoScrolling=function(){b=!1};this.$get=["$window","$location","$rootScope",function(a,c,d){function e(a){var b=null;n(a,function(a){!b&&I(a.nodeName)==="a"&&(b=a)});return b}function g(){var b=c.hash(),d;b?(d=i.getElementById(b))?d.scrollIntoView():(d=e(i.getElementsByName(b)))?d.scrollIntoView():b==="top"&&a.scrollTo(0,0):a.scrollTo(0,0)}var i=a.document;b&&d.$watch(function(){return c.hash()},
function(){d.$evalAsync(g)});return g}]}function Ib(b){this.register=function(a,c){b.factory(Ia(a)+"Animation",c)};this.$get=["$injector",function(a){return function(b){if(b&&(b=Ia(b)+"Animation",a.has(b)))return a.get(b)}}]}function Dc(b,a,c,d){function e(a){try{a.apply(null,ka.call(arguments,1))}finally{if(o--,o===0)for(;z.length;)try{z.pop()()}catch(b){c.error(b)}}}function g(a,b){(function s(){n(r,function(a){a()});y=b(s,a)})()}function i(){x!=f.url()&&(x=f.url(),n(v,function(a){a(f.url())}))}
var f=this,h=a[0],j=b.location,m=b.history,k=b.setTimeout,l=b.clearTimeout,u={};f.isMock=!1;var o=0,z=[];f.$$completeOutstandingRequest=e;f.$$incOutstandingRequestCount=function(){o++};f.notifyWhenNoOutstandingRequests=function(a){n(r,function(a){a()});o===0?a():z.push(a)};var r=[],y;f.addPollFn=function(a){C(y)&&g(100,k);r.push(a);return a};var x=j.href,W=a.find("base");f.url=function(a,b){if(a){if(x!=a)return x=a,d.history?b?m.replaceState(null,"",a):(m.pushState(null,"",a),W.attr("href",W.attr("href"))):
b?j.replace(a):j.href=a,f}else return j.href.replace(/%27/g,"'")};var v=[],A=!1;f.onUrlChange=function(a){A||(d.history&&w(b).bind("popstate",i),d.hashchange?w(b).bind("hashchange",i):f.addPollFn(i),A=!0);v.push(a);return a};f.baseHref=function(){var a=W.attr("href");return a?a.replace(/^https?\:\/\/[^\/]*/,""):""};var G={},D="",$=f.baseHref();f.cookies=function(a,b){var d,e,f,j;if(a)if(b===p)h.cookie=escape(a)+"=;path="+$+";expires=Thu, 01 Jan 1970 00:00:00 GMT";else{if(E(b))d=(h.cookie=escape(a)+
"="+escape(b)+";path="+$).length+1,d>4096&&c.warn("Cookie '"+a+"' possibly not set or overflowed because it was too large ("+d+" > 4096 bytes)!")}else{if(h.cookie!==D){D=h.cookie;d=D.split("; ");G={};for(f=0;f<d.length;f++)e=d[f],j=e.indexOf("="),j>0&&(a=unescape(e.substring(0,j)),G[a]===p&&(G[a]=unescape(e.substring(j+1))))}return G}};f.defer=function(a,b){var c;o++;c=k(function(){delete u[c];e(a)},b||0);u[c]=!0;return c};f.defer.cancel=function(a){return u[a]?(delete u[a],l(a),e(q),!0):!1}}function Ec(){this.$get=
["$window","$log","$sniffer","$document",function(b,a,c,d){return new Dc(b,d,a,c)}]}function Fc(){this.$get=function(){function b(b,d){function e(a){if(a!=k){if(l){if(l==a)l=a.n}else l=a;g(a.n,a.p);g(a,k);k=a;k.n=null}}function g(a,b){if(a!=b){if(a)a.p=b;if(b)b.n=a}}if(b in a)throw Error("cacheId "+b+" taken");var i=0,f=t({},d,{id:b}),h={},j=d&&d.capacity||Number.MAX_VALUE,m={},k=null,l=null;return a[b]={put:function(a,b){var c=m[a]||(m[a]={key:a});e(c);if(!C(b))return a in h||i++,h[a]=b,i>j&&this.remove(l.key),
b},get:function(a){var b=m[a];if(b)return e(b),h[a]},remove:function(a){var b=m[a];if(b){if(b==k)k=b.p;if(b==l)l=b.n;g(b.n,b.p);delete m[a];delete h[a];i--}},removeAll:function(){h={};i=0;m={};k=l=null},destroy:function(){m=f=h=null;delete a[b]},info:function(){return t({},f,{size:i})}}}var a={};b.info=function(){var b={};n(a,function(a,e){b[e]=a.info()});return b};b.get=function(b){return a[b]};return b}}function Gc(){this.$get=["$cacheFactory",function(b){return b("templates")}]}function Jb(b){var a=
{},c="Directive",d=/^\s*directive\:\s*([\d\w\-_]+)\s+(.*)$/,e=/(([\d\w\-_]+)(?:\:([^;]+))?;?)/,g="Template must have exactly one root element. was: ",i=/^\s*(https?|ftp|mailto|file):/;this.directive=function h(d,e){E(d)?(cb(e,"directive"),a.hasOwnProperty(d)||(a[d]=[],b.factory(d+c,["$injector","$exceptionHandler",function(b,c){var e=[];n(a[d],function(a){try{var g=b.invoke(a);if(H(g))g={compile:S(g)};else if(!g.compile&&g.link)g.compile=S(g.link);g.priority=g.priority||0;g.name=g.name||d;g.require=
g.require||g.controller&&g.name;g.restrict=g.restrict||"A";e.push(g)}catch(h){c(h)}});return e}])),a[d].push(e)):n(d,rb(h));return this};this.urlSanitizationWhitelist=function(a){return B(a)?(i=a,this):i};this.$get=["$injector","$interpolate","$exceptionHandler","$http","$templateCache","$parse","$controller","$rootScope","$document",function(b,j,m,k,l,u,o,z,r){function y(a,b,c){a instanceof w||(a=w(a));n(a,function(b,c){b.nodeType==3&&b.nodeValue.match(/\S+/)&&(a[c]=w(b).wrap("<span></span>").parent()[0])});
var d=W(a,b,a,c);return function(b,c){cb(b,"scope");for(var e=c?Ba.clone.call(a):a,j=0,g=e.length;j<g;j++){var h=e[j];(h.nodeType==1||h.nodeType==9)&&e.eq(j).data("$scope",b)}x(e,"ng-scope");c&&c(e,b);d&&d(b,e,e);return e}}function x(a,b){try{a.addClass(b)}catch(c){}}function W(a,b,c,d){function e(a,c,d,g){var h,i,k,l,o,m,u,z=[];o=0;for(m=c.length;o<m;o++)z.push(c[o]);u=o=0;for(m=j.length;o<m;u++)i=z[u],c=j[o++],h=j[o++],c?(c.scope?(k=a.$new(L(c.scope)),w(i).data("$scope",k)):k=a,(l=c.transclude)||
!g&&b?c(h,k,i,d,function(b){return function(c){var d=a.$new();d.$$transcluded=!0;return b(d,c).bind("$destroy",$a(d,d.$destroy))}}(l||b)):c(h,k,i,p,g)):h&&h(a,i.childNodes,p,g)}for(var j=[],g,h,k,i=0;i<a.length;i++)h=new ma,g=v(a[i],[],h,d),h=(g=g.length?A(g,a[i],h,b,c):null)&&g.terminal||!a[i].childNodes||!a[i].childNodes.length?null:W(a[i].childNodes,g?g.transclude:b),j.push(g),j.push(h),k=k||g||h;return k?e:null}function v(a,b,c,j){var g=c.$attr,h;switch(a.nodeType){case 1:G(b,da(hb(a).toLowerCase()),
"E",j);var i,k,l;h=a.attributes;for(var o=0,m=h&&h.length;o<m;o++)if(i=h[o],i.specified)k=i.name,l=da(k),Y.test(l)&&(k=l.substr(6).toLowerCase()),l=da(k.toLowerCase()),g[l]=k,c[l]=i=U(Z&&k=="href"?decodeURIComponent(a.getAttribute(k,2)):i.value),Fb(a,l)&&(c[l]=!0),s(a,b,i,l),G(b,l,"A",j);a=a.className;if(E(a)&&a!=="")for(;h=e.exec(a);)l=da(h[2]),G(b,l,"C",j)&&(c[l]=U(h[3])),a=a.substr(h.index+h[0].length);break;case 3:P(b,a.nodeValue);break;case 8:try{if(h=d.exec(a.nodeValue))l=da(h[1]),G(b,l,"M",
j)&&(c[l]=U(h[2]))}catch(u){}}b.sort(K);return b}function A(a,b,c,d,e){function h(a,b){if(a)a.require=s.require,z.push(a);if(b)b.require=s.require,ea.push(b)}function i(a,b){var c,d="data",e=!1;if(E(a)){for(;(c=a.charAt(0))=="^"||c=="?";)a=a.substr(1),c=="^"&&(d="inheritedData"),e=e||c=="?";c=b[d]("$"+a+"Controller");if(!c&&!e)throw Error("No controller: "+a);}else F(a)&&(c=[],n(a,function(a){c.push(i(a,b))}));return c}function k(a,d,e,g,h){var l,v,r,D,x;l=b===e?c:pc(c,new ma(w(e),c.$attr));v=l.$$element;
if(K){var y=/^\s*([@=&])(\??)\s*(\w*)\s*$/,s=d.$parent||d;n(K.scope,function(a,b){var c=a.match(y)||[],e=c[3]||b,g=c[2]=="?",c=c[1],h,k,i;d.$$isolateBindings[b]=c+e;switch(c){case "@":l.$observe(e,function(a){d[b]=a});l.$$observers[e].$$scope=s;l[e]&&(d[b]=j(l[e])(s));break;case "=":if(g&&!l[e])break;k=u(l[e]);i=k.assign||function(){h=d[b]=k(s);throw Error(Kb+l[e]+" (directive: "+K.name+")");};h=d[b]=k(s);d.$watch(function(){var a=k(s);a!==d[b]&&(a!==h?h=d[b]=a:i(s,a=h=d[b]));return a});break;case "&":k=
u(l[e]);d[b]=function(a){return k(s,a)};break;default:throw Error("Invalid isolate scope definition for directive "+K.name+": "+a);}})}q&&n(q,function(a){var b={$scope:d,$element:v,$attrs:l,$transclude:h};x=a.controller;x=="@"&&(x=l[a.name]);v.data("$"+a.name+"Controller",o(x,b))});g=0;for(r=z.length;g<r;g++)try{D=z[g],D(d,v,l,D.require&&i(D.require,v))}catch(Hc){m(Hc,va(v))}a&&a(d,e.childNodes,p,h);g=0;for(r=ea.length;g<r;g++)try{D=ea[g],D(d,v,l,D.require&&i(D.require,v))}catch(J){m(J,va(v))}}for(var l=
-Number.MAX_VALUE,z=[],ea=[],r=null,K=null,W=null,J=c.$$element=w(b),s,A,Y,G,P=d,q,na,t,B=0,C=a.length;B<C;B++){s=a[B];Y=p;if(l>s.priority)break;if(t=s.scope)O("isolated scope",K,s,J),L(t)&&(x(J,"ng-isolate-scope"),K=s),x(J,"ng-scope"),r=r||s;A=s.name;if(t=s.controller)q=q||{},O("'"+A+"' controller",q[A],s,J),q[A]=s;if(t=s.transclude)O("transclusion",G,s,J),G=s,l=s.priority,t=="element"?(Y=w(b),J=c.$$element=w(T.createComment(" "+A+": "+c[A]+" ")),b=J[0],ja(e,w(Y[0]),b),P=y(Y,d,l)):(Y=w(fb(b)).contents(),
J.html(""),P=y(Y,d));if(s.template)if(O("template",W,s,J),W=s,t=H(s.template)?s.template(J,c):s.template,t=Lb(t),s.replace){Y=w("<div>"+U(t)+"</div>").contents();b=Y[0];if(Y.length!=1||b.nodeType!==1)throw Error(g+t);ja(e,J,b);A={$attr:{}};a=a.concat(v(b,a.splice(B+1,a.length-(B+1)),A));D(c,A);C=a.length}else J.html(t);if(s.templateUrl)O("template",W,s,J),W=s,k=$(a.splice(B,a.length-B),k,J,c,e,s.replace,P),C=a.length;else if(s.compile)try{na=s.compile(J,c,P),H(na)?h(null,na):na&&h(na.pre,na.post)}catch(I){m(I,
va(J))}if(s.terminal)k.terminal=!0,l=Math.max(l,s.priority)}k.scope=r&&r.scope;k.transclude=G&&P;return k}function G(d,e,j,g){var l=!1;if(a.hasOwnProperty(e))for(var k,e=b.get(e+c),i=0,o=e.length;i<o;i++)try{if(k=e[i],(g===p||g>k.priority)&&k.restrict.indexOf(j)!=-1)d.push(k),l=!0}catch(u){m(u)}return l}function D(a,b){var c=b.$attr,d=a.$attr,e=a.$$element;n(a,function(d,e){e.charAt(0)!="$"&&(b[e]&&(d+=(e==="style"?";":" ")+b[e]),a.$set(e,d,!0,c[e]))});n(b,function(b,j){j=="class"?(x(e,b),a["class"]=
(a["class"]?a["class"]+" ":"")+b):j=="style"?e.attr("style",e.attr("style")+";"+b):j.charAt(0)!="$"&&!a.hasOwnProperty(j)&&(a[j]=b,d[j]=c[j])})}function $(a,b,c,d,e,j,h){var i=[],o,m,u=c[0],z=a.shift(),r=t({},z,{controller:null,templateUrl:null,transclude:null,scope:null}),z=H(z.templateUrl)?z.templateUrl(c,d):z.templateUrl;c.html("");k.get(z,{cache:l}).success(function(l){var k,z,l=Lb(l);if(j){z=w("<div>"+U(l)+"</div>").contents();k=z[0];if(z.length!=1||k.nodeType!==1)throw Error(g+l);l={$attr:{}};
ja(e,c,k);v(k,a,l);D(d,l)}else k=u,c.html(l);a.unshift(r);o=A(a,k,d,h);for(m=W(c[0].childNodes,h);i.length;){var ea=i.shift(),l=i.shift();z=i.shift();var x=i.shift(),y=k;l!==u&&(y=fb(k),ja(z,w(l),y));o(function(){b(m,ea,y,e,x)},ea,y,e,x)}i=null}).error(function(a,b,c,d){throw Error("Failed to load template: "+d.url);});return function(a,c,d,e,j){i?(i.push(c),i.push(d),i.push(e),i.push(j)):o(function(){b(m,c,d,e,j)},c,d,e,j)}}function K(a,b){return b.priority-a.priority}function O(a,b,c,d){if(b)throw Error("Multiple directives ["+
b.name+", "+c.name+"] asking for "+a+" on: "+va(d));}function P(a,b){var c=j(b,!0);c&&a.push({priority:0,compile:S(function(a,b){var d=b.parent(),e=d.data("$binding")||[];e.push(c);x(d.data("$binding",e),"ng-binding");a.$watch(c,function(a){b[0].nodeValue=a})})})}function s(a,b,c,d){var e=j(c,!0);e&&b.push({priority:100,compile:S(function(a,b,c){b=c.$$observers||(c.$$observers={});if(e=j(c[d],!0))c[d]=e(a),(b[d]||(b[d]=[])).$$inter=!0,(c.$$observers&&c.$$observers[d].$$scope||a).$watch(e,function(a){c.$set(d,
a)})})})}function ja(a,b,c){var d=b[0],e=d.parentNode,j,g;if(a){j=0;for(g=a.length;j<g;j++)if(a[j]==d){a[j]=c;break}}e&&e.replaceChild(c,d);c[w.expando]=d[w.expando];b[0]=c}var ma=function(a,b){this.$$element=a;this.$attr=b||{}};ma.prototype={$normalize:da,$set:function(a,b,c,d){var e=Fb(this.$$element[0],a),j=this.$$observers;e&&(this.$$element.prop(a,b),d=e);this[a]=b;d?this.$attr[a]=d:(d=this.$attr[a])||(this.$attr[a]=d=bb(a,"-"));if(hb(this.$$element[0])==="A"&&a==="href")q.setAttribute("href",
b),e=q.href,e.match(i)||(this[a]=b="unsafe:"+e);c!==!1&&(b===null||b===p?this.$$element.removeAttr(d):this.$$element.attr(d,b));j&&n(j[a],function(a){try{a(b)}catch(c){m(c)}})},$observe:function(a,b){var c=this,d=c.$$observers||(c.$$observers={}),e=d[a]||(d[a]=[]);e.push(b);z.$evalAsync(function(){e.$$inter||b(c[a])});return b}};var q=r[0].createElement("a"),ea=j.startSymbol(),J=j.endSymbol(),Lb=ea=="{{"||J=="}}"?qa:function(a){return a.replace(/\{\{/g,ea).replace(/}}/g,J)},Y=/^ngAttr[A-Z]/;return y}]}
function da(b){return Ia(b.replace(Ic,""))}function Jc(){var b={},a=/^(\S+)(\s+as\s+(\w+))?$/;this.register=function(a,d){L(a)?t(b,a):b[a]=d};this.$get=["$injector","$window",function(c,d){return function(e,g){var i,f;E(e)&&(f=e.match(a),i=f[1],f=f[3],e=b.hasOwnProperty(i)?b[i]:ib(g.$scope,i,!0)||ib(d,i,!0),xa(e,i,!0));i=c.instantiate(e,g);if(f){if(typeof g.$scope!=="object")throw Error('Can not export controller as "'+f+'". No scope object provided!');g.$scope[f]=i}return i}}]}function Kc(){this.$get=
["$window",function(b){return w(b.document)}]}function Lc(){this.$get=["$log",function(b){return function(a,c){b.error.apply(b,arguments)}}]}function Mc(){var b="{{",a="}}";this.startSymbol=function(a){return a?(b=a,this):b};this.endSymbol=function(b){return b?(a=b,this):a};this.$get=["$parse","$exceptionHandler",function(c,d){function e(e,h){for(var j,m,k=0,l=[],u=e.length,o=!1,z=[];k<u;)(j=e.indexOf(b,k))!=-1&&(m=e.indexOf(a,j+g))!=-1?(k!=j&&l.push(e.substring(k,j)),l.push(k=c(o=e.substring(j+g,
m))),k.exp=o,k=m+i,o=!0):(k!=u&&l.push(e.substring(k)),k=u);if(!(u=l.length))l.push(""),u=1;if(!h||o)return z.length=u,k=function(a){try{for(var b=0,c=u,j;b<c;b++){if(typeof(j=l[b])=="function")j=j(a),j==null||j==p?j="":typeof j!="string"&&(j=ha(j));z[b]=j}return z.join("")}catch(g){d(Error("Error while interpolating: "+e+"\n"+g.toString()))}},k.exp=e,k.parts=l,k}var g=b.length,i=a.length;e.startSymbol=function(){return b};e.endSymbol=function(){return a};return e}]}function Mb(b){for(var b=b.split("/"),
a=b.length;a--;)b[a]=ab(b[a]);return b.join("/")}function Nb(b,a){var c=jb.exec(b);a.$$protocol=c[1];a.$$host=c[3];a.$$port=N(c[5])||Oa[c[1]]||null}function Ob(b,a){var c=Pb.exec(b);a.$$path=decodeURIComponent(c[1]);a.$$search=vb(c[3]);a.$$hash=decodeURIComponent(c[5]||"");if(a.$$path&&a.$$path.charAt(0)!="/")a.$$path="/"+a.$$path}function fa(b,a,c){return a.indexOf(b)==0?a.substr(b.length):c}function Ca(b){var a=b.indexOf("#");return a==-1?b:b.substr(0,a)}function kb(b){return b.substr(0,Ca(b).lastIndexOf("/")+
1)}function Qb(b,a){var a=a||"",c=kb(b);this.$$parse=function(a){var b={};Nb(a,b);var g=fa(c,a);if(!E(g))throw Error('Invalid url "'+a+'", missing path prefix "'+c+'".');Ob(g,b);t(this,b);if(!this.$$path)this.$$path="/";this.$$compose()};this.$$compose=function(){var a=wb(this.$$search),b=this.$$hash?"#"+ab(this.$$hash):"";this.$$url=Mb(this.$$path)+(a?"?"+a:"")+b;this.$$absUrl=c+this.$$url.substr(1)};this.$$rewrite=function(d){var e;if((e=fa(b,d))!==p)return d=e,(e=fa(a,e))!==p?c+(fa("/",e)||e):
b+d;else if((e=fa(c,d))!==p)return c+e;else if(c==d+"/")return c}}function lb(b,a){var c=kb(b);this.$$parse=function(d){Nb(d,this);var e=fa(b,d)||fa(c,d);if(!E(e))throw Error('Invalid url "'+d+'", does not start with "'+b+'".');e=e.charAt(0)=="#"?fa(a,e):e;if(!E(e))throw Error('Invalid url "'+d+'", missing hash prefix "'+a+'".');Ob(e,this);this.$$compose()};this.$$compose=function(){var c=wb(this.$$search),e=this.$$hash?"#"+ab(this.$$hash):"";this.$$url=Mb(this.$$path)+(c?"?"+c:"")+e;this.$$absUrl=
b+(this.$$url?a+this.$$url:"")};this.$$rewrite=function(a){if(Ca(b)==Ca(a))return a}}function Rb(b,a){lb.apply(this,arguments);var c=kb(b);this.$$rewrite=function(d){var e;if(b==Ca(d))return d;else if(e=fa(c,d))return b+a+e;else if(c===d+"/")return c}}function Pa(b){return function(){return this[b]}}function Sb(b,a){return function(c){if(C(c))return this[b];this[b]=a(c);this.$$compose();return this}}function Nc(){var b="",a=!1;this.hashPrefix=function(a){return B(a)?(b=a,this):b};this.html5Mode=function(b){return B(b)?
(a=b,this):a};this.$get=["$rootScope","$browser","$sniffer","$rootElement",function(c,d,e,g){function i(a){c.$broadcast("$locationChangeSuccess",f.absUrl(),a)}var f,h=d.baseHref(),j=d.url();a?(h=h?j.substring(0,j.indexOf("/",j.indexOf("//")+2))+h:j,e=e.history?Qb:Rb):(h=Ca(j),e=lb);f=new e(h,"#"+b);f.$$parse(f.$$rewrite(j));g.bind("click",function(a){if(!a.ctrlKey&&!(a.metaKey||a.which==2)){for(var b=w(a.target);I(b[0].nodeName)!=="a";)if(b[0]===g[0]||!(b=b.parent())[0])return;var e=b.prop("href"),
j=f.$$rewrite(e);e&&!b.attr("target")&&j&&!a.isDefaultPrevented()&&(a.preventDefault(),j!=d.url()&&(f.$$parse(j),c.$apply(),M.angular["ff-684208-preventDefault"]=!0))}});f.absUrl()!=j&&d.url(f.absUrl(),!0);d.onUrlChange(function(a){f.absUrl()!=a&&(c.$broadcast("$locationChangeStart",a,f.absUrl()).defaultPrevented?d.url(f.absUrl()):(c.$evalAsync(function(){var b=f.absUrl();f.$$parse(a);i(b)}),c.$$phase||c.$digest()))});var m=0;c.$watch(function(){var a=d.url(),b=f.$$replace;if(!m||a!=f.absUrl())m++,
c.$evalAsync(function(){c.$broadcast("$locationChangeStart",f.absUrl(),a).defaultPrevented?f.$$parse(a):(d.url(f.absUrl(),b),i(a))});f.$$replace=!1;return m});return f}]}function Oc(){var b=!0,a=this;this.debugEnabled=function(a){return B(a)?(b=a,this):b};this.$get=["$window",function(c){function d(a){a instanceof Error&&(a.stack?a=a.message&&a.stack.indexOf(a.message)===-1?"Error: "+a.message+"\n"+a.stack:a.stack:a.sourceURL&&(a=a.message+"\n"+a.sourceURL+":"+a.line));return a}function e(a){var b=
c.console||{},e=b[a]||b.log||q;return e.apply?function(){var a=[];n(arguments,function(b){a.push(d(b))});return e.apply(b,a)}:function(a,b){e(a,b)}}return{log:e("log"),warn:e("warn"),info:e("info"),error:e("error"),debug:function(){var c=e("debug");return function(){b&&c.apply(a,arguments)}}()}}]}function Pc(b,a){function c(a){return a.indexOf(r)!=-1}function d(a){a=a||1;return o+a<b.length?b.charAt(o+a):!1}function e(a){return"0"<=a&&a<="9"}function g(a){return a==" "||a=="\r"||a=="\t"||a=="\n"||
a=="\u000b"||a=="\u00a0"}function i(a){return"a"<=a&&a<="z"||"A"<=a&&a<="Z"||"_"==a||a=="$"}function f(a){return a=="-"||a=="+"||e(a)}function h(a,c,d){d=d||o;throw Error("Lexer Error: "+a+" at column"+(B(c)?"s "+c+"-"+o+" ["+b.substring(c,d)+"]":" "+d)+" in expression ["+b+"].");}function j(){for(var a="",c=o;o<b.length;){var j=I(b.charAt(o));if(j=="."||e(j))a+=j;else{var g=d();if(j=="e"&&f(g))a+=j;else if(f(j)&&g&&e(g)&&a.charAt(a.length-1)=="e")a+=j;else if(f(j)&&(!g||!e(g))&&a.charAt(a.length-
1)=="e")h("Invalid exponent");else break}o++}a*=1;l.push({index:c,text:a,json:!0,fn:function(){return a}})}function m(){for(var c="",d=o,f,j,h,k;o<b.length;){k=b.charAt(o);if(k=="."||i(k)||e(k))k=="."&&(f=o),c+=k;else break;o++}if(f)for(j=o;j<b.length;){k=b.charAt(j);if(k=="("){h=c.substr(f-d+1);c=c.substr(0,f-d);o=j;break}if(g(k))j++;else break}d={index:d,text:c};if(Da.hasOwnProperty(c))d.fn=d.json=Da[c];else{var m=Tb(c,a);d.fn=t(function(a,b){return m(a,b)},{assign:function(a,b){return Ub(a,c,b)}})}l.push(d);
h&&(l.push({index:f,text:".",json:!1}),l.push({index:f+1,text:h,json:!1}))}function k(a){var c=o;o++;for(var d="",e=a,f=!1;o<b.length;){var j=b.charAt(o);e+=j;if(f)j=="u"?(j=b.substring(o+1,o+5),j.match(/[\da-f]{4}/i)||h("Invalid unicode escape [\\u"+j+"]"),o+=4,d+=String.fromCharCode(parseInt(j,16))):(f=Qc[j],d+=f?f:j),f=!1;else if(j=="\\")f=!0;else if(j==a){o++;l.push({index:c,text:e,string:d,json:!0,fn:function(){return d}});return}else d+=j;o++}h("Unterminated quote",c)}for(var l=[],u,o=0,z=[],
r,y=":";o<b.length;){r=b.charAt(o);if(c("\"'"))k(r);else if(e(r)||c(".")&&e(d()))j();else if(i(r)){if(m(),"{,".indexOf(y)!=-1&&z[0]=="{"&&(u=l[l.length-1]))u.json=u.text.indexOf(".")==-1}else if(c("(){}[].,;:?"))l.push({index:o,text:r,json:":[,".indexOf(y)!=-1&&c("{[")||c("}]:,")}),c("{[")&&z.unshift(r),c("}]")&&z.shift(),o++;else if(g(r)){o++;continue}else{var x=r+d(),n=x+d(2),v=Da[r],A=Da[x],G=Da[n];G?(l.push({index:o,text:n,fn:G}),o+=3):A?(l.push({index:o,text:x,fn:A}),o+=2):v?(l.push({index:o,
text:r,fn:v,json:"[,:".indexOf(y)!=-1&&c("+-")}),o+=1):h("Unexpected next character ",o,o+1)}y=r}return l}function Rc(b,a,c,d){function e(a,c){throw Error("Syntax Error: Token '"+c.text+"' "+a+" at column "+(c.index+1)+" of the expression ["+b+"] starting at ["+b.substring(c.index)+"].");}function g(){if(O.length===0)throw Error("Unexpected end of expression: "+b);return O[0]}function i(a,b,c,d){if(O.length>0){var e=O[0],f=e.text;if(f==a||f==b||f==c||f==d||!a&&!b&&!c&&!d)return e}return!1}function f(b,
c,d,f){return(b=i(b,c,d,f))?(a&&!b.json&&e("is not valid json",b),O.shift(),b):!1}function h(a){f(a)||e("is unexpected, expecting ["+a+"]",i())}function j(a,b){return t(function(c,d){return a(c,d,b)},{constant:b.constant})}function m(a,b,c){return t(function(d,e){return a(d,e)?b(d,e):c(d,e)},{constant:a.constant&&b.constant&&c.constant})}function k(a,b,c){return t(function(d,e){return b(d,e,a,c)},{constant:a.constant&&c.constant})}function l(){for(var a=[];;)if(O.length>0&&!i("}",")",";","]")&&a.push(w()),
!f(";"))return a.length==1?a[0]:function(b,c){for(var d,e=0;e<a.length;e++){var f=a[e];f&&(d=f(b,c))}return d}}function u(){for(var a=f(),b=c(a.text),d=[];;)if(a=f(":"))d.push(P());else{var e=function(a,c,e){for(var e=[e],f=0;f<d.length;f++)e.push(d[f](a,c));return b.apply(a,e)};return function(){return e}}}function o(){var a=z(),b,c;if(f("?"))if(b=o(),c=f(":"))return m(a,b,o());else e("expected :",c);else return a}function z(){for(var a=r(),b;;)if(b=f("||"))a=k(a,b.fn,r());else return a}function r(){var a=
y(),b;if(b=f("&&"))a=k(a,b.fn,r());return a}function y(){var a=x(),b;if(b=f("==","!=","===","!=="))a=k(a,b.fn,y());return a}function x(){var a;a=n();for(var b;b=f("+","-");)a=k(a,b.fn,n());if(b=f("<",">","<=",">="))a=k(a,b.fn,x());return a}function n(){for(var a=v(),b;b=f("*","/","%");)a=k(a,b.fn,v());return a}function v(){var a;return f("+")?A():(a=f("-"))?k($,a.fn,v()):(a=f("!"))?j(a.fn,v()):A()}function A(){var a;if(f("("))a=w(),h(")");else if(f("["))a=G();else if(f("{"))a=D();else{var b=f();(a=
b.fn)||e("not a primary expression",b);if(b.json)a.constant=a.literal=!0}for(var c;b=f("(","[",".");)b.text==="("?(a=s(a,c),c=null):b.text==="["?(c=a,a=ma(a)):b.text==="."?(c=a,a=ja(a)):e("IMPOSSIBLE");return a}function G(){var a=[],b=!0;if(g().text!="]"){do{var c=P();a.push(c);c.constant||(b=!1)}while(f(","))}h("]");return t(function(b,c){for(var d=[],e=0;e<a.length;e++)d.push(a[e](b,c));return d},{literal:!0,constant:b})}function D(){var a=[],b=!0;if(g().text!="}"){do{var c=f(),c=c.string||c.text;
h(":");var d=P();a.push({key:c,value:d});d.constant||(b=!1)}while(f(","))}h("}");return t(function(b,c){for(var d={},e=0;e<a.length;e++){var f=a[e];d[f.key]=f.value(b,c)}return d},{literal:!0,constant:b})}var $=S(0),K,O=Pc(b,d),P=function(){var a=o(),c,d;return(d=f("="))?(a.assign||e("implies assignment but ["+b.substring(0,d.index)+"] can not be assigned to",d),c=o(),function(b,d){return a.assign(b,c(b,d),d)}):a},s=function(a,b){var c=[];if(g().text!=")"){do c.push(P());while(f(","))}h(")");return function(d,
e){for(var f=[],j=b?b(d,e):d,g=0;g<c.length;g++)f.push(c[g](d,e));g=a(d,e,j)||q;return g.apply?g.apply(j,f):g(f[0],f[1],f[2],f[3],f[4])}},ja=function(a){var b=f().text,c=Tb(b,d);return t(function(b,d,e){return c(e||a(b,d),d)},{assign:function(c,d,e){return Ub(a(c,e),b,d)}})},ma=function(a){var b=P();h("]");return t(function(c,d){var e=a(c,d),f=b(c,d),j;if(!e)return p;if((e=e[f])&&e.then){j=e;if(!("$$v"in e))j.$$v=p,j.then(function(a){j.$$v=a});e=e.$$v}return e},{assign:function(c,d,e){return a(c,
e)[b(c,e)]=d}})},w=function(){for(var a=P(),b;;)if(b=f("|"))a=k(a,b.fn,u());else return a};a?(P=z,s=ja=ma=w=function(){e("is not valid json",{text:b,index:0})},K=A()):K=l();O.length!==0&&e("is an unexpected token",O[0]);K.literal=!!K.literal;K.constant=!!K.constant;return K}function Ub(b,a,c){for(var a=a.split("."),d=0;a.length>1;d++){var e=a.shift(),g=b[e];g||(g={},b[e]=g);b=g}return b[a.shift()]=c}function ib(b,a,c){if(!a)return b;for(var a=a.split("."),d,e=b,g=a.length,i=0;i<g;i++)d=a[i],b&&(b=
(e=b)[d]);return!c&&H(b)?$a(e,b):b}function Vb(b,a,c,d,e){return function(g,i){var f=i&&i.hasOwnProperty(b)?i:g,h;if(f===null||f===p)return f;if((f=f[b])&&f.then){if(!("$$v"in f))h=f,h.$$v=p,h.then(function(a){h.$$v=a});f=f.$$v}if(!a||f===null||f===p)return f;if((f=f[a])&&f.then){if(!("$$v"in f))h=f,h.$$v=p,h.then(function(a){h.$$v=a});f=f.$$v}if(!c||f===null||f===p)return f;if((f=f[c])&&f.then){if(!("$$v"in f))h=f,h.$$v=p,h.then(function(a){h.$$v=a});f=f.$$v}if(!d||f===null||f===p)return f;if((f=
f[d])&&f.then){if(!("$$v"in f))h=f,h.$$v=p,h.then(function(a){h.$$v=a});f=f.$$v}if(!e||f===null||f===p)return f;if((f=f[e])&&f.then){if(!("$$v"in f))h=f,h.$$v=p,h.then(function(a){h.$$v=a});f=f.$$v}return f}}function Tb(b,a){if(mb.hasOwnProperty(b))return mb[b];var c=b.split("."),d=c.length,e;if(a)e=d<6?Vb(c[0],c[1],c[2],c[3],c[4]):function(a,b){var e=0,j;do j=Vb(c[e++],c[e++],c[e++],c[e++],c[e++])(a,b),b=p,a=j;while(e<d);return j};else{var g="var l, fn, p;\n";n(c,function(a,b){g+="if(s === null || s === undefined) return s;\nl=s;\ns="+
(b?"s":'((k&&k.hasOwnProperty("'+a+'"))?k:s)')+'["'+a+'"];\nif (s && s.then) {\n if (!("$$v" in s)) {\n p=s;\n p.$$v = undefined;\n p.then(function(v) {p.$$v=v;});\n}\n s=s.$$v\n}\n'});g+="return s;";e=Function("s","k",g);e.toString=function(){return g}}return mb[b]=e}function Sc(){var b={};this.$get=["$filter","$sniffer",function(a,c){return function(d){switch(typeof d){case "string":return b.hasOwnProperty(d)?b[d]:b[d]=Rc(d,!1,a,c.csp);case "function":return d;default:return q}}}]}function Tc(){this.$get=
["$rootScope","$exceptionHandler",function(b,a){return Uc(function(a){b.$evalAsync(a)},a)}]}function Uc(b,a){function c(a){return a}function d(a){return i(a)}var e=function(){var f=[],h,j;return j={resolve:function(a){if(f){var c=f;f=p;h=g(a);c.length&&b(function(){for(var a,b=0,d=c.length;b<d;b++)a=c[b],h.then(a[0],a[1])})}},reject:function(a){j.resolve(i(a))},promise:{then:function(b,j){var g=e(),i=function(d){try{g.resolve((b||c)(d))}catch(e){a(e),g.reject(e)}},o=function(b){try{g.resolve((j||
d)(b))}catch(c){a(c),g.reject(c)}};f?f.push([i,o]):h.then(i,o);return g.promise},always:function(a){function b(a,c){var d=e();c?d.resolve(a):d.reject(a);return d.promise}function d(e,f){var j=null;try{j=(a||c)()}catch(g){return b(g,!1)}return j&&j.then?j.then(function(){return b(e,f)},function(a){return b(a,!1)}):b(e,f)}return this.then(function(a){return d(a,!0)},function(a){return d(a,!1)})}}}},g=function(a){return a&&a.then?a:{then:function(c){var d=e();b(function(){d.resolve(c(a))});return d.promise}}},
i=function(a){return{then:function(c,j){var g=e();b(function(){g.resolve((j||d)(a))});return g.promise}}};return{defer:e,reject:i,when:function(f,h,j){var m=e(),k,l=function(b){try{return(h||c)(b)}catch(d){return a(d),i(d)}},u=function(b){try{return(j||d)(b)}catch(c){return a(c),i(c)}};b(function(){g(f).then(function(a){k||(k=!0,m.resolve(g(a).then(l,u)))},function(a){k||(k=!0,m.resolve(u(a)))})});return m.promise},all:function(a){var b=e(),c=0,d=F(a)?[]:{};n(a,function(a,e){c++;g(a).then(function(a){d.hasOwnProperty(e)||
(d[e]=a,--c||b.resolve(d))},function(a){d.hasOwnProperty(e)||b.reject(a)})});c===0&&b.resolve(d);return b.promise}}}function Vc(){var b={};this.when=function(a,c){b[a]=t({reloadOnSearch:!0,caseInsensitiveMatch:!1},c);if(a){var d=a[a.length-1]=="/"?a.substr(0,a.length-1):a+"/";b[d]={redirectTo:a}}return this};this.otherwise=function(a){this.when(null,a);return this};this.$get=["$rootScope","$location","$routeParams","$q","$injector","$http","$templateCache",function(a,c,d,e,g,i,f){function h(a,b,c){for(var b=
"^"+b.replace(/[-\/\\^$:*+?.()|[\]{}]/g,"\\$&")+"$",d="",e=[],f={},j=/\\([:*])(\w+)/g,g,i=0;(g=j.exec(b))!==null;){d+=b.slice(i,g.index);switch(g[1]){case ":":d+="([^\\/]*)";break;case "*":d+="(.*)"}e.push(g[2]);i=j.lastIndex}d+=b.substr(i);var h=a.match(RegExp(d,c.caseInsensitiveMatch?"i":""));h&&n(e,function(a,b){f[a]=h[b+1]});return h?f:null}function j(){var b=m(),j=u.current;if(b&&j&&b.$$route===j.$$route&&ia(b.pathParams,j.pathParams)&&!b.reloadOnSearch&&!l)j.params=b.params,V(j.params,d),a.$broadcast("$routeUpdate",
j);else if(b||j)l=!1,a.$broadcast("$routeChangeStart",b,j),(u.current=b)&&b.redirectTo&&(E(b.redirectTo)?c.path(k(b.redirectTo,b.params)).search(b.params).replace():c.url(b.redirectTo(b.pathParams,c.path(),c.search())).replace()),e.when(b).then(function(){if(b){var a=t({},b.resolve),c;n(a,function(b,c){a[c]=E(b)?g.get(b):g.invoke(b)});if(B(c=b.template))H(c)&&(c=c(b.params));else if(B(c=b.templateUrl))if(H(c)&&(c=c(b.params)),B(c))b.loadedTemplateUrl=c,c=i.get(c,{cache:f}).then(function(a){return a.data});
B(c)&&(a.$template=c);return e.all(a)}}).then(function(c){if(b==u.current){if(b)b.locals=c,V(b.params,d);a.$broadcast("$routeChangeSuccess",b,j)}},function(c){b==u.current&&a.$broadcast("$routeChangeError",b,j,c)})}function m(){var a,d;n(b,function(b,e){if(!d&&(a=h(c.path(),e,b)))d=tb(b,{params:t({},c.search(),a),pathParams:a}),d.$$route=b});return d||b[null]&&tb(b[null],{params:{},pathParams:{}})}function k(a,b){var c=[];n((a||"").split(":"),function(a,d){if(d==0)c.push(a);else{var e=a.match(/(\w+)(.*)/),
f=e[1];c.push(b[f]);c.push(e[2]||"");delete b[f]}});return c.join("")}var l=!1,u={routes:b,reload:function(){l=!0;a.$evalAsync(j)}};a.$on("$locationChangeSuccess",j);return u}]}function Wc(){this.$get=S({})}function Xc(){var b=10;this.digestTtl=function(a){arguments.length&&(b=a);return b};this.$get=["$injector","$exceptionHandler","$parse",function(a,c,d){function e(){this.$id=Fa();this.$$phase=this.$parent=this.$$watchers=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null;
this["this"]=this.$root=this;this.$$destroyed=!1;this.$$asyncQueue=[];this.$$listeners={};this.$$isolateBindings={}}function g(a){if(h.$$phase)throw Error(h.$$phase+" already in progress");h.$$phase=a}function i(a,b){var c=d(a);xa(c,b);return c}function f(){}e.prototype={$new:function(a){if(H(a))throw Error("API-CHANGE: Use $controller to instantiate controllers.");a?(a=new e,a.$root=this.$root):(a=function(){},a.prototype=this,a=new a,a.$id=Fa());a["this"]=a;a.$$listeners={};a.$parent=this;a.$$watchers=
a.$$nextSibling=a.$$childHead=a.$$childTail=null;a.$$prevSibling=this.$$childTail;this.$$childHead?this.$$childTail=this.$$childTail.$$nextSibling=a:this.$$childHead=this.$$childTail=a;return a},$watch:function(a,b,c){var d=i(a,"watch"),e=this.$$watchers,g={fn:b,last:f,get:d,exp:a,eq:!!c};if(!H(b)){var h=i(b||q,"listener");g.fn=function(a,b,c){h(c)}}if(typeof a=="string"&&d.constant){var r=g.fn;g.fn=function(a,b,c){r.call(this,a,b,c);ta(e,g)}}if(!e)e=this.$$watchers=[];e.unshift(g);return function(){ta(e,
g)}},$watchCollection:function(a,b){var c=this,e,f,g=0,i=d(a),h=[],n={},x=0;return this.$watch(function(){f=i(c);var a,b;if(L(f))if(Xa(f)){if(e!==h)e=h,x=e.length=0,g++;a=f.length;if(x!==a)g++,e.length=x=a;for(b=0;b<a;b++)e[b]!==f[b]&&(g++,e[b]=f[b])}else{e!==n&&(e=n={},x=0,g++);a=0;for(b in f)f.hasOwnProperty(b)&&(a++,e.hasOwnProperty(b)?e[b]!==f[b]&&(g++,e[b]=f[b]):(x++,e[b]=f[b],g++));if(x>a)for(b in g++,e)e.hasOwnProperty(b)&&!f.hasOwnProperty(b)&&(x--,delete e[b])}else e!==f&&(e=f,g++);return g},
function(){b(f,e,c)})},$digest:function(){var a,d,e,i,u=this.$$asyncQueue,o,z,r=b,n,x=[],p,v;g("$digest");do{z=!1;for(n=this;u.length;)try{n.$eval(u.shift())}catch(A){c(A)}do{if(i=n.$$watchers)for(o=i.length;o--;)try{if(a=i[o],(d=a.get(n))!==(e=a.last)&&!(a.eq?ia(d,e):typeof d=="number"&&typeof e=="number"&&isNaN(d)&&isNaN(e)))z=!0,a.last=a.eq?V(d):d,a.fn(d,e===f?d:e,n),r<5&&(p=4-r,x[p]||(x[p]=[]),v=H(a.exp)?"fn: "+(a.exp.name||a.exp.toString()):a.exp,v+="; newVal: "+ha(d)+"; oldVal: "+ha(e),x[p].push(v))}catch(G){c(G)}if(!(i=
n.$$childHead||n!==this&&n.$$nextSibling))for(;n!==this&&!(i=n.$$nextSibling);)n=n.$parent}while(n=i);if(z&&!r--)throw h.$$phase=null,Error(b+" $digest() iterations reached. Aborting!\nWatchers fired in the last 5 iterations: "+ha(x));}while(z||u.length);h.$$phase=null},$destroy:function(){if(!(h==this||this.$$destroyed)){var a=this.$parent;this.$broadcast("$destroy");this.$$destroyed=!0;if(a.$$childHead==this)a.$$childHead=this.$$nextSibling;if(a.$$childTail==this)a.$$childTail=this.$$prevSibling;
if(this.$$prevSibling)this.$$prevSibling.$$nextSibling=this.$$nextSibling;if(this.$$nextSibling)this.$$nextSibling.$$prevSibling=this.$$prevSibling;this.$parent=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null}},$eval:function(a,b){return d(a)(this,b)},$evalAsync:function(a){this.$$asyncQueue.push(a)},$apply:function(a){try{return g("$apply"),this.$eval(a)}catch(b){c(b)}finally{h.$$phase=null;try{h.$digest()}catch(d){throw c(d),d;}}},$on:function(a,b){var c=this.$$listeners[a];
c||(this.$$listeners[a]=c=[]);c.push(b);return function(){c[Ga(c,b)]=null}},$emit:function(a,b){var d=[],e,f=this,g=!1,i={name:a,targetScope:f,stopPropagation:function(){g=!0},preventDefault:function(){i.defaultPrevented=!0},defaultPrevented:!1},h=[i].concat(ka.call(arguments,1)),n,x;do{e=f.$$listeners[a]||d;i.currentScope=f;n=0;for(x=e.length;n<x;n++)if(e[n])try{if(e[n].apply(null,h),g)return i}catch(p){c(p)}else e.splice(n,1),n--,x--;f=f.$parent}while(f);return i},$broadcast:function(a,b){var d=
this,e=this,f={name:a,targetScope:this,preventDefault:function(){f.defaultPrevented=!0},defaultPrevented:!1},g=[f].concat(ka.call(arguments,1)),i,h;do{d=e;f.currentScope=d;e=d.$$listeners[a]||[];i=0;for(h=e.length;i<h;i++)if(e[i])try{e[i].apply(null,g)}catch(n){c(n)}else e.splice(i,1),i--,h--;if(!(e=d.$$childHead||d!==this&&d.$$nextSibling))for(;d!==this&&!(e=d.$$nextSibling);)d=d.$parent}while(d=e);return f}};var h=new e;return h}]}function Yc(){this.$get=["$window","$document",function(b,a){var c=
{},d=N((/android (\d+)/.exec(I((b.navigator||{}).userAgent))||[])[1]),e=a[0]||{},g,i=/^(Moz|webkit|O|ms)(?=[A-Z])/,f=e.body&&e.body.style,h=!1,j=!1;if(f){for(var m in f)if(h=i.exec(m)){g=h[0];g=g.substr(0,1).toUpperCase()+g.substr(1);break}h=!!("transition"in f||g+"Transition"in f);j=!!("animation"in f||g+"Animation"in f)}return{history:!(!b.history||!b.history.pushState||d<4),hashchange:"onhashchange"in b&&(!e.documentMode||e.documentMode>7),hasEvent:function(a){if(a=="input"&&Z==9)return!1;if(C(c[a])){var b=
e.createElement("div");c[a]="on"+a in b}return c[a]},csp:e.securityPolicy?e.securityPolicy.isActive:!1,vendorPrefix:g,transitions:h,animations:j}}]}function Zc(){this.$get=S(M)}function Wb(b){var a={},c,d,e;if(!b)return a;n(b.split("\n"),function(b){e=b.indexOf(":");c=I(U(b.substr(0,e)));d=U(b.substr(e+1));c&&(a[c]?a[c]+=", "+d:a[c]=d)});return a}function $c(b,a){var c=ad.exec(b);if(c==null)return!0;var d={protocol:c[2],host:c[4],port:N(c[6])||Oa[c[2]]||null,relativeProtocol:c[2]===p||c[2]===""},
c=jb.exec(a),c={protocol:c[1],host:c[3],port:N(c[5])||Oa[c[1]]||null};return(d.protocol==c.protocol||d.relativeProtocol)&&d.host==c.host&&(d.port==c.port||d.relativeProtocol&&c.port==Oa[c.protocol])}function Xb(b){var a=L(b)?b:p;return function(c){a||(a=Wb(b));return c?a[I(c)]||null:a}}function Yb(b,a,c){if(H(c))return c(b,a);n(c,function(c){b=c(b,a)});return b}function bd(){var b=/^\s*(\[|\{[^\{])/,a=/[\}\]]\s*$/,c=/^\)\]\}',?\n/,d={"Content-Type":"application/json;charset=utf-8"},e=this.defaults=
{transformResponse:[function(d){E(d)&&(d=d.replace(c,""),b.test(d)&&a.test(d)&&(d=ub(d,!0)));return d}],transformRequest:[function(a){return L(a)&&Ea.apply(a)!=="[object File]"?ha(a):a}],headers:{common:{Accept:"application/json, text/plain, */*"},post:d,put:d,patch:d},xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN"},g=this.interceptors=[],i=this.responseInterceptors=[];this.$get=["$httpBackend","$browser","$cacheFactory","$rootScope","$q","$injector",function(a,b,c,d,k,l){function u(a){function c(a){var b=
t({},a,{data:Yb(a.data,a.headers,d.transformResponse)});return 200<=a.status&&a.status<300?b:k.reject(b)}var d={transformRequest:e.transformRequest,transformResponse:e.transformResponse},f={};t(d,a);d.headers=f;d.method=oa(d.method);t(f,e.headers.common,e.headers[I(d.method)],a.headers);(a=$c(d.url,b.url())?b.cookies()[d.xsrfCookieName||e.xsrfCookieName]:p)&&(f[d.xsrfHeaderName||e.xsrfHeaderName]=a);var g=[function(a){var b=Yb(a.data,Xb(f),a.transformRequest);C(a.data)&&delete f["Content-Type"];if(C(a.withCredentials)&&
!C(e.withCredentials))a.withCredentials=e.withCredentials;return o(a,b,f).then(c,c)},p],j=k.when(d);for(n(y,function(a){(a.request||a.requestError)&&g.unshift(a.request,a.requestError);(a.response||a.responseError)&&g.push(a.response,a.responseError)});g.length;)var a=g.shift(),i=g.shift(),j=j.then(a,i);j.success=function(a){j.then(function(b){a(b.data,b.status,b.headers,d)});return j};j.error=function(a){j.then(null,function(b){a(b.data,b.status,b.headers,d)});return j};return j}function o(b,c,g){function j(a,
b,c){n&&(200<=a&&a<300?n.put(s,[a,b,Wb(c)]):n.remove(s));i(b,a,c);d.$$phase||d.$apply()}function i(a,c,d){c=Math.max(c,0);(200<=c&&c<300?l.resolve:l.reject)({data:a,status:c,headers:Xb(d),config:b})}function h(){var a=Ga(u.pendingRequests,b);a!==-1&&u.pendingRequests.splice(a,1)}var l=k.defer(),o=l.promise,n,p,s=z(b.url,b.params);u.pendingRequests.push(b);o.then(h,h);if((b.cache||e.cache)&&b.cache!==!1&&b.method=="GET")n=L(b.cache)?b.cache:L(e.cache)?e.cache:r;if(n)if(p=n.get(s))if(p.then)return p.then(h,
h),p;else F(p)?i(p[1],p[0],V(p[2])):i(p,200,{});else n.put(s,o);p||a(b.method,s,c,j,g,b.timeout,b.withCredentials,b.responseType);return o}function z(a,b){if(!b)return a;var c=[];nc(b,function(a,b){a==null||a==p||(F(a)||(a=[a]),n(a,function(a){L(a)&&(a=ha(a));c.push(wa(b)+"="+wa(a))}))});return a+(a.indexOf("?")==-1?"?":"&")+c.join("&")}var r=c("$http"),y=[];n(g,function(a){y.unshift(E(a)?l.get(a):l.invoke(a))});n(i,function(a,b){var c=E(a)?l.get(a):l.invoke(a);y.splice(b,0,{response:function(a){return c(k.when(a))},
responseError:function(a){return c(k.reject(a))}})});u.pendingRequests=[];(function(a){n(arguments,function(a){u[a]=function(b,c){return u(t(c||{},{method:a,url:b}))}})})("get","delete","head","jsonp");(function(a){n(arguments,function(a){u[a]=function(b,c,d){return u(t(d||{},{method:a,url:b,data:c}))}})})("post","put");u.defaults=e;return u}]}function cd(){this.$get=["$browser","$window","$document",function(b,a,c){return dd(b,ed,b.defer,a.angular.callbacks,c[0],a.location.protocol.replace(":",""))}]}
function dd(b,a,c,d,e,g){function i(a,b){var c=e.createElement("script"),d=function(){e.body.removeChild(c);b&&b()};c.type="text/javascript";c.src=a;Z?c.onreadystatechange=function(){/loaded|complete/.test(c.readyState)&&d()}:c.onload=c.onerror=d;e.body.appendChild(c);return d}return function(e,h,j,m,k,l,u,o){function z(){p=-1;t&&t();v&&v.abort()}function r(a,d,e,f){var j=(h.match(jb)||["",g])[1];A&&c.cancel(A);t=v=null;d=j=="file"?e?200:404:d;a(d==1223?204:d,e,f);b.$$completeOutstandingRequest(q)}
var p;b.$$incOutstandingRequestCount();h=h||b.url();if(I(e)=="jsonp"){var x="_"+(d.counter++).toString(36);d[x]=function(a){d[x].data=a};var t=i(h.replace("JSON_CALLBACK","angular.callbacks."+x),function(){d[x].data?r(m,200,d[x].data):r(m,p||-2);delete d[x]})}else{var v=new a;v.open(e,h,!0);n(k,function(a,b){a&&v.setRequestHeader(b,a)});v.onreadystatechange=function(){if(v.readyState==4){var a=v.getAllResponseHeaders(),b=["Cache-Control","Content-Language","Content-Type","Expires","Last-Modified",
"Pragma"];a||(a="",n(b,function(b){var c=v.getResponseHeader(b);c&&(a+=b+": "+c+"\n")}));r(m,p||v.status,v.responseType?v.response:v.responseText,a)}};if(u)v.withCredentials=!0;if(o)v.responseType=o;v.send(j||"")}if(l>0)var A=c(z,l);else l&&l.then&&l.then(z)}}function fd(){this.$get=function(){return{id:"en-us",NUMBER_FORMATS:{DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{minInt:1,minFrac:0,maxFrac:3,posPre:"",posSuf:"",negPre:"-",negSuf:"",gSize:3,lgSize:3},{minInt:1,minFrac:2,maxFrac:2,posPre:"\u00a4",
posSuf:"",negPre:"(\u00a4",negSuf:")",gSize:3,lgSize:3}],CURRENCY_SYM:"$"},DATETIME_FORMATS:{MONTH:"January,February,March,April,May,June,July,August,September,October,November,December".split(","),SHORTMONTH:"Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),DAY:"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),SHORTDAY:"Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(","),AMPMS:["AM","PM"],medium:"MMM d, y h:mm:ss a","short":"M/d/yy h:mm a",fullDate:"EEEE, MMMM d, y",longDate:"MMMM d, y",
mediumDate:"MMM d, y",shortDate:"M/d/yy",mediumTime:"h:mm:ss a",shortTime:"h:mm a"},pluralCat:function(b){return b===1?"one":"other"}}}}function gd(){this.$get=["$rootScope","$browser","$q","$exceptionHandler",function(b,a,c,d){function e(e,f,h){var j=c.defer(),m=j.promise,k=B(h)&&!h,f=a.defer(function(){try{j.resolve(e())}catch(a){j.reject(a),d(a)}k||b.$apply()},f),h=function(){delete g[m.$$timeoutId]};m.$$timeoutId=f;g[f]=j;m.then(h,h);return m}var g={};e.cancel=function(b){return b&&b.$$timeoutId in
g?(g[b.$$timeoutId].reject("canceled"),a.defer.cancel(b.$$timeoutId)):!1};return e}]}function Zb(b){function a(a,e){return b.factory(a+c,e)}var c="Filter";this.register=a;this.$get=["$injector",function(a){return function(b){return a.get(b+c)}}];a("currency",$b);a("date",ac);a("filter",hd);a("json",id);a("limitTo",jd);a("lowercase",kd);a("number",bc);a("orderBy",cc);a("uppercase",ld)}function hd(){return function(b,a,c){if(!F(b))return b;var d=[];d.check=function(a){for(var b=0;b<d.length;b++)if(!d[b](a))return!1;
return!0};switch(typeof c){case "function":break;case "boolean":if(c==!0){c=function(a,b){return Ha.equals(a,b)};break}default:c=function(a,b){b=(""+b).toLowerCase();return(""+a).toLowerCase().indexOf(b)>-1}}var e=function(a,b){if(typeof b=="string"&&b.charAt(0)==="!")return!e(a,b.substr(1));switch(typeof a){case "boolean":case "number":case "string":return c(a,b);case "object":switch(typeof b){case "object":return c(a,b);default:for(var d in a)if(d.charAt(0)!=="$"&&e(a[d],b))return!0}return!1;case "array":for(d=
0;d<a.length;d++)if(e(a[d],b))return!0;return!1;default:return!1}};switch(typeof a){case "boolean":case "number":case "string":a={$:a};case "object":for(var g in a)g=="$"?function(){if(a[g]){var b=g;d.push(function(c){return e(c,a[b])})}}():function(){if(a[g]){var b=g;d.push(function(c){return e(ib(c,b),a[b])})}}();break;case "function":d.push(a);break;default:return b}for(var i=[],f=0;f<b.length;f++){var h=b[f];d.check(h)&&i.push(h)}return i}}function $b(b){var a=b.NUMBER_FORMATS;return function(b,
d){if(C(d))d=a.CURRENCY_SYM;return dc(b,a.PATTERNS[1],a.GROUP_SEP,a.DECIMAL_SEP,2).replace(/\u00A4/g,d)}}function bc(b){var a=b.NUMBER_FORMATS;return function(b,d){return dc(b,a.PATTERNS[0],a.GROUP_SEP,a.DECIMAL_SEP,d)}}function dc(b,a,c,d,e){if(isNaN(b)||!isFinite(b))return"";var g=b<0,b=Math.abs(b),i=b+"",f="",h=[],j=!1;if(i.indexOf("e")!==-1){var m=i.match(/([\d\.]+)e(-?)(\d+)/);m&&m[2]=="-"&&m[3]>e+1?i="0":(f=i,j=!0)}if(!j){i=(i.split(ec)[1]||"").length;C(e)&&(e=Math.min(Math.max(a.minFrac,i),
a.maxFrac));var i=Math.pow(10,e),b=Math.round(b*i)/i,b=(""+b).split(ec),i=b[0],b=b[1]||"",j=0,m=a.lgSize,k=a.gSize;if(i.length>=m+k)for(var j=i.length-m,l=0;l<j;l++)(j-l)%k===0&&l!==0&&(f+=c),f+=i.charAt(l);for(l=j;l<i.length;l++)(i.length-l)%m===0&&l!==0&&(f+=c),f+=i.charAt(l);for(;b.length<e;)b+="0";e&&e!=="0"&&(f+=d+b.substr(0,e))}h.push(g?a.negPre:a.posPre);h.push(f);h.push(g?a.negSuf:a.posSuf);return h.join("")}function nb(b,a,c){var d="";b<0&&(d="-",b=-b);for(b=""+b;b.length<a;)b="0"+b;c&&(b=
b.substr(b.length-a));return d+b}function Q(b,a,c,d){c=c||0;return function(e){e=e["get"+b]();if(c>0||e>-c)e+=c;e===0&&c==-12&&(e=12);return nb(e,a,d)}}function Qa(b,a){return function(c,d){var e=c["get"+b](),g=oa(a?"SHORT"+b:b);return d[g][e]}}function ac(b){function a(a){var b;if(b=a.match(c)){var a=new Date(0),g=0,i=0,f=b[8]?a.setUTCFullYear:a.setFullYear,h=b[8]?a.setUTCHours:a.setHours;b[9]&&(g=N(b[9]+b[10]),i=N(b[9]+b[11]));f.call(a,N(b[1]),N(b[2])-1,N(b[3]));g=N(b[4]||0)-g;i=N(b[5]||0)-i;f=
N(b[6]||0);b=Math.round(parseFloat("0."+(b[7]||0))*1E3);h.call(a,g,i,f,b)}return a}var c=/^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;return function(c,e){var g="",i=[],f,h,e=e||"mediumDate",e=b.DATETIME_FORMATS[e]||e;E(c)&&(c=md.test(c)?N(c):a(c));Ya(c)&&(c=new Date(c));if(!ra(c))return c;for(;e;)(h=nd.exec(e))?(i=i.concat(ka.call(h,1)),e=i.pop()):(i.push(e),e=null);n(i,function(a){f=od[a];g+=f?f(c,b.DATETIME_FORMATS):a.replace(/(^'|'$)/g,
"").replace(/''/g,"'")});return g}}function id(){return function(b){return ha(b,!0)}}function jd(){return function(b,a){if(!F(b)&&!E(b))return b;a=N(a);if(E(b))return a?a>=0?b.slice(0,a):b.slice(a,b.length):"";var c=[],d,e;a>b.length?a=b.length:a<-b.length&&(a=-b.length);a>0?(d=0,e=a):(d=b.length+a,e=b.length);for(;d<e;d++)c.push(b[d]);return c}}function cc(b){return function(a,c,d){function e(a,b){return ua(b)?function(b,c){return a(c,b)}:a}if(!F(a))return a;if(!c)return a;for(var c=F(c)?c:[c],c=
Za(c,function(a){var c=!1,d=a||qa;if(E(a)){if(a.charAt(0)=="+"||a.charAt(0)=="-")c=a.charAt(0)=="-",a=a.substring(1);d=b(a)}return e(function(a,b){var c;c=d(a);var e=d(b),f=typeof c,g=typeof e;f==g?(f=="string"&&(c=c.toLowerCase()),f=="string"&&(e=e.toLowerCase()),c=c===e?0:c<e?-1:1):c=f<g?-1:1;return c},c)}),g=[],i=0;i<a.length;i++)g.push(a[i]);return g.sort(e(function(a,b){for(var d=0;d<c.length;d++){var e=c[d](a,b);if(e!==0)return e}return 0},d))}}function aa(b){H(b)&&(b={link:b});b.restrict=b.restrict||
"AC";return S(b)}function fc(b,a){function c(a,c){c=c?"-"+bb(c,"-"):"";b.removeClass((a?Ra:Sa)+c).addClass((a?Sa:Ra)+c)}var d=this,e=b.parent().controller("form")||Ta,g=0,i=d.$error={},f=[];d.$name=a.name;d.$dirty=!1;d.$pristine=!0;d.$valid=!0;d.$invalid=!1;e.$addControl(d);b.addClass(pa);c(!0);d.$addControl=function(a){f.push(a);a.$name&&!d.hasOwnProperty(a.$name)&&(d[a.$name]=a)};d.$removeControl=function(a){a.$name&&d[a.$name]===a&&delete d[a.$name];n(i,function(b,c){d.$setValidity(c,!0,a)});ta(f,
a)};d.$setValidity=function(a,b,f){var k=i[a];if(b){if(k&&(ta(k,f),!k.length)){g--;if(!g)c(b),d.$valid=!0,d.$invalid=!1;i[a]=!1;c(!0,a);e.$setValidity(a,!0,d)}}else{g||c(b);if(k){if(Ga(k,f)!=-1)return}else i[a]=k=[],g++,c(!1,a),e.$setValidity(a,!1,d);k.push(f);d.$valid=!1;d.$invalid=!0}};d.$setDirty=function(){b.removeClass(pa).addClass(Ua);d.$dirty=!0;d.$pristine=!1;e.$setDirty()};d.$setPristine=function(){b.removeClass(Ua).addClass(pa);d.$dirty=!1;d.$pristine=!0;n(f,function(a){a.$setPristine()})}}
function X(b){return C(b)||b===""||b===null||b!==b}function Va(b,a,c,d,e,g){var i=function(){var e=a.val();if(ua(c.ngTrim||"T"))e=U(e);d.$viewValue!==e&&b.$apply(function(){d.$setViewValue(e)})};if(e.hasEvent("input"))a.bind("input",i);else{var f,h=function(){f||(f=g.defer(function(){i();f=null}))};a.bind("keydown",function(a){a=a.keyCode;a===91||15<a&&a<19||37<=a&&a<=40||h()});a.bind("change",i);e.hasEvent("paste")&&a.bind("paste cut",h)}d.$render=function(){a.val(X(d.$viewValue)?"":d.$viewValue)};
var j=c.ngPattern,m=function(a,b){return X(b)||a.test(b)?(d.$setValidity("pattern",!0),b):(d.$setValidity("pattern",!1),p)};j&&((e=j.match(/^\/(.*)\/([gim]*)$/))?(j=RegExp(e[1],e[2]),e=function(a){return m(j,a)}):e=function(a){var c=b.$eval(j);if(!c||!c.test)throw Error("Expected "+j+" to be a RegExp but was "+c);return m(c,a)},d.$formatters.push(e),d.$parsers.push(e));if(c.ngMinlength){var k=N(c.ngMinlength),e=function(a){return!X(a)&&a.length<k?(d.$setValidity("minlength",!1),p):(d.$setValidity("minlength",
!0),a)};d.$parsers.push(e);d.$formatters.push(e)}if(c.ngMaxlength){var l=N(c.ngMaxlength),e=function(a){return!X(a)&&a.length>l?(d.$setValidity("maxlength",!1),p):(d.$setValidity("maxlength",!0),a)};d.$parsers.push(e);d.$formatters.push(e)}}function ob(b,a){b="ngClass"+b;return aa(function(c,d,e){function g(b){if(a===!0||c.$index%2===a)h&&!ia(b,h)&&i(h),f(b);h=V(b)}function i(a){L(a)&&!F(a)&&(a=Za(a,function(a,b){if(a)return b}));d.removeClass(F(a)?a.join(" "):a)}function f(a){L(a)&&!F(a)&&(a=Za(a,
function(a,b){if(a)return b}));a&&d.addClass(F(a)?a.join(" "):a)}var h=p;c.$watch(e[b],g,!0);e.$observe("class",function(){var a=c.$eval(e[b]);g(a,a)});b!=="ngClass"&&c.$watch("$index",function(d,g){var h=d&1;h!==g&1&&(h===a?f(c.$eval(e[b])):i(c.$eval(e[b])))})})}var I=function(b){return E(b)?b.toLowerCase():b},oa=function(b){return E(b)?b.toUpperCase():b},Z=N((/msie (\d+)/.exec(I(navigator.userAgent))||[])[1]),w,ga,ka=[].slice,Wa=[].push,Ea=Object.prototype.toString,mc=M.angular,Ha=M.angular||(M.angular=
{}),Aa,hb,ba=["0","0","0"];q.$inject=[];qa.$inject=[];hb=Z<9?function(b){b=b.nodeName?b:b[0];return b.scopeName&&b.scopeName!="HTML"?oa(b.scopeName+":"+b.nodeName):b.nodeName}:function(b){return b.nodeName?b.nodeName:b[0].nodeName};var sc=/[A-Z]/g,pd={full:"1.1.5",major:1,minor:1,dot:5,codeName:"triangle-squarification"},Ka=R.cache={},Ja=R.expando="ng-"+(new Date).getTime(),wc=1,gc=M.document.addEventListener?function(b,a,c){b.addEventListener(a,c,!1)}:function(b,a,c){b.attachEvent("on"+a,c)},gb=
M.document.removeEventListener?function(b,a,c){b.removeEventListener(a,c,!1)}:function(b,a,c){b.detachEvent("on"+a,c)},uc=/([\:\-\_]+(.))/g,vc=/^moz([A-Z])/,Ba=R.prototype={ready:function(b){function a(){c||(c=!0,b())}var c=!1;T.readyState==="complete"?setTimeout(a):(this.bind("DOMContentLoaded",a),R(M).bind("load",a))},toString:function(){var b=[];n(this,function(a){b.push(""+a)});return"["+b.join(", ")+"]"},eq:function(b){return b>=0?w(this[b]):w(this[this.length+b])},length:0,push:Wa,sort:[].sort,
splice:[].splice},Na={};n("multiple,selected,checked,disabled,readOnly,required,open".split(","),function(b){Na[I(b)]=b});var Gb={};n("input,select,option,textarea,button,form,details".split(","),function(b){Gb[oa(b)]=!0});n({data:Bb,inheritedData:Ma,scope:function(b){return Ma(b,"$scope")},controller:Eb,injector:function(b){return Ma(b,"$injector")},removeAttr:function(b,a){b.removeAttribute(a)},hasClass:La,css:function(b,a,c){a=Ia(a);if(B(c))b.style[a]=c;else{var d;Z<=8&&(d=b.currentStyle&&b.currentStyle[a],
d===""&&(d="auto"));d=d||b.style[a];Z<=8&&(d=d===""?p:d);return d}},attr:function(b,a,c){var d=I(a);if(Na[d])if(B(c))c?(b[a]=!0,b.setAttribute(a,d)):(b[a]=!1,b.removeAttribute(d));else return b[a]||(b.attributes.getNamedItem(a)||q).specified?d:p;else if(B(c))b.setAttribute(a,c);else if(b.getAttribute)return b=b.getAttribute(a,2),b===null?p:b},prop:function(b,a,c){if(B(c))b[a]=c;else return b[a]},text:t(Z<9?function(b,a){if(b.nodeType==1){if(C(a))return b.innerText;b.innerText=a}else{if(C(a))return b.nodeValue;
b.nodeValue=a}}:function(b,a){if(C(a))return b.textContent;b.textContent=a},{$dv:""}),val:function(b,a){if(C(a))return b.value;b.value=a},html:function(b,a){if(C(a))return b.innerHTML;for(var c=0,d=b.childNodes;c<d.length;c++)ya(d[c]);b.innerHTML=a}},function(b,a){R.prototype[a]=function(a,d){var e,g;if((b.length==2&&b!==La&&b!==Eb?a:d)===p)if(L(a)){for(e=0;e<this.length;e++)if(b===Bb)b(this[e],a);else for(g in a)b(this[e],g,a[g]);return this}else{if(this.length)return b(this[0],a,d)}else{for(e=0;e<
this.length;e++)b(this[e],a,d);return this}return b.$dv}});n({removeData:zb,dealoc:ya,bind:function a(c,d,e){var g=ca(c,"events"),i=ca(c,"handle");g||ca(c,"events",g={});i||ca(c,"handle",i=xc(c,g));n(d.split(" "),function(d){var h=g[d];if(!h){if(d=="mouseenter"||d=="mouseleave"){var j=T.body.contains||T.body.compareDocumentPosition?function(a,c){var d=a.nodeType===9?a.documentElement:a,e=c&&c.parentNode;return a===e||!(!e||!(e.nodeType===1&&(d.contains?d.contains(e):a.compareDocumentPosition&&a.compareDocumentPosition(e)&
16)))}:function(a,c){if(c)for(;c=c.parentNode;)if(c===a)return!0;return!1};g[d]=[];a(c,{mouseleave:"mouseout",mouseenter:"mouseover"}[d],function(a){var c=a.relatedTarget;(!c||c!==this&&!j(this,c))&&i(a,d)})}else gc(c,d,i),g[d]=[];h=g[d]}h.push(e)})},unbind:Ab,replaceWith:function(a,c){var d,e=a.parentNode;ya(a);n(new R(c),function(c){d?e.insertBefore(c,d.nextSibling):e.replaceChild(c,a);d=c})},children:function(a){var c=[];n(a.childNodes,function(a){a.nodeType===1&&c.push(a)});return c},contents:function(a){return a.childNodes||
[]},append:function(a,c){n(new R(c),function(c){(a.nodeType===1||a.nodeType===11)&&a.appendChild(c)})},prepend:function(a,c){if(a.nodeType===1){var d=a.firstChild;n(new R(c),function(c){d?a.insertBefore(c,d):(a.appendChild(c),d=c)})}},wrap:function(a,c){var c=w(c)[0],d=a.parentNode;d&&d.replaceChild(c,a);c.appendChild(a)},remove:function(a){ya(a);var c=a.parentNode;c&&c.removeChild(a)},after:function(a,c){var d=a,e=a.parentNode;n(new R(c),function(a){e.insertBefore(a,d.nextSibling);d=a})},addClass:Db,
removeClass:Cb,toggleClass:function(a,c,d){C(d)&&(d=!La(a,c));(d?Db:Cb)(a,c)},parent:function(a){return(a=a.parentNode)&&a.nodeType!==11?a:null},next:function(a){if(a.nextElementSibling)return a.nextElementSibling;for(a=a.nextSibling;a!=null&&a.nodeType!==1;)a=a.nextSibling;return a},find:function(a,c){return a.getElementsByTagName(c)},clone:fb,triggerHandler:function(a,c){var d=(ca(a,"events")||{})[c];n(d,function(c){c.call(a,{preventDefault:q})})}},function(a,c){R.prototype[c]=function(c,e){for(var g,
i=0;i<this.length;i++)g==p?(g=a(this[i],c,e),g!==p&&(g=w(g))):eb(g,a(this[i],c,e));return g==p?this:g}});za.prototype={put:function(a,c){this[la(a)]=c},get:function(a){return this[la(a)]},remove:function(a){var c=this[a=la(a)];delete this[a];return c}};var zc=/^function\s*[^\(]*\(\s*([^\)]*)\)/m,Ac=/,/,Bc=/^\s*(_?)(\S+?)\1\s*$/,yc=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;Ib.$inject=["$provide"];var qd=function(){var a="$ngAnimateController",c={running:!0};this.$get=["$animation","$window","$sniffer","$rootElement",
"$rootScope",function(d,e,g,i){i.data(a,c);i=function(c,i){function j(j,k,o){return function(m,r,p){function x(a){var c=0,a=E(a)?a.split(/\s*,\s*/):[];n(a,function(a){c=Math.max(parseFloat(a)||0,c)});return c}function t(){m.addClass(K);if($)$(m,v,P);else if(H(e.getComputedStyle)){var a=g.vendorPrefix+"Animation",c=g.vendorPrefix+"Transition",d=0;n(m,function(f){if(f.nodeType==1){var g="transition",i=c,j=1,h=e.getComputedStyle(f)||{};if(parseFloat(h.animationDuration)>0||parseFloat(h[a+"Duration"])>
0)g="animation",i=a,j=Math.max(parseInt(h[g+"IterationCount"])||0,parseInt(h[i+"IterationCount"])||0,j);f=Math.max(x(h[g+"Delay"]),x(h[i+"Delay"]));g=Math.max(x(h[g+"Duration"]),x(h[i+"Duration"]));d=Math.max(f+j*g,d)}});e.setTimeout(v,d*1E3)}else v()}function v(){if(!v.run)v.run=!0,o(m,r,p),m.removeClass(w),m.removeClass(K),m.removeData(a)}var A=c.$eval(i.ngAnimate),w=A?L(A)?A[j]:A+"-"+j:"",D=d(w),A=D&&D.setup,$=D&&D.start,D=D&&D.cancel;if(w){var K=w+"-active";r||(r=p?p.parent():m.parent());if(!g.transitions&&
!A&&!$||(r.inheritedData(a)||q).running)k(m,r,p),o(m,r,p);else{var O=m.data(a)||{};O.running&&((D||q)(m),O.done());m.data(a,{running:!0,done:v});m.addClass(w);k(m,r,p);if(m.length==0)return v();var P=(A||q)(m);e.setTimeout(t,1)}}else k(m,r,p),o(m,r,p)}}function m(a,c,d){d?d.after(a):c.append(a)}var k={};k.enter=j("enter",m,q);k.leave=j("leave",q,function(a){a.remove()});k.move=j("move",function(a,c,d){m(a,c,d)},q);k.show=j("show",function(a){a.css("display","")},q);k.hide=j("hide",q,function(a){a.css("display",
"none")});k.animate=function(a,c){j(a,q,q)(c)};return k};i.enabled=function(a){if(arguments.length)c.running=!a;return!c.running};return i}]},Kb="Non-assignable model expression: ";Jb.$inject=["$provide"];var Ic=/^(x[\:\-_]|data[\:\-_])/i,jb=/^([^:]+):\/\/(\w+:{0,1}\w*@)?(\{?[\w\.-]*\}?)(:([0-9]+))?(\/[^\?#]*)?(\?([^#]*))?(#(.*))?$/,Pb=/^([^\?#]*)(\?([^#]*))?(#(.*))?$/,Oa={http:80,https:443,ftp:21};Rb.prototype=lb.prototype=Qb.prototype={$$replace:!1,absUrl:Pa("$$absUrl"),url:function(a,c){if(C(a))return this.$$url;
var d=Pb.exec(a);d[1]&&this.path(decodeURIComponent(d[1]));if(d[2]||d[1])this.search(d[3]||"");this.hash(d[5]||"",c);return this},protocol:Pa("$$protocol"),host:Pa("$$host"),port:Pa("$$port"),path:Sb("$$path",function(a){return a.charAt(0)=="/"?a:"/"+a}),search:function(a,c){if(C(a))return this.$$search;B(c)?c===null?delete this.$$search[a]:this.$$search[a]=c:this.$$search=E(a)?vb(a):a;this.$$compose();return this},hash:Sb("$$hash",qa),replace:function(){this.$$replace=!0;return this}};var Da={"null":function(){return null},
"true":function(){return!0},"false":function(){return!1},undefined:q,"+":function(a,c,d,e){d=d(a,c);e=e(a,c);return B(d)?B(e)?d+e:d:B(e)?e:p},"-":function(a,c,d,e){d=d(a,c);e=e(a,c);return(B(d)?d:0)-(B(e)?e:0)},"*":function(a,c,d,e){return d(a,c)*e(a,c)},"/":function(a,c,d,e){return d(a,c)/e(a,c)},"%":function(a,c,d,e){return d(a,c)%e(a,c)},"^":function(a,c,d,e){return d(a,c)^e(a,c)},"=":q,"===":function(a,c,d,e){return d(a,c)===e(a,c)},"!==":function(a,c,d,e){return d(a,c)!==e(a,c)},"==":function(a,
c,d,e){return d(a,c)==e(a,c)},"!=":function(a,c,d,e){return d(a,c)!=e(a,c)},"<":function(a,c,d,e){return d(a,c)<e(a,c)},">":function(a,c,d,e){return d(a,c)>e(a,c)},"<=":function(a,c,d,e){return d(a,c)<=e(a,c)},">=":function(a,c,d,e){return d(a,c)>=e(a,c)},"&&":function(a,c,d,e){return d(a,c)&&e(a,c)},"||":function(a,c,d,e){return d(a,c)||e(a,c)},"&":function(a,c,d,e){return d(a,c)&e(a,c)},"|":function(a,c,d,e){return e(a,c)(a,c,d(a,c))},"!":function(a,c,d){return!d(a,c)}},Qc={n:"\n",f:"\u000c",r:"\r",
t:"\t",v:"\u000b","'":"'",'"':'"'},mb={},ad=/^(([^:]+):)?\/\/(\w+:{0,1}\w*@)?([\w\.-]*)?(:([0-9]+))?(.*)$/,ed=M.XMLHttpRequest||function(){try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(a){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(c){}try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(d){}throw Error("This browser does not support XMLHttpRequest.");};Zb.$inject=["$provide"];$b.$inject=["$locale"];bc.$inject=["$locale"];var ec=".",od={yyyy:Q("FullYear",4),yy:Q("FullYear",
2,0,!0),y:Q("FullYear",1),MMMM:Qa("Month"),MMM:Qa("Month",!0),MM:Q("Month",2,1),M:Q("Month",1,1),dd:Q("Date",2),d:Q("Date",1),HH:Q("Hours",2),H:Q("Hours",1),hh:Q("Hours",2,-12),h:Q("Hours",1,-12),mm:Q("Minutes",2),m:Q("Minutes",1),ss:Q("Seconds",2),s:Q("Seconds",1),sss:Q("Milliseconds",3),EEEE:Qa("Day"),EEE:Qa("Day",!0),a:function(a,c){return a.getHours()<12?c.AMPMS[0]:c.AMPMS[1]},Z:function(a){var a=-1*a.getTimezoneOffset(),c=a>=0?"+":"";c+=nb(Math[a>0?"floor":"ceil"](a/60),2)+nb(Math.abs(a%60),
2);return c}},nd=/((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/,md=/^\d+$/;ac.$inject=["$locale"];var kd=S(I),ld=S(oa);cc.$inject=["$parse"];var rd=S({restrict:"E",compile:function(a,c){Z<=8&&(!c.href&&!c.name&&c.$set("href",""),a.append(T.createComment("IE fix")));return function(a,c){c.bind("click",function(a){c.attr("href")||a.preventDefault()})}}}),pb={};n(Na,function(a,c){var d=da("ng-"+c);pb[d]=function(){return{priority:100,compile:function(){return function(a,
g,i){a.$watch(i[d],function(a){i.$set(c,!!a)})}}}}});n(["src","srcset","href"],function(a){var c=da("ng-"+a);pb[c]=function(){return{priority:99,link:function(d,e,g){g.$observe(c,function(c){c&&(g.$set(a,c),Z&&e.prop(a,g[a]))})}}}});var Ta={$addControl:q,$removeControl:q,$setValidity:q,$setDirty:q,$setPristine:q};fc.$inject=["$element","$attrs","$scope"];var Wa=function(a){return["$timeout",function(c){var d={name:"form",restrict:"E",controller:fc,compile:function(){return{pre:function(a,d,i,f){if(!i.action){var h=
function(a){a.preventDefault?a.preventDefault():a.returnValue=!1};gc(d[0],"submit",h);d.bind("$destroy",function(){c(function(){gb(d[0],"submit",h)},0,!1)})}var j=d.parent().controller("form"),m=i.name||i.ngForm;m&&(a[m]=f);j&&d.bind("$destroy",function(){j.$removeControl(f);m&&(a[m]=p);t(f,Ta)})}}}};return a?t(V(d),{restrict:"EAC"}):d}]},sd=Wa(),td=Wa(!0),ud=/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,vd=/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
wd=/^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/,hc={text:Va,number:function(a,c,d,e,g,i){Va(a,c,d,e,g,i);e.$parsers.push(function(a){var c=X(a);return c||wd.test(a)?(e.$setValidity("number",!0),a===""?null:c?a:parseFloat(a)):(e.$setValidity("number",!1),p)});e.$formatters.push(function(a){return X(a)?"":""+a});if(d.min){var f=parseFloat(d.min),a=function(a){return!X(a)&&a<f?(e.$setValidity("min",!1),p):(e.$setValidity("min",!0),a)};e.$parsers.push(a);e.$formatters.push(a)}if(d.max){var h=parseFloat(d.max),
d=function(a){return!X(a)&&a>h?(e.$setValidity("max",!1),p):(e.$setValidity("max",!0),a)};e.$parsers.push(d);e.$formatters.push(d)}e.$formatters.push(function(a){return X(a)||Ya(a)?(e.$setValidity("number",!0),a):(e.$setValidity("number",!1),p)})},url:function(a,c,d,e,g,i){Va(a,c,d,e,g,i);a=function(a){return X(a)||ud.test(a)?(e.$setValidity("url",!0),a):(e.$setValidity("url",!1),p)};e.$formatters.push(a);e.$parsers.push(a)},email:function(a,c,d,e,g,i){Va(a,c,d,e,g,i);a=function(a){return X(a)||vd.test(a)?
(e.$setValidity("email",!0),a):(e.$setValidity("email",!1),p)};e.$formatters.push(a);e.$parsers.push(a)},radio:function(a,c,d,e){C(d.name)&&c.attr("name",Fa());c.bind("click",function(){c[0].checked&&a.$apply(function(){e.$setViewValue(d.value)})});e.$render=function(){c[0].checked=d.value==e.$viewValue};d.$observe("value",e.$render)},checkbox:function(a,c,d,e){var g=d.ngTrueValue,i=d.ngFalseValue;E(g)||(g=!0);E(i)||(i=!1);c.bind("click",function(){a.$apply(function(){e.$setViewValue(c[0].checked)})});
e.$render=function(){c[0].checked=e.$viewValue};e.$formatters.push(function(a){return a===g});e.$parsers.push(function(a){return a?g:i})},hidden:q,button:q,submit:q,reset:q},ic=["$browser","$sniffer",function(a,c){return{restrict:"E",require:"?ngModel",link:function(d,e,g,i){i&&(hc[I(g.type)]||hc.text)(d,e,g,i,c,a)}}}],Sa="ng-valid",Ra="ng-invalid",pa="ng-pristine",Ua="ng-dirty",xd=["$scope","$exceptionHandler","$attrs","$element","$parse",function(a,c,d,e,g){function i(a,c){c=c?"-"+bb(c,"-"):"";
e.removeClass((a?Ra:Sa)+c).addClass((a?Sa:Ra)+c)}this.$modelValue=this.$viewValue=Number.NaN;this.$parsers=[];this.$formatters=[];this.$viewChangeListeners=[];this.$pristine=!0;this.$dirty=!1;this.$valid=!0;this.$invalid=!1;this.$name=d.name;var f=g(d.ngModel),h=f.assign;if(!h)throw Error(Kb+d.ngModel+" ("+va(e)+")");this.$render=q;var j=e.inheritedData("$formController")||Ta,m=0,k=this.$error={};e.addClass(pa);i(!0);this.$setValidity=function(a,c){if(k[a]!==!c){if(c){if(k[a]&&m--,!m)i(!0),this.$valid=
!0,this.$invalid=!1}else i(!1),this.$invalid=!0,this.$valid=!1,m++;k[a]=!c;i(c,a);j.$setValidity(a,c,this)}};this.$setPristine=function(){this.$dirty=!1;this.$pristine=!0;e.removeClass(Ua).addClass(pa)};this.$setViewValue=function(d){this.$viewValue=d;if(this.$pristine)this.$dirty=!0,this.$pristine=!1,e.removeClass(pa).addClass(Ua),j.$setDirty();n(this.$parsers,function(a){d=a(d)});if(this.$modelValue!==d)this.$modelValue=d,h(a,d),n(this.$viewChangeListeners,function(a){try{a()}catch(d){c(d)}})};
var l=this;a.$watch(function(){var c=f(a);if(l.$modelValue!==c){var d=l.$formatters,e=d.length;for(l.$modelValue=c;e--;)c=d[e](c);if(l.$viewValue!==c)l.$viewValue=c,l.$render()}})}],yd=function(){return{require:["ngModel","^?form"],controller:xd,link:function(a,c,d,e){var g=e[0],i=e[1]||Ta;i.$addControl(g);c.bind("$destroy",function(){i.$removeControl(g)})}}},zd=S({require:"ngModel",link:function(a,c,d,e){e.$viewChangeListeners.push(function(){a.$eval(d.ngChange)})}}),jc=function(){return{require:"?ngModel",
link:function(a,c,d,e){if(e){d.required=!0;var g=function(a){if(d.required&&(X(a)||a===!1))e.$setValidity("required",!1);else return e.$setValidity("required",!0),a};e.$formatters.push(g);e.$parsers.unshift(g);d.$observe("required",function(){g(e.$viewValue)})}}}},Ad=function(){return{require:"ngModel",link:function(a,c,d,e){var g=(a=/\/(.*)\//.exec(d.ngList))&&RegExp(a[1])||d.ngList||",";e.$parsers.push(function(a){var c=[];a&&n(a.split(g),function(a){a&&c.push(U(a))});return c});e.$formatters.push(function(a){return F(a)?
a.join(", "):p})}}},Bd=/^(true|false|\d+)$/,Cd=function(){return{priority:100,compile:function(a,c){return Bd.test(c.ngValue)?function(a,c,g){g.$set("value",a.$eval(g.ngValue))}:function(a,c,g){a.$watch(g.ngValue,function(a){g.$set("value",a,!1)})}}}},Dd=aa(function(a,c,d){c.addClass("ng-binding").data("$binding",d.ngBind);a.$watch(d.ngBind,function(a){c.text(a==p?"":a)})}),Ed=["$interpolate",function(a){return function(c,d,e){c=a(d.attr(e.$attr.ngBindTemplate));d.addClass("ng-binding").data("$binding",
c);e.$observe("ngBindTemplate",function(a){d.text(a)})}}],Fd=[function(){return function(a,c,d){c.addClass("ng-binding").data("$binding",d.ngBindHtmlUnsafe);a.$watch(d.ngBindHtmlUnsafe,function(a){c.html(a||"")})}}],Gd=ob("",!0),Hd=ob("Odd",0),Id=ob("Even",1),Jd=aa({compile:function(a,c){c.$set("ngCloak",p);a.removeClass("ng-cloak")}}),Kd=[function(){return{scope:!0,controller:"@"}}],Ld=["$sniffer",function(a){return{priority:1E3,compile:function(){a.csp=!0}}}],kc={};n("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress".split(" "),
function(a){var c=da("ng-"+a);kc[c]=["$parse",function(d){return function(e,g,i){var f=d(i[c]);g.bind(I(a),function(a){e.$apply(function(){f(e,{$event:a})})})}}]});var Md=aa(function(a,c,d){c.bind("submit",function(){a.$apply(d.ngSubmit)})}),Nd=["$animator",function(a){return{transclude:"element",priority:1E3,terminal:!0,restrict:"A",compile:function(c,d,e){return function(c,d,f){var h=a(c,f),j,m;c.$watch(f.ngIf,function(a){j&&(h.leave(j),j=p);m&&(m.$destroy(),m=p);ua(a)&&(m=c.$new(),e(m,function(a){j=
a;h.enter(a,d.parent(),d)}))})}}}}],Od=["$http","$templateCache","$anchorScroll","$compile","$animator",function(a,c,d,e,g){return{restrict:"ECA",terminal:!0,compile:function(i,f){var h=f.ngInclude||f.src,j=f.onload||"",m=f.autoscroll;return function(f,i,n){var o=g(f,n),p=0,r,t=function(){r&&(r.$destroy(),r=null);o.leave(i.contents(),i)};f.$watch(h,function(g){var h=++p;g?(a.get(g,{cache:c}).success(function(a){h===p&&(r&&r.$destroy(),r=f.$new(),o.leave(i.contents(),i),a=w("<div/>").html(a).contents(),
o.enter(a,i),e(a)(r),B(m)&&(!m||f.$eval(m))&&d(),r.$emit("$includeContentLoaded"),f.$eval(j))}).error(function(){h===p&&t()}),f.$emit("$includeContentRequested")):t()})}}}}],Pd=aa({compile:function(){return{pre:function(a,c,d){a.$eval(d.ngInit)}}}}),Qd=aa({terminal:!0,priority:1E3}),Rd=["$locale","$interpolate",function(a,c){var d=/{}/g;return{restrict:"EA",link:function(e,g,i){var f=i.count,h=g.attr(i.$attr.when),j=i.offset||0,m=e.$eval(h),k={},l=c.startSymbol(),p=c.endSymbol();n(m,function(a,e){k[e]=
c(a.replace(d,l+f+"-"+j+p))});e.$watch(function(){var c=parseFloat(e.$eval(f));return isNaN(c)?"":(c in m||(c=a.pluralCat(c-j)),k[c](e,g,!0))},function(a){g.text(a)})}}}],Sd=["$parse","$animator",function(a,c){return{transclude:"element",priority:1E3,terminal:!0,compile:function(d,e,g){return function(d,e,h){var j=c(d,h),m=h.ngRepeat,k=m.match(/^\s*(.+)\s+in\s+(.*?)\s*(\s+track\s+by\s+(.+)\s*)?$/),l,p,o,z,r,t={$id:la};if(!k)throw Error("Expected ngRepeat in form of '_item_ in _collection_[ track by _id_]' but got '"+
m+"'.");h=k[1];o=k[2];(k=k[4])?(l=a(k),p=function(a,c,e){r&&(t[r]=a);t[z]=c;t.$index=e;return l(d,t)}):p=function(a,c){return la(c)};k=h.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);if(!k)throw Error("'item' in 'item in collection' should be identifier or (key, value) but got '"+h+"'.");z=k[3]||k[1];r=k[2];var x={};d.$watchCollection(o,function(a){var c,h,k=e,l,o={},t,q,w,s,B,y,C=[];if(Xa(a))B=a;else{B=[];for(w in a)a.hasOwnProperty(w)&&w.charAt(0)!="$"&&B.push(w);B.sort()}t=B.length;h=
C.length=B.length;for(c=0;c<h;c++)if(w=a===B?c:B[c],s=a[w],l=p(w,s,c),x.hasOwnProperty(l))y=x[l],delete x[l],o[l]=y,C[c]=y;else if(o.hasOwnProperty(l))throw n(C,function(a){a&&a.element&&(x[a.id]=a)}),Error("Duplicates in a repeater are not allowed. Repeater: "+m+" key: "+l);else C[c]={id:l},o[l]=!1;for(w in x)if(x.hasOwnProperty(w))y=x[w],j.leave(y.element),y.element[0].$$NG_REMOVED=!0,y.scope.$destroy();c=0;for(h=B.length;c<h;c++){w=a===B?c:B[c];s=a[w];y=C[c];if(y.element){q=y.scope;l=k[0];do l=
l.nextSibling;while(l&&l.$$NG_REMOVED);y.element[0]!=l&&j.move(y.element,null,k);k=y.element}else q=d.$new();q[z]=s;r&&(q[r]=w);q.$index=c;q.$first=c===0;q.$last=c===t-1;q.$middle=!(q.$first||q.$last);y.element||g(q,function(a){j.enter(a,null,k);k=a;y.scope=q;y.element=a;o[y.id]=y})}x=o})}}}}],Td=["$animator",function(a){return function(c,d,e){var g=a(c,e);c.$watch(e.ngShow,function(a){g[ua(a)?"show":"hide"](d)})}}],Ud=["$animator",function(a){return function(c,d,e){var g=a(c,e);c.$watch(e.ngHide,
function(a){g[ua(a)?"hide":"show"](d)})}}],Vd=aa(function(a,c,d){a.$watch(d.ngStyle,function(a,d){d&&a!==d&&n(d,function(a,d){c.css(d,"")});a&&c.css(a)},!0)}),Wd=["$animator",function(a){return{restrict:"EA",require:"ngSwitch",controller:["$scope",function(){this.cases={}}],link:function(c,d,e,g){var i=a(c,e),f,h,j=[];c.$watch(e.ngSwitch||e.on,function(a){for(var d=0,l=j.length;d<l;d++)j[d].$destroy(),i.leave(h[d]);h=[];j=[];if(f=g.cases["!"+a]||g.cases["?"])c.$eval(e.change),n(f,function(a){var d=
c.$new();j.push(d);a.transclude(d,function(c){var d=a.element;h.push(c);i.enter(c,d.parent(),d)})})})}}}],Xd=aa({transclude:"element",priority:500,require:"^ngSwitch",compile:function(a,c,d){return function(a,g,i,f){f.cases["!"+c.ngSwitchWhen]=f.cases["!"+c.ngSwitchWhen]||[];f.cases["!"+c.ngSwitchWhen].push({transclude:d,element:g})}}}),Yd=aa({transclude:"element",priority:500,require:"^ngSwitch",compile:function(a,c,d){return function(a,c,i,f){f.cases["?"]=f.cases["?"]||[];f.cases["?"].push({transclude:d,
element:c})}}}),Zd=aa({controller:["$transclude","$element",function(a,c){a(function(a){c.append(a)})}]}),$d=["$http","$templateCache","$route","$anchorScroll","$compile","$controller","$animator",function(a,c,d,e,g,i,f){return{restrict:"ECA",terminal:!0,link:function(a,c,m){function k(){var f=d.current&&d.current.locals,k=f&&f.$template;if(k){o.leave(c.contents(),c);l&&(l.$destroy(),l=null);k=w("<div></div>").html(k).contents();o.enter(k,c);var k=g(k),m=d.current;l=m.scope=a.$new();if(m.controller)f.$scope=
l,f=i(m.controller,f),m.controllerAs&&(l[m.controllerAs]=f),c.children().data("$ngControllerController",f);k(l);l.$emit("$viewContentLoaded");l.$eval(n);e()}else o.leave(c.contents(),c),l&&(l.$destroy(),l=null)}var l,n=m.onload||"",o=f(a,m);a.$on("$routeChangeSuccess",k);k()}}}],ae=["$templateCache",function(a){return{restrict:"E",terminal:!0,compile:function(c,d){d.type=="text/ng-template"&&a.put(d.id,c[0].text)}}}],be=S({terminal:!0}),ce=["$compile","$parse",function(a,c){var d=/^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w\d]*)|(?:\(\s*([\$\w][\$\w\d]*)\s*,\s*([\$\w][\$\w\d]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/,
e={$setViewValue:q};return{restrict:"E",require:["select","?ngModel"],controller:["$element","$scope","$attrs",function(a,c,d){var h=this,j={},m=e,k;h.databound=d.ngModel;h.init=function(a,c,d){m=a;k=d};h.addOption=function(c){j[c]=!0;m.$viewValue==c&&(a.val(c),k.parent()&&k.remove())};h.removeOption=function(a){this.hasOption(a)&&(delete j[a],m.$viewValue==a&&this.renderUnknownOption(a))};h.renderUnknownOption=function(c){c="? "+la(c)+" ?";k.val(c);a.prepend(k);a.val(c);k.prop("selected",!0)};h.hasOption=
function(a){return j.hasOwnProperty(a)};c.$on("$destroy",function(){h.renderUnknownOption=q})}],link:function(e,i,f,h){function j(a,c,d,e){d.$render=function(){var a=d.$viewValue;e.hasOption(a)?(v.parent()&&v.remove(),c.val(a),a===""&&t.prop("selected",!0)):C(a)&&t?c.val(""):e.renderUnknownOption(a)};c.bind("change",function(){a.$apply(function(){v.parent()&&v.remove();d.$setViewValue(c.val())})})}function m(a,c,d){var e;d.$render=function(){var a=new za(d.$viewValue);n(c.find("option"),function(c){c.selected=
B(a.get(c.value))})};a.$watch(function(){ia(e,d.$viewValue)||(e=V(d.$viewValue),d.$render())});c.bind("change",function(){a.$apply(function(){var a=[];n(c.find("option"),function(c){c.selected&&a.push(c.value)});d.$setViewValue(a)})})}function k(e,f,g){function i(){var a={"":[]},c=[""],d,h,q,v,s;q=g.$modelValue;v=u(e)||[];var z=l?qb(v):v,B,y,A;y={};s=!1;var C,D;if(o)if(t&&F(q)){s=new za([]);for(h=0;h<q.length;h++)y[k]=q[h],s.put(t(e,y),q[h])}else s=new za(q);for(A=0;B=z.length,A<B;A++){y[k]=v[l?y[l]=
z[A]:A];d=m(e,y)||"";if(!(h=a[d]))h=a[d]=[],c.push(d);o?d=s.remove(t?t(e,y):n(e,y))!=p:(t?(d={},d[k]=q,d=t(e,d)===t(e,y)):d=q===n(e,y),s=s||d);C=j(e,y);C=C===p?"":C;h.push({id:t?t(e,y):l?z[A]:A,label:C,selected:d})}o||(r||q===null?a[""].unshift({id:"",label:"",selected:!s}):s||a[""].unshift({id:"?",label:"",selected:!0}));y=0;for(z=c.length;y<z;y++){d=c[y];h=a[d];if(w.length<=y)q={element:E.clone().attr("label",d),label:h.label},v=[q],w.push(v),f.append(q.element);else if(v=w[y],q=v[0],q.label!=d)q.element.attr("label",
q.label=d);C=null;A=0;for(B=h.length;A<B;A++)if(d=h[A],s=v[A+1]){C=s.element;if(s.label!==d.label)C.text(s.label=d.label);if(s.id!==d.id)C.val(s.id=d.id);if(C[0].selected!==d.selected)C.prop("selected",s.selected=d.selected)}else d.id===""&&r?D=r:(D=x.clone()).val(d.id).attr("selected",d.selected).text(d.label),v.push({element:D,label:d.label,id:d.id,selected:d.selected}),C?C.after(D):q.element.append(D),C=D;for(A++;v.length>A;)v.pop().element.remove()}for(;w.length>y;)w.pop()[0].element.remove()}
var h;if(!(h=q.match(d)))throw Error("Expected ngOptions in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_ (track by _expr_)?' but got '"+q+"'.");var j=c(h[2]||h[1]),k=h[4]||h[6],l=h[5],m=c(h[3]||""),n=c(h[2]?h[1]:k),u=c(h[7]),t=h[8]?c(h[8]):null,w=[[{element:f,label:""}]];r&&(a(r)(e),r.removeClass("ng-scope"),r.remove());f.html("");f.bind("change",function(){e.$apply(function(){var a,c=u(e)||[],d={},h,i,j,m,q,r;if(o){i=[];m=0;for(r=w.length;m<r;m++){a=w[m];j=1;for(q=a.length;j<
q;j++)if((h=a[j].element)[0].selected){h=h.val();l&&(d[l]=h);if(t)for(var s=0;s<c.length;s++){if(d[k]=c[s],t(e,d)==h)break}else d[k]=c[h];i.push(n(e,d))}}}else if(h=f.val(),h=="?")i=p;else if(h=="")i=null;else if(t)for(s=0;s<c.length;s++){if(d[k]=c[s],t(e,d)==h){i=n(e,d);break}}else d[k]=c[h],l&&(d[l]=h),i=n(e,d);g.$setViewValue(i)})});g.$render=i;e.$watch(i)}if(h[1]){for(var l=h[0],u=h[1],o=f.multiple,q=f.ngOptions,r=!1,t,x=w(T.createElement("option")),E=w(T.createElement("optgroup")),v=x.clone(),
h=0,A=i.children(),G=A.length;h<G;h++)if(A[h].value==""){t=r=A.eq(h);break}l.init(u,r,v);if(o&&(f.required||f.ngRequired)){var D=function(a){u.$setValidity("required",!f.required||a&&a.length);return a};u.$parsers.push(D);u.$formatters.unshift(D);f.$observe("required",function(){D(u.$viewValue)})}q?k(e,i,u):o?m(e,i,u):j(e,i,u,l)}}}}],de=["$interpolate",function(a){var c={addOption:q,removeOption:q};return{restrict:"E",priority:100,compile:function(d,e){if(C(e.value)){var g=a(d.text(),!0);g||e.$set("value",
d.text())}return function(a,d,e){var j=d.parent(),m=j.data("$selectController")||j.parent().data("$selectController");m&&m.databound?d.prop("selected",!1):m=c;g?a.$watch(g,function(a,c){e.$set("value",a);a!==c&&m.removeOption(c);m.addOption(a)}):m.addOption(e.value);d.bind("$destroy",function(){m.removeOption(e.value)})}}}}],ee=S({restrict:"E",terminal:!0});(ga=M.jQuery)?(w=ga,t(ga.fn,{scope:Ba.scope,controller:Ba.controller,injector:Ba.injector,inheritedData:Ba.inheritedData}),db("remove",!0),db("empty"),
db("html")):w=R;Ha.element=w;(function(a){t(a,{bootstrap:xb,copy:V,extend:t,equals:ia,element:w,forEach:n,injector:yb,noop:q,bind:$a,toJson:ha,fromJson:ub,identity:qa,isUndefined:C,isDefined:B,isString:E,isFunction:H,isObject:L,isNumber:Ya,isElement:oc,isArray:F,version:pd,isDate:ra,lowercase:I,uppercase:oa,callbacks:{counter:0},noConflict:lc});Aa=tc(M);try{Aa("ngLocale")}catch(c){Aa("ngLocale",[]).provider("$locale",fd)}Aa("ng",["ngLocale"],["$provide",function(a){a.provider("$compile",Jb).directive({a:rd,
input:ic,textarea:ic,form:sd,script:ae,select:ce,style:ee,option:de,ngBind:Dd,ngBindHtmlUnsafe:Fd,ngBindTemplate:Ed,ngClass:Gd,ngClassEven:Id,ngClassOdd:Hd,ngCsp:Ld,ngCloak:Jd,ngController:Kd,ngForm:td,ngHide:Ud,ngIf:Nd,ngInclude:Od,ngInit:Pd,ngNonBindable:Qd,ngPluralize:Rd,ngRepeat:Sd,ngShow:Td,ngSubmit:Md,ngStyle:Vd,ngSwitch:Wd,ngSwitchWhen:Xd,ngSwitchDefault:Yd,ngOptions:be,ngView:$d,ngTransclude:Zd,ngModel:yd,ngList:Ad,ngChange:zd,required:jc,ngRequired:jc,ngValue:Cd}).directive(pb).directive(kc);
a.provider({$anchorScroll:Cc,$animation:Ib,$animator:qd,$browser:Ec,$cacheFactory:Fc,$controller:Jc,$document:Kc,$exceptionHandler:Lc,$filter:Zb,$interpolate:Mc,$http:bd,$httpBackend:cd,$location:Nc,$log:Oc,$parse:Sc,$route:Vc,$routeParams:Wc,$rootScope:Xc,$q:Tc,$sniffer:Yc,$templateCache:Gc,$timeout:gd,$window:Zc})}])})(Ha);w(T).ready(function(){rc(T,xb)})})(window,document);angular.element(document).find("head").append('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak{display:none;}ng\\:form{display:block;}</style>');

/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-inlinesvg-svg-svgclippaths-touch-shiv-mq-cssclasses-teststyles-prefixes-ie8compat-load
 */
;window.Modernizr=function(a,b,c){function y(a){j.cssText=a}function z(a,b){return y(m.join(a+";")+(b||""))}function A(a,b){return typeof a===b}function B(a,b){return!!~(""+a).indexOf(b)}function C(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:A(f,"function")?f.bind(d||b):f}return!1}var d="2.6.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n={svg:"http://www.w3.org/2000/svg"},o={},p={},q={},r=[],s=r.slice,t,u=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},v=function(b){var c=a.matchMedia||a.msMatchMedia;if(c)return c(b).matches;var d;return u("@media "+b+" { #"+h+" { position: absolute; } }",function(b){d=(a.getComputedStyle?getComputedStyle(b,null):b.currentStyle)["position"]=="absolute"}),d},w={}.hasOwnProperty,x;!A(w,"undefined")&&!A(w.call,"undefined")?x=function(a,b){return w.call(a,b)}:x=function(a,b){return b in a&&A(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=s.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(s.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(s.call(arguments)))};return e}),o.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:u(["@media (",m.join("touch-enabled),("),h,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c},o.svg=function(){return!!b.createElementNS&&!!b.createElementNS(n.svg,"svg").createSVGRect},o.inlinesvg=function(){var a=b.createElement("div");return a.innerHTML="<svg/>",(a.firstChild&&a.firstChild.namespaceURI)==n.svg},o.svgclippaths=function(){return!!b.createElementNS&&/SVGClipPath/.test(l.call(b.createElementNS(n.svg,"clipPath")))};for(var D in o)x(o,D)&&(t=D.toLowerCase(),e[t]=o[D](),r.push((e[t]?"":"no-")+t));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)x(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},y(""),i=k=null,function(a,b){function k(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function l(){var a=r.elements;return typeof a=="string"?a.split(" "):a}function m(a){var b=i[a[g]];return b||(b={},h++,a[g]=h,i[h]=b),b}function n(a,c,f){c||(c=b);if(j)return c.createElement(a);f||(f=m(c));var g;return f.cache[a]?g=f.cache[a].cloneNode():e.test(a)?g=(f.cache[a]=f.createElem(a)).cloneNode():g=f.createElem(a),g.canHaveChildren&&!d.test(a)?f.frag.appendChild(g):g}function o(a,c){a||(a=b);if(j)return a.createDocumentFragment();c=c||m(a);var d=c.frag.cloneNode(),e=0,f=l(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function p(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return r.shivMethods?n(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+l().join().replace(/\w+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(r,b.frag)}function q(a){a||(a=b);var c=m(a);return r.shivCSS&&!f&&!c.hasCSS&&(c.hasCSS=!!k(a,"article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")),j||p(a,c),a}var c=a.html5||{},d=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,e=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,f,g="_html5shiv",h=0,i={},j;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",f="hidden"in a,j=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){f=!0,j=!0}})();var r={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,supportsUnknownElements:j,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:q,createElement:n,createDocumentFragment:o};a.html5=r,q(b)}(this,b),e._version=d,e._prefixes=m,e.mq=v,e.testStyles=u,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+r.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))},Modernizr.addTest("ie8compat",function(){return!window.addEventListener&&document.documentMode&&document.documentMode===7});

(function(definition){if(typeof define=="function"){define(definition)}else if(typeof YUI=="function"){YUI.add("es5-sham",definition)}else{definition()}})(function(){var call=Function.prototype.call;var prototypeOfObject=Object.prototype;var owns=call.bind(prototypeOfObject.hasOwnProperty);var defineGetter;var defineSetter;var lookupGetter;var lookupSetter;var supportsAccessors;if(supportsAccessors=owns(prototypeOfObject,"__defineGetter__")){defineGetter=call.bind(prototypeOfObject.__defineGetter__);defineSetter=call.bind(prototypeOfObject.__defineSetter__);lookupGetter=call.bind(prototypeOfObject.__lookupGetter__);lookupSetter=call.bind(prototypeOfObject.__lookupSetter__)}if(!Object.getPrototypeOf){Object.getPrototypeOf=function getPrototypeOf(object){return object.__proto__||(object.constructor?object.constructor.prototype:prototypeOfObject)}}function doesGetOwnPropertyDescriptorWork(object){try{object.sentinel=0;return Object.getOwnPropertyDescriptor(object,"sentinel").value===0}catch(exception){}}if(Object.defineProperty){var getOwnPropertyDescriptorWorksOnObject=doesGetOwnPropertyDescriptorWork({});var getOwnPropertyDescriptorWorksOnDom=typeof document=="undefined"||doesGetOwnPropertyDescriptorWork(document.createElement("div"));if(!getOwnPropertyDescriptorWorksOnDom||!getOwnPropertyDescriptorWorksOnObject){var getOwnPropertyDescriptorFallback=Object.getOwnPropertyDescriptor}}if(!Object.getOwnPropertyDescriptor||getOwnPropertyDescriptorFallback){var ERR_NON_OBJECT="Object.getOwnPropertyDescriptor called on a non-object: ";Object.getOwnPropertyDescriptor=function getOwnPropertyDescriptor(object,property){if(typeof object!="object"&&typeof object!="function"||object===null){throw new TypeError(ERR_NON_OBJECT+object)}if(getOwnPropertyDescriptorFallback){try{return getOwnPropertyDescriptorFallback.call(Object,object,property)}catch(exception){}}if(!owns(object,property)){return}var descriptor={enumerable:true,configurable:true};if(supportsAccessors){var prototype=object.__proto__;object.__proto__=prototypeOfObject;var getter=lookupGetter(object,property);var setter=lookupSetter(object,property);object.__proto__=prototype;if(getter||setter){if(getter){descriptor.get=getter}if(setter){descriptor.set=setter}return descriptor}}descriptor.value=object[property];descriptor.writable=true;return descriptor}}if(!Object.getOwnPropertyNames){Object.getOwnPropertyNames=function getOwnPropertyNames(object){return Object.keys(object)}}if(!Object.create){var createEmpty;var supportsProto=Object.prototype.__proto__===null;if(supportsProto||typeof document=="undefined"){createEmpty=function(){return{__proto__:null}}}else{createEmpty=function(){var iframe=document.createElement("iframe");var parent=document.body||document.documentElement;iframe.style.display="none";parent.appendChild(iframe);iframe.src="javascript:";var empty=iframe.contentWindow.Object.prototype;parent.removeChild(iframe);iframe=null;delete empty.constructor;delete empty.hasOwnProperty;delete empty.propertyIsEnumerable;delete empty.isPrototypeOf;delete empty.toLocaleString;delete empty.toString;delete empty.valueOf;empty.__proto__=null;function Empty(){}Empty.prototype=empty;createEmpty=function(){return new Empty};return new Empty}}Object.create=function create(prototype,properties){var object;function Type(){}if(prototype===null){object=createEmpty()}else{if(typeof prototype!=="object"&&typeof prototype!=="function"){throw new TypeError("Object prototype may only be an Object or null")}Type.prototype=prototype;object=new Type;object.__proto__=prototype}if(properties!==void 0){Object.defineProperties(object,properties)}return object}}function doesDefinePropertyWork(object){try{Object.defineProperty(object,"sentinel",{});return"sentinel"in object}catch(exception){}}if(Object.defineProperty){var definePropertyWorksOnObject=doesDefinePropertyWork({});var definePropertyWorksOnDom=typeof document=="undefined"||doesDefinePropertyWork(document.createElement("div"));if(!definePropertyWorksOnObject||!definePropertyWorksOnDom){var definePropertyFallback=Object.defineProperty,definePropertiesFallback=Object.defineProperties}}if(!Object.defineProperty||definePropertyFallback){var ERR_NON_OBJECT_DESCRIPTOR="Property description must be an object: ";var ERR_NON_OBJECT_TARGET="Object.defineProperty called on non-object: ";var ERR_ACCESSORS_NOT_SUPPORTED="getters & setters can not be defined "+"on this javascript engine";Object.defineProperty=function defineProperty(object,property,descriptor){if(typeof object!="object"&&typeof object!="function"||object===null){throw new TypeError(ERR_NON_OBJECT_TARGET+object)}if(typeof descriptor!="object"&&typeof descriptor!="function"||descriptor===null){throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR+descriptor)}if(definePropertyFallback){try{return definePropertyFallback.call(Object,object,property,descriptor)}catch(exception){}}if(owns(descriptor,"value")){if(supportsAccessors&&(lookupGetter(object,property)||lookupSetter(object,property))){var prototype=object.__proto__;object.__proto__=prototypeOfObject;delete object[property];object[property]=descriptor.value;object.__proto__=prototype}else{object[property]=descriptor.value}}else{if(!supportsAccessors){throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED)}if(owns(descriptor,"get")){defineGetter(object,property,descriptor.get)}if(owns(descriptor,"set")){defineSetter(object,property,descriptor.set)}}return object}}if(!Object.defineProperties||definePropertiesFallback){Object.defineProperties=function defineProperties(object,properties){if(definePropertiesFallback){try{return definePropertiesFallback.call(Object,object,properties)}catch(exception){}}for(var property in properties){if(owns(properties,property)&&property!="__proto__"){Object.defineProperty(object,property,properties[property])}}return object}}if(!Object.seal){Object.seal=function seal(object){return object}}if(!Object.freeze){Object.freeze=function freeze(object){return object}}try{Object.freeze(function(){})}catch(exception){Object.freeze=function freeze(freezeObject){return function freeze(object){if(typeof object=="function"){return object}else{return freezeObject(object)}}}(Object.freeze)}if(!Object.preventExtensions){Object.preventExtensions=function preventExtensions(object){return object}}if(!Object.isSealed){Object.isSealed=function isSealed(object){return false}}if(!Object.isFrozen){Object.isFrozen=function isFrozen(object){return false}}if(!Object.isExtensible){Object.isExtensible=function isExtensible(object){if(Object(object)!==object){throw new TypeError}var name="";while(owns(object,name)){name+="?"}object[name]=true;var returnValue=owns(object,name);delete object[name];return returnValue}}});
/*
//@ sourceMappingURL=es5-sham.map
*/
/*
 * Foundation Responsive Library
 * http://foundation.zurb.com
 * Copyright 2013, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/
/*jslint unparam: true, browser: true, indent: 2 */
// Accommodate running jQuery or Zepto in noConflict() mode by
// using an anonymous function to redefine the $ shorthand name.
// See http://docs.jquery.com/Using_jQuery_with_Other_Libraries
// and http://zeptojs.com/
var libFuncName=null;if(typeof jQuery=="undefined"&&typeof Zepto=="undefined"&&typeof $=="function")libFuncName=$;else if(typeof jQuery=="function")libFuncName=jQuery;else{if(typeof Zepto!="function")throw new TypeError;libFuncName=Zepto}(function(e,t,n,r){"use strict";t.matchMedia=t.matchMedia||function(e,t){var n,r=e.documentElement,i=r.firstElementChild||r.firstChild,s=e.createElement("body"),o=e.createElement("div");return o.id="mq-test-1",o.style.cssText="position:absolute;top:-100em",s.style.background="none",s.appendChild(o),function(e){return o.innerHTML='&shy;<style media="'+e+'"> #mq-test-1 { width: 42px; }</style>',r.insertBefore(s,i),n=o.offsetWidth===42,r.removeChild(s),{matches:n,media:e}}}(n),Array.prototype.filter||(Array.prototype.filter=function(e){if(this==null)throw new TypeError;var t=Object(this),n=t.length>>>0;if(typeof e!="function")return;var r=[],i=arguments[1];for(var s=0;s<n;s++)if(s in t){var o=t[s];e&&e.call(i,o,s,t)&&r.push(o)}return r}),Function.prototype.bind||(Function.prototype.bind=function(e){if(typeof this!="function")throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var t=Array.prototype.slice.call(arguments,1),n=this,r=function(){},i=function(){return n.apply(this instanceof r&&e?this:e,t.concat(Array.prototype.slice.call(arguments)))};return r.prototype=this.prototype,i.prototype=new r,i}),Array.prototype.indexOf||(Array.prototype.indexOf=function(e){if(this==null)throw new TypeError;var t=Object(this),n=t.length>>>0;if(n===0)return-1;var r=0;arguments.length>1&&(r=Number(arguments[1]),r!=r?r=0:r!=0&&r!=Infinity&&r!=-Infinity&&(r=(r>0||-1)*Math.floor(Math.abs(r))));if(r>=n)return-1;var i=r>=0?r:Math.max(n-Math.abs(r),0);for(;i<n;i++)if(i in t&&t[i]===e)return i;return-1}),e.fn.stop=e.fn.stop||function(){return this},t.Foundation={name:"Foundation",version:"4.3.1",cache:{},init:function(t,n,r,i,s,o){var u,a=[t,r,i,s],f=[],o=o||!1;o&&(this.nc=o),this.rtl=/rtl/i.test(e("html").attr("dir")),this.scope=t||this.scope;if(n&&typeof n=="string"&&!/reflow/i.test(n)){if(/off/i.test(n))return this.off();u=n.split(" ");if(u.length>0)for(var l=u.length-1;l>=0;l--)f.push(this.init_lib(u[l],a))}else{/reflow/i.test(n)&&(a[1]="reflow");for(var c in this.libs)f.push(this.init_lib(c,a))}return typeof n=="function"&&a.unshift(n),this.response_obj(f,a)},response_obj:function(e,t){for(var n=0,r=t.length;n<r;n++)if(typeof t[n]=="function")return t[n]({errors:e.filter(function(e){if(typeof e=="string")return e})});return e},init_lib:function(e,t){return this.trap(function(){return this.libs.hasOwnProperty(e)?(this.patch(this.libs[e]),this.libs[e].init.apply(this.libs[e],t)):function(){}}.bind(this),e)},trap:function(e,t){if(!this.nc)try{return e()}catch(n){return this.error({name:t,message:"could not be initialized",more:n.name+" "+n.message})}return e()},patch:function(e){this.fix_outer(e),e.scope=this.scope,e.rtl=this.rtl},inherit:function(e,t){var n=t.split(" ");for(var r=n.length-1;r>=0;r--)this.lib_methods.hasOwnProperty(n[r])&&(this.libs[e.name][n[r]]=this.lib_methods[n[r]])},random_str:function(e){var t="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");e||(e=Math.floor(Math.random()*t.length));var n="";for(var r=0;r<e;r++)n+=t[Math.floor(Math.random()*t.length)];return n},libs:{},lib_methods:{set_data:function(e,t){var n=[this.name,+(new Date),Foundation.random_str(5)].join("-");return Foundation.cache[n]=t,e.attr("data-"+this.name+"-id",n),t},get_data:function(e){return Foundation.cache[e.attr("data-"+this.name+"-id")]},remove_data:function(t){t?(delete Foundation.cache[t.attr("data-"+this.name+"-id")],t.attr("data-"+this.name+"-id","")):e("[data-"+this.name+"-id]").each(function(){delete Foundation.cache[e(this).attr("data-"+this.name+"-id")],e(this).attr("data-"+this.name+"-id","")})},throttle:function(e,t){var n=null;return function(){var r=this,i=arguments;clearTimeout(n),n=setTimeout(function(){e.apply(r,i)},t)}},data_options:function(t){function u(e){return!isNaN(e-0)&&e!==null&&e!==""&&e!==!1&&e!==!0}function a(t){return typeof t=="string"?e.trim(t):t}var n={},r,i,s=(t.attr("data-options")||":").split(";"),o=s.length;for(r=o-1;r>=0;r--)i=s[r].split(":"),/true/i.test(i[1])&&(i[1]=!0),/false/i.test(i[1])&&(i[1]=!1),u(i[1])&&(i[1]=parseInt(i[1],10)),i.length===2&&i[0].length>0&&(n[a(i[0])]=a(i[1]));return n},delay:function(e,t){return setTimeout(e,t)},scrollTo:function(n,r,i){if(i<0)return;var s=r-e(t).scrollTop(),o=s/i*10;this.scrollToTimerCache=setTimeout(function(){isNaN(parseInt(o,10))||(t.scrollTo(0,e(t).scrollTop()+o),this.scrollTo(n,r,i-10))}.bind(this),10)},scrollLeft:function(e){if(!e.length)return;return"scrollLeft"in e[0]?e[0].scrollLeft:e[0].pageXOffset},empty:function(e){if(e.length&&e.length>0)return!1;if(e.length&&e.length===0)return!0;for(var t in e)if(hasOwnProperty.call(e,t))return!1;return!0}},fix_outer:function(e){e.outerHeight=function(e,t){return typeof Zepto=="function"?e.height():typeof t!="undefined"?e.outerHeight(t):e.outerHeight()},e.outerWidth=function(e,t){return typeof Zepto=="function"?e.width():typeof t!="undefined"?e.outerWidth(t):e.outerWidth()}},error:function(e){return e.name+" "+e.message+"; "+e.more},off:function(){return e(this.scope).off(".fndtn"),e(t).off(".fndtn"),!0},zj:e},e.fn.foundation=function(){var e=Array.prototype.slice.call(arguments,0);return this.each(function(){return Foundation.init.apply(Foundation,[this].concat(e)),this})}})(libFuncName,this,this.document),function(e,t,n,r){"use strict";Foundation.libs.interchange={name:"interchange",version:"4.2.4",cache:{},images_loaded:!1,settings:{load_attr:"interchange",named_queries:{"default":"only screen and (min-width: 1px)",small:"only screen and (min-width: 768px)",medium:"only screen and (min-width: 1280px)",large:"only screen and (min-width: 1440px)",landscape:"only screen and (orientation: landscape)",portrait:"only screen and (orientation: portrait)",retina:"only screen and (-webkit-min-device-pixel-ratio: 2),only screen and (min--moz-device-pixel-ratio: 2),only screen and (-o-min-device-pixel-ratio: 2/1),only screen and (min-device-pixel-ratio: 2),only screen and (min-resolution: 192dpi),only screen and (min-resolution: 2dppx)"},directives:{replace:function(e,t){if(/IMG/.test(e[0].nodeName)){var n=e[0].src;if((new RegExp(t,"i")).test(n))return;return e[0].src=t,e.trigger("replace",[e[0].src,n])}}}},init:function(t,n,r){return Foundation.inherit(this,"throttle"),typeof n=="object"&&e.extend(!0,this.settings,n),this.events(),this.images(),typeof n!="string"?this.settings.init:this[n].call(this,r)},events:function(){var n=this;e(t).on("resize.fndtn.interchange",n.throttle(function(){n.resize.call(n)},50))},resize:function(){var t=this.cache;if(!this.images_loaded){setTimeout(e.proxy(this.resize,this),50);return}for(var n in t)if(t.hasOwnProperty(n)){var r=this.results(n,t[n]);r&&this.settings.directives[r.scenario[1]](r.el,r.scenario[0])}},results:function(t,n){var r=n.length;if(r>0){var i=e('[data-uuid="'+t+'"]');for(var s=r-1;s>=0;s--){var o,u=n[s][2];this.settings.named_queries.hasOwnProperty(u)?o=matchMedia(this.settings.named_queries[u]):o=matchMedia(u);if(o.matches)return{el:i,scenario:n[s]}}}return!1},images:function(e){return typeof this.cached_images=="undefined"||e?this.update_images():this.cached_images},update_images:function(){var t=n.getElementsByTagName("img"),r=t.length,i=0,s="data-"+this.settings.load_attr;this.cached_images=[],this.images_loaded=!1;for(var o=r-1;o>=0;o--)this.loaded(e(t[o]),function(e){i++;if(e){var t=e.getAttribute(s)||"";t.length>0&&this.cached_images.push(e)}i===r&&(this.images_loaded=!0,this.enhance())}.bind(this));return"deferred"},loaded:function(e,t){function n(){t(e[0])}function r(){this.one("load",n);if(/MSIE (\d+\.\d+);/.test(navigator.userAgent)){var e=this.attr("src"),t=e.match(/\?/)?"&":"?";t+="random="+(new Date).getTime(),this.attr("src",e+t)}}if(!e.attr("src")){n();return}e[0].complete||e[0].readyState===4?n():r.call(e)},enhance:function(){var n=this.images().length;for(var r=n-1;r>=0;r--)this._object(e(this.images()[r]));return e(t).trigger("resize")},parse_params:function(e,t,n){return[this.trim(e),this.convert_directive(t),this.trim(n)]},convert_directive:function(e){var t=this.trim(e);return t.length>0?t:"replace"},_object:function(e){var t=this.parse_data_attr(e),n=[],r=t.length;if(r>0)for(var i=r-1;i>=0;i--){var s=t[i].split(/\((.*?)(\))$/);if(s.length>1){var o=s[0].split(","),u=this.parse_params(o[0],o[1],s[1]);n.push(u)}}return this.store(e,n)},uuid:function(e){function n(){return((1+Math.random())*65536|0).toString(16).substring(1)}var t=e||"-";return n()+n()+t+n()+t+n()+t+n()+t+n()+n()+n()},store:function(e,t){var n=this.uuid(),r=e.data("uuid");return r?this.cache[r]:(e.attr("data-uuid",n),this.cache[n]=t)},trim:function(t){return typeof t=="string"?e.trim(t):t},parse_data_attr:function(e){var t=e.data(this.settings.load_attr).split(/\[(.*?)\]/),n=t.length,r=[];for(var i=n-1;i>=0;i--)t[i].replace(/[\W\d]+/,"").length>4&&r.push(t[i]);return r},reflow:function(){this.images(!0)}}}(Foundation.zj,this,this.document),function(e,t,n,r){"use strict";Foundation.libs.abide={name:"abide",version:"4.3.0",settings:{live_validate:!0,focus_on_invalid:!0,timeout:1e3,patterns:{alpha:/[a-zA-Z]+/,alpha_numeric:/[a-zA-Z0-9]+/,integer:/-?\d+/,number:/-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?/,password:/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,card:/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,cvv:/^([0-9]){3,4}$/,email:/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,url:/(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?/,domain:/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/,datetime:/([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))/,date:/(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))/,time:/(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}/,dateISO:/\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,month_day_year:/(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d/,color:/^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/}},timer:null,init:function(t,n,r){typeof n=="object"&&e.extend(!0,this.settings,n);if(typeof n=="string")return this[n].call(this,r);this.settings.init||this.events()},events:function(){var t=this,n=e("form[data-abide]",this.scope).attr("novalidate","novalidate");n.on("submit validate",function(n){return t.validate(e(this).find("input, textarea, select").get(),n)}),this.settings.init=!0;if(!this.settings.live_validate)return;n.find("input, textarea, select").on("blur change",function(e){t.validate([this],e)}).on("keydown",function(e){clearTimeout(t.timer),t.timer=setTimeout(function(){t.validate([this],e)}.bind(this),t.settings.timeout)})},validate:function(t,n){var r=this.parse_patterns(t),i=r.length,s=e(t[0]).closest("form");while(i--)if(!r[i]&&/submit/.test(n.type))return this.settings.focus_on_invalid&&t[i].focus(),s.trigger("invalid"),e(t[i]).closest("form").attr("data-invalid",""),!1;return/submit/.test(n.type)&&s.trigger("valid"),s.removeAttr("data-invalid"),!0},parse_patterns:function(e){var t=e.length,n=[];for(var r=t-1;r>=0;r--)n.push(this.pattern(e[r]));return this.check_validation_and_apply_styles(n)},pattern:function(e){var t=e.getAttribute("type"),n=typeof e.getAttribute("required")=="string";if(this.settings.patterns.hasOwnProperty(t))return[e,this.settings.patterns[t],n];var r=e.getAttribute("pattern")||"";return this.settings.patterns.hasOwnProperty(r)&&r.length>0?[e,this.settings.patterns[r],n]:r.length>0?[e,new RegExp(r),n]:(r=/.*/,[e,r,n])},check_validation_and_apply_styles:function(t){var n=t.length,r=[];for(var i=n-1;i>=0;i--){var s=t[i][0],o=t[i][2],u=s.value,a=s.type==="radio",f=o?s.value.length>0:!0;a&&o?r.push(this.valid_radio(s,o)):t[i][1].test(u)&&f||!o&&s.value.length<1?(e(s).removeAttr("data-invalid").parent().removeClass("error"),r.push(!0)):(e(s).attr("data-invalid","").parent().addClass("error"),r.push(!1))}return r},valid_radio:function(t,r){var i=t.getAttribute("name"),s=n.getElementsByName(i),o=s.length,u=!1;for(var a=0;a<o;a++)s[a].checked&&(u=!0);for(var a=0;a<o;a++)u?e(s[a]).removeAttr("data-invalid").parent().removeClass("error"):e(s[a]).attr("data-invalid","").parent().addClass("error");return u}}}(Foundation.zj,this,this.document),function(e,t,n,r){"use strict";Foundation.libs.dropdown={name:"dropdown",version:"4.3.0",settings:{activeClass:"open",is_hover:!1,opened:function(){},closed:function(){}},init:function(t,n,r){return this.scope=t||this.scope,Foundation.inherit(this,"throttle scrollLeft data_options"),typeof n=="object"&&e.extend(!0,this.settings,n),typeof n!="string"?(this.settings.init||this.events(),this.settings.init):this[n].call(this,r)},events:function(){var r=this;e(this.scope).on("click.fndtn.dropdown","[data-dropdown]",function(t){var n=e.extend({},r.settings,r.data_options(e(this)));t.preventDefault(),n.is_hover||r.toggle(e(this))}).on("mouseenter","[data-dropdown]",function(t){var n=e.extend({},r.settings,r.data_options(e(this)));n.is_hover&&r.toggle(e(this))}).on("mouseleave","[data-dropdown-content]",function(t){var n=e('[data-dropdown="'+e(this).attr("id")+'"]'),i=e.extend({},r.settings,r.data_options(n));i.is_hover&&r.close.call(r,e(this))}).on("opened.fndtn.dropdown","[data-dropdown-content]",this.settings.opened).on("closed.fndtn.dropdown","[data-dropdown-content]",this.settings.closed),e(n).on("click.fndtn.dropdown",function(t){var n=e(t.target).closest("[data-dropdown-content]");if(e(t.target).data("dropdown"))return;if(n.length>0&&(e(t.target).is("[data-dropdown-content]")||e.contains(n.first()[0],t.target))){t.stopPropagation();return}r.close.call(r,e("[data-dropdown-content]"))}),e(t).on("resize.fndtn.dropdown",r.throttle(function(){r.resize.call(r)},50)).trigger("resize"),this.settings.init=!0},close:function(t){var n=this;t.each(function(){e(this).hasClass(n.settings.activeClass)&&(e(this).css(Foundation.rtl?"right":"left","-99999px").removeClass(n.settings.activeClass),e(this).trigger("closed"))})},open:function(e,t){this.css(e.addClass(this.settings.activeClass),t),e.trigger("opened")},toggle:function(t){var n=e("#"+t.data("dropdown"));this.close.call(this,e("[data-dropdown-content]").not(n)),n.hasClass(this.settings.activeClass)?this.close.call(this,n):(this.close.call(this,e("[data-dropdown-content]")),this.open.call(this,n,t))},resize:function(){var t=e("[data-dropdown-content].open"),n=e("[data-dropdown='"+t.attr("id")+"']");t.length&&n.length&&this.css(t,n)},css:function(n,r){var i=n.offsetParent(),s=r.offset();s.top-=i.offset().top,s.left-=i.offset().left;if(this.small())n.css({position:"absolute",width:"95%",left:"2.5%","max-width":"none",top:s.top+this.outerHeight(r)});else{if(!Foundation.rtl&&e(t).width()>this.outerWidth(n)+r.offset().left){var o=s.left;n.hasClass("right")&&n.removeClass("right")}else{n.hasClass("right")||n.addClass("right");var o=s.left-(this.outerWidth(n)-this.outerWidth(r))}n.attr("style","").css({position:"absolute",top:s.top+this.outerHeight(r),left:o})}return n},small:function(){return e(t).width()<768||e("html").hasClass("lt-ie9")},off:function(){e(this.scope).off(".fndtn.dropdown"),e("html, body").off(".fndtn.dropdown"),e(t).off(".fndtn.dropdown"),e("[data-dropdown-content]").off(".fndtn.dropdown"),this.settings.init=!1},reflow:function(){}}}(Foundation.zj,this,this.document),function(e,t,n){function f(e){var t={},r=/^jQuery\d+$/;return n.each(e.attributes,function(e,n){n.specified&&!r.test(n.name)&&(t[n.name]=n.value)}),t}function l(e,r){var i=this,s=n(i);if(i.value==s.attr("placeholder")&&s.hasClass("placeholder"))if(s.data("placeholder-password")){s=s.hide().next().show().attr("id",s.removeAttr("id").data("placeholder-id"));if(e===!0)return s[0].value=r;s.focus()}else i.value="",s.removeClass("placeholder"),i==t.activeElement&&i.select()}function c(){var e,t=this,r=n(t),i=r,s=this.id;if(t.value==""){if(t.type=="password"){if(!r.data("placeholder-textinput")){try{e=r.clone().attr({type:"text"})}catch(o){e=n("<input>").attr(n.extend(f(this),{type:"text"}))}e.removeAttr("name").data({"placeholder-password":!0,"placeholder-id":s}).bind("focus.placeholder",l),r.data({"placeholder-textinput":e,"placeholder-id":s}).before(e)}r=r.removeAttr("id").hide().prev().attr("id",s).show()}r.addClass("placeholder"),r[0].value=r.attr("placeholder")}else r.removeClass("placeholder")}var r="placeholder"in t.createElement("input"),i="placeholder"in t.createElement("textarea"),s=n.fn,o=n.valHooks,u,a;r&&i?(a=s.placeholder=function(){return this},a.input=a.textarea=!0):(a=s.placeholder=function(){var e=this;return e.filter((r?"textarea":":input")+"[placeholder]").not(".placeholder").bind({"focus.placeholder":l,"blur.placeholder":c}).data("placeholder-enabled",!0).trigger("blur.placeholder"),e},a.input=r,a.textarea=i,u={get:function(e){var t=n(e);return t.data("placeholder-enabled")&&t.hasClass("placeholder")?"":e.value},set:function(e,r){var i=n(e);return i.data("placeholder-enabled")?(r==""?(e.value=r,e!=t.activeElement&&c.call(e)):i.hasClass("placeholder")?l.call(e,!0,r)||(e.value=r):e.value=r,i):e.value=r}},r||(o.input=u),i||(o.textarea=u),n(function(){n(t).delegate("form","submit.placeholder",function(){var e=n(".placeholder",this).each(l);setTimeout(function(){e.each(c)},10)})}),n(e).bind("beforeunload.placeholder",function(){n(".placeholder").each(function(){this.value=""})}))}(this,document,Foundation.zj),function(e,t,n,r){"use strict";Foundation.libs.placeholder={name:"placeholder",version:"4.2.2",init:function(n,r,i){this.scope=n||this.scope,typeof r!="string"&&(t.onload=function(){e("input, textarea").placeholder()})}}}(Foundation.zj,this,this.document),function(e,t,n,r){"use strict";Foundation.libs.forms={name:"forms",version:"4.3.1",cache:{},settings:{disable_class:"no-custom",last_combo:null},init:function(t,n,r){return typeof n=="object"&&e.extend(!0,this.settings,n),typeof n!="string"?(this.settings.init||this.events(),this.assemble(),this.settings.init):this[n].call(this,r)},assemble:function(){e('form.custom input[type="radio"]',e(this.scope)).not('[data-customforms="disabled"]').not("."+this.settings.disable_class).each(this.append_custom_markup),e('form.custom input[type="checkbox"]',e(this.scope)).not('[data-customforms="disabled"]').not("."+this.settings.disable_class).each(this.append_custom_markup),e("form.custom select",e(this.scope)).not('[data-customforms="disabled"]').not("."+this.settings.disable_class).not("[multiple=multiple]").each(this.append_custom_select)},events:function(){var r=this;e(this.scope).on("click.fndtn.forms","form.custom span.custom.checkbox",function(t){t.preventDefault(),t.stopPropagation(),r.toggle_checkbox(e(this))}).on("click.fndtn.forms","form.custom span.custom.radio",function(t){t.preventDefault(),t.stopPropagation(),r.toggle_radio(e(this))}).on("change.fndtn.forms","form.custom select",function(t,n){if(e(this).is('[data-customforms="disabled"]'))return;r.refresh_custom_select(e(this),n)}).on("click.fndtn.forms","form.custom label",function(t){if(e(t.target).is("label")){var n=e("#"+r.escape(e(this).attr("for"))).not('[data-customforms="disabled"]'),i,s;n.length!==0&&(n.attr("type")==="checkbox"?(t.preventDefault(),i=e(this).find("span.custom.checkbox"),i.length===0&&(i=n.add(this).siblings("span.custom.checkbox").first()),r.toggle_checkbox(i)):n.attr("type")==="radio"&&(t.preventDefault(),s=e(this).find("span.custom.radio"),s.length===0&&(s=n.add(this).siblings("span.custom.radio").first()),r.toggle_radio(s)))}}).on("mousedown.fndtn.forms","form.custom div.custom.dropdown",function(){return!1}).on("click.fndtn.forms","form.custom div.custom.dropdown a.current, form.custom div.custom.dropdown a.selector",function(t){var n=e(this),s=n.closest("div.custom.dropdown"),o=i(s,"select");s.hasClass("open")||e(r.scope).trigger("click"),t.preventDefault();if(!1===o.is(":disabled"))return s.toggleClass("open"),s.hasClass("open")?e(r.scope).on("click.fndtn.forms.customdropdown",function(){s.removeClass("open"),e(r.scope).off(".fndtn.forms.customdropdown")}):e(r.scope).on(".fndtn.forms.customdropdown"),!1}).on("click.fndtn.forms touchend.fndtn.forms","form.custom div.custom.dropdown li",function(t){var r=e(this),s=r.closest("div.custom.dropdown"),o=i(s,"select"),u=0;t.preventDefault(),t.stopPropagation();if(!e(this).hasClass("disabled")){e("div.dropdown").not(s).removeClass("open");var a=r.closest("ul").find("li.selected");a.removeClass("selected"),r.addClass("selected"),s.removeClass("open").find("a.current").text(r.text()),r.closest("ul").find("li").each(function(e){r[0]===this&&(u=e)}),o[0].selectedIndex=u,o.data("prevalue",a.html());if(typeof n.createEvent!="undefined"){var f=n.createEvent("HTMLEvents");f.initEvent("change",!0,!0),o[0].dispatchEvent(f)}else o[0].fireEvent("onchange")}}),e(t).on("keydown",function(t){var r=n.activeElement,i=Foundation.libs.forms,s=e(".custom.dropdown.open");if(s.length>0){t.preventDefault(),t.which===13&&s.find("li.selected").trigger("click"),t.which===27&&s.removeClass("open");if(t.which>=65&&t.which<=90){var o=i.go_to(s,t.which),u=s.find("li.selected");o&&(u.removeClass("selected"),i.scrollTo(o.addClass("selected"),300))}if(t.which===38){var u=s.find("li.selected"),a=u.prev(":not(.disabled)");a.length>0&&(a.parent()[0].scrollTop=a.parent().scrollTop()-i.outerHeight(a),u.removeClass("selected"),a.addClass("selected"))}else if(t.which===40){var u=s.find("li.selected"),o=u.next(":not(.disabled)");o.length>0&&(o.parent()[0].scrollTop=o.parent().scrollTop()+i.outerHeight(o),u.removeClass("selected"),o.addClass("selected"))}}}),this.settings.init=!0},go_to:function(e,t){var n=e.find("li"),r=n.length;if(r>0)for(var i=0;i<r;i++){var s=n.eq(i).text().charAt(0).toLowerCase();if(s===String.fromCharCode(t).toLowerCase())return n.eq(i)}},scrollTo:function(e,t){if(t<0)return;var n=e.parent(),r=this.outerHeight(e),i=r*e.index()-n.scrollTop(),s=i/t*10;this.scrollToTimerCache=setTimeout(function(){isNaN(parseInt(s,10))||(n[0].scrollTop=n.scrollTop()+s,this.scrollTo(e,t-10))}.bind(this),10)},append_custom_markup:function(t,n){var r=e(n),i=r.attr("type"),s=r.next("span.custom."+i);r.parent().hasClass("switch")||r.addClass("hidden-field"),s.length===0&&(s=e('<span class="custom '+i+'"></span>').insertAfter(r)),s.toggleClass("checked",r.is(":checked")),s.toggleClass("disabled",r.is(":disabled"))},append_custom_select:function(t,n){var r=Foundation.libs.forms,i=e(n),s=i.next("div.custom.dropdown"),o=s.find("ul"),u=s.find(".current"),a=s.find(".selector"),f=i.find("option"),l=f.filter(":selected"),c=i.attr("class")?i.attr("class").split(" "):[],h=0,p="",d,v=!1;if(s.length===0){var m=i.hasClass("small")?"small":i.hasClass("medium")?"medium":i.hasClass("large")?"large":i.hasClass("expand")?"expand":"";s=e('<div class="'+["custom","dropdown",m].concat(c).filter(function(e,t,n){return e===""?!1:n.indexOf(e)===t}).join(" ")+'"><a href="#" class="selector"></a><ul /></div>'),a=s.find(".selector"),o=s.find("ul"),p=f.map(function(){var t=e(this).attr("class")?e(this).attr("class"):"";return"<li class='"+t+"'>"+e(this).html()+"</li>"}).get().join(""),o.append(p),v=s.prepend('<a href="#" class="current">'+l.html()+"</a>").find(".current"),i.after(s).addClass("hidden-field")}else p=f.map(function(){return"<li>"+e(this).html()+"</li>"}).get().join(""),o.html("").append(p);r.assign_id(i,s),s.toggleClass("disabled",i.is(":disabled")),d=o.find("li"),r.cache[s.data("id")]=d.length,f.each(function(t){this.selected&&(d.eq(t).addClass("selected"),v&&v.html(e(this).html())),e(this).is(":disabled")&&d.eq(t).addClass("disabled")});if(!s.is(".small, .medium, .large, .expand")){s.addClass("open");var r=Foundation.libs.forms;r.hidden_fix.adjust(o),h=r.outerWidth(d)>h?r.outerWidth(d):h,Foundation.libs.forms.hidden_fix.reset(),s.removeClass("open")}},assign_id:function(e,t){var n=[+(new Date),Foundation.random_str(5)].join("-");e.attr("data-id",n),t.attr("data-id",n)},refresh_custom_select:function(t,n){var r=this,i=0,s=t.next(),o=t.find("option"),u=s.find("li");if(u.length!==this.cache[s.data("id")]||n)s.find("ul").html(""),o.each(function(){var t=e("<li>"+e(this).html()+"</li>");s.find("ul").append(t)}),o.each(function(t){this.selected&&(s.find("li").eq(t).addClass("selected"),s.find(".current").html(e(this).html())),e(this).is(":disabled")&&s.find("li").eq(t).addClass("disabled")}),s.removeAttr("style").find("ul").removeAttr("style"),s.find("li").each(function(){s.addClass("open"),r.outerWidth(e(this))>i&&(i=r.outerWidth(e(this))),s.removeClass("open")}),u=s.find("li"),this.cache[s.data("id")]=u.length},toggle_checkbox:function(e){var t=e.prev(),n=t[0];!1===t.is(":disabled")&&(n.checked=n.checked?!1:!0,e.toggleClass("checked"),t.trigger("change"))},toggle_radio:function(e){var t=e.prev(),n=t.closest("form.custom"),r=t[0];!1===t.is(":disabled")&&(n.find('input[type="radio"][name="'+this.escape(t.attr("name"))+'"]').next().not(e).removeClass("checked"),e.hasClass("checked")||e.toggleClass("checked"),r.checked=e.hasClass("checked"),t.trigger("change"))},escape:function(e){return e?e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"):""},hidden_fix:{tmp:[],hidden:null,adjust:function(t){var n=this;n.hidden=t.parents(),n.hidden=n.hidden.add(t).filter(":hidden"),n.hidden.each(function(){var t=e(this);n.tmp.push(t.attr("style")),t.css({visibility:"hidden",display:"block"})})},reset:function(){var t=this;t.hidden.each(function(n){var i=e(this),s=t.tmp[n];s===r?i.removeAttr("style"):i.attr("style",s)}),t.tmp=[],t.hidden=null}},off:function(){e(this.scope).off(".fndtn.forms")},reflow:function(){}};var i=function(t,n){var t=t.prev();while(t.length){if(t.is(n))return t;t=t.prev()}return e()}}(Foundation.zj,this,this.document),function(e,t,n,r){"use strict";Foundation.libs.alerts={name:"alerts",version:"4.2.2",settings:{speed:300,callback:function(){}},init:function(t,n,r){return this.scope=t||this.scope,typeof n=="object"&&e.extend(!0,this.settings,n),typeof n!="string"?(this.settings.init||this.events(),this.settings.init):this[n].call(this,r)},events:function(){var t=this;e(this.scope).on("click.fndtn.alerts","[data-alert] a.close",function(n){n.preventDefault(),e(this).closest("[data-alert]").fadeOut(t.speed,function(){e(this).remove(),t.settings.callback()})}),this.settings.init=!0},off:function(){e(this.scope).off(".fndtn.alerts")},reflow:function(){}}}(Foundation.zj,this,this.document),function(e,t,n,r){"use strict";Foundation.libs.magellan={name:"magellan",version:"4.2.2",settings:{activeClass:"active",threshold:0},init:function(t,n,r){return this.scope=t||this.scope,Foundation.inherit(this,"data_options"),typeof n=="object"&&e.extend(!0,this.settings,n),typeof n!="string"?(this.settings.init||(this.fixed_magellan=e("[data-magellan-expedition]"),this.set_threshold(),this.last_destination=e("[data-magellan-destination]").last(),this.events()),this.settings.init):this[n].call(this,r)},events:function(){var n=this;e(this.scope).on("arrival.fndtn.magellan","[data-magellan-arrival]",function(t){var r=e(this),i=r.closest("[data-magellan-expedition]"),s=i.attr("data-magellan-active-class")||n.settings.activeClass;r.closest("[data-magellan-expedition]").find("[data-magellan-arrival]").not(r).removeClass(s),r.addClass(s)}),this.fixed_magellan.on("update-position.fndtn.magellan",function(){var t=e(this)}).trigger("update-position"),e(t).on("resize.fndtn.magellan",function(){this.fixed_magellan.trigger("update-position")}.bind(this)).on("scroll.fndtn.magellan",function(){var r=e(t).scrollTop();n.fixed_magellan.each(function(){var t=e(this);typeof t.data("magellan-top-offset")=="undefined"&&t.data("magellan-top-offset",t.offset().top),typeof t.data("magellan-fixed-position")=="undefined"&&t.data("magellan-fixed-position",!1);var i=r+n.settings.threshold>t.data("magellan-top-offset"),s=t.attr("data-magellan-top-offset");t.data("magellan-fixed-position")!=i&&(t.data("magellan-fixed-position",i),i?(t.addClass("fixed"),t.css({position:"fixed",top:0})):(t.removeClass("fixed"),t.css({position:"",top:""})),i&&typeof s!="undefined"&&s!=0&&t.css({position:"fixed",top:s+"px"}))})}),this.last_destination.length>0&&e(t).on("scroll.fndtn.magellan",function(r){var i=e(t).scrollTop(),s=i+e(t).height(),o=Math.ceil(n.last_destination.offset().top);e("[data-magellan-destination]").each(function(){var t=e(this),r=t.attr("data-magellan-destination"),u=t.offset().top-i;u<=n.settings.threshold&&e("[data-magellan-arrival='"+r+"']").trigger("arrival"),s>=e(n.scope).height()&&o>i&&o<s&&e("[data-magellan-arrival]").last().trigger("arrival")})}),this.settings.init=!0},set_threshold:function(){this.settings.threshold||(this.settings.threshold=this.fixed_magellan.length>0?this.outerHeight(this.fixed_magellan,!0):0)},off:function(){e(this.scope).off(".fndtn.magellan")},reflow:function(){}}}(Foundation.zj,this,this.document),function(e,t,n,r){"use strict";Foundation.libs.reveal={name:"reveal",version:"4.2.2",locked:!1,settings:{animation:"fadeAndPop",animationSpeed:250,closeOnBackgroundClick:!0,closeOnEsc:!0,dismissModalClass:"close-reveal-modal",bgClass:"reveal-modal-bg",open:function(){},opened:function(){},close:function(){},closed:function(){},bg:e(".reveal-modal-bg"),css:{open:{opacity:0,visibility:"visible",display:"block"},close:{opacity:1,visibility:"hidden",display:"none"}}},init:function(t,n,r){return Foundation.inherit(this,"data_options delay"),typeof n=="object"?e.extend(!0,this.settings,n):typeof r!="undefined"&&e.extend(!0,this.settings,r),typeof n!="string"?(this.events(),this.settings.init):this[n].call(this,r)},events:function(){var t=this;return e(this.scope).off(".fndtn.reveal").on("click.fndtn.reveal","[data-reveal-id]",function(n){n.preventDefault();if(!t.locked){var r=e(this),i=r.data("reveal-ajax");t.locked=!0;if(typeof i=="undefined")t.open.call(t,r);else{var s=i===!0?r.attr("href"):i;t.open.call(t,r,{url:s})}}}).on("click.fndtn.reveal",this.close_targets(),function(n){n.preventDefault();if(!t.locked){var r=e.extend({},t.settings,t.data_options(e(".reveal-modal.open")));if(e(n.target)[0]===e("."+r.bgClass)[0]&&!r.closeOnBackgroundClick)return;t.locked=!0,t.close.call(t,e(this).closest(".reveal-modal"))}}).on("open.fndtn.reveal",".reveal-modal",this.settings.open).on("opened.fndtn.reveal",".reveal-modal",this.settings.opened).on("opened.fndtn.reveal",".reveal-modal",this.open_video).on("close.fndtn.reveal",".reveal-modal",this.settings.close).on("closed.fndtn.reveal",".reveal-modal",this.settings.closed).on("closed.fndtn.reveal",".reveal-modal",this.close_video),e("body").bind("keyup.reveal",function(n){var r=e(".reveal-modal.open"),i=e.extend({},t.settings,t.data_options(r));n.which===27&&i.closeOnEsc&&r.foundation("reveal","close")}),!0},open:function(t,n){if(t)if(typeof t.selector!="undefined")var r=e("#"+t.data("reveal-id"));else{
var r=e(this.scope);n=t}else var r=e(this.scope);if(!r.hasClass("open")){var i=e(".reveal-modal.open");typeof r.data("css-top")=="undefined"&&r.data("css-top",parseInt(r.css("top"),10)).data("offset",this.cache_offset(r)),r.trigger("open"),i.length<1&&this.toggle_bg(r);if(typeof n=="undefined"||!n.url)this.hide(i,this.settings.css.close),this.show(r,this.settings.css.open);else{var s=this,o=typeof n.success!="undefined"?n.success:null;e.extend(n,{success:function(t,n,u){e.isFunction(o)&&o(t,n,u),r.html(t),e(r).foundation("section","reflow"),s.hide(i,s.settings.css.close),s.show(r,s.settings.css.open)}}),e.ajax(n)}}},close:function(t){var t=t&&t.length?t:e(this.scope),n=e(".reveal-modal.open");n.length>0&&(this.locked=!0,t.trigger("close"),this.toggle_bg(t),this.hide(n,this.settings.css.close))},close_targets:function(){var e="."+this.settings.dismissModalClass;return this.settings.closeOnBackgroundClick?e+", ."+this.settings.bgClass:e},toggle_bg:function(t){e(".reveal-modal-bg").length===0&&(this.settings.bg=e("<div />",{"class":this.settings.bgClass}).appendTo("body")),this.settings.bg.filter(":visible").length>0?this.hide(this.settings.bg):this.show(this.settings.bg)},show:function(n,r){if(r){if(/pop/i.test(this.settings.animation)){r.top=e(t).scrollTop()-n.data("offset")+"px";var i={top:e(t).scrollTop()+n.data("css-top")+"px",opacity:1};return this.delay(function(){return n.css(r).animate(i,this.settings.animationSpeed,"linear",function(){this.locked=!1,n.trigger("opened")}.bind(this)).addClass("open")}.bind(this),this.settings.animationSpeed/2)}if(/fade/i.test(this.settings.animation)){var i={opacity:1};return this.delay(function(){return n.css(r).animate(i,this.settings.animationSpeed,"linear",function(){this.locked=!1,n.trigger("opened")}.bind(this)).addClass("open")}.bind(this),this.settings.animationSpeed/2)}return n.css(r).show().css({opacity:1}).addClass("open").trigger("opened")}return/fade/i.test(this.settings.animation)?n.fadeIn(this.settings.animationSpeed/2):n.show()},hide:function(n,r){if(r){if(/pop/i.test(this.settings.animation)){var i={top:-e(t).scrollTop()-n.data("offset")+"px",opacity:0};return this.delay(function(){return n.animate(i,this.settings.animationSpeed,"linear",function(){this.locked=!1,n.css(r).trigger("closed")}.bind(this)).removeClass("open")}.bind(this),this.settings.animationSpeed/2)}if(/fade/i.test(this.settings.animation)){var i={opacity:0};return this.delay(function(){return n.animate(i,this.settings.animationSpeed,"linear",function(){this.locked=!1,n.css(r).trigger("closed")}.bind(this)).removeClass("open")}.bind(this),this.settings.animationSpeed/2)}return n.hide().css(r).removeClass("open").trigger("closed")}return/fade/i.test(this.settings.animation)?n.fadeOut(this.settings.animationSpeed/2):n.hide()},close_video:function(t){var n=e(this).find(".flex-video"),r=n.find("iframe");r.length>0&&(r.attr("data-src",r[0].src),r.attr("src","about:blank"),n.hide())},open_video:function(t){var n=e(this).find(".flex-video"),i=n.find("iframe");if(i.length>0){var s=i.attr("data-src");if(typeof s=="string")i[0].src=i.attr("data-src");else{var o=i[0].src;i[0].src=r,i[0].src=o}n.show()}},cache_offset:function(e){var t=e.show().height()+parseInt(e.css("top"),10);return e.hide(),t},off:function(){e(this.scope).off(".fndtn.reveal")},reflow:function(){}}}(Foundation.zj,this,this.document),function(e,t,n,r){"use strict";Foundation.libs.tooltips={name:"tooltips",version:"4.2.2",settings:{selector:".has-tip",additionalInheritableClasses:[],tooltipClass:".tooltip",appendTo:"body","disable-for-touch":!1,tipTemplate:function(e,t){return'<span data-selector="'+e+'" class="'+Foundation.libs.tooltips.settings.tooltipClass.substring(1)+'">'+t+'<span class="nub"></span></span>'}},cache:{},init:function(t,n,r){Foundation.inherit(this,"data_options");var i=this;typeof n=="object"?e.extend(!0,this.settings,n):typeof r!="undefined"&&e.extend(!0,this.settings,r);if(typeof n=="string")return this[n].call(this,r);Modernizr.touch?e(this.scope).on("click.fndtn.tooltip touchstart.fndtn.tooltip touchend.fndtn.tooltip","[data-tooltip]",function(t){var n=e.extend({},i.settings,i.data_options(e(this)));n["disable-for-touch"]||(t.preventDefault(),e(n.tooltipClass).hide(),i.showOrCreateTip(e(this)))}).on("click.fndtn.tooltip touchstart.fndtn.tooltip touchend.fndtn.tooltip",this.settings.tooltipClass,function(t){t.preventDefault(),e(this).fadeOut(150)}):e(this.scope).on("mouseenter.fndtn.tooltip mouseleave.fndtn.tooltip","[data-tooltip]",function(t){var n=e(this);/enter|over/i.test(t.type)?i.showOrCreateTip(n):(t.type==="mouseout"||t.type==="mouseleave")&&i.hide(n)})},showOrCreateTip:function(e){var t=this.getTip(e);return t&&t.length>0?this.show(e):this.create(e)},getTip:function(t){var n=this.selector(t),r=null;return n&&(r=e('span[data-selector="'+n+'"]'+this.settings.tooltipClass)),typeof r=="object"?r:!1},selector:function(e){var t=e.attr("id"),n=e.attr("data-tooltip")||e.attr("data-selector");return(t&&t.length<1||!t)&&typeof n!="string"&&(n="tooltip"+Math.random().toString(36).substring(7),e.attr("data-selector",n)),t&&t.length>0?t:n},create:function(t){var n=e(this.settings.tipTemplate(this.selector(t),e("<div></div>").html(t.attr("title")).html())),r=this.inheritable_classes(t);n.addClass(r).appendTo(this.settings.appendTo),Modernizr.touch&&n.append('<span class="tap-to-close">tap to close </span>'),t.removeAttr("title").attr("title",""),this.show(t)},reposition:function(n,r,i){var s,o,u,a,f,l;r.css("visibility","hidden").show(),s=n.data("width"),o=r.children(".nub"),u=this.outerHeight(o),a=this.outerHeight(o),l=function(e,t,n,r,i,s){return e.css({top:t?t:"auto",bottom:r?r:"auto",left:i?i:"auto",right:n?n:"auto",width:s?s:"auto"}).end()},l(r,n.offset().top+this.outerHeight(n)+10,"auto","auto",n.offset().left,s);if(e(t).width()<767)l(r,n.offset().top+this.outerHeight(n)+10,"auto","auto",12.5,e(this.scope).width()),r.addClass("tip-override"),l(o,-u,"auto","auto",n.offset().left);else{var c=n.offset().left;Foundation.rtl&&(c=n.offset().left+n.offset().width-this.outerWidth(r)),l(r,n.offset().top+this.outerHeight(n)+10,"auto","auto",c,s),r.removeClass("tip-override"),i&&i.indexOf("tip-top")>-1?l(r,n.offset().top-this.outerHeight(r),"auto","auto",c,s).removeClass("tip-override"):i&&i.indexOf("tip-left")>-1?l(r,n.offset().top+this.outerHeight(n)/2-u*2.5,"auto","auto",n.offset().left-this.outerWidth(r)-u,s).removeClass("tip-override"):i&&i.indexOf("tip-right")>-1&&l(r,n.offset().top+this.outerHeight(n)/2-u*2.5,"auto","auto",n.offset().left+this.outerWidth(n)+u,s).removeClass("tip-override")}r.css("visibility","visible").hide()},inheritable_classes:function(t){var n=["tip-top","tip-left","tip-bottom","tip-right","noradius"].concat(this.settings.additionalInheritableClasses),r=t.attr("class"),i=r?e.map(r.split(" "),function(t,r){if(e.inArray(t,n)!==-1)return t}).join(" "):"";return e.trim(i)},show:function(e){var t=this.getTip(e);this.reposition(e,t,e.attr("class")),t.fadeIn(150)},hide:function(e){var t=this.getTip(e);t.fadeOut(150)},reload:function(){var t=e(this);return t.data("fndtn-tooltips")?t.foundationTooltips("destroy").foundationTooltips("init"):t.foundationTooltips("init")},off:function(){e(this.scope).off(".fndtn.tooltip"),e(this.settings.tooltipClass).each(function(t){e("[data-tooltip]").get(t).attr("title",e(this).text())}).remove()},reflow:function(){}}}(Foundation.zj,this,this.document),function(e,t,n,r){"use strict";Foundation.libs.clearing={name:"clearing",version:"4.3.1",settings:{templates:{viewing:'<a href="#" class="clearing-close">&times;</a><div class="visible-img" style="display: none"><img src="//:0"><p class="clearing-caption"></p><a href="#" class="clearing-main-prev"><span></span></a><a href="#" class="clearing-main-next"><span></span></a></div>'},close_selectors:".clearing-close",init:!1,locked:!1},init:function(t,n,r){var i=this;return Foundation.inherit(this,"set_data get_data remove_data throttle data_options"),typeof n=="object"&&(r=e.extend(!0,this.settings,n)),typeof n!="string"?(e(this.scope).find("ul[data-clearing]").each(function(){var t=e(this),n=n||{},r=t.find("li"),s=i.get_data(t);!s&&r.length>0&&(n.$parent=t.parent(),i.set_data(t,e.extend({},i.settings,n,i.data_options(t))),i.assemble(t.find("li")),i.settings.init||i.events().swipe_events())}),this.settings.init):this[n].call(this,r)},events:function(){var n=this;return e(this.scope).on("click.fndtn.clearing","ul[data-clearing] li",function(t,r,i){var r=r||e(this),i=i||r,s=r.next("li"),o=n.get_data(r.parent()),u=e(t.target);t.preventDefault(),o||n.init(),i.hasClass("visible")&&r[0]===i[0]&&s.length>0&&n.is_open(r)&&(i=s,u=i.find("img")),n.open(u,r,i),n.update_paddles(i)}).on("click.fndtn.clearing",".clearing-main-next",function(e){this.nav(e,"next")}.bind(this)).on("click.fndtn.clearing",".clearing-main-prev",function(e){this.nav(e,"prev")}.bind(this)).on("click.fndtn.clearing",this.settings.close_selectors,function(e){Foundation.libs.clearing.close(e,this)}).on("keydown.fndtn.clearing",function(e){this.keydown(e)}.bind(this)),e(t).on("resize.fndtn.clearing",function(){this.resize()}.bind(this)),this.settings.init=!0,this},swipe_events:function(){var t=this;e(this.scope).on("touchstart.fndtn.clearing",".visible-img",function(t){t.touches||(t=t.originalEvent);var n={start_page_x:t.touches[0].pageX,start_page_y:t.touches[0].pageY,start_time:(new Date).getTime(),delta_x:0,is_scrolling:r};e(this).data("swipe-transition",n),t.stopPropagation()}).on("touchmove.fndtn.clearing",".visible-img",function(n){n.touches||(n=n.originalEvent);if(n.touches.length>1||n.scale&&n.scale!==1)return;var r=e(this).data("swipe-transition");typeof r=="undefined"&&(r={}),r.delta_x=n.touches[0].pageX-r.start_page_x,typeof r.is_scrolling=="undefined"&&(r.is_scrolling=!!(r.is_scrolling||Math.abs(r.delta_x)<Math.abs(n.touches[0].pageY-r.start_page_y)));if(!r.is_scrolling&&!r.active){n.preventDefault();var i=r.delta_x<0?"next":"prev";r.active=!0,t.nav(n,i)}}).on("touchend.fndtn.clearing",".visible-img",function(t){e(this).data("swipe-transition",{}),t.stopPropagation()})},assemble:function(t){var n=t.parent();n.after('<div id="foundationClearingHolder"></div>');var r=e("#foundationClearingHolder"),i=this.get_data(n),s=n.detach(),o={grid:'<div class="carousel">'+this.outerHTML(s[0])+"</div>",viewing:i.templates.viewing},u='<div class="clearing-assembled"><div>'+o.viewing+o.grid+"</div></div>";return r.after(u).remove()},open:function(e,t,n){var r=n.closest(".clearing-assembled"),i=r.find("div").first(),s=i.find(".visible-img"),o=s.find("img").not(e);this.locked()||(o.attr("src",this.load(e)).css("visibility","hidden"),this.loaded(o,function(){o.css("visibility","visible"),r.addClass("clearing-blackout"),i.addClass("clearing-container"),s.show(),this.fix_height(n).caption(s.find(".clearing-caption"),e).center(o).shift(t,n,function(){n.siblings().removeClass("visible"),n.addClass("visible")})}.bind(this)))},close:function(t,n){t.preventDefault();var r=function(e){return/blackout/.test(e.selector)?e:e.closest(".clearing-blackout")}(e(n)),i,s;return n===t.target&&r&&(i=r.find("div").first(),s=i.find(".visible-img"),this.settings.prev_index=0,r.find("ul[data-clearing]").attr("style","").closest(".clearing-blackout").removeClass("clearing-blackout"),i.removeClass("clearing-container"),s.hide()),!1},is_open:function(e){return e.parent().attr("style").length>0},keydown:function(t){var n=e(".clearing-blackout").find("ul[data-clearing]");t.which===39&&this.go(n,"next"),t.which===37&&this.go(n,"prev"),t.which===27&&e("a.clearing-close").trigger("click")},nav:function(t,n){var r=e(".clearing-blackout").find("ul[data-clearing]");t.preventDefault(),this.go(r,n)},resize:function(){var t=e(".clearing-blackout .visible-img").find("img");t.length&&this.center(t)},fix_height:function(t){var n=t.parent().children(),r=this;return n.each(function(){var t=e(this),n=t.find("img");t.height()>r.outerHeight(n)&&t.addClass("fix-height")}).closest("ul").width(n.length*100+"%"),this},update_paddles:function(e){var t=e.closest(".carousel").siblings(".visible-img");e.next().length>0?t.find(".clearing-main-next").removeClass("disabled"):t.find(".clearing-main-next").addClass("disabled"),e.prev().length>0?t.find(".clearing-main-prev").removeClass("disabled"):t.find(".clearing-main-prev").addClass("disabled")},center:function(e){return this.rtl?e.css({marginRight:-(this.outerWidth(e)/2),marginTop:-(this.outerHeight(e)/2)}):e.css({marginLeft:-(this.outerWidth(e)/2),marginTop:-(this.outerHeight(e)/2)}),this},load:function(e){if(e[0].nodeName==="A")var t=e.attr("href");else var t=e.parent().attr("href");return this.preload(e),t?t:e.attr("src")},preload:function(e){this.img(e.closest("li").next()).img(e.closest("li").prev())},loaded:function(e,t){function n(){t()}function r(){this.one("load",n);if(/MSIE (\d+\.\d+);/.test(navigator.userAgent)){var e=this.attr("src"),t=e.match(/\?/)?"&":"?";t+="random="+(new Date).getTime(),this.attr("src",e+t)}}if(!e.attr("src")){n();return}e[0].complete||e[0].readyState===4?n():r.call(e)},img:function(e){if(e.length){var t=new Image,n=e.find("a");n.length?t.src=n.attr("href"):t.src=e.find("img").attr("src")}return this},caption:function(e,t){var n=t.data("caption");return n?e.html(n).show():e.text("").hide(),this},go:function(e,t){var n=e.find(".visible"),r=n[t]();r.length&&r.find("img").trigger("click",[n,r])},shift:function(e,t,n){var r=t.parent(),i=this.settings.prev_index||t.index(),s=this.direction(r,e,t),o=parseInt(r.css("left"),10),u=this.outerWidth(t),a;t.index()!==i&&!/skip/.test(s)?/left/.test(s)?(this.lock(),r.animate({left:o+u},300,this.unlock())):/right/.test(s)&&(this.lock(),r.animate({left:o-u},300,this.unlock())):/skip/.test(s)&&(a=t.index()-this.settings.up_count,this.lock(),a>0?r.animate({left:-(a*u)},300,this.unlock()):r.animate({left:0},300,this.unlock())),n()},direction:function(t,n,r){var i=t.find("li"),s=this.outerWidth(i)+this.outerWidth(i)/4,o=Math.floor(this.outerWidth(e(".clearing-container"))/s)-1,u=i.index(r),a;return this.settings.up_count=o,this.adjacent(this.settings.prev_index,u)?u>o&&u>this.settings.prev_index?a="right":u>o-1&&u<=this.settings.prev_index?a="left":a=!1:a="skip",this.settings.prev_index=u,a},adjacent:function(e,t){for(var n=t+1;n>=t-1;n--)if(n===e)return!0;return!1},lock:function(){this.settings.locked=!0},unlock:function(){this.settings.locked=!1},locked:function(){return this.settings.locked},outerHTML:function(e){return e.outerHTML||(new XMLSerializer).serializeToString(e)},off:function(){e(this.scope).off(".fndtn.clearing"),e(t).off(".fndtn.clearing"),this.remove_data(),this.settings.init=!1},reflow:function(){this.init()}}}(Foundation.zj,this,this.document),function(e,t,n){function i(e){return e}function s(e){return decodeURIComponent(e.replace(r," "))}var r=/\+/g,o=e.cookie=function(r,u,a){if(u!==n){a=e.extend({},o.defaults,a),u===null&&(a.expires=-1);if(typeof a.expires=="number"){var f=a.expires,l=a.expires=new Date;l.setDate(l.getDate()+f)}return u=o.json?JSON.stringify(u):String(u),t.cookie=[encodeURIComponent(r),"=",o.raw?u:encodeURIComponent(u),a.expires?"; expires="+a.expires.toUTCString():"",a.path?"; path="+a.path:"",a.domain?"; domain="+a.domain:"",a.secure?"; secure":""].join("")}var c=o.raw?i:s,h=t.cookie.split("; ");for(var p=0,d=h.length;p<d;p++){var v=h[p].split("=");if(c(v.shift())===r){var m=c(v.join("="));return o.json?JSON.parse(m):m}}return null};o.defaults={},e.removeCookie=function(t,n){return e.cookie(t)!==null?(e.cookie(t,null,n),!0):!1}}(Foundation.zj,document),function(e,t,n,r){"use strict";Foundation.libs.joyride={name:"joyride",version:"4.2.2",defaults:{expose:!1,modal:!1,tipLocation:"bottom",nubPosition:"auto",scrollSpeed:300,timer:0,startTimerOnClick:!0,startOffset:0,nextButton:!0,tipAnimation:"fade",pauseAfter:[],exposed:[],tipAnimationFadeSpeed:300,cookieMonster:!1,cookieName:"joyride",cookieDomain:!1,cookieExpires:365,tipContainer:"body",postRideCallback:function(){},postStepCallback:function(){},preStepCallback:function(){},preRideCallback:function(){},postExposeCallback:function(){},template:{link:'<a href="#close" class="joyride-close-tip">&times;</a>',timer:'<div class="joyride-timer-indicator-wrap"><span class="joyride-timer-indicator"></span></div>',tip:'<div class="joyride-tip-guide"><span class="joyride-nub"></span></div>',wrapper:'<div class="joyride-content-wrapper"></div>',button:'<a href="#" class="small button joyride-next-tip"></a>',modal:'<div class="joyride-modal-bg"></div>',expose:'<div class="joyride-expose-wrapper"></div>',exposeCover:'<div class="joyride-expose-cover"></div>'},exposeAddClass:""},settings:{},init:function(t,n,r){return this.scope=t||this.scope,Foundation.inherit(this,"throttle data_options scrollTo scrollLeft delay"),typeof n=="object"?e.extend(!0,this.settings,this.defaults,n):e.extend(!0,this.settings,this.defaults,r),typeof n!="string"?(this.settings.init||this.events(),this.settings.init):this[n].call(this,r)},events:function(){var n=this;e(this.scope).on("click.joyride",".joyride-next-tip, .joyride-modal-bg",function(e){e.preventDefault(),this.settings.$li.next().length<1?this.end():this.settings.timer>0?(clearTimeout(this.settings.automate),this.hide(),this.show(),this.startTimer()):(this.hide(),this.show())}.bind(this)).on("click.joyride",".joyride-close-tip",function(e){e.preventDefault(),this.end()}.bind(this)),e(t).on("resize.fndtn.joyride",n.throttle(function(){if(e("[data-joyride]").length>0&&n.settings.$next_tip){if(n.settings.exposed.length>0){var t=e(n.settings.exposed);t.each(function(){var t=e(this);n.un_expose(t),n.expose(t)})}n.is_phone()?n.pos_phone():n.pos_default(!1,!0)}},100)),this.settings.init=!0},start:function(){var t=this,n=e(this.scope).find("[data-joyride]"),r=["timer","scrollSpeed","startOffset","tipAnimationFadeSpeed","cookieExpires"],i=r.length;this.settings.init||this.init(),this.settings.$content_el=n,this.settings.$body=e(this.settings.tipContainer),this.settings.body_offset=e(this.settings.tipContainer).position(),this.settings.$tip_content=this.settings.$content_el.find("> li"),this.settings.paused=!1,this.settings.attempts=0,this.settings.tipLocationPatterns={top:["bottom"],bottom:[],left:["right","top","bottom"],right:["left","top","bottom"]},typeof e.cookie!="function"&&(this.settings.cookieMonster=!1);if(!this.settings.cookieMonster||this.settings.cookieMonster&&e.cookie(this.settings.cookieName)===null)this.settings.$tip_content.each(function(n){var s=e(this);e.extend(!0,t.settings,t.data_options(s));for(var o=i-1;o>=0;o--)t.settings[r[o]]=parseInt(t.settings[r[o]],10);t.create({$li:s,index:n})}),!this.settings.startTimerOnClick&&this.settings.timer>0?(this.show("init"),this.startTimer()):this.show("init")},resume:function(){this.set_li(),this.show()},tip_template:function(t){var n,r;return t.tip_class=t.tip_class||"",n=e(this.settings.template.tip).addClass(t.tip_class),r=e.trim(e(t.li).html())+this.button_text(t.button_text)+this.settings.template.link+this.timer_instance(t.index),n.append(e(this.settings.template.wrapper)),n.first().attr("data-index",t.index),e(".joyride-content-wrapper",n).append(r),n[0]},timer_instance:function(t){var n;return t===0&&this.settings.startTimerOnClick&&this.settings.timer>0||this.settings.timer===0?n="":n=this.outerHTML(e(this.settings.template.timer)[0]),n},button_text:function(t){return this.settings.nextButton?(t=e.trim(t)||"Next",t=this.outerHTML(e(this.settings.template.button).append(t)[0])):t="",t},create:function(t){var n=t.$li.attr("data-button")||t.$li.attr("data-text"),r=t.$li.attr("class"),i=e(this.tip_template({tip_class:r,index:t.index,button_text:n,li:t.$li}));e(this.settings.tipContainer).append(i)},show:function(t){var n=null;this.settings.$li===r||e.inArray(this.settings.$li.index(),this.settings.pauseAfter)===-1?(this.settings.paused?this.settings.paused=!1:this.set_li(t),this.settings.attempts=0,this.settings.$li.length&&this.settings.$target.length>0?(t&&(this.settings.preRideCallback(this.settings.$li.index(),this.settings.$next_tip),this.settings.modal&&this.show_modal()),this.settings.preStepCallback(this.settings.$li.index(),this.settings.$next_tip),this.settings.modal&&this.settings.expose&&this.expose(),this.settings.tipSettings=e.extend(this.settings,this.data_options(this.settings.$li)),this.settings.timer=parseInt(this.settings.timer,10),this.settings.tipSettings.tipLocationPattern=this.settings.tipLocationPatterns[this.settings.tipSettings.tipLocation],/body/i.test(this.settings.$target.selector)||this.scroll_to(),this.is_phone()?this.pos_phone(!0):this.pos_default(!0),n=this.settings.$next_tip.find(".joyride-timer-indicator"),/pop/i.test(this.settings.tipAnimation)?(n.width(0),this.settings.timer>0?(this.settings.$next_tip.show(),this.delay(function(){n.animate({width:n.parent().width()},this.settings.timer,"linear")}.bind(this),this.settings.tipAnimationFadeSpeed)):this.settings.$next_tip.show()):/fade/i.test(this.settings.tipAnimation)&&(n.width(0),this.settings.timer>0?(this.settings.$next_tip.fadeIn(this.settings.tipAnimationFadeSpeed).show(),this.delay(function(){n.animate({width:n.parent().width()},this.settings.timer,"linear")}.bind(this),this.settings.tipAnimationFadeSpeed)):this.settings.$next_tip.fadeIn(this.settings.tipAnimationFadeSpeed)),this.settings.$current_tip=this.settings.$next_tip):this.settings.$li&&this.settings.$target.length<1?this.show():this.end()):this.settings.paused=!0},is_phone:function(){return Modernizr?Modernizr.mq("only screen and (max-width: 767px)")||e(".lt-ie9").length>0:this.settings.$window.width()<767},hide:function(){this.settings.modal&&this.settings.expose&&this.un_expose(),this.settings.modal||e(".joyride-modal-bg").hide(),this.settings.$current_tip.css("visibility","hidden"),setTimeout(e.proxy(function(){this.hide(),this.css("visibility","visible")},this.settings.$current_tip),0),this.settings.postStepCallback(this.settings.$li.index(),this.settings.$current_tip)},set_li:function(e){e?(this.settings.$li=this.settings.$tip_content.eq(this.settings.startOffset),this.set_next_tip(),this.settings.$current_tip=this.settings.$next_tip):(this.settings.$li=this.settings.$li.next(),this.set_next_tip()),this.set_target()},set_next_tip:function(){this.settings.$next_tip=e(".joyride-tip-guide[data-index='"+this.settings.$li.index()+"']"),this.settings.$next_tip.data("closed","")},set_target:function(){var t=this.settings.$li.attr("data-class"),r=this.settings.$li.attr("data-id"),i=function(){return r?e(n.getElementById(r)):t?e("."+t).first():e("body")};this.settings.$target=i()},scroll_to:function(){var n,r;n=e(t).height()/2,r=Math.ceil(this.settings.$target.offset().top-n+this.outerHeight(this.settings.$next_tip)),r>0&&this.scrollTo(e("html, body"),r,this.settings.scrollSpeed)},paused:function(){return e.inArray(this.settings.$li.index()+1,this.settings.pauseAfter)===-1},restart:function(){this.hide(),this.settings.$li=r,this.show("init")},pos_default:function(n,r){var i=Math.ceil(e(t).height()/2),s=this.settings.$next_tip.offset(),o=this.settings.$next_tip.find(".joyride-nub"),u=Math.ceil(this.outerWidth(o)/2),a=Math.ceil(this.outerHeight(o)/2),f=n||!1;f&&(this.settings.$next_tip.css("visibility","hidden"),this.settings.$next_tip.show()),typeof r=="undefined"&&(r=!1);if(!/body/i.test(this.settings.$target.selector)){if(this.bottom()){var l=this.settings.$target.offset().left;Foundation.rtl&&(l=this.settings.$target.offset().width-this.settings.$next_tip.width()+l),this.settings.$next_tip.css({top:this.settings.$target.offset().top+a+this.outerHeight(this.settings.$target),left:l}),this.nub_position(o,this.settings.tipSettings.nubPosition,"top")}else if(this.top()){var l=this.settings.$target.offset().left;Foundation.rtl&&(l=this.settings.$target.offset().width-this.settings.$next_tip.width()+l),this.settings.$next_tip.css({top:this.settings.$target.offset().top-this.outerHeight(this.settings.$next_tip)-a,left:l}),this.nub_position(o,this.settings.tipSettings.nubPosition,"bottom")}else this.right()?(this.settings.$next_tip.css({top:this.settings.$target.offset().top,left:this.outerWidth(this.settings.$target)+this.settings.$target.offset().left+u}),this.nub_position(o,this.settings.tipSettings.nubPosition,"left")):this.left()&&(this.settings.$next_tip.css({top:this.settings.$target.offset().top,left:this.settings.$target.offset().left-this.outerWidth(this.settings.$next_tip)-u}),this.nub_position(o,this.settings.tipSettings.nubPosition,"right"));!this.visible(this.corners(this.settings.$next_tip))&&this.settings.attempts<this.settings.tipSettings.tipLocationPattern.length&&(o.removeClass("bottom").removeClass("top").removeClass("right").removeClass("left"),this.settings.tipSettings.tipLocation=this.settings.tipSettings.tipLocationPattern[this.settings.attempts],this.settings.attempts++,this.pos_default())}else this.settings.$li.length&&this.pos_modal(o);f&&(this.settings.$next_tip.hide(),this.settings.$next_tip.css("visibility","visible"))},pos_phone:function(t){var n=this.outerHeight(this.settings.$next_tip),r=this.settings.$next_tip.offset(),i=this.outerHeight(this.settings.$target),s=e(".joyride-nub",this.settings.$next_tip),o=Math.ceil(this.outerHeight(s)/2),u=t||!1;s.removeClass("bottom").removeClass("top").removeClass("right").removeClass("left"),u&&(this.settings.$next_tip.css("visibility","hidden"),this.settings.$next_tip.show()),/body/i.test(this.settings.$target.selector)?this.settings.$li.length&&this.pos_modal(s):this.top()?(this.settings.$next_tip.offset({top:this.settings.$target.offset().top-n-o}),s.addClass("bottom")):(this.settings.$next_tip.offset({top:this.settings.$target.offset().top+i+o}),s.addClass("top")),u&&(this.settings.$next_tip.hide(),this.settings.$next_tip.css("visibility","visible"))},pos_modal:function(e){this.center(),e.hide(),this.show_modal()},show_modal:function(){if(!this.settings.$next_tip.data("closed")){var t=e(".joyride-modal-bg");t.length<1&&e("body").append(this.settings.template.modal).show(),/pop/i.test(this.settings.tipAnimation)?t.show():t.fadeIn(this.settings.tipAnimationFadeSpeed)}},expose:function(){var n,r,i,s,o,u="expose-"+Math.floor(Math.random()*1e4);if(arguments.length>0&&arguments[0]instanceof e)i=arguments[0];else{if(!this.settings.$target||!!/body/i.test(this.settings.$target.selector))return!1;i=this.settings.$target}if(i.length<1)return t.console&&console.error("element not valid",i),!1;n=e(this.settings.template.expose),this.settings.$body.append(n),n.css({top:i.offset().top,left:i.offset().left,width:this.outerWidth(i,!0),height:this.outerHeight(i,!0)}),r=e(this.settings.template.exposeCover),s={zIndex:i.css("z-index"),position:i.css("position")},o=i.attr("class")==null?"":i.attr("class"),i.css("z-index",parseInt(n.css("z-index"))+1),s.position=="static"&&i.css("position","relative"),i.data("expose-css",s),i.data("orig-class",o),i.attr("class",o+" "+this.settings.exposeAddClass),r.css({top:i.offset().top,left:i.offset().left,width:this.outerWidth(i,!0),height:this.outerHeight(i,!0)}),this.settings.$body.append(r),n.addClass(u),r.addClass(u),i.data("expose",u),this.settings.postExposeCallback(this.settings.$li.index(),this.settings.$next_tip,i),this.add_exposed(i)},un_expose:function(){var n,r,i,s,o,u=!1;if(arguments.length>0&&arguments[0]instanceof e)r=arguments[0];else{if(!this.settings.$target||!!/body/i.test(this.settings.$target.selector))return!1;r=this.settings.$target}if(r.length<1)return t.console&&console.error("element not valid",r),!1;n=r.data("expose"),i=e("."+n),arguments.length>1&&(u=arguments[1]),u===!0?e(".joyride-expose-wrapper,.joyride-expose-cover").remove():i.remove(),s=r.data("expose-css"),s.zIndex=="auto"?r.css("z-index",""):r.css("z-index",s.zIndex),s.position!=r.css("position")&&(s.position=="static"?r.css("position",""):r.css("position",s.position)),o=r.data("orig-class"),r.attr("class",o),r.removeData("orig-classes"),r.removeData("expose"),r.removeData("expose-z-index"),this.remove_exposed(r)},add_exposed:function(t){this.settings.exposed=this.settings.exposed||[],t instanceof e||typeof t=="object"?this.settings.exposed.push(t[0]):typeof t=="string"&&this.settings.exposed.push(t)},remove_exposed:function(t){var n,r;t instanceof e?n=t[0]:typeof t=="string"&&(n=t),this.settings.exposed=this.settings.exposed||[],r=this.settings.exposed.length;for(var i=0;i<r;i++)if(this.settings.exposed[i]==n){this.settings.exposed.splice(i,1);return}},center:function(){var n=e(t);return this.settings.$next_tip.css({top:(n.height()-this.outerHeight(this.settings.$next_tip))/2+n.scrollTop(),left:(n.width()-this.outerWidth(this.settings.$next_tip))/2+this.scrollLeft(n)}),!0},bottom:function(){return/bottom/i.test(this.settings.tipSettings.tipLocation)},top:function(){return/top/i.test(this.settings.tipSettings.tipLocation)},right:function(){return/right/i.test(this.settings.tipSettings.tipLocation)},left:function(){return/left/i.test(this.settings.tipSettings.tipLocation)},corners:function(n){var r=e(t),i=r.height()/2,s=Math.ceil(this.settings.$target.offset().top-i+this.settings.$next_tip.outerHeight()),o=r.width()+this.scrollLeft(r),u=r.height()+s,a=r.height()+r.scrollTop(),f=r.scrollTop();return s<f&&(s<0?f=0:f=s),u>a&&(a=u),[n.offset().top<f,o<n.offset().left+n.outerWidth(),a<n.offset().top+n.outerHeight(),this.scrollLeft(r)>n.offset().left]},visible:function(e){var t=e.length;while(t--)if(e[t])return!1;return!0},nub_position:function(e,t,n){t==="auto"?e.addClass(n):e.addClass(t)},startTimer:function(){this.settings.$li.length?this.settings.automate=setTimeout(function(){this.hide(),this.show(),this.startTimer()}.bind(this),this.settings.timer):clearTimeout(this.settings.automate)},end:function(){this.settings.cookieMonster&&e.cookie(this.settings.cookieName,"ridden",{expires:this.settings.cookieExpires,domain:this.settings.cookieDomain}),this.settings.timer>0&&clearTimeout(this.settings.automate),this.settings.modal&&this.settings.expose&&this.un_expose(),this.settings.$next_tip.data("closed",!0),e(".joyride-modal-bg").hide(),this.settings.$current_tip.hide(),this.settings.postStepCallback(this.settings.$li.index(),this.settings.$current_tip),this.settings.postRideCallback(this.settings.$li.index(),this.settings.$current_tip),e(".joyride-tip-guide").remove()},outerHTML:function(e){return e.outerHTML||(new XMLSerializer).serializeToString(e)},off:function(){e(this.scope).off(".joyride"),e(t).off(".joyride"),e(".joyride-close-tip, .joyride-next-tip, .joyride-modal-bg").off(".joyride"),e(".joyride-tip-guide, .joyride-modal-bg").remove(),clearTimeout(this.settings.automate),this.settings={}},reflow:function(){}}}(Foundation.zj,this,this.document),function(e,t,n,r){"use strict";var i=function(){},s=function(i,s){if(i.hasClass(s.slides_container_class))return this;var f=this,l,c=i,h,p,d,v=0,m,g,y=!1,b=!1;c.children().first().addClass(s.active_slide_class),f.update_slide_number=function(t){s.slide_number&&(h.find("span:first").text(parseInt(t)+1),h.find("span:last").text(c.children().length)),s.bullets&&(p.children().removeClass(s.bullets_active_class),e(p.children().get(t)).addClass(s.bullets_active_class))},f.build_markup=function(){c.wrap('<div class="'+s.container_class+'"></div>'),l=c.parent(),c.addClass(s.slides_container_class),s.navigation_arrows&&(l.append(e("<a>").addClass(s.prev_class).append("<span>")),l.append(e("<a>").addClass(s.next_class).append("<span>"))),s.timer&&(d=e("<div>").addClass(s.timer_container_class),d.append("<span>"),d.append(e("<div>").addClass(s.timer_progress_class)),d.addClass(s.timer_paused_class),l.append(d)),s.slide_number&&(h=e("<div>").addClass(s.slide_number_class),h.append("<span></span> of <span></span>"),l.append(h)),s.bullets&&(p=e("<ol>").addClass(s.bullets_container_class),l.append(p),c.children().each(function(t,n){var r=e("<li>").attr("data-orbit-slide",t);p.append(r)})),s.stack_on_small&&l.addClass(s.stack_on_small_class),f.update_slide_number(0)},f._goto=function(t,n){if(t===v)return!1;typeof g=="object"&&g.restart();var r=c.children(),i="next";y=!0,t<v&&(i="prev"),t>=r.length?t=0:t<0&&(t=r.length-1);var o=e(r.get(v)),u=e(r.get(t));o.css("zIndex",2),u.css("zIndex",4).addClass("active"),c.trigger("orbit:before-slide-change"),s.before_slide_change();var a=function(){var e=function(){v=t,y=!1,n===!0&&(g=f.create_timer(),g.start()),f.update_slide_number(v),c.trigger("orbit:after-slide-change",[{slide_number:v,total_slides:r.length}]),s.after_slide_change(v,r.length)};c.height()!=u.height()?c.animate({height:u.height()},250,"linear",e):e()};if(r.length===1)return a(),!1;var l=function(){i==="next"&&m.next(o,u,a),i==="prev"&&m.prev(o,u,a)};u.height()>c.height()?c.animate({height:u.height()},250,"linear",l):l()},
f.next=function(e){e.stopImmediatePropagation(),e.preventDefault(),f._goto(v+1)},f.prev=function(e){e.stopImmediatePropagation(),e.preventDefault(),f._goto(v-1)},f.link_custom=function(t){t.preventDefault();var n=e(this).attr("data-orbit-link");if(typeof n=="string"&&(n=e.trim(n))!=""){var r=l.find("[data-orbit-slide="+n+"]");r.index()!=-1&&f._goto(r.index())}},f.link_bullet=function(t){var n=e(this).attr("data-orbit-slide");typeof n=="string"&&(n=e.trim(n))!=""&&f._goto(n)},f.timer_callback=function(){f._goto(v+1,!0)},f.compute_dimensions=function(){var t=e(c.children().get(v)),n=t.height();s.variable_height||c.children().each(function(){e(this).height()>n&&(n=e(this).height())}),c.height(n)},f.create_timer=function(){var e=new o(l.find("."+s.timer_container_class),s,f.timer_callback);return e},f.stop_timer=function(){typeof g=="object"&&g.stop()},f.toggle_timer=function(){var e=l.find("."+s.timer_container_class);e.hasClass(s.timer_paused_class)?(typeof g=="undefined"&&(g=f.create_timer()),g.start()):typeof g=="object"&&g.stop()},f.init=function(){f.build_markup(),s.timer&&(g=f.create_timer(),g.start()),m=new a(c),s.animation==="slide"&&(m=new u(c)),l.on("click","."+s.next_class,f.next),l.on("click","."+s.prev_class,f.prev),l.on("click","[data-orbit-slide]",f.link_bullet),l.on("click",f.toggle_timer),l.on("touchstart.fndtn.orbit",function(e){e.touches||(e=e.originalEvent);var t={start_page_x:e.touches[0].pageX,start_page_y:e.touches[0].pageY,start_time:(new Date).getTime(),delta_x:0,is_scrolling:r};l.data("swipe-transition",t),e.stopPropagation()}).on("touchmove.fndtn.orbit",function(e){e.touches||(e=e.originalEvent);if(e.touches.length>1||e.scale&&e.scale!==1)return;var t=l.data("swipe-transition");typeof t=="undefined"&&(t={}),t.delta_x=e.touches[0].pageX-t.start_page_x,typeof t.is_scrolling=="undefined"&&(t.is_scrolling=!!(t.is_scrolling||Math.abs(t.delta_x)<Math.abs(e.touches[0].pageY-t.start_page_y)));if(!t.is_scrolling&&!t.active){e.preventDefault();var n=t.delta_x<0?v+1:v-1;t.active=!0,f._goto(n)}}).on("touchend.fndtn.orbit",function(e){l.data("swipe-transition",{}),e.stopPropagation()}).on("mouseenter.fndtn.orbit",function(e){s.timer&&s.pause_on_hover&&f.stop_timer()}).on("mouseleave.fndtn.orbit",function(e){s.timer&&s.resume_on_mouseout&&g.start()}),e(n).on("click","[data-orbit-link]",f.link_custom),e(t).on("resize",f.compute_dimensions),e(t).on("load",f.compute_dimensions),c.trigger("orbit:ready")},f.init()},o=function(e,t,n){var r=this,i=t.timer_speed,s=e.find("."+t.timer_progress_class),o,u,a=-1;this.update_progress=function(e){var t=s.clone();t.attr("style",""),t.css("width",e+"%"),s.replaceWith(t),s=t},this.restart=function(){clearTimeout(u),e.addClass(t.timer_paused_class),a=-1,r.update_progress(0)},this.start=function(){if(!e.hasClass(t.timer_paused_class))return!0;a=a===-1?i:a,e.removeClass(t.timer_paused_class),o=(new Date).getTime(),s.animate({width:"100%"},a,"linear"),u=setTimeout(function(){r.restart(),n()},a),e.trigger("orbit:timer-started")},this.stop=function(){if(e.hasClass(t.timer_paused_class))return!0;clearTimeout(u),e.addClass(t.timer_paused_class);var n=(new Date).getTime();a-=n-o;var s=100-a/i*100;r.update_progress(s),e.trigger("orbit:timer-stopped")}},u=function(t){var n=400,r=e("html[dir=rtl]").length===1,i=r?"marginRight":"marginLeft";this.next=function(e,t,r){t.animate({margin:"0%"},n,"linear",function(){e.css(i,"100%"),r()})},this.prev=function(e,t,r){t.css(i,"-100%"),t.animate({margin:"0%"},n,"linear",function(){e.css(i,"100%"),r()})}},a=function(e){var t=250;this.next=function(e,n,r){n.css({marginLeft:"0%",opacity:"0.01"}),n.animate({opacity:"1"},t,"linear",function(){e.css("marginLeft","100%"),r()})},this.prev=function(e,n,r){n.css({marginLeft:"0%",opacity:"0.01"}),n.animate({opacity:"1"},t,"linear",function(){e.css("marginLeft","100%"),r()})}};Foundation.libs=Foundation.libs||{},Foundation.libs.orbit={name:"orbit",version:"4.3.1",settings:{animation:"slide",timer_speed:1e4,pause_on_hover:!0,resume_on_mouseout:!1,animation_speed:500,stack_on_small:!1,navigation_arrows:!0,slide_number:!0,container_class:"orbit-container",stack_on_small_class:"orbit-stack-on-small",next_class:"orbit-next",prev_class:"orbit-prev",timer_container_class:"orbit-timer",timer_paused_class:"paused",timer_progress_class:"orbit-progress",slides_container_class:"orbit-slides-container",bullets_container_class:"orbit-bullets",bullets_active_class:"active",slide_number_class:"orbit-slide-number",caption_class:"orbit-caption",active_slide_class:"active",orbit_transition_class:"orbit-transitioning",bullets:!0,timer:!0,variable_height:!1,before_slide_change:i,after_slide_change:i},init:function(t,n,r){var i=this;Foundation.inherit(i,"data_options"),typeof n=="object"&&e.extend(!0,i.settings,n);if(e(t).is("[data-orbit]")){var o=e(t),u=i.data_options(o);new s(o,e.extend({},i.settings,u))}e("[data-orbit]",t).each(function(t,n){var r=e(n),o=i.data_options(r);new s(r,e.extend({},i.settings,o))})}}}(Foundation.zj,this,this.document),function(e,t,n){"use strict";Foundation.libs.section={name:"section",version:"4.3.1",settings:{deep_linking:!1,small_breakpoint:768,one_up:!0,section_selector:"[data-section]",region_selector:"section, .section, [data-section-region]",title_selector:".title, [data-section-title]",resized_data_attr:"data-section-resized",small_style_data_attr:"data-section-small-style",content_selector:".content, [data-section-content]",nav_selector:'[data-section="vertical-nav"], [data-section="horizontal-nav"]',active_class:"active",callback:function(){}},init:function(t,n,r){var i=this;return Foundation.inherit(this,"throttle data_options position_right offset_right"),typeof n=="object"&&e.extend(!0,i.settings,n),typeof n!="string"?(this.events(),!0):this[n].call(this,r)},events:function(){var r=this,i=[],s=r.settings.section_selector,o=r.settings.region_selector.split(","),u=r.settings.title_selector.split(",");for(var a=0,f=o.length;a<f;a++){var l=o[a];for(var c=0,h=u.length;c<h;c++){var p=s+">"+l+">"+u[c];i.push(p+" a"),i.push(p)}}e(r.scope).on("click.fndtn.section",i.join(","),function(t){var n=e(this).closest(r.settings.title_selector);r.close_navs(n),n.siblings(r.settings.content_selector).length>0&&r.toggle_active.call(n[0],t)}),e(t).on("resize.fndtn.section",r.throttle(function(){r.resize()},30)).on("hashchange.fndtn.section",r.set_active_from_hash),e(n).on("click.fndtn.section",function(t){if(t.isPropagationStopped&&t.isPropagationStopped())return;if(t.target===n)return;r.close_navs(e(t.target).closest(r.settings.title_selector))}),e(t).triggerHandler("resize.fndtn.section"),e(t).triggerHandler("hashchange.fndtn.section")},close_navs:function(t){var n=Foundation.libs.section,r=e(n.settings.nav_selector).filter(function(){return!e.extend({},n.settings,n.data_options(e(this))).one_up});if(t.length>0){var i=t.parent().parent();if(n.is_horizontal_nav(i)||n.is_vertical_nav(i))r=r.filter(function(){return this!==i[0]})}r.children(n.settings.region_selector).removeClass(n.settings.active_class)},toggle_active:function(t){var n=e(this),r=Foundation.libs.section,i=n.parent(),s=n.siblings(r.settings.content_selector),o=i.parent(),u=e.extend({},r.settings,r.data_options(o)),a=o.children(r.settings.region_selector).filter("."+r.settings.active_class);!u.deep_linking&&s.length>0&&t.preventDefault(),t.stopPropagation(),i.hasClass(r.settings.active_class)?!u.one_up&&(r.small(o)||r.is_vertical_nav(o)||r.is_horizontal_nav(o)||r.is_accordion(o))&&i.removeClass(r.settings.active_class):(a.removeClass(r.settings.active_class),i.addClass(r.settings.active_class),r.resize(i.find(r.settings.section_selector).not("["+r.settings.resized_data_attr+"]"),!0)),u.callback(o)},check_resize_timer:null,resize:function(t,r){var i=Foundation.libs.section,s=i.small(e(n)),o=function(e,t){return!i.is_accordion(e)&&!e.is("["+i.settings.resized_data_attr+"]")&&(!s||i.is_horizontal_tabs(e))&&t===(e.css("display")==="none"||!e.parent().is(":visible"))};t=t||e(i.settings.section_selector),clearTimeout(i.check_resize_timer),s||t.removeAttr(i.settings.small_style_data_attr),t.filter(function(){return o(e(this),!1)}).each(function(){var t=e(this),n=t.children(i.settings.region_selector),s=n.children(i.settings.title_selector),o=n.children(i.settings.content_selector),u=0;if(r&&t.children(i.settings.region_selector).filter("."+i.settings.active_class).length==0){var a=e.extend({},i.settings,i.data_options(t));!a.deep_linking&&(a.one_up||!i.is_horizontal_nav(t)&&!i.is_vertical_nav(t)&&!i.is_accordion(t))&&n.filter(":visible").first().addClass(i.settings.active_class)}if(i.is_horizontal_tabs(t)||i.is_auto(t)){var f=0;s.each(function(){var t=e(this);if(t.is(":visible")){t.css(i.rtl?"right":"left",f);var n=parseInt(t.css("border-"+(i.rtl?"left":"right")+"-width"),10);n.toString()==="Nan"&&(n=0),f+=i.outerWidth(t)-n,u=Math.max(u,i.outerHeight(t))}}),s.css("height",u),n.each(function(){var t=e(this),n=t.children(i.settings.content_selector),r=parseInt(n.css("border-top-width"),10);r.toString()==="Nan"&&(r=0),t.css("padding-top",u-r)}),t.css("min-height",u)}else if(i.is_horizontal_nav(t)){var l=!0;s.each(function(){u=Math.max(u,i.outerHeight(e(this)))}),n.each(function(){var n=e(this);n.css("margin-left","-"+(l?t:n.children(i.settings.title_selector)).css("border-left-width")),l=!1}),n.css("margin-top","-"+t.css("border-top-width")),s.css("height",u),o.css("top",u),t.css("min-height",u)}else if(i.is_vertical_tabs(t)){var c=0;s.each(function(){var t=e(this);if(t.is(":visible")){t.css("top",c);var n=parseInt(t.css("border-top-width"),10);n.toString()==="Nan"&&(n=0),c+=i.outerHeight(t)-n}}),o.css("min-height",c+1)}else if(i.is_vertical_nav(t)){var h=0,p=!0;s.each(function(){h=Math.max(h,i.outerWidth(e(this)))}),n.each(function(){var n=e(this);n.css("margin-top","-"+(p?t:n.children(i.settings.title_selector)).css("border-top-width")),p=!1}),s.css("width",h),o.css(i.rtl?"right":"left",h),t.css("width",h)}t.attr(i.settings.resized_data_attr,!0)}),e(i.settings.section_selector).filter(function(){return o(e(this),!0)}).length>0&&(i.check_resize_timer=setTimeout(function(){i.resize(t.filter(function(){return o(e(this),!1)}),!0)},700)),s&&t.attr(i.settings.small_style_data_attr,!0)},is_vertical_nav:function(e){return/vertical-nav/i.test(e.data("section"))},is_horizontal_nav:function(e){return/horizontal-nav/i.test(e.data("section"))},is_accordion:function(e){return/accordion/i.test(e.data("section"))},is_horizontal_tabs:function(e){return/^tabs$/i.test(e.data("section"))},is_vertical_tabs:function(e){return/vertical-tabs/i.test(e.data("section"))},is_auto:function(e){var t=e.data("section");return t===""||/auto/i.test(t)},set_active_from_hash:function(){var n=Foundation.libs.section,r=t.location.hash.substring(1),i=e(n.settings.section_selector);i.each(function(){var t=e(this),i=e.extend({},n.settings,n.data_options(t)),s=t.children(n.settings.region_selector),o=i.deep_linking&&r.length>0,u=!1;s.each(function(){var t=e(this);if(u)t.removeClass(n.settings.active_class);else if(o){var i=t.children(n.settings.content_selector).data("slug");i&&(new RegExp(i,"i")).test(r)?(t.hasClass(n.settings.active_class)||t.addClass(n.settings.active_class),u=!0):t.removeClass(n.settings.active_class)}else t.hasClass(n.settings.active_class)&&(u=!0)}),!u&&!i.deep_linking&&(i.one_up||!n.is_horizontal_nav(t)&&!n.is_vertical_nav(t)&&!n.is_accordion(t))&&s.filter(":visible").first().addClass(n.settings.active_class)})},reflow:function(){var t=Foundation.libs.section;e(t.settings.section_selector).removeAttr(t.settings.resized_data_attr),t.throttle(function(){t.resize()},30)()},small:function(t){var n=e.extend({},this.settings,this.data_options(t));return this.is_horizontal_tabs(t)?!1:t&&this.is_accordion(t)?!0:e("html").hasClass("lt-ie9")?!0:e("html").hasClass("ie8compat")?!0:e(this.scope).width()<n.small_breakpoint},off:function(){e(this.scope).off(".fndtn.section"),e(t).off(".fndtn.section"),e(n).off(".fndtn.section")}},e.fn.reflow_section=function(e){var t=this,n=Foundation.libs.section;return t.removeAttr(n.settings.resized_data_attr),n.throttle(function(){n.resize(t,e)},30)(),this}}(Foundation.zj,window,document),function(e,t,n,r){"use strict";Foundation.libs.topbar={name:"topbar",version:"4.3.1",settings:{index:0,stickyClass:"sticky",custom_back_text:!0,back_text:"Back",is_hover:!0,mobile_show_parent_link:!0,scrolltop:!0,init:!1},init:function(n,r,i){Foundation.inherit(this,"data_options");var s=this;return typeof r=="object"?e.extend(!0,this.settings,r):typeof i!="undefined"&&e.extend(!0,this.settings,i),typeof r!="string"?(e(".top-bar, [data-topbar]").each(function(){e.extend(!0,s.settings,s.data_options(e(this))),s.settings.$w=e(t),s.settings.$topbar=e(this),s.settings.$section=s.settings.$topbar.find("section"),s.settings.$titlebar=s.settings.$topbar.children("ul").first(),s.settings.$topbar.data("index",0);var n=e("<div class='top-bar-js-breakpoint'/>").insertAfter(s.settings.$topbar);s.settings.breakPoint=n.width(),n.remove(),s.assemble(),s.settings.is_hover&&s.settings.$topbar.find(".has-dropdown").addClass("not-click"),s.settings.$topbar.parent().hasClass("fixed")&&e("body").css("padding-top",s.outerHeight(s.settings.$topbar))}),s.settings.init||this.events(),this.settings.init):this[r].call(this,i)},timer:null,events:function(){var n=this,r=this.outerHeight(e(".top-bar, [data-topbar]"));e(this.scope).off(".fndtn.topbar").on("click.fndtn.topbar",".top-bar .toggle-topbar, [data-topbar] .toggle-topbar",function(i){var s=e(this).closest(".top-bar, [data-topbar]"),o=s.find("section, .section"),u=s.children("ul").first();i.preventDefault(),n.breakpoint()&&(n.rtl?(o.css({right:"0%"}),o.find(">.name").css({right:"100%"})):(o.css({left:"0%"}),o.find(">.name").css({left:"100%"})),o.find("li.moved").removeClass("moved"),s.data("index",0),s.toggleClass("expanded").css("height","")),s.hasClass("expanded")?s.parent().hasClass("fixed")&&(s.parent().removeClass("fixed"),s.addClass("fixed"),e("body").css("padding-top","0"),n.settings.scrolltop&&t.scrollTo(0,0)):s.hasClass("fixed")&&(s.parent().addClass("fixed"),s.removeClass("fixed"),e("body").css("padding-top",r))}).on("click.fndtn.topbar",".top-bar li.has-dropdown",function(t){if(n.breakpoint())return;var r=e(this),i=e(t.target),s=r.closest("[data-topbar], .top-bar"),o=s.data("topbar");if(n.settings.is_hover&&!Modernizr.touch)return;t.stopImmediatePropagation(),i[0].nodeName==="A"&&i.parent().hasClass("has-dropdown")&&t.preventDefault(),r.hasClass("hover")?r.removeClass("hover").find("li").removeClass("hover"):r.addClass("hover")}).on("click.fndtn.topbar",".top-bar .has-dropdown>a, [data-topbar] .has-dropdown>a",function(t){if(n.breakpoint()){t.preventDefault();var r=e(this),i=r.closest(".top-bar, [data-topbar]"),s=i.find("section, .section"),o=i.children("ul").first(),u=r.next(".dropdown").outerHeight(),a=r.closest("li");i.data("index",i.data("index")+1),a.addClass("moved"),n.rtl?(s.css({right:-(100*i.data("index"))+"%"}),s.find(">.name").css({right:100*i.data("index")+"%"})):(s.css({left:-(100*i.data("index"))+"%"}),s.find(">.name").css({left:100*i.data("index")+"%"})),i.css("height",n.outerHeight(r.siblings("ul"),!0)+n.height(o))}}),e(t).on("resize.fndtn.topbar",function(){n.breakpoint()||e(".top-bar, [data-topbar]").css("height","").removeClass("expanded").find("li").removeClass("hover")}.bind(this)),e("body").on("click.fndtn.topbar",function(t){var n=e(t.target).closest("[data-topbar], .top-bar");if(n.length>0)return;e(".top-bar li, [data-topbar] li").removeClass("hover")}),e(this.scope).on("click.fndtn",".top-bar .has-dropdown .back, [data-topbar] .has-dropdown .back",function(t){t.preventDefault();var r=e(this),i=r.closest(".top-bar, [data-topbar]"),s=i.children("ul").first(),o=i.find("section, .section"),u=r.closest("li.moved"),a=u.parent();i.data("index",i.data("index")-1),n.rtl?(o.css({right:-(100*i.data("index"))+"%"}),o.find(">.name").css({right:100*i.data("index")+"%"})):(o.css({left:-(100*i.data("index"))+"%"}),o.find(">.name").css({left:100*i.data("index")+"%"})),i.data("index")===0?i.css("height",""):i.css("height",n.outerHeight(a,!0)+n.height(s)),setTimeout(function(){u.removeClass("moved")},300)})},breakpoint:function(){return e(n).width()<=this.settings.breakPoint||e("html").hasClass("lt-ie9")},assemble:function(){var t=this;this.settings.$section.detach(),this.settings.$section.find(".has-dropdown>a").each(function(){var n=e(this),r=n.siblings(".dropdown"),i=n.attr("href");if(t.settings.mobile_show_parent_link&&i&&i.length>1)var s=e('<li class="title back js-generated"><h5><a href="#"></a></h5></li><li><a class="parent-link js-generated" href="'+i+'">'+n.text()+"</a></li>");else var s=e('<li class="title back js-generated"><h5><a href="#"></a></h5></li>');t.settings.custom_back_text==1?s.find("h5>a").html("&laquo; "+t.settings.back_text):s.find("h5>a").html("&laquo; "+n.html()),r.prepend(s)}),this.settings.$section.appendTo(this.settings.$topbar),this.sticky()},height:function(t){var n=0,r=this;return t.find("> li").each(function(){n+=r.outerHeight(e(this),!0)}),n},sticky:function(){var n="."+this.settings.stickyClass;if(e(n).length>0){var r=e(n).length?e(n).offset().top:0,i=e(t),s=this.outerHeight(e(".top-bar")),o;e(t).resize(function(){clearTimeout(o),o=setTimeout(function(){r=e(n).offset().top},105)}),i.scroll(function(){i.scrollTop()>r?(e(n).addClass("fixed"),e("body").css("padding-top",s)):i.scrollTop()<=r&&(e(n).removeClass("fixed"),e("body").css("padding-top","0"))})}},off:function(){e(this.scope).off(".fndtn.topbar"),e(t).off(".fndtn.topbar")},reflow:function(){}}}(Foundation.zj,this,this.document);

/* Zepto v1.0-1-ga3cab6c - polyfill zepto detect event ajax form fx - zeptojs.com/license */


;(function(undefined){
  if (String.prototype.trim === undefined) // fix for iOS 3.2
    String.prototype.trim = function(){ return this.replace(/^\s+|\s+$/g, '') }

  // For iOS 3.x
  // from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
  if (Array.prototype.reduce === undefined)
    Array.prototype.reduce = function(fun){
      if(this === void 0 || this === null) throw new TypeError()
      var t = Object(this), len = t.length >>> 0, k = 0, accumulator
      if(typeof fun != 'function') throw new TypeError()
      if(len == 0 && arguments.length == 1) throw new TypeError()

      if(arguments.length >= 2)
       accumulator = arguments[1]
      else
        do{
          if(k in t){
            accumulator = t[k++]
            break
          }
          if(++k >= len) throw new TypeError()
        } while (true)

      while (k < len){
        if(k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t)
        k++
      }
      return accumulator
    }

})()

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    getComputedStyle = document.defaultView.getComputedStyle,
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]*)$/,
    tagSelectorRE = /^[\w-]+$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div')

  zepto.matches = function(element, selector) {
    if (!element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && obj.__proto__ == Object.prototype
  }
  function isArray(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
    if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
    if (!(name in containers)) name = '*'

    var nodes, dom, container = containers[name]
    container.innerHTML = '' + html
    dom = $.each(slice.call(container.childNodes), function(){
      container.removeChild(this)
    })
    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }
    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, juts return it
    else if (zepto.isZ(selector)) return selector
    else {
      var dom
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes. If a plain object is given, duplicate it.
      else if (isObject(selector))
        dom = [isPlainObject(selector) ? $.extend({}, selector) : selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
      // create a new Zepto collection from the nodes found
      return zepto.Z(dom, selector)
    }
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found
    return (isDocument(element) && idSelectorRE.test(selector)) ?
      ( (found = element.getElementById(RegExp.$1)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
        tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
        element.querySelectorAll(selector)
      )
  }

  function filtered(nodes, selector) {
    return selector === undefined ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = function(parent, node) {
    return parent !== node && parent.contains(node)
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className,
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) { return str.trim() }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      if (readyRE.test(document.readyState)) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = null)
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return html === undefined ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return text === undefined ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
      return (value === undefined) ?
        (this[0] && this[0][name]) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + dasherize(name), value)
      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return (value === undefined) ?
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(o){ return this.selected }).pluck('value') :
           this[0].value)
        ) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2 && typeof property == 'string')
        return this[0] && (this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property))

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      return this.each(function(idx){
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(){
      if (!this.length) return
      return ('scrollTop' in this[0]) ? this[0].scrollTop : this[0].scrollY
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    $.fn[dimension] = function(value){
      var offset, el = this[0],
        Dimension = dimension.replace(/./, function(m){ return m[0].toUpperCase() })
      if (value === undefined) return isWindow(el) ? el['inner' + Dimension] :
        isDocument(el) ? el.documentElement['offset' + Dimension] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          traverseNode(parent.insertBefore(node, target), function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
'$' in window || (window.$ = Zepto)

;(function($){
  function detect(ua){
    var os = this.os = {}, browser = this.browser = {},
      webkit = ua.match(/WebKit\/([\d.]+)/),
      android = ua.match(/(Android)\s+([\d.]+)/),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
      bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
      rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
      playbook = ua.match(/PlayBook/),
      chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
      firefox = ua.match(/Firefox\/([\d.]+)/)

    // Todo: clean this up with a better OS/browser seperation:
    // - discern (more) between multiple browsers on android
    // - decide if kindle fire in silk mode is android or not
    // - Firefox on Android doesn't specify the Android version
    // - possibly devide in os, device and browser hashes

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (bb10) os.bb10 = true, os.version = bb10[2]
    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
    if (playbook) browser.playbook = true
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
    if (chrome) browser.chrome = true, browser.version = chrome[1]
    if (firefox) browser.firefox = true, browser.version = firefox[1]

    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) || (firefox && ua.match(/Tablet/)))
    os.phone  = !!(!os.tablet && (android || iphone || webos || blackberry || bb10 ||
      (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) || (firefox && ua.match(/Mobile/))))
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)

;(function($){
  var $$ = $.zepto.qsa, handlers = {}, _zid = 1, specialEvents={},
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eachEvent(events, fn, iterator){
    if ($.type(events) != "string") $.each(events, iterator)
    else events.split(/\s/).forEach(function(type){ iterator(type, fn) })
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (handler.e == 'focus' || handler.e == 'blur') ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || type
  }

  function add(element, events, fn, selector, getDelegate, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    eachEvent(events, fn, function(event, fn){
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = getDelegate && getDelegate(fn, event)
      var callback  = handler.del || fn
      handler.proxy = function (e) {
        var result = callback.apply(element, [e].concat(e.data))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    eachEvent(events || '', fn, function(event, fn){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if ($.isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (typeof context == 'string') {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, callback){
    return this.each(function(){
      add(this, event, callback)
    })
  }
  $.fn.unbind = function(event, callback){
    return this.each(function(){
      remove(this, event, callback)
    })
  }
  $.fn.one = function(event, callback){
    return this.each(function(i, element){
      add(this, event, callback, null, function(fn, type){
        return function(){
          var result = fn.apply(element, arguments)
          remove(element, type, fn)
          return result
        }
      })
    })
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }
  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    $.each(eventMethods, function(name, predicate) {
      proxy[name] = function(){
        this[predicate] = returnTrue
        return event[name].apply(event, arguments)
      }
      proxy[predicate] = returnFalse
    })
    return proxy
  }

  // emulates the 'defaultPrevented' property for browsers that have none
  function fix(event) {
    if (!('defaultPrevented' in event)) {
      event.defaultPrevented = false
      var prevent = event.preventDefault
      event.preventDefault = function() {
        this.defaultPrevented = true
        prevent.call(this)
      }
    }
  }

  $.fn.delegate = function(selector, event, callback){
    return this.each(function(i, element){
      add(element, event, callback, selector, function(fn){
        return function(e){
          var evt, match = $(e.target).closest(selector, element).get(0)
          if (match) {
            evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
            return fn.apply(match, [evt].concat([].slice.call(arguments, 1)))
          }
        }
      })
    })
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, callback){
    return !selector || $.isFunction(selector) ?
      this.bind(event, selector || callback) : this.delegate(selector, event, callback)
  }
  $.fn.off = function(event, selector, callback){
    return !selector || $.isFunction(selector) ?
      this.unbind(event, selector || callback) : this.undelegate(selector, event, callback)
  }

  $.fn.trigger = function(event, data){
    if (typeof event == 'string' || $.isPlainObject(event)) event = $.Event(event)
    fix(event)
    event.data = data
    return this.each(function(){
      // items in the collection might not be DOM elements
      // (todo: possibly support events on plain old objects)
      if('dispatchEvent' in this) this.dispatchEvent(event)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, data){
    var e, result
    this.each(function(i, element){
      e = createProxy(typeof event == 'string' ? $.Event(event) : event)
      e.data = data
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

  $.Event = function(type, props) {
    if (typeof type != 'string') props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
    event.isDefaultPrevented = function(){ return this.defaultPrevented }
    return event
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.defaultPrevented
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options){
    if (!('type' in options)) return $.ajax(options)

    var callbackName = 'jsonp' + (++jsonpID),
      script = document.createElement('script'),
      cleanup = function() {
        clearTimeout(abortTimeout)
        $(script).remove()
        delete window[callbackName]
      },
      abort = function(type){
        cleanup()
        // In case of manual abort or timeout, keep an empty function as callback
        // so that the SCRIPT tag that eventually loads won't result in an error.
        if (!type || type == 'timeout') window[callbackName] = empty
        ajaxError(null, type || 'abort', xhr, options)
      },
      xhr = { abort: abort }, abortTimeout

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return false
    }

    window[callbackName] = function(data){
      cleanup()
      ajaxSuccess(data, xhr, options)
    }

    script.onerror = function() { abort('error') }

    script.src = options.url.replace(/=\?/, '=' + callbackName)
    $('head').append(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    accepts: {
      script: 'text/javascript, application/javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true,
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data)
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {})
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)
    if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

    var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
      return $.ajaxJSONP(settings)
    }

    var mime = settings.accepts[dataType],
        baseHeaders = { },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(), abortTimeout

    if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
    if (mime) {
      baseHeaders['Accept'] = mime
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
    settings.headers = $.extend(baseHeaders, settings.headers || {})

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty;
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings)
          else ajaxSuccess(result, xhr, settings)
        } else {
          ajaxError(null, xhr.status ? 'error' : 'abort', xhr, settings)
        }
      }
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async)

    for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      return false
    }

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    var hasData = !$.isFunction(data)
    return {
      url:      url,
      data:     hasData  ? data : undefined,
      success:  !hasData ? data : $.isFunction(success) ? success : undefined,
      dataType: hasData  ? dataType || success : success
    }
  }

  $.get = function(url, data, success, dataType){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(url, data, success, dataType){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(url, data, success){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function ($) {
  $.fn.serializeArray = function () {
    var result = [], el
    $( Array.prototype.slice.call(this.get(0).elements) ).each(function () {
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function () {
    var result = []
    this.serializeArray().forEach(function (elm) {
      result.push( encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value) )
    })
    return result.join('&')
  }

  $.fn.submit = function (callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.defaultPrevented) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    transform,
    transitionProperty, transitionDuration, transitionTiming,
    animationName, animationDuration, animationTiming,
    cssReset = {}

  function dasherize(str) { return downcase(str.replace(/([a-z])([A-Z])/, '$1-$2')) }
  function downcase(str) { return str.toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : downcase(name) }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + downcase(vendor) + '-'
      eventPrefix = event
      return false
    }
  })

  transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] =
  cssReset[transitionDuration = prefix + 'transition-duration'] =
  cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
  cssReset[animationName      = prefix + 'animation-name'] =
  cssReset[animationDuration  = prefix + 'animation-duration'] =
  cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback){
    if ($.isPlainObject(duration))
      ease = duration.easing, callback = duration.complete, duration = duration.duration
    if (duration) duration = (typeof duration == 'number' ? duration :
                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    return this.anim(properties, duration, ease, callback)
  }

  $.fn.anim = function(properties, duration, ease, callback){
    var key, cssValues = {}, cssProperties, transforms = '',
        that = this, wrappedCallback, endEvent = $.fx.transitionEnd

    if (duration === undefined) duration = 0.4
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    } else {
      cssProperties = []
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if (duration > 0 && typeof properties === 'object') {
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, wrappedCallback)
      }
      $(this).css(cssReset)
      callback && callback.call(this)
    }
    if (duration > 0) this.bind(endEvent, wrappedCallback)

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

    this.css(cssValues)

    if (duration <= 0) setTimeout(function() {
      that.each(function(){ wrappedCallback.call(this) })
    }, 0)

    return this
  }

  testEl = null
})(Zepto)

//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($, undefined){
  var document = window.document, docElem = document.documentElement,
    origShow = $.fn.show, origHide = $.fn.hide, origToggle = $.fn.toggle

  function anim(el, speed, opacity, scale, callback) {
    if (typeof speed == 'function' && !callback) callback = speed, speed = undefined
    var props = { opacity: opacity }
    if (scale) {
      props.scale = scale
      el.css($.fx.cssPrefix + 'transform-origin', '0 0')
    }
    return el.animate(props, speed, null, callback)
  }

  function hide(el, speed, scale, callback) {
    return anim(el, speed, 0, scale, function(){
      origHide.call($(this))
      callback && callback.call(this)
    })
  }

  $.fn.show = function(speed, callback) {
    origShow.call(this)
    if (speed === undefined) speed = 0
    else this.css('opacity', 0)
    return anim(this, speed, 1, '1,1', callback)
  }

  $.fn.hide = function(speed, callback) {
    if (speed === undefined) return origHide.call(this)
    else return hide(this, speed, '0,0', callback)
  }

  $.fn.toggle = function(speed, callback) {
    if (speed === undefined || typeof speed == 'boolean')
      return origToggle.call(this, speed)
    else return this.each(function(){
      var el = $(this)
      el[el.css('display') == 'none' ? 'show' : 'hide'](speed, callback)
    })
  }

  $.fn.fadeTo = function(speed, opacity, callback) {
    return anim(this, speed, opacity, null, callback)
  }

  $.fn.fadeIn = function(speed, callback) {
    var target = this.css('opacity')
    if (target > 0) this.css('opacity', 0)
    else target = 1
    return origShow.call(this).fadeTo(speed, target, callback)
  }

  $.fn.fadeOut = function(speed, callback) {
    return hide(this, speed, null, callback)
  }

  $.fn.fadeToggle = function(speed, callback) {
    return this.each(function(){
      var el = $(this)
      el[
        (el.css('opacity') == 0 || el.css('display') == 'none') ? 'fadeIn' : 'fadeOut'
      ](speed, callback)
    })
  }

})(Zepto)

//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var cache = [], timeout

  $.fn.remove = function(){
    return this.each(function(){
      if(this.parentNode){
        if(this.tagName === 'IMG'){
          cache.push(this)
          this.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
          if (timeout) clearTimeout(timeout)
          timeout = setTimeout(function(){ cache = [] }, 60000)
        }
        this.parentNode.removeChild(this)
      }
    })
  }
})(Zepto)

//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

// The following code is heavily inspired by jQuery's $.fn.data()

;(function($) {
  var data = {}, dataAttr = $.fn.data, camelize = $.camelCase,
    exp = $.expando = 'Zepto' + (+new Date())

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node, name) {
    var id = node[exp], store = id && data[id]
    if (name === undefined) return store || setData(node)
    else {
      if (store) {
        if (name in store) return store[name]
        var camelName = camelize(name)
        if (camelName in store) return store[camelName]
      }
      return dataAttr.call($(node), name)
    }
  }

  // Store value under camelized key on node
  function setData(node, name, value) {
    var id = node[exp] || (node[exp] = ++$.uuid),
      store = data[id] || (data[id] = attributeData(node))
    if (name !== undefined) store[camelize(name)] = value
    return store
  }

  // Read all "data-*" attributes from a node
  function attributeData(node) {
    var store = {}
    $.each(node.attributes, function(i, attr){
      if (attr.name.indexOf('data-') == 0)
        store[camelize(attr.name.replace('data-', ''))] =
          $.zepto.deserializeValue(attr.value)
    })
    return store
  }

  $.fn.data = function(name, value) {
    return value === undefined ?
      // set multiple values via object
      $.isPlainObject(name) ?
        this.each(function(i, node){
          $.each(name, function(key, value){ setData(node, key, value) })
        }) :
        // get value from first element
        this.length == 0 ? undefined : getData(this[0], name) :
      // set value on all elements
      this.each(function(){ setData(this, name, value) })
  }

  $.fn.removeData = function(names) {
    if (typeof names == 'string') names = names.split(/\s+/)
    return this.each(function(){
      var id = this[exp], store = id && data[id]
      if (store) $.each(names, function(){ delete store[camelize(this)] })
    })
  }
})(Zepto)

;(function($){
  var zepto = $.zepto, oldQsa = zepto.qsa, oldMatches = zepto.matches

  function visible(elem){
    elem = $(elem)
    return !!(elem.width() || elem.height()) && elem.css("display") !== "none"
  }

  // Implements a subset from:
  // http://api.jquery.com/category/selectors/jquery-selector-extensions/
  //
  // Each filter function receives the current index, all nodes in the
  // considered set, and a value if there were parentheses. The value
  // of `this` is the node currently being considered. The function returns the
  // resulting node(s), null, or undefined.
  //
  // Complex selectors are not supported:
  //   li:has(label:contains("foo")) + li:has(label:contains("bar"))
  //   ul.inner:first > li
  var filters = $.expr[':'] = {
    visible:  function(){ if (visible(this)) return this },
    hidden:   function(){ if (!visible(this)) return this },
    selected: function(){ if (this.selected) return this },
    checked:  function(){ if (this.checked) return this },
    parent:   function(){ return this.parentNode },
    first:    function(idx){ if (idx === 0) return this },
    last:     function(idx, nodes){ if (idx === nodes.length - 1) return this },
    eq:       function(idx, _, value){ if (idx === value) return this },
    contains: function(idx, _, text){ if ($(this).text().indexOf(text) > -1) return this },
    has:      function(idx, _, sel){ if (zepto.qsa(this, sel).length) return this }
  }

  var filterRe = new RegExp('(.*):(\\w+)(?:\\(([^)]+)\\))?$\\s*'),
      childRe  = /^\s*>/,
      classTag = 'Zepto' + (+new Date())

  function process(sel, fn) {
    // quote the hash in `a[href^=#]` expression
    sel = sel.replace(/=#\]/g, '="#"]')
    var filter, arg, match = filterRe.exec(sel)
    if (match && match[2] in filters) {
      filter = filters[match[2]], arg = match[3]
      sel = match[1]
      if (arg) {
        var num = Number(arg)
        if (isNaN(num)) arg = arg.replace(/^["']|["']$/g, '')
        else arg = num
      }
    }
    return fn(sel, filter, arg)
  }

  zepto.qsa = function(node, selector) {
    return process(selector, function(sel, filter, arg){
      try {
        var taggedParent
        if (!sel && filter) sel = '*'
        else if (childRe.test(sel))
          // support "> *" child queries by tagging the parent node with a
          // unique class and prepending that classname onto the selector
          taggedParent = $(node).addClass(classTag), sel = '.'+classTag+' '+sel

        var nodes = oldQsa(node, sel)
      } catch(e) {
        console.error('error performing selector: %o', selector)
        throw e
      } finally {
        if (taggedParent) taggedParent.removeClass(classTag)
      }
      return !filter ? nodes :
        zepto.uniq($.map(nodes, function(n, i){ return filter.call(n, i, nodes, arg) }))
    })
  }

  zepto.matches = function(node, selector){
    return process(selector, function(sel, filter, arg){
      return (!sel || oldMatches(node, sel)) &&
        (!filter || filter.call(node, null, arg) === node)
    })
  }
})(Zepto)

//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  $.fn.end = function(){
    return this.prevObject || $()
  }

  $.fn.andSelf = function(){
    return this.add(this.prevObject || $())
  }

  'filter,add,not,eq,first,last,find,closest,parents,parent,children,siblings'.split(',').forEach(function(property){
    var fn = $.fn[property]
    $.fn[property] = function(){
      var ret = fn.apply(this, arguments)
      ret.prevObject = this
      return ret
    }
  })
})(Zepto)

//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout,
    longTapDelay = 750, longTapTimeout

  function parentIfText(node) {
    return 'tagName' in node ? node : node.parentNode
  }

  function swipeDirection(x1, x2, y1, y2) {
    var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
    return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  $(document).ready(function(){
    var now, delta

    $(document.body)
      .bind('touchstart', function(e){
        now = Date.now()
        delta = now - (touch.last || now)
        touch.el = $(parentIfText(e.touches[0].target))
        touchTimeout && clearTimeout(touchTimeout)
        touch.x1 = e.touches[0].pageX
        touch.y1 = e.touches[0].pageY
        if (delta > 0 && delta <= 250) touch.isDoubleTap = true
        touch.last = now
        longTapTimeout = setTimeout(longTap, longTapDelay)
      })
      .bind('touchmove', function(e){
        cancelLongTap()
        touch.x2 = e.touches[0].pageX
        touch.y2 = e.touches[0].pageY
        if (Math.abs(touch.x1 - touch.x2) > 10)
          e.preventDefault()
      })
      .bind('touchend', function(e){
         cancelLongTap()

        // swipe
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

          swipeTimeout = setTimeout(function() {
            touch.el.trigger('swipe')
            touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
            touch = {}
          }, 0)

        // normal tap
        else if ('last' in touch)

          // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
          // ('tap' fires before 'scroll')
          tapTimeout = setTimeout(function() {

            // trigger universal 'tap' with the option to cancelTouch()
            // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
            var event = $.Event('tap')
            event.cancelTouch = cancelAll
            touch.el.trigger(event)

            // trigger double tap immediately
            if (touch.isDoubleTap) {
              touch.el.trigger('doubleTap')
              touch = {}
            }

            // trigger single tap after 250ms of inactivity
            else {
              touchTimeout = setTimeout(function(){
                touchTimeout = null
                touch.el.trigger('singleTap')
                touch = {}
              }, 250)
            }

          }, 0)

      })
      .bind('touchcancel', cancelAll)

    $(window).bind('scroll', cancelAll)
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m){
    $.fn[m] = function(callback){ return this.bind(m, callback) }
  })
})(Zepto)


// outer and inner height/width support
if (this.Zepto) {
  (function($) {
    var ioDim, _base;
    ioDim = function(elem, Dimension, dimension, includeBorder, includeMargin) {
      var sides, size;
      if (elem) {
        size = elem[dimension]();
        sides = {
          width: ["left", "right"],
          height: ["top", "bottom"]
        };
        sides[dimension].forEach(function(side) {
          size += parseInt(elem.css("padding-" + side), 10);
          if (includeBorder) {
            size += parseInt(elem.css("border-" + side + "-width"), 10);
          }
          if (includeMargin) {
            return size += parseInt(elem.css("margin-" + side), 10);
          }
        });
        return size;
      } else {
        return null;
      }
    };
    ["width", "height"].forEach(function(dimension) {
      var Dimension, _base, _base1, _name, _name1;
      Dimension = dimension.replace(/./, function(m) {
        return m[0].toUpperCase();
      });
      (_base = $.fn)[_name = "inner" + Dimension] || (_base[_name] = function(includeMargin) {
        return ioDim(this, Dimension, dimension, false, includeMargin);
      });
      return (_base1 = $.fn)[_name1 = "outer" + Dimension] || (_base1[_name1] = function(includeMargin) {
        return ioDim(this, Dimension, dimension, true, includeMargin);
      });
    });
    return (_base = $.fn).detach || (_base.detach = function(selector) {
      var cloned, set;
      set = this;
      if (selector != null) {
        set = set.filter(selector);
      }
      cloned = set.clone(true);
      set.remove();
      return cloned;
    });
  })(Zepto);
}
