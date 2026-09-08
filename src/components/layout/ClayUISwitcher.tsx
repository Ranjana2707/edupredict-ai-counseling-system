import { Palette } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';

export function ClayUISwitcher() {
  const { isClayUI, toggleClayUI } = useTheme();

  return (
    <Button
      variant="ghost"
      onClick={toggleClayUI}
      className={`h-10 px-3 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-all duration-300 flex items-center gap-1.5 shrink-0 ${isClayUI ? 'bg-primary/10 text-primary hover:bg-primary/15' : ''}`}
      title={isClayUI ? "Switch to Flat UI Style" : "Switch to Clay UI Style"}
    >
      <Palette className={`h-4 w-4 ${isClayUI ? 'animate-pulse' : ''}`} />
      <span className="hidden lg:inline text-[11px] font-bold">
        {isClayUI ? 'Clay UI' : 'Flat UI'}
      </span>
    </Button>
  );
}
