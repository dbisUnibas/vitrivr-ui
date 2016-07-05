if (voiceMode) {

  var actionVariable = null;    // used to set action
  var actionOccured = false;    // used to check if action has occurred or not
  var row = 0;                  // used for browsing video conatiners 
  var factor = 0;
  var response;                 // used to set whenever user responded to feedback
  var voiceText= new Array();   // used for voice search query

  var dictionary={};            // dictionary used in feedback system
  var commandID=[];

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

        responsiveVoice.speak(message,PERSON);        
        Materialize.toast(message, 3000);
  }

/**
 * Checks if response is set after 4 sec of feedback 
 * If response is set then query is executed w.r.t. feedback command
 *
 * @param {String} feedback command suggested by feedback system
 */ 

  function feedbackResponse(feedbackCommand){

        if(response == 1){
            commands[feedbackCommand].apply();
            displayErrorMessage("Query executed");
        }
        
        response = undefined;
  }

/**
 * This function sets the response variable when user say "yes"
 * as a response to feedback
 */

  function setResponse(){
        if(response == 0)
            response = 1;
        else{
            displayErrorMessage("No feedback");
        }
  }

/**
 * This function prints the sentence with black font in the text box
 * The sentence printed here is the one which is not a voice query 
 * Unrecognized sentence after pre processing is given to feedback system
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
        sentences = preProcess(sentences);
        var feedbackCommand = userInterfaceFeedback(sentences);
       // console.log(sentences);
        if(feedbackCommand == undefined){
             displayErrorMessage("Sorry I haven't understood you");
        }
        else if(feedbackCommand == 1){
              displayErrorMessage("Query executed");
        }
        else{

            response = 0;
            displayErrorMessage("Did you mean: " + baseCommands[feedbackCommand]);
            setTimeout(feedbackResponse,5000,feedbackCommand);
        }

  }
  
/**
 * This function prints voice query given by user except the "voice search" query
 * The query printed in text box has #F44336 font color
 *
 * @param {string} phrase Recognized voice query
 * @param {string} command The command executed for recognized voice query
 */ 

  function recognizedSentence(phrase,command) {
        
        if(followUpCommands.indexOf(phrase) == -1){
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
 * Filters out the stop words from unrecognized sentence
 *
 * @param {string} str Unrecognized voice query
 */ 

  function preProcess(str){

        var before = str.split(" ");
        var after="";
        for(var i=0;i < before.length;i++){

            if(stopwords.indexOf(before[i]) == -1){
                after += before[i]+" ";
            }
        }
        return after.trim();
  }


/**
 * This function currently just ignore the speech before saying "voice search"
 * The query printed in text box is the speech after saying "voice search"
 *
 * @param {string} tag1 String before "voice search"; Ignored
 * @param {string} tag2 String after "voice search"; Will be used for voice search
 */

  function voiceSearch_2(tag1,tag2) {
        
        voiceText = new Array(tag2);
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
       
        voiceText = new Array(tag);
        $(VOICE_TEXTBOX).val(tag);
        $(VOICE_TEXTBOX).css('color','#F44336');
        scrollTextBox();
  }

/**
 * Toggle the top bar
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
* Displays the color sketch option for canvas
*
*/  

  function showColorSketch(){
        $('.motionsketch').hide();
        $('.objectsketch').hide();
        $('#color-tool-pane').show();
        $('#sidebarextension').removeClass('open');
        $('#btnShowSidebar').removeClass('open');
        $('#colorsketchbutton').parent().siblings().removeClass('active');
        $('#colorsketchbutton').parent().addClass('active');

  }

/**
* Displays the motion sketch option for canvas
*
*/

  function showMotionSketch(){
        $('.motionsketch').show();
        $('.objectsketch').show();
        $('#color-tool-pane').hide();
        $('#sidebarextension').removeClass('open');
        $('#btnShowSidebar').removeClass('open');
        $('#motionsketchbutton').parent().siblings().removeClass('active');
        $('#motionsketchbutton').parent().addClass('active');

  }

/**
 * Searches the canvas
 */

  function searchCanvas(){
        search();
  }

/**
 * Searches any particular canvas or combination of Canvas
 * Example- tag ="1 2 and 3" will search for first,second and third canvas 
 *
 * @param {string} tag Integers string seprated by spaces and containing "and" in between
 */ 

  function searchParticularCanvas(tag){
        var arr = tag.split(" ");
        console.log("starting sketch-based search");
        removeItem = "and";
        arr = $.grep(arr, function(value) {
           return value != removeItem;
        });
        clearResults();
        var query = "{\"queryType\":\"multiSketch\", \"query\":[";
  
        for(var index in arr){
          var voiceKey = "shotInput_"+(arr[index]-1);
          console.log(voiceKey);
          var shotInput = shotInputs[voiceKey];

          query += "{\"img\": \"" + shotInput.color.getDataURL() + "\",\n";
          query += "\"motion\":" + shotInput.motion.getPaths() + ",\n";
          query += "\"categories\":" + JSON.stringify(getCategories()) + ",\n"; //see config.js
          query += "\"concepts\":" + JSON.stringify(shotInput.conceptList) + ", \n";
          query += "\"id\": " + 0 + "\n";
          query += "},";
        }
        
        query = query.slice(0, -1);
        query += "],";
        query += "\"resultname\":\"" + getResultName() + "\"}";
          
        oboerequest(query);

  }

/**
 * Adds a new canvas
 */

  function addCanvas(){
        newShotInput();
  }

/**
 * Use to split video into sequences
 * Works when video results are completed retrieved
 * Can be executed once after every search
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
 * unit of increase is decided by follow up command
 * @param {Integer} increase in radius of pen
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
 * Decrease pen size till 1 unit
 * unit of decrease is decided by follow up command
 * @param {Integer} decrease in radius of pen
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

 /**
 * Performs the last action with more degree of extent 
 * Works for changing pen size
 * voice query - "even more"/"more"
 */ 

  function followUpPenSize() {
        
        if(factor == 0){
            displayErrorMessage("First say some query");
            return;
        }

        var lastRecognized = SpeechKITT.getLastRecognizedSentence();
        factor++;

        var lastRecognizedArray = lastRecognized.split(" ");
        var a,b;
        a=0;
        b=0;

        for(var i=0 ; i < lastRecognizedArray.length ; i++) {
            var word = lastRecognizedArray[i];
            
            if(QUERY_A.includes(word))
                a++;
            if(QUERY_B.includes(word))
                b++;
        }
            
        switch (lastRecognizedArray.length){
              case a:
                  increasePenSize(5*factor);
                  break;
              case b:
                  decreasePenSize(5*factor);
                  break;
              default:
                  displayErrorMessage("This command doesn't work after query: "+lastRecognized);
        }
  }

/**
 * Performs the last action with more degree of extent 
 * Works for browsing container
 * voice query - "even further"/"further"
 */ 

  function followUpBrowsing() {
        
        if(factor == 0){
            displayErrorMessage("First say some query");
            return;
        }

        var lastRecognized = SpeechKITT.getLastRecognizedSentence();
        factor++;

        var lastRecognizedArray = lastRecognized.split(" ");
        var c,d;
        c=0;
        d=0;

        for(var i=0 ; i < lastRecognizedArray.length ; i++) {
            var word = lastRecognizedArray[i];
            
            if(QUERY_C.includes(word))
                c++;
            if(QUERY_D.includes(word))
                d++;
        }
            
        switch (lastRecognizedArray.length){
              case c:
                  browseNext(2*(factor-1));
                  break;
              case d:
                  browsePrevious(2*(factor-1));
                  break;
             /* case e:
                  addCanvas();
                  break;*/
              default:
                  displayErrorMessage("This command doesn't work after query: "+lastRecognized);
        }
  }

/**
 * Performs the last action with more degree of extent 
 * Works for adding a new Canvas
 * voice query - "one more"/"again one more"
 */ 


  function followUpCanvas() {
        
        if(factor == 0){
            displayErrorMessage("First say some query");
            return;
        }

        var lastRecognized = SpeechKITT.getLastRecognizedSentence();
        factor++;

        var lastRecognizedArray = lastRecognized.split(" ");
        var e=0;

        for(var i=0 ; i < lastRecognizedArray.length ; i++) {
            var word = lastRecognizedArray[i];
            
            if(QUERY_E.includes(word))
                e++;
        }
            
        if (e == lastRecognizedArray.length)
            addCanvas();
        else
            displayErrorMessage("This command doesn't work after query: "+lastRecognized);
        
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
 * Works according to actionVariable value 
 * actionValue="addVideo" -> adds video to positive feedback on click over video thumbnail
 * actionValue="addVideo" -> adds video to positive feedback on click over video thumbnail
 * @param {Object} object thumbnail image element
 */  

  function relevanceFeedbackVoice(object){
  
        var shotBox = object.parent().parent();
        var shotId = parseInt(shotBox.attr('id').substring(1));
        
        if(actionVariable == "addVideo"){

          if($.inArray(shotId, rf_positive) >= 0){ //remove
            document.getElementById(shotBox.attr('id')).style.border = "";
            remove_element(rf_positive,shotId);
          }
          else{ //add
            if($.inArray(shotId, rf_negative) >= 0){
              
              remove_element(rf_negative,shotId);
            }
            rf_positive.push(shotId);
            document.getElementById(shotBox.attr('id')).style.border = "medium solid blue";
          }
        }
        else if(actionVariable == "removeVideo"){//negative

            if($.inArray(shotId, rf_negative) >= 0){ //remove

              document.getElementById(shotBox.attr('id')).style.border = "";
              remove_element(rf_negative,shotId);
            }
            else{ //add
              if($.inArray(shotId, rf_positive) >= 0){
            
                  remove_element(rf_positive,shotId);
              }

              rf_negative.push(shotId);
              document.getElementById(shotBox.attr('id')).style.border = "medium solid red";
            }
        }
        
        if(rf_positive.length > 0){
            $('#rf-button').show();
        }else{
            $('#rf-button').hide();
        }
      
        console.log(rf_positive);
        console.log(rf_negative);
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
                relevanceFeedbackVoice($(this));
                break;

            case "removeVideo" :
                actionOccured = true;
                relevanceFeedbackVoice($(this));
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
 */

  function playVideo(){

        checkUseCases("play");
  }

/**
 * Called when action query to search video by ID is made
 */

  function searchById(){

        checkUseCases("search");
  }

/**
 * Called when action query to add video to positive feedback is made
 */

  function positiveFeedback(){

        checkUseCases("addVideo");
  }

/**
 * Called when action query to add video to negative feedback is made
 */

  function negativeFeedback(){

        checkUseCases("removeVideo");
  }

/**
 * Called when action query to add thumbnail image on the canvas is made
 */

  function dropOnCanvas(){

        checkUseCases("dropImage");
  }

/**
 * Called when action query to search relevance feedback is made
 * There must be atleast one video added as positive feedback
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

/**
 * Builds a dictionary using the 3-grams words of commands
 * Each 3-gram is mapped to an array of IDs of commands containing that 3-gram
 */  

  function buildDictionary(){
      
        var number=1; 
        var present=[];
        for(var phrase in commands){

            phrase = phrase.replace(/[()]/g, '');
            commandID[phrase] = number;
            number++;
        }
        for(var phrase in commandID){
        
            var id = commandID[phrase];
            var words = phrase.split(" ");
            for(var i=0;i < words.length;i++){

                var key = words[i];

                for(var j=-2;j<key.length;j++){
                    var trigram;
                    if(j==-2)
                        trigram = "  "+key.charAt(j+2);
                    else if(j==-1)
                        trigram = " "+key.substring(0,2);
                    else if(j == key.length-2)
                        trigram = key.substring(j,j+2)+" ";
                    else if(j == key.length-1)
                        trigram = key.charAt(j)+"  ";
                    else
                        trigram = key.substring(j,j+3);

                    if(!dictionary[trigram]){    // for adding trigrams of words in dictionary with IDs

                        dictionary[trigram] = [id];
                    }
                    else{
                        if(dictionary[trigram].indexOf(id)==-1)
                            dictionary[trigram].push(id);
                    }
                }
            }
        }
       //console.log(dictionary);
  }


/**
 * Creates an array of IDs of commands conating key 
 * @param {String} key used in dictionary
 * @return {Integer[]} Array of IDs of matched commands
 */

  function giveIDArray(key){

        var IDArray=[];
        for(var phrase in commandID){

            var words = phrase.split(" ");
            if(words.indexOf(key) != -1){
                
                IDArray.push(commandID[phrase]);
            }
        }
        return IDArray;     
  }

/**
 * Computes frequency of each command using dictionary 
 * Command with maximum frequency is used as a feedback
 * Frequency here signifies the number of words contained from unrecognized sentence
 * @param {String} unrecognized sentence of user
 * @return {String} Feedback command
 */

  function userInterfaceFeedback(sentence){
    
        sentence = sentence.trim();
        var notRecognizedWords = sentence.split(" ");
        var frequencyCommand = [];
        var countTrigram=0;
        for(var phrase in commandID){

            var id =commandID[phrase];
            frequencyCommand[id] = 0;
        }
        
        for(var i=0;i < notRecognizedWords.length;i++){

            var key = notRecognizedWords[i];

            for(var j=-2;j<key.length;j++){
                var trigram;
                if(j == -2)
                        trigram = "  "+key.charAt(j+2);
                    else if(j==-1)
                        trigram = " "+key.substring(0,2);
                    else if(j == key.length-2)
                        trigram = key.substring(j,j+2)+" ";
                    else if(j == key.length-1)
                        trigram = key.charAt(j)+"  ";
                    else
                        trigram = key.substring(j,j+3);

                if(dictionary[trigram]){    // for trigrams of words of unrecognized sentence
                   
                    var IDArrayTrigram = dictionary[trigram];
                   
                    for(var k=0;k < IDArrayTrigram.length;k++){

                        var id = IDArrayTrigram[k];
                        frequencyCommand[id]++;
                    }  
                }
            }
            countTrigram += key.length+2;
        }
      
        var maximumFrequency = 0;
        var feedbackCommand;
        for(var phrase in commands){

            var processedPhrase = phrase.replace(/[()]/g, '');
            var id = commandID[processedPhrase];

            if(maximumFrequency < frequencyCommand[id]){

                maximumFrequency = frequencyCommand[id];
                feedbackCommand = phrase;
            }
        }
        
        if(maximumFrequency / countTrigram >= 0.8){
            
            commands[feedbackCommand].apply();
            feedbackCommand = 1;
        }

        if(maximumFrequency / countTrigram <= 0.2){
            feedbackCommand = undefined;
        }

        return feedbackCommand;
  }
  
  $(document).ready(function (){

        // Apply the language set in languageSpeech.js
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
else{       // control comes in else block if voiceMode is set false in config.js

    $(document).ready(function (){
        ScoreWeights.meta = 0;
        $('.voice').hide();
    });
}