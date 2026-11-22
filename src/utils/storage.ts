import { SEED_STORES } from '../data/seedStores';
import type { TakeoutStore } from '../types/store';

const STORAGE_KEY = 'shiji_takeout_stores_v1';

export function loadStoresFromStorage(): TakeoutStore[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return SEED_STORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const seedCityById = new Map(SEED_STORES.map((s) => [s.id, s.city]));
      return (parsed as Partial<TakeoutStore>[]).map((item) => ({
        ...(item as TakeoutStore),
        city:
          typeof item.city === 'string' && item.city.trim()
            ? item.city.trim()
            : (item.id && seedCityById.get(item.id)) || '未填城市',
      }));
    }
    return SEED_STORES;
  } catch {
    return SEED_STORES;
  }
}

export function saveStoresToStorage(stores: TakeoutStore[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
    return true;
  } catch {
    return false;
  }
}

export function compressImageFile(file: File, maxWidth = 720, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('图片格式不受支持'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('浏览器不支持图片压缩'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
