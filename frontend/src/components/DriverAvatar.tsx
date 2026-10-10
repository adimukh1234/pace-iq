import React, { useState } from "react";

export interface DriverAvatarProps {
  url?: string | null;
  name?: string;
  driverNumber?: number | string;
  teamColour?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP = {
  xs: { px: 22, font: "9px", radius: "var(--radius-full, 9999px)", border: 1.5 },
  sm: { px: 28, font: "11px", radius: "var(--radius-full, 9999px)", border: 2 },
  md: { px: 38, font: "13px", radius: "var(--radius-full, 9999px)", border: 2 },
  lg: { px: 56, font: "18px", radius: "var(--radius-md, 8px)", border: 2.5 },
  xl: { px: 110, font: "28px", radius: "var(--radius-lg, 12px)", border: 3 },
};

// Known high-res F1 CDN Headshot URLs by driver number and acronym
const KNOWN_DRIVER_HEADSHOTS: Record<number, string> = {
  1: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png",
  2: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png.transform/1col/image.png",
  3: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png.transform/1col/image.png",
  4: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png",
  5: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png.transform/1col/image.png",
  6: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png.transform/1col/image.png",
  7: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png.transform/1col/image.png",
  10: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/1col/image.png",
  11: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/1col/image.png",
  12: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ANDANT01_Andrea%20Kimi_Antonelli/andant01.png.transform/1col/image.png",
  14: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/1col/image.png",
  16: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/1col/image.png",
  18: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/1col/image.png",
  20: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png.transform/1col/image.png",
  22: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png.transform/1col/image.png",
  23: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/1col/image.png",
  24: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png.transform/1col/image.png",
  27: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/1col/image.png",
  30: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/1col/image.png",
  31: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/1col/image.png",
  43: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png.transform/1col/image.png",
  44: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png",
  55: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/1col/image.png",
  63: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/1col/image.png",
  77: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/1col/image.png",
  81: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png",
  87: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/1col/image.png",
};

const ACRONYM_HEADSHOTS: Record<string, string> = {
  VER: KNOWN_DRIVER_HEADSHOTS[1],
  SAR: KNOWN_DRIVER_HEADSHOTS[2],
  RIC: KNOWN_DRIVER_HEADSHOTS[3],
  NOR: KNOWN_DRIVER_HEADSHOTS[4],
  BOR: KNOWN_DRIVER_HEADSHOTS[5],
  HAD: KNOWN_DRIVER_HEADSHOTS[6],
  DOO: KNOWN_DRIVER_HEADSHOTS[7],
  GAS: KNOWN_DRIVER_HEADSHOTS[10],
  PER: KNOWN_DRIVER_HEADSHOTS[11],
  ANT: KNOWN_DRIVER_HEADSHOTS[12],
  ALO: KNOWN_DRIVER_HEADSHOTS[14],
  LEC: KNOWN_DRIVER_HEADSHOTS[16],
  STR: KNOWN_DRIVER_HEADSHOTS[18],
  MAG: KNOWN_DRIVER_HEADSHOTS[20],
  TSU: KNOWN_DRIVER_HEADSHOTS[22],
  ALB: KNOWN_DRIVER_HEADSHOTS[23],
  ZHO: KNOWN_DRIVER_HEADSHOTS[24],
  HUL: KNOWN_DRIVER_HEADSHOTS[27],
  LAW: KNOWN_DRIVER_HEADSHOTS[30],
  OCO: KNOWN_DRIVER_HEADSHOTS[31],
  COL: KNOWN_DRIVER_HEADSHOTS[43],
  HAM: KNOWN_DRIVER_HEADSHOTS[44],
  SAI: KNOWN_DRIVER_HEADSHOTS[55],
  RUS: KNOWN_DRIVER_HEADSHOTS[63],
  BOT: KNOWN_DRIVER_HEADSHOTS[77],
  PIA: KNOWN_DRIVER_HEADSHOTS[81],
  BEA: KNOWN_DRIVER_HEADSHOTS[87],
};

function resolveDriverHeadshot(
  url?: string | null,
  name?: string,
  driverNumber?: number | string
): string | null {
  const cleanName = name ? name.trim().toUpperCase() : "";
  const lowerName = name ? name.toLowerCase() : "";

  // 1. If we have a driver name or acronym, check if an explicit canonical portrait exists
  if (cleanName && ACRONYM_HEADSHOTS[cleanName]) {
    // If the provided url doesn't match this driver's acronym/surname, use the canonical one
    return ACRONYM_HEADSHOTS[cleanName];
  }

  // Check surname keywords
  if (lowerName) {
    if (lowerName.includes("norris")) return ACRONYM_HEADSHOTS["NOR"];
    if (lowerName.includes("verstappen")) return ACRONYM_HEADSHOTS["VER"];
    if (lowerName.includes("hamilton")) return ACRONYM_HEADSHOTS["HAM"];
    if (lowerName.includes("leclerc")) return ACRONYM_HEADSHOTS["LEC"];
    if (lowerName.includes("piastri")) return ACRONYM_HEADSHOTS["PIA"];
    if (lowerName.includes("russell")) return ACRONYM_HEADSHOTS["RUS"];
    if (lowerName.includes("sainz")) return ACRONYM_HEADSHOTS["SAI"];
    if (lowerName.includes("perez") || lowerName.includes("pérez")) return ACRONYM_HEADSHOTS["PER"];
    if (lowerName.includes("alonso")) return ACRONYM_HEADSHOTS["ALO"];
    if (lowerName.includes("stroll")) return ACRONYM_HEADSHOTS["STR"];
    if (lowerName.includes("tsunoda")) return ACRONYM_HEADSHOTS["TSU"];
    if (lowerName.includes("gasly")) return ACRONYM_HEADSHOTS["GAS"];
    if (lowerName.includes("albon")) return ACRONYM_HEADSHOTS["ALB"];
    if (lowerName.includes("hulkenberg") || lowerName.includes("hülkenberg")) return ACRONYM_HEADSHOTS["HUL"];
    if (lowerName.includes("ocon")) return ACRONYM_HEADSHOTS["OCO"];
    if (lowerName.includes("bottas")) return ACRONYM_HEADSHOTS["BOT"];
    if (lowerName.includes("magnussen")) return ACRONYM_HEADSHOTS["MAG"];
    if (lowerName.includes("ricciardo")) return ACRONYM_HEADSHOTS["RIC"];
    if (lowerName.includes("colapinto")) return ACRONYM_HEADSHOTS["COL"];
    if (lowerName.includes("bearman")) return ACRONYM_HEADSHOTS["BEA"];
    if (lowerName.includes("lawson")) return ACRONYM_HEADSHOTS["LAW"];
    if (lowerName.includes("antonelli")) return ACRONYM_HEADSHOTS["ANT"];
    if (lowerName.includes("zhou")) return ACRONYM_HEADSHOTS["ZHO"];
    if (lowerName.includes("doohan")) return ACRONYM_HEADSHOTS["DOO"];
    if (lowerName.includes("hadjar")) return ACRONYM_HEADSHOTS["HAD"];
    if (lowerName.includes("bortoleto")) return ACRONYM_HEADSHOTS["BOR"];
    if (lowerName.includes("vettel")) return ACRONYM_HEADSHOTS["VET"];
    if (lowerName.includes("raikkonen")) return ACRONYM_HEADSHOTS["RAI"];
  }

  // 2. If valid url is already provided from backend and not conflicting
  if (url && url.trim().length > 0) {
    return url;
  }

  // 3. Fallback to number only if no name at all was provided
  const num = typeof driverNumber === "string" ? parseInt(driverNumber, 10) : driverNumber;
  if (!name && num && KNOWN_DRIVER_HEADSHOTS[num]) {
    return KNOWN_DRIVER_HEADSHOTS[num];
  }

  return null;
}

export const DriverAvatar: React.FC<DriverAvatarProps> = ({
  url,
  name,
  driverNumber,
  teamColour,
  size = "md",
  priority = false,
  className = "",
  style,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const resolvedUrl = resolveDriverHeadshot(url, name, driverNumber);

  const config = SIZE_MAP[size] || SIZE_MAP.md;
  const dimension = config.px;
  const borderColor = teamColour
    ? teamColour.startsWith("#")
      ? teamColour
      : `#${teamColour}`
    : "var(--color-border-subtle, rgba(255, 255, 255, 0.15))";

  // Display label for monogram fallback (initials or number or acronym)
  const fallbackLabel =
    name && name.length >= 2
      ? name.length === 3
        ? name.toUpperCase()
        : name.slice(0, 2).toUpperCase()
      : driverNumber !== undefined
      ? `#${driverNumber}`
      : "F1";

  const showImage = Boolean(resolvedUrl) && !hasError;

  return (
    <div
      className={`driver-avatar-container ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        minWidth: `${dimension}px`,
        minHeight: `${dimension}px`,
        borderRadius: config.radius,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "var(--color-surface-2, #181c24)",
        boxShadow: `0 0 0 ${config.border}px ${borderColor}, 0 2px 6px rgba(0, 0, 0, 0.4)`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
      title={name ? `${name} ${driverNumber ? `(#${driverNumber})` : ""}` : undefined}
    >
      {/* Fallback Monogram Avatar */}
      <span
        style={{
          display: showImage && isLoaded ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          fontFamily: "var(--font-mono, monospace)",
          fontWeight: 800,
          fontSize: config.font,
          color: "var(--color-text-primary, #ffffff)",
          letterSpacing: "-0.02em",
          userSelect: "none",
          background: `radial-gradient(circle at 50% 30%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.4) 100%)`,
        }}
      >
        {fallbackLabel}
      </span>

      {/* Optimized Driver Image */}
      {showImage && (
        <img
          src={resolvedUrl!}
          alt={name || (driverNumber ? `Driver #${driverNumber}` : "Driver")}
          width={dimension}
          height={dimension}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center", // Crucial for F1 headshots so eyes/face are centered
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.25s ease-out",
          }}
        />
      )}
    </div>
  );
};
