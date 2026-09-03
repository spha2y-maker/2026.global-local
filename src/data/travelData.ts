import { PlaceInfo, PhraseItem, ImmigrationQuestion, WeatherRecord } from '../types';

export const PLACES_DATA: PlaceInfo[] = [
  {
    id: 'nanjing_road',
    name: '남경로 (난징둥루)',
    chineseName: '南京东路 (Nánjīng Dōnglù)',
    location: '상하이시 황푸구',
    day: 1,
    dayLabel: '제1일차 (10.13 화)',
    timeSlot: '17:30 ~ 18:30',
    emoji: '🏙️',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    features: '상하이 최대의 번화가이자 보행자 천국입니다. 근대 상하이 개항 이후 서양 문물이 물밀듯 들어오던 상업 중심지로, 과거의 웅장한 서구식 석조 건축물과 첨단 쇼핑몰 및 화려한 네온사인이 공존하는 글로벌 메트로폴리스의 심장부입니다.',
    koreaConnection: '오늘날 화려한 명품점과 인파로 가득한 남경로는 100여 년 전 독립운동가들이 비밀리에 숨어들고 모여 독립 자금을 마련하던 대한민국 임시정부 독립운동의 숨은 거점이자 무대였습니다.',
    historicalEvents: [
      {
        title: '1. 영안백화점 (융안공사, 永安公司) - 1921년 통합 임시정부 신년하례회',
        desc: '1918년에 지어진 웅장한 근대식 건축물로, 1921년 1월 1일 도산 안창호 선생을 비롯해 김구, 이동휘, 이승만 등 독립운동 지도자 59명이 이 백화점 옥상 정원에 모여 파벌을 넘어 국권 회복을 다짐하며 역사적인 "통합 임시정부 신년하례회 기념사진"을 촬영한 역사적 장소입니다.'
      },
      {
        title: '2. 목은당 (무언탕, 沐恩堂) - 독립운동가들의 비밀 집회와 안전지대',
        desc: '남경로 인민광장 인근 붉은 벽돌과 종탑의 개신교 성당인 목은당은 서양 선교사들이 상주하여 일제 경찰의 공권력이 미치지 못하는 "안전지대"였습니다. 안창호 선생과 동포들은 이곳에서 비밀 집회, 광주학생항일운동 지지 집회를 열고 서양 네트워크를 통해 일제의 만행을 세계에 알렸습니다.'
      }
    ],
    curriculumLinks: [
      {
        subject: '역사',
        title: '근대화와 개항, 비밀 접선의 지혜',
        description: '아편전쟁 이후 개항장이 된 상하이의 근대사를 탐구하고 화려한 네온사인 뒤 100년 전의 발자취를 찾습니다.',
        guideQuestion: '100년 전 독립운동가들이 왜 이 화려하고 붐비는 남경로 거리를 비밀 접선 장소로 선택했을까요? 인파와 조계지라는 지리적 특성을 바탕으로 생각을 적어보세요.'
      },
      {
        subject: '사회',
        title: '글로벌 상업 도시의 특성과 유동 인구',
        description: '세계적 상업 중심지의 공간 구조, 유동 인구의 이동 특성과 현대 중국의 소비 문화를 관찰합니다.',
        guideQuestion: '남경로 보행가에서 관찰할 수 있는 글로벌 브랜드와 중국 전통 브랜드의 조화, 그리고 보행자 전용 공간의 특징을 기록해 보세요.'
      }
    ],
    stampPhotoRequirement: '남경로 보행가의 옛 석조 건물(셴스대루 또는 영안백화점 부근)을 배경으로 모둠원들과 함께 찍은 인증 사진'
  },
  {
    id: 'waitan',
    name: '외탄 (와이탄 야경)',
    chineseName: '外滩 (Wàitān) / The Bund',
    location: '상하이시 황푸강변',
    day: 1,
    dayLabel: '제1일차 (10.13 화)',
    timeSlot: '19:30 ~ 21:00',
    emoji: '✨',
    image: 'https://images.unsplash.com/photo-1506158669146-619067261a76?auto=format&fit=crop&w=1200&q=80',
    features: '황푸강을 따라 19~20세기 초반의 신고전주의, 아르데코 등 서양식 석조 건물 52개 동이 늘어선 "세계 근대 건축 박물관"입니다. 강 건너 푸둥의 미래지향적 마천루(동방명주, 상하이타워)와 마주 보며 과거와 미래가 극적인 대조를 이루는 세계적인 야경 명소입니다.',
    koreaConnection: '1922년 3월 28일 의열단(義烈團) 단원들이 일제 군부 최고 실세이자 침략 원흉인 일본 육군대장 다나카 기이치를 처단하려 했던 전격적인 "황포탄 의거"의 실제 거사 현장입니다.',
    historicalEvents: [
      {
        title: '황포탄(黃浦灘) 사건 (1922. 3. 28) - 의열단 3인조의 3단계 저격작전',
        desc: '일제 군벌 수장 다나카 기이치가 상하이에 도착하자, 의열단의 김익상(조선총독부 투탄 영웅), 오성륜, 이종암은 황포탄 세관 부두에서 3중 저격망을 펼쳤습니다. 비록 다나카가 기적적으로 피신했으나, 세계 언론이 집중된 상하이 심장부에서 "한국인은 일제 강점에 목숨 바쳐 항거하고 있다"는 자주독립의 의지를 온 세계에 천명했습니다.'
      }
    ],
    curriculumLinks: [
      {
        subject: '역사',
        title: '제국주의와 조계지, 의열 투쟁의 의의',
        description: '서구 열강의 조계지 형성 과정과 서양 석조 건축 양식을 이해하고, 의열단의 황포탄 투쟁 정신을 기립니다.',
        guideQuestion: '와이탄 황포탄 부두에서 거행된 의열단 3인조(김익상, 오성륜, 이종암)의 의거가 당시 국제 사회와 한국 독립운동사에 미친 파급 효과는 무엇일까요?'
      },
      {
        subject: '사회',
        title: '강을 사이에 둔 과거(와이탄)와 미래(푸둥)의 도시 경관 비교',
        description: '황푸강 서쪽의 100년 된 고전 건축군과 동쪽의 최첨단 스마트 마천루 스카이라인의 대비를 분석합니다.',
        guideQuestion: '황푸강 유람선을 타며 바라본 서쪽(와이탄)과 동쪽(푸둥)의 경관에서 느껴지는 도시의 변화와 시간의 켜를 비교 서술해 보세요.'
      }
    ],
    stampPhotoRequirement: '황푸강 유람선 위 또는 와이탄 제방에서 건너편 푸둥의 찬란한 야경을 배경으로 찍은 인증 사진'
  },
  {
    id: 'luxun_park',
    name: '루쉰공원 (윤봉길 의사 매헌 기념관)',
    chineseName: '鲁迅公园 (Lǔxùn Gōngyuán) / 梅轩',
    location: '상하이시 훙커우구 톈아이즈로',
    day: 2,
    dayLabel: '제2일차 (10.14 수)',
    timeSlot: '08:00 ~ 10:30',
    emoji: '🇰🇷',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    features: '과거 "홍커우 공원"으로 불리던 유서 깊은 도심 공원입니다. 중국 근현대 문학의 아버지인 루쉰(鲁迅)을 기리는 기념관과 묘소가 있으며, 공원 안쪽 매헌(梅軒)에는 윤봉길 의사의 흉상, 유품, 당시 의거 상황을 보존한 윤봉길 의사 기념관이 웅장하게 자리 잡고 있습니다.',
    koreaConnection: '1932년 4월 29일, 스물다섯 청년 윤봉길 의사가 일왕 생일 및 상하이 점령 전승 기념식이 열리던 식장에 물통 폭탄을 투척하여 일제 군관 수뇌부를 궤멸시킨 불멸의 의거 현장입니다. 장제스 총통이 "중국의 100만 대군도 해내지 못한 일을 한국의 한 청년이 해냈다"고 극찬하며 임시정부를 전폭 지원하게 된 결정적 계기가 되었습니다.',
    historicalEvents: [
      {
        title: '홍커우 공원 의거 (1932. 4. 29)',
        desc: '윤봉길 의사는 김구 선생이 이끈 한인애국단 소속으로, 폭탄을 도시락과 물통 모양으로 위장하여 식장에 잠입했습니다. 단상 위로 투척된 물통 폭탄은 침략군 총사령관 시라카와 대장과 노무라 중장 등을 쓰러뜨렸고, 침체되었던 임시정부와 한국 독립운동을 세계의 중심으로 부활시켰습니다.'
      }
    ],
    curriculumLinks: [
      {
        subject: '역사',
        title: '일제강점기 국외 독립운동과 한·중 연대의 물꼬',
        description: '윤봉길 의사의 의거가 대한민국 임시정부와 한중 합작 독립운동에 미친 결정적 파급 효과를 분석합니다.',
        guideQuestion: '윤봉길 의사의 의거가 당시 침체되어 있던 대한민국 임시정부에 어떤 결정적인 활력을 불어넣었는지 한중 연대 관점에서 설명해 보세요.'
      },
      {
        subject: '도덕',
        title: '윤봉길 의사께 바치는 추모와 감사 편지',
        description: '나라를 위해 25세 젊은 목숨을 바친 숭고한 희생정신과 평화의 가치를 되새깁니다.',
        guideQuestion: '매헌 기념관에 모셔진 윤봉길 의사의 영정 앞에서 느낀 엄숙한 감정과, 평화로운 대한민국을 살아가는 나의 다짐을 편지 형식으로 작성해 보세요.'
      },
      {
        subject: '미술',
        title: '매헌 기념관 방명록 등록 및 추모 포스터 구상',
        description: '역사적 인물의 기개와 숭고한 정신을 시각적 상징(태극기, 회중시계, 매화)으로 표현합니다.',
        guideQuestion: '매헌 기념관 방명록에 남길 문구와 함께, 윤봉길 의사를 상징하는 시각적 디자인 아이디어를 간략히 표현해 보세요.'
      }
    ],
    stampPhotoRequirement: '루쉰공원 내 매헌(윤봉길 의사 기념관) 정문 현판 또는 윤봉길 의사 흉상 앞 정숙한 추모 모습 인증 사진'
  },
  {
    id: 'prov_gov',
    name: '상하이 대한민국 임시정부청사',
    chineseName: '大韩民国临时政府旧址 (Dàhán Mínguó Línshí Zhèngfǔ Jiùzhǐ)',
    location: '상하이시 황푸구 마당로 306농 4호',
    day: 2,
    dayLabel: '제2일차 (10.14 수)',
    timeSlot: '10:30 ~ 12:00',
    emoji: '🏛️',
    image: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80',
    features: '상하이 신천지(신톈디) 근처 좁은 골목길에 자리한 3층짜리 붉은 벽돌 건물(스쿠먼 양식)입니다. 1926년부터 1932년 윤봉길 의거 직후까지 독립운동가들이 실제로 거주하며 정부 청사로 쓰던 보금자리로, 1층 회의실, 2층 김구 선생 집무실과 침실, 3층 요인 숙소와 부엌이 당시 그대로 보존되어 있습니다.',
    koreaConnection: '1919년 3·1 운동의 결실로 탄생한 대한민국 임시정부의 요람이자 뿌리입니다. 백범 김구 선생을 비롯한 선열들이 굶주림과 일제의 추적 속에서도 민주공화제의 기틀을 지켜낸 공간으로, 오늘날 대한민국 헌법 전문에 명시된 "3·1운동으로 건립된 대한민국임시정부의 법통"이 시작된 민족의 성지입니다.',
    historicalEvents: [
      {
        title: '백범 김구와 임시정부의 고난의 나날',
        desc: '어려운 재정 속에서도 한인애국단을 조직하고, 미주 동포들의 성금을 모아 독립운동을 지속했습니다. 김구 선생은 이곳 2층 작은 침실에서 나라 잃은 겨레의 아픔을 달래며 불후의 자서전 <백범일지> 상권을 집필하기 시작했습니다.'
      }
    ],
    curriculumLinks: [
      {
        subject: '역사',
        title: '대한민국 임시정부의 수립과 헌법적 법통의 뿌리',
        description: '임시정부 청사의 공간적 배치와 요인들의 치열했던 삶의 흔적을 통해 국가의 소중함을 배웁니다.',
        guideQuestion: '마당로 청사 좁은 계단과 작은 집무실을 둘러보며, 독립운동가들이 어떤 신념과 의지로 혹독한 환경을 버텼을지 느낀 점을 적어보세요.'
      },
      {
        subject: '국어',
        title: '<백범일지>와 청사 독립운동가에게 보내는 글',
        description: '백범 김구 선생의 <나의 소원>과 독립을 염원하던 애국지사들의 문학적 기록을 이해합니다.',
        guideQuestion: '김구 선생이 꿈꾸었던 "높은 문화의 힘을 가진 나라"와 오늘날 우리가 누리는 K-문화를 연결하여, 백범 선생님께 드리는 보고서를 적어보세요.'
      },
      {
        subject: '사회·도덕',
        title: '붉은 벽돌집에서 시작된 민주공화제의 가치',
        description: '왕정(대한제국)에서 민주공화정(대한민국)으로의 위대한 정치적 전환의 의미를 탐구합니다.',
        guideQuestion: '1919년 임시헌장 제1조 "대한민국은 민주공화제로 함"이 오늘날 우리 헌법 제1조에 어떻게 계승되었는지 토론해 보세요.'
      }
    ],
    stampPhotoRequirement: '상하이 마당로 대한민국 임시정부청사 입구의 현판 또는 붉은 벽돌 외관 앞 태극기/경건한 자세 인증 사진'
  },
  {
    id: 'oriental_pearl',
    name: '동방명주 & 도시계획전시관',
    chineseName: '东方明珠 (Dōngfāng Míngzhū) & 上海城市规划展示馆',
    location: '상하이시 푸둥신구 세기대도 / 인민광장',
    day: 2,
    dayLabel: '제2일차 (10.14 수)',
    timeSlot: '16:00 ~ 18:00',
    emoji: '🗼',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    features: '높이 468m에 달하는 초고층 방송탑으로, 동양의 진주라는 이름답게 크고 작은 11개의 구체(진주알)가 꿰어진 독창적인 디자인을 자랑합니다. 259m 투명 유리 전망대에서 발아래 도시를 조망할 수 있습니다. 상하이 도시계획전시관은 2050년까지의 상하이 스마트 시티 비전을 초대형 입체 디오라마와 AR/VR 기술로 보여줍니다.',
    koreaConnection: '1990년대 초 덩샤오핑의 개혁개방 선언 이후 갯벌에 불과했던 푸둥이 세계 1위의 금융 허브로 대변혁을 이룬 상징물입니다. 한국 기업들의 대중국 진출 거점이며, 첨단 건축과 미래 스마트 도시의 청사진을 직접 확인할 수 있습니다.',
    historicalEvents: [
      {
        title: '푸둥 개혁개방과 상하이의 비상',
        desc: '1992년 푸둥 신구 개발 개시 이후 불과 30여 년 만에 세계에서 가장 고층 건물이 밀집된 금융의 중심지로 변모한 중국 압축 성장의 살아있는 상징입니다.'
      }
    ],
    curriculumLinks: [
      {
        subject: '기술·가정/공학',
        title: '초고층 건축 구조와 내풍·내진 설계의 비밀',
        description: '468m 거탑이 강풍과 지진을 견디는 트러스 구조 및 중공 원기둥 구조의 공학적 원리를 학습합니다.',
        guideQuestion: '동방명주 타워의 독특한 구체(Sphere) 구조와 삼각 지지 기둥이 강한 태풍과 바람의 저항을 어떻게 분산시키는지 관찰해 보세요.'
      },
      {
        subject: '사회/지리',
        title: '개혁개방과 상하이 푸둥의 도시 공간 재편',
        description: '농경지였던 푸둥이 세계적 금융 중심지로 도약한 지리적 입지 요인과 공간 변화를 분석합니다.',
        guideQuestion: '도시계획전시관의 거대한 디오라마를 보고, 상하이가 미래 2050년을 향해 준비하는 친환경 녹지 축과 교통망의 특징을 정리해 보세요.'
      },
      {
        subject: '과학',
        title: '방송 통신 전파와 초고층 대기압의 원리',
        description: '고공 엘리베이터 승하강 시 귀가 먹먹해지는 대기압 차이와 전자기파 송수신의 원리를 탐구합니다.',
        guideQuestion: '지상에서 263m 전망대까지 초고속 엘리베이터가 오를 때 신체에 일어나는 기압 변화 현상을 과학적으로 서술해 보세요.'
      }
    ],
    stampPhotoRequirement: '동방명주 타워를 배경으로 올려다보는 각도 또는 259m 투명 유리 전망대 위 인증 사진'
  },
  {
    id: 'yu_garden',
    name: '예원 & 예원 옛거리',
    chineseName: '豫园 (Yùyuán) & 豫园老街',
    location: '상하이시 황푸구 안런가 218호',
    day: 2,
    dayLabel: '제2일차 (10.14 수)',
    timeSlot: '19:00 ~ 21:00',
    emoji: '🏮',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    features: '명나라 고위 관리 반윤단(潘允端)이 연로한 부모님의 평안하고 기쁜 노후를 위해 18년에 걸쳐 지은 명·청 시대 강남 정원의 최고봉입니다. "유열노친(愉悅老親, 부모님을 기쁘게 해 드린다)"에서 이름이 유래했습니다. 구곡교(아홉 번 꺾인 다리), 호심정(차관), 용벽(담장 위를 기어가는 용 조각)이 장관을 이룹니다.',
    koreaConnection: '과거 동아시아 해상 무역과 문화 교류의 중심지였던 명·청대 상하이 전통 문화를 간직하고 있습니다. 조선 후기 선비들이 추구했던 자연친화적 정원(예: 담양 소쇄원, 식영정)과 중국의 인공미가 강조된 강남 정원의 조경 철학을 비교 탐구할 수 있는 최고의 문화 현장입니다.',
    historicalEvents: [
      {
        title: '효심이 빚어낸 18년의 대공사 & 소도회(小刀會) 봉기',
        desc: '1559년 착공해 18년 만에 완성된 사가 정원으로, 1853년 태평천국 운동 당시 상하이의 반청 비밀결사 소도회가 본부로 삼아 격렬한 전투가 벌어졌던 역사적 무대이기도 합니다.'
      }
    ],
    curriculumLinks: [
      {
        subject: '미술/조경',
        title: '동양의 공간 미학과 차경(借景) 및 강남 정원 양식',
        description: '곡선미를 살린 누각, 기암괴석(태호석), 구곡교의 구조와 동양 조경 철학을 비교합니다.',
        guideQuestion: '우리 고장 담양의 대표 정원인 "소쇄원"의 자연 순응적 조경과 예원의 "정교한 인공 조형미(태호석, 구곡교)"를 비교하여 느낀 점을 적어보세요.'
      },
      {
        subject: '사회/역사',
        title: '명·청대 상하이 번영과 상인 문화',
        description: '예원 옛거리의 전통 상점가와 차 문화, 명나라 관료 사회의 생활상을 탐색합니다.',
        guideQuestion: '부모님을 위해 18년 동안 정원을 지은 반윤단의 효 사상을 현대적 관점에서 어떻게 평가할 수 있는지 생각해 보세요.'
      }
    ],
    stampPhotoRequirement: '예원 구곡교(九曲桥) 또는 호심정 앞, 혹은 용벽(龍壁) 조각을 배경으로 한 인증 사진'
  },
  {
    id: 'science_tech_museum',
    name: '상하이 과학기술관',
    chineseName: '上海科技馆 (Shànghǎi Kējìguǎn)',
    location: '상하이시 푸둥신구 세기대도 2000호',
    day: 3,
    dayLabel: '제3일차 (10.15 목)',
    timeSlot: '08:30 ~ 12:00',
    emoji: '🤖',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    features: '푸둥 센추리파크 옆에 자리한 중국 최대 규모의 첨단 과학기술 종합 전시관입니다. 로봇 세계(World of Robots), 인공지능(AI), 우주 탐사(Space Navigation), 지혜의 빛(물리학), 생명의 계곡 등 전체 전시물의 80% 이상이 방문자가 직접 조작하고 체험하는 인터랙티브 시설로 구성되어 있습니다.',
    koreaConnection: '4차 산업혁명과 AI 우주 강국으로 도약하려는 중국의 첨단 기초과학 및 응용기술 교육 현장입니다. 우리나라 국립중앙과학관, 과천과학관의 전시 체험과 비교하며 대한민국의 미래 과학기술 경쟁력과 진로를 모색할 수 있습니다.',
    historicalEvents: [
      {
        title: '미래를 여는 상하이 과학기술 혁신의 산실',
        desc: '2001년 APEC 정상회의를 기념하여 건립된 이후, 미래 세대에게 기초 과학의 즐거움과 첨단 AI 로봇 공학의 비전을 심어주는 동아시아 최고의 과학 교육 메카입니다.'
      }
    ],
    curriculumLinks: [
      {
        subject: '기술·가정/정보',
        title: '로봇 세상(World of Robots) & 휴머노이드 인공지능의 미래',
        description: '다양한 산업용·서비스용 로봇과 자율주행, AI 상호작용 알고리즘을 체험합니다.',
        guideQuestion: '직접 체험한 로봇 전시장(체스를 두는 로봇, 초상화를 그리는 로봇 등)에서 가장 인상 깊었던 기술과 그 기술이 바꿀 미래 직업을 적어보세요.'
      },
      {
        subject: '과학',
        title: '지혜의 빛(Light of Wisdom) & 물리학 법칙의 발견',
        description: '전자기 유도, 빛의 굴절과 반사, 에너지 보존 법칙 등 기초 물리학 원리를 직접 검증합니다.',
        guideQuestion: '과학기술관에서 직접 손으로 조작해 보며 교과서 속 물리학 원리(관성, 자기부상, 도르래 등)를 확인한 순간을 기록해 보세요.'
      },
      {
        subject: '과학/기술',
        title: '우주 탐사(Space Navigation) & 유인 우주선의 공학',
        description: '중국의 톈궁 우주정거장과 달·화성 탐사선 모형을 통해 항공우주 공학의 최신 트렌드를 파악합니다.',
        guideQuestion: '우주 탐사관에서 무중력 훈련 장치나 로켓 발사 시뮬레이션을 보며 느낀 항공우주 산업의 중요성을 서술해 보세요.'
      }
    ],
    stampPhotoRequirement: '상하이 과학기술관 로봇 전시관의 로봇 또는 우주탐사선 모형 앞에서 찍은 생동감 있는 체험 인증 사진'
  },
  {
    id: 'disneyland',
    name: '상하이 디즈니랜드',
    chineseName: '上海迪士尼乐园 (Shànghǎi Díshìní Lèyuán)',
    location: '상하이시 푸둥신구 촨사신진',
    day: 3,
    dayLabel: '제3일차 (10.15 목)',
    timeSlot: '13:00 ~ 21:30',
    emoji: '🏰',
    image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80',
    features: '2016년 개장한 아시아 최대 규모의 디즈니 테마파크입니다. 전 세계 디즈니랜드 중 가장 웅장한 높이 60m의 "마법의 성(Enchanted Storybook Castle)"을 자랑하며, 세계 최초로 도입된 트론(TRON Lightcycle Power Run) 롤러코스터와 캐리비안의 해적 배틀 어트랙션 등 최첨단 라이드 엔지니어링 기술이 집약되어 있습니다.',
    koreaConnection: '글로벌 엔터테인먼트 및 팝컬처 소비의 최전선입니다. 한국의 K-컬처(웹툰, 영화, K-POP) 콘텐츠 산업과 디즈니의 강력한 스토리텔링 및 캐릭터 IP 산업을 비교 분석하고, 글로벌 문화 콘텐츠의 현지화(Glocalization) 전략을 배울 수 있습니다.',
    historicalEvents: [
      {
        title: '서양 테마파크와 중국 전통 문화의 융합 (Authentically Disney, Distinctly Chinese)',
        desc: '디즈니 고유의 세계관에 12간지 정원, 중국 전통 건축 미학을 결합하여 현지화에 성공한 대표적인 글로벌 문화 교류 프로젝트입니다.'
      }
    ],
    curriculumLinks: [
      {
        subject: '사회/경제',
        title: '글로벌 콘텐츠 산업과 문화적 현지화(Glocalization)',
        description: '월트 디즈니의 캐릭터 IP가 국가와 문화를 넘어 어떻게 대중을 사로잡는지 경제적 파급 효과를 분석합니다.',
        guideQuestion: '상하이 디즈니랜드 곳곳에서 발견할 수 있는 "중국 문화적 요소(건축 디자인, 음식, 12지신 캐릭터 등)" 현지화 전략을 찾아 분석해 보세요.'
      },
      {
        subject: '기술·가정/물리',
        title: '첨단 엔터테인먼트 공학 (Ride Engineering)과 자기부상 롤러코스터',
        description: '트론 라이트사이클의 선형 모터 가속 원리와 4D 영상 음향 시뮬레이션 기술을 탐구합니다.',
        guideQuestion: '어트랙션을 탑승하며 온몸으로 느낀 속도감, 원심력, 가속도 및 디지털 프로젝션 맵핑 기술의 몰입감을 공학적으로 설명해 보세요.'
      },
      {
        subject: '미술/국어',
        title: '스토리텔링과 캐릭터·공간 디자인의 마법',
        description: '단순한 놀이기구를 하나의 서사적 모험으로 탈바꿈시키는 스토리텔링과 야간 불꽃놀이 쇼의 연출 미학을 감상합니다.',
        guideQuestion: '야간 마법의 성 일루미네이션 쇼(빛, 레이저, 분수, 음악)를 관람하고, 관객의 마음을 움직이는 콘텐츠 스토리텔링의 핵심 요소를 적어보세요.'
      }
    ],
    stampPhotoRequirement: '상하이 디즈니랜드 마법의 성(Enchanted Storybook Castle)을 배경으로 모둠원들과 함께 찍은 신나는 인증 사진'
  }
];

export const IMMIGRATION_QUESTIONS: ImmigrationQuestion[] = [
  {
    id: 'imm-1',
    question: 'May I see your passport and boarding pass, please?',
    koreanMeaning: '여권과 탑승권을 보여주시겠습니까?',
    sampleAnswer: 'Here you are, sir/ma\'am.',
    answerKorean: '여기 있습니다.',
    tips: '여권 커버를 벗기고 입국신고서와 함께 공손하게 양손으로 건넵니다.',
    audioText: 'May I see your passport and boarding pass, please?'
  },
  {
    id: 'imm-2',
    question: 'What is the purpose of your visit to China?',
    koreanMeaning: '중국 방문 목적이 무엇입니까?',
    sampleAnswer: 'I am here for a school history and culture study tour.',
    answerKorean: '학교 역사문화 탐방차 왔습니다.',
    tips: '"Study tour" 또는 "Sightseeing"(관광)이라고 당당하게 대답하세요.',
    audioText: 'What is the purpose of your visit to China?'
  },
  {
    id: 'imm-3',
    question: 'How long will you be staying in Shanghai?',
    koreanMeaning: '상하이에서 며칠 동안 머무를 예정인가요?',
    sampleAnswer: 'We are staying for 4 days and 3 nights.',
    answerKorean: '3박 4일 동안 머무릅니다.',
    tips: '출정표대로 "Four days"라고 간단명료하게 말하면 됩니다.',
    audioText: 'How long will you be staying in Shanghai?'
  },
  {
    id: 'imm-4',
    question: 'Where will you be staying?',
    koreanMeaning: '어디에 머무르실 예정인가요?',
    sampleAnswer: 'At the Renaissance Shanghai Putuo Hotel.',
    answerKorean: '르네상스 상하이 푸퉈 호텔입니다.',
    tips: '호텔 바우처나 명함을 보여주면 가장 정확하고 빠릅니다.',
    audioText: 'Where will you be staying?'
  },
  {
    id: 'imm-5',
    question: 'Are you traveling alone or with a group?',
    koreanMeaning: '혼자 여행하시나요, 아니면 단체로 오셨나요?',
    sampleAnswer: 'I am traveling with my middle school group and teachers.',
    answerKorean: '중학교 단체 및 인솔 선생님들과 함께 왔습니다.',
    tips: '"With my school group"이라고 대답하고 뒤쪽 선생님을 가리키셔도 좋습니다.',
    audioText: 'Are you traveling alone or with a group?'
  },
  {
    id: 'imm-6',
    question: 'Please place your fingers on the scanner and look at the camera.',
    koreanMeaning: '지문 스캐너에 손가락을 올리고 카메라를 쳐다봐 주세요.',
    sampleAnswer: 'Okay, thank you.',
    answerKorean: '네, 알겠습니다.',
    tips: '녹색 불이 들어올 때까지 지문을 밀착하고 안경/모자를 잠시 벗습니다.',
    audioText: 'Please place your fingers on the scanner and look at the camera.'
  },
  {
    id: 'imm-7',
    question: 'Do you have a return ticket back to Korea?',
    koreanMeaning: '한국으로 돌아가는 귀국 항공권이 있습니까?',
    sampleAnswer: 'Yes, here is my return e-ticket for October 16th.',
    answerKorean: '네, 10월 16일 귀국 전자 항공권 여기 있습니다.',
    tips: '미리 출력해 둔 e-ticket 또는 일정표를 보여줍니다.',
    audioText: 'Do you have a return ticket back to Korea?'
  },
  {
    id: 'imm-8',
    question: 'Do you have anything to declare?',
    koreanMeaning: '세관에 신고할 물품이 있습니까?',
    sampleAnswer: 'No, I have nothing to declare.',
    answerKorean: '아니요, 신고할 물품이 없습니다.',
    tips: '개인 소지품과 학용품만 있으므로 "Nothing to declare"라고 답합니다.',
    audioText: 'Do you have anything to declare?'
  }
];

export const CHINESE_PHRASES: PhraseItem[] = [
  {
    id: 'ch-1',
    category: '인사/기본',
    chinese: '你好！',
    pinyin: 'Nǐ hǎo!',
    koreanPronunciation: '니하오!',
    meaning: '안녕하세요!',
    tip: '가장 기본적인 인사말로 언제든 사용 가능합니다.'
  },
  {
    id: 'ch-2',
    category: '인사/기본',
    chinese: '谢谢！/ 不客气。',
    pinyin: 'Xièxie! / Bù kèqi.',
    koreanPronunciation: '씨에씨에! / 부커치.',
    meaning: '감사합니다! / 천만에요.',
    tip: '도움을 받았을 때 미소와 함께 사용해 보세요.'
  },
  {
    id: 'ch-3',
    category: '인사/기본',
    chinese: '对不起，请问...',
    pinyin: 'Duìbuqǐ, qǐngwèn...',
    koreanPronunciation: '뚜이부치, 칭원...',
    meaning: '죄송합니다, 말씀 좀 여쭐게요...',
    tip: '현지인에게 질문하거나 도움을 청할 때 예의 바른 표현입니다.'
  },
  {
    id: 'ch-4',
    category: '인사/기본',
    chinese: '再见！',
    pinyin: 'Zàijiàn!',
    koreanPronunciation: '짜이지엔!',
    meaning: '또 만나요! (안녕히 계세요/가세요)',
    tip: '헤어질 때 사용하는 기본 작별 인사입니다.'
  },
  {
    id: 'ch-5',
    category: '식당/음식',
    chinese: '服务员，买单！',
    pinyin: 'Fúwùyuán, mǎidān!',
    koreanPronunciation: '푸우위안, 마이딴!',
    meaning: '여기요(직원분), 계산해 주세요!',
    tip: '식사를 마치고 자리에서 계산을 요청할 때 씁니다.'
  },
  {
    id: 'ch-6',
    category: '식당/음식',
    chinese: '不要香菜。',
    pinyin: 'Bú yào xiāngcài.',
    koreanPronunciation: '부 야오 시앙차이.',
    meaning: '고수(향채)는 넣지 말아 주세요.',
    tip: '향이 강한 고수를 빼고 싶을 때 필수 암기 문장!'
  },
  {
    id: 'ch-7',
    category: '식당/음식',
    chinese: '这个很好吃！',
    pinyin: 'Zhèige hěn hǎochī!',
    koreanPronunciation: '쩌이거 헌 하오츠!',
    meaning: '이거 정말 맛있어요!',
    tip: '식당 주인이나 요리사에게 칭찬할 때 기분 좋은 한마디입니다.'
  },
  {
    id: 'ch-8',
    category: '식당/음식',
    chinese: '请给我一杯温水。',
    pinyin: 'Qǐng gěi wǒ yì bēi wēn shuǐ.',
    koreanPronunciation: '칭 게이 워 이 뻬이 원 슈이.',
    meaning: '따뜻한 물(미온수) 한 잔 주세요.',
    tip: '중국은 기본적으로 뜨거운 차가 나오므로 찬물은 "빙슈이(冰水)"를 요청하세요.'
  },
  {
    id: 'ch-9',
    category: '길찾기/교통',
    chinese: '请问，洗手间在哪里？',
    pinyin: 'Qǐngwèn, xǐshǒujiān zài nǎlǐ?',
    koreanPronunciation: '칭원, 시쇼우지엔 짜이 나리?',
    meaning: '말씀 좀 여쭐게요, 화장실이 어디에 있나요?',
    tip: '여행 중 가장 위급할 때 바로 쓰일 수 있는 골든 문장입니다.'
  },
  {
    id: 'ch-10',
    category: '길찾기/교통',
    chinese: '去地铁站怎么走？',
    pinyin: 'Qù dìtiězhàn zěnme zǒu?',
    koreanPronunciation: '취 띠티에잔 쩐머 저우?',
    meaning: '지하철역으로 가려면 어떻게 가나요?',
    tip: '상하이는 지하철 망이 아주 발달해 있습니다.'
  },
  {
    id: 'ch-11',
    category: '길찾기/교통',
    chinese: '请送我到这个地址。',
    pinyin: 'Qǐng sòng wǒ dào zhèige dìzhǐ.',
    koreanPronunciation: '칭 쏭 워 따오 쩌이거 띠즈.',
    meaning: '이 주소로 데려다 주세요.',
    tip: '택시 기사님께 호텔 카드나 스마트폰 지도를 보여주며 말합니다.'
  },
  {
    id: 'ch-12',
    category: '쇼핑/흥정',
    chinese: '这个多少钱？',
    pinyin: 'Zhèige duōshao qián?',
    koreanPronunciation: '쩌이거 뚜어샤오 치엔?',
    meaning: '이거 얼마인가요?',
    tip: '기념품 가게에서 가격을 물을 때 손가락으로 물건을 가리키며 씁니다.'
  },
  {
    id: 'ch-13',
    category: '쇼핑/흥정',
    chinese: '太贵了，可以便宜一点吗？',
    pinyin: 'Tài guì le, kěyǐ piányi yìdiǎn ma?',
    koreanPronunciation: '타이 꾸이 러, 커이 피엔이 이디엔 마?',
    meaning: '너무 비싸요, 조금만 깎아주실 수 있나요?',
    tip: '예원 옛거리나 재래 상점에서 흥정할 때 애교 섞인 표정으로 도전!'
  },
  {
    id: 'ch-14',
    category: '쇼핑/흥정',
    chinese: '可以刷卡/微信/支付宝吗？',
    pinyin: 'Kěyǐ shuākǎ / Wēixìn / Zhīfùbǎo ma?',
    koreanPronunciation: '커이 슈아카 / 웨이신 / 즈푸바오 마?',
    meaning: '카드/위챗페이/알리페이로 결제 되나요?',
    tip: '중국은 모바일 페이(알리페이, 위챗페이)가 대세입니다.'
  },
  {
    id: 'ch-15',
    category: '긴급/호텔',
    chinese: '我是韩国人，我迷路了。',
    pinyin: 'Wǒ shì Hánguórén, wǒ mílù le.',
    koreanPronunciation: '워 스 한궈런, 워 미루 러.',
    meaning: '저는 한국인입니다, 길을 잃었어요.',
    tip: '경찰(공안)이나 안내소 직원에게 인솔 선생님 연락처와 함께 보여주세요.'
  },
  {
    id: 'ch-16',
    category: '긴급/호텔',
    chinese: '请帮我联系我的老师。',
    pinyin: 'Qǐng bāng wǒ liánxì wǒ de lǎoshī.',
    koreanPronunciation: '칭 빵 워 리엔시 워 더 라오스.',
    meaning: '제 인솔 선생님께 연락해 주실 수 있나요?',
    tip: '이름표 뒷면에 적힌 한국 인솔 교사의 전화번호를 보여주세요.'
  }
];

export const INITIAL_WEATHER_RECORDS: WeatherRecord[] = [
  {
    day: 1,
    date: '2026. 10. 13 (화)',
    city: '상하이 (푸동/황푸구)',
    forecast: '맑음 후 쾌청 ☀️',
    morningTemp: 16,
    afternoonTemp: 23,
    humidity: 58,
    clothingNotes: '낮에는 쾌적하고 온화하나 황푸강 강바람이 불어오는 야경 투어 시 쌀쌀하므로 얇은 바람막이나 가디건 필수 지참.',
    studentInvestigation: '상하이의 10월은 강남 온대 몬순 기후의 전형으로 가을 날씨가 매우 청명합니다. 양쯔강 하구에 위치하여 해양성 기후 영향을 받아 일교차가 약 7도 내외로 쾌적합니다.'
  },
  {
    day: 2,
    date: '2026. 10. 14 (수)',
    city: '상하이 (훙커우/황푸구)',
    forecast: '구름 조금 ⛅',
    morningTemp: 17,
    afternoonTemp: 24,
    humidity: 62,
    clothingNotes: '도보 이동(루쉰공원, 신천지 골목, 예원 정원)이 가장 많은 날이므로 편안한 운동화와 가벼운 긴소매 셔츠 추천.',
    studentInvestigation: '비올 확률은 10% 미만으로 도보 답사에 최적의 기상 조건입니다. 높은 빌딩숲(마천루 열섬 효과)과 수변 정원의 미기후 차이를 체감할 수 있습니다.'
  },
  {
    day: 3,
    date: '2026. 10. 15 (목)',
    city: '상하이 (푸동 센추리/디즈니랜드)',
    forecast: '맑고 따스함 🌤️',
    morningTemp: 15,
    afternoonTemp: 22,
    humidity: 55,
    clothingNotes: '야외 디즈니랜드에서 밤 9시 30분 불꽃놀이 쇼까지 장시간 머무르므로 보온용 경량 패딩이나 도톰한 점퍼 준비.',
    studentInvestigation: '푸둥 외곽 촨사 지구는 도심 황푸구에 비해 주변이 평야 지대라 밤이 되면 복사 냉각으로 기온이 급격히 내려갑니다.'
  },
  {
    day: 4,
    date: '2026. 10. 16 (금)',
    city: '상하이 ➔ 인천 ➔ 담양',
    forecast: '맑고 상쾌함 ☀️',
    morningTemp: 14,
    afternoonTemp: 21,
    humidity: 50,
    clothingNotes: '귀국 항공기 내 에어컨 바람과 담양 도착 시 저녁 늦은 기온을 고려해 편안하고 포근한 트레이닝복 복장.',
    studentInvestigation: '고기압의 영향권에 들어 귀국 비행기 비행 시 난기류 발생 가능성이 낮아 안정적인 비행 환경이 예상됩니다.'
  }
];

export const BOOK_ACTIVITY_BACKGROUND = {
  bookTitle: '맞바꾼 회중시계',
  author: '김남중 글 / 역사동화',
  historicalBackground: '1932년 4월 29일 새벽, 상하이 프랑스 조계의 김해련(독립운동가) 집. 아침 7시 거사를 앞둔 윤봉길 의사는 김구 선생과 마지막 아침 식사를 나눈 뒤 자신의 6원짜리 고급 회중시계를 꺼내어 백범의 낡은 2원짜리 회중시계와 바꾸자고 청합니다.',
  famousQuote: '"제 시계는 6원을 주고 산 것인데 선생님 시계는 2원짜리입니다. 저는 이제 한 시간밖에 더 쓸모가 없습니다. 이 시계를 차시고 부디 조국의 독립을 이루어 주십시오."',
  kimGooResponse: '백범 김구 선생은 눈물을 삼키며 윤봉길 의사의 손을 잡고 말했습니다. "후일 지하에서 만납시다." 두 분의 회중시계는 지금 등록문화재 제441호와 제442호로 지정되어 대한민국 역사의 위대한 증표로 남아있습니다.'
};
