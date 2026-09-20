import { ImageResponse } from 'next/og';
export const runtime='edge';

export async function GET(){
  return new ImageResponse(
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'70px 78px',background:'linear-gradient(135deg,#09111f 0%,#182a3b 55%,#0b1825 100%)',color:'white',fontFamily:'Arial'}}>
      <div style={{display:'flex',fontSize:24,letterSpacing:3,textTransform:'uppercase',opacity:.82}}>RESIDETERRA · FIRE FEATURE GUIDE</div>
      <div style={{display:'flex',flexDirection:'column',gap:18}}>
        <div style={{display:'flex',fontSize:66,fontWeight:700,lineHeight:1.05}}>Fire Bowl vs<br/>Fire & Water Bowl</div>
        <div style={{display:'flex',fontSize:28,opacity:.88}}>Which feature fits your pool project?</div>
      </div>
      <div style={{display:'flex',gap:28,fontSize:22,opacity:.78}}>
        <span>FLAME</span><span>•</span><span>WATER</span><span>•</span><span>UTILITIES</span><span>•</span><span>PROJECT FIT</span>
      </div>
    </div>,
    {width:1200,height:675}
  );
}
