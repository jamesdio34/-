
import { SubjectType, Question, BossData } from './types';

export const SUBJECTS = [
  {
    id: SubjectType.CHINESE,
    name: '國語森林',
    color: 'bg-green-500',
    borderColor: 'border-green-700',
    icon: '📖',
    description: '注音、國字、造詞',
  },
  {
    id: SubjectType.MATH,
    name: '數學火山',
    color: 'bg-red-500',
    borderColor: 'border-red-700',
    icon: '➗',
    description: '加減法、時鐘、圖形',
  },
  {
    id: SubjectType.LIFE,
    name: '生活海洋',
    color: 'bg-blue-500',
    borderColor: 'border-blue-700',
    icon: '🌱',
    description: '日常習慣、自然觀察',
  },
  {
    id: SubjectType.MIXED,
    name: '大混亂之塔',
    color: 'bg-purple-600',
    borderColor: 'border-purple-800',
    icon: '🏰',
    description: '全科目隨機挑戰，無限層數！',
  },
];

export const GACHA_COST = 25;

export const DEFAULT_AVATAR = "https://picsum.photos/200/200"; 

export const FALLBACK_QUESTIONS: Record<string, Question[]> = {
  [SubjectType.CHINESE]: [
    {
      id: 'c1',
      text: '「森林」的「森」是由幾個木組成的？',
      options: ['1個', '2個', '3個', '4個'],
      correctIndex: 2,
      explanation: '「森」字是由三個「木」字堆疊起來的喔！',
      difficulty: 1,
    },
    {
      id: 'c2',
      text: '哪個語詞是用來形容開心的？',
      options: ['傷心', '快樂', '生氣', '害怕'],
      correctIndex: 1,
      explanation: '「快樂」就是開心的意思。',
      difficulty: 1,
    },
    {
      id: 'c3',
      text: 'ㄅ、ㄆ、ㄇ 是什麼符號？',
      options: ['英文字母', '數字', '注音符號', '標點符號'],
      correctIndex: 2,
      explanation: 'ㄅㄆㄇ是我們學習發音的注音符號。',
      difficulty: 1,
    },
     {
      id: 'c4',
      text: '「太陽」出來了，天會變？',
      options: ['黑', '亮', '紅', '綠'],
      correctIndex: 1,
      explanation: '太陽公公出來，天就會變亮喔。',
      difficulty: 1,
    },
     {
      id: 'c5',
      text: '哪一個字是水果？',
      options: ['桌', '椅', '蘋', '筆'],
      correctIndex: 2,
      explanation: '「蘋」是蘋果的蘋，蘋果是水果。',
      difficulty: 2,
    },
    {
      id: 'c6',
      text: '「一隻」小狗的「隻」是？',
      options: ['動詞', '量詞', '名詞', '形容詞'],
      correctIndex: 1,
      explanation: '用來計算東西數量的詞叫做量詞。',
      difficulty: 3,
    },
    {
      id: 'c7',
      text: '「洗澡」的「洗」是什麼部首？',
      options: ['水部', '木部', '手部', '火部'],
      correctIndex: 0,
      explanation: '洗澡要用水，所以是水部。',
      difficulty: 2,
    },
    {
      id: 'c8',
      text: '寫字要用？',
      options: ['嘴巴', '耳朵', '眼睛', '手'],
      correctIndex: 3,
      explanation: '我們要用手握筆寫字喔。',
      difficulty: 1,
    },
    {
      id: 'c9',
      text: '「大家」的「大」相反詞是？',
      options: ['多', '小', '高', '長'],
      correctIndex: 1,
      explanation: '大的相反是小。',
      difficulty: 2,
    }
  ],
  [SubjectType.MATH]: [
    {
      id: 'm1',
      text: '5 + 3 = ?',
      options: ['7', '8', '9', '10'],
      correctIndex: 1,
      explanation: '數數看手指頭，5之後數3下是6, 7, 8。',
      difficulty: 1,
    },
    {
      id: 'm2',
      text: '時鐘上長針指著12，短針指著3，是幾點？',
      options: ['12點', '6點', '9點', '3點'],
      correctIndex: 3,
      explanation: '短針是時針，指著3就是3點整。',
      difficulty: 2,
    },
    {
      id: 'm3',
      text: '哪一個形狀有三個角？',
      options: ['圓形', '正方形', '三角形', '長方形'],
      correctIndex: 2,
      explanation: '三角形有三個角和三個邊。',
      difficulty: 1,
    },
    {
      id: 'm4',
      text: '10 - 4 = ?',
      options: ['5', '6', '4', '7'],
      correctIndex: 1,
      explanation: '10個蘋果吃掉4個，剩下6個。',
      difficulty: 2,
    },
    {
      id: 'm5',
      text: '比10大，比12小的數字是？',
      options: ['9', '11', '13', '8'],
      correctIndex: 1,
      explanation: '10, 11, 12。所以在中間的是11。',
      difficulty: 2,
    },
    {
      id: 'm6',
      text: '一雙手有幾根手指頭？',
      options: ['5根', '8根', '10根', '20根'],
      correctIndex: 2,
      explanation: '左手5根，右手5根，加起來是10根。',
      difficulty: 1,
    },
    {
      id: 'm7',
      text: '9 + 9 = ?',
      options: ['16', '18', '20', '19'],
      correctIndex: 1,
      explanation: '9加9等於18。',
      difficulty: 3,
    },
    {
      id: 'm8',
      text: '時鐘上短針在6和7中間，長針在6，是幾點？',
      options: ['6點半', '7點半', '6點', '7點'],
      correctIndex: 0,
      explanation: '短針過了6還沒到7，長針在6是半，所以是6點半。',
      difficulty: 3,
    },
    {
      id: 'm9',
      text: '哪一個最長？',
      options: ['鉛筆', '橡皮擦', '教室的黑板', '尺'],
      correctIndex: 2,
      explanation: '教室的黑板比鉛筆、尺和橡皮擦都還要長很多喔！',
      difficulty: 2,
    }
  ],
  [SubjectType.LIFE]: [
    {
      id: 'l1',
      text: '過馬路要看什麼燈？',
      options: ['霓虹燈', '路燈', '紅綠燈', '手電筒'],
      correctIndex: 2,
      explanation: '紅燈停，綠燈行，要看紅綠燈喔。',
      difficulty: 1,
    },
    {
      id: 'l2',
      text: '睡覺前要做什麼事預防蛀牙？',
      options: ['吃糖果', '刷牙', '看電視', '玩玩具'],
      correctIndex: 1,
      explanation: '刷牙可以把牙齒上的細菌刷掉，就不會蛀牙了。',
      difficulty: 1,
    },
    {
      id: 'l3',
      text: '下雨天出門要帶什麼？',
      options: ['墨鏡', '雨傘', '電風扇', '帽子'],
      correctIndex: 1,
      explanation: '雨傘可以幫我們擋雨，才不會淋濕感冒。',
      difficulty: 1,
    },
    {
      id: 'l4',
      text: '垃圾要丟在哪裡？',
      options: ['地板上', '河裡', '垃圾桶', '別人口袋'],
      correctIndex: 2,
      explanation: '愛護環境，垃圾要丟進垃圾桶。',
      difficulty: 1,
    },
    {
      id: 'l5',
      text: '去圖書館要保持？',
      options: ['安靜', '吵鬧', '奔跑', '睡覺'],
      correctIndex: 0,
      explanation: '圖書館是看書的地方，要保持安靜才不會吵到別人。',
      difficulty: 2,
    },
    {
      id: 'l6',
      text: '看電視要保持距離嗎？',
      options: ['不用', '越近越好', '要保持適當距離', '閉著眼睛看'],
      correctIndex: 2,
      explanation: '保持距離才能保護眼睛，不容易近視喔。',
      difficulty: 2,
    },
    {
      id: 'l7',
      text: '吃東西前要？',
      options: ['玩遊戲', '洗手', '睡覺', '跑步'],
      correctIndex: 1,
      explanation: '洗手把細菌洗掉，吃東西才健康。',
      difficulty: 1,
    },
    {
      id: 'l8',
      text: '早上起床看到人要說？',
      options: ['晚安', '早安', '再見', '你好'],
      correctIndex: 1,
      explanation: '早上見面有禮貌，要說早安。',
      difficulty: 1,
    }
  ]
};

export const FALLBACK_BOSSES: BossData[] = [
    {
        name: "搗蛋史萊姆王",
        tauntText: "噗滋噗滋！你黏不住我的問題的！",
        imageUrl: "https://api.dicebear.com/9.x/bottts/svg?seed=SlimeKing"
    },
    {
        name: "迷糊哥布林隊長",
        tauntText: "嘿嘿！我把題目都藏起來了！",
        imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=GoblinCaptain"
    },
    {
        name: "瞌睡巨龍",
        tauntText: "呼... 你能回答對再叫醒我嗎？",
        imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=SleepyDragon"
    },
    {
        name: "積木破壞神",
        tauntText: "看我把你堆成一堆錯誤！",
        imageUrl: "https://api.dicebear.com/9.x/bottts/svg?seed=BlockDestroyer"
    },
    {
        name: "數學幽靈王",
        tauntText: "嗚～你算不出來的～",
        imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=MathGhost"
    },
    {
        name: "錯字大魔王",
        tauntText: "把你的名字寫錯也是我的傑作！哈哈哈！",
        imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=TypoDevil"
    },
    {
        name: "懶惰蟲",
        tauntText: "為什麼要讀書？一起來睡覺吧...",
        imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=LazyWorm"
    },
    {
        name: "黑板擦怪人",
        tauntText: "我要把你腦袋裡的知識通通擦掉！",
        imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=EraserMan"
    }
];
