import { TouchableOpacity, Text } from "react-native";
import { useThemeContext } from "@/lib/theme-provider";

export function Toggle() {
  const { colorScheme, setColorScheme } = useThemeContext();

  const toggleTheme = () => {
    setColorScheme(
      colorScheme === "dark" ? "light" : "dark"
    );
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className="bg-primary px-4 py-2 rounded-full"
    >
      <Text className="text-white font-bold">
        {colorScheme === "dark" ? "☀️ Claro" : "🌙 Escuro"}
      </Text>
    </TouchableOpacity>
  );
}