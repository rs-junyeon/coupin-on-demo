// 데모 데이터와 모든 동작. 브라우저 저장소에 저장하고, 다른 탭(관리자 ↔ 고객 앱)과 storage 이벤트로 맞춘다
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { ACCT_PHONE, pinOf, seed, STORAGE_KEY } from '../data/seed';
import { adminStatus, blockReason, CAT_COLORS, catName, digits, expOf, isFree, limTxt, ME, prodOf, storeOf } from '../domain/rules';
import { p2, won } from '../domain/time';
import type { DB, IconName, InquiryStatus, InquiryType, Order, Product, SocialProvider } from '../domain/types';

const safeStorage: StateStorage = {
  getItem: n => { try { return localStorage.getItem(n); } catch { return null; } },
  setItem: (n, v) => { try { localStorage.setItem(n, v); } catch { /* 저장 불가: 메모리로만 */ } },
  removeItem: n => { try { localStorage.removeItem(n); } catch { /* 저장 불가 */ } },
};

export const PAY_METHODS = { easy: '간편결제', card: '신용·체크카드', phone: '휴대폰 결제' } as const;
export type PayMethod = keyof typeof PAY_METHODS;
type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

type Actions = {
  reset(): void;
  // 고객 계정
  login(userId: string, pw: string): Result;
  logout(): void;
  /** 자체 가입. 이미 가입한 휴대폰 번호면 새로 만들지 않는다 */
  signupCheckPhone(phone: string): 'dup' | 'new';
  signup(o: { userId: string; phone: string; mkt: boolean }): void;
  /** 소셜 로그인: 이미 연결된 소셜 계정이면 바로 로그인, 아니면 휴대폰 확인으로 */
  socialLogin(prov: SocialProvider): 'logged' | 'needPhone';
  /** 휴대폰 인증 뒤: 같은 번호 계정이 있으면 연결, 없으면 소셜 계정으로 새로 가입 */
  socialPhone(phone: string): 'link' | 'new';
  socialLink(prov: SocialProvider): void;
  socialJoin(prov: SocialProvider, phone: string, mkt: boolean): void;
  linkSocial(prov: SocialProvider): void;
  unlinkSocial(prov: SocialProvider): Result;
  setMkt(on: boolean): void;
  withdraw(): void;
  // 받기·구매·취소
  issue(pid: string, method?: PayMethod): Result<{ cid: string; oid: string | null }>;
  requestRefund(cid: string): Result<{ amount: number }>;
  cancelFree(cid: string): Result;
  createInquiry(o: { type: InquiryType; title: string; body: string }): string;
  markInquirySeen(qid: string): void;
  // 관리자
  adminLogin(id: string, pw: string): Result;
  adminLogout(): void;
  publish(pid: string): Result<{ needCat?: boolean }>;
  hide(pid: string): void;
  saveTerms(pid: string, o: { cat: string; price: number; limit: number | null }, andPublish: boolean): Result<{ moved: boolean; published: boolean }>;
  bulkApply(pids: string[], cat: string, andPublish: boolean): { count: number; published: number; skipped: number };
  addCat(name: string, icon: IconName): Result;
  editCat(old: string, name: string, icon: IconName): Result;
  deleteCat(name: string): Result;
  sync(): void;
  setLimit(total: number, ftotal: number): void;
  adminCancelCoupon(cid: string, reason: string): void;
  retryRefund(oid: string): void;
  resolveOrder(oid: string): void;
  settleRun(): void;
  settleCheck(): void;
  settleConfirm(): void;
  replyInquiry(qid: string, text: string): void;
  setInquiryStatus(qid: string, st: InquiryStatus): void;
  forwardInquiry(qid: string): void;
};
export type Store = DB & Actions;

const iso = () => new Date().toISOString();
const ymdC = (d: Date) => `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}`;
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

export const useDB = create<Store>()(
  persist(
    (set, get) => {
      /** 상태를 복사해 고치고 한 번에 반영한다 */
      const mut = (fn: (d: DB) => void) => set(s => { const d = clone(s) as DB; fn(d); return d; });
      const useLimit = (d: DB, p: Product, paid: number, n: number) => {
        p.limitUsed += n * (isFree(p) ? 1 : paid);
        if (isFree(p)) d.limit.fused += n; else d.limit.used += n * paid;
      };
      const cancelCoupon = (d: DB, cid: string) => {
        const c = d.coupons.find(x => x.id === cid)!, p = prodOf(d, c.pid);
        c.status = 'CANCELLED';
        const o = d.orders.find(x => x.cid === c.id); if (o) o.status = '환불 완료';
        useLimit(d, p, c.paid, -1);
        return { c, o };
      };
      const termsLog = (p: Product, text: string) => p.hist.unshift({ at: iso(), who: get().admin.name, text });
      const addCatTo = (d: DB, name: string, icon: IconName) => {
        const used = Object.values(d.cats).map(c => c.color);
        d.cats[name] = { color: CAT_COLORS.find(c => !used.includes(c)) ?? CAT_COLORS[Object.keys(d.cats).length % CAT_COLORS.length], icon };
      };
      return {
        ...seed(),
        reset: () => set(seed()),

        login: (userId, pw) => {
          if (!userId.trim() || !pw) return { ok: false, error: '아이디와 비밀번호를 입력해 주세요' };
          if (userId.trim() !== get().account.userId || !get().account.links.pw) return { ok: false, error: '아이디 또는 비밀번호가 맞지 않아요' };
          mut(d => { d.account.logged = true; });
          return { ok: true };
        },
        logout: () => mut(d => { d.account.logged = false; }),
        signupCheckPhone: phone => (digits(phone) === digits(get().account.phone) ? 'dup' : 'new'),
        signup: ({ userId, phone, mkt }) => mut(d => { d.account = { logged: true, userId, name: '김*온', phone, links: { pw: true, kakao: false, google: false }, mkt }; }),
        socialLogin: prov => {
          if (get().account.links[prov]) { mut(d => { d.account.logged = true; }); return 'logged'; }
          return 'needPhone';
        },
        socialPhone: phone => (digits(phone) === digits(get().account.phone) ? 'link' : 'new'),
        socialLink: prov => mut(d => { d.account.links[prov] = true; d.account.logged = true; }),
        socialJoin: (prov, phone, mkt) => mut(d => { d.account = { logged: true, userId: '', name: '김*온', phone, links: { pw: false, kakao: prov === 'kakao', google: prov === 'google' }, mkt }; }),
        linkSocial: prov => mut(d => { d.account.links[prov] = true; }),
        unlinkSocial: prov => {
          if (Object.values(get().account.links).filter(Boolean).length < 2) return { ok: false, error: '로그인 방법이 하나만 남으면 해제할 수 없어요' };
          mut(d => { d.account.links[prov] = false; });
          return { ok: true };
        },
        setMkt: on => mut(d => { d.account.mkt = on; }),
        withdraw: () => mut(d => { d.account.logged = false; }),

        issue: (pid, method = 'easy') => {
          const s = get(), p = prodOf(s, pid);
          const why = blockReason(s, p);
          if (why) return { ok: false, error: why };
          let cid = '', oid: string | null = null;
          mut(d => {
            const q = prodOf(d, pid), at = new Date();
            d.seq += 1;
            const id = `ON-${ymdC(at)}-${String(d.seq).padStart(4, '0')}`;
            cid = `n${d.seq}`;
            d.coupons.push({ id: cid, pid, owner: ME, oid: id, issuedAt: at.toISOString(), exp: expOf(q, at).toISOString(), pin: pinOf(d.seq * 104729 + 7), status: 'ISSUED', usedAt: null, balance: q.type === '잔액권' ? q.list : null, paid: q.price, live: true });
            if (q.price > 0) { oid = id; d.orders.unshift({ id, cid, pid, owner: ME, amount: q.price, at: at.toISOString(), status: '완료', method: PAY_METHODS[method], log: [], live: true }); }
            useLimit(d, q, q.price, 1);
          });
          return { ok: true, cid, oid };
        },
        // 서버가 바로 처리한다: PLUS 발급 취소 → 결제 취소. 관리자 환불 화면에 기록이 남는다
        requestRefund: cid => {
          const c = get().coupons.find(x => x.id === cid);
          if (!c || c.owner !== ME || c.paid === 0 || c.status !== 'ISSUED') return { ok: false, error: '환불할 수 없는 쿠폰이에요' };
          mut(d => {
            const { o } = cancelCoupon(d, cid);
            if (o) { o.log.push([iso(), '고객 환불 요청 → PLUS 발급 취소 → 결제 취소 완료']); d.refunds.push({ oid: o.id, at: iso(), result: '완료', memo: '고객 요청 · 자동 처리', kind: 'req' }); }
          });
          return { ok: true, amount: c.paid };
        },
        // 무료 쿠폰 취소: PLUS 발급 취소만 한다. 결제가 없어 관리자 환불 기록은 없고, 무료 월 한도로 수량이 돌아간다
        cancelFree: cid => {
          const c = get().coupons.find(x => x.id === cid);
          if (!c || c.owner !== ME || c.paid !== 0 || c.status !== 'ISSUED') return { ok: false, error: '취소할 수 없는 쿠폰이에요' };
          mut(d => { const { c: x } = cancelCoupon(d, cid); x.selfCancel = { at: iso() }; });
          return { ok: true };
        },
        createInquiry: ({ type, title, body }) => {
          const id = `q${Date.now()}`;
          mut(d => { d.inquiries.unshift({ id, type, owner: ME, title, body, at: iso(), status: '접수', answer: null }); });
          return id;
        },
        markInquirySeen: qid => mut(d => { const q = d.inquiries.find(x => x.id === qid); if (q && q.answer) q.seen = true; }),

        adminLogin: (id, pw) => {
          if (!id.trim() || !pw) return { ok: false, error: '아이디와 비밀번호를 입력해 주세요' };
          mut(d => { d.admin.logged = true; });
          return { ok: true };
        },
        adminLogout: () => mut(d => { d.admin.logged = false; }),
        publish: pid => {
          const p = prodOf(get(), pid);
          if (!p.cat) return { ok: false, error: '게시하려면 카테고리를 먼저 골라 주세요' };
          if (adminStatus(get(), p).k === 'block') return { ok: false, error: '노출 조건이 맞지 않아 게시할 수 없어요' };
          mut(d => { const q = prodOf(d, pid); q.on = 'PUBLISHED'; d.pubSeq += 1; q.pub = d.pubSeq; });
          return { ok: true };
        },
        hide: pid => mut(d => { prodOf(d, pid).on = 'HIDDEN'; }),
        // ON 가격 조정은 할인만: 점주 판매가 이하, 유료 상품은 0원 불가
        saveTerms: (pid, { cat, price, limit }, andPublish) => {
          const s = get(), p = prodOf(s, pid), free = isFree(p);
          if (andPublish && !cat) return { ok: false, error: '게시하려면 카테고리를 골라 주세요' };
          if (!free && !price) return { ok: false, error: '유료 상품은 0원으로 낮출 수 없어요.' };
          if (!free && price > p.own) return { ok: false, error: '점주가 정한 판매가보다 높일 수 없어요 (할인만).' };
          if (!free && limit && limit < price) return { ok: false, error: '한도가 판매가 1장보다 작아요.' };
          const moved = !free && price !== p.price;
          let published = false;
          mut(d => {
            const q = prodOf(d, pid);
            if (cat && !d.cats[cat]) addCatTo(d, cat, 'box');
            const lim = (n: number | null) => (n ? limTxt(q, n) : '전체 한도만'), pt = (n: number) => (free ? '무료' : won(n));
            const before = `판매가 ${pt(q.price)} · 한도 ${lim(q.limit)}`;
            const catMoved = (cat || null) !== q.cat ? ` · 카테고리 ${catName(d, q.cat)} → ${cat || '미분류'}` : '';
            q.cat = cat || null; q.price = free ? 0 : price; q.limit = limit;
            termsLog(q, `${before} → 판매가 ${pt(q.price)} · 한도 ${lim(q.limit)}${catMoved}${moved ? ' · 점주에게 알림' : ''}`);
            if (andPublish && ['draft', 'hidden'].includes(adminStatus(d, q).k)) { q.on = 'PUBLISHED'; d.pubSeq += 1; q.pub = d.pubSeq; published = true; }
          });
          return { ok: true, moved, published };
        },
        bulkApply: (pids, cat, andPublish) => {
          let published = 0;
          mut(d => {
            if (!d.cats[cat]) addCatTo(d, cat, 'box');
            pids.forEach(id => {
              const q = prodOf(d, id);
              if (q.cat !== cat) { termsLog(q, `카테고리 ${catName(d, q.cat)} → ${cat} (일괄 지정)`); q.cat = cat; }
              if (andPublish && ['draft', 'hidden'].includes(adminStatus(d, q).k)) { q.on = 'PUBLISHED'; d.pubSeq += 1; q.pub = d.pubSeq; published++; }
            });
          });
          return { count: pids.length, published, skipped: andPublish ? pids.length - published : 0 };
        },
        addCat: (name, icon) => {
          const n = name.trim();
          if (!n) return { ok: false, error: '카테고리 이름을 적어 주세요' };
          if (get().cats[n]) return { ok: false, error: '이미 있는 카테고리예요' };
          mut(d => addCatTo(d, n, icon));
          return { ok: true };
        },
        // 이름이 바뀌면 순서를 지키며 다시 만들고, 상품에도 새 이름을 반영한다
        editCat: (old, name, icon) => {
          const n = name.trim();
          if (!n) return { ok: false, error: '카테고리 이름을 적어 주세요' };
          if (n !== old && get().cats[n]) return { ok: false, error: '이미 있는 카테고리예요' };
          mut(d => {
            const next: DB['cats'] = {};
            Object.keys(d.cats).forEach(k => { next[k === old ? n : k] = k === old ? { ...d.cats[k], icon } : d.cats[k]; });
            d.cats = next;
            d.products.forEach(p => { if (p.cat === old) p.cat = n; });
          });
          return { ok: true };
        },
        deleteCat: name => {
          if (get().products.some(p => p.cat === name)) return { ok: false, error: '쓰는 상품이 있으면 지울 수 없어요' };
          mut(d => { delete d.cats[name]; });
          return { ok: true };
        },
        sync: () => mut(d => { d.syncLog.unshift({ at: iso(), how: '수동', ok: true, n: d.products.length - 1 }); }),
        setLimit: (total, ftotal) => mut(d => { d.limit.total = total; d.limit.ftotal = ftotal; }),
        adminCancelCoupon: (cid, reason) => mut(d => {
          const { c, o } = cancelCoupon(d, cid);
          c.cancel = { at: iso(), who: d.admin.name, reason };
          if (o) { o.log.push([iso(), `${d.admin.name} · 쿠폰 취소(${reason}) → PLUS 발급 취소 → 결제 취소 완료`]); d.refunds.push({ oid: o.id, at: iso(), result: '완료', memo: `운영자 직접 취소 · ${reason}`, kind: 'ops' }); }
        }),
        retryRefund: oid => mut(d => {
          const o = d.orders.find(x => x.id === oid)!;
          o.status = '환불 완료'; o.note = `${d.admin.name}이 다시 시도해 취소 완료`;
          o.log.push([iso(), `${d.admin.name} · 결제 취소 다시 시도 → 환불 완료`]);
          d.refunds.filter(r => r.oid === oid && r.result === '처리 중').forEach(r => { r.result = '완료'; r.memo += ' → 운영자 재시도로 완료'; });
        }),
        // 결과 미확인 주문: tid로 PLUS 발급 결과를 확인해 발급됐으면 쿠폰을 복구한다
        resolveOrder: oid => mut(d => {
          const o = d.orders.find(x => x.id === oid)! as Order, p = prodOf(d, o.pid), at = new Date();
          d.seq += 1;
          const cid = `r${d.seq}`;
          d.coupons.push({ id: cid, pid: o.pid, owner: o.owner, oid: o.id, issuedAt: at.toISOString(), exp: expOf(p, at).toISOString(), pin: pinOf(d.seq * 7331 + 11), status: 'ISSUED', usedAt: null, balance: p.type === '잔액권' ? p.list : null, paid: o.amount });
          o.cid = cid; o.status = '완료'; o.unconfirmed = false; o.note = 'tid로 조회해 발급을 확인하고 쿠폰을 복구했어요';
          o.log.push([at.toISOString(), `${d.admin.name} · tid로 PLUS 발급 결과 조회 → 발급 확인, 쿠폰 복구`]);
        }),
        settleRun: () => mut(d => { d.settle.runAt = iso(); }),
        settleCheck: () => mut(d => { d.settle.checked = true; }),
        settleConfirm: () => mut(d => { d.settle.done = true; }),
        replyInquiry: (qid, text) => mut(d => { const q = d.inquiries.find(x => x.id === qid)!; q.answer = text; q.status = '답변 완료'; q.seen = false; }),
        setInquiryStatus: (qid, st) => mut(d => { d.inquiries.find(x => x.id === qid)!.status = st; }),
        forwardInquiry: qid => mut(d => { const q = d.inquiries.find(x => x.id === qid)!; q.forwarded = true; q.status = '처리 중'; }),
      };
    },
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: s => {
        const { stores, products, cats, coupons, orders, refunds, inquiries, syncLog, limit, base, daily, settle, account, admin, seq, pubSeq } = s;
        return { stores, products, cats, coupons, orders, refunds, inquiries, syncLog, limit, base, daily, settle, account, admin, seq, pubSeq };
      },
    },
  ),
);

/** 관리자 탭에서 게시하면 고객 앱 탭에도 바로 반영되게, 다른 탭의 저장을 다시 읽는다 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => { if (e.key === STORAGE_KEY) void useDB.persist.rehydrate(); });
}

export { ACCT_PHONE, storeOf, prodOf };
