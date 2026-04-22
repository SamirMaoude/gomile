import {
  getCurrentMerchantProfile,
  getCurrentMerchantSession,
  setCurrentMerchantProfile,
} from "@/lib/merchant-session";
import { updateMerchantProfile } from "@/lib/api-client";

export type MerchantSettingsProfile = {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  phone: string | null;
};

export type UpdateMerchantSettingsInput = {
  name: string;
  phone?: string;
};

export async function getMerchantSettingsProfile(): Promise<MerchantSettingsProfile> {
  return getCurrentMerchantProfile();
}

export async function updateMerchantSettings(
  input: UpdateMerchantSettingsInput,
): Promise<MerchantSettingsProfile> {
  const session = await getCurrentMerchantSession();
  const currentProfile = await getCurrentMerchantProfile();

  const response = await updateMerchantProfile(session.user.id, input);

  const nextProfile = {
    ...currentProfile,
    name: response.name ?? currentProfile.name,
    phone: response.phone ?? null,
  };

  setCurrentMerchantProfile(nextProfile);
  return nextProfile;
}
