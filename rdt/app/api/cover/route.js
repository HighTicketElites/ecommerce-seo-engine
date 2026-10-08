import { ImageResponse } from 'next/og';
import manifest from '../../../data/manifest.js';

export const runtime='edge';

export async function GET(){
  const source=manifest?.cover?.source_url;
  if(!source) {
    return new ImageResponse(
      <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'#0b1825',color:'white',fontFamily:'Arial',fontSize:34,letterSpacing:3}}>
        RESIDETERRA
      </div>,
      {width:1200,height:675}
    );
  }

  return new ImageResponse(
    <div style={{width:'100%',height:'100%',display:'flex',position:'relative',overflow:'hidden',background:'#111'}}>
      <img src={source} width="1200" height="675" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center'}} />
      <div style={{position:'absolute',inset:0,display:'flex',background:'linear-gradient(180deg,rgba(0,0,0,0.02) 0%,rgba(0,0,0,0.08) 100%)'}} />
    </div>,
    {width:1200,height:675}
  );
}
