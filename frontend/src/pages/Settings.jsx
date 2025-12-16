// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { useSettings } from "../settings/SettingsContext";

export default function SettingsPage(){
  const { theme, setTheme, lang, setLang, codeSize, setCodeSize, previewExpanded, setPreviewExpanded, sortOrder, setSortOrder, cardStyle, setCardStyle, t } = useSettings();

  console.log("SETTINGS CTX", {
    theme, setTheme,
    lang, setLang,
    codeSize, setCodeSize,
    previewExpanded, setPreviewExpanded,
    sortOrder, setSortOrder,
    cardStyle, setCardStyle,
    t
  });


  const [tempSize, setTempSize] = useState(codeSize);
  useEffect(()=>{ setTempSize(codeSize); }, [codeSize]);

  return (
    <div className="container card">
      <h1>{t("settings")}</h1>

      {/* Tema */}
      <section className="vstack gap-sm" style={{marginTop:16}}>
        <label className="title">{t("theme")}</label>
        <div className="row">
          <button
            className={"btn " + (theme==="dark" ? "success" : "")}
            onClick={()=> setTheme("dark")}
          >
            {t("dark")}
          </button>
          <button
            className={"btn " + (theme==="light" ? "success" : "")}
            onClick={()=> setTheme("light")}
          >
            {t("light")}
          </button>
        </div>
      </section>


      {/* Idioma */}
      <section className="vstack gap-sm" style={{marginTop:16}}>
        <label className="title">{t("language")}</label>
        <div className="row">
          <button
            className={"btn " + (lang==="es" ? "success" : "")}
            onClick={()=> setLang("es")}
          >
            {t("spanish")}
          </button>
          <button
            className={"btn " + (lang==="en" ? "success" : "")}
            onClick={()=> setLang("en")}
          >
            {t("english")}
          </button>
        </div>
      </section>

      {/* Tamaño fuente del código */}
      <section className="vstack gap-sm" style={{marginTop:24}}>
        <label className="title">{t("codeFontSize")} ({tempSize}px)</label>
        <input
          type="range"
          min="12"
          max="22"
          value={tempSize}
          onChange={(e)=> setTempSize(parseInt(e.target.value,10))}
        />
        <div className="row">
          <button className="btn" onClick={()=> setCodeSize(tempSize)}>{t("save")}</button>
        </div>
      </section>

      {/* Vista previa expandida por defecto */}
      <section className="vstack gap-sm" style={{marginTop:24}}>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={previewExpanded}
            onChange={(e)=> setPreviewExpanded(e.target.checked)}
          />
          <span>{t("previewExpanded")}</span>
        </label>
      </section>

      {/* Orden por defecto */}
      <section className="vstack gap-sm" style={{marginTop:24}}>
        <label className="title">{t("sortOrder")}</label>
        <select
          className="select"
          value={sortOrder}
          onChange={(e)=> setSortOrder(e.target.value)}
        >
          <option value="newest">{t("newest")}</option>
          <option value="oldest">{t("oldest")}</option>
          <option value="title">{t("title")}</option>
          <option value="language">{t("languageLabel")}</option>
        </select>
      </section>

      {/* Estilo de tarjetas */}
      <section className="vstack gap-sm" style={{marginTop:24}}>
        <label className="title">{t("cardStyle")}</label>
        <div className="row">
          <button
            className={"btn " + (cardStyle==="bordered" ? "success" : "")}
            onClick={()=> setCardStyle("bordered")}
          >
            {t("bordered")}
          </button>
          <button
            className={"btn " + (cardStyle==="borderless" ? "success" : "")}
            onClick={()=> setCardStyle("borderless")}
          >
            {t("borderless")}
          </button>
          <button
            className={"btn " + (cardStyle==="shadow" ? "success" : "")}
            onClick={()=> setCardStyle("shadow")}
          >
            {t("shadow")}
          </button>
        </div>
      </section>
    </div>
  );
}
