// antd에 없어 직접 그린 아이콘 3개 (docs/design/assets/icons). antd Outlined와 같은 규격: viewBox 64 64 896 896, 획 72, 둥근 끝
import AntIcon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

type P = Partial<CustomIconComponentProps>;
const svg = (d: string[]) => () => (
  <svg viewBox="64 64 896 896" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth={72} strokeLinecap="round" strokeLinejoin="round">
    {d.map(x => <path key={x} d={x} />)}
  </svg>
);

const Dumbbell = svg(['M276 512H748', 'M276 296V728M748 296V728', 'M140 404V620M884 404V620']);
const Nail = svg(['M424 120H600V368H424Z', 'M336 368H688C742 368 784 410 784 464V808C784 862 742 904 688 904H336C282 904 240 862 240 808V464C240 410 282 368 336 368Z', 'M376 536V736']);
const Restaurant = svg(['M248 144V376C248 452 296 500 360 500C424 500 472 452 472 376V144', 'M360 144V880', 'M680 880V144C772 196 812 316 812 520H680']);

/** 운동 (덤벨) */
export const DumbbellOutlined = (p: P) => <AntIcon component={Dumbbell} {...p} />;
/** 네일 (매니큐어 병) */
export const NailPolishOutlined = (p: P) => <AntIcon component={Nail} {...p} />;
/** 식당 (포크·나이프) */
export const RestaurantOutlined = (p: P) => <AntIcon component={Restaurant} {...p} />;
