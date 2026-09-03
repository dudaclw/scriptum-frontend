import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SegmentedControl } from "@/components/settings/segmented-control";
import { SettingsRow, SettingsSection } from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { apiService } from "@/domain/service/api";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useNotesApi } from "@/hooks/use-notes-api";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useTheme } from "next-themes";

const APP_VERSION = "0.1.0";
const SHORTCUTS = [
  { keys: "⌘K", description: "Busca rápida" },
  { keys: "⌘N", description: "Nova nota" },
  { keys: "Esc", description: "Voltar" },
];

export function SettingsPage() {
  useAuthGuard();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { notes, createNote } = useNotesApi();
  const { resolvedTheme, setTheme } = useTheme();
  const { fontSize, defaultView, defaultSort, setFontSize, setDefaultView, setDefaultSort } =
    useSettingsStore();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveAccount = async () => {
    if (!user || !token) return;
    setIsSavingAccount(true);
    try {
      const updated = await apiService.updateUser(user.id, { name, email: user.email });
      setUser({ ...user, name: updated.name }, token);
      toast.success("Dados da conta atualizados.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleSavePassword = async () => {
    if (!user || !token) return;
    if (newPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setIsSavingPassword(true);
    try {
      await apiService.updateUser(user.id, { name: user.name, email: user.email, password: newPassword });
      toast.success("Senha atualizada.");
      setNewPassword("");
      setIsChangingPassword(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Não foi possível trocar a senha.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Mock: não existe endpoint de exclusão de conta no backend ainda.
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Conta excluída.");
      logout();
      navigate("/auth/signin");
    } catch {
      toast.error("Não foi possível excluir a conta.");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const handleExport = (format: "md" | "json") => {
    if (notes.length === 0) {
      toast.error("Nenhuma nota para exportar.");
      return;
    }

    const content =
      format === "json"
        ? JSON.stringify(notes, null, 2)
        : notes
            .map((note) => `# ${note.title || "Sem título"}\n\n${note.content || ""}`)
            .join("\n\n---\n\n");

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scriptum-notas.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exportação concluída.");
  };

  const handleImportFile = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(text);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          await createNote({
            title: item.title || "Sem título",
            content: item.content || "",
            color: item.color || "#FFFFFF",
            isPinned: Boolean(item.isPinned),
            tags: item.tags || [],
          });
        }
      } else {
        await createNote({
          title: file.name.replace(/\.md$/, ""),
          content: text,
          color: "#FFFFFF",
          isPinned: false,
          tags: [],
        });
      }
      toast.success("Importação concluída.");
    } catch {
      toast.error("Arquivo inválido. Use um .md ou .json exportado pelo Scriptum.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-[640px] px-6 py-10">
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <p className="mt-1 text-neutral-400">Preferências da conta e do app</p>

      <SettingsSection title="Conta">
        <SettingsRow label="Nome">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </SettingsRow>
        <SettingsRow label="E-mail">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </SettingsRow>
        <SettingsRow label="Senha">
          {isChangingPassword ? (
            <div className="flex gap-2">
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Nova senha (mín. 8 caracteres)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button size="sm" onClick={handleSavePassword} disabled={isSavingPassword}>
                {isSavingPassword ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsChangingPassword(false);
                  setNewPassword("");
                }}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => setIsChangingPassword(true)}
            >
              Trocar senha →
            </Button>
          )}
        </SettingsRow>
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSaveAccount} disabled={isSavingAccount}>
            {isSavingAccount ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-medium text-danger-500">Zona de risco</h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Excluir conta permanentemente</span>
            <Button
              size="sm"
              className="bg-danger-500 text-white hover:bg-danger-500/90"
              onClick={() => setIsDeleteOpen(true)}
            >
              Excluir conta
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Aparência">
        <SettingsRow label="Tema">
          <div className="flex items-center gap-2">
            <Switch
              checked={resolvedTheme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
            <span className="text-sm text-muted-foreground">
              {resolvedTheme === "dark" ? "Escuro" : "Claro"}
            </span>
          </div>
        </SettingsRow>
        <SettingsRow label="Tamanho da fonte">
          <SegmentedControl
            aria-label="Tamanho da fonte"
            value={fontSize}
            onChange={(value) => setFontSize(value as "P" | "M" | "G")}
            options={[
              { value: "P", label: "P" },
              { value: "M", label: "M" },
              { value: "G", label: "G" },
            ]}
          />
        </SettingsRow>
        <SettingsRow label="Visualização padrão">
          <SegmentedControl
            aria-label="Visualização padrão da Home"
            value={defaultView}
            onChange={(value) => setDefaultView(value as "grid" | "list")}
            options={[
              { value: "grid", label: "Grade" },
              { value: "list", label: "Lista" },
            ]}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Notas & Tags">
        <SettingsRow label="Ordenação padrão">
          <SegmentedControl
            aria-label="Ordenação padrão das notas"
            value={defaultSort}
            onChange={(value) => setDefaultSort(value as "recent" | "alpha")}
            options={[
              { value: "recent", label: "Recente" },
              { value: "alpha", label: "Alfabética" },
            ]}
          />
        </SettingsRow>
        <SettingsRow label="Tags">
          <Button variant="link" className="h-auto p-0" disabled title="Em breve">
            Gerenciar tags →
          </Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Dados">
        <SettingsRow label="Exportar notas">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("md")}>
              Exportar .md
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
              Exportar .json
            </Button>
          </div>
        </SettingsRow>
        <SettingsRow label="Importar notas">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
              }}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
            >
              {isImporting ? "Importando..." : "Selecionar arquivo"}
            </Button>
          </div>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Atalhos">
        <ul className="space-y-2">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.keys} className="flex items-center gap-3 text-sm">
              <kbd className="rounded-md bg-secondary px-2 py-1 font-mono text-xs">
                {shortcut.keys}
              </kbd>
              <span className="text-muted-foreground">{shortcut.description}</span>
            </li>
          ))}
        </ul>
      </SettingsSection>

      <div className="mt-10 border-b pt-4 text-center text-sm text-neutral-500">
        <a
          href="https://github.com/9gods/scriptum-next/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Scriptum v{APP_VERSION} · Enviar feedback
        </a>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta permanentemente</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Digite <strong>{user?.name}</strong> para
              confirmar.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={user?.name}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-danger-500 text-white hover:bg-danger-500/90"
              disabled={deleteConfirmText !== user?.name || isDeleting}
              onClick={handleDeleteAccount}
            >
              {isDeleting ? "Excluindo..." : "Excluir conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
