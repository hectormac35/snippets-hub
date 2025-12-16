// frontend/src/settings/SettingsContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const Ctx = createContext(null);

const LS = {
  theme: "settings.theme",
  lang: "settings.lang",
  codeSize: "settings.codeSize",
  preview: "settings.previewExpanded",
  sort: "settings.sortOrder",
  card: "settings.cardStyle",
};

const DEF = {
  theme: "dark",        // "dark" | "light"
  lang: "es",           // "es" | "en"
  codeSize: 14,         // px
  preview: true,        // expandido por defecto
  sort: "newest",       // "newest" | "oldest" | "title" | "language"
  card: "bordered",     // "bordered" | "borderless" | "shadow"
};

const STRINGS = {
  es: {
    // Settings page
    settings: "Ajustes",
    theme: "Tema", dark: "Oscuro", light: "Claro",
    language: "Idioma", spanish: "Español", english: "Inglés",
    codeFontSize: "Tamaño de fuente del código",
    previewExpanded: "Vista previa del snippet expandida por defecto",
    sortOrder: "Orden por defecto",
    newest: "Más nuevos", oldest: "Más antiguos",
    title: "Título (A-Z)", languageLabel: "Lenguaje (A-Z)",
    cardStyle: "Estilo de tarjetas",
    bordered: "Con borde", borderless: "Sin borde", shadow: "Sombra",
    save: "Guardar",

    of: "de",
    loading: "Cargando…",
    tipFilters: "Usa filtros como",
    tipVersions: "Gestiona versiones desde cada tarjeta",
    tipResponsive: "La app es 100% responsive",


    // App / UI general
    appName: "SnippetsHub",
    workspace: "Tu espacio de trabajo",
    chooseWorkspace: "(elige un workspace)",
    newWorkspace: "Nuevo workspace",
    create: "Crear",

    newSnippet: "Nuevo snippet",
    titleLabel: "Título",
    languageLabelInput: "Lenguaje",
    description: "Descripción",
    code: "Código",
    tagsPlaceholder: "tags separadas por coma",
    favorite: "Favorito",
    visibility: "Privado",
    addSnippet: "Añadir snippet",

    tips: "Consejos",
    searchAdvanced: "Búsqueda avanzada",
    perPage: "por página",
    previous: "Anterior",
    next: "Siguiente",
    page: "Página",
    noResults: "Sin resultados",

    trash: "Papelera",
    logout: "Salir",

    selectWorkspaceFirst: "Selecciona un workspace arriba",
    private: "Privado",
    unlisted: "No listado",
    public: "Público",
    saving: "Guardando...",

    untitled: "Sin título",
    expand: "Expandir",
    collapse: "Colapsar",
    versions: "Versiones",
    copy: "Copiar",
    delete: "Eliminar",
    edit: "Editar",
    cancel: "Cancelar",
    restore: "Restaurar",
    close: "Cerrar",
    noVersions: "Sin versiones aún",
    confirmTrash: "¿Eliminar (a papelera)?",
    na: "N/A",

   appName: "SnippetsHub",
   trash: "Papelera",
   settings: "Ajustes",
   logout: "Salir",
   login: "Entrar",
   register: "Registro",


  },

  en: {
    // Settings page
    settings: "Settings",
    theme: "Theme", dark: "Dark", light: "Light",
    language: "Language", spanish: "Spanish", english: "English",
    codeFontSize: "Code font size",
    previewExpanded: "Expand snippet preview by default",
    sortOrder: "Default sort",
    newest: "Newest", oldest: "Oldest",
    title: "Title (A-Z)", languageLabel: "Language (A-Z)",
    cardStyle: "Card style",
    bordered: "Bordered", borderless: "Borderless", shadow: "Shadow",
    save: "Save",

    of: "of",
    loading: "Loading…",
    tipFilters: "Use filters like",
    tipVersions: "Manage versions from each card",
    tipResponsive: "The app is 100% responsive",


    // App / UI general
    appName: "SnippetsHub",
    workspace: "Your workspace",
    chooseWorkspace: "(choose a workspace)",
    newWorkspace: "New workspace",
    create: "Create",

    newSnippet: "New snippet",
    titleLabel: "Title",
    languageLabelInput: "Language",
    description: "Description",
    code: "Code",
    tagsPlaceholder: "tags separated by commas",
    favorite: "Favorite",
    visibility: "Private",
    addSnippet: "Add snippet",

    tips: "Tips",
    searchAdvanced: "Advanced search",
    perPage: "per page",
    previous: "Previous",
    next: "Next",
    page: "Page",
    noResults: "No results",

    trash: "Trash",
    logout: "Logout",

    selectWorkspaceFirst: "Select a workspace above",
    private: "Private",
    unlisted: "Unlisted",
    public: "Public",
    saving: "Saving...",

    untitled: "Untitled",
    expand: "Expand",
    collapse: "Collapse",
    versions: "Versions",
    copy: "Copy",
    delete: "Delete",
    edit: "Edit",
    cancel: "Cancel",
    restore: "Restore",
    close: "Close",
    noVersions: "No versions yet",
    confirmTrash: "Delete (move to trash)?",
    na: "N/A",

    appName: "SnippetsHub",
    trash: "Trash",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    register: "Register",


  },
};

export function SettingsProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem(LS.lang) || DEF.lang);
  const [theme, setTheme] = useState(localStorage.getItem(LS.theme) || DEF.theme);
  const [codeSize, setCodeSize] = useState(
    parseInt(localStorage.getItem(LS.codeSize) || DEF.codeSize, 10)
  );
  const [previewExpanded, setPreviewExpanded] = useState(
    (localStorage.getItem(LS.preview) ?? `${DEF.preview}`) === "true"
  );
  const [sortOrder, setSortOrder] = useState(localStorage.getItem(LS.sort) || DEF.sort);
  const [cardStyle, setCardStyle] = useState(localStorage.getItem(LS.card) || DEF.card);

  useEffect(() => {
    localStorage.setItem(LS.lang, lang);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(LS.codeSize, String(codeSize));
    document.documentElement.style.setProperty("--code-font-size", `${codeSize}px`);
  }, [codeSize]);

  useEffect(() => {
    localStorage.setItem(LS.preview, String(previewExpanded));
  }, [previewExpanded]);

  useEffect(() => {
    localStorage.setItem(LS.sort, sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    localStorage.setItem(LS.card, cardStyle);
    document.documentElement.setAttribute("data-card-style", cardStyle);
  }, [cardStyle]);

  useEffect(() => {
    localStorage.setItem(LS.theme, theme);
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme"); // oscuro por defecto
    }
  }, [theme]);

  const t = useMemo(() => {
    const d = STRINGS[lang] || STRINGS.es;
    return (k) => d[k] ?? k;
  }, [lang]);

  const value = {
    theme, setTheme,
    lang, setLang,
    codeSize, setCodeSize,
    previewExpanded, setPreviewExpanded,
    sortOrder, setSortOrder,
    cardStyle, setCardStyle,
    t,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSettings outside provider");
  return c;
}
