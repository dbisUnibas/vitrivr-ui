if (annyang) {

  var voiceSearch = function(tag) {

     $('#voiceQuery').val($('#voiceQuery').val() +" "+tag);
     
  }

  var toggleTopbar = function(){
        $('body').toggleClass('push-tobottom');
        $('#btnShowTopbar').toggleClass('topOpen');
        $('#btnShowSidebar').toggleClass('topOpen');
        $('#sidebarextension').toggleClass('topOpen');
        $('#topbar').toggleClass('open');
  }

  // Add commands to annyang
  annyang.addCommands({
      
      'voice search *tag': voiceSearch,
      'toggle top bar': toggleTopbar,

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