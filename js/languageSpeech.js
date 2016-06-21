  // set langauge English(UK)
  const LANGUAGE = 'en-GB';

  const INSTRUCTION = "Say 'voice search' followed by your Query";

  const QUERY_A = 'increase size (of pen) (of brush)';
  const QUERY_B = 'decrease size (of pen) (of brush)';
  const QUERY_C = '(move to) next (video) (container)';
  const QUERY_D = '(move to) previous (video) (container)'; 
  const QUERY_E = 'add (a) (new) Canvas (sheet)';  	

  const FOLLOWUP_COMMAND = 'even more';

  var commands = {
      
        'voice search *tag':voiceSearch_1,
        '*tag1 voice search *tag2': voiceSearch_2,
        '(toggle) (open) (close) top bar': toggleTopbar,
        'search (the) (my) (Canvas) (sketch) (painting)': searchCanvas,
        'add (a) (new) Canvas (sheet)': addCanvas,
        'split (video) (into sequences)': splitVideo,
        '(toggle) (open) (close) sidebar': toggleSidebar,
        'increase size (of pen) (of brush)':increasePenSize,
        'decrease size (of pen) (of brush)':decreasePenSize,
        '(move to) next (video) (container)': browseNext,
        '(move to) previous (video) (container)': browsePrevious,
        
        'play (this) (my) (video) (clip)': playVideo,
        'search (this) (my) (video) (clip) id': searchById,
        'include (this) (video) (clip)': positiveFeedback,
        'remove (this) (video) (clip)': negativeFeedback,
        'search (my) (this) feedback': searchFeedback,
        '(put) (drop) (it) (image) (this) on Canvas': dropOnCanvas,

        '(even) more': followUp,

  };

  var baseCommands = {
    
      'voice search *tag'                                 : 'voice search:______',
      '*tag1 voice search *tag2'                          : 'voice search:______',
      '(toggle) (open) (close) top bar'                   : 'toggle top bar',
      'search (the) (my) (Canvas) (sketch) (painting)'    : 'search my Canvas',
      'add (a) (new) Canvas (sheet)'                      : 'add new Canvas',
      'split (video) (into sequences)'                    : 'split video into sequences',
      '(toggle) (open) (close) sidebar'                   : 'toggle sidebar',
      'increase size (of pen) (of brush)'                 : 'increase size of pen',
      'decrease size (of pen) (of brush)'                 : 'decrease size of pen',
      '(move to) next (video) (container)'                : 'next video container',
      '(move to) previous (video) (container)'            : 'previous video container',
      
      'play (this) (my) (video) (clip)'                   : 'play this video',
      'search (this) (my) (video) (clip) id'              : 'search this video id',
      'include (this) (video) (clip)'                     : 'include this video',
      'remove (this) (video) (clip)'                      : 'remove this video',
      'search (my) (this) feedback'                       : 'search my feedback',
      '(put) (drop) (it) (image) (this) on Canvas'        : 'drop image on Canvas',

      '(even) more'                                       : 'even more',

  };

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