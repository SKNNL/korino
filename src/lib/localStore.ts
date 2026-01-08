// Local storage based data store - no backend needed

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  location: string;
}

export interface Item {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  location: string;
  is_active: boolean;
  created_at: string;
  brand?: string;
  condition?: string;
  estimated_value?: number;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  item1_id: string;
  item2_id: string;
  created_at: string;
  status: string;
  meeting_date?: string;
  meeting_location?: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
}

export interface Swipe {
  id: string;
  user_id: string;
  item_id: string;
  swipe_direction: "left" | "right";
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

// Storage keys
const KEYS = {
  USER: "tradeit_user",
  ITEMS: "tradeit_items",
  MATCHES: "tradeit_matches",
  MESSAGES: "tradeit_messages",
  SWIPES: "tradeit_swipes",
  FAVORITES: "tradeit_favorites",
  NOTIFICATIONS: "tradeit_notifications",
  USERS: "tradeit_users",
};

// Demo data
const DEMO_USERS: User[] = [
  {
    id: "demo-user-1",
    email: "marie@example.com",
    full_name: "Marie Dupont",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
    bio: "Passionnée de vintage et de déco",
    location: "Paris 11ème",
  },
  {
    id: "demo-user-2",
    email: "pierre@example.com",
    full_name: "Pierre Martin",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre",
    bio: "Collectionneur de livres anciens",
    location: "Lyon 3ème",
  },
  {
    id: "demo-user-3",
    email: "sophie@example.com",
    full_name: "Sophie Bernard",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    bio: "Adepte du troc éco-responsable",
    location: "Bordeaux",
  },
];

const DEMO_ITEMS: Item[] = [
  {
    id: "item-1",
    user_id: "demo-user-1",
    title: "Lampe Art Déco années 30",
    description: "Magnifique lampe de bureau Art Déco en laiton et verre opalin. Fonctionne parfaitement.",
    category: "Maison",
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    location: "Paris 11ème",
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    condition: "Bon état",
    estimated_value: 80,
  },
  {
    id: "item-2",
    user_id: "demo-user-2",
    title: "Collection Jules Verne",
    description: "5 romans de Jules Verne en édition ancienne. Parfait pour collectionneurs.",
    category: "Livres",
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
    location: "Lyon 3ème",
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    condition: "Très bon état",
    estimated_value: 120,
  },
  {
    id: "item-3",
    user_id: "demo-user-3",
    title: "Vélo vintage Peugeot",
    description: "Vélo de ville Peugeot des années 80. Révisé et prêt à rouler.",
    category: "Sport",
    image_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400",
    location: "Bordeaux",
    is_active: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    condition: "Bon état",
    estimated_value: 150,
  },
  {
    id: "item-4",
    user_id: "demo-user-1",
    title: "Machine à coudre Singer",
    description: "Machine à coudre Singer vintage fonctionnelle. Idéale pour débutants.",
    category: "Maison",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    location: "Paris 11ème",
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    condition: "Très bon état",
    estimated_value: 100,
  },
  {
    id: "item-5",
    user_id: "demo-user-2",
    title: "Guitare acoustique Yamaha",
    description: "Guitare folk Yamaha en excellent état. Son chaleureux, parfaite pour apprendre.",
    category: "Loisirs",
    image_url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400",
    location: "Lyon 3ème",
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    condition: "Excellent",
    estimated_value: 180,
  },
  {
    id: "item-6",
    user_id: "demo-user-3",
    title: "Appareil photo argentique Canon",
    description: "Canon AE-1 avec objectif 50mm. Testée et fonctionnelle.",
    category: "Électronique",
    image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
    location: "Bordeaux",
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    condition: "Bon état",
    estimated_value: 200,
  },
  {
    id: "item-7",
    user_id: "demo-user-1",
    title: "Service à thé en porcelaine",
    description: "Service complet 6 personnes en porcelaine de Limoges. Jamais utilisé.",
    category: "Maison",
    image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
    location: "Paris 11ème",
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    condition: "Neuf",
    estimated_value: 90,
  },
  {
    id: "item-8",
    user_id: "demo-user-2",
    title: "Jeux de société vintage",
    description: "Lot de 3 jeux de société années 90 en bon état. Complets avec notices.",
    category: "Jeux",
    image_url: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=400",
    location: "Lyon 3ème",
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    condition: "Bon état",
    estimated_value: 40,
  },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 15);

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

// Initialize demo data if not present
export const initializeDemoData = () => {
  if (!localStorage.getItem(KEYS.ITEMS)) {
    setToStorage(KEYS.ITEMS, DEMO_ITEMS);
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    setToStorage(KEYS.USERS, DEMO_USERS);
  }
  if (!localStorage.getItem(KEYS.MATCHES)) {
    setToStorage(KEYS.MATCHES, []);
  }
  if (!localStorage.getItem(KEYS.MESSAGES)) {
    setToStorage(KEYS.MESSAGES, []);
  }
  if (!localStorage.getItem(KEYS.SWIPES)) {
    setToStorage(KEYS.SWIPES, []);
  }
  if (!localStorage.getItem(KEYS.FAVORITES)) {
    setToStorage(KEYS.FAVORITES, []);
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    setToStorage(KEYS.NOTIFICATIONS, []);
  }
};

// Auth functions
export const auth = {
  getCurrentUser: (): User | null => {
    return getFromStorage<User | null>(KEYS.USER, null);
  },

  signUp: (email: string, password: string, fullName: string): User => {
    const users = getFromStorage<User[]>(KEYS.USERS, []);
    
    if (users.find(u => u.email === email)) {
      throw new Error("Cet email est déjà utilisé");
    }

    const newUser: User = {
      id: generateId(),
      email,
      full_name: fullName,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`,
      bio: "",
      location: "",
    };

    users.push(newUser);
    setToStorage(KEYS.USERS, users);
    setToStorage(KEYS.USER, newUser);

    return newUser;
  },

  signIn: (email: string, password: string): User => {
    const users = getFromStorage<User[]>(KEYS.USERS, []);
    const user = users.find(u => u.email === email);

    if (!user) {
      throw new Error("Email ou mot de passe incorrect");
    }

    setToStorage(KEYS.USER, user);
    return user;
  },

  signOut: (): void => {
    localStorage.removeItem(KEYS.USER);
  },

  updateProfile: (updates: Partial<User>): User => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) throw new Error("Non connecté");

    const updatedUser = { ...currentUser, ...updates };
    setToStorage(KEYS.USER, updatedUser);

    const users = getFromStorage<User[]>(KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      setToStorage(KEYS.USERS, users);
    }

    return updatedUser;
  },
};

// Items functions
export const items = {
  getAll: (filters?: { category?: string; search?: string }): Item[] => {
    let allItems = getFromStorage<Item[]>(KEYS.ITEMS, []);
    
    if (filters?.category && filters.category !== "all") {
      allItems = allItems.filter(i => i.category === filters.category);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      allItems = allItems.filter(i => 
        i.title.toLowerCase().includes(searchLower) ||
        i.description.toLowerCase().includes(searchLower)
      );
    }

    return allItems.filter(i => i.is_active).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getById: (id: string): Item | undefined => {
    const allItems = getFromStorage<Item[]>(KEYS.ITEMS, []);
    return allItems.find(i => i.id === id);
  },

  getByUser: (userId: string): Item[] => {
    const allItems = getFromStorage<Item[]>(KEYS.ITEMS, []);
    return allItems.filter(i => i.user_id === userId);
  },

  create: (item: Omit<Item, "id" | "created_at">): Item => {
    const allItems = getFromStorage<Item[]>(KEYS.ITEMS, []);
    const newItem: Item = {
      ...item,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    allItems.push(newItem);
    setToStorage(KEYS.ITEMS, allItems);
    return newItem;
  },

  update: (id: string, updates: Partial<Item>): Item | undefined => {
    const allItems = getFromStorage<Item[]>(KEYS.ITEMS, []);
    const index = allItems.findIndex(i => i.id === id);
    if (index === -1) return undefined;

    allItems[index] = { ...allItems[index], ...updates };
    setToStorage(KEYS.ITEMS, allItems);
    return allItems[index];
  },

  delete: (id: string): void => {
    const allItems = getFromStorage<Item[]>(KEYS.ITEMS, []);
    setToStorage(KEYS.ITEMS, allItems.filter(i => i.id !== id));
  },
};

// Users functions
export const users = {
  getById: (id: string): User | undefined => {
    const allUsers = getFromStorage<User[]>(KEYS.USERS, []);
    return allUsers.find(u => u.id === id);
  },
};

// Swipes and matches
export const swipes = {
  getByUser: (userId: string): Swipe[] => {
    return getFromStorage<Swipe[]>(KEYS.SWIPES, []).filter(s => s.user_id === userId);
  },

  create: (userId: string, itemId: string, direction: "left" | "right"): { swipe: Swipe; match?: Match } => {
    const allSwipes = getFromStorage<Swipe[]>(KEYS.SWIPES, []);
    
    const newSwipe: Swipe = {
      id: generateId(),
      user_id: userId,
      item_id: itemId,
      swipe_direction: direction,
      created_at: new Date().toISOString(),
    };
    
    allSwipes.push(newSwipe);
    setToStorage(KEYS.SWIPES, allSwipes);

    // Check for match if right swipe
    if (direction === "right") {
      const item = items.getById(itemId);
      if (item) {
        const itemOwnerId = item.user_id;
        const userItems = items.getByUser(userId);
        
        // Check if the item owner has swiped right on any of the user's items
        const matchingSwipe = allSwipes.find(s => 
          s.user_id === itemOwnerId && 
          s.swipe_direction === "right" &&
          userItems.some(ui => ui.id === s.item_id)
        );

        if (matchingSwipe) {
          const match = matches.create(userId, itemOwnerId, matchingSwipe.item_id, itemId);
          return { swipe: newSwipe, match };
        }
      }
    }

    return { swipe: newSwipe };
  },
};

export const matches = {
  getByUser: (userId: string): Match[] => {
    return getFromStorage<Match[]>(KEYS.MATCHES, [])
      .filter(m => m.user1_id === userId || m.user2_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getById: (id: string): Match | undefined => {
    return getFromStorage<Match[]>(KEYS.MATCHES, []).find(m => m.id === id);
  },

  create: (user1Id: string, user2Id: string, item1Id: string, item2Id: string): Match => {
    const allMatches = getFromStorage<Match[]>(KEYS.MATCHES, []);
    const newMatch: Match = {
      id: generateId(),
      user1_id: user1Id,
      user2_id: user2Id,
      item1_id: item1Id,
      item2_id: item2Id,
      created_at: new Date().toISOString(),
      status: "pending",
    };
    allMatches.push(newMatch);
    setToStorage(KEYS.MATCHES, allMatches);

    // Create notifications
    notifications.create(user1Id, "match", "Nouveau match !", "Vous avez un nouveau match. Commencez à discuter !", "/matches");
    notifications.create(user2Id, "match", "Nouveau match !", "Vous avez un nouveau match. Commencez à discuter !", "/matches");

    return newMatch;
  },

  update: (id: string, updates: Partial<Match>): Match | undefined => {
    const allMatches = getFromStorage<Match[]>(KEYS.MATCHES, []);
    const index = allMatches.findIndex(m => m.id === id);
    if (index === -1) return undefined;

    allMatches[index] = { ...allMatches[index], ...updates };
    setToStorage(KEYS.MATCHES, allMatches);
    return allMatches[index];
  },
};

// Messages
export const messages = {
  getByMatch: (matchId: string): Message[] => {
    return getFromStorage<Message[]>(KEYS.MESSAGES, [])
      .filter(m => m.match_id === matchId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  create: (matchId: string, senderId: string, content: string): Message => {
    const allMessages = getFromStorage<Message[]>(KEYS.MESSAGES, []);
    const newMessage: Message = {
      id: generateId(),
      match_id: matchId,
      sender_id: senderId,
      content,
      created_at: new Date().toISOString(),
    };
    allMessages.push(newMessage);
    setToStorage(KEYS.MESSAGES, allMessages);
    return newMessage;
  },

  markAsRead: (messageIds: string[]): void => {
    const allMessages = getFromStorage<Message[]>(KEYS.MESSAGES, []);
    const now = new Date().toISOString();
    messageIds.forEach(id => {
      const index = allMessages.findIndex(m => m.id === id);
      if (index !== -1) {
        allMessages[index].read_at = now;
      }
    });
    setToStorage(KEYS.MESSAGES, allMessages);
  },
};

// Favorites
export const favorites = {
  getByUser: (userId: string): Favorite[] => {
    return getFromStorage<Favorite[]>(KEYS.FAVORITES, []).filter(f => f.user_id === userId);
  },

  add: (userId: string, itemId: string): Favorite => {
    const allFavorites = getFromStorage<Favorite[]>(KEYS.FAVORITES, []);
    const newFavorite: Favorite = {
      id: generateId(),
      user_id: userId,
      item_id: itemId,
      created_at: new Date().toISOString(),
    };
    allFavorites.push(newFavorite);
    setToStorage(KEYS.FAVORITES, allFavorites);
    return newFavorite;
  },

  remove: (userId: string, itemId: string): void => {
    const allFavorites = getFromStorage<Favorite[]>(KEYS.FAVORITES, []);
    setToStorage(KEYS.FAVORITES, allFavorites.filter(f => !(f.user_id === userId && f.item_id === itemId)));
  },

  isFavorite: (userId: string, itemId: string): boolean => {
    const allFavorites = getFromStorage<Favorite[]>(KEYS.FAVORITES, []);
    return allFavorites.some(f => f.user_id === userId && f.item_id === itemId);
  },
};

// Notifications
export const notifications = {
  getByUser: (userId: string): Notification[] => {
    return getFromStorage<Notification[]>(KEYS.NOTIFICATIONS, [])
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  create: (userId: string, type: string, title: string, message: string, link?: string): Notification => {
    const allNotifications = getFromStorage<Notification[]>(KEYS.NOTIFICATIONS, []);
    const newNotification: Notification = {
      id: generateId(),
      user_id: userId,
      type,
      title,
      message,
      link,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    allNotifications.push(newNotification);
    setToStorage(KEYS.NOTIFICATIONS, allNotifications);
    return newNotification;
  },

  markAsRead: (id: string): void => {
    const allNotifications = getFromStorage<Notification[]>(KEYS.NOTIFICATIONS, []);
    const index = allNotifications.findIndex(n => n.id === id);
    if (index !== -1) {
      allNotifications[index].is_read = true;
      setToStorage(KEYS.NOTIFICATIONS, allNotifications);
    }
  },

  markAllAsRead: (userId: string): void => {
    const allNotifications = getFromStorage<Notification[]>(KEYS.NOTIFICATIONS, []);
    allNotifications.forEach((n, i) => {
      if (n.user_id === userId) {
        allNotifications[i].is_read = true;
      }
    });
    setToStorage(KEYS.NOTIFICATIONS, allNotifications);
  },

  getUnreadCount: (userId: string): number => {
    return getFromStorage<Notification[]>(KEYS.NOTIFICATIONS, [])
      .filter(n => n.user_id === userId && !n.is_read)
      .length;
  },
};

// Initialize on module load
initializeDemoData();
