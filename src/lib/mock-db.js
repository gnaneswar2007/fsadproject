import { apiRequest } from "@/lib/api";

const DONATIONS_CACHE_KEY = "api_donations_cache";
const STATUS_OVERRIDES_KEY = "donation_status_overrides";
const USERS_KEY = "mock_users";
const AUTH_KEY = "mock_auth_user";

function readStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function readAuthEmail() {
  const auth = readStore(AUTH_KEY, null);
  return auth?.user?.email || null;
}

function readAuthRole() {
  const auth = readStore(AUTH_KEY, null);
  return auth?.role || "donor";
}

function normalizeDonation(apiDonation) {
  return {
    id: apiDonation.id,
    food_name: apiDonation.foodName,
    category: apiDonation.category,
    quantity: apiDonation.quantity,
    expiry_date: apiDonation.expiryDate,
    pickup_location: apiDonation.pickupLocation,
    description: apiDonation.description || "",
    donor_id: apiDonation.donorEmail,
    donor_name: apiDonation.donorEmail,
    donor_phone: apiDonation.phoneNumber || "",
    status: apiDonation.status || "available",
    created_at: apiDonation.createdAt,
  };
}

function toLocalDateTimeString(isoValue) {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return isoValue;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function applyStatusOverrides(donations) {
  const overrides = readStore(STATUS_OVERRIDES_KEY, {});
  return donations.map((d) => ({
    ...d,
    status: overrides[d.id] || d.status,
  }));
}

export async function getDonations() {
  const email = readAuthEmail();
  const role = readAuthRole();
  if (!email) return readStore(DONATIONS_CACHE_KEY, []);

  const emails = new Set([email]);
  const users = getUsers();

  if (role === "recipient") {
    // Recipients should browse donor listings, not only their own email.
    users.forEach((u) => {
      if (u.role === "donor" && u.user_id && String(u.user_id).includes("@")) {
        emails.add(u.user_id);
      }
    });
  }

  if (role === "admin" || role === "analyst") {
    users.forEach((u) => {
      if (u.user_id && String(u.user_id).includes("@")) {
        emails.add(u.user_id);
      }
    });
  }

  // Fallback: preserve previously seen donor emails so recipient feed stays populated.
  const cached = readStore(DONATIONS_CACHE_KEY, []);
  cached.forEach((d) => {
    const donorEmail = d?.donor_id;
    if (donorEmail && String(donorEmail).includes("@")) {
      emails.add(donorEmail);
    }
  });

  const all = [];
  await Promise.all(
    Array.from(emails).map(async (donorEmail) => {
      const data = await apiRequest(`/api/donations?donorEmail=${encodeURIComponent(donorEmail)}`);
      (data || []).forEach((item) => all.push(item));
    })
  );

  const byId = new Map();
  all.forEach((item) => byId.set(item.id, item));
  const normalized = applyStatusOverrides(Array.from(byId.values()).map(normalizeDonation));
  writeStore(DONATIONS_CACHE_KEY, normalized);
  return normalized;
}

export async function getDonationsByUser(userId) {
  const auth = readStore(AUTH_KEY, null);
  const email = userId?.includes?.("@") ? userId : auth?.user?.email || null;
  if (!email) return [];

  const data = await apiRequest(`/api/donations?donorEmail=${encodeURIComponent(email)}`);
  const normalized = applyStatusOverrides((data || []).map(normalizeDonation));
  writeStore(DONATIONS_CACHE_KEY, normalized);
  return normalized;
}

export async function getAvailableDonations() {
  const all = await getDonations();
  return all.filter((d) => d.status === "available");
}

export async function getDonationById(id) {
  const all = await getDonations();
  return all.find((d) => String(d.id) === String(id)) || null;
}

export async function addDonation({
  food_name,
  category,
  quantity,
  expiry_date,
  pickup_location,
  description,
  donor_phone,
}) {
  const donorEmail = readAuthEmail();
  if (!donorEmail) {
    throw new Error("Please sign in before creating a donation");
  }

  const created = await apiRequest("/api/donations", {
    method: "POST",
    body: {
      donor_email: donorEmail,
      food_name,
      category,
      quantity,
      pickup_location,
      phone_number: donor_phone,
      description: description || "",
      expiry_date: toLocalDateTimeString(expiry_date),
    },
  });

  const normalized = normalizeDonation(created);
  const cached = readStore(DONATIONS_CACHE_KEY, []);
  const next = [normalized, ...cached];
  writeStore(DONATIONS_CACHE_KEY, next);
  return normalized;
}

export async function deleteDonation(id) {
  await apiRequest(`/api/donations/${id}`, { method: "DELETE" });
  const donations = readStore(DONATIONS_CACHE_KEY, []);
  const filtered = donations.filter((d) => String(d.id) !== String(id));
  writeStore(DONATIONS_CACHE_KEY, filtered);
  return filtered.length < donations.length;
}

export async function updateDonationStatus(id, status) {
  const overrides = readStore(STATUS_OVERRIDES_KEY, {});
  overrides[id] = status;
  writeStore(STATUS_OVERRIDES_KEY, overrides);

  const donations = readStore(DONATIONS_CACHE_KEY, []);
  const idx = donations.findIndex((d) => String(d.id) === String(id));
  if (idx === -1) return null;
  donations[idx].status = status;
  writeStore(DONATIONS_CACHE_KEY, donations);
  return donations[idx];
}

export function getUsers() {
  return readStore(USERS_KEY, []);
}

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

export function updateUser(updated) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.user_id === updated.user_id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updated };
  writeStore(USERS_KEY, users);
  return users[idx];
}

export function deleteUser(userId) {
  const users = getUsers();
  const filtered = users.filter((u) => u.user_id !== userId);
  writeStore(USERS_KEY, filtered);
  return filtered.length < users.length;
}
