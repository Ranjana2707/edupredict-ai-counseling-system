import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className="h-10 w-10 p-0 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 transition-transform hover:rotate-12 duration-300" />
      ) : (
        <Sun className="h-5 w-5 transition-transform hover:rotate-45 duration-300" />
      )}
    </Button>
  );
}
