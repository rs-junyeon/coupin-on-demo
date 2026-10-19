// 매장(s1~s9)·상품(p1~p17) 예시 사진. 점주가 PLUS에 올린 사진 자리
const files = import.meta.glob('../assets/photos/*.jpg', { eager: true, import: 'default' }) as Record<string, string>;
export const photo = (id: string) => files[`../assets/photos/${id}.jpg`] ?? '';
