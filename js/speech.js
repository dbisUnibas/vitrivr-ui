if (annyang) {

  var actionVariable = null;    // used to set action
  var actionOccured = false;    // used to check if action has occurred or not
  var row = 0;                  // used for browsing video conatiners 
  var factor = 0;
  var voiceText;

  var dictionary={};
  var id=[];

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
        
        factor = 0;
        
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
        
        if(!(FOLLOWBACK_COMMAND.includes(phrase))){
            SpeechKITT.setRecognizedSentence(phrase);
            factor = 1;
        }

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
        voiceText = tag.split(" ");
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

/**
 * Increse pen size upto 100 units
 * Pen size is increased by 5 units on each call
 * voice query - "increase radius"
 */

  function increasePenSize(unit){
        
        if(unit == undefined){
            unit = 5;
           
        }
        var size = parseInt($('#draw-radius').get(0).noUiSlider.get());
        
        if(size == 100){
            displayErrorMessage("Size of pen can not be increase");
        }
        else if(size <= 100-unit){
            for (el in shotInputs) {
                shotInputs[el].color.setLineWidth(size + unit);
            }
            $('#draw-radius').get(0).noUiSlider.set(size + unit);
        }
        else{

            for (el in shotInputs) {
                shotInputs[el].color.setLineWidth(100);
            }
            $('#draw-radius').get(0).noUiSlider.set(100);
        }
      
  }

/**
 * Decrese pen size till 1 unit
 * Pen size is decreased by 5 units on each call
 * voice query - "decrease radius"
 */

  function decreasePenSize(unit){
        
        if(unit == undefined){
            unit = 5;
            
        }
        var size = parseInt($('#draw-radius').get(0).noUiSlider.get());
        
        if(size == 1){
            displayErrorMessage("Size of pen can not be decrease");
        }
        else if(size >= unit){
            for (el in shotInputs) {
                shotInputs[el].color.setLineWidth(size - unit);
            }
            $('#draw-radius').get(0).noUiSlider.set(size - unit);
        }
        else{

            for (el in shotInputs) {
                shotInputs[el].color.setLineWidth(1);
            }
            $('#draw-radius').get(0).noUiSlider.set(1);
        }
      
  }

/**
 * Scrolls down the window to the next video container
 * The video container that comes up on scroll is highlighted by #F44336 color border
 * voice query - "next"
 */

  function browseNext(unit) {

        if(unit == undefined)
            unit = 1;

        var containerArray = $(".videocontainer");
        if(containerArray.length == 0){

            displayErrorMessage("Query not executed as there is no video results retrieved");
        }
        else if(searchRunning){

            displayErrorMessage("Please wait till search is in progress");
        }
        else if( containerArray.length > 0 ){

            document.getElementById(containerArray[row].id).style = "";
            if(row < containerArray.length-unit){
                row += unit;
            }
            else{
                row = containerArray.length-1;
                displayErrorMessage("You are at the bottom");
            }

            $('html, body').animate({scrollTop: $("#"+containerArray[row].id).offset().top  }, 800);
            document.getElementById(containerArray[row].id).style = "border: 2px solid #F44336;";
        }
  }

 /**
 * Scrolls up the window to the previous video container
 * The video container that comes up on scroll is highlighted by #F44336 color border
 * voice query - "previous"
 */ 

  function browsePrevious(unit) {
        
        if(unit == undefined)
            unit = 1;
  
        var containerArray = $(".videocontainer");
        if(containerArray.length == 0){

            displayErrorMessage("Query not executed as there is no video results retrieved");
        }
        else if(searchRunning){

            displayErrorMessage("Please wait till search is in progress");
        }
        else if( containerArray.length > 0 ){

            document.getElementById(containerArray[row].id).style = "";
            if(row >= unit){
                row = row - unit;
            }
            else{
                row = 0;
                displayErrorMessage("You are at the top");
            }

            $('html, body').animate({scrollTop: $("#"+containerArray[row].id).offset().top  }, 800);
            document.getElementById(containerArray[row].id).style = "border: 2px solid #F44336;";
        }
  }

  function followBack() {
        
        if(factor == 0){
            displayErrorMessage("First say some query");
            return;
        }

        var lastRecognized = SpeechKITT.getLastRecognizedSentence();
        //console.log(lastRecognized);
        factor++;

        var lastRecognizedArray = lastRecognized.split(" ");
        var a,b,c,d,e;
        a=0;
        b=0;
        c=0;
        d=0;
        e=0;

        for(var i=0 ; i < lastRecognizedArray.length ; i++) {
            var word = lastRecognizedArray[i];
            
            if(QUERY_A.includes(word))
                a++;
            if(QUERY_B.includes(word))
                b++;
            if(QUERY_C.includes(word))
                c++;
            if(QUERY_D.includes(word))
                d++;
            if(QUERY_E.includes(word))
                e++;
        }
            
        switch (lastRecognizedArray.length){
              case a:
                  increasePenSize(5*factor);
                  break;
              case b:
                  decreasePenSize(5*factor);
                  break;
              case c:
                  browseNext(2*(factor-1));
                  break;
              case d:
                  browsePrevious(2*(factor-1));
                  break;
              case e:
                  addCanvas();
                  break;
              default:
                  displayErrorMessage("This command doesn't work after query: "+lastRecognized);
        }
  }

// Below are the functions used for speech + mouse in combination

/**
 * Checks  if user has clicked on video thumbnail
 * Function is called after 5 seconds of action voice query 
 * If action/click is not occured than it sets actionVariable to null
 */

  function checkActionOccured(){

        if(!actionOccured){

            actionVariable = null;
            displayErrorMessage("User has not clicked any video");      
        }        
  }

/**
 * Gives control to the necessary function, depending on the value of actionVariable
 * decideAction function is called when user click on video thumbnail
 * @param {Object} thumbnail image element
 */

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

/**
 * Adds the thumbnail image on the canvas
 * The image is added always on last canvas (in case of single canvas last will the only present one)
 * @param {Object} thumbnail image element
 */

   function addImageCanvas(thumbnail){

        var url = thumbnail.attr('src');
  
        var len=0;
        for (el in shotInputs) {
            len++;
        } 
        shotInputs["shotInput_"+(len-1)].color.loadImageFromUrl(url);
  }

/**
 * Checks for cases when the action query is made
 * Cases includes: 1) No video is retrieved
 *                 2) search is in progress
 *                 3) videos retrieved  
 * 
 * @param {String} action that will be performed after click on thumbnail image
 */  

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

/**
 * Called when action query to play video is made
 * voice query - 'play this video'
 */

  function playVideo(){

        checkUseCases("play");
  }

/**
 * Called when action query to search video by ID is made
 * voice query - 'search this video'
 */

  function searchById(){

        checkUseCases("search");
  }

/**
 * Called when action query to add video to positive feedback is made
 * voice query - 'include this video'
 */

  function positiveFeedback(){

        checkUseCases("addVideo");
  }

/**
 * Called when action query to add video to negative feedback is made
 * voice query - 'remove this video'
 */

  function negativeFeedback(){

        checkUseCases("removeVideo");
  }

/**
 * Called when action query to add thumbnail image on the canvas is made
 * voice query - 'drop it on canvas'
 */

  function dropOnCanvas(){

        checkUseCases("dropImage");
  }

/**
 * Called when action query to search relevance feedback is made
 * There must be atleast one video added as positive feedback
 * voice query - 'search my feedback'
 */

  function searchFeedback(){

        if(rf_positive.length > 0){

            actionVariable = null;
            search(-1, rf_positive, rf_negative);
        }
        else{

            displayErrorMessage("There must be atleast one video added as positive feedback");
        }
  }

  function buildDictionary(){

        var number=1; 
        var present=[];
        for(var phrase in commands){

            phrase = phrase.replace(/[()]/g, '');
            id[phrase] = number;
            number++;
        }
        for(var phrase in id){

            var words = phrase.split(" ");
            for(var i=0;i < words.length;i++){

                var key = words[i];
                if(!present[key]){

                    dictionary[key] = giveIDArray(key);
                    present[key] = true;  
                }
            }
        }
  }

  function giveIDArray(key){

        var IDArray=[];
        for(var phrase in id){

            var words = phrase.split(" ");
            if(words.indexOf(key) != -1){
                
                IDArray.push(id[phrase]);
            }
        }
        return IDArray;     
  }


  $(document).ready(function (){
 
      annyang.setLanguage(LANGUAGE);

      // Add commands to annyang
      annyang.addCommands(commands);

      // to print recognized speech in console
      annyang.debug(true);

      SpeechKITT.setStartCommand(annyang.start);
      SpeechKITT.setAbortCommand(annyang.abort);
      annyang.addCallback('start', SpeechKITT.onStart);
      annyang.addCallback('end', SpeechKITT.onEnd);

      annyang.addCallback('resultNoMatch', notRecognizedSentence);
      annyang.addCallback('resultMatch', recognizedSentence);

      SpeechKITT.setInstructionsText(INSTRUCTION); 

      // Define a stylesheet for KITT to use
      SpeechKITT.setStylesheet('css/flat-pomegranate.css');

      // Render KITT's interface
      SpeechKITT.vroom();

      buildDictionary();

  });

}