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

const QUERY_VOICE_SEARCH = "voice search *tag";
const QUERY_VOICE_SEARCH_2 = "*tag1 voice search *tag2";

const QUERY_FOLLOW_UP = ['even more', 'more', 'even further', 'further', 'one more', 'again one more', 'One More', 'yes'];

const PERSON = "UK English Female";   // accent of voice response by UI

// Static error messages
const ERR_WINDOW_OPEN = 'Window is open already';
const ERR_VIDEO_PLAYING = 'There is no video playing';
const OK = 'Ok';
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
    {comm:'voice search *tag', func: voiceSearch_1, out: 'voice search:______'},
    {comm:'*tag1 voice search *tag2', func: voiceSearch_2, out: '______ voice search:______'},
    {comm:'(toggle) (open) (close) top bar', func: toggleTopbar, out: 'toggle top bar'},
    {comm:'search (the) (my) (Canvas) (sketch) (painting)', func: searchCanvasQuery, out: 'search my Canvas'},
    {comm:'(do) (perform) query search', func: searchCanvasQuery, out: 'perform query search'},
    {comm:'add (a) (new) Canvas (sheet)', func: addCanvas, out: 'add new Canvas'},
    {comm:'split (video) (into sequences)', func: splitVideo, out: 'split video into sequences'},
    {comm:'(toggle) (open) (close) sidebar', func: toggleSidebar, out: 'toggle sidebar'},
    {comm:'increase size (of pen) (of brush)', func: increasePenSize, out: 'increase size of pen'},
    {comm:'decrease size (of pen) (of brush)', func: decreasePenSize, out: 'decrease size of pen'},
    {comm:'(show) (me) (move to) next (video) (container)', func: browseNext, out: 'show me next video container'},
    {comm:'(show) (me) (move to) previous (video) (container)', func: browsePrevious, out: 'show me previous video container'},
    {comm:'search Canvas *tag', func: searchParticularCanvas, out: 'search Canvas _____ and _____'},
    {comm:'(show) (me) colour sketch (tool) (option)', func: showColorSketch, out: 'show me colour sketch'},
    {comm:'(show) (me) motion sketch (tool) (option)', func: showMotionSketch, out: 'show me motion sketch'},
    {comm:'select *color colour (pen) (brush)', func: selectColor, out: 'select _____ colour'},
    {comm:'fill Canvas (number) :num with *color (colour)', func: fillCanvas, out: 'fill Canvas _____ with _____ colour'},
    {comm:'download Canvas (number) :num', func: downloadCanvas, out: 'download Canvas number _____'},
    {comm:'delete Canvas (number) :num', func: deleteCanvas, out: 'delete Canvas number _____'},
    {comm:'clearcanvas (number) :num', func: clearCanvas, out: 'clearcanvas number _____'},
    {comm:'clear Canvas (number) :num', func: clearCanvas, out: 'clear Canvas number _____'},

    {comm:'play (this) (my) (video) (clip) (shot)', func: playVideo, out: 'play this video'},
    {comm:'search (this) (my) (video) (clip) (shot) id', func: searchById, out: 'search this video ID'},
    {comm:'include (this) (video) (clip) (shot)', func: positiveFeedback, out: 'include this video'},
    {comm:'remove (this) (video) (clip) (shot)', func: negativeFeedback, out: 'remove this video'},
    {comm:'search (my) (this) feedback', func: searchFeedback, out: 'search my feedback'},
    {comm:'(put) (drop) (this) (image) (shot) on Canvas', func: dropOnCanvas, out: 'drop this shot on Canvas'},
    {comm:'add (serial) numbers here', func: addNumbersHere, out: 'add numbers here'},
    {comm:'play first (video) (shot)', func: playFirstShot, out: 'play first shot'},

    {comm:'play (me) video (clip) (shot) (with) (serial) number :num', func: playVideoByNumber, out: 'play video shot number:______'},
    {comm:'search (me) video (clip) (shot) (with) (serial) number :num', func: searchVideoByNumber, out: 'search video number:______'},
    {comm:'(put) (drop) (image) (shot) number :num on Canvas', func: dropOnCanvasByNumber, out: 'drop shot number:______ on Canvas'},
    {comm:'include (video) (shot) number *num', func: positiveFeedbackByNumber, out: 'include video number _____ and _____'},
    {comm:'remove (video) (shot) number *num', func: negativeFeedbackByNumber, out: 'remove video number _____ and _____'},

    {comm:'(toggle) (open) (close) top and sidebar', func: toggleTopSideBar, out: 'toggle top and sidebar'},
    {comm:'search and play (this) (my) (video) (shot)', func: searchPlayVideo, out: 'search and play this video'},

    {comm:'show (me) (video) (shot) greater than (score) :num', func: showScoredVideo, out: 'show me video greater than score _____%'},
    {comm:'total (number of) (shots) (videos) retrieved', func: totalShots, out: 'total number of shots retrieved'},
    {comm:'total (number of) (shots) (videos) greater than (score) :num', func: totalSpecificShots, out: 'total number of shots greater than score _____%'},
    {comm:'hide (all) (video) (shots) below (score) :num', func: hideSpecificShots, out: 'hide all shots below score _____%'},
    {comm:'show (all) (video) (shots) again', func: showHiddenShots, out: 'show all shots again'},

    {comm:'(even) more', func: followUpPenSize, out: 'even more'},
    {comm:'(even) further', func: followUpBrowsing, out: 'even further'},
    {comm:'One More', func: followUpCanvas, out: 'one more'},
    {comm:'(again) one more', func: followUpCanvas, out: 'again one more'},
    {comm:'yes', func: setResponse, out: 'yes'},
    {comm:'add it', func: followUpFeedback, out: 'add it'},
    {comm:'remove it', func: followUpFeedback, out: 'remove it'},

    {comm:'(show) (display) (overview of) all commands', func: displayCommands, out: 'show all commands'},
    {comm:'what can I say', func: displayCommands, out: 'what can I say'},
    {comm:'close this (window) (box)', func: closeWindow, out: 'close this window'},
    {comm:'replay (the) (video)', func: replayVideo, out: 'replay the video'},
    {comm:'pause (the) (video)', func: pauseVideo, out: 'pause the video'},
    {comm:'start (the) (video)', func: startVideo, out: 'start the video'}
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
var stopwords = ["a", "about", "above", "above", "across", "after", "afterwards", "against", "all", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "amoungst", "amount", "an", "and", "another", "any", "anyhow", "anyone", "anything", "anyway", "anywhere", "are", "around", "as", "at", "back", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom", "but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven", "else", "elsewhere", "empty", "enough", "etc", "eveno", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own", "part", "per", "perhaps", "please", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the"];

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