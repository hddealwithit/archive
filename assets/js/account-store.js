const ACCOUNT_STORAGE_KEY = 'archiveArcadeAccounts';
const SESSION_STORAGE_KEY = 'archiveArcadeCurrentUser';

function readAccounts() {
  try {
    const raw = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('Unable to read stored accounts.', error);
    return {};
  }
}

function writeAccounts(accounts) {
  window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
}

function slugifyUsername(username) {
  return String(username || '').trim().toLowerCase();
}

async function hashPassword(password) {
  const normalized = String(password || '');
  const encoded = new TextEncoder().encode(normalized);
  const digest = await window.crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map(value => value.toString(16).padStart(2, '0'))
    .join('');
}

function sanitizeAccount(account) {
  return {
    username: account.username,
    createdAt: account.createdAt,
    passwordHash: account.passwordHash,
    profile: {
      favoriteGame: account.profile?.favoriteGame || '',
      bio: account.profile?.bio || ''
    },
    progress: {
      articlesRead: Array.isArray(account.progress?.articlesRead) ? account.progress.articlesRead : [],
      gamesPlayed: Array.isArray(account.progress?.gamesPlayed) ? account.progress.gamesPlayed : [],
      launchCount: Number(account.progress?.launchCount || 0),
      lastPlayed: account.progress?.lastPlayed || '',
      lastArticle: account.progress?.lastArticle || 'home'
    }
  };
}

async function createAccount({ username, password, favoriteGame = '', bio = '' }) {
  const key = slugifyUsername(username);
  if (!key) {
    return { ok: false, message: 'Choose a username before creating an account.' };
  }

  if (String(password || '').length < 4) {
    return { ok: false, message: 'Use a password with at least 4 characters.' };
  }

  const accounts = readAccounts();
  if (accounts[key]) {
    return { ok: false, message: 'That username already exists. Sign in instead.' };
  }

  const account = sanitizeAccount({
    username: String(username).trim(),
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
    profile: { favoriteGame: String(favoriteGame).trim(), bio: String(bio).trim() },
    progress: {
      articlesRead: ['home'],
      gamesPlayed: [],
      launchCount: 0,
      lastPlayed: '',
      lastArticle: 'home'
    }
  });

  accounts[key] = account;
  writeAccounts(accounts);
  window.localStorage.setItem(SESSION_STORAGE_KEY, key);
  return { ok: true, account };
}

async function loginAccount({ username, password }) {
  const key = slugifyUsername(username);
  const accounts = readAccounts();
  const account = accounts[key];

  if (!account) {
    return { ok: false, message: 'Incorrect username or password.' };
  }

  const passwordHash = await hashPassword(password);
  if (account.passwordHash !== passwordHash) {
    return { ok: false, message: 'Incorrect username or password.' };
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, key);
  return { ok: true, account: sanitizeAccount(account) };
}

function logoutAccount() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

function getCurrentAccount() {
  const key = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!key) return null;
  const accounts = readAccounts();
  return accounts[key] ? sanitizeAccount(accounts[key]) : null;
}

function updateCurrentAccount(mutator) {
  const key = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!key) return null;

  const accounts = readAccounts();
  const account = accounts[key];
  if (!account) return null;

  const updated = sanitizeAccount(mutator(sanitizeAccount(account)) || account);
  accounts[key] = updated;
  writeAccounts(accounts);
  return updated;
}

window.archiveAccountStore = {
  createAccount,
  loginAccount,
  logoutAccount,
  getCurrentAccount,
  updateCurrentAccount,
  readAccounts
};
