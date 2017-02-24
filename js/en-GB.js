/**
 * Contains speech Commands, Error messages, Queries, colors, Language settings
 * <P>
 *
 * This file contains all language dependent things
 *
 * @author Prateek Goel
 */

// set langauge English(UK)
const LANGUAGE = 'en-GB';

// Gets displayed on ON/Off GUI button
const INSTRUCTION = "Say 'show all commands' for overview of voice queries";

// These queries are used in follow up commands
const QUERY_INCREASE_PENSIZE = 'increase size (of pen) (of brush)';
const QUERY_DECREASE_PENSIZE = 'decrease size (of pen) (of brush)';
const QUERY_NEXT_VIDEOCONTAINER = '(show) (me) (move to) next (video) (container)';
const QUERY_PREVIOUS_VIDEOCONTAINER = '(show) (me) (move to) previous (video) (container)';
const QUERY_ADDCANVAS = 'add (a) (new) Canvas (sheet)';
const QUERY_ADDVIDEO = 'add it';
const QUERY_REMOVEVIDEO = 'remove it';

const QUERY_VOICE_SEARCH = "text search *tag";
const QUERY_VOICE_SEARCH_2 = "*tag1 text search *tag2";

const QUERY_FOLLOW_UP = ['even more', 'more', 'even further', 'further', 'one more', 'again one more', 'one more', 'yes'];

const PERSON = "UK English Female";   // accent of voice response by UI

// Static error messages
const MSG_OK = 'Ok';
const ERR_WINDOW_OPEN = 'Window is open already';
const ERR_VIDEO_PLAYING = 'There is no video playing';
const ERR_YES = 'Please say yes just after my feedback';
const ERR_NOT_UNDERSTOOD = "Sorry I haven't understood you";
const ERR_NO_RESULTS = 'Query not executed as there is no video results retrieved';
const ERR_WAIT_IN_PROGRESS = 'Please wait while search is in progress';
const ERR_QUERY_EXECUTED_ALREADY = 'Query already executed';
const ERR_CANVAS_NUMBER_MISSING = 'Please say canvas number after the query';
const ERR_INCREASING_PENSIZE = 'Size of pen can not be increased';
const ERR_DECREASING_PENSIZE = 'Size of pen can not be decreased';
const ERR_BOTTOM = 'You are at the bottom';
const ERR_TOP = 'You are at the top';
const ERR_QUERY_NECESSARY = 'First say some query';
const ERR_PLAYING_VIDEO = 'This command works while playing a video';
const ERR_NO_CLICK = 'User has not clicked any shot';
const ERR_ACTION_QUERY = 'Please say an action query';
const ERR_MISSING_VIDEO_FEEDBACK = 'There must be at least one video added as positive feedback';
const ERR_SAY_NUMBER = 'Please also say shot number';
const ERR_NO_SHOT = 'There is no shot retrieved';
const ERR_SAY_SCORE = 'Please also say score';
const ERR_CHECK_VOICE = 'Please check the voice query';
const ERR_NO_WINDOW_OPEN = 'No window is open';
const ERR_WHICH_COLOR = 'Please also say which color';


var template = [


    {comm:'(toggle) top bar', func: toggleTopbar, out: 'toggle top bar'},
    {comm:'open top bar', func: toggleTopbar, out: 'open top bar'},
    {comm:'close top bar', func: toggleTopbar, out: 'close top bar'},

    {comm:'(toggle) sidebar', func: toggleSidebar, out: 'toggle sidebar'},
    {comm:'open sidebar', func: toggleSidebar, out: 'open sidebar'},
    {comm:'close sidebar', func: toggleSidebar, out: 'close sidebar'},

    {comm:'add (a) (new) canvas', func: addCanvas, out: 'add a new canvas'},
    {comm:'add (a) (new) sheet', func: addCanvas, out: 'add a new sheet'},

    {comm:'increase size (of brush)', func: increasePenSize, out: 'increase size of brush'},
    {comm:'increase size (of pen)', func: increasePenSize, out: 'increase size of pen'},
    {comm:'decrease size (of brush)', func: decreasePenSize, out: 'decrease size of brush'},
    {comm:'decrease size (of pen)', func: decreasePenSize, out: 'decrease size of pen'},
    {comm:'select *color colour (pen)', func: selectColor, out: 'select _____ colour'},
    {comm:'select *color colour (brush)', func: selectColor, out: 'select _____ colour'},

    {comm:'fill canvas with *color (color)', func: fillCanvasColor, out: 'fill canvas with _____ color'},
    {comm:'fill canvas (number) :num with *color (color)', func: fillCanvasNumColor, out: 'fill canvas _____ with _____ color'},
    {comm:'fill canvas (number) :num with (color) *color ', func: fillCanvasNumColor, out: 'fill canvas _____ with _____ color'},
    {comm:'download canvas (number) :num', func: downloadCanvas, out: 'download Canvas number _____'},
    {comm:'delete canvas (number) :num', func: deleteCanvas, out: 'delete Canvas number _____'},
    {comm:'clear canvas (number) :num', func: clearCanvas, out: 'clear canvas number _____'},

    {comm:'search (me) for (the) (this) (following) text *tag', func: textSearch, out: 'search for text ______'},
    {comm:'search (me) using (the) (this) (following) text *tag', func: textSearch, out: 'search using text ______'},
    {comm:'search (me) with (the) (this) (following) text *tag', func: textSearch, out: 'search with text ______'},
    {comm:'search (me) for (the) (this) (following) word *tag', func: textSearch, out: 'search for word ______'},
    {comm:'search (me) using (the) (this) (following) word *tag', func: textSearch, out: 'search using word ______'},
    {comm:'search (me) with (the) (this) (following) word *tag', func: textSearch, out: 'search with word ______'},
		
    {comm:'search (the) (my) canvas', func: searchCanvasQuery, out: 'search the canvas'},
    {comm:'search', func: searchCanvasQuery, out: 'search'},
    {comm:'search (the) (my) sketch', func: searchCanvasQuery, out: 'search the sketch'},
    {comm:'search (the) (my) painting', func: searchCanvasQuery, out: 'search the sketch'},
    {comm:'do query', func: searchCanvasQuery, out: 'do query'},
    {comm:'perform query', func: searchCanvasQuery, out: 'perform query'},
    {comm:'search canvas *tag', func: searchParticularCanvas, out: 'search canvas _____ and _____'},

    {comm:'split', func: splitVideo, out: 'split'},
    {comm:'split videos', func: splitVideo, out: 'split videos'},
    {comm:'split videos into sequences', func: splitVideo, out: 'split videos into sequences'},
    {comm:'split results', func: splitVideo, out: 'split results'},

    {comm:'(show) (me) next (video) (container)', func: browseNext, out: 'show me next video container'},
    {comm:'(move to) next (video) (container)', func: browseNext, out: 'move to next video container'},
    {comm:'(show) (me) previous (video) (container)', func: browsePrevious, out: 'show me previous video container'},
    {comm:'(move to) previous (video) (container)', func: browsePrevious, out: 'move to previous video container'},

    {comm:'(show) (me) colour sketch (tool) (option)', func: showColorSketch, out: 'show me colour sketch'},
    {comm:'(show) (me) motion sketch (tool) (option)', func: showMotionSketch, out: 'show me motion sketch'},

    {comm:'play (this) (video) (clip)', func: playVideo, out: 'play this video clip'},
    {comm:'play (this) (shot)', func: playVideo, out: 'play this shot'},

    {comm:'search (video) id', func: searchById, out: 'search video ID'},
    {comm:'search (clip) id', func: searchById, out: 'search clip ID'},
    {comm:'search (shot) id', func: searchById, out: 'search shot ID'},

    {comm:'include (this) (video)', func: positiveFeedback, out: 'include this video'},
    {comm:'include (this) (clip)', func: positiveFeedback, out: 'include this clip'},
    {comm:'include (this) (shot)', func: positiveFeedback, out: 'include this shot'},
    {comm:'remove (this) (video)', func: negativeFeedback, out: 'remove this video'},
    {comm:'remove (this) (clip)', func: negativeFeedback, out: 'remove this clip'},
    {comm:'remove (this) (shot)', func: negativeFeedback, out: 'remove this shot'},

    {comm:'search (my) feedback', func: searchFeedback, out: 'search my feedback'},
    {comm:'search (this) feedback', func: searchFeedback, out: 'search this feedback'},

    {comm:'(put) (drop) (this) (image) (shot) on Canvas', func: dropOnCanvas, out: 'drop this shot on canvas'},

    {comm:'add (serial) numbers (here)', func: addNumbersHere, out: 'add numbers here'},
    {comm:'play first (video) (shot)', func: playFirstShot, out: 'play first shot'},
    {comm:'play (me) video (clip) (shot) (with) (serial) number :num', func: playVideoByNumber, out: 'play video shot number:______'},
    {comm:'search (me) video (clip) (shot) (with) (serial) number :num', func: searchVideoByNumber, out: 'search video number:______'},
    {comm:'(put) (drop) (image) (shot) number :num on Canvas', func: dropOnCanvasByNumber, out: 'drop shot number:______ on Canvas'},
    {comm:'include (video) (shot) number *num', func: positiveFeedbackByNumber, out: 'include video number _____ and _____'},
    {comm:'remove (video) (shot) number *num', func: negativeFeedbackByNumber, out: 'remove video number _____ and _____'},

    {comm:'(toggle) (open) (close) top and sidebar', func: toggleTopSideBar, out: 'toggle top and sidebar'},
    {comm:'search and play (this) (my) (video) (shot)', func: searchPlayVideo, out: 'search and play this video'},

    {comm:'show (me) (video) (shot) greater than (score) :num', func: showScoredVideo, out: 'show me video greater than score _____%'},
    {comm:'(what is) (the) total (number of) (shots) (videos) retrieved', func: totalShots, out: 'what is the total number of shots retrieved'},
    {comm:'(count) (the) total (number of) (shots) (videos) retrieved', func: totalShots, out: 'count the total number of shots retrieved'},
    {comm:'(what is) (the) total (number of) (shots) (videos) greater than (score) :num', func: totalSpecificShots, out: 'what is the total number of shots greater than score _____%'},
    {comm:'(count) (the) total (number of) (shots) (videos) greater than (score) :num', func: totalSpecificShots, out: 'count total number of shots greater than score _____%'},
    {comm:'hide (all) (video) (shots) below (score) :num', func: hideSpecificShots, out: 'hide all shots below score _____%'},
    {comm:'show (all) (video) (shots) again', func: showHiddenShots, out: 'show all shots again'},

    {comm:'(even) more', func: followUpPenSize, out: 'even more'},
    {comm:'(even) further', func: followUpBrowsing, out: 'even further'},
    {comm:'One More', func: followUpCanvas, out: 'one more'},
    {comm:'(again) one more', func: followUpCanvas, out: 'again one more'},
    {comm:'yes', func: setResponse, out: 'yes'},
    {comm:'add it', func: followUpFeedback, out: 'add it'},
    {comm:'remove it', func: followUpFeedback, out: 'remove it'},

    {comm:'(show) all commands', func: displayCommands, out: 'show all commands'},
    {comm:'(display) all commands', func: displayCommands, out: 'show all commands'},
    {comm:'(overview of) all commands', func: displayCommands, out: 'show all commands'},

    {comm:'what can I say', func: displayCommands, out: 'what can I say'},
    {comm:'close this (window) (box)', func: closeWindow, out: 'close this window'},
    {comm:'replay (the) (video)', func: replayVideo, out: 'replay the video'},
    {comm:'pause (the) (video)', func: pauseVideo, out: 'pause the video'},
    {comm:'start (the) (video)', func: startVideo, out: 'start the video'},
	
    {comm:'hey retriever', func: helloMessage, out: 'hey vitreevr'}
];

// voice queries/commands linked to their corresponding functions
function buildCommands(){
    var commands = {};
    for (var i = 0; i < template.length; ++i){
        commands[template[i].comm] = template[i].func;
    }
    return commands;
};
var commands = buildCommands();


// Commands mapped to their corrosponding base commands
function buildBaseCommands(){
    var commands = {};
    for (var i = 0; i < template.length; ++i){
        commands[template[i].comm] = template[i].out;
    }
    return commands;
};
var baseCommands = buildBaseCommands();

// stop words which get filtered out from unrecognized sentence
var stopwords = ["a", "the", "please"];

// used in preprocessing to replace english number words with integers
var englishNumbers = {

    "one": "1",
    "two": "2",
    "to": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9",
    "ten": "10",

};

// color mapped to their respective hex codes
var colourToHex = {

    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aqua": "#00ffff",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "black": "#000000",
    "blanchedalmond": "#ffebcd",
    "blue": "#0000ff",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgrey": "#a9a9a9",
    "darkgreen": "#006400",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkbrown": "#654321",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategrey": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgrey": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "fuchsia": "#ff00ff",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "grey": "#808080",
    "green": "#008000",
    "greenyellow": "#adff2f",
    "golden": "#daa520",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred ": "#cd5c5c",
    "indigo": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgrey": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategrey": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "lime": "#00ff00",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "maroon": "#800000",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370d8",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "navy": "#000080",
    "oldlace": "#fdf5e6",
    "olive": "#808000",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#d87093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "purple": "#800080",
    "red": "#ff0000",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "silver": "#c0c0c0",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategrey": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "teal": "#008080",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "white": "#ffffff",
    "whitesmoke": "#f5f5f5",
    "yellow": "#ffff00",
    "yellowgreen": "#9acd32"
};