// WebGL shader sources for the three generative expert avatars, taken as-is
// from the Velaris avatar assets supplied by the user (cosmic cloud / helix /
// singularity). Kept verbatim so the rendered result matches exactly.

export const VERTEX_SOURCE = `attribute vec2 aPosition;varying vec2 vUv;void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;

export const COSMIC_CLOUD_FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform float uPhase;
const float PI=3.141592653589793;
const float TAU=6.283185307179586;

float hash11(float n){return fract(sin(n*127.1+311.7)*43758.5453123);}
float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),mix(hash21(i+vec2(0.,1.)),hash21(i+1.),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  mat2 r=mat2(.80,.60,-.60,.80);
  for(int i=0;i<4;i++){v+=a*noise(p);p=r*p*2.03+3.17;a*=.5;}
  return v;
}
float glow(vec2 p,vec2 c,float s){vec2 d=p-c;return exp(-dot(d,d)/max(s*s,.000001));}

vec2 currentPath(float t,float theta,float lane){
  float a=t*TAU;
  float radius=.24+.13*sin(theta*2.+lane*2.1)+.06*sin(a*3.-theta*2.);
  float x=radius*cos(a+lane*1.4)+.20*sin(a*2.-theta+lane);
  float y=.78*radius*sin(a+lane*1.4)+.18*cos(a*3.+theta*2.+lane*2.7);
  return vec2(x,y);
}

void main(){
  vec2 p=(vUv-.5)*2.;p.y=-p.y;
  float theta=uPhase*TAU;
  vec2 orbit=vec2(cos(theta),sin(theta));
  vec2 orbit2=vec2(cos(theta*2.),sin(theta*2.));
  vec2 orbit3=vec2(cos(theta*3.),sin(theta*3.));

  float breathe=.96+.055*sin(theta*2.)+.025*sin(theta*3.+1.2);
  vec2 bp=p/breathe;
  float warpA=fbm(bp*vec2(1.45,1.72)+orbit*.41+vec2(2.1,-1.8));
  float warpB=fbm(mat2(.72,.69,-.69,.72)*bp*vec2(1.68,1.42)-orbit2*.31+vec2(-3.7,2.9));
  vec2 q=bp+vec2(warpA-.5,warpB-.5)*.31;
  q+=.045*vec2(sin(bp.y*4.8+theta*2.),cos(bp.x*4.1-theta*3.));

  vec3 deep=vec3(.002,.10,.18);
  vec3 cyan=vec3(.00,.66,.82);
  vec3 aqua=vec3(.15,1.00,.94);
  vec3 col=vec3(0.);
  float cloudAlpha=0.;

  for(int i=0;i<6;i++){
    float fi=float(i),z=fi/5.*2.-1.;
    vec2 drift=vec2(sin(theta*(1.+mod(fi,3.))+fi*1.7),cos(theta*(2.+mod(fi,2.))-fi*2.3));
    vec2 s=q*(1.+z*.075)+drift*.032+vec2(z*.045,-z*.026);
    float n=fbm(s*vec2(2.25,2.72)+orbit*(.29+z*.055)+vec2(z*3.1,fi*1.9));
    float n2=fbm(s*vec2(4.45,5.15)-orbit2*(.18-z*.025)+vec2(n*2.7,fi*3.4));
    float angle=atan(s.y,s.x);
    float radius=length(s*vec2(.97,1.02));
    float boundary=.67+.13*(n-.5)+.07*sin(angle*3.+theta*(1.+mod(fi,3.))+z*2.2);
    float body=1.-smoothstep(boundary-.20,boundary+.035,radius);
    float shell=exp(-pow((radius-boundary)/.095,2.));
    float cavities=.42+.58*n2;
    float density=body*(.18+.61*n+.30*n2)*cavities;
    float depth=.46+.54*(z*.5+.5);
    vec3 layer=mix(deep,cyan,.35+.55*n2);
    layer=mix(layer,aqua,shell*(.25+.45*n));
    col+=layer*(density*.105+shell*(.025+.07*n2))*depth;
    cloudAlpha+=density*.075+shell*.023;
  }

  for(int i=0;i<5;i++){
    float fi=float(i),ph=fi*1.257+hash11(fi+9.)*.8;
    float a=ph+theta*(1.+mod(fi,2.))+.24*sin(theta*(2.+mod(fi,3.))+ph);
    float plumeR=.49+.10*sin(theta*(1.+mod(fi,3.))+ph*2.1);
    vec2 plumePos=vec2(cos(a),sin(a))*plumeR*vec2(1.,.86);
    plumePos+=.055*vec2(sin(theta*3.+fi),cos(theta*2.-fi));
    float plumeSize=.16+.055*hash11(fi*4.1);
    float plume=glow(p,plumePos,plumeSize)*(.38+.62*fbm((p-plumePos)*5.+orbit*.45+fi));
    col+=mix(deep,cyan,.45+.35*hash11(fi))*plume*.16;
    cloudAlpha+=plume*.055;
  }

  float f1=fbm(q*vec2(4.8,5.6)+orbit*.64+vec2(warpB,warpA)*2.1);
  float f2=fbm(mat2(.64,.77,-.77,.64)*q*vec2(6.1,5.4)-orbit2*.52+vec2(4.2,-6.1));
  float f3=fbm(q*vec2(8.3,7.1)+orbit3*.34+vec2(f2,f1)*1.8);
  float radial=length(q*vec2(.97,1.04));
  float volumeMask=(1.-smoothstep(.50,.82,radial))*(.52+.48*f1);
  float currentA=pow(1.-abs(2.*f1-1.),12.);
  float currentB=pow(.5+.5*sin((f2*5.7+atan(q.y,q.x)*1.4+radial*3.1)*TAU),11.);
  float currentC=pow(1.-abs(2.*f3-1.),16.);
  float currents=(currentA*.52+currentB*.65+currentC*.36)*volumeMask;
  float halo=(currentA*.22+currentB*.28)*volumeMask;
  col+=vec3(.00,.34,.58)*halo*.62;
  col+=mix(cyan,vec3(.88,1.,1.),f3)*currents*1.52;
  cloudAlpha+=currents*.22+halo*.10;

  vec2 heartPos=.085*vec2(sin(theta*2.+.7),cos(theta*3.-.4));
  float heartPulse=.58+.42*pow(.5+.5*sin(theta*3.+1.1),4.);
  float heartBloom=glow(p,heartPos,.155)*heartPulse*(.45+.55*f2);
  float heartCore=glow(p,heartPos,.047)*heartPulse*(.55+.45*f3);
  col+=vec3(.00,.61,.91)*heartBloom*.50+vec3(.92,1.,1.)*heartCore*1.72;
  cloudAlpha+=heartBloom*.12+heartCore*.22;

  for(int i=0;i<6;i++){
    float fi=float(i),speed=1.+mod(fi,3.);
    float travel=fract(uPhase*speed+hash11(fi*7.9));
    vec2 node=currentPath(travel,theta,mod(fi,3.));
    float pulse=.38+.62*pow(.5+.5*sin(theta*(2.+mod(fi,3.))+fi*2.2),6.);
    float bloom=glow(p,node,.105)*pulse;
    float core=glow(p,node,.025)*pulse;
    col+=vec3(.00,.54,.86)*bloom*.45+vec3(.92,1.,1.)*core*1.92;
    cloudAlpha+=bloom*.10+core*.18;
  }

  for(int i=0;i<44;i++){
    float fi=float(i),ph=hash11(fi*8.3)*TAU,freq=1.+mod(fi,4.);
    float baseR=.12+.67*sqrt(hash11(fi*3.7+2.));
    float a=ph+theta*freq+.18*sin(theta*(2.+mod(fi,3.))+ph);
    float r=baseR*(.90+.10*sin(theta*(1.+mod(fi,3.))+ph));
    vec2 pos=vec2(cos(a),sin(a))*r*vec2(1.,.82);
    pos+=.075*vec2(sin(theta*2.+fi),cos(theta*3.-fi*1.4));
    float twinkle=pow(.5+.5*sin(theta*(1.+mod(fi,5.))+ph),10.);
    float size=.005+.010*pow(hash11(fi+4.),2.);
    vec3 spark=mix(vec3(.00,.50,.73),vec3(.70,1.,1.),hash11(fi+7.));
    col+=spark*glow(p,pos,size)*(.08+1.20*twinkle)*(1.-smoothstep(.72,.94,length(pos)));
  }

  float edgeNoise=fbm(q*vec2(3.1,3.6)+orbit*.47+vec2(-7.3,1.8));
  float outer=exp(-pow(radial/(.72+.10*(edgeNoise-.5)),4.));
  col+=deep*outer*(.035+.075*edgeNoise);
  cloudAlpha+=outer*(.018+.035*edgeNoise);

  col=1.-exp(-max(col,vec3(0.))*1.58);
  col=pow(col,vec3(.70));
  float alpha=clamp(max(cloudAlpha,max(col.r,max(col.g,col.b))),0.,1.);
  alpha*=1.-smoothstep(.91,1.10,length(p));
  if(alpha<.003){gl_FragColor=vec4(0.);return;}
  gl_FragColor=vec4(clamp(col/max(alpha,.0001),0.,1.),alpha);
}
`;

export const HELIX_FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform float uPhase;
const float PI=3.141592653589793;
const float TAU=6.283185307179586;

float hash11(float n){return fract(sin(n*127.1+311.7)*43758.5453123);}
float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),mix(hash21(i+vec2(0.,1.)),hash21(i+1.),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  mat2 r=mat2(.80,.60,-.60,.80);
  for(int i=0;i<4;i++){v+=a*noise(p);p=r*p*2.03+3.17;a*=.5;}
  return v;
}
float glow(vec2 p,vec2 c,float s){vec2 d=p-c;return exp(-dot(d,d)/max(s*s,.000001));}

vec2 flowPath(float t,float theta,float lane){
  float a=t*TAU;
  float breathe=.91+.09*sin(theta*2.+lane*1.7);
  float x=.88*cos(a)*breathe+.035*sin(theta*3.+a*2.);
  float y=.30*sin(a*2.+.20*sin(theta*2.+a))*mix(1.,-.82,lane);
  y+=.045*sin(a*3.-theta*2.+lane*2.4);
  return vec2(x,y);
}

void main(){
  vec2 p=(vUv-.5)*2.;p.y=-p.y;
  float theta=uPhase*TAU;
  vec2 orbit=vec2(cos(theta),sin(theta));
  vec2 orbit2=vec2(cos(theta*2.),sin(theta*2.));

  float warpA=fbm(p*vec2(1.65,2.05)+orbit*.38+vec2(1.7,-.8));
  float warpB=fbm(mat2(.78,.63,-.63,.78)*p*vec2(1.9,1.55)+orbit2*.27+vec2(-2.4,4.1));
  vec2 q=p+vec2(warpA-.5,warpB-.5)*.23;
  q+=.035*vec2(sin(p.y*5.+theta*2.),cos(p.x*5.-theta*3.));

  float cloud=fbm(q*vec2(3.2,5.8)+orbit*.55+vec2(warpB,warpA)*1.8);
  float cloud2=fbm(q*vec2(6.3,9.1)-orbit2*.43+vec2(5.2,-3.7));
  float ridges=pow(1.-abs(2.*cloud2-1.),4.5);
  float filaments=pow(.5+.5*sin((cloud*7.5+cloud2*4.2+q.x*2.1-q.y*3.7)*TAU),9.);

  float squeeze=.96+.06*sin(theta*2.);
  vec2 l=vec2((q.x+.38*squeeze)/.47,q.y/.35);
  vec2 r=vec2((q.x-.38*squeeze)/.47,q.y/.35);
  float al=.16*sin(theta*2.)+.08*sin(theta*3.);
  float ar=-.13*sin(theta*2.+1.4)+.07*cos(theta*3.);
  l=mat2(cos(al),-sin(al),sin(al),cos(al))*l;
  r=mat2(cos(ar),-sin(ar),sin(ar),cos(ar))*r;
  float rl=length(l),rr=length(r);
  float ringL=exp(-pow((rl-(.72+.12*(cloud-.5)))/.25,2.));
  float ringR=exp(-pow((rr-(.72+.12*(cloud2-.5)))/.25,2.));
  float coreL=exp(-pow((rl-(.72+.08*(cloud2-.5)))/.11,2.));
  float coreR=exp(-pow((rr-(.72+.08*(cloud-.5)))/.11,2.));
  float bodyMask=1.-smoothstep(.87,1.11,length(p*vec2(.94,1.22)));
  float billow=(ringL+ringR)*(.30+.48*cloud+.40*ridges)*bodyMask;
  float alive=(coreL+coreR)*(.18+.78*filaments+.32*cloud2)*bodyMask;

  float angleL=atan(l.y,l.x),angleR=atan(r.y,r.x);
  float curlL=pow(.5+.5*sin(angleL*4.-rl*10.+cloud*8.+theta*2.),8.);
  float curlR=pow(.5+.5*sin(angleR*5.+rr*9.-cloud2*7.-theta*3.),8.);
  float curls=(curlL*ringL+curlR*ringR)*bodyMask;
  float bridge=exp(-pow(q.y/(.19+.08*cos(q.x*PI)),2.))*exp(-pow(q.x/.47,4.));
  float mist=(.08+.24*cloud)*exp(-pow(q.y/.55,2.))*bodyMask;
  float crossing=exp(-dot(q,q)/.030)*pow(.5+.5*sin(theta*3.+cloud*6.),4.);

  vec3 ember=vec3(.92,.075,.002);
  vec3 amber=vec3(1.,.39,.015);
  vec3 gold=vec3(1.,.72,.17);
  vec3 col=ember*mist*.19;
  col+=mix(ember,amber,cloud)*billow*.42;
  col+=mix(amber,gold,ridges)*alive*.68;
  col+=mix(ember,gold,cloud2)*curls*.38;
  col+=ember*bridge*(.045+.11*ridges);
  col+=gold*crossing*.72;

  for(int i=0;i<8;i++){
    float fi=float(i),speed=1.+mod(fi,3.);
    float travel=fract(uPhase*speed+hash11(fi*8.7));
    float life=pow(sin(PI*travel),2.);
    vec2 pulse=flowPath(travel,theta,mod(fi,2.));
    pulse.y+=.045*sin(theta*(2.+mod(fi,3.))+fi*2.3);
    float bloom=glow(p,pulse,.065)*life;
    float hot=glow(p,pulse,.016)*life;
    col+=vec3(1.,.22,.005)*bloom*.52+vec3(1.,.96,.72)*hot*1.75;
  }

  for(int i=0;i<38;i++){
    float fi=float(i),freq=1.+mod(fi,4.),ph=hash11(fi*9.1)*TAU;
    float travel=fract(hash11(fi*2.4+6.)+uPhase*freq);
    vec2 sparkPos=flowPath(travel,theta,mod(fi,2.));
    float radius=.10+.22*hash11(fi*4.7);
    float sy=sparkPos.y+radius*sin(theta*(1.+mod(fi,3.))+ph);
    float sx=sparkPos.x+radius*.42*cos(theta*(2.+mod(fi,2.))+ph);
    float twinkle=pow(.5+.5*sin(theta*(1.+mod(fi,5.))+ph),8.);
    float size=.006+.010*pow(hash11(fi+4.),2.);
    vec3 spark=mix(vec3(1.,.18,.003),vec3(1.,.82,.40),hash11(fi+7.));
    col+=spark*glow(p,vec2(sx,sy),size)*(.10+1.25*twinkle);
  }

  col=1.-exp(-max(col,vec3(0.))*1.42);
  col=pow(col,vec3(.74));
  float alpha=clamp(max(col.r,max(col.g,col.b)),0.,1.);
  alpha*=1.-smoothstep(.91,1.11,length(p*vec2(.92,1.12)));
  if(alpha<.003){gl_FragColor=vec4(0.);return;}
  gl_FragColor=vec4(clamp(col/max(alpha,.0001),0.,1.),alpha);
}
`;

export const SINGULARITY_FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform float uPhase;
const float PI=3.141592653589793;
const float TAU=6.283185307179586;

float hash(float n){ return fract(sin(n * 127.1 + 311.7) * 43758.5453123); }
mat2 rot(float a){ float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }
float glow(vec2 p, vec2 c, float s){ vec2 d=p-c; return exp(-dot(d,d)/max(s*s,0.000001)); }

void main(){
  vec2 p=(vUv-0.5)*2.0;
  p.y=-p.y;
  float theta=uPhase*TAU;
  vec3 col=vec3(0.0);

  for(int i=0;i<36;i++){
    float fi=float(i);
    vec2 sp=vec2(hash(fi*2.13+1.7)*1.88-0.94,hash(fi*3.71+9.2)*1.72-0.86);
    float harmonic=1.0+mod(fi,4.0);
    sp+=vec2(sin(theta+fi),cos(theta*2.0+fi*1.3))*0.009*(0.4+hash(fi+4.0));
    float tw=pow(0.5+0.5*sin(theta*harmonic+hash(fi*8.1)*TAU),8.0);
    float sz=0.006+0.012*pow(hash(fi*7.7),3.0);
    float g=glow(p,sp,sz)*(0.12+0.88*tw)*(0.25+0.75*hash(fi+12.0));
    col+=mix(vec3(0.28,0.12,0.72),vec3(0.95,0.88,1.0),step(0.88,hash(fi+2.0)))*g;
  }

  vec2 gp=vec2(p.x,p.y/0.53);
  float gr=length(gp);
  float ga=atan(gp.y,gp.x);
  float spiralPhase=4.0*(ga-gr*3.45-theta);
  float arms=exp(-(1.0-cos(spiralPhase))*7.5);
  float armEnvelope=smoothstep(0.96,0.12,gr)*smoothstep(0.08,0.19,gr);
  float armPulse=0.72+0.28*sin(theta*2.0+gr*18.0)*sin(theta*2.0+gr*18.0);
  col+=vec3(0.36,0.10,0.82)*arms*armEnvelope*armPulse*0.34;

  for(int i=0;i<150;i++){
    float fi=float(i);
    float arm=mod(fi,4.0);
    float baseR=0.14+pow(hash(fi*1.91+4.2),0.72)*0.82;
    float scatter=(hash(fi*5.3+2.1)-0.5)*0.11;
    float speed=1.0;
    if(i==3 || i==7 || i==11 || i==15 || i==19 || i==23 || i==27 || i==31 || i==35 || i==39 || i==43 || i==47 || i==51 || i==55 || i==59 || i==63 || i==67 || i==71 || i==75 || i==79 || i==83 || i==87 || i==91 || i==95 || i==99 || i==103 || i==107 || i==111 || i==115 || i==119 || i==123 || i==127 || i==131 || i==135 || i==139 || i==143 || i==147) speed=-1.0;
    else if(mod(fi,4.0)>1.5) speed=2.0;
    float drift=1.0+mod(fi,3.0);
    float ph=hash(fi*8.9+7.0)*TAU;
    float rr=baseR+scatter*sin(theta*2.0+ph);
    float ang=arm*PI*0.5+rr*4.35+theta*speed+(hash(fi*2.7)-0.5)*0.38+0.15*sin(theta*drift+ph);
    vec2 dp=vec2(cos(ang)*rr,sin(ang)*rr*(0.50+(hash(fi+5.0)-0.5)*0.12));
    float depth=0.5+0.5*sin(ang+hash(fi)*2.0);
    float size=0.0045+0.008*pow(hash(fi*4.1),3.0);
    float tw=0.55+0.45*pow(sin(theta*(1.0+mod(fi,3.0))+ph),2.0);
    float g=glow(p,dp,size)*(0.16+0.84*hash(fi+9.0))*depth*tw;
    vec3 tint=mix(vec3(0.37,0.17,0.88),vec3(0.95,0.76,1.0),step(0.88,hash(fi+9.0)));
    col+=tint*g*0.88;
  }

  for(int i=0;i<48;i++){
    float fi=float(i);
    float belt=mod(fi,2.0);
    float speed=mix(-2.0,3.0,belt);
    float rr=mix(0.52,0.73,belt)+(hash(fi*4.6)-0.5)*0.13+0.025*sin(theta*(1.0+mod(fi,3.0))+fi);
    float ang=fi/48.0*TAU+theta*speed+(hash(fi*7.2)-0.5)*0.32+0.08*sin(theta*2.0+fi);
    vec2 ap=vec2(cos(ang)*rr,sin(ang)*rr*mix(0.31,0.43,belt));
    float depth=0.35+0.65*(0.5+0.5*sin(ang+mix(-0.7,1.2,belt)));
    float cluster=mix(1.0,1.7,step(mod(fi,9.0),2.5));
    float sz=(0.005+0.008*pow(hash(fi*9.1),2.0))*cluster;
    col+=vec3(0.64,0.32,0.93)*glow(p,ap,sz)*depth*(0.22+0.68*hash(fi+3.0));
  }

  for(int i=0;i<7;i++){
    float fi=float(i);
    float speed=(mod(fi,2.0)<0.5?1.0:-1.0)*(1.0+mod(fi,3.0));
    float ph=hash(fi*11.7+1.9)*TAU;
    float rx=0.36+0.42*hash(fi*3.1+4.0);
    float ry=0.14+0.30*hash(fi*5.7+8.0);
    float plane=(hash(fi*8.3)-0.5)*1.45+0.07*sin(theta*(1.0+mod(fi,3.0))+ph);
    float ecc=0.05+0.12*hash(fi+20.0);
    float t=theta*speed+ph;
    float radial=1.0-ecc*cos(t);
    vec2 local=vec2(cos(t)*rx*radial,sin(t)*ry);
    vec2 pp=rot(plane)*local;
    float depth=0.58+0.42*(0.5+0.5*sin(t+plane));

    vec2 q=rot(-plane)*p/vec2(rx,ry);
    float ringDistance=abs(length(q)-1.0);
    float oa=atan(q.y,q.x);
    float lag=mod(speed>0.0?t-oa:oa-t,TAU);
    float trailLength=0.52+0.65*hash(fi+31.0)*(0.76+0.24*sin(theta*2.0+ph));
    float trailMask=1.0-smoothstep(0.0,trailLength,lag);
    float trail=exp(-ringDistance*ringDistance/0.00016)*trailMask*trailMask;
    col+=vec3(0.42,0.16,0.92)*trail*(0.11+0.12*hash(fi))*depth;

    float psz=0.015+0.014*hash(fi*7.9);
    float planet=glow(p,pp,psz);
    float planetHalo=glow(p,pp,psz*2.6);
    vec3 ptint=mix(vec3(0.43,0.42,1.0),vec3(0.92,0.70,1.0),hash(fi*2.4));
    col+=ptint*(planet*0.92+planetHalo*0.14)*depth;
    col+=vec3(1.0)*glow(p,pp+vec2(-psz*.22,psz*.22),psz*.24)*0.8;

    if(i==0 || i==2 || i==4){
      float ma=theta*(6.0+fi)+ph*1.7;
      vec2 mp=pp+vec2(cos(ma),sin(ma)*0.5)*(0.052+0.01*fi);
      col+=vec3(0.78,0.68,1.0)*glow(p,mp,0.0065+fi*0.0005)*depth;
    }
  }

  float coreR=length(p);
  col*=smoothstep(0.105,0.145,coreR);

  vec2 ep=vec2(p.x,p.y/0.46);
  float er=length(ep),ea=atan(ep.y,ep.x);
  col+=vec3(0.30,0.07,0.72)*exp(-coreR*coreR/0.055)*0.34;
  for(int j=0;j<6;j++){
    float fj=float(j);
    float radius=0.17+fj*0.027;
    float band=exp(-pow((er-radius)/(0.007+fj*0.0008),2.0));
    float dash=0.24+0.76*pow(0.5+0.5*sin(ea*3.0+theta*(mod(fj,2.0)<0.5?2.0:-1.0)+fj*1.31),5.0);
    vec3 tint=mix(vec3(0.55,0.18,0.98),vec3(0.98,0.90,1.0),1.0-fj/6.0);
    col+=tint*band*dash*(0.22+0.07*(6.0-fj));
  }

  float rim=exp(-pow((coreR-0.135)/0.012,2.0));
  float outer=exp(-pow((coreR-0.155)/0.036,2.0));
  col+=vec3(1.0,0.95,1.0)*rim*1.15+vec3(0.55,0.16,1.0)*outer*0.32;

  for(int i=0;i<5;i++){
    float fi=float(i),a=theta*(mod(fi,2.0)<0.5?-1.0:2.0)+fi*1.31;
    vec2 hp=vec2(cos(a)*(.15+fi*.009),sin(a)*(.065+fi*.005));
    float pulse=0.55+0.45*pow(sin(theta*(1.0+mod(fi,3.0))+fi),8.0);
    col+=vec3(1.0,0.92,1.0)*glow(p,hp,0.009+mod(fi,2.0)*0.004)*pulse;
  }

  col=pow(max(col,vec3(0.0)),vec3(0.78))*1.08;
  float alpha=clamp(max(col.r,max(col.g,col.b)),0.0,1.0);
  if(alpha<0.003){ gl_FragColor=vec4(0.0); return; }
  vec3 straight=clamp(col/max(alpha,0.0001),0.0,1.0);
  gl_FragColor=vec4(straight,alpha);
}
`;

export const LOOP_SECONDS = 7;
