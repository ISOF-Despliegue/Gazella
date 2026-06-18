import { apiRequest } from "./api";

const LOCAL_PROFILE_KEY = "gazella_local_profile";

export type AccountProfile = {
    id: string;
    email: string;
    pfpUri?: string | null;
    name: string;
    parentalSurname?: string | null;
    maternalSurname?: string | null;
    bio?: string | null;
    role: string;
    joinedAt: string;
};

export type EditableAccountProfile = Pick<
    AccountProfile,
    "email" | "pfpUri" | "name" | "parentalSurname" | "maternalSurname" | "bio" | "role" | "joinedAt"
> & {
    id?: string;
};

export type UpdateAccountInput = {
    pfpUri?: string | null;
    name: string;
    parentalSurname?: string | null;
    maternalSurname?: string | null;
    bio?: string | null;
};

export async function getMyAccount() {
    return apiRequest<AccountProfile>("/accounts/me");
}

export interface PublicAccountProfile {
    id: string;
    pfpUri?: string | null;
    name: string;
    parentalSurname?: string | null;
    maternalSurname?: string | null;
    bio?: string | null;
    role: string;
    joinedAt: string;
}

export async function getProfileById(accountId: string) {
    return apiRequest<PublicAccountProfile>(`/accounts/${accountId}`);
}

export async function updateMyAccount(input: UpdateAccountInput) {
    return apiRequest<{ message: string }>("/accounts", {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

export async function followAccount(targetId: string) {
    return apiRequest<{ message: string }>("/socials", {
        method: "POST",
        body: JSON.stringify({ targetId }),
    });
}

export async function unfollowAccount(targetId: string) {
    return apiRequest<{ message: string }>(`/socials/${targetId}`, {
        method: "DELETE",
    });
}

export async function getFollowersFor(accountId: string) {
    return apiRequest<Array<{ follower: PublicAccountProfile }>>(`/socials/followers/${accountId}`);
}

export function saveLocalProfile(profile: EditableAccountProfile) {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
}

export function getLocalProfile(email?: string): EditableAccountProfile | null {
    const rawProfile = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (!rawProfile) return null;

    try {
        const profile = JSON.parse(rawProfile) as EditableAccountProfile;
        if (email && profile.email !== email) return null;
        return profile;
    } catch {
        localStorage.removeItem(LOCAL_PROFILE_KEY);
        return null;
    }
}

export function clearLocalProfile() {
    localStorage.removeItem(LOCAL_PROFILE_KEY);
}
