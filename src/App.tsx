import { useCallback, useState } from 'react';
import { stopVoice } from './lib/audio';
import { NavContext, type Screen } from './nav';
import { Start } from './screens/Start';
import { Home } from './screens/Home';
import { TopicScreen } from './screens/TopicScreen';
import { Learn } from './screens/Learn';
import { Find } from './screens/Find';
import { Drag } from './screens/Drag';
import { Match } from './screens/Match';
import { Pop } from './screens/Pop';
import { Peek } from './screens/Peek';
import { SayIt } from './screens/SayIt';
import { Celebrate } from './screens/Celebrate';

export function App(){
  const [{screen, n}, setState] = useState<{screen: Screen, n: number}>({screen: {name: 'start'}, n: 0});
  const go = useCallback((s: Screen) => { stopVoice(); setState(p => ({screen: s, n: p.n + 1})); }, []);
  return <NavContext.Provider value={go}>{render(screen, n)}</NavContext.Provider>;
}

function render(s: Screen, key: number){
  switch (s.name){
    case 'start': return <Start key={key}/>;
    case 'home': return <Home key={key}/>;
    case 'topic': return <TopicScreen key={key} topic={s.topic}/>;
    case 'learn': return <Learn key={key} topic={s.topic} i={s.i ?? 0}/>;
    case 'find': return <Find key={key} topic={s.topic} round={s.round ?? 0} prev={s.prev}/>;
    case 'drag': return <Drag key={key} topic={s.topic} round={s.round ?? 0} prev={s.prev}/>;
    case 'match': return <Match key={key} topic={s.topic}/>;
    case 'pop': return <Pop key={key} topic={s.topic} round={s.round ?? 0} prev={s.prev}/>;
    case 'peek': return <Peek key={key} topic={s.topic}/>;
    case 'say': return <SayIt key={key} topic={s.topic} round={s.round ?? 0} prev={s.prev}/>;
    case 'celebrate': return <Celebrate key={key} topic={s.topic} mode={s.mode}/>;
  }
}
