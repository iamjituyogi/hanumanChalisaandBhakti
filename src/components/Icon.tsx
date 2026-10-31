/**
 * Consistent 24×24 line-icon set (1.8 stroke, rounded caps), drawn with react-native-svg.
 */
import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'book'
  | 'heart'
  | 'heart-filled'
  | 'settings'
  | 'play'
  | 'pause'
  | 'skip-back'
  | 'skip-forward'
  | 'chevron-down'
  | 'chevron-right'
  | 'share'
  | 'search'
  | 'close'
  | 'refresh'
  | 'clock'
  | 'sun'
  | 'moon'
  | 'phone'
  | 'check'
  | 'gauge'
  | 'headphones'
  | 'alert'
  | 'info'
  | 'shield'
  | 'arrow-left'
  | 'list'
  | 'beads'
  | 'rewind-10'
  | 'forward-10'
  | 'timer'
  | 'flame'
  | 'type'
  | 'copy'
  | 'plus'
  | 'minus'
  | 'lyrics'
  | 'trash';

type Props = {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 24, color, strokeWidth = 1.8 }: Props) {
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  const content = (() => {
    switch (name) {
      case 'home':
        return (
          <>
            <Path d="M3.5 10.5 12 3.5l8.5 7" {...stroke} />
            <Path d="M5.5 9v10.5h4.5v-6h4v6h4.5V9" {...stroke} />
          </>
        );
      case 'book':
        return (
          <>
            <Path d="M12 6.5C10.2 5 7.6 4.5 4 4.5v14c3.6 0 6.2.5 8 2 1.8-1.5 4.4-2 8-2v-14c-3.6 0-6.2.5-8 2Z" {...stroke} />
            <Path d="M12 6.5v14" {...stroke} />
          </>
        );
      case 'heart':
        return (
          <Path
            d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z"
            {...stroke}
          />
        );
      case 'heart-filled':
        return (
          <Path
            d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z"
            {...stroke}
            fill={color}
          />
        );
      case 'settings':
        return (
          <>
            <Circle cx="12" cy="12" r="3" {...stroke} />
            <Path
              d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4.9a7.5 7.5 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.4A7.5 7.5 0 0 0 7 6.4l-2.4-.9-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-.9a7.5 7.5 0 0 0 2.6 1.5l.4 2.4h4l.4-2.4a7.5 7.5 0 0 0 2.6-1.5l2.4.9 2-3.4-2-1.6Z"
              {...stroke}
            />
          </>
        );
      case 'play':
        return <Path d="M8 5.5v13a.8.8 0 0 0 1.2.7l10.3-6.5a.8.8 0 0 0 0-1.4L9.2 4.8A.8.8 0 0 0 8 5.5Z" fill={color} />;
      case 'pause':
        return (
          <>
            <Rect x="6.5" y="5" width="4" height="14" rx="1.2" fill={color} />
            <Rect x="13.5" y="5" width="4" height="14" rx="1.2" fill={color} />
          </>
        );
      case 'skip-back':
        return (
          <>
            <Path d="M18 6.2v11.6a.7.7 0 0 1-1.1.6L9 12.6a.7.7 0 0 1 0-1.2l7.9-5.8a.7.7 0 0 1 1.1.6Z" fill={color} />
            <Rect x="5.5" y="5.5" width="2.2" height="13" rx="1" fill={color} />
          </>
        );
      case 'skip-forward':
        return (
          <>
            <Path d="M6 6.2v11.6a.7.7 0 0 0 1.1.6l7.9-5.8a.7.7 0 0 0 0-1.2L7.1 5.6a.7.7 0 0 0-1.1.6Z" fill={color} />
            <Rect x="16.3" y="5.5" width="2.2" height="13" rx="1" fill={color} />
          </>
        );
      case 'chevron-down':
        return <Path d="m6 9 6 6 6-6" {...stroke} />;
      case 'chevron-right':
        return <Path d="m9 6 6 6-6 6" {...stroke} />;
      case 'arrow-left':
        return <Path d="M19 12H5m6-6-6 6 6 6" {...stroke} />;
      case 'share':
        return (
          <>
            <Path d="M12 3.5v11" {...stroke} />
            <Path d="m8 7.5 4-4 4 4" {...stroke} />
            <Path d="M7 11H5.5v9.5h13V11H17" {...stroke} />
          </>
        );
      case 'search':
        return (
          <>
            <Circle cx="11" cy="11" r="6.5" {...stroke} />
            <Path d="m20 20-4.2-4.2" {...stroke} />
          </>
        );
      case 'close':
        return <Path d="M6 6l12 12M18 6 6 18" {...stroke} />;
      case 'refresh':
        return (
          <>
            <Path d="M20 11.5A8 8 0 1 1 17.7 6" {...stroke} />
            <Path d="M20 4v4.5h-4.5" {...stroke} />
          </>
        );
      case 'clock':
        return (
          <>
            <Circle cx="12" cy="12" r="8.5" {...stroke} />
            <Path d="M12 7.5V12l3 2" {...stroke} />
          </>
        );
      case 'sun':
        return (
          <>
            <Circle cx="12" cy="12" r="4" {...stroke} />
            <Path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" {...stroke} />
          </>
        );
      case 'moon':
        return <Path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" {...stroke} />;
      case 'phone':
        return (
          <>
            <Rect x="6.5" y="2.5" width="11" height="19" rx="2.5" {...stroke} />
            <Path d="M10.5 18.5h3" {...stroke} />
          </>
        );
      case 'check':
        return <Path d="m5 12.5 4.5 4.5L19 7.5" {...stroke} />;
      case 'gauge':
        return (
          <>
            <Path d="M4.5 17.5a8.5 8.5 0 1 1 15 0" {...stroke} />
            <Path d="m12 13 3.5-4" {...stroke} />
            <Circle cx="12" cy="13" r="1.3" fill={color} />
          </>
        );
      case 'headphones':
        return (
          <>
            <Path d="M4 15v-3a8 8 0 0 1 16 0v3" {...stroke} />
            <Rect x="3.5" y="14" width="4.5" height="6.5" rx="1.5" {...stroke} />
            <Rect x="16" y="14" width="4.5" height="6.5" rx="1.5" {...stroke} />
          </>
        );
      case 'alert':
        return (
          <>
            <Path d="M12 3.5 2.5 20h19L12 3.5Z" {...stroke} />
            <Path d="M12 10v4.5" {...stroke} />
            <Circle cx="12" cy="17.2" r="0.9" fill={color} />
          </>
        );
      case 'info':
        return (
          <>
            <Circle cx="12" cy="12" r="8.5" {...stroke} />
            <Path d="M12 11v5.5" {...stroke} />
            <Circle cx="12" cy="7.8" r="0.9" fill={color} />
          </>
        );
      case 'list':
        return (
          <>
            <Path d="M9 6.5h11M9 12h11M9 17.5h11" {...stroke} />
            <Circle cx="4.5" cy="6.5" r="1" fill={color} />
            <Circle cx="4.5" cy="12" r="1" fill={color} />
            <Circle cx="4.5" cy="17.5" r="1" fill={color} />
          </>
        );
      case 'beads':
        return (
          <>
            <Circle cx="12" cy="4.5" r="1.9" {...stroke} />
            <Circle cx="18" cy="8" r="1.9" {...stroke} />
            <Circle cx="18" cy="15" r="1.9" {...stroke} />
            <Circle cx="12" cy="18.5" r="1.9" {...stroke} />
            <Circle cx="6" cy="15" r="1.9" {...stroke} />
            <Circle cx="6" cy="8" r="1.9" {...stroke} />
            <Path d="M12 20.4V22" {...stroke} />
          </>
        );
      case 'rewind-10':
        return (
          <>
            <Path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" {...stroke} />
            <Path d="M4 4v4.5h4.5" {...stroke} />
            <Path d="M10.3 10.2v4.6M13 10.2h2.4v4.6H13z" {...stroke} strokeWidth={1.5} />
          </>
        );
      case 'forward-10':
        return (
          <>
            <Path d="M19.5 12a7.5 7.5 0 1 1-2.4-5.5" {...stroke} />
            <Path d="M20 4v4.5h-4.5" {...stroke} />
            <Path d="M9.3 10.2v4.6M12 10.2h2.4v4.6H12z" {...stroke} strokeWidth={1.5} />
          </>
        );
      case 'timer':
        return (
          <>
            <Circle cx="12" cy="13.5" r="7" {...stroke} />
            <Path d="M12 13.5V10M9.5 3h5" {...stroke} />
          </>
        );
      case 'flame':
        return <Path d="M12 21c-3.6 0-6-2.5-6-5.8 0-3.2 2.4-4.6 3.2-7.7 1.7 1.2 2.6 2.6 2.8 4.2.9-.9 1.6-2.2 1.5-4.2 2.3 1.9 4.5 4.4 4.5 7.7 0 3.3-2.4 5.8-6 5.8Z" {...stroke} />;
      case 'type':
        return <Path d="M5 7V5h14v2M12 5v14m-3 0h6" {...stroke} />;
      case 'copy':
        return (
          <>
            <Rect x="8.5" y="8.5" width="11" height="11" rx="2" {...stroke} />
            <Path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" {...stroke} />
          </>
        );
      case 'plus':
        return <Path d="M12 5v14M5 12h14" {...stroke} />;
      case 'minus':
        return <Path d="M5 12h14" {...stroke} />;
      case 'lyrics':
        return (
          <>
            <Path d="M5 5.5h14M5 10h14M5 14.5h9M5 19h6" {...stroke} />
          </>
        );
      case 'trash':
        return (
          <>
            <Path d="M4.5 7h15M10 7V4.5h4V7M6.5 7l.8 12.5h9.4L17.5 7" {...stroke} />
            <Path d="M10 11v5M14 11v5" {...stroke} />
          </>
        );
      case 'shield':
        return (
          <>
            <Path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6L12 3Z" {...stroke} />
            <Path d="m9 12 2 2 4-4" {...stroke} />
          </>
        );
    }
  })();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {content}
    </Svg>
  );
}
