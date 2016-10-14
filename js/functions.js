const NAVIGATION_COLOR = "#009688";        // boundary color of current browsing video container

/**
 * pop up the error message
 *
 * @param {string} message The error to be displayed
 * @param {boolean} spoken Whether voice feedback should be given, default true
 */
function displayErrorMessage(message, spoken) {
    spoken = typeof spoken !== 'undefined' ? spoken : true;

    displayMessage("Error: " + message, spoken);
}

/**
 * pop up the message to display
 *
 * @param {string} message The message to be displayed
 * @param {boolean} spoken Whether voice feedback should be given, default true
 */
function displayMessage(message, spoken) {
    spoken = typeof spoken !== 'undefined' ? spoken : true;

    Materialize.toast(message, 3000);

    if(spoken){
        speakMessage(message);
    }
}

/**
 * message to speak
 * @param {string} message The message to be spoken.
 */
function speakErrorMessage(message){
    responsiveVoice.speak("Error: " + message, PERSON);    // voice response of UI
}

/**
 * message to speak
 * @param {string} message The message to be spoken.
 */
function speakMessage(message){
    responsiveVoice.speak(message, PERSON);    // voice response of UI
}

/**
 * Toggles the top bar
 */
function toggleTopbar() {
    $('body').toggleClass('push-tobottom');
    $('#btnShowTopbar').toggleClass('topOpen');
    $('#btnShowSidebar').toggleClass('topOpen');
    $('#sidebarextension').toggleClass('topOpen');
    $('#topbar').toggleClass('open');
}

/**
 * Toggles the sidebar
 */
function toggleSidebar() {
    if ($('#sidebar').hasClass('open') && $('#sidebarextension').hasClass('open')) {
        $('#sidebarextension').removeClass('open');
        $('#btnShowSidebar').removeClass('open');

    }
    $('#sidebar').toggleClass('open');
    $('body').toggleClass('push-toright');
}

/**
 * Toggles both top and sidebar
 */
function toggleTopSideBar() {
    toggleTopbar();
    toggleSidebar();
}

/**
 * Displays the color sketch option for canvas
 */
function showColorSketch() {
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
function showMotionSketch() {
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
function searchCanvasQuery() {
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
function searchParticularCanvas(tag) {
    var arr = tag.split(" ");
    removeItem = "and";
    arr = $.grep(arr, function (value) {   // removes "and" from arr
        return value != removeItem;
    });
    searchParticularCanvases(arr);
}

/**
 * Use to split video into sequences
 * Works after video results are completed retrieved
 * Can be executed once after every search
 */
function splitVideo() {
    var resultDisplayed = $(".videocontainer");
    if (resultDisplayed.length == 0) {
        displayErrorMessage(ERR_NO_RESULTS);
    } else if (searchRunning) {
        displayErrorMessage(ERR_WAIT_IN_PROGRESS);
    } else if (resultDisplayed.length > 0) {
        if (!splitVideoExecuted) {          // declared in search.js
            sequenceSegmentation();
        } else {
            displayErrorMessage(ERR_QUERY_EXECUTED_ALREADY);
        }
    }
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
function searchParticularCanvases(arr) {
    try {
        console.log("starting sketch-based search");
        clearResults();
        var query = "{\"queryType\":\"multiSketch\", \"query\":[";

        var canvas = $(".query-input-container");

        for (var index in arr) {

            var num = replaceEnglishNumber(arr[index]);
            if (num > canvas.length) {
                displayErrorMessage("Canvas " + num + " is not present");
                return;
            }
            var id = canvas[num - 1].id;
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
    catch (e) {
        displayErrorMessage(ERR_CHECK_VOICE);
    }
}

/**
 * Adds a new canvas
 */
function addCanvas() {
    newShotInput();
}


/**
 * Downloads a particular Canvas in the system as png image
 * The function display's error and returns when canvas with certain number is not present
 * Goes to catch block when 'num' parameter is null or string
 *
 * @param {Integer} num Canvas number that has to be downloaded
 */
function downloadCanvas(num) {
    var canvas = $(".query-input-container");
    if (num > canvas.length) {
        displayErrorMessage("Canvas " + num + " is not present");
        return;
    }
    try {
        var id = canvas[num - 1].id;
        var shotInput = shotInputs[id];
        var image = shotInput.color.getDataURL("image/png").replace("image/png", "image/octet-stream");
        window.location.href = image;
    } catch (e) {
        displayErrorMessage(ERR_CANVAS_NUMBER_MISSING);
        console.warn(e);
    }
}

/**
 * Deletes a particular Canvas if available else display's error
 * Goes to catch block when 'num' parameter is null or string
 *
 * @param {Integer} num Canvas number that has to be deleted
 */
function deleteCanvas(num) {
    var canvas = $(".query-input-container");
    if (num > canvas.length) {
        displayErrorMessage("Canvas " + num + " is not present");
        return;
    }
    try {
        var id = canvas[num - 1].id;
        destroyCanvas(id);
    } catch (e) {
        displayErrorMessage(ERR_CANVAS_NUMBER_MISSING);
        console.warn(e);
    }
}

/**
 * Clears a particular Canvas if available else display's error
 * Goes to catch block when 'num' parameter is null or string
 *
 * @param {Integer} num Canvas number that has to be cleared
 */
function clearCanvas(num) {
    var canvas = $(".query-input-container");
    if (num > canvas.length) {
        displayErrorMessage("Canvas " + num + " is not present");
        return;
    }
    try {
        var id = canvas[num - 1].id;

        if ($('#colorsketchbutton').hasClass('active'))
            shotInputs[id].color.clear();
        else if ($('#motionsketchbutton').hasClass('active'))
            shotInputs[id].motion.clearPaths();
    } catch (e) {
        displayErrorMessage(ERR_CANVAS_NUMBER_MISSING);
        console.warn(e);
    }
}

/**
 * Increse pen size upto 100 units
 * unit of increase is decided by extent of follow up command else default is 5 units
 * @param {Integer} unit Increase in radius of pen
 */
function increasePenSize(unit) {
    changePenSize(unit);
}

/**
 * Decrease pen size till 1 unit
 * unit of decrease is decided by extent of follow up command else default is 5 units
 * @param {Integer} unit Decrease in radius of pen
 */
function decreasePenSize(unit) {
    changePenSize(-unit);
}


/**
 * Changes pen size
 * @param unit
 */
function changePenSize(unit) {
    if (unit == undefined) {
        unit = 5;
    }
    var size = parseInt($('#draw-radius').get(0).noUiSlider.get());

    var newSize = size + unit;

    if (newSize > 100) {
        displayErrorMessage(ERR_INCREASING_PENSIZE);
    } else if (newSize < 1) {
        displayErrorMessage(ERR_DECREASING_PENSIZE);
    } else {
        for (el in shotInputs) {
            shotInputs[el].color.setLineWidth(newSize);
        }
        $('#draw-radius').get(0).noUiSlider.set(newSize);
    }
}


/**
 * Fills a particular canvas with the color in voice query
 * The function display's error and returns when canvas with certain number is not present
 * Example: 'fill Canvas 2 with blue colour'
 *
 * @param {Integer} num Canvas number that is to filled with color
 * @param {String} color Name of the color in voice query
 */
function fillCanvas(num, color) {
    try {
        fillColor = color.replace(/\s/g, '');  // removes the spaces
        fillColor = fillColor.toLowerCase();

        fillColor = colourToHex[fillColor];
        if (fillColor == undefined) {
            displayErrorMessage(color + " color is not available");
            return;
        }
        var canvas = $(".query-input-container");
        if (num > canvas.length) {
            displayErrorMessage("Canvas " + num + " is not present");
            return;
        }
        var id = canvas[num - 1].id;
        shotInputs[id].color.setColor(fillColor);
        shotInputs[id].color.fill();
        shotInputs[id].color.setColor(colorByVoice);
    }
    catch (e) {
        displayErrorMessage(ERR_CHECK_VOICE);
        console.warn(e);
    }
}


/**
 * Scrolls down the window to the next video container
 * Displays error for cases when no result is retrieved, search is in progress
 * The video container that comes up on scroll is highlighted by blue color border
 */
function browseNext(unit) {
    if (unit == undefined) {
        unit = 1;
    }

    var containerArray = $(".videocontainer");
    if (containerArray.length == 0) {
        displayErrorMessage(ERR_NO_RESULTS);
    } else if (searchRunning) {
        displayErrorMessage(ERR_WAIT_IN_PROGRESS);
    } else if (containerArray.length > 0) {
        $("#" + containerArray[row].id).removeClass("highlightedResultBox");
		
        $('.serialnumber').remove();

        if (row < containerArray.length - unit) {
            row += unit;
        } else {
            row = containerArray.length - 1;
            displayErrorMessage(ERR_BOTTOM);
        }

        $('html, body').animate({scrollTop: $("#" + containerArray[row].id).offset().top}, 800);
        $("#" + containerArray[row].id).addClass("highlightedResultBox");

        addSerialNumber();
    }
}

/**
 * Scrolls up the window to the previous video container
 * Displays error for cases when no result is retrieved, search is in progress
 * The video container that comes up on scroll is highlighted by blue color border
 */
function browsePrevious(unit) {
    if (unit == undefined) {
        unit = 1;
    }

    var containerArray = $(".videocontainer");
    if (containerArray.length == 0) {

        displayErrorMessage(ERR_NO_RESULTS);
    } else if (searchRunning) {
        displayErrorMessage(ERR_WAIT_IN_PROGRESS);
    } else if (containerArray.length > 0) {

        $("#" + containerArray[row].id).removeClass("highlightedResultBox");
        $('.serialnumber').remove();

        if (row >= unit) {
            row = row - unit;
        } else {
            row = 0;
            displayErrorMessage(ERR_TOP);
        }

        $('html, body').animate({scrollTop: $("#" + containerArray[row].id).offset().top}, 800);
        $("#" + containerArray[row].id).addClass("highlightedResultBox");

        addSerialNumber();
    }
}


/**
 * Starts the paused video
 */
function startVideo() {
    if ($('#video-modal').is(':visible')) {
        var player = videojs('videoPlayer');
        player.play();
    } else {
        displayErrorMessage(ERR_VIDEO_PLAYING);
    }
}

/**
 * Pause the playing video
 */
function pauseVideo() {
    if ($('#video-modal').is(':visible')) {
        var player = videojs('videoPlayer');
        player.pause();
    } else {
        displayErrorMessage(ERR_VIDEO_PLAYING);
    }
}

/**
 * Replay the playing video
 */
function replayVideo() {
    if (!($('#video-modal').css('display') == 'none')) {
        var player = videojs('videoPlayer');
        player.currentTime(shotStartTime);
        player.play();
    } else {
        displayErrorMessage(ERR_VIDEO_PLAYING);
    }
}

/**
 * Hide all the shots below particular score
 * Example- 'hide all shots below score _____%'
 *
 * @param {String} num String containing a number and appended with '%'
 */
function hideSpecificShots(num) {
    var shotBoxes = $(".shotbox");
    if (shotBoxes.length == 0) {
        displayErrorMessage(ERR_NO_SHOT);
    } else {
        try {
            num = parseInt(num.substring(0, num.length - 1));
            for (var i = 0; i < shotBoxes.length; i++) {

                var shot = shotBoxes[i];
                var score = $(shot).find('.score').html();
                score = parseInt(score.substring(0, score.length - 1));
                if (score < num) {
                    $(shot).addClass("hideshot");
                }
            }
            $('.hideshot').hide();
        } catch (e) {
            displayErrorMessage(ERR_SAY_SCORE);
            console.warn(e);
        }
    }
}

/**
 * Shows the hidden shots if any
 */
function showHiddenShots() {
    $('.hideshot').show();
    $('div').removeClass('hideshot');
}

/**
 * Tells the total number of shots retrieved after searching
 */
function totalShots() {
    var shotBoxes = $(".shotbox");
    if (shotBoxes.length == 0) {
        displayErrorMessage(ERR_NO_SHOT);
    } else {
        displayErrorMessage("There are " + shotBoxes.length + " shots retrieved");
    }
}

/**
 * Tells the number of shots with score greater than particular score
 * Example- 'total shots greater than 30%'
 *
 * @param {String} num String containing a number and appended with '%'
 */
function totalSpecificShots(num) {
    var shotBoxes = $(".shotbox");
    if (shotBoxes.length == 0) {
        displayErrorMessage(ERR_NO_SHOT);
    } else {
        try {
            var count = 0;
            num = parseInt(num.substring(0, num.length - 1));
            for (var i = 0; i < shotBoxes.length; i++) {

                var shot = shotBoxes[i];
                var score = $(shot).find('.score').html();
                score = parseInt(score.substring(0, score.length - 1));
                if (score > num) {
                    count++;
                }
            }
            if (count == 0) {
                displayErrorMessage("There is no shot with a score greater than " + num + "%");
            } else if (count == 1) {
                displayErrorMessage("There is 1 shot with a score greater than " + num + "%");
            } else {
                displayErrorMessage("There are " + count + " shots with a score greater than " + num + "%");
            }
        } catch (e) {
            displayErrorMessage(ERR_SAY_SCORE);
            console.warn(e);
        }
    }
}