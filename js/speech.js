if (annyang) {

  var actionVariable = null;
  var actionOccured = false;
  var row = 0;

// declaring constants
  const VOICE_TEXTBOX = "#voiceTextbox";

/**
 * Scroll the textbox whenever it overflows due to display of recognized words/sentences
 */

  function scrollTextBox() {
        var textarea = $(VOICE_TEXTBOX);
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
    
        $(VOICE_TEXTBOX).val($(VOICE_TEXTBOX).val() +" "+sentences);
        $(VOICE_TEXTBOX).css('color','#000000');
        scrollTextBox();
  }
  
/**
 * This function prints voice query given by user except the "voice search" query
 * The query printed in text box has #F44336 font color
 *
 * @param {string} phrase Recognized voice query
 * @param {string} command The command executed for recognized voice query
 */ 

  function recognizedSentence(phrase,command) {
      
        if(!(command == "voice search *tag" || command == "*tag1 voice search *tag2")){
    
            $(VOICE_TEXTBOX).val(phrase);
            $(VOICE_TEXTBOX).css('color','#F44336');
            
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
        
        $(VOICE_TEXTBOX).val(tag2);
        $(VOICE_TEXTBOX).css('color','#F44336');
        scrollTextBox();
  }

/**
 * The fuction currently just print the speech query after saying "voice query" 
 *
 * @param {string} tag String after "voice search"; Will be used for voice search
 */

  function voiceSearch_1(tag) {
      
        $(VOICE_TEXTBOX).val(tag);
        $(VOICE_TEXTBOX).css('color','#F44336');
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

            displayErrorMessage("Query not executed as there is no video results retrieved");
        }
        else if(searchRunning){

            displayErrorMessage("Please wait till search is in progress");
        }
        else if(resultDisplayed.length > 0){
            if(!splitVideoExecuted){
              
                sequenceSegmentation();
            }
            else{

                displayErrorMessage("Query already executed");
            }
        }
        
  }

  function increasePenSize(){

        var size = parseInt($('#draw-radius').get(0).noUiSlider.get());
        
        if(size == 100){
            displayErrorMessage("Size of pen can not be increase");
        }
        else if(size <= 95){
            for (el in shotInputs) {
                shotInputs[el].color.setLineWidth(size + 5);
            }
            $('#draw-radius').get(0).noUiSlider.set(size + 5);
        }
        else{

            for (el in shotInputs) {
                shotInputs[el].color.setLineWidth(100);
            }
            $('#draw-radius').get(0).noUiSlider.set(100);
        }
      
  }

  function decreasePenSize(){

        var size = parseInt($('#draw-radius').get(0).noUiSlider.get());
        
        if(size == 1){
            displayErrorMessage("Size of pen can not be decrease");
        }
        else if(size >= 5){
            for (el in shotInputs) {
                shotInputs[el].color.setLineWidth(size - 5);
            }
            $('#draw-radius').get(0).noUiSlider.set(size - 5);
        }
        else{

            for (el in shotInputs) {
                shotInputs[el].color.setLineWidth(1);
            }
            $('#draw-radius').get(0).noUiSlider.set(1);
        }
      
  }

  function browseNext() {

        var containerArray = $(".videocontainer");
        if(containerArray.length == 0){

            displayErrorMessage("Query not executed as there is no video results retrieved");
        }
        else if(searchRunning){

            displayErrorMessage("Please wait till search is in progress");
        }
        else if( containerArray.length > 0 && row < containerArray.length-1 ){

            document.getElementById(containerArray[row].id).style = "";

            row++;
            $('html, body').animate({scrollTop: $("#"+containerArray[row].id).offset().top  }, 800);
            document.getElementById(containerArray[row].id).style = "border: 2px solid #F44336;";
        }
  }

  function browsePrevious() {

        var containerArray = $(".videocontainer");
        if(containerArray.length == 0){

            displayErrorMessage("Query not executed as there is no video results retrieved");
        }
        else if(searchRunning){

            displayErrorMessage("Please wait till search is in progress");
        }
        else if( containerArray.length > 0 && row >= 1 ){

            document.getElementById(containerArray[row].id).style = "";

            row--;
            $('html, body').animate({scrollTop: $("#"+containerArray[row].id).offset().top  }, 800);
            document.getElementById(containerArray[row].id).style = "border: 2px solid #F44336;";
        }
  }



// Below are the functions used for speech + mouse in combination

  function checkActionOccured(){

        if(!actionOccured){

            actionVariable = null;
            displayErrorMessage("User has not clicked any video");      
        }        
  }

  function decideAction(event){

        switch( actionVariable ) {

            case null:
                displayErrorMessage("Please say an action query");
                break;

            case "play" :
                actionVariable = null;
                actionOccured = true;
                prepare_playback($(this));
                break;

            case "search" :
                actionVariable = null;
                actionOccured = true;
                similaritySearch($(this));
                break;

            case "addVideo" :
                actionOccured = true;
                relevanceFeedback($(this));
                break;

            case "removeVideo" :
                actionOccured = true;
                relevanceFeedback($(this));
                break;

            case "dropImage" :
                actionVariable = null;
                actionOccured = true;
                addImageCanvas($(this));
                break;
        }
  }

   function addImageCanvas(thumbnail){

        var url = thumbnail.attr('src');
  
        var len=0;
        for (el in shotInputs) {
            len++;
        } 
        shotInputs["shotInput_"+(len-1)].color.loadImageFromUrl(url);
  }

  function checkUseCases(action){

        var resultDisplayed = $(".videocontainer");
        if(resultDisplayed.length == 0){

            displayErrorMessage("Query not executed as there is no video results retrieved");
        }
        else if(searchRunning){

            displayErrorMessage("Please wait till search is in progress");
        }
        else if(resultDisplayed.length > 0){

            actionVariable = action;
            actionOccured = false;
            setTimeout(checkActionOccured , 5000);
        }
  }


  function playVideo(){

        checkUseCases("play");
  }

  function searchById(){

        checkUseCases("search");
  }

  function positiveFeedback(){

        checkUseCases("addVideo");
  }

  function negativeFeedback(){

        checkUseCases("removeVideo");
  }

  function dropOnCanvas(){

        checkUseCases("dropImage");
  }

  function searchFeedback(){

        if(rf_positive.length > 0){

            actionVariable = null;
            search(-1, rf_positive, rf_negative);
        }
        else{

            displayErrorMessage("There must be atleast one video added as positive feedback");
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
        'increase radius':increasePenSize,
        'decrease radius':decreasePenSize,
        'next': browseNext,
        'previous': browsePrevious,
        
        'play this video': playVideo,
        'search this video': searchById,
        'include this video': positiveFeedback,
        'remove this video': negativeFeedback,
        'search my feedback': searchFeedback,
        'drop it on canvas': dropOnCanvas,

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