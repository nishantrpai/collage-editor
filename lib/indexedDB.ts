import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'collageDB';
const MEDIA_STORE = 'media';
const DB_VERSION = 1;

// Initialize the database
export async function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object stores
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
      }
    },
  });
}

// Store media items
export async function storeMedia(mediaItems: Array<{ type: string, url: string }>) {
  try {
    const db = await initDB();
    const tx = db.transaction(MEDIA_STORE, 'readwrite');
    const store = tx.objectStore(MEDIA_STORE);
    
    // Clear existing entries
    await store.clear();
    
    // Add new entries
    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i];
      await store.add({
        id: i,
        type: item.type,
        dataUrl: item.url
      });
    }
    
    await tx.done;
    return true;
  } catch (error) {
    console.error("Error storing media in IndexedDB:", error);
    return false;
  }
}

// Get all media items
export async function getAllMedia() {
  try {
    const db = await initDB();
    const media = await db.getAll(MEDIA_STORE);
    
    return media.map(item => ({
      type: item.type,
      url: item.dataUrl
    }));
  } catch (error) {
    console.error("Error getting media from IndexedDB:", error);
    return [];
  }
}

// Clear all data from IndexedDB (for refresh)
export async function clearDB() {
  try {
    const db = await initDB();
    const tx = db.transaction(MEDIA_STORE, 'readwrite');
    await tx.objectStore(MEDIA_STORE).clear();
    await tx.done;
    return true;
  } catch (error) {
    console.error("Error clearing IndexedDB:", error);
    return false;
  }
}
