import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Globe, KeyRound, Loader2, Save, Server, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { extractErrorMessage } from "@/lib/api";
import { useUpdateUserAISettings, useUserAISettings } from "@/lib/queries";
import type { AiProvider } from "@/types/api";

/**
 * ONE unified AI config. Defaults to `openai-compatible`, which works with
 * OpenRouter, OpenAI itself, Groq, Together, Ollama, or any other OpenAI-style
 * endpoint. Anthropic and Gemini stay available for their native APIs.
 *
 * Only ONE key is stored. No multi-provider chaining. Whatever you put here
 * gets used for every AI feature on the site (tools, resume AI, growth reports).
 */

const PROVIDER_OPTIONS: Array<{ value: AiProvider; label: string; hint: string }> = [
  {
    value: "openai-compatible",
    label: "OpenAI-compatible (recommended)",
    hint: "Works with OpenRouter, OpenAI, Groq, Together, Ollama, etc.",
  },
  { value: "anthropic", label: "Anthropic (native API)", hint: "claude-sonnet-* models direct" },
  { value: "openai", label: "OpenAI (native API)", hint: "OpenAI's own endpoint" },
  { value: "gemini", label: "Google Gemini (native API)", hint: "Gemini's own endpoint" },
];

const PLACEHOLDER_BASE_URL: Record<AiProvider, string> = {
  "openai-compatible": "https://openrouter.ai/api/v1",
  openai: "https://api.openai.com/v1 (optional)",
  anthropic: "(not used)",
  gemini: "(not used)",
};

const PLACEHOLDER_MODEL: Record<AiProvider, string> = {
  "openai-compatible": "openai/gpt-4.1-mini",
  openai: "gpt-4.1-mini",
  anthropic: "claude-sonnet-4-5",
  gemini: "gemini-2.5-flash",
};

const DEFAULT_PROVIDER: AiProvider = "openai-compatible";

export function AiSettingsCard() {
  const { data: settings, isLoading } = useUserAISettings();
  const updateSettings = useUpdateUserAISettings();

  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<AiProvider>(DEFAULT_PROVIDER);
  const [model, setModel] = useState(PLACEHOLDER_MODEL[DEFAULT_PROVIDER]);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (!settings) return;
    setProvider(settings.aiProvider);
    setModel(settings.aiModel);
    setBaseUrl(settings.aiBaseUrl || "");
  }, [settings]);

  const onSave = async () => {
    const payload: {
      aiProvider: AiProvider;
      aiModel: string;
      aiBaseUrl?: string;
      aiApiKey?: string;
    } = {
      aiProvider: provider,
      aiModel: model.trim() || PLACEHOLDER_MODEL[provider],
      aiBaseUrl: baseUrl.trim(),
    };

    if (apiKey.trim() !== "") payload.aiApiKey = apiKey.trim();

    try {
      await updateSettings.mutateAsync(payload);
      setApiKey("");
      toast.success("AI settings saved");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't save AI settings"));
    }
  };

  const onClearKey = async () => {
    if (!confirm("Remove your stored API key? AI features will fall back to the site-wide env config or mock output.")) {
      return;
    }

    try {
      await updateSettings.mutateAsync({ aiApiKey: "" });
      setApiKey("");
      toast.success("Stored API key removed");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't remove API key"));
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex-row items-start gap-3 space-y-0">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <KeyRound className="size-4" />
        </div>
        <div className="space-y-1.5">
          <CardTitle>AI service</CardTitle>
          <CardDescription>
            <strong>One AI config</strong> for the whole app. Paste an API key here and every AI
            feature — tools, resumes, growth reports — uses it. Defaults to{" "}
            <span className="font-mono text-foreground">OpenAI-compatible</span> so the same key
            works with OpenRouter, OpenAI, Groq, Together, Ollama, etc.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {isLoading ? (
            <span className="h-6 w-40 animate-pulse rounded-full bg-muted" />
          ) : settings?.hasApiKey ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-medium text-primary">
              <ShieldCheck className="size-3.5" />
              Your key is configured ({settings.keyPreview})
            </span>
          ) : settings?.usingEnvFallback ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 font-medium text-muted-foreground">
              <Server className="size-3.5" />
              Using site-wide env fallback
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 font-medium text-amber-600 dark:text-amber-400">
              No key — AI features return mock output
            </span>
          )}

          {settings && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-medium text-muted-foreground">
              <Globe className="size-3.5" />
              {settings.aiProvider}
            </span>
          )}
        </div>

        {/* API key first — it's the primary thing */}
        <div className="space-y-2">
          <Label htmlFor="profile-ai-api-key">API key</Label>
          <Input
            id="profile-ai-api-key"
            type="password"
            autoComplete="off"
            placeholder={settings?.hasApiKey ? "Enter a new key to replace" : "Paste any API key"}
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            One key for everything. Leave blank to keep the currently stored key.
          </p>
        </div>

        {/* Provider + model side-by-side */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-ai-provider">Endpoint type</Label>
            <Select
              id="profile-ai-provider"
              value={provider}
              onChange={(event) => {
                const next = event.target.value as AiProvider;
                setProvider(next);
                if (!model.trim() || model === PLACEHOLDER_MODEL[provider]) {
                  setModel(PLACEHOLDER_MODEL[next]);
                }
              }}
            >
              {PROVIDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              {PROVIDER_OPTIONS.find((opt) => opt.value === provider)?.hint}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-ai-model">Model</Label>
            <Input
              id="profile-ai-model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder={PLACEHOLDER_MODEL[provider]}
            />
            <p className="text-xs text-muted-foreground">
              Model id, free-form. The endpoint decides what's accepted.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-ai-base-url">Base URL (only for OpenAI-compatible)</Label>
          <Input
            id="profile-ai-base-url"
            type="url"
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder={PLACEHOLDER_BASE_URL[provider]}
            disabled={provider === "anthropic" || provider === "gemini"}
          />
          <p className="text-xs text-muted-foreground">
            Optional. Set this for OpenRouter, Groq, Together, Ollama, or any custom OpenAI-style
            gateway. Ignored for the native Anthropic and Gemini endpoints.
          </p>
        </div>

        {settings?.usingEnvFallback && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p>
              The site admin set a fallback in <span className="font-mono text-foreground">AI_API_KEY</span>.
              Your saved settings here will override it.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save settings
          </Button>
          {settings?.hasApiKey && (
            <Button variant="outline" onClick={onClearKey} disabled={updateSettings.isPending}>
              Remove key
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
