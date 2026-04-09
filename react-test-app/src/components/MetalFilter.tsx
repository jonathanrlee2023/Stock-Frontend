export const MetalFilter = () => (
  <svg
    width="0"
    height="0"
    style={{ position: "absolute", pointerEvents: "none" }}
  >
    <defs>
      <filter id="recessed-metal" x="-20%" y="-20%" width="140%" height="140%">
        {/* STEP 1: Create the Drop Shadow */}
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="shadowBlur" />
        <feOffset in="shadowBlur" dx="2" dy="2" result="offsetShadow" />
        <feComponentTransfer in="offsetShadow" result="darkShadow">
          <feFuncA type="linear" slope="0.5" /> {/* Makes shadow subtle */}
        </feComponentTransfer>

        {/* STEP 2: Create the Bevel/Lighting Effect */}
        <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
        <feOffset in="blur" dx="1" dy="1" result="offsetBlur" />
        <feSpecularLighting
          in="blur"
          surfaceScale="7" // Increased for more "height"
          specularConstant={0.9} // Higher shine
          specularExponent={25} // Sharper light spots
          lightingColor="#ffffff" // Brighter white for highlights
          result="specOut"
        >
          <fePointLight x={-5000} y={-10000} z={20000} />
        </feSpecularLighting>

        {/* STEP 3: Mask the light to the text shape */}
        <feComposite
          in="specOut"
          in2="SourceAlpha"
          operator="in"
          result="specOut"
        />

        {/* STEP 4: Merge the Original Color with the Highlights */}
        <feComposite
          in="SourceGraphic"
          in2="specOut"
          operator="arithmetic"
          k1={0}
          k2={1}
          k3={1}
          k4={0}
          result="litGraphic"
        />

        {/* STEP 5: Place the metal text ON TOP of the drop shadow */}
        <feMerge>
          <feMergeNode in="darkShadow" />
          <feMergeNode in="litGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);
