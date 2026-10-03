import React from 'react';

interface LionLogoProps {
  className?: string;
  size?: number | string;
}

export const LionLogo: React.FC<LionLogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Lion Group Agency Heraldic Emblem"
    >
      <defs>
        {/* Luxury Gold Gradients */}
        <linearGradient id="goldGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="25%" stopColor="#E6C065" />
          <stop offset="50%" stopColor="#F9DF88" />
          <stop offset="75%" stopColor="#C9982E" />
          <stop offset="100%" stopColor="#8A6314" />
        </linearGradient>

        <linearGradient id="goldGradBright" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF7D6" />
          <stop offset="40%" stopColor="#EBC870" />
          <stop offset="80%" stopColor="#D4A133" />
          <stop offset="100%" stopColor="#9C6F1B" />
        </linearGradient>

        <linearGradient id="goldGradDark" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6C4C0C" />
          <stop offset="50%" stopColor="#B38622" />
          <stop offset="100%" stopColor="#DFB758" />
        </linearGradient>

        <radialGradient id="shieldBgGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#141c2e" />
          <stop offset="70%" stopColor="#0a0f1d" />
          <stop offset="100%" stopColor="#04060a" />
        </radialGradient>

        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#D4A034" floodOpacity="0.35" />
        </filter>

        <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Background Outer Shield / Subtle Shadow Aura */}
      <path
        d="M250 25 L415 130 C415 285 365 375 250 445 C135 375 85 285 85 130 Z"
        fill="url(#shieldBgGrad)"
        stroke="url(#goldGradDark)"
        strokeWidth="3"
        filter="url(#subtleShadow)"
      />

      {/* ========================================================================= */}
      {/* LEFT PROFILE ROARING LION HEAD (Flanking Lion)                            */}
      {/* ========================================================================= */}
      <g id="leftLionProfile" fill="url(#goldGradBright)">
        {/* Left Lion Forehead & Ear */}
        <path d="M125 155 C118 140 102 142 98 152 C95 160 102 170 108 172 C98 175 88 185 84 198 C80 210 82 225 90 235 C75 230 65 240 60 252 C54 265 58 280 66 290 C50 286 42 300 45 315 C48 330 62 342 78 348 C65 352 62 368 70 380 C80 395 105 400 135 385 C115 372 114 355 125 345 C136 335 150 330 162 320 L160 300 C145 305 130 295 125 280 C120 265 128 250 142 245 C130 240 125 228 126 215 C128 198 140 185 155 180 Z" />
        {/* Left Lion Snout, Open Jaw & Roar */}
        <path d="M102 240 C95 242 85 248 80 256 C74 266 75 278 82 284 C90 290 102 288 110 282 C106 288 105 296 112 302 C120 308 132 305 140 298 C128 310 115 318 100 318 C90 318 80 312 76 302" stroke="url(#goldGradPrimary)" strokeWidth="3" fill="none" />
        {/* Left Lion Eye & Brow */}
        <path d="M108 215 C112 210 120 208 128 212 C124 218 116 220 110 218 Z" fill="#FFF3B0" />
        <circle cx="118" cy="214" r="2.5" fill="#0A0D14" />
        {/* Left Lion Mane Spikes */}
        <path d="M78 190 C62 195 55 212 58 228 C64 220 72 215 82 212 Z" />
        <path d="M60 252 C45 260 40 278 46 295 C52 285 60 278 70 275 Z" />
        <path d="M48 315 C32 325 32 348 45 365 C50 350 60 342 72 338 Z" />
        <path d="M72 375 C58 392 65 412 85 425 C90 410 98 402 110 398 Z" />
      </g>

      {/* ========================================================================= */}
      {/* RIGHT PROFILE ROARING LION HEAD (Flanking Lion)                           */}
      {/* ========================================================================= */}
      <g id="rightLionProfile" fill="url(#goldGradBright)">
        {/* Right Lion Forehead & Ear */}
        <path d="M375 155 C382 140 398 142 402 152 C405 160 398 170 392 172 C402 175 412 185 416 198 C420 210 418 225 410 235 C425 230 435 240 440 252 C446 265 442 280 434 290 C450 286 458 300 455 315 C452 330 438 342 422 348 C435 352 438 368 430 380 C420 395 395 400 365 385 C385 372 386 355 375 345 C364 335 350 330 338 320 L340 300 C355 305 370 295 375 280 C380 265 372 250 358 245 C370 240 375 228 374 215 C372 198 360 185 345 180 Z" />
        {/* Right Lion Snout, Open Jaw & Roar */}
        <path d="M398 240 C405 242 415 248 420 256 C426 266 425 278 418 284 C410 290 398 288 390 282 C394 288 395 296 388 302 C380 308 368 305 360 298 C372 310 385 318 400 318 C410 318 420 312 424 302" stroke="url(#goldGradPrimary)" strokeWidth="3" fill="none" />
        {/* Right Lion Eye & Brow */}
        <path d="M392 215 C388 210 380 208 372 212 C376 218 384 220 390 218 Z" fill="#FFF3B0" />
        <circle cx="382" cy="214" r="2.5" fill="#0A0D14" />
        {/* Right Lion Mane Spikes */}
        <path d="M422 190 C438 195 445 212 442 228 C436 220 428 215 418 212 Z" />
        <path d="M440 252 C455 260 460 278 454 295 C448 285 440 278 430 275 Z" />
        <path d="M452 315 C468 325 468 348 455 365 C450 350 440 342 428 338 Z" />
        <path d="M428 375 C442 392 435 412 415 425 C410 410 402 402 390 398 Z" />
      </g>

      {/* ========================================================================= */}
      {/* CENTRAL SHIELD (The Heraldic Golden Escutcheon)                           */}
      {/* ========================================================================= */}
      <g id="centralShield" filter="url(#goldGlow)">
        {/* Outer Shield Frame with Gold Stroke */}
        <path
          d="M250 140 L355 155 L345 260 C340 325 295 375 250 405 C205 375 160 325 155 260 L145 155 Z"
          fill="#0B0F19"
          stroke="url(#goldGradPrimary)"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        {/* Inner Shield Gold Inset Border */}
        <path
          d="M250 152 L342 165 L334 258 C329 315 288 362 250 390 C212 362 171 315 166 258 L158 165 Z"
          fill="none"
          stroke="url(#goldGradBright)"
          strokeWidth="2.5"
          opacity="0.85"
        />
      </g>

      {/* ========================================================================= */}
      {/* CENTRAL NOBLE LION HEAD (Full-Face Majestic Lion)                         */}
      {/* ========================================================================= */}
      <g id="centralLionFace" fill="url(#goldGradPrimary)">
        {/* Forehead Mane Tufts */}
        <path d="M250 165 C238 180 230 195 232 208 C238 200 244 195 250 195 C256 195 262 200 268 208 C270 195 262 180 250 165 Z" fill="url(#goldGradBright)" />
        
        {/* Left Mane Outer Waves inside shield */}
        <path d="M195 195 C185 210 178 230 182 250 C188 238 196 230 205 226 C195 240 192 258 198 275 C204 262 212 255 222 252 C210 268 212 288 222 302 C228 290 235 284 242 280 C234 295 236 312 245 325 C242 308 245 295 250 288 C255 295 258 308 255 325 C264 312 266 295 258 280 C265 284 272 290 278 302 C288 288 290 268 278 252 C288 255 296 262 302 275 C308 258 305 240 295 226 C304 230 312 238 318 250 C322 230 315 210 305 195 C295 208 282 215 272 212 C280 202 285 190 280 180 C268 188 260 198 250 205 C240 198 232 188 220 180 C215 190 220 202 228 212 C218 215 205 208 195 195 Z" />

        {/* Lion Ears */}
        <path d="M205 178 C198 170 196 158 204 154 C212 150 220 158 222 168 Z" fill="url(#goldGradBright)" />
        <path d="M295 178 C302 170 304 158 296 154 C288 150 280 158 278 168 Z" fill="url(#goldGradBright)" />

        {/* Lion Eyes & Piercing Gaze */}
        <g id="lionEyes">
          {/* Left Eye */}
          <path d="M218 226 C224 220 234 220 240 226 C234 230 224 230 218 226 Z" fill="#FFFBEB" />
          <polygon points="227,222 233,222 231,228 227,228" fill="#0A0D14" />
          <path d="M216 222 C224 216 235 216 242 222" stroke="url(#goldGradDark)" strokeWidth="2.5" fill="none" />
          
          {/* Right Eye */}
          <path d="M282 226 C276 220 266 220 260 226 C266 230 276 230 282 226 Z" fill="#FFFBEB" />
          <polygon points="267,222 273,222 269,228 267,228" fill="#0A0D14" />
          <path d="M284 222 C276 216 265 216 258 222" stroke="url(#goldGradDark)" strokeWidth="2.5" fill="none" />
        </g>

        {/* Forehead Crest & Brow Lines */}
        <path d="M250 205 L244 226 L250 234 L256 226 Z" fill="url(#goldGradBright)" />
        <path d="M236 212 C242 216 246 222 246 228" stroke="url(#goldGradBright)" strokeWidth="2" fill="none" />
        <path d="M264 212 C258 216 254 222 254 228" stroke="url(#goldGradBright)" strokeWidth="2" fill="none" />

        {/* Nose Bridge & Snout */}
        <path d="M244 230 L242 254 L250 260 L258 254 L256 230 Z" fill="url(#goldGradBright)" />
        {/* Nose Leather (Dark heart shape) */}
        <path d="M242 255 C245 253 255 253 258 255 C260 262 252 268 250 268 C248 268 240 262 242 255 Z" fill="#0B0F19" stroke="url(#goldGradBright)" strokeWidth="1.5" />

        {/* Lion Muzzle Whisker Pads & Mouth */}
        <path d="M250 268 C244 268 234 270 232 278 C230 286 242 288 250 282 C258 288 270 286 268 278 C266 270 256 268 250 268 Z" fill="url(#goldGradBright)" />
        <circle cx="238" cy="276" r="1.5" fill="#0B0F19" />
        <circle cx="242" cy="279" r="1.5" fill="#0B0F19" />
        <circle cx="244" cy="274" r="1.5" fill="#0B0F19" />
        <circle cx="262" cy="276" r="1.5" fill="#0B0F19" />
        <circle cx="258" cy="279" r="1.5" fill="#0B0F19" />
        <circle cx="256" cy="274" r="1.5" fill="#0B0F19" />

        {/* Powerful Chin & Beard Tuft */}
        <path d="M246 284 L250 298 L254 284 C252 286 248 286 246 284 Z" fill="#0A0D14" />
        <path d="M242 292 C246 308 250 320 250 328 C250 320 254 308 258 292 Z" fill="url(#goldGradBright)" />
      </g>

      {/* ========================================================================= */}
      {/* IMPERIAL ROYAL CROWN (Atop the Central Shield)                            */}
      {/* ========================================================================= */}
      <g id="imperialCrown" filter="url(#goldGlow)">
        {/* Crown Base Circlet Band */}
        <path
          d="M192 144 C210 148 250 152 250 152 C250 152 290 148 308 144 L312 134 C292 138 250 142 250 142 C250 142 208 138 188 134 Z"
          fill="url(#goldGradBright)"
          stroke="url(#goldGradDark)"
          strokeWidth="1.5"
        />
        {/* Crown Jewels on Base Band */}
        <circle cx="204" cy="140" r="3" fill="#D4A034" stroke="#FFF" strokeWidth="0.8" />
        <circle cx="226" cy="142" r="3.5" fill="#C92A2A" stroke="#FFF" strokeWidth="0.8" />
        <circle cx="250" cy="144" r="4.5" fill="#1C7ED6" stroke="#FFF" strokeWidth="1" />
        <circle cx="274" cy="142" r="3.5" fill="#C92A2A" stroke="#FFF" strokeWidth="0.8" />
        <circle cx="296" cy="140" r="3" fill="#D4A034" stroke="#FFF" strokeWidth="0.8" />

        {/* Crown 5 Spikes / Arches */}
        {/* Far-left peak */}
        <polygon points="188,134 175,98 194,124 198,135" fill="url(#goldGradPrimary)" />
        <circle cx="175" cy="96" r="4" fill="#FFF3B0" stroke="url(#goldGradDark)" strokeWidth="1" />

        {/* Mid-left peak */}
        <polygon points="208,137 212,82 228,126 224,138" fill="url(#goldGradBright)" />
        <circle cx="212" cy="80" r="4.5" fill="#FFF3B0" stroke="url(#goldGradDark)" strokeWidth="1" />

        {/* Central Highest Peak */}
        <polygon points="238,140 250,56 262,140" fill="url(#goldGradBright)" />
        {/* Cross / Royal Finial on Top of Central Peak */}
        <circle cx="250" cy="54" r="6" fill="#FFF7D6" stroke="url(#goldGradDark)" strokeWidth="1.2" />
        <path d="M250 42 L250 52 M245 47 L255 47" stroke="#FFF7D6" strokeWidth="2.5" strokeLinecap="round" />

        {/* Mid-right peak */}
        <polygon points="276,138 272,126 288,82 292,137" fill="url(#goldGradBright)" />
        <circle cx="288" cy="80" r="4.5" fill="#FFF3B0" stroke="url(#goldGradDark)" strokeWidth="1" />

        {/* Far-right peak */}
        <polygon points="302,135 306,124 325,98 312,134" fill="url(#goldGradPrimary)" />
        <circle cx="325" cy="96" r="4" fill="#FFF3B0" stroke="url(#goldGradDark)" strokeWidth="1" />
      </g>

      {/* ========================================================================= */}
      {/* BAROQUE GOLD FILIGREE & ACANTHUS SCROLLWORK (Beneath Shield)              */}
      {/* ========================================================================= */}
      <g id="bottomFiligree" fill="url(#goldGradBright)" stroke="url(#goldGradDark)" strokeWidth="1">
        {/* Central Fleur-de-lis / Palmette anchor at bottom point */}
        <path d="M250 405 C244 416 238 428 238 438 C238 448 244 456 250 468 C256 456 262 448 262 438 C262 428 256 416 250 405 Z" />
        
        {/* Left Baroque Volute Leaf */}
        <path d="M242 422 C228 425 210 435 204 450 C198 465 210 478 226 476 C238 474 246 462 242 452 C236 460 224 462 216 455 C210 448 215 438 228 432 C235 428 240 425 242 422 Z" />
        
        {/* Right Baroque Volute Leaf */}
        <path d="M258 422 C272 425 290 435 296 450 C302 465 290 478 274 476 C262 474 254 462 258 452 C264 460 276 462 284 455 C290 448 285 438 272 432 C265 428 260 425 258 422 Z" />

        {/* Lower Terminal Finial Dot */}
        <circle cx="250" cy="482" r="4.5" fill="#FFF3B0" />
      </g>
    </svg>
  );
};

export default LionLogo;
