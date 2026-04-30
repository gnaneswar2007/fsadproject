import { apiRequest } from "@/lib/api";

const DONATIONS_CACHE_KEY = "api_donations_cache";
const STATUS_OVERRIDES_KEY = "donation_status_overrides";
const DELETED_DONATION_IDS_KEY = "deleted_donation_ids";
const DELETED_DONATION_KEYS_KEY = "deleted_donation_keys";
const USERS_KEY = "mock_users";
const AUTH_KEY = "mock_auth_user";

function getDemoDonations() {
  return [
    {
      id: "demo-1",
      food_name: "Mixed Vegetables",
      category: "produce",
      quantity: "20 kg",
      expiry_date: "2026-04-30T12:00:00",
      pickup_location: "Central Market",
      description: "Fresh surplus produce for same-day pickup.",
      donor_id: "demo.donor@foodsaver.app",
      donor_name: "demo.donor@foodsaver.app",
      donor_phone: "1234567890",
      status: "available",
      created_at: "2026-04-24T09:00:00Z",
    },
    {
      id: "demo-2",
      food_name: "Whole Wheat Bread",
      category: "bakery",
      quantity: "12 packs",
      expiry_date: "2026-04-28T08:00:00",
      pickup_location: "North Kitchen",
      description: "Bakery items with one to two days remaining.",
      donor_id: "demo.donor@foodsaver.app",
      donor_name: "demo.donor@foodsaver.app",
      donor_phone: "1234567890",
      status: "available",
      created_at: "2026-04-24T10:00:00Z",
    },
    {
      id: "demo-3",
      food_name: "Milk Cartons",
      category: "dairy",
      quantity: "8 crates",
      expiry_date: "2026-04-27T18:00:00",
      pickup_location: "Cold Storage Bay",
      description: "Refrigerated donation for immediate collection.",
      donor_id: "demo.donor@foodsaver.app",
      donor_name: "demo.donor@foodsaver.app",
      donor_phone: "1234567890",
      status: "available",
      created_at: "2026-04-24T11:00:00Z",
    },
    {
      id: "demo-claimed-1",
      food_name: "Prepared Meals",
      category: "prepared",
      quantity: "15 trays",
      expiry_date: "2026-04-26T20:00:00",
      pickup_location: "Community Hall",
      description: "Reserved for pickup by a recipient organization.",
      donor_id: "demo.donor@foodsaver.app",
      donor_name: "demo.donor@foodsaver.app",
      donor_phone: "1234567890",
      status: "claimed",
      created_at: "2026-04-24T12:00:00Z",
    },
  ];
}

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

function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function normalizeDonation(apiDonation) {
  const id = pickFirst(apiDonation.id, apiDonation._id);
  const foodName = pickFirst(apiDonation.foodName, apiDonation.food_name);
  const expiryDate = pickFirst(apiDonation.expiryDate, apiDonation.expiry_date);
  const pickupLocation = pickFirst(apiDonation.pickupLocation, apiDonation.pickup_location);
  const donorEmail = pickFirst(apiDonation.donorEmail, apiDonation.donor_email);
  const phoneNumber = pickFirst(apiDonation.phoneNumber, apiDonation.phone_number);
  const createdAt = pickFirst(apiDonation.createdAt, apiDonation.created_at);

  return {
    id,
    food_name: foodName,
    category: apiDonation.category,
    quantity: apiDonation.quantity,
    expiry_date: expiryDate,
    pickup_location: pickupLocation,
    description: apiDonation.description || "",
    donor_id: donorEmail,
    donor_name: donorEmail,
    donor_phone: phoneNumber || "",
    status: apiDonation.status || "available",
    created_at: createdAt,
  };
}

function normalizeStats(apiStats) {
  if (!apiStats || typeof apiStats !== "object") {
    return { total: 0, available: 0, claimed: 0, users: 0 };
  }

  return {
    total: Number(
      pickFirst(
        apiStats.totalDonations,
        apiStats.total,
        apiStats.total_donations,
        0
      )
    ) || 0,
    available: Number(
      pickFirst(
        apiStats.activeListings,
        apiStats.available,
        apiStats.availableDonations,
        apiStats.available_donations,
        0
      )
    ) || 0,
    claimed: Number(
      pickFirst(
        apiStats.recipientAccepted,
        apiStats.claimed,
        apiStats.claimedDonations,
        apiStats.claimed_donations,
        apiStats.pickedUp,
        apiStats.picked_up,
        0
      )
    ) || 0,
    users: Number(
      pickFirst(
        apiStats.users,
        apiStats.totalUsers,
        apiStats.total_users,
        0
      )
    ) || 0,
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

function getDeletedDonationIds() {
  return new Set((readStore(DELETED_DONATION_IDS_KEY, []) || []).map((id) => String(id)));
}

function donationKey(donation) {
  if (!donation) return "";
  return [
    String(donation.donor_id || donation.donorEmail || ""),
    String(donation.food_name || donation.foodName || ""),
    String(donation.quantity || ""),
    String(donation.expiry_date || donation.expiryDate || ""),
    String(donation.pickup_location || donation.pickupLocation || ""),
  ].join("|");
}

function getDeletedDonationKeys() {
  return new Set((readStore(DELETED_DONATION_KEYS_KEY, []) || []).map((k) => String(k)));
}

function filterDeletedDonations(donations) {
  const deletedIds = getDeletedDonationIds();
  const deletedKeys = getDeletedDonationKeys();
  if (deletedIds.size === 0 && deletedKeys.size === 0) return donations;
  return donations.filter((d) => !deletedIds.has(String(d.id)) && !deletedKeys.has(donationKey(d)));
}

function isLocalDonation(donation) {
  return String(donation?.id || "").startsWith("local-");
}

function mergeLocalDonations(remoteDonations, cachedDonations) {
  const localCachedDonations = cachedDonations.filter(isLocalDonation);
  if (localCachedDonations.length === 0) return remoteDonations;

  const remoteIds = new Set(remoteDonations.map((donation) => String(donation.id)));
  const merged = [...remoteDonations];

  localCachedDonations.forEach((donation) => {
    if (!remoteIds.has(String(donation.id))) {
      merged.unshift(donation);
    }
  });

  return merged;
}

function rememberDeletedDonation(id, donation) {
  const deletedIds = getDeletedDonationIds();
  deletedIds.add(String(id));
  writeStore(DELETED_DONATION_IDS_KEY, Array.from(deletedIds));

  const key = donationKey(donation);
  if (key) {
    const deletedKeys = getDeletedDonationKeys();
    deletedKeys.add(key);
    writeStore(DELETED_DONATION_KEYS_KEY, Array.from(deletedKeys));
  }
}

function forgetDeletedDonation(id, donation) {
  const deletedIds = getDeletedDonationIds();
  const key = String(id);
  if (deletedIds.has(key)) {
    deletedIds.delete(key);
    writeStore(DELETED_DONATION_IDS_KEY, Array.from(deletedIds));
  }

  const donationFingerprint = donationKey(donation);
  if (donationFingerprint) {
    const deletedKeys = getDeletedDonationKeys();
    if (deletedKeys.has(donationFingerprint)) {
      deletedKeys.delete(donationFingerprint);
      writeStore(DELETED_DONATION_KEYS_KEY, Array.from(deletedKeys));
    }
  }
}

export async function getDonations() {
  const email = readAuthEmail();
  const role = readAuthRole();
  const cached = readStore(DONATIONS_CACHE_KEY, []);
  if (!email) return cached;

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

  // Preserve previously seen donor emails only for recipient browse continuity.
  if (role === "recipient") {
    cached.forEach((d) => {
      const donorEmail = d?.donor_id;
      if (donorEmail && String(donorEmail).includes("@")) {
        emails.add(donorEmail);
      }
    });
  }

  const all = [];
  const results = await Promise.allSettled(
    Array.from(emails).map(async (donorEmail) => {
      const data = await apiRequest(`/donations?donorEmail=${encodeURIComponent(donorEmail)}`);
      return data || [];
    })
  );

  const successResponses = results.filter((r) => r.status === "fulfilled");
  if (successResponses.length === 0) {
    return filterDeletedDonations(applyStatusOverrides(cached));
  }

  successResponses.forEach((result) => {
    result.value.forEach((item) => all.push(item));
  });

  const byId = new Map();
  all.forEach((item) => byId.set(item.id, item));
  const normalized = applyStatusOverrides(Array.from(byId.values()).map(normalizeDonation));
  const visible = filterDeletedDonations(mergeLocalDonations(normalized, cached));
  const hasAvailable = visible.some((donation) => donation.status === "available");
  const nextVisible = import.meta.env.PROD && !hasAvailable
    ? filterDeletedDonations(mergeLocalDonations(visible, getDemoDonations()))
    : visible;

  writeStore(DONATIONS_CACHE_KEY, nextVisible);
  return nextVisible;
}

export async function getDonationsByUser(userId) {
  const auth = readStore(AUTH_KEY, null);
  const email = userId?.includes?.("@") ? userId : auth?.user?.email || null;
  if (!email) return [];

  try {
    const data = await apiRequest(`/donations?donorEmail=${encodeURIComponent(email)}`);
    const normalized = applyStatusOverrides((data || []).map(normalizeDonation));
    const visible = filterDeletedDonations(mergeLocalDonations(normalized, readStore(DONATIONS_CACHE_KEY, [])));
    writeStore(DONATIONS_CACHE_KEY, visible);
    return visible;
  } catch {
    return filterDeletedDonations(readStore(DONATIONS_CACHE_KEY, []) || []).filter((d) => String(d.donor_id) === String(email));
  }
}

export async function getAvailableDonations() {
  const all = await getDonations();
  return all.filter((d) => d.status === "available");
}

export async function getDonationById(id) {
  const all = await getDonations();
  return all.find((d) => String(d.id) === String(id)) || null;
}

export async function getDonationStats() {
  try {
    const stats = await apiRequest("/dashboard-stats");
    return normalizeStats(stats);
  } catch {
    const all = await getDonations();
    return {
      total: all.length,
      available: all.filter((d) => d.status === "available").length,
      claimed: all.filter((d) => ["claimed", "picked_up"].includes(d.status)).length,
      users: getUsers().length,
    };
  }
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

  const normalizedExpiry = toLocalDateTimeString(expiry_date);
  let normalized;

  try {
    console.log("Attempting to save donation to backend...");
    const created = await apiRequest("/donations", {
      method: "POST",
      body: {
        donor_email: donorEmail,
        food_name,
        category,
        quantity,
        pickup_location,
        phone_number: donor_phone,
        description: description || "",
        expiry_date: normalizedExpiry,
      },
    });

    console.log("Backend response:", created);
    normalized = normalizeDonation(created);

    if (!normalized?.id) {
      throw new Error("Donation was not saved by backend. Please try again.");
    }
  } catch (error) {
    console.log("Backend API failed, falling back to local storage. Error:", error);
    // Keep local-storage behavior when backend is unavailable or rejects the request.
    normalized = {
      id: `local-${Date.now()}`,
      food_name,
      category,
      quantity,
      expiry_date: normalizedExpiry,
      pickup_location,
      description: description || "",
      donor_id: donorEmail,
      donor_name: donorEmail,
      donor_phone: donor_phone || "",
      status: "available",
      created_at: new Date().toISOString(),
    };
  }

  forgetDeletedDonation(normalized.id, normalized);
  
  // Clear ALL status overrides to remove stale data, then protect only this new donation
  const allCached = readStore(DONATIONS_CACHE_KEY, []);
  const validIds = new Set(allCached.map((d) => String(d.id)));
  
  const allOverrides = readStore(STATUS_OVERRIDES_KEY, {});
  const cleanedOverrides = Object.keys(allOverrides)
    .filter((key) => validIds.has(key) && key !== String(normalized.id))
    .reduce((acc, key) => {
      acc[key] = allOverrides[key];
      return acc;
    }, {});
  writeStore(STATUS_OVERRIDES_KEY, cleanedOverrides);
  
  const cached = readStore(DONATIONS_CACHE_KEY, []);
  const next = [normalized, ...cached];
  writeStore(DONATIONS_CACHE_KEY, next);
  return normalized;
}

export async function deleteDonation(id) {
  const donorEmail = readAuthEmail();
  const attempts = [
    donorEmail ? `/donations/${id}?donorEmail=${encodeURIComponent(donorEmail)}` : null,
    `/donations/${id}`,
    donorEmail ? `/donations?id=${encodeURIComponent(String(id))}&donorEmail=${encodeURIComponent(donorEmail)}` : null,
    `/donations?id=${encodeURIComponent(String(id))}`,
  ].filter(Boolean);

  let deletedRemotely = false;
  let lastError = null;
  let hadNetworkError = false;

  for (const path of attempts) {
    try {
      await apiRequest(path, { method: "DELETE" });
      deletedRemotely = true;
      break;
    } catch (error) {
      lastError = error;
      const msg = String(error?.message || "").toLowerCase();
      if (error instanceof TypeError || msg.includes("failed to fetch")) {
        hadNetworkError = true;
      }
    }
  }

  const donations = readStore(DONATIONS_CACHE_KEY, []);
  const deletedDonation = donations.find((d) => String(d.id) === String(id));
  const filtered = donations.filter((d) => String(d.id) !== String(id));

  

  writeStore(DONATIONS_CACHE_KEY, filtered);
  rememberDeletedDonation(id, deletedDonation);

  const overrides = readStore(STATUS_OVERRIDES_KEY, {});
  const key = String(id);
  if (Object.prototype.hasOwnProperty.call(overrides, key)) {
    delete overrides[key];
    writeStore(STATUS_OVERRIDES_KEY, overrides);
  }

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

  // Trigger same-tab listeners so dashboard sections refresh immediately.
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new Event("donations:updated"));

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
