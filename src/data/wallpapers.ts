import { ImageSourcePropType } from 'react-native';

export type Wallpaper = { id: string; title: string; subtitle: string; image: ImageSourcePropType };

export const WALLPAPERS: Wallpaper[] = [
  { id: 'w1', title: 'बजरंगबली', subtitle: 'शक्ति और भक्ति', image: require('../img/hanuman_01.jpg') },
  { id: 'w2', title: 'संकटमोचन', subtitle: 'हर संकट का हरण', image: require('../img/hanuman_02.jpg') },
  { id: 'w3', title: 'पवनपुत्र', subtitle: 'वायु के वेग समान', image: require('../img/hanuman_03.jpg') },
  { id: 'w4', title: 'राम भक्त', subtitle: 'राम नाम में रमे', image: require('../img/hanuman_04.jpg') },
  { id: 'w5', title: 'अंजनिसुत', subtitle: 'माता अंजनि के लाल', image: require('../img/hanuman_05.jpg') },
  { id: 'w6', title: 'महावीर', subtitle: 'अतुल बल के धाम', image: require('../img/hanuman_06.jpg') },
  { id: 'w7', title: 'रुद्रावतार', subtitle: 'शिव के ग्यारहवें रुद्र', image: require('../img/hanuman_07.jpg') },
  { id: 'w8', title: 'कपीश्वर', subtitle: 'वानरों के राजा', image: require('../img/hanuman_08.jpg') },
  { id: 'w9', title: 'जय हनुमान', subtitle: 'जय जय जय हनुमान', image: require('../img/hanuman_09.jpg') },
];
