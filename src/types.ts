export interface ProjectItem {
  id: string;
  name: string;
  description: string;
}

export interface ProjectSettings {
  theme: "light" | "dark";
  primaryColor: "indigo" | "emerald" | "amber" | "violet" | "rose";
  borderRadius: "sharp" | "subtle" | "md" | "lg";
  layoutStyle: "sidebar" | "navbar" | "tabs";
}

export interface Project {
  name: string;
  settings: ProjectSettings;
  items: ProjectItem[];
}
