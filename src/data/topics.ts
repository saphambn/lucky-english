/* All lesson content: topics and their words, levels and game modes. Add a topic or word here. */

export type Kind = 'emoji' | 'color' | 'number';

export interface Item {
  en: string;
  vi: string;
  /** What the picture shows: an emoji, a CSS color, or a number. */
  v: string | number;
  /** For ask:'who' topics: the -ing form ("running"). */
  q?: string;
  /** Vietnamese word used inside level 2+ prompts, when it differs from vi. */
  vq?: string;
  /** A short sentence (level 3) read in Learn, with its Vietnamese meaning. */
  s?: string;
  vs?: string;
}

export interface Topic {
  id: string;
  level: number;
  en: string;
  vi: string;
  icon: string;
  /** Tile color and its darker edge. */
  t: string;
  td: string;
  kind: Kind;
  /** 'who' asks "Who is running?"; 'quote' asks "Which one is hello?". */
  ask?: 'who' | 'quote';
  /** Added after the word in prompts, e.g. ' face' -> "Find the happy face!". */
  noun?: string;
  items: Item[];
}

type Extra = Pick<Item, 'q' | 'vq' | 's' | 'vs'>;
type RawTopic = Omit<Topic, 'level' | 'items'> & { level?: number; items: [string, string, string | number, Extra?][] };

const RAW: RawTopic[] = [
  {id:'animals', en:'Animals', vi:'Con vật', icon:'🐱', t:'#FFDDB0', td:'#E8AE62', kind:'emoji', items:[
    ['cat','con mèo','🐱'],['dog','con chó','🐶'],['fish','con cá','🐟'],['bird','con chim','🐦'],
    ['duck','con vịt','🦆'],['cow','con bò','🐮'],['pig','con heo','🐷'],['chicken','con gà','🐔']]},
  {id:'fruits', en:'Fruits', vi:'Trái cây', icon:'🍎', t:'#FFD0DC', td:'#E68BA3', kind:'emoji', items:[
    ['apple','quả táo','🍎'],['banana','quả chuối','🍌'],['orange','quả cam','🍊'],['grapes','quả nho','🍇'],
    ['watermelon','dưa hấu','🍉'],['mango','quả xoài','🥭'],['strawberry','dâu tây','🍓'],['pineapple','quả dứa','🍍']]},
  {id:'colors', en:'Colors', vi:'Màu sắc', icon:'🎨', t:'#E3D6FF', td:'#A98BE6', kind:'color', items:[
    ['red','màu đỏ','#E8343F'],['blue','màu xanh dương','#2F6FE4'],['yellow','màu vàng','#FFD21F'],['green','màu xanh lá','#2DB55D'],
    ['orange','màu cam','#FF8A1F'],['purple','màu tím','#8E4FD6'],['pink','màu hồng','#FF7EB6'],['brown','màu nâu','#8B5A2B']]},
  {id:'numbers', en:'Numbers', vi:'Con số', icon:'🔢', t:'#CDE3FF', td:'#7EA7E0', kind:'number', items:[
    ['one','số một',1],['two','số hai',2],['three','số ba',3],['four','số bốn',4],['five','số năm',5]]},
  {id:'vehicles', en:'Vehicles', vi:'Xe cộ', icon:'🚗', t:'#C9F0D3', td:'#6FC287', kind:'emoji', items:[
    ['car','xe ô tô','🚗'],['bus','xe buýt','🚌'],['bike','xe đạp','🚲'],['motorbike','xe máy','🛵'],
    ['boat','con thuyền','⛵'],['plane','máy bay','✈️'],['train','tàu hỏa','🚂'],['truck','xe tải','🚚']]},
  {id:'body', en:'My Body', vi:'Cơ thể', icon:'👂', t:'#FFF1B0', td:'#E0C04A', kind:'emoji', items:[
    ['eye','con mắt','👁️'],['ear','cái tai','👂'],['nose','cái mũi','👃'],['mouth','cái miệng','👄'],
    ['hand','bàn tay','✋'],['foot','bàn chân','🦶']]},
  /* ---- Level 2: new everyday words; games show 4 pictures and 4 pairs ---- */
  {id:'family', level:2, en:'Family', vi:'Gia đình', icon:'👨‍👩‍👧', t:'#FFD9C7', td:'#E89A74', kind:'emoji', items:[
    ['mommy','mẹ','👩'],['daddy','bố','👨'],['baby','em bé','👶'],['grandma','bà','👵'],
    ['grandpa','ông','👴'],['brother','anh trai','👦'],['sister','chị gái','👧']]},
  {id:'food', level:2, en:'Food', vi:'Đồ ăn', icon:'🍚', t:'#FFE9B8', td:'#E2B54E', kind:'emoji', items:[
    ['rice','cơm','🍚'],['bread','bánh mì','🍞'],['egg','quả trứng','🥚'],['milk','sữa','🥛'],
    ['noodles','mì sợi','🍜'],['cake','bánh ngọt','🍰'],['ice cream','kem','🍦'],['water','nước','💧']]},
  {id:'toys', level:2, en:'Toys', vi:'Đồ chơi', icon:'🧸', t:'#D7E8FF', td:'#86A9DE', kind:'emoji', items:[
    ['ball','quả bóng','⚽'],['teddy bear','gấu bông','🧸'],['doll','búp bê','🪆'],['kite','cái diều','🪁'],
    ['balloon','bóng bay','🎈'],['drum','cái trống','🥁'],['robot','người máy','🤖'],['yo-yo','con quay','🪀']]},
  {id:'weather', level:2, en:'Weather', vi:'Thời tiết', icon:'🌦️', t:'#D2F1F7', td:'#74C1D1', kind:'emoji', items:[
    ['sun','mặt trời','☀️'],['cloud','đám mây','☁️'],['rain','mưa','🌧️'],['snow','tuyết','❄️'],
    ['wind','gió','🌬️'],['rainbow','cầu vồng','🌈']]},
  {id:'numbers2', level:2, en:'Numbers 6–10', vi:'Số 6 đến 10', icon:'🔟', t:'#CDE3FF', td:'#7EA7E0', kind:'number', items:[
    ['six','số sáu',6],['seven','số bảy',7],['eight','số tám',8],['nine','số chín',9],['ten','số mười',10]]},
  /* ---- Level 3: actions, feelings, places and short phrases; Learn also reads a short sentence ---- */
  {id:'actions', level:3, en:'Actions', vi:'Hành động', icon:'🏃', t:'#D8F5C9', td:'#83C565', kind:'emoji', ask:'who', items:[
    ['run','chạy','🏃',{q:'running',vq:'bạn đang chạy',s:'I can run!',vs:'Bé biết chạy!'}],
    ['jump','nhảy','🤸',{q:'jumping',vq:'bạn đang nhảy',s:'I can jump!',vs:'Bé biết nhảy!'}],
    ['swim','bơi','🏊',{q:'swimming',vq:'bạn đang bơi',s:'I can swim!',vs:'Bé biết bơi!'}],
    ['eat','ăn','🍽️',{q:'eating',vq:'ăn cơm',s:'I can eat!',vs:'Bé tự ăn cơm!'}],
    ['sleep','ngủ','😴',{q:'sleeping',vq:'bạn đang ngủ',s:'Time to sleep!',vs:'Đến giờ đi ngủ!'}],
    ['dance','múa','💃',{q:'dancing',vq:'bạn đang múa',s:'I can dance!',vs:'Bé biết múa!'}],
    ['sing','hát','🎤',{q:'singing',vq:'bạn đang hát',s:'I can sing!',vs:'Bé biết hát!'}],
    ['clap','vỗ tay','👏',{q:'clapping',vq:'vỗ tay',s:'Clap your hands!',vs:'Vỗ tay nào!'}]]},
  {id:'feelings', level:3, en:'Feelings', vi:'Cảm xúc', icon:'😊', t:'#FFE0EC', td:'#E890B1', kind:'emoji', noun:' face', items:[
    ['happy','vui','😄',{vq:'mặt vui',s:'I am happy!',vs:'Bé đang vui!'}],
    ['sad','buồn','😢',{vq:'mặt buồn',s:'I am sad.',vs:'Bé đang buồn.'}],
    ['angry','tức giận','😠',{vq:'mặt tức giận',s:'I am angry!',vs:'Bé đang giận!'}],
    ['scared','sợ hãi','😨',{vq:'mặt sợ hãi',s:'I am scared!',vs:'Bé sợ quá!'}],
    ['sleepy','buồn ngủ','🥱',{vq:'mặt buồn ngủ',s:'I am sleepy.',vs:'Bé buồn ngủ rồi.'}],
    ['hungry','đói bụng','🤤',{vq:'mặt đói bụng',s:'I am hungry!',vs:'Bé đói bụng!'}]]},
  {id:'places', level:3, en:'Places', vi:'Nơi chốn', icon:'🏫', t:'#E6DDFB', td:'#A592DE', kind:'emoji', items:[
    ['house','ngôi nhà','🏠',{s:"Let's go home!",vs:'Mình về nhà nào!'}],
    ['school','trường học','🏫',{s:"Let's go to school!",vs:'Mình đi học nào!'}],
    ['park','công viên','🏞️',{s:"Let's go to the park!",vs:'Mình đi công viên nào!'}],
    ['beach','bãi biển','🏖️',{s:"Let's go to the beach!",vs:'Mình đi biển nào!'}],
    ['zoo','sở thú','🦒',{s:"Let's go to the zoo!",vs:'Mình đi sở thú nào!'}],
    ['hospital','bệnh viện','🏥',{s:'This is the hospital.',vs:'Đây là bệnh viện.'}],
    ['market','chợ','🛒',{s:"Let's go to the market!",vs:'Mình đi chợ nào!'}]]},
  {id:'phrases', level:3, en:'Hello & Thanks', vi:'Lời chào', icon:'👋', t:'#FFF1B0', td:'#E0C04A', kind:'emoji', ask:'quote', items:[
    ['hello','xin chào','👋',{s:'Hello! How are you?',vs:'Xin chào! Bạn khỏe không?'}],
    ['goodbye','tạm biệt','🚪',{s:'Goodbye! See you!',vs:'Tạm biệt! Hẹn gặp lại!'}],
    ['thank you','cảm ơn','🙏',{s:'Thank you, Mommy!',vs:'Con cảm ơn mẹ!'}],
    ['sorry','xin lỗi','🥺',{s:'I am sorry.',vs:'Con xin lỗi.'}],
    ['good night','chúc ngủ ngon','🌙',{s:'Good night, Daddy!',vs:'Chúc bố ngủ ngon!'}],
    ['I love you','con yêu bố mẹ','❤️',{s:'I love you, Mommy!',vs:'Con yêu mẹ!'}]]},
];

export const TOPICS: Topic[] = RAW.map(t => ({level: 1, ...t, items: t.items.map(([en, vi, v, x]) => ({en, vi, v, ...x}))}));

export interface Level { n: number; icon: string; vi: string; need: number }
// A level opens once the child has earned enough stars (one per finished game) in the level before it.
export const LEVELS: Level[] = [
  {n:1, icon:'🌱', vi:'Cấp 1', need:0},
  {n:2, icon:'🌿', vi:'Cấp 2', need:6},
  {n:3, icon:'🌳', vi:'Cấp 3', need:6},
];

export type ModeId = 'learn' | 'find' | 'drag' | 'match';
export interface Mode { id: ModeId; en: string; vi: string; icon: string; t: string; td: string }
export const MODES: Mode[] = [
  {id:'learn', en:'Learn', vi:'Học từ mới', icon:'👀', t:'#FFFFFF', td:'#C9D6E8'},
  {id:'find',  en:'Find it', vi:'Chạm đúng hình', icon:'👆', t:'#FFE7A3', td:'#E3B23C'},
  {id:'drag',  en:'Drag', vi:'Kéo vào bóng', icon:'✋', t:'#CFF2DD', td:'#6CC08F'},
  {id:'match', en:'Match', vi:'Lật thẻ tìm cặp', icon:'🃏', t:'#FFD6E2', td:'#E78BA6'},
];
export const ROUNDS = 5;

// Level 1 games show 3 pictures and 3 pairs; later levels show 4.
export const choices = (t: Topic) => t.level > 1 ? 4 : 3;
