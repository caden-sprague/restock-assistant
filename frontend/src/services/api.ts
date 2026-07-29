import Constants from "expo-constants";
import { Platform } from "react-native";

type SessionResponse =
  | {
      status: "ready";
      siteId: string;
      restockSessionId: string;
      itemCount: number;
    }
  | {
      status: "error";
      code: string;
      message: string;
    };

type CommandSuccessResponse = {
  status: "success";
  message: string;
  item: {
    name: string;
    siteInventoryId: number;
  };
  quantity: number;
};

type CommandNeedsConfirmationResponse = {
  status: "needs_confirmation";
  message: string;
  options: Array<{
    name: string;
    siteInventoryId: number;
  }>;
  quantity: number;
};

type CommandErrorResponse = {
  status: "error";
  code: string;
  message: string;
};

export type CommandApiResponse =
  | CommandSuccessResponse
  | CommandNeedsConfirmationResponse
  | CommandErrorResponse;

function resolveApiBaseUrl() {
  const fromExpoConfig = (Constants.expoConfig?.extra as
    | { apiBaseUrl?: string }
    | undefined)?.apiBaseUrl;

  // Platform-specific overrides win: web (this computer) vs. native device
  // (a different machine on the LAN). These must be referenced by their exact
  // literal names — Expo inlines EXPO_PUBLIC_* vars at build time by matching
  // static `process.env.EXPO_PUBLIC_FOO` accesses, so no dynamic keys.
  const platformEnv = Platform.select({
    web: process.env.EXPO_PUBLIC_API_URL_WEB,
    default: process.env.EXPO_PUBLIC_API_URL_NATIVE,
  });

  // Generic override still works as a catch-all for both platforms.
  const fromEnv = platformEnv ?? process.env.EXPO_PUBLIC_API_URL;

  return (fromEnv ?? fromExpoConfig ?? "http://localhost:3000").replace(/\/$/, "");
}

export const API_BASE_URL = resolveApiBaseUrl();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = (await response.json().catch(() => null)) as T | null;

  if (!response.ok) {
    throw new Error(
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: string }).message)
        : "The backend request failed."
    );
  }

  return payload as T;
}

export async function startRestockSession(
  siteId?: string,
  restockSessionId?: string
): Promise<SessionResponse> {
  return request<SessionResponse>("/session/start", {
    method: "POST",
    body: JSON.stringify({ siteId, restockSessionId }),
  });
}

export async function submitCommand(text: string): Promise<CommandApiResponse> {
  return request<CommandApiResponse>("/commands", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function confirmCommand(
  siteInventoryId: number,
  quantity: number
): Promise<CommandApiResponse> {
  return request<CommandApiResponse>("/commands/confirm", {
    method: "POST",
    body: JSON.stringify({ siteInventoryId, quantity }),
  });
}
