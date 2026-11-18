from PIL import Image, ImageDraw
from pathlib import Path
import math
root=Path(__file__).resolve().parents[1];dest=root/'dist';size=1024;scale=size/512
im=Image.new('RGB',(size,size));pix=im.load()
for y in range(size):
 for x in range(size):
  d=min(1,math.hypot((x/scale-150)/500,(y/scale-100)/500))
  pix[x,y]=(round(30-18*d),round(59-32*d),round(79-39*d))
d=ImageDraw.Draw(im)
def line(coords,color,width=1):d.line([(x*scale,y*scale) for x,y in coords],fill=color,width=round(width*scale))
def circle(r,color,width):d.ellipse([(256-r)*scale,(256-r)*scale,(256+r)*scale,(256+r)*scale],outline=color,width=round(width*scale))
def poly(coords,color):d.polygon([(x*scale,y*scale) for x,y in coords],fill=color)
circle(181,'#65808e',1);circle(170,'#c7ad7b',3);circle(155,'#344e5e',1)
for a in range(0,360,15):
 rad=math.radians(a);major=a%90==0;r1=139 if major else 148;r2=160 if major else 155
 line([(256+math.sin(rad)*r1,256-math.cos(rad)*r1),(256+math.sin(rad)*r2,256-math.cos(rad)*r2)],'#dfc796' if major else '#78909b',3 if major else 1.5)
# The north-east needle points forward; a light facet provides a clear compass silhouette.
poly([(354,158),(284,284),(158,354),(228,228)],'#0b1f2d')
poly([(359,153),(281,281),(256,256)],'#f1dfb6')
poly([(359,153),(256,256),(231,231)],'#c5a66b')
poly([(153,359),(231,231),(256,256)],'#7b929d')
poly([(153,359),(256,256),(281,281)],'#c2cfd0')
d.ellipse([242*scale,242*scale,270*scale,270*scale],fill='#102b3c',outline='#e4c995',width=round(3*scale))
d.ellipse([252*scale,252*scale,260*scale,260*scale],fill='#f3dfb5')
for n in [180,192,512]:
 out=im.resize((n,n),Image.Resampling.LANCZOS)
 out.save(dest/f'compass-premium-{n}.png',optimize=True)
# User-facing preview of the same icon with the home-screen rounded silhouette.
preview=root/'artifacts';preview.mkdir(exist_ok=True)
out=im.resize((512,512),Image.Resampling.LANCZOS);out.save(preview/'Pusula-Premium-Logo.png',optimize=True)
print('Rendered opaque iPhone and PWA icons at 180, 192 and 512 px.')
