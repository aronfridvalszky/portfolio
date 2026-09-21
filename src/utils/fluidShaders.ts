/* GLSL for the hero's WebGL fluid-gradient effect (`ContentHeroField.astro`)
   — a ping-pong fluid-velocity simulation feeding a distorted, shifting
   6-colour gradient. Kept in its own module, separate from the component's
   render-loop logic, as plain template-literal strings rather than DOM
   `<script type="x-shader/...">` blocks: `astro check` type-checks *any*
   `<script>` tag's contents as TS regardless of its `type` attribute, which
   GLSL fails. */

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fluidShader = /* glsl */ `
  precision highp float;

  uniform float uSoftReset;
  uniform float iTime;
  uniform vec2 iResolution;
  uniform vec4 iMouse;
  uniform int iFrame;
  uniform sampler2D iPreviousFrame;
  uniform float uBrushSize;
  uniform float uBrushStrength;
  uniform float uFluidDecay;
  uniform float uTrailLength;
  uniform float uStopDecay;
  uniform float uFlowSpeed;

  varying vec2 vUv;

  vec2 ur, U;

  float ln(vec2 p, vec2 a, vec2 b) {
    return length(p - a - (b - a) * clamp(dot(p - a, b - a) / dot(b - a, b - a), 0.0, 1.0));
  }

  vec4 t(vec2 v, int a, int b) {
    return texture2D(iPreviousFrame, fract((v + vec2(float(a), float(b))) / ur));
  }

  vec4 t(vec2 v) {
    return texture2D(iPreviousFrame, fract(v / ur));
  }

  float area(vec2 a, vec2 b, vec2 c) {
    float A = length(b - c), B = length(c - a), C = length(a - b), s = 0.5 * (A + B + C);
    return sqrt(max(0.0, s * (s - A) * (s - B) * (s - C)));
  }

  void main() {
    U = vUv * iResolution;
    ur = iResolution.xy;

    if (iFrame < 1) {
      float w = 0.5 + sin(0.2 * U.x) * 0.5;
      float q = length(U - 0.5 * ur);
      gl_FragColor = vec4(0.1 * exp(-0.001 * q * q), 0.0, 0.0, w);
    } else {
      vec2 v = U,
           A = v + vec2( 1.0,  1.0),
           B = v + vec2( 1.0, -1.0),
           C = v + vec2(-1.0,  1.0),
           D = v + vec2(-1.0, -1.0);

      for (int i = 0; i < 8; i++) {
          v -= uFlowSpeed * t(v).xy;
          A -= uFlowSpeed * t(A).xy;
          B -= uFlowSpeed * t(B).xy;
          C -= uFlowSpeed * t(C).xy;
          D -= uFlowSpeed * t(D).xy;
      }

      vec4 me = t(v);
      vec4 n = t(v, 0, 1),
           e = t(v, 1, 0),
           s = t(v, 0, -1),
           wv = t(v, -1, 0);
      vec4 ne = 0.25 * (n + e + s + wv);
      me = mix(t(v), ne, vec4(0.15, 0.15, 0.95, 0.0));
      me.z -= uFlowSpeed * 0.01 * ((area(A, B, C) + area(B, C, D)) - 4.0);

      vec4 pr = vec4(e.z, wv.z, n.z, s.z);
      me.xy = me.xy + (100.0 * uFlowSpeed) * vec2(pr.x - pr.y, pr.z - pr.w) / ur;

      float decay = pow(uFluidDecay, uFlowSpeed);
      me.xy *= decay;
      me.z  *= uTrailLength;

      if (iMouse.z > 0.0) {
        vec2 mousePos  = iMouse.xy;
        vec2 mousePrev = iMouse.zw;
        vec2 mouseVel  = mousePos - mousePrev;
        float velMagnitude = length(mouseVel);
        float q = ln(U, mousePos, mousePrev);
        vec2 m = mousePos - mousePrev;
        float l = length(m);
        if (l > 0.0) m = min(l, 10.0) * m / l;

        float brushSizeFactor = 1e-4 / uBrushSize;
        float strengthFactor  = 0.03 * uBrushStrength;

        float falloff = exp(-brushSizeFactor * q * q * q);
        falloff = pow(falloff, 0.5);

        me.xyw += (strengthFactor * uFlowSpeed) * falloff * vec3(m, 10.0);

        if (velMagnitude < 2.0) {
          float distToCursor = length(U - mousePos);
          float influence = exp(-distToCursor * 0.01);
          float cursorDecay = mix(1.0, uStopDecay, influence);
          me.xy *= cursorDecay;
          me.z  *= cursorDecay;
        }
      }

      me = mix(me, vec4(0.0), uSoftReset);

      gl_FragColor = clamp(me, -0.4, 0.4);
    }
  }
`;

export const displayShader = /* glsl */ `
  precision highp float;
  precision highp int;

  uniform float iTime;
  uniform vec2 iResolution;
  uniform sampler2D iFluid;
  uniform float uDistortionAmount;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;
  uniform vec3 uColor6;
  uniform float uColorIntensity;
  uniform float uSoftness;
  uniform float uIdleSpeed;

  varying vec2 vUv;

  void main() {
    vec2 fragCoord = vUv * iResolution;

    vec4 fluid = texture2D(iFluid, vUv);
    vec2 fluidVel = fluid.xy;

    float mr = min(iResolution.x, iResolution.y);
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr;

    uv += fluidVel * (0.5 * uDistortionAmount);

    float t = iTime * uIdleSpeed;

    float d = -t * 0.5;
    float a = 0.0;
    for (float i = 0.0; i < 8.0; ++i) {
      a += cos(i - d - a * uv.x);
      d += sin(uv.y * i + a);
    }
    d += t * 0.5;

    float mixer1 = cos(uv.x * d) * 0.5 + 0.5;
    float mixer2 = cos(uv.y * a) * 0.5 + 0.5;
    float mixer3 = sin(d + a) * 0.5 + 0.5;
    float mixer4 = cos(uv.x * a - d) * 0.5 + 0.5;
    float mixer5 = sin(uv.y * d - a) * 0.5 + 0.5;

    float smoothAmount = clamp(uSoftness * 0.1, 0.0, 0.9);
    mixer1 = mix(mixer1, 0.5, smoothAmount);
    mixer2 = mix(mixer2, 0.5, smoothAmount);
    mixer3 = mix(mixer3, 0.5, smoothAmount);
    mixer4 = mix(mixer4, 0.5, smoothAmount);
    mixer5 = mix(mixer5, 0.5, smoothAmount);

    vec3 col = mix(uColor1, uColor2, mixer1);
    col = mix(col, uColor3, mixer2);
    col = mix(col, uColor4, mixer3 * 0.4);
    col = mix(col, uColor5, mixer4 * 0.35);
    col = mix(col, uColor6, mixer5 * 0.3);

    col *= uColorIntensity;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/** `new THREE.Color(hex)` already converts sRGB input to the working
    (linear) colour space itself — `ColorManagement.enabled` defaults to
    true as of three r152, so `.r`/`.g`/`.b` are already linear. Calling
    `.convertSRGBToLinear()` on top of that re-applies the same gamma curve
    a second time, which darkens everything far more than the hex values
    themselves suggest. Takes the constructor as a param instead of
    importing `three` here, so this module stays framework-agnostic. */
export function asColorLinear(
  ColorCtor: new (hex: string) => { r: number; g: number; b: number },
  hex: string,
): readonly [number, number, number] {
  const c = new ColorCtor(hex);
  return [c.r, c.g, c.b] as const;
}
