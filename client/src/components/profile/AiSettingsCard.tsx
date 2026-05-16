import { useEffect, useMemo, useState } from "react";
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

const PROVIDER_OPTIONS: Array<{ value: AiProvider; label: string }> = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "gemini", label: "Google Gemini" },
  { value: "openai-compatible", label: "OpenAI-compatible" },
];

const MODEL_SUGGESTIONS: Record<AiProvider, string[]> = {
  anthropic: ["claude-sonnet-4-5", "claude-3-7-sonnet-latest", "claude-3-5-haiku-latest"],
  openai: ["gpt-4.1", "gpt-4.1-mini", "gpt-4o-mini"],
  gemini: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"],
  "openai-compatible": ["openai/gpt-4.1-mini", "meta-llama/llama-3.3-70b-instruct", "deepseek-chat"],
};

export function AiSettingsCard() {
  const { data: settings, isLoading } = useUserAISettings();
  const updateSettings = useUpdateUserAISettings();

  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<AiProvider>("anthropic");
  const [model, setModel] = useState("claude-sonnet-4-5");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (!settings) return;
    setProvider(settings.aiProvider);
    setModel(settings.aiModel);
    setBaseUrl(settings.aiBaseUrl || "");
  }, [settings]);

  const suggestions = useMemo(() => MODEL_SUGGESTIONS[provider], [provider]);
  const envLabel = settings?.envProvider
    ? PROVIDER_OPTIONS.find((option) => option.value === settings.envProvider)?.label ||
      settings.envProvider
    : null;

  const onSave = async () => {
    const payload: {
      aiProvider: AiProvider;
      aiModel: string;
      aiBaseUrl?: string;
      aiApiKey?: string;
    } = {
      aiProvider: provider,
      aiModel: model.trim(),
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
    if (!confirm("Remove your stored API key? Tools will fall back to environment config or mock output.")) {
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
          <CardTitle>AI provider</CardTitle>
          <CardDescription>
            Configure your provider, model, API key, and optional base URL for tool generation.
            These settings belong only to your account.
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
              Using env fallback{envLabel ? `: ${envLabel}` : ""}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 font-medium text-amber-600 dark:text-amber-400">
              No key - tools return mock output
            </span>
          )}

          {settings && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-medium text-muted-foreground">
              <Globe className="size-3.5" />
              {settings.aiProvider}
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-ai-provider">Provider</Label>
            <Select
              id="profile-ai-provider"
              value={provider}
              onChange={(event) => setProvider(event.target.value as AiProvider)}
            >
              {PROVIDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-ai-model">Model</Label>
            <Input
              id="profile-ai-model"
              list="profile-ai-model-suggestions"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Enter a model id"
            />
            <datalist id="profile-ai-model-suggestions">
              {suggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground">
              Free-form model id. Suggestions update with the provider.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-ai-api-key">API key</Label>
            <Input
              id="profile-ai-api-key"
              type="password"
              autoComplete="off"
              placeholder={settings?.hasApiKey ? "Enter a new key to replace" : "Paste an API key"}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to keep the current stored key.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-ai-base-url">Base URL</Label>
            <Input
              id="profile-ai-base-url"
              type="url"
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://openrouter.ai/api/v1"
            />
            <p className="text-xs text-muted-foreground">
              Optional. Useful for OpenAI-compatible providers such as OpenRouter, Groq,
              Together, or self-hosted gateways.
            </p>
          </div>
        </div>

        {settings?.usingEnvFallback && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p>
              Env fallback provider: <span className="font-medium text-foreground">{settings.envProvider}</span>
            </p>
            {settings.envModel && (
              <p className="mt-1">
                Env fallback model: <span className="font-medium text-foreground">{settings.envModel}</span>
              </p>
            )}
            {settings.envBaseUrl && (
              <p className="mt-1 break-all">
                Env fallback base URL: <span className="font-medium text-foreground">{settings.envBaseUrl}</span>
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onSave} disabled={updateSettings.isPending || !model.trim()}>
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
