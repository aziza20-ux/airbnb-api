type CacheEntry<T> = {
	data: T;
	expiresAt: number;
};

const cacheStore = new Map<string, CacheEntry<unknown>>();

export const getCache = <T>(key: string): T | null => {
	const entry = cacheStore.get(key);
	if (!entry) {
		return null;
	}

	if (entry.expiresAt <= Date.now()) {
		cacheStore.delete(key);
		return null;
	}

	return entry.data as T;
};

export const setCache = <T>(key: string, data: T, ttlSeconds: number): void => {
	cacheStore.set(key, {
		data,
		expiresAt: Date.now() + ttlSeconds * 1000,
	});
};

export const deleteCache = (key: string): void => {
	cacheStore.delete(key);
};

export const deleteCacheByPrefix = (prefix: string): void => {
	for (const key of cacheStore.keys()) {
		if (key.startsWith(prefix)) {
			cacheStore.delete(key);
		}
	}
};

export const clearCache = (): void => {
	cacheStore.clear();
};
