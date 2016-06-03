if (annyang) {

  var scrollTextBox = function(){
        var textarea = $('#voiceQuery');
        if(textarea.length)
            textarea.scrollTop(textarea[0].scrollHeight - textarea.height());
  }

  var _notRecognizedSentence = function(sentences) {
       if (Array.isArray(sentences)) {
           sentences = sentences[0];
        }
    
        $('#voiceQuery').val($('#voiceQuery').val() +" "+sentences);
        $('#voiceQuery').css('color','#000000');
        scrollTextBox();
  }

  var _recognizedSentence = function(phrase,command) {
      
        if(!(command == "voice search *tag" || command == "*tag1 voice search *tag2")){
    
            $('#voiceQuery').val(phrase);
            $('#voiceQuery').css('color','#F44336');
            scrollTextBox();
        }
  }

  var voiceSearch_2 = function(tag1,tag2) {
        
        $('#voiceQuery').val(tag2);
        $('#voiceQuery').css('color','#F44336');
        scrollTextBox();
  }

  var voiceSearch_1 = function(tag) {
      
        $('#voiceQuery').val(tag);
        $('#voiceQuery').css('color','#F44336');
        scrollTextBox();
  }

  var toggleTopbar = function(){
        $('body').toggleClass('push-tobottom');
        $('#btnShowTopbar').toggleClass('topOpen');
        $('#btnShowSidebar').toggleClass('topOpen');
        $('#sidebarextension').toggleClass('topOpen');
        $('#topbar').toggleClass('open');
  }

  var searchCanvas = function(){
        search();
  }

  // Add commands to annyang
  annyang.addCommands({
      
        'voice search *tag':voiceSearch_1,
        '*tag1 voice search *tag2': voiceSearch_2,
        'toggle top bar': toggleTopbar,
        'search canvas': searchCanvas,

  });

  // set langauge English(UK)
  annyang.setLanguage('en-GB');

  // to print recognized speech in console
  annyang.debug(true);
  
  SpeechKITT.setStartCommand(annyang.start);
  SpeechKITT.setAbortCommand(annyang.abort);
  annyang.addCallback('start', SpeechKITT.onStart);
  annyang.addCallback('end', SpeechKITT.onEnd);

  annyang.addCallback('resultNoMatch', _notRecognizedSentence);
  annyang.addCallback('resultMatch', _recognizedSentence);


  SpeechKITT.setInstructionsText("Say 'voice search' followed by your Query");

  // Define a stylesheet for KITT to use
  SpeechKITT.setStylesheet('css/flat-pomegranate.css');

  // Render KITT's interface
  $(document).ready(function (){

      SpeechKITT.vroom();

  });
  
}