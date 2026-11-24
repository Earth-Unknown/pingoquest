import { pingo, avCfg } from './lib/pingo'
export function Pingo({S,mood='happy',cls='pingo-big'}:{S:any;mood?:string;cls?:string}){
  return <span style={{display:'contents'}} dangerouslySetInnerHTML={{__html:pingo(mood,cls,true,avCfg(S))}}/>
}
