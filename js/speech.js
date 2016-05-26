if (annyang) {

  var voiceSearch = function(tag) {

     console.log("query: "+tag);
     
  }

  // Add commands to annyang
  annyang.addCommands({
      'voice search *tag': voiceSearch,
  });

  // set langauge English(UK)
  annyang.setLanguage('en-GB');

  // to print recognized speech in console
  annyang.debug(true);
  
  SpeechKITT.annyang();

  SpeechKITT.setInstructionsText("Say 'voice search' followed by your Query");

  // Define a stylesheet for KITT to use
  SpeechKITT.setStylesheet('css/flat-pomegranate.css');

  // Render KITT's interface
  $(document).ready(function (){

      SpeechKITT.vroom();

  });
  
}