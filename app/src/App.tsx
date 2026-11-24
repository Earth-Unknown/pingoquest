import { load } from './lib/store'
import { Profile } from './Profile'
import './legacy/jogo.css'
export default function App(){
  const S=load()
  return <main className="app"><Profile S={S}/></main>
}
