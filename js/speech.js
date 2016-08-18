/**
* Speech functions. 
* <P>
* 
* This file contains all functions related to voice interface
*
* @author Prateek Goel
*/

if (voiceMode) {

  var actionVariable = null;    // used to set click based action
  var actionOccured = false;    // used to check if action has occurred or not
  var row = 0;                  // used for browsing video containers 
  var factor = 0;               // increase with the extent of followup command
  var response;                 // used to set whenever user responded to feedback
  var voiceText= new Array();   // used for voice search query
  var colorByVoice = "#000000"; // always contains current selected color
  var playingShotBox = null;    // used to store the object of playing video
  var feedbackCount = 0;        // keep counts of number of consecutive feedback response

  var dictionary={};            // dictionary used in feedback system
  var commandID=[];             // maps commmands to their IDs in dictionary of feedback system

// declaring constants
  const VOICE_TEXTBOX = "#voiceTextbox";
  const NAVIGATION_COLOR = "blue";        // boundary color of current browsing video container
  const POSITIVE_COLOR = "#006400";       // boundary color over positive feedback shot
  const NEGATIVE_COLOR = "#F44336";       // boundary color over nagative feedback shot
  const FONT_COLOR = "#F44336";

/**
 * Scroll the textbox whenever it overflows due to display of recognized words/sentences
 */
  function scrollTextBox() {
        var textarea = $(VOICE_TEXTBOX);
        if(textarea.length)
            textarea.scrollTop(textarea[0].scrollHeight - textarea.height());
  }
/**
 * pop up the error message as a toast and voice response
 *
 * @param {string} message The error to be displayed
 */
  function displayErrorMessage(message) {

        if(feedbackCount<=3)
            responsiveVoice.speak(message,PERSON);    // voice response of UI        
        Materialize.toast(message, 3000);
  }

/**
 * Adds serial numbers to video shots of current browsing container
 */
  function addSerialNumber(){

        var containerArray = $(".videocontainer");
        var serial = 1;  
        $(containerArray[row]).children('div').each(function(){
            
            $(this).find('.bottomhoverbox').append("<div class='serialnumber'> - "+ (serial) +" - </div>");
            serial++;
        });
  }

/**
 * Displays all commands in a pop up window
 */
  function displayCommands(){

        if($('#commands-modal').css('display') == 'none' ){
           
            $('#commands-modal').openModal();
        }
        else
            displayErrorMessage(ERR1);
  }

/**
 * Closes pop up window of 'all commands' and video player
 */
  function closeWindow(){
     
        var flag=0;
        if(!($('#commands-modal').css('display') == 'none')){
            flag=1;
            $('#commands-modal').closeModal();
        }

        if(!($('#video-modal').css('display') == 'none')){
            flag=1;
            var player = videojs('videoPlayer');
            player.pause();
            $('#video-modal').closeModal();
        }
        
        if(flag==0)
            displayErrorMessage(ERR23);

  }

/**
 * Replay the playing video 
 */
  function replayVideo(){

        if(!($('#video-modal').css('display') == 'none')){
            var player = videojs('videoPlayer');
            player.currentTime(shotStartTime);
            player.play();
        }
        else
            displayErrorMessage(ERR2);
  }

/**
 * Pause the playing video 
 */
  function pauseVideo(){

        if($('#video-modal').is(':visible')){
            var player = videojs('videoPlayer');
            player.pause();
        }
        else
            displayErrorMessage(ERR2);
  }

/**
 * Starts the paused video 
 */
  function startVideo(){
        
        if($('#video-modal').is(':visible')){
            var player = videojs('videoPlayer');
            player.play();
        }
        else
            displayErrorMessage(ERR2);
  }

/**
 * Checks if response is set after 5 sec of feedback given by feedback system
 * If response is set then query is executed w.r.t. feedback command
 *
 * @param {String} feedback command suggested by feedback system
 */ 
  function feedbackResponse(feedbackCommand){

        if(response == 1){

            var baseCommand = baseCommands[feedbackCommand];
            if(followUpCommands.indexOf(baseCommand) == -1){
                
                SpeechKITT.setRecognizedSentence(baseCommand);
                factor = 1;
            }

            commands[feedbackCommand].apply();  
            displayErrorMessage(ERR3);
        }
        else 
          factor = 0;
        
        response = undefined;
  }

/**
 * This function sets the response variable when user say "yes"
 * as a response to feedback given by UI
 */
  function setResponse(){
        if(response == 0)
            response = 1;
        else{
            displayErrorMessage(ERR4);
        }
  }

/**
 * This function prints the sentence with black font in the voice query text box
 * Black font shows that it is not a recognized voice command
 * Unrecognized sentence after pre processing is given to feedback system
 * Feedback command returned is checked further and response is given acordingly
 * feedbackCommand is equal to 1 when feedback response has normalized frequency greater its threshold 
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
        sentences = preProcess(sentences);
        var feedbackCommand = userInterfaceFeedback(sentences);
       
        if(feedbackCommand == undefined){
            factor = 0;
            feedbackCount++;
            displayErrorMessage(ERR5);
        }
        else if(feedbackCommand == 1){
            feedbackCount = 0;
            displayErrorMessage(ERR3);
        }
        else{

            response = 0;
            feedbackCount++;
            displayErrorMessage("Did you mean: " + baseCommands[feedbackCommand].toLowerCase());
            setTimeout(feedbackResponse,5000,feedbackCommand);
        }
  }
  
/**
 * This function prints voice command given by user except the "voice search" query
 * The query printed in text box has #F44336 font color
 *
 * @param {string} phrase Recognized voice query
 * @param {string} command The command executed for recognized voice query
 */ 
  function recognizedSentence(phrase,command) {
        
        feedbackCount = 0;
        if(followUpCommands.indexOf(phrase) == -1){
            SpeechKITT.setRecognizedSentence(phrase);
            factor = 1;
        }

        if(!(command == COMMAND_A || command == COMMAND_B)){
    
            $(VOICE_TEXTBOX).val(phrase.toLowerCase());
            $(VOICE_TEXTBOX).css('color',FONT_COLOR);
            
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
 * This function ignores the speech before saying "voice search"
 * The query printed in voice search query text box is the speech after saying "voice search"
 *
 * @param {string} tag1 String before "voice search"; Ignored
 * @param {string} tag2 String after "voice search"; Will be used as voice search text query
 */
  function voiceSearch_2(tag1,tag2) {
        
        $(VOICE_TEXTBOX).val(tag2);
        $(VOICE_TEXTBOX).css('color',FONT_COLOR);
        scrollTextBox();

        $('#voiceSearchQuery').val(tag2);
  }

/**
 * The function print the speech query after saying "voice query" in voice search query text box
 *
 * @param {string} tag String after "voice search"; Will be used as voice search text query
 */
  function voiceSearch_1(tag) {

        $(VOICE_TEXTBOX).val(tag);
        $(VOICE_TEXTBOX).css('color',FONT_COLOR);
        scrollTextBox();

        $('#voiceSearchQuery').val(tag);
  }

/**
 * Toggles the top bar
 */
  function toggleTopbar(){
        $('body').toggleClass('push-tobottom');
        $('#btnShowTopbar').toggleClass('topOpen');
        $('#btnShowSidebar').toggleClass('topOpen');
        $('#sidebarextension').toggleClass('topOpen');
        $('#topbar').toggleClass('open');
  }

/**
 * Toggles the sidebar
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
 * Toggles both top and sidebar
 */
  function toggleTopSideBar(){
  
          toggleTopbar();
          toggleSidebar();
  }

/**
* Displays the color sketch option for canvas
*/
  function showColorSketch(){
        $('.motionsketch').hide();
        $('.objectsketch').hide();
        $('#color-tool-pane').show();
        $('#sidebarextension').removeClass('open');
        $('#btnShowSidebar').removeClass('open');
        $('#colorsketchbutton').siblings().removeClass('active');
        $('#colorsketchbutton').addClass('active');
  }

/**
* Displays the motion sketch option for canvas
*/
  function showMotionSketch(){
        $('.motionsketch').show();
        $('.objectsketch').show();
        $('#color-tool-pane').hide();
        $('#sidebarextension').removeClass('open');
        $('#btnShowSidebar').removeClass('open');
        $('#motionsketchbutton').siblings().removeClass('active');
        $('#motionsketchbutton').addClass('active');

  }

/**
 * Searches the canvas and voice search query (text query) if available
 */
  function searchCanvasQuery(){
        search();
  }

/**
 * Searches any particular canvas or combination of Canvas
 * The function builds query considering only particular canvases
 * The function display's error and returns when canvas with certain number is not present
 * Goes to catch block if parameter 'tag' contains words instead of numbers 
 * Example- "search canvas 1 3 and 4" will search for first,third and forth canvas 
 *
 * @param {string} tag Integers string seprated by spaces and containing "and" in between
 */ 
  function searchParticularCanvas(tag){

        try{
            var arr = tag.split(" ");
            console.log("starting sketch-based search");
            removeItem = "and";
            arr = $.grep(arr, function(value) {   // removes "and" from arr
               return value != removeItem;
            });
            clearResults();
            var query = "{\"queryType\":\"multiSketch\", \"query\":[";

            var canvas = $(".query-input-container");
      
            for(var index in arr){
            
              var num = replaceEnglishNumber(arr[index]);
              if(num > canvas.length){
                  displayErrorMessage("Canvas "+num+" is not present");
                  return;
              }
              var id = canvas[num-1].id;
              var shotInput = shotInputs[id];

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
        catch(e){
            displayErrorMessage(ERR22);
            console.warn(e);
        }
  }

/**
 * Adds a new canvas
 */
  function addCanvas(){
        newShotInput();
  }

/**
 * Use to split video into sequences
 * Works after video results are completed retrieved
 * Can be executed once after every search
 */
  function splitVideo(){
    
        var resultDisplayed = $(".videocontainer");
        if(resultDisplayed.length == 0){

            displayErrorMessage(ERR6);
        }
        else if(searchRunning){

            displayErrorMessage(ERR7);
        }
        else if(resultDisplayed.length > 0){
            if(!splitVideoExecuted){          // declared in search.js
              
                sequenceSegmentation();
            }
            else{

                displayErrorMessage(ERR8);
            }
        }
        
  }

/**
 * This function selects/sets the color said by user in voice query
 * 
 * @param {string} color Color name in voice query
 */ 
  function selectColor(color){
        try{
            colorByVoice = color.replace(/\s/g, '');      // remove spaces
            colorByVoice = colorByVoice.toLowerCase();
        
            colorByVoice = colourToHex[colorByVoice];
            if(colorByVoice==undefined){
                displayErrorMessage(color +" color is not available");
                return;
            }
            $('span').removeClass("sp-thumb-active");
            $('.sp-preview-inner').css("background-color",colorByVoice);
            for (el in shotInputs) {
                
                shotInputs[el].color.setColor(colorByVoice);
            } 
        }
        catch(e){
            displayErrorMessage(ERR24);
            console.warn(e);
        }   
  }

  $(document).ready(function(){
      
      /**
      *  Selects the color when user clicks on the color selection button
      *  Color selection button is present in the sidebar of UI
      */
      $('.sp-replacer').click(function(){

          colorByVoice = $("#colorInput").spectrum('get');
          if(colorByVoice._format != "rgb")
              colorByVoice._format = "rgb";
          for (el in shotInputs) {
              shotInputs[el].color.setColor(colorByVoice);
          }

         /**
          *  Sets the colorByVoice variable when user clicks on the color platelet 
          *  Color platelets are present on the color selection window
          */
          $('.sp-thumb-el').click(function(){
              
              setTimeout(function(){
                  colorByVoice = $("#colorInput").spectrum('get');
              },100);
          });
      });
  });

/**
 * Fills a particular canvas with the color in voice query
 * The function display's error and returns when canvas with certain number is not present
 * Example: 'fill Canvas 2 with blue colour'
 *
 * @param {Integer} num Canvas number that is to filled with color
 * @param {String} color Name of the color in voice query
 */   
  function fillCanvas(num , color){
        try{
            fillColor = color.replace(/\s/g, '');  // removes the spaces
            fillColor = fillColor.toLowerCase();
        
            fillColor = colourToHex[fillColor];
            if(fillColor==undefined){
                displayErrorMessage(color +" color is not available");
                return;
            }
            var canvas = $(".query-input-container");
            if(num > canvas.length){
                displayErrorMessage("Canvas "+num+" is not present");
                return;
            }
            var id = canvas[num-1].id;
            shotInputs[id].color.setColor(fillColor);
            shotInputs[id].color.fill();
            shotInputs[id].color.setColor(colorByVoice);
        }
        catch(e){
            displayErrorMessage(ERR22);
            console.warn(e);
        }
  }

/**
 * Downloads a particular Canvas in the system as png image
 * The function display's error and returns when canvas with certain number is not present 
 * Goes to catch block when 'num' parameter is null or string 
 *
 * @param {Integer} num Canvas number that has to be downloaded 
 */   
  function downloadCanvas(num){
        
        var canvas = $(".query-input-container");
        if(num > canvas.length){
            displayErrorMessage("Canvas "+num+" is not present");
            return;
        }
        try{
            var id = canvas[num-1].id;
            var shotInput = shotInputs[id];
            var image = shotInput.color.getDataURL("image/png").replace("image/png", "image/octet-stream");
            window.location.href=image;
        }
        catch(e){
            displayErrorMessage(ERR9);
            console.warn(e);
        }
  }

/**
 * Deletes a particular Canvas if available else display's error
 * Goes to catch block when 'num' parameter is null or string 
 * 
 * @param {Integer} num Canvas number that has to be deleted 
 */  
  function deleteCanvas(num){

        var canvas = $(".query-input-container");
        if(num > canvas.length){
            displayErrorMessage("Canvas "+num+" is not present");
            return;
        }
        try{
            var id = canvas[num-1].id;
            destroyCanvas(id);
        }
        catch(e){
            displayErrorMessage(ERR9);
            console.warn(e);
        }
  }

/**
 * Clears a particular Canvas if available else display's error
 * Goes to catch block when 'num' parameter is null or string 
 * 
 * @param {Integer} num Canvas number that has to be cleared 
 */ 
  function clearCanvas(num){

        var canvas = $(".query-input-container");
        if(num > canvas.length){
            displayErrorMessage("Canvas "+num+" is not present");
            return;
        }
        try{
            var id = canvas[num-1].id;

            if($('#colorsketchbutton').hasClass('active'))
                shotInputs[id].color.clear();
            else if($('#motionsketchbutton').hasClass('active'))
                shotInputs[id].motion.clearPaths();
        }
        catch(e){
            displayErrorMessage(ERR9);
            console.warn(e);
        }
  }

/**
 * Increse pen size upto 100 units
 * unit of increase is decided by extent of follow up command else default is 5 units
 * @param {Integer} unit Increase in radius of pen
 */
  function increasePenSize(unit){
        
        if(unit == undefined){
            unit = 5;        
        }
        var size = parseInt($('#draw-radius').get(0).noUiSlider.get());
        
        if(size == 100){
            displayErrorMessage(ERR10);
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
 * unit of decrease is decided by extent of follow up command else default is 5 units
 * @param {Integer} unit Decrease in radius of pen
 */
  function decreasePenSize(unit){
        
        if(unit == undefined){
            unit = 5;            
        }
        var size = parseInt($('#draw-radius').get(0).noUiSlider.get());
        
        if(size == 1){
            displayErrorMessage(ERR11);
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
 * Displays error for cases when no result is retrieved, search is in progress
 * The video container that comes up on scroll is highlighted by blue color border
 */
  function browseNext(unit) {

        if(unit == undefined)
            unit = 1;

        var containerArray = $(".videocontainer");
        if(containerArray.length == 0){

            displayErrorMessage(ERR6);
        }
        else if(searchRunning){

            displayErrorMessage(ERR7);
        }
        else if( containerArray.length > 0 ){

            document.getElementById(containerArray[row].id).style = "";
            $('.serialnumber').remove();

            if(row < containerArray.length-unit){
                row += unit;
            }
            else{
                row = containerArray.length-1;
                displayErrorMessage(ERR12);
            }

            $('html, body').animate({scrollTop: $("#"+containerArray[row].id).offset().top  }, 800);
            document.getElementById(containerArray[row].id).style = "border: 2px solid " + NAVIGATION_COLOR;

            addSerialNumber();
        }
  }

 /**
 * Scrolls up the window to the previous video container
 * Displays error for cases when no result is retrieved, search is in progress
 * The video container that comes up on scroll is highlighted by blue color border
 */ 
  function browsePrevious(unit) {
        
        if(unit == undefined)
            unit = 1;
  
        var containerArray = $(".videocontainer");
        if(containerArray.length == 0){

            displayErrorMessage(ERR6);
        }
        else if(searchRunning){

            displayErrorMessage(ERR7);
        }
        else if( containerArray.length > 0 ){

            document.getElementById(containerArray[row].id).style = "";
            $('.serialnumber').remove();

            if(row >= unit){
                row = row - unit;
            }
            else{
                row = 0;
                displayErrorMessage(ERR13);
            }

            $('html, body').animate({scrollTop: $("#"+containerArray[row].id).offset().top  }, 800);
            document.getElementById(containerArray[row].id).style = "border: 2px solid "+NAVIGATION_COLOR;
        
            addSerialNumber();
        }
  }

 /**
 * Performs the last action of changing pen size with more degree of extent 
 * Works after changing pen size else error is prompted
 * voice query - "even more"/"more"
 */ 
  function followUpPenSize() {
        
        if(factor == 0){
            displayErrorMessage(ERR14);
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
 * Performs the last action of navigation with more degree of extent 
 * Works after browsing video container
 * voice query - "even further"/"further"
 */ 
  function followUpBrowsing() {
        
        if(factor == 0){
            displayErrorMessage(ERR14);
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
              default:
                  displayErrorMessage("This command doesn't work after query: "+lastRecognized);
        }
  }

/**
 * Performs the last action of adding canvas with more degree of extent 
 * Works after adding a new Canvas
 * voice query - "one more"/"again one more"
 */ 
  function followUpCanvas() {
        
        if(factor == 0){
            displayErrorMessage(ERR14);
            return;
        }

        var lastRecognized = SpeechKITT.getLastRecognizedSentence();

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

/**
 * Works only when video is playing
 * Adds the playing video to positive / negative feedback
 * Assigns action to actionVariable and then calls relevanceFeedbackVoice function
 * Query to add to postive feedback - 'add it' and negative feedback - 'remove it'
 */ 
  function followUpFeedback(){

        if($('#video-modal').css('display') == 'none'){
            displayErrorMessage(ERR15);
        }
        else{
            setTimeout(function(){  // delay of 100ms is given so that recognized query got set first

                  var lastRecognized = SpeechKITT.getLastRecognizedSentence();
                  var player = videojs('videoPlayer');
                  player.pause();
                  $('#video-modal').closeModal();
                  if(lastRecognized == QUERY_F){

                      actionVariable = "addVideo";
                      relevanceFeedbackVoice(playingShotBox);
                      actionVariable = null;
                  }
                  else if(lastRecognized == QUERY_G){

                      actionVariable = "removeVideo";
                      relevanceFeedbackVoice(playingShotBox);
                      actionVariable = null;
                  }
                  else
                      displayErrorMessage(ERR5);
            },100);
        }
  }

// Below are some functions used for speech + mouse in combination

/**
 * Checks  if user has clicked on video thumbnail
 * Function is called after 5 seconds of action voice query 
 * If action/click is not occured than it sets actionVariable to null and display's error
 */
  function checkActionOccured(){

        if(!actionOccured){

            actionVariable = null;
            displayErrorMessage(ERR16);      
        }        
  }

/**
 * Works according to actionVariable value 
 * actionValue="addVideo" -> adds video to positive feedback on click over video thumbnail
 * actionValue="removeVideo" -> adds video to negative feedback on click over video thumbnail
 * adds color boubdary over video shots added positive/negative feedback
 *
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
            document.getElementById(shotBox.attr('id')).style.border = "medium solid " + POSITIVE_COLOR;
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
              document.getElementById(shotBox.attr('id')).style.border = "medium solid " + NEGATIVE_COLOR;
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
 * Gives control to a particular function, depending on the value of actionVariable
 * decideAction function is called when user clicks on video thumbnail
 *
 * @param {Object} thumbnail image element
 */
  function decideAction(event){

        switch( actionVariable ) {

            case null:
                displayErrorMessage(ERR17);
                break;

            case "play" :
                actionVariable = null;
                actionOccured = true;
                playingShotBox = $(this);
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

            case "search_play":
                actionVariable = null;
                actionOccured = true;
                playingShotBox = $(this);
                prepare_playback($(this));
                similaritySearch($(this));
                break;

            case "addNumbers":
                actionVariable = null;
                actionOccured = true;
                setVideoContainer($(this));
                break;
        }
  }

/**
 * Adds the thumbnail image on the canvas
 * The image is added always on last canvas (in case of single canvas last will the only present one)
 * 
 * @param {Object} thumbnail Image element
 */
   function addImageCanvas(thumbnail){
 
        var url = thumbnail.attr('src');
        var canvas = $(".query-input-container");
        var id = canvas[canvas.length - 1].id; 
        shotInputs[id].color.loadImageFromUrl(url);
  }

 /**
 * Adds serial numbers to shots of certain video container on which the click event occured
 * 
 * @param {Object} object Thumbnail image element
 */ 
  function setVideoContainer(object){

        var container = $(object).closest('.videocontainer');
        var id = container[0].id;
        var containerArray = $('.videocontainer');

        for(var i=0;i<containerArray.length;i++){
         
            if(containerArray[i].id == id){
                document.getElementById(containerArray[row].id).style = "";
                row = i;
                $('.serialnumber').remove();
                addSerialNumber();
                document.getElementById(containerArray[row].id).style = "border: 2px solid " + NAVIGATION_COLOR;
                break;
            }
        }
  }

/**
 * Checks for cases when the action query is made
 * Assign actionVariable to particular action
 * Cases includes: 1) No video is retrieved
 *                 2) search is in progress
 *                 3) videos retrieved  
 * 
 * @param {String} action that will be performed after click on thumbnail image
 */  
  function checkUseCases(action){

        var resultDisplayed = $(".videocontainer");
        if(resultDisplayed.length == 0){

            displayErrorMessage(ERR6);
        }
        else if(searchRunning){

            displayErrorMessage(ERR7);
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
 * Called when action query to play and search that video is made
 */
  function searchPlayVideo(){

        checkUseCases("search_play");
  }

/**
 * Called when action query to add serial numbers to shots of video container is made
 */
  function addNumbersHere(){

        checkUseCases("addNumbers");
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

            displayErrorMessage(ERR18);
        }
  }

// Functions with suffix as "ByNumber" are called when action query is said by serial number

/**
 * Checks the use cases for the action queries that involed serial number of video
 */
  function checkUseCasesByNumber(num){

        var resultDisplayed = $(".videocontainer");
        if(resultDisplayed.length == 0){

            displayErrorMessage(ERR6);
        }
        else if(searchRunning){

            displayErrorMessage(ERR7);
        }
        else if(resultDisplayed.length > 0){

            var labeledShots = $(".serialnumber");
            if(num == undefined){
                displayErrorMessage(ERR19);
            }
            else if(num > labeledShots.length){
                displayErrorMessage("Video number "+num+" is not available");
            }
            else{

                return false;
            }
       }
       return true;
  }

/**
 * Plays the first shot/video of the current browsing container
 */ 
  function playFirstShot(){

        playVideoByNumber(1);
  }

 /**
 * Used for pre-processing of string containing integer numbers
 * Repalces english number word with its integer value upto 10
 * Example - 'one' -> '1' 
 *
 * @param {Integer} num Number of the video that is going to be played
 */ 
  function replaceEnglishNumber(num){

        for(var i in englishNumbers){
            if(i == num){
                num = englishNumbers[i];
                break;
            }
        }
        return num;  
  }

/**
 * Plays the video by its number
 * Example- 'play video number 3'
 *
 * @param {Integer} num Number of the video that is going to be played
 */
  function playVideoByNumber(num){

        num = replaceEnglishNumber(num);
        if(!checkUseCasesByNumber(num)){

            var labeledShots = $(".serialnumber");
            var object = $(labeledShots[num-1]);
            playingShotBox = object.parent();
            prepare_playback(object.parent());
        }
  }

/**
 * Searches the video by its number
 * Example- 'search video number 4'
 *
 * @param {Integer} num Number of the video that is going to be searched by its ID
 */
  function searchVideoByNumber(num){

        num = replaceEnglishNumber(num);
        if(!checkUseCasesByNumber(num)){

            var labeledShots = $(".serialnumber");
            var object = $(labeledShots[num-1]);
            similaritySearch(object.parent());
        }
  }

/**
 * Drops the video/shot thumbnail by its number on the last canavas present 
 * Example- 'drop image number 3 on Canvas'
 *
 * @param {Integer} num Serial number of the video that is going to be droped on Canvas
 */
  function dropOnCanvasByNumber(num){

        num = replaceEnglishNumber(num);
        if(!checkUseCasesByNumber(num)){

            var labeledShots = $(".serialnumber");
            var object = $(labeledShots[num-1]);
            var thumbnail = $(object.parent().parent().find(".thumbnail"));
            addImageCanvas(thumbnail);
        }
  }

/**
 * Adds the video to positive / negative feedback by video number
 *
 * @param {String} num String containing numbers of videos, seprated by spaces, that has to be considered for relevance feedback
 */
  function feedbackByNumber(num){

        var resultDisplayed = $(".videocontainer");
        if(resultDisplayed.length == 0){

            displayErrorMessage(ERR6);
        }
        else if(searchRunning){

            displayErrorMessage(ERR7);
        }
        else if(resultDisplayed.length > 0){

            var labeledShots = $(".serialnumber");
            if(num == undefined){
                displayErrorMessage(ERR19);
            }
            else{

                var num = num.split(" ");
                removeItem = "and";
                num = $.grep(num, function(value) {
                    return value != removeItem;
                });
                
                var labeledShots = $(".serialnumber");
                var outIndex = "";
              
                for(var i=0;i<num.length;i++){

                    num[i] = replaceEnglishNumber(num[i]);        
                    if(num[i] > labeledShots.length){
                    
                        outIndex += num[i]+" ";
                    }
                    else{
                        var object = $(labeledShots[num[i]-1]);
                        relevanceFeedbackVoice(object.parent());
                    } 
                }

                if(outIndex)
                    displayErrorMessage("Video number "+outIndex+" not available");
            }
       }

       actionVariable = null;   
  }

/**
 * Sets actionVariable to add the video to positive feedback
 * Example- 'include video number 1 5 and 6'
 *
 * @param {String} num String containing numbers of videos, seprated by spaces, that has to be added to positive feedback
 */
  function positiveFeedbackByNumber(num){

        actionVariable = "addVideo";
        feedbackByNumber(num);
  }

/**
 * Sets actionVariable to add the video to negative feedback
 * Example- 'remove video number 1 5 and 6'
 *
 * @param {String} num String containing numbers of videos, seprated by spaces, that has to be added to negative feedback
 */
  function negativeFeedbackByNumber(num){

        actionVariable = "removeVideo";
        feedbackByNumber(num);
  }  

/**
 * Marks all the shots with score greater than particular score
 * Example- 'show me shot greater than 30%'
 *
 * @param {String} num String containing a number and appended with '%'
 */
  function showScoredVideo(num){
        
        var shotBoxes = $(".shotbox");
        if(shotBoxes.length==0)
            displayErrorMessage(ERR20);
        else {

            try{
                $('div').removeClass('filteredShot');
                num = parseInt(num.substring(0,num.length-1));
                for(var i=0;i < shotBoxes.length;i++){
                    
                    var shot = shotBoxes[i];
                    var score = $(shot).find('.score').html();
                    score  = parseInt(score.substring(0,score.length-1));
                    if(score > num){
                        $(shot).addClass("filteredShot");
                    }
                }
            }
            catch(e){
                displayErrorMessage(ERR21);
                console.warn(e);
            }
        }
  }

/**
 * Hide all the shots below particular score
 * Example- 'hide all shots below score _____%'
 *
 * @param {String} num String containing a number and appended with '%'
 */
  function hideSpecificShots(num){

        var shotBoxes = $(".shotbox");
        if(shotBoxes.length==0)
            displayErrorMessage(ERR20);
        else {
            try{
                num = parseInt(num.substring(0,num.length-1));
                for(var i=0;i < shotBoxes.length;i++){
                    
                    var shot = shotBoxes[i];
                    var score = $(shot).find('.score').html();
                    score  = parseInt(score.substring(0,score.length-1));
                    if(score < num){
                        $(shot).addClass("hideshot");
                    }
                }
                $('.hideshot').hide();
            }
            catch(e){
                displayErrorMessage(ERR21);
                console.warn(e);
            }
        }
  }

 /**
 * Shows the hidden shots if any
 */
  function showHiddenShots(){

        $('.hideshot').show();
        $('div').removeClass('hideshot');
  }

/**
 * Tells the total number of shots retrieved after searching 
 */
  function totalShots(){

        var shotBoxes = $(".shotbox");
        if(shotBoxes.length==0)
            displayErrorMessage(ERR20);
        else
            displayErrorMessage("There are total "+shotBoxes.length+" shots retrieved");
  }

/**
 * Tells the number of shots with score greater than particular score
 * Example- 'total shots greater than 30%'
 *
 * @param {String} num String containing a number and appended with '%'
 */  
  function totalSpecificShots(num){
        
        var shotBoxes = $(".shotbox");
        if(shotBoxes.length==0)
            displayErrorMessage(ERR20);
        else {
            try{
                var count=0;
                num = parseInt(num.substring(0,num.length-1));
                for(var i=0;i < shotBoxes.length;i++){
                    
                    var shot = shotBoxes[i];
                    var score = $(shot).find('.score').html();
                    score  = parseInt(score.substring(0,score.length-1));
                    if(score > num){
                       count++;
                    }
                }
                if(count==0)
                  displayErrorMessage("There is no shot greater than "+num+"%");
                else if(count==1)
                  displayErrorMessage("There is 1 shot greater than "+num+"%");
                else
                  displayErrorMessage("There are "+count+" shots greater than "+num+"%");
            }
            catch(e){
                displayErrorMessage(ERR21);
                console.warn(e);
            }
        }
  }

/**
 * Creates a pop up modal (window) which contains all base commands
 */
  function formCommandsModal(){

        var allCommands = "";
        
        for(var phrase in baseCommands){

            allCommands += "&bull;  "+baseCommands[phrase].toLowerCase()+"<br>";
        }

        $('#commands-modal > div > p').html(allCommands);
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
  }

/**
 * Computes frequency of each command using dictionary 
 * Command with maximum frequency is used as a feedback
 * Frequency here signifies the number of tri-grams that matches in unrecognized sentence
 * Sets feedbackCommand to 1 and automatically executes query if normalized frequency is greater than 0.8
 * If normalized frequency is less than 0.2 than feedbackCommand is set to undefined
 *
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

            var processedPhrase = phrase.replace(/[()]/g, '');  // removes '(' and ')'
            var id = commandID[processedPhrase];
            if(maximumFrequency < frequencyCommand[id]){

                maximumFrequency = frequencyCommand[id];
                feedbackCommand = phrase;
            }
        }
        
        if(maximumFrequency / countTrigram >= 0.8){
            
            var baseCommand = baseCommands[feedbackCommand];
            if(followUpCommands.indexOf(baseCommand) == -1){
                
                SpeechKITT.setRecognizedSentence(baseCommand);
                factor = 1;
            }

            commands[feedbackCommand].apply();
            feedbackCommand = 1;
        }

        if(maximumFrequency / countTrigram <= 0.2){
            feedbackCommand = undefined;
        }

        return feedbackCommand;
  }
  
  $(document).ready(function (){

        // apply the language set in languageSpeech.js
        annyang.setLanguage(LANGUAGE);

        // add commands to annyang
        annyang.addCommands(commands);

        // to print recognized speech in console
        annyang.debug(true);

        // adding voice On/Off controls to toggle button
        SpeechKITT.setStartCommand(annyang.start);
        SpeechKITT.setAbortCommand(annyang.abort);
        annyang.addCallback('start', SpeechKITT.onStart);
        annyang.addCallback('end', SpeechKITT.onEnd);

        annyang.addCallback('resultNoMatch', notRecognizedSentence);
        annyang.addCallback('resultMatch', recognizedSentence);

        // instruction that is present on toggle button when it is ON
        SpeechKITT.setInstructionsText(INSTRUCTION); 

        // Define a stylesheet for toogle botton to use
        SpeechKITT.setStylesheet('css/flat-pomegranate.css');

        // Render Speech KITT's interface
        SpeechKITT.vroom();

        formCommandsModal();
        buildDictionary();  

  });

}
else{       // control comes in else block if voiceMode is set false in config.js

    $(document).ready(function (){
        ScoreWeights.meta = 0;
        $('.voice').hide();
    });
}