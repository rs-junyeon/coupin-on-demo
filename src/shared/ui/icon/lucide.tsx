// lucide 아이콘 대응표: 고객 앱 아이콘 라이브러리 비교(/compare-icons)용. 이름마다 antd Outlined(Icon.tsx)와 같은 뜻의 lucide 아이콘
import {
  BookOpen, Camera, ChartColumn, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleAlert, Clock, Coffee, Compass,
  Copy, CreditCard, CupSoda, Dumbbell, FileText, FlaskConical, Gift, Heart, Inbox, Info, List, LocateFixed, Lock, LogOut,
  type LucideIcon, MapPin, MessageSquare, Paintbrush, Phone, Receipt, Scissors, Search, Send, ShoppingBag, Smile, Store, Tags,
  Ticket, Trophy, Undo2, User, Utensils, Wallet, X,
} from 'lucide-react';
import type { IconName } from '@/shared/api';

export const LUCIDE: Record<IconName, LucideIcon> = {
  // 카테고리 기본 10개 + 추가 3개. 네일은 lucide 에도 없어 붓으로 대신한다
  cafe: Coffee, dessert: CupSoda, hair: Scissors, beauty: Smile, fit: Trophy,
  class: BookOpen, experiment: FlaskConical, photo: Camera, pet: Heart, shopping: ShoppingBag,
  dumbbell: Dumbbell, food: Utensils, nail: Paintbrush,
  gift: Gift, box: Inbox,
  // 탭바·헤더·이동
  map: Compass, store: Store, ticket: Ticket, user: User,
  back: ChevronLeft, chev: ChevronRight, down: ChevronDown, up: ChevronUp, x: X,
  // 지도·가게·쿠폰·상태·마이
  search: Search, locate: LocateFixed, place: MapPin, phone: Phone, list: List,
  copy: Copy, clock: Clock, tag: Tags, check: Check, info: Info,
  alert: CircleAlert, chat: MessageSquare, out: LogOut, lock: Lock, doc: FileText,
  receipt: Receipt, refund: Undo2, card: CreditCard, coins: Wallet, send: Send,
  chart: ChartColumn,
};
