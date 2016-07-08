  // set langauge English(UK)
  const LANGUAGE = 'en-GB';

  // Gets displayed on ON/Off GUI button
  const INSTRUCTION = "Say 'voice search' followed by your Query";

  // These queries are used in follow up commands
  const QUERY_A = 'increase size (of pen) (of brush)';
  const QUERY_B = 'decrease size (of pen) (of brush)';
  const QUERY_C = '(show) (me) (move to) next (video) (container)';
  const QUERY_D = '(show) (me) (move to) previous (video) (container)'; 
  const QUERY_E = 'add (a) (new) Canvas (sheet)';  	

  var followUpCommands = ['even more','more','even further','further','one more','again one more','One More', 'yes'];

  const PERSON = "UK English Female";
// voice queries/commands
  var commands = {
      
        'voice search *tag'                                       : voiceSearch_1,
        '*tag1 voice search *tag2'                                : voiceSearch_2,
        '(toggle) (open) (close) top bar'                         : toggleTopbar,
        'search (the) (my) (Canvas) (sketch) (painting)'          : searchCanvas,
        'add (a) (new) Canvas (sheet)'                            : addCanvas,
        'split (video) (into sequences)'                          : splitVideo,
        '(toggle) (open) (close) sidebar'                         : toggleSidebar,
        'increase size (of pen) (of brush)'                       : increasePenSize,
        'decrease size (of pen) (of brush)'                       : decreasePenSize,
        '(show) (me) (move to) next (video) (container)'          : browseNext,
        '(show) (me) (move to) previous (video) (container)'      : browsePrevious,
        'search Canvas *tag'                                      : searchParticularCanvas,
        '(show) (me) colour sketch (tool) (option)'               : showColorSketch,
        '(show) (me) motion sketch (tool) (option)'               : showMotionSketch,
      
        'play (this) (my) (video) (clip)'                         : playVideo,
        'search (this) (my) (video) (clip) id'                    : searchById,
        'include (this) (video) (clip)'                           : positiveFeedback,
        'remove (this) (video) (clip)'                            : negativeFeedback,
        'search (my) (this) feedback'                             : searchFeedback,
        '(put) (drop) (it) (this) (image) on Canvas'              : dropOnCanvas,

        '(even) more'                                             : followUpPenSize,
        '(even) further'                                          : followUpBrowsing,
        '(again) one more'                                        : followUpCanvas,
        'One More'                                                : followUpCanvas,
        'yes'                                                     : setResponse,

        '(show) (display) (overview of) all commands'             : displayCommands,
        'close this (window) (box)'                               : closeWindow,

  };

// Commands mapped to their corrosponding base commands
  var baseCommands = {
    
      'voice search *tag'                                 : 'Voice search:______',
      '*tag1 voice search *tag2'                          : '______ voice search:______',
      '(toggle) (open) (close) top bar'                   : 'Toggle top bar',
      'search (the) (my) (Canvas) (sketch) (painting)'    : 'Search my Canvas',
      'add (a) (new) Canvas (sheet)'                      : 'Add new Canvas',
      'split (video) (into sequences)'                    : 'Split video into sequences',
      '(toggle) (open) (close) sidebar'                   : 'Toggle sidebar',
      'increase size (of pen) (of brush)'                 : 'Increase size of pen',
      'decrease size (of pen) (of brush)'                 : 'Decrease size of pen',
      '(move to) next (video) (container)'                : 'Next video container',
      '(move to) previous (video) (container)'            : 'Previous video container',
      'search Canvas *tag'                                : 'Search canvas _____ and _____ ',
      '(show) (me) colour sketch (tool) (option)'         : 'Show me colour sketch',
      '(show) (me) motion sketch (tool) (option)'         : 'Show me motion sketch',

      'play (this) (my) (video) (clip)'                   : 'Play this video',
      'search (this) (my) (video) (clip) id'              : 'Search this video ID',
      'include (this) (video) (clip)'                     : 'Include this video',
      'remove (this) (video) (clip)'                      : 'Remove this video',
      'search (my) (this) feedback'                       : 'Search my feedback',
      '(put) (drop) (it) (image) (this) on Canvas'        : 'Drop this image on Canvas',

      '(even) more'                                       : 'Even more',
      '(even) further'                                    : 'Even further',
      'One More'                                          : 'One more',
      '(again) one more'                                  : 'Again one more',
      'yes'                                               : 'Yes',

      '(show) (display) (overview of) all commands'       : 'Show all commands',
      'close this (window) (box)'                         : 'close this window',
  };

// stop words which get filtered out from unrecognized sentence
var stopwords = ["a", "about", "above", "above", "across", "after", "afterwards", "against", "all", "almost", "alone", "along", "already", "also","although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway", "anywhere", "are", "around", "as",  "at", "back","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", "etc", "eveno", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the"];

/** 

Languages and there respective code to be added as a parameter in  annyang.setLanguage(parameter)

Afrikaans af
Basque eu
Bulgarian bg
Catalan ca
Arabic (Egypt) ar-EG
Arabic (Jordan) ar-JO
Arabic (Kuwait) ar-KW
Arabic (Lebanon) ar-LB
Arabic (Qatar) ar-QA
Arabic (UAE) ar-AE
Arabic (Morocco) ar-MA
Arabic (Iraq) ar-IQ
Arabic (Algeria) ar-DZ
Arabic (Bahrain) ar-BH
Arabic (Lybia) ar-LY
Arabic (Oman) ar-OM
Arabic (Saudi Arabia) ar-SA
Arabic (Tunisia) ar-TN
Arabic (Yemen) ar-YE
Czech cs
Dutch nl-NL
English (Australia) en-AU
English (Canada) en-CA
English (India) en-IN
English (New Zealand) en-NZ
English (South Africa) en-ZA
English(UK) en-GB
English(US) en-US
Finnish fi
French fr-FR
Galician gl
German de-DE
Hebrew he
Hungarian hu
Icelandic is
Italian it-IT
Indonesian id
Japanese ja
Korean ko
Latin la
Mandarin Chinese zh-CN
Traditional Taiwan zh-TW
Simplified China zh-CN ?
Simplified Hong Kong zh-HK
Yue Chinese (Traditional Hong Kong) zh-yue
Malaysian ms-MY
Norwegian no-NO
Polish pl
Pig Latin xx-piglatin
Portuguese pt-PT
Portuguese (Brasil) pt-BR
Romanian ro-RO
Russian ru
Serbian sr-SP
Slovak sk
Spanish (Argentina) es-AR
Spanish (Bolivia) es-BO
Spanish (Chile) es-CL
Spanish (Colombia) es-CO
Spanish (Costa Rica) es-CR
Spanish (Dominican Republic) es-DO
Spanish (Ecuador) es-EC
Spanish (El Salvador) es-SV
Spanish (Guatemala) es-GT
Spanish (Honduras) es-HN
Spanish (Mexico) es-MX
Spanish (Nicaragua) es-NI
Spanish (Panama) es-PA
Spanish (Paraguay) es-PY
Spanish (Peru) es-PE
Spanish (Puerto Rico) es-PR
Spanish (Spain) es-ES
Spanish (US) es-US
Spanish (Uruguay) es-UY
Spanish (Venezuela) es-VE
Swedish sv-SE
Turkish tr
Zulu zu

*/