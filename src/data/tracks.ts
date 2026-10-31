/**
 * The nine bundled devotional tracks. Audio lives in src/audio and artwork in
 * src/img; both are packaged inside the app, so everything plays offline.
 */
import type { ImageSourcePropType } from 'react-native';

export type Track = {
  /** 1-based; also the position in the playlist. */
  number: number;
  title: string;
  titleEnglish: string;
  /** Short line shown under the title. */
  subtitle: string;
  kind: 'चालीसा' | 'बाण' | 'अष्टक' | 'आरती' | 'भजन';
  image: ImageSourcePropType;
  /** require() result — react-native-video accepts it as a source. */
  audio: number;
  /** Only the Chalisa has verse-by-verse lyrics and meaning for now. */
  hasLyrics: boolean;
};

export const TRACKS: Track[] = [
  {
    number: 1,
    title: 'श्री हनुमान चालीसा',
    titleEnglish: 'Shree Hanuman Chalisa',
    subtitle: 'गोस्वामी तुलसीदास कृत · ४० चौपाई',
    kind: 'चालीसा',
    image: require('../img/hanuman_01.jpg'),
    audio: require('../audio/Shree_Hanuman_Chalisa.mp3'),
    hasLyrics: true,
  },
  {
    number: 2,
    title: 'बजरंग बाण',
    titleEnglish: 'Bajrang Baan',
    subtitle: 'संकट निवारण का शक्तिशाली पाठ',
    kind: 'बाण',
    image: require('../img/hanuman_02.jpg'),
    audio: require('../audio/Bajrang_Baan.mp3'),
    hasLyrics: false,
  },
  {
    number: 3,
    title: 'संकटमोचन हनुमान अष्टक',
    titleEnglish: 'Sankatmochan Hanuman Ashtak',
    subtitle: 'मंगलवार का विशेष पाठ',
    kind: 'अष्टक',
    image: require('../img/hanuman_03.jpg'),
    audio: require('../audio/Sankatmochan_Hanuman_Ashtak.mp3'),
    hasLyrics: false,
  },
  {
    number: 4,
    title: 'आरती कीजे हनुमान लला की',
    titleEnglish: 'Aarti Kije Hanuman Lala Ki',
    subtitle: 'श्री हनुमान जी की आरती',
    kind: 'आरती',
    image: require('../img/hanuman_04.jpg'),
    audio: require('../audio/Aarti_Kije_Hanuman_Lala_Ki.mp3'),
    hasLyrics: false,
  },
  {
    number: 5,
    title: 'जय हनुमान गोसाईं',
    titleEnglish: 'Jai Hanuman Gosai',
    subtitle: 'भक्ति भजन',
    kind: 'भजन',
    image: require('../img/hanuman_05.jpg'),
    audio: require('../audio/Jai_Hanuman_Gosai.mp3'),
    hasLyrics: false,
  },
  {
    number: 6,
    title: 'मंगल मूरति मारुति नंदन',
    titleEnglish: 'Mangal Moorati Maruti Nandan',
    subtitle: 'श्री हनुमान स्तुति',
    kind: 'भजन',
    image: require('../img/hanuman_06.jpg'),
    audio: require('../audio/Mangal_Moorati_Maruti_Nandan.mp3'),
    hasLyrics: false,
  },
  {
    number: 7,
    title: 'हे दुख भंजन मारुति नंदन',
    titleEnglish: 'Hay Dukh Bhanjan Maruti Nandan',
    subtitle: 'दुखों को हरने वाले हनुमान',
    kind: 'भजन',
    image: require('../img/hanuman_07.jpg'),
    audio: require('../audio/Hay_Dukh_Bhanjan_Maruti_Nandan.mp3'),
    hasLyrics: false,
  },
  {
    number: 8,
    title: 'हे बजरंगबली हनुमान',
    titleEnglish: 'He Bajrangbali Hanuman',
    subtitle: 'बजरंगबली की वंदना',
    kind: 'भजन',
    image: require('../img/hanuman_08.jpg'),
    audio: require('../audio/He_Bajrangbali_Hanuman.mp3'),
    hasLyrics: false,
  },
  {
    number: 9,
    title: 'संकट मोचन नाम तिहारो',
    titleEnglish: 'Sankat Mochan Naam Tiharo',
    subtitle: 'संकट मोचन का नाम-स्मरण',
    kind: 'भजन',
    image: require('../img/hanuman_09.jpg'),
    audio: require('../audio/Sankat_Mochan_Naam_Tiharo.mp3'),
    hasLyrics: false,
  },
];

export const TOTAL_TRACKS = TRACKS.length;

export function getTrack(number: number): Track | undefined {
  return TRACKS[number - 1];
}
