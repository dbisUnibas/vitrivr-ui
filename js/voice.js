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
    var voiceText = new Array();   // used for voice search query
    var colorByVoice = "#000000"; // always contains current selected color
    var playingShotBox = null;    // used to store the object of playing video
    var feedbackCount = 0;        // keep counts of number of consecutive feedback response

    var dictionary = new Array();          // dictionary used in feedback system

    // declaring constants
    const VOICE_BOX_ID = "voice"
    const VOICE_TEXTBOX = "voiceTextbox";
    const NAVIGATION_COLOR = "#009688";        // boundary color of current browsing video container
    const POSITIVE_COLOR = "#43a047";       // boundary color over positive feedback shot
    const NEGATIVE_COLOR = "##e53935";       // boundary color over nagative feedback shot


    $(document).ready(function () {
        //set-up voice text box
        var voicetextboxStr = "";
        voicetextboxStr += "<div class=\"voicetextbox\">";
        voicetextboxStr += "<label>voice input<\/label>";
        voicetextboxStr += "<div id =" + VOICE_TEXTBOX + "><\/div>";
        voicetextboxStr += "<\/div>";

        $("#" + VOICE_BOX_ID).html(voicetextboxStr);


        //set-up modal
        var modalStr = "";
        modalStr += " <!-- display commands in voice mode -->";
        modalStr += "		  <div id=\"commands-modal\" class=\"modal modal-fixed-footer\">";
        modalStr += "			    <div class=\"modal-content\">";
        modalStr += "				      <h4>Base Commands<\/h4>";
        modalStr += "				      <p><\/p>";
        modalStr += "			    <\/div>";
        modalStr += "			    <div class=\"modal-footer\">";
        modalStr += "			      	<a class=\" modal-action modal-close waves-effect waves-green btn-flat\">Ok<\/a>";
        modalStr += "			      	<div style=\"padding:0.5em\">Click <a target=\"_blank\" href=\"voicecommands.html\">here<\/a> to see all available voice commands<\/div>";
        modalStr += "			    <\/div>";
        modalStr += "		  <\/div>";

        $("body").append(modalStr);
    });


    /**
     * Scroll the textbox whenever it overflows due to display of recognized words/sentences
     */
    function scrollTextBox() {
        var textarea = $("#" + VOICE_TEXTBOX);
        if (textarea.length) {
            textarea.scrollTop(textarea[0].scrollHeight - textarea.height());
        }
    }

    /**
     * Adds serial numbers to video shots of current browsing container
     */
    function addSerialNumber() {
        var containerArray = $(".videocontainer");
        var serial = 1;
        $(containerArray[row]).children('div').each(function () {
            $(this).find('.bottomhoverbox').append("<div class='serialnumber'> - " + (serial) + " - </div>");
            serial++;
        });
    }

    /**
     * Displays all commands in a pop up window
     */
    function displayCommands() {
        if ($('#commands-modal').css('display') == 'none') {
            $('#commands-modal').openModal();
        } else {
            displayErrorMessage(ERR_WINDOW_OPEN);
        }
    }

    /**
     * Closes pop up window of 'all commands' and video player
     */
    function closeWindow() {
        var flag = 0;
        if (!($('#commands-modal').css('display') == 'none')) {
            flag = 1;
            $('#commands-modal').closeModal();
        }

        if (!($('#video-modal').css('display') == 'none')) {
            flag = 1;
            var player = videojs('videoPlayer');
            player.pause();
            $('#video-modal').closeModal();
        }

        if (flag == 0) {
            displayErrorMessage(ERR_NO_WINDOW_OPEN);
        }
    }


    /**
     * Checks if response is set after 5 sec of feedback given by feedback system
     * If response is set then query is executed w.r.t. feedback command
     *
     * @param {String} feedback command suggested by feedback system
     */
    function feedbackResponse(feedbackCommand) {
        if (response == 1) {
            var baseCommand = baseCommands[feedbackCommand];
            if (QUERY_FOLLOW_UP.indexOf(baseCommand) == -1) {
                SpeechKITT.setRecognizedSentence(baseCommand);
                factor = 1;
            }

            commands[feedbackCommand].apply();	
            displayMessage(MSG_OK);
        } else {
            factor = 0;
        }

        response = undefined;
    }

    /**
     * This function sets the response variable when user say "yes"
     * as a response to feedback given by UI
     */
    function setResponse() {
        if (response == 0) {
            response = 1;
        } else {
            displayMessage(ERR_YES);
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

        $("#" + VOICE_TEXTBOX).html($("#" + VOICE_TEXTBOX).html() + " " + sentences);
        $("#" + VOICE_TEXTBOX).css('color', NEGATIVE_COLOR);
        scrollTextBox();
        sentences = preProcess(sentences);
        var feedbackCommand = userInterfaceFeedback(sentences);

        if (feedbackCommand == undefined) {
            factor = 0;
            feedbackCount++;

            displayErrorMessage(ERR_NOT_UNDERSTOOD, feedbackCount <= 3);
        } else if (feedbackCommand == 1) {
            feedbackCount = 0;			
            displayMessage(MSG_OK);
        } else {
            response = 0;
            feedbackCount++;
            displayMessage("Did you mean: " + baseCommands[feedbackCommand].toLowerCase());
            setTimeout(feedbackResponse, 5000, feedbackCommand);
        }
    }

    /**
     * This function prints voice command given by user except the "voice search" query
     * The query printed in text box has #F44336 font color
     *
     * @param {string} phrase Recognized voice query
     * @param {string} command The command executed for recognized voice query
     */
    function recognizedSentence(phrase, command) {
        feedbackCount = 0;
        if (QUERY_FOLLOW_UP.indexOf(phrase) == -1) {
            SpeechKITT.setRecognizedSentence(phrase);
            factor = 1;
        }

        if (!(command == QUERY_VOICE_SEARCH || command == QUERY_VOICE_SEARCH_2)) {
            $("#" + VOICE_TEXTBOX).html(phrase.toLowerCase());
            scrollTextBox();
        }
    }

    /**
     * Filters out the stop words from unrecognized sentence
     *
     * @param {string} str Unrecognized voice query
     */
    function preProcess(str) {
        var before = str.split(" ");
        var after = "";
        for (var i = 0; i < before.length; i++) {
            if (stopwords.indexOf(before[i]) == -1) {
                after += before[i] + " ";
            }
        }
        return after.trim();
    }


    /**
     * The function print the speech query after saying "text search" in text query box
     *
     * @param {string} tag String after the command; will be used as text query
     */
    function textSearch(tag) {
        $("#" + VOICE_TEXTBOX).html(tag);
        scrollTextBox();
        $('#textquery').val(tag);
    }


    /**
     * This function selects/sets the color said by user in voice query
     *
     * @param {string} color Color name in voice query
     */
    function selectColor(color) {
        try {
            colorByVoice = color.replace(/\s/g, '');      // remove spaces
            colorByVoice = colorByVoice.toLowerCase();

            colorByVoice = colourToHex[colorByVoice];
            if (colorByVoice == undefined) {
                displayErrorMessage(color + " color is not available");
                return;
            }
            $('span').removeClass("sp-thumb-active");
            $('.sp-preview-inner').css("background-color", colorByVoice);
            for (el in shotInputs) {
                shotInputs[el].color.setColor(colorByVoice);
            }
        } catch (e) {
            displayErrorMessage(ERR_WHICH_COLOR);
        }
    }

    $(document).ready(function () {
        /**
         *  Selects the color when user clicks on the color selection button
         *  Color selection button is present in the sidebar of UI
         */
        $('.sp-replacer').click(function () {

            colorByVoice = $("#colorInput").spectrum('get');
            if (colorByVoice._format != "rgb")
                colorByVoice._format = "rgb";
            for (el in shotInputs) {
                shotInputs[el].color.setColor(colorByVoice);
            }

            /**
             *  Sets the colorByVoice variable when user clicks on the color platelet
             *  Color platelets are present on the color selection window
             */
            $('.sp-thumb-el').click(function () {

                setTimeout(function () {
                    colorByVoice = $("#colorInput").spectrum('get');
                }, 100);
            });
        });
    });


    /**
     * Performs the last action of changing pen size with more degree of extent
     * Works after changing pen size else error is prompted
     * voice query - "even more"/"more"
     */
    function followUpPenSize() {
        if (factor == 0) {
            displayErrorMessage(ERR_QUERY_NECESSARY);
            return;
        }

        var lastRecognized = SpeechKITT.getLastRecognizedSentence();
        factor++;

        var lastRecognizedArray = lastRecognized.split(" ");
        var a, b;
        a = 0;
        b = 0;

        for (var i = 0; i < lastRecognizedArray.length; i++) {
            var word = lastRecognizedArray[i];

            if (QUERY_INCREASE_PENSIZE.includes(word)) {
                a++;
            }
            if (QUERY_DECREASE_PENSIZE.includes(word)) {
                b++;
            }
        }

        switch (lastRecognizedArray.length) {
            case a:
                increasePenSize(5 * factor);
                break;
            case b:
                decreasePenSize(5 * factor);
                break;
            default:
                displayErrorMessage("This command doesn't work after query: " + lastRecognized);
        }
    }

    /**
     * Performs the last action of navigation with more degree of extent
     * Works after browsing video container
     * voice query - "even further"/"further"
     */
    function followUpBrowsing() {
        if (factor == 0) {
            displayErrorMessage(ERR_QUERY_NECESSARY);
            return;
        }

        var lastRecognized = SpeechKITT.getLastRecognizedSentence();
        factor++;

        var lastRecognizedArray = lastRecognized.split(" ");
        var c, d;
        c = 0;
        d = 0;

        for (var i = 0; i < lastRecognizedArray.length; i++) {
            var word = lastRecognizedArray[i];

            if (QUERY_NEXT_VIDEOCONTAINER.includes(word)) {
                c++;
            }
            if (QUERY_PREVIOUS_VIDEOCONTAINER.includes(word)) {
                d++;
            }
        }

        switch (lastRecognizedArray.length) {
            case c:
                browseNext(2 * (factor - 1));
                break;
            case d:
                browsePrevious(2 * (factor - 1));
                break;
            default:
                displayErrorMessage("This command doesn't work after query: " + lastRecognized);
        }
    }

    /**
     * Performs the last action of adding canvas with more degree of extent
     * Works after adding a new Canvas
     * voice query - "one more"/"again one more"
     */
    function followUpCanvas() {

        if (factor == 0) {
            displayErrorMessage(ERR_QUERY_NECESSARY);
            return;
        }

        var lastRecognized = SpeechKITT.getLastRecognizedSentence();

        var lastRecognizedArray = lastRecognized.split(" ");
        var e = 0;

        for (var i = 0; i < lastRecognizedArray.length; i++) {
            var word = lastRecognizedArray[i];

            if (QUERY_ADDCANVAS.includes(word)) {
                e++;
            }
        }

        if (e == lastRecognizedArray.length)
            addCanvas();
        else
            displayErrorMessage("This command doesn't work after query: " + lastRecognized);
    }

    /**
     * Works only when video is playing
     * Adds the playing video to positive / negative feedback
     * Assigns action to actionVariable and then calls relevanceFeedbackVoice function
     * Query to add to postive feedback - 'add it' and negative feedback - 'remove it'
     */
    function followUpFeedback() {
        if ($('#video-modal').css('display') == 'none') {
            displayErrorMessage(ERR_PLAYING_VIDEO);
        } else {
            setTimeout(function () {  // delay of 100ms is given so that recognized query got set first

                var lastRecognized = SpeechKITT.getLastRecognizedSentence();
                var player = videojs('videoPlayer');
                player.pause();
                $('#video-modal').closeModal();
                if (lastRecognized == QUERY_ADDVIDEO) {
                    actionVariable = "addVideo";
                    relevanceFeedbackVoice(playingShotBox);
                    actionVariable = null;
                } else if (lastRecognized == QUERY_REMOVEVIDEO) {
                    actionVariable = "removeVideo";
                    relevanceFeedbackVoice(playingShotBox);
                    actionVariable = null;
                } else
                    displayErrorMessage(ERR_NOT_UNDERSTOOD);
            }, 100);
        }
    }

// Below are some functions used for speech + mouse in combination

    /**
     * Checks  if user has clicked on video thumbnail
     * Function is called after 5 seconds of action voice query
     * If action/click is not occured than it sets actionVariable to null and display's error
     */
    function checkActionOccured() {
        if (!actionOccured) {
            actionVariable = null;
            displayErrorMessage(ERR_NO_CLICK);
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
    function relevanceFeedbackVoice(object) {

        var shotBox = object.parent().parent();
        var shotId = parseInt(shotBox.attr('id').substring(1));

        if (actionVariable == "addVideo") {
            if ($.inArray(shotId, rf_positive) >= 0) { //remove
                document.getElementById(shotBox.attr('id')).style.border = "";
                remove_element(rf_positive, shotId);
            }
            else { //add
                if ($.inArray(shotId, rf_negative) >= 0) {
                    remove_element(rf_negative, shotId);
                }
                rf_positive.push(shotId);
                document.getElementById(shotBox.attr('id')).style.border = "medium solid " + POSITIVE_COLOR;
            }
        } else if (actionVariable == "removeVideo") {//negative
            if ($.inArray(shotId, rf_negative) >= 0) { //remove
                document.getElementById(shotBox.attr('id')).style.border = "";
                remove_element(rf_negative, shotId);
            } else { //add
                if ($.inArray(shotId, rf_positive) >= 0) {
                    remove_element(rf_positive, shotId);
                }

                rf_negative.push(shotId);
                document.getElementById(shotBox.attr('id')).style.border = "medium solid " + NEGATIVE_COLOR;
            }
        }

        if (rf_positive.length > 0) {
            $('#rf-button').show();
        } else {
            $('#rf-button').hide();
        }
    }

    /**
     * Gives control to a particular function, depending on the value of actionVariable
     * decideAction function is called when user clicks on video thumbnail
     *
     * @param {Object} thumbnail image element
     */
    function decideAction(event) {
        switch (actionVariable) {
            case null:
                displayErrorMessage(ERR_ACTION_QUERY);
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
    function addImageCanvas(thumbnail) {
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
    function setVideoContainer(object) {

        var container = $(object).closest('.videocontainer');
        var id = container[0].id;
        var containerArray = $('.videocontainer');

        for (var i = 0; i < containerArray.length; i++) {
            if (containerArray[i].id == id) {
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
    function checkUseCases(action) {

        var resultDisplayed = $(".videocontainer");
        if (resultDisplayed.length == 0) {
            displayErrorMessage(ERR_NO_RESULTS);
        } else if (searchRunning) {
            displayErrorMessage(ERR_WAIT_IN_PROGRESS);
        } else if (resultDisplayed.length > 0) {
            actionVariable = action;
            actionOccured = false;
            setTimeout(checkActionOccured, 5000);
        }
    }

    /**
     * Called when action query to play video is made
     */
    function playVideo() {
        checkUseCases("play");
    }

    /**
     * Called when action query to search video by ID is made
     */
    function searchById() {
        checkUseCases("search");
    }

    /**
     * Called when action query to add video to positive feedback is made
     */
    function positiveFeedback() {
        checkUseCases("addVideo");
    }

    /**
     * Called when action query to add video to negative feedback is made
     */
    function negativeFeedback() {
        checkUseCases("removeVideo");
    }

    /**
     * Called when action query to add thumbnail image on the canvas is made
     */
    function dropOnCanvas() {
        checkUseCases("dropImage");
    }

    /**
     * Called when action query to play and search that video is made
     */
    function searchPlayVideo() {
        checkUseCases("search_play");
    }

    /**
     * Called when action query to add serial numbers to shots of video container is made
     */
    function addNumbersHere() {
        checkUseCases("addNumbers");
    }

    /**
     * Called when action query to search relevance feedback is made
     * There must be atleast one video added as positive feedback
     */
    function searchFeedback() {
        if (rf_positive.length > 0) {
            actionVariable = null;
            search(-1, rf_positive, rf_negative);
        } else {
            displayErrorMessage(ERR_MISSING_VIDEO_FEEDBACK);
        }
    }

// Functions with suffix as "ByNumber" are called when action query is said by serial number

    /**
     * Checks the use cases for the action queries that involed serial number of video
     */
    function checkUseCasesByNumber(num) {

        var resultDisplayed = $(".videocontainer");
        if (resultDisplayed.length == 0) {
            displayErrorMessage(ERR_NO_RESULTS);
        } else if (searchRunning) {
            displayErrorMessage(ERR_WAIT_IN_PROGRESS);
        } else if (resultDisplayed.length > 0) {
            var labeledShots = $(".serialnumber");
            if (num == undefined) {
                displayErrorMessage(ERR_SAY_NUMBER);
            } else if (num > labeledShots.length) {
                displayErrorMessage("Video number " + num + " is not available");
            } else {
                return false;
            }
        }
        return true;
    }

    /**
     * Plays the first shot/video of the current browsing container
     */
    function playFirstShot() {
        playVideoByNumber(1);
    }

    /**
     * Used for pre-processing of string containing integer numbers
     * Replaces english number word with its integer value upto 10
     * Example - 'one' -> '1'
     *
     * @param {Integer} num Number of the video that is going to be played
     */
    function replaceEnglishNumber(num) {
        for (var i in englishNumbers) {
            if (i == num) {
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
    function playVideoByNumber(num) {
        num = replaceEnglishNumber(num);
        if (!checkUseCasesByNumber(num)) {
            var labeledShots = $(".serialnumber");
            var object = $(labeledShots[num - 1]);
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
    function searchVideoByNumber(num) {
        num = replaceEnglishNumber(num);
        if (!checkUseCasesByNumber(num)) {
            var labeledShots = $(".serialnumber");
            var object = $(labeledShots[num - 1]);
            similaritySearch(object.parent());
        }
    }

    /**
     * Drops the video/shot thumbnail by its number on the last canavas present
     * Example- 'drop image number 3 on Canvas'
     *
     * @param {Integer} num Serial number of the video that is going to be droped on Canvas
     */
    function dropOnCanvasByNumber(num) {
        num = replaceEnglishNumber(num);
        if (!checkUseCasesByNumber(num)) {
            var labeledShots = $(".serialnumber");
            var object = $(labeledShots[num - 1]);
            var thumbnail = $(object.parent().parent().find(".thumbnail"));
            addImageCanvas(thumbnail);
        }
    }

    /**
     * Adds the video to positive / negative feedback by video number
     *
     * @param {String} num String containing numbers of videos, seprated by spaces, that has to be considered for relevance feedback
     */
    function feedbackByNumber(num) {
        var resultDisplayed = $(".videocontainer");
        if (resultDisplayed.length == 0) {
            displayErrorMessage(ERR_NO_RESULTS);
        } else if (searchRunning) {
            displayErrorMessage(ERR_WAIT_IN_PROGRESS);
        } else if (resultDisplayed.length > 0) {
            var labeledShots = $(".serialnumber");
            if (num == undefined) {
                displayErrorMessage(ERR_SAY_NUMBER);
            } else {
                var num = num.split(" ");
                removeItem = "and";
                num = $.grep(num, function (value) {
                    return value != removeItem;
                });

                var labeledShots = $(".serialnumber");
                var outIndex = "";

                for (var i = 0; i < num.length; i++) {

                    num[i] = replaceEnglishNumber(num[i]);
                    if (num[i] > labeledShots.length) {

                        outIndex += num[i] + " ";
                    } else {
                        var object = $(labeledShots[num[i] - 1]);
                        relevanceFeedbackVoice(object.parent());
                    }
                }

                if (outIndex)
                    displayErrorMessage("Video number " + outIndex + " not available");
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
    function positiveFeedbackByNumber(num) {
        actionVariable = "addVideo";
        feedbackByNumber(num);
    }

    /**
     * Sets actionVariable to add the video to negative feedback
     * Example- 'remove video number 1 5 and 6'
     *
     * @param {String} num String containing numbers of videos, seprated by spaces, that has to be added to negative feedback
     */
    function negativeFeedbackByNumber(num) {
        actionVariable = "removeVideo";
        feedbackByNumber(num);
    }

    /**
     * Marks all the shots with score greater than particular score
     * Example- 'show me shot greater than 30%'
     *
     * @param {String} num String containing a number and appended with '%'
     */
    function showScoredVideo(num) {
        var shotBoxes = $(".shotbox");
        if (shotBoxes.length == 0) {
            displayErrorMessage(ERR_NO_SHOT);
        } else {
            try {
                $('div').removeClass('filteredShot');
                num = parseInt(num.substring(0, num.length - 1));
                for (var i = 0; i < shotBoxes.length; i++) {

                    var shot = shotBoxes[i];
                    var score = $(shot).find('.score').html();
                    score = parseInt(score.substring(0, score.length - 1));
                    if (score > num) {
                        $(shot).addClass("filteredShot");
                    }
                }
            } catch (e) {
                displayErrorMessage(ERR_SAY_SCORE);
            }
        }
    }


    /**
     * Creates a pop up modal (window) which contains all base commands
     */
    function formCommandsModal() {
        var allCommands = "";
        for (var phrase in baseCommands) {
            allCommands += baseCommands[phrase].toLowerCase() + "<br>";
        }
        $('#commands-modal > div > p').html(allCommands);
    }


    const NGRAM = 3;

    /**
     * Builds a dictionary using the N-grams words of commands
     * Each N-gram is mapped to an array of IDs of commands containing that 3-gram
     */
    function buildDictionary() {
        //TODO: split commands
        var commands = baseCommands;

        for (var command in commands) {
            var map = getSentenceNGramsMap(preProcess(command), NGRAM);

            for (var key in map) {
                var ngramcount = map[key];
                var ngram = ngramcount.ngram;

                var count = ngramcount.count;

                if (!dictionary[ngram]) {
                    dictionary[ngram] = [];
                }

                dictionary[ngram].push({command: command, count: count});
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
    function userInterfaceFeedback(sentence) {
        var map = getSentenceNGramsMap(sentence, NGRAM);

        var prefilter = {};

        for (var key in map) {
            var ngramcount = map[key];
            var ngram = ngramcount.ngram;
            var detectedCommands = dictionary[ngram];

            for (var ckey in detectedCommands) {
                var commandcount = detectedCommands[ckey];
                var command = commandcount.command;

                if (prefilter[command]) {
                    prefilter[command] = {command: command, count: prefilter[command].count + 1};
                } else {
                    prefilter[command] = {command: command, count: 1};
                }
            }
        }

        var maxCommand = undefined;
        var maxScore = 0;

        for (var key in prefilter) {
            var result = prefilter[key];

            var score = result.count / Object.keys(getSentenceNGramsMap(result.command, NGRAM)).length;
            if (score > maxScore) {
                maxCommand = result.command;
                maxScore = score;
            }
        }

        var feedbackCommand;
        
        if (maxScore >= 0.7) {
            var baseCommand = commands[maxCommand];
            if (QUERY_FOLLOW_UP.indexOf(maxCommand) == -1) {
                SpeechKITT.setRecognizedSentence(maxCommand);
                factor = 1;
            }
							
            feedbackCommand = 1;
        } else if (maxScore <= 0.2) {
            feedbackCommand = undefined;
        } else {
            feedbackCommand = maxCommand;
        }
			
        return feedbackCommand;
    }

    /**
     *
     * @param sentence
     * @param length
     * @returns {{}}
     */
    function getSentenceNGramsMap(sentence, length) {
        var sngram = getSentenceNGrams(sentence, length);

        //TODO: filter out stop words

        var map = {};

        for (var i = 0; i < sngram.length; i++) {
            if (sngram[i] in map) {
                map[sngram[i]] = {ngram: map[sngram[i]], count: map[sngram[i]].count + 1};
            } else {
                map[sngram[i]] = {ngram: sngram[i], count: 1};
            }
        }

        return map;
    }


    /**
     *
     * @param sentence
     * @param length
     * @returns {Array}
     */
    function getSentenceNGrams(sentence, length) {
        var ngrams = [];
        sentence = sentence.trim().toLowerCase().replace(/[^a-z ]/gi, '').split(' ');

        for (var i = 0; i < sentence.length; i++) {
            ngrams = ngrams.concat(getNGrams(sentence[i], length));
        }

        return ngrams;
    }


    /**
     *
     * @param word
     * @param length
     * @returns {Array}
     */
    function getNGrams(word, length) {
        var ngrams = [];

        word = " ".repeat(length - 1) + word + " ".repeat(length - 1);

        for (var i = 0; i < word.length - (length - 1); i++) {
            var tmpGram = '';

            for (var j = 0; j < length; j++) {
                tmpGram += word[i + j];
            }

            ngrams.push(tmpGram);
        }

        return ngrams;
    }


    $(document).ready(function () {

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

        // have speech button activated for 120 minutes
        SpeechKITT.rememberStatus(120);

        // Define a stylesheet for toogle botton to use
        SpeechKITT.setStylesheet('css/flat-pomegranate.css');

        // Render Speech KITT's interface
        SpeechKITT.vroom();

        formCommandsModal();
        buildDictionary();

        $('.voice').show();

    });
} else {       // control comes in else block if voiceMode is set false in config.js
    $(document).ready(function () {
        ScoreWeights.meta = 0;
        $('.voice').hide();
    });
}