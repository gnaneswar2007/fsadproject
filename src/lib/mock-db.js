// mock-db.js — localStorage-based CRUD for donations and users (no backend needed)

const DONATIONS_KEY = "mock_donations";
const USERS_KEY = "mock_users";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function readStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Donations ────────────────────────────────────────────────────────────────

/** Get all donations */
export function getDonations() {
  return readStore(DONATIONS_KEY);
}

/** Get donations created by a specific user */
export function getDonationsByUser(userId) {
  return getDonations().filter((d) => d.donor_id === userId);
}

/** Get only donations with status "available" */
export function getAvailableDonations() {
  return getDonations().filter((d) => d.status === "available");
}

/** Get a single donation by id */
export function getDonationById(id) {
  return getDonations().find((d) => d.id === id) || null;
}

/** Add a new donation. Returns the created donation object. */
export function addDonation({ food_name, category, quantity, expiry_date, pickup_location, description, donor_id }) {
  const donations = getDonations();
  const donation = {
    id: `don-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    food_name,
    category,
    quantity,
    expiry_date,
    pickup_location,
    description: description || "",
    donor_id,
    status: "available",
    created_at: new Date().toISOString(),
  };
  donations.push(donation);
  writeStore(DONATIONS_KEY, donations);
  return donation;
}

/** Delete a donation by id. Returns true if found and deleted. */
export function deleteDonation(id) {
  const donations = getDonations();
  const filtered = donations.filter((d) => d.id !== id);
  if (filtered.length === donations.length) return false;
  writeStore(DONATIONS_KEY, filtered);
  return true;
}

/** Update the status of a donation (e.g. "claimed", "picked_up"). */
export function updateDonationStatus(id, status) {
  const donations = getDonations();
  const idx = donations.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  donations[idx].status = status;
  writeStore(DONATIONS_KEY, donations);
  return donations[idx];
}

// ─── Users ────────────────────────────────────────────────────────────────────

/** Get all registered users */
export function getUsers() {
  return readStore(USERS_KEY);
}

/** Ensure a user record exists in the users store (called on login/signup) */
export function upsertUser({ user_id, full_name, organization_name, role, created_at }) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.user_id === user_id);
  const record = {
    user_id,
    full_name: full_name || "",
    organization_name: organization_name || "",
    role: role || "donor",
    created_at: created_at || new Date().toISOString(),
  };
  if (idx === -1) {
    users.push(record);
  } else {
    users[idx] = { ...users[idx], ...record };
  }
  writeStore(USERS_KEY, users);
  return record;
}

/** Update user profile fields */
export function updateUser(updated) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.user_id === updated.user_id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updated };
  writeStore(USERS_KEY, users);
  return users[idx];
}

/** Delete a user by user_id */
export function deleteUser(userId) {
  const users = getUsers();
  const filtered = users.filter((u) => u.user_id !== userId);
  writeStore(USERS_KEY, filtered);
  return filtered.length < users.length;
}
