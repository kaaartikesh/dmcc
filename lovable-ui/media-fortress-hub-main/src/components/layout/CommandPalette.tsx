import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useUIStore } from "@/store/ui";
import {
  LayoutDashboard,
  Upload,
  Radar,
  FileSearch,
  Shield,
  Settings,
  Activity,
  Globe,
} from "lucide-react";

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useUIStore();
  const navigate = useNavigate();

  const go = (to: string) => {
    setCommandOpen(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/")}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            <CommandShortcut>⌘1</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/upload")}>
            <Upload className="mr-2 h-4 w-4" /> Upload assets
            <CommandShortcut>⌘2</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/detections")}>
            <Radar className="mr-2 h-4 w-4" /> Detection monitor
            <CommandShortcut>⌘3</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/assets/AST-001")}>
            <FileSearch className="mr-2 h-4 w-4" /> Asset detail
            <CommandShortcut>⌘4</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem><Activity className="mr-2 h-4 w-4" /> Run live scan</CommandItem>
          <CommandItem><Shield className="mr-2 h-4 w-4" /> Issue takedown</CommandItem>
          <CommandItem><Globe className="mr-2 h-4 w-4" /> Switch region</CommandItem>
          <CommandItem><Settings className="mr-2 h-4 w-4" /> Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
