var chromeCaster = function(config) {

    this.session = false;
    this.currentMedia = false;
    this.applicationID = false;
    this.config = config;

    this.initializeCastApi = function() {
      var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
      var apiConfig = new chrome.cast.ApiConfig(sessionRequest, this.sessionListener, this.receiverListener);
      
      chrome.cast.initialize(apiConfig, this.onInitSuccess, this.onInitError);
    };

    this.sessionListener = function(session) {
      this.session = session;
    };

    this.receiverListener = function(e) {
     if (e === chrome.cast.ReceiverAvailability.AVAILABLE) {
        this.onRecieverAvailable();

      } else if (e === chrome.cast.ReceiverAvailability.UNAVAILABLE) {
        console.log('Receiver not available');
      }
    }.bind(this);

    this.onInitSuccess = function() {
        this.config['onSenderCreated']();
    };

    this.onInitError = function(error) {
        console.log(error);
    };

    this.onRecieverAvailable = function() {
        this.config['onRecieverAvailable']();
    };

    // When user clicks cast icon, request session
    this.requestSession = function() {
      chrome.cast.requestSession(this.onRequestSessionSuccess, this.onSessionLaunchError);
    };

    this.onRequestSessionSuccess = function(session) {
      this.session = session;

      this.config.onSenderStarted(this.session);
    };

    this.onSessionLaunchError = function(error) {
      this.session = false;
    };

    this.stopApp = function() {
      this.session.stop(function() {
        this.session = false;
      }, function() {
        console.log("Could not stop session");
      });
    };

    // Controlling media object
    this.startCasting = function(currentMediaURL) {
      var mediaInfo = new chrome.cast.media.MediaInfo(currentMediaURL);
      var request = new chrome.cast.media.LoadRequest(mediaInfo);

      this.session.loadMedia(request,
        this.onMediaDiscovered.bind(this, 'loadMedia'),
        this.onMediaError);
    };

    this.onMediaDiscovered = function(how, media) {
      this.currentMedia = media;

      this.config['onMediaDiscovered'](this.media);

      media.addUpdateListener(onMediaStatusUpdate);
    };

    this.onMediaError = function(error) {
        console.log(error);
    };

    this.init = function() {
      var that = this;

      window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
        if (loaded) {
          that.initializeCastApi();
        } else {
          console.log(errorInfo);
        }
      }
    }.bind(this)();
};