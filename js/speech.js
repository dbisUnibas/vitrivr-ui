if (annyang) {

 // to display error Message errorMessage value set to true 
  var errorMessage = false;

/**
 * Scroll the textbox whenever it overflows due to display of recognized words/sentences
 */

  function scrollTextBox() {
        var textarea = $('#voiceQuery');
        if(textarea.length)
            textarea.scrollTop(textarea[0].scrollHeight - textarea.height());
  }

/**
 * pop up the error message as a toast
 *
 * @param {string} message The error to be displayed
 */

  function displayErrorMessage(message) {

        Materialize.toast(message, 4000);
  }

/**
 * This function prints the sentence with black font in the text box
 * The sentence printed here is the one which is not a voice query 
 *
 * @param {(string|string[])} sentences Array of probable recognized sentences
 */  

  function notRecognizedSentence(sentences) {
       if (Array.isArray(sentences)) {
           sentences = sentences[0];
        }
    
        $('#voiceQuery').val($('#voiceQuery').val() +" "+sentences);
        $('#voiceQuery').css('color','#000000');
        scrollTextBox();
  
/**
 * This function prints voice query given by user except the "voice search" query
 * The query printed in text box has #F44336 font color
 *
 * @param {string} phrase Recognized voice query
 * @param {string} command The command executed for recognized voice query
 */ 

  function recognizedSentence(phrase,command) {
      
        if(!(command == "voice search *tag" || command == "*tag1 voice search *tag2")){
    
            if(!errorMessage){
                $('#voiceQuery').val(phrase);
                $('#voiceQuery').css('color','#F44336');
            }
            else{
                errorMessage = false;
            }
            scrollTextBox();
        }
  }

/**
 * This function currently just ignore the speech before saying "voice search"
 * The query printed in text box is the speech after saying "voice search"
 *
 * @param {string} tag1 String before "voice search"; Ignored
 * @param {string} tag2 String after "voice search"; Will be used for voice search
 */

  function voiceSearch_2(tag1,tag2) {
        
        $('#voiceQuery').val(tag2);
        $('#voiceQuery').css('color','#F44336');
        scrollTextBox();
  }

/**
 * The fuction currently just print the speech query after saying "voice query" 
 *
 * @param {string} tag String after "voice search"; Will be used for voice search
 */

  function voiceSearch_1(tag) {
      
        $('#voiceQuery').val(tag);
        $('#voiceQuery').css('color','#F44336');
        scrollTextBox();
  }

/**
 * Toggle the top bar
 * voice query - "toggle top bar"
 */

  function toggleTopbar(){
        $('body').toggleClass('push-tobottom');
        $('#btnShowTopbar').toggleClass('topOpen');
        $('#btnShowSidebar').toggleClass('topOpen');
        $('#sidebarextension').toggleClass('topOpen');
        $('#topbar').toggleClass('open');
  }

/**
 * Toggle the sidebar
 * voice query - "toggle sidebar"
 */

  function toggleSidebar(){
        if($('#sidebar').hasClass('open') && $('#sidebarextension').hasClass('open')) {
            
            $('#sidebarextension').removeClass('open');
            $('#btnShowSidebar').removeClass('open');

        } 
        $('#sidebar').toggleClass('open');
        $('body').toggleClass('push-toright');
  }

/**
 * Searches the canvas
 * voice query - "search canvas"
 */

  function searchCanvas(){
        search();
  }

/**
 * Adds a new canvas
 * voice query - "add canvas"
 */

  function addCanvas(){
        newShotInput();
  }

/**
 * Use to split video into sequences
 * Works when video results are completed retrieved
 * Can be executed once after every search
 * voice query - "split video"
 */

  function splitVideo(){
    
        var resultDisplayed = $(".videocontainer");
        if(resultDisplayed.length == 0){

            errorMessage = true;
            displayErrorMessage("Query not executed as there is no video results retrieved");
        }
        else if(searchRunning){

            errorMessage = true;
            displayErrorMessage("Please wait till search is in progress");
        }
        else if(resultDisplayed.length > 0){
            if(!splitVideoExecuted){
              
                sequenceSegmentation();
              }
            else{

                errorMessage = true;
                displayErrorMessage("Query already executed");
            }
        }
        
  }

  // Add commands to annyang
  annyang.addCommands({
      
        'voice search *tag':voiceSearch_1,
        '*tag1 voice search *tag2': voiceSearch_2,
        'toggle top bar': toggleTopbar,
        'search canvas': searchCanvas,
        'add canvas': addCanvas,
        'split video': splitVideo,
        'toggle sidebar': toggleSidebar,

  });

  // set langauge English(UK)
  annyang.setLanguage('en-GB');

  // to print recognized speech in console
  annyang.debug(true);
  
  SpeechKITT.setStartCommand(annyang.start);
  SpeechKITT.setAbortCommand(annyang.abort);
  annyang.addCallback('start', SpeechKITT.onStart);
  annyang.addCallback('end', SpeechKITT.onEnd);

  annyang.addCallback('resultNoMatch', notRecognizedSentence);
  annyang.addCallback('resultMatch', recognizedSentence);


  SpeechKITT.setInstructionsText("Say 'voice search' followed by your Query");

  // Define a stylesheet for KITT to use
  SpeechKITT.setStylesheet('css/flat-pomegranate.css');

  // Render KITT's interface
  $(document).ready(function (){

      SpeechKITT.vroom();

  });
  
}