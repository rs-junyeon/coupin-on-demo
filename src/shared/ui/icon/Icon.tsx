// 아이콘 (DESIGN.md 7.7): 고객 앱·관리자 모두 @ant-design/icons Outlined만 쓴다. 색은 감싼 요소의 글자색(currentColor)
import {
  AimOutlined, BarChartOutlined, CameraOutlined, CheckOutlined, ClockCircleOutlined, CloseOutlined, CoffeeOutlined, CompassOutlined,
  CopyOutlined, CreditCardOutlined, DownOutlined, EnvironmentOutlined, ExclamationCircleOutlined, ExperimentOutlined, FileTextOutlined,
  GiftOutlined, HeartOutlined, InboxOutlined, InfoCircleOutlined, LeftOutlined, LockOutlined, LogoutOutlined, MessageOutlined,
  PhoneOutlined, ProfileOutlined, ReadOutlined, RestOutlined, RightOutlined, RollbackOutlined, ScissorOutlined, SearchOutlined,
  SendOutlined, ShopOutlined, ShoppingOutlined, SmileOutlined, TagOutlined, TagsOutlined, TrophyOutlined, UnorderedListOutlined,
  UpOutlined, UserOutlined, WalletOutlined,
} from '@ant-design/icons';
import type { ComponentType } from 'react';
import type { IconName } from '@/shared/api';
import { DumbbellOutlined, NailPolishOutlined, RestaurantOutlined } from './custom';
import { LUCIDE } from './lucide';
import s from './Icon.module.css';

export type IconSize = 16 | 20 | 24 | 32 | 64;

const IC: Record<IconName, ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  // 카테고리 기본 10개 + 직접 그린 추가 3개 (7.7)
  cafe: CoffeeOutlined, dessert: RestOutlined, hair: ScissorOutlined, beauty: SmileOutlined, fit: TrophyOutlined,
  class: ReadOutlined, experiment: ExperimentOutlined, photo: CameraOutlined, pet: HeartOutlined, shopping: ShoppingOutlined,
  dumbbell: DumbbellOutlined, food: RestaurantOutlined, nail: NailPolishOutlined,
  gift: GiftOutlined, box: InboxOutlined,
  // 탭바·헤더·이동
  map: CompassOutlined, store: ShopOutlined, ticket: TagOutlined, user: UserOutlined,
  back: LeftOutlined, chev: RightOutlined, down: DownOutlined, up: UpOutlined, x: CloseOutlined,
  // 지도·가게·쿠폰·상태·마이
  search: SearchOutlined, locate: AimOutlined, place: EnvironmentOutlined, phone: PhoneOutlined, list: UnorderedListOutlined,
  copy: CopyOutlined, clock: ClockCircleOutlined, tag: TagsOutlined, check: CheckOutlined, info: InfoCircleOutlined,
  alert: ExclamationCircleOutlined, chat: MessageOutlined, out: LogoutOutlined, lock: LockOutlined, doc: FileTextOutlined,
  receipt: ProfileOutlined, refund: RollbackOutlined, card: CreditCardOutlined, coins: WalletOutlined, send: SendOutlined,
  chart: BarChartOutlined,
};

/** 이 창을 lucide 로 그리는지: 아이콘 비교의 오른쪽 창(iframe name="icons-lucide") 또는 ?icons=lucide 로 연 창 */
const USE_LUCIDE =
  typeof window !== 'undefined' &&
  (window.name === 'icons-lucide' || new URLSearchParams(window.location.search).get('icons') === 'lucide');

/** 아이콘. 장식이라 화면 낭독기에서 숨긴다 (아이콘만 있는 버튼은 버튼에 aria-label) */
export function Icon({ name, size = 20, className = '' }: { name: IconName; size?: IconSize; className?: string }) {
  const cls = `${s.icon} ${s[`s${size}`]} ${className}`;
  if (USE_LUCIDE) {
    const L = LUCIDE[name];
    return <L className={cls} size="1em" aria-hidden />;
  }
  const C = IC[name];
  return <C className={cls} aria-hidden />;
}
