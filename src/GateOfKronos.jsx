import React, { useState, useEffect } from 'react';
import {
  Swords, Sparkles, Users, Plus, Trash2, Upload, Download,
  Play, Lock, Layers, AlertTriangle, CheckCircle2,
  Settings, FolderOpen, Copy, X, Zap, Flame, Award, Undo2
} from 'lucide-react';
import { db, isFirebaseConfigured, doc, setDoc, getDoc, onSnapshot } from './firebase';

// ============================================================================
// CONSTANTS & DEFINITIONS (GATE OF KRONOS THEME - THAI)
// ============================================================================
const ANIME_SERIES = [
  'One Piece',
  'Naruto',
  'Dragon Ball',
  'Bleach',
  "JoJo's Bizarre Adventure",
  'Crossover / Neutral'
];

const CARD_CATEGORIES = [
  { id: 'Hero', label: 'Hero (ฮีโร่ & การ์ดประจำตัว)' },
  { id: 'Aspect', label: 'Aspect & Basics (สายพลัง & การ์ดพื้นฐาน)' },
  { id: 'Scenario', label: 'Scenario (วายร้าย & แผนการหลัก)' },
  { id: 'Side', label: 'Side / Modular (ชุดเสริมเผชิญภัย)' }
];

const ASPECTS = [
  { id: 'HeroKit', label: 'ชุดประจำตัวฮีโร่' },
  { id: 'Aggression', label: 'Aggression (ดุดัน)' },
  { id: 'Justice', label: 'Justice (ยุติธรรม)' },
  { id: 'Leadership', label: 'Leadership (ผู้นำ)' },
  { id: 'Protection', label: 'Protection (ป้องกัน)' },
  { id: 'Basics', label: 'Basics (พื้นฐาน)' },
  { id: 'Encounter', label: 'Encounter (เผชิญภัย)' }
];

const CARD_TYPES = [
  'ร่างฮีโร่ (Hero)',
  'ร่างพลเรือน (Alter-Ego)',
  'พันธมิตร (Ally)',
  'เหตุการณ์ (Event)',
  'อัปเกรด (Upgrade)',
  'สนับสนุน (Support)',
  'ทรัพยากร (Resource)',
  'ภาระผูกพัน (Obligation)',
  'วายร้าย (Villain)',
  'แผนการหลัก (Main Scheme)',
  'แผนการรอง (Side Scheme)',
  'ลูกสมุน (Minion)',
  'การทรยศ (Treachery)',
  'อุปกรณ์เสริม (Attachment)'
];

// Dynamic field schema per Card Type so only relevant fields show up
const TYPE_FIELD_CONFIG = {
  'ร่างฮีโร่ (Hero)': {
    showCost: false,
    showThw: true,
    showAtk: true,
    showDef: true,
    showRec: false,
    showSch: false,
    showHp: true,
    showHandSize: true,
    showConsequentialDamage: false,
    showResources: false,
    showBoost: false,
    showSchemeFields: false,
    showMaxCopies: false
  },
  'ร่างพลเรือน (Alter-Ego)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: true,
    showSch: false,
    showHp: true,
    showHandSize: true,
    showConsequentialDamage: false,
    showResources: false,
    showBoost: false,
    showSchemeFields: false,
    showMaxCopies: false
  },
  'พันธมิตร (Ally)': {
    showCost: true,
    showThw: true,
    showAtk: true,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: true,
    showHandSize: false,
    showConsequentialDamage: true,
    showResources: true,
    showBoost: false,
    showSchemeFields: false,
    showMaxCopies: true
  },
  'เหตุการณ์ (Event)': {
    showCost: true,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showHandSize: false,
    showConsequentialDamage: false,
    showResources: true,
    showBoost: false,
    showSchemeFields: false,
    showMaxCopies: true
  },
  'อัปเกรด (Upgrade)': {
    showCost: true,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showHandSize: false,
    showConsequentialDamage: false,
    showResources: true,
    showBoost: false,
    showSchemeFields: false,
    showMaxCopies: true
  },
  'สนับสนุน (Support)': {
    showCost: true,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showHandSize: false,
    showConsequentialDamage: false,
    showResources: true,
    showBoost: false,
    showSchemeFields: false,
    showMaxCopies: true
  },
  'ทรัพยากร (Resource)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showHandSize: false,
    showConsequentialDamage: false,
    showResources: true,
    showBoost: false,
    showSchemeFields: false,
    showMaxCopies: true
  },
  'ภาระผูกพัน (Obligation)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showHandSize: false,
    showConsequentialDamage: false,
    showResources: false,
    showBoost: false,
    showSchemeFields: false,
    showMaxCopies: true
  },
  'วายร้าย (Villain)': {
    showCost: false,
    showThw: false,
    showAtk: true,
    showDef: false,
    showRec: false,
    showSch: true,
    showHp: true,
    showHandSize: false,
    showConsequentialDamage: false,
    showResources: false,
    showBoost: false,
    showSchemeFields: true,
    showMaxCopies: false
  },
  'แผนการหลัก (Main Scheme)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showHandSize: false,
    showConsequentialDamage: false,
    showResources: false,
    showBoost: false,
    showSchemeFields: true,
    showMaxCopies: false
  },
  'แผนการรอง (Side Scheme)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showHandSize: false,
    showConsequentialDamage: false,
    showResources: false,
    showBoost: false,
    showSchemeFields: true,
    showMaxCopies: true
  },
  'ลูกสมุน (Minion)': {
    showCost: false,
    showThw: false,
    showAtk: true,
    showDef: false,
    showRec: false,
    showSch: true,
    showHp: true,
    showHandSize: false,
    showConsequentialDamage: false,
    showResources: false,
    showBoost: true,
    showSchemeFields: false,
    showMaxCopies: true
  },
  'การทรยศ (Treachery)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showHandSize: false,
    showConsequentialDamage: false,
    showResources: false,
    showBoost: true,
    showSchemeFields: false,
    showMaxCopies: true
  },
  'อุปกรณ์เสริม (Attachment)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showHandSize: false,
    showConsequentialDamage: false,
    showResources: false,
    showBoost: true,
    showSchemeFields: false,
    showMaxCopies: true
  }
};

const TRIGGER_TIMINGS = [
  { id: 'None', label: 'ไม่มี / ใช้งานทั่วไป (Passive / Manual)' },
  { id: 'Action', label: 'แอ็กชัน (Action)' },
  { id: 'HeroAction', label: 'แอ็กชันร่างฮีโร่ (Hero Action)' },
  { id: 'AlterEgoAction', label: 'แอ็กชันร่างพลเรือน (Alter-Ego Action)' },
  { id: 'Interrupt', label: 'ขัดจังหวะ (Interrupt)' },
  { id: 'ForcedInterrupt', label: 'บังคับขัดจังหวะ (Forced Interrupt)' },
  { id: 'Response', label: 'ตอบสนอง (Response)' },
  { id: 'ForcedResponse', label: 'บังคับตอบสนอง (Forced Response)' },
  { id: 'WhenRevealed', label: 'เมื่อเปิดเผย (When Revealed)' }
];

const TRIGGER_EVENTS = [
  { id: 'manual', label: 'กดใช้งานเองในเทิร์น (Manual Action)' },
  { id: 'change_form_hero', label: 'เมื่อเปลี่ยนเป็นร่างฮีโร่' },
  { id: 'change_form_alter', label: 'เมื่อเปลี่ยนเป็นร่างพลเรือน' },
  { id: 'enemy_attacks', label: 'เมื่อวายร้ายหรือลูกสมุนกำลังจะโจมตี' },
  { id: 'enemy_attack_resolved', label: 'หลังจากศัตรูโจมตีเสร็จสิ้น' },
  { id: 'hero_attacks', label: 'เมื่อฮีโร่หรือพันธมิตรโจมตี' },
  { id: 'hero_thwarts', label: 'เมื่อฮีโร่หรือพันธมิตรขัดขวาง (Thwart)' },
  { id: 'threat_added', label: 'เมื่อกำลังจะเพิ่มแต้มภัยคุกคามลงบนแผนการ' },
  { id: 'damage_taken', label: 'เมื่อตัวละครได้รับความเสียหาย' },
  { id: 'enemy_defeated', label: 'เมื่อกำจัดศัตรูได้' },
  { id: 'treachery_revealed', label: 'เมื่อเปิดเผยการ์ดทรยศ / เผชิญภัย' },
  { id: 'card_drawn', label: 'เมื่อจั่วการ์ด' }
];

const EFFECT_ACTIONS = [
  { id: 'custom', label: 'แสดงข้อความเตือนและให้ผู้เล่นปรับค่าเอง (Manual Resolve)' },
  { id: 'deal_damage_villain', label: 'ทำความเสียหายให้วายร้าย' },
  { id: 'deal_damage_all', label: 'ทำความเสียหายให้ศัตรูทุกตัว' },
  { id: 'remove_threat_main', label: 'ลบแต้มภัยคุกคามจากแผนการหลัก' },
  { id: 'heal_hero', label: 'ฟื้นฟูพลังชีวิตให้ฮีโร่' },
  { id: 'draw_cards', label: 'จั่วการ์ดขึ้นมือ' },
  { id: 'stun_villain', label: 'มอบสถานะ มึนงง (Stunned) ให้วายร้าย' },
  { id: 'confuse_villain', label: 'มอบสถานะ สับสน (Confused) ให้วายร้าย' },
  { id: 'tough_hero', label: 'มอบสถานะ คงกระพัน (Tough) ให้ฮีโร่' },
  { id: 'prevent_threat', label: 'ป้องกัน/ลดแต้มภัยคุกคาม 1 แต้ม' }
];

const STORAGE_KEYS = {
  CARDS: 'gok_card_database_v1',
  STARTERS: 'gok_starter_decks_v1',
  CUSTOM_DECKS: 'gok_custom_decks_v1',
  ROOMS: 'gok_local_rooms_v1'
};

const emptyCardForm = {
  id: '',
  name: '',
  subTitle: '',
  series: 'One Piece',
  category: 'Hero',
  aspect: 'HeroKit',
  heroOwner: '',
  setGroup: '',
  type: 'พันธมิตร (Ally)',
  stage: '1',
  cost: 0,
  thw: 0,
  atk: 0,
  def: 0,
  rec: 0,
  sch: 0,
  hp: 3,
  hpPerPlayer: false,
  handSize: 5,
  consequentialDamage: 1,
  threatBase: 0,
  threatThreshold: 10,
  threatPerPlayer: true,
  resources: { red: 0, blue: 0, yellow: 0, wild: 0 },
  boostIcons: 0,
  traits: '',
  text: '',
  maxCopies: 1,
  imageUrl: '',
  triggerTiming: 'None',
  triggerEvent: 'manual',
  triggerCondition: '',
  triggerCostType: 'none',
  effectAction: 'custom',
  effectValue: 1
};

const uid = () => Math.random().toString(36).substring(2, 10);
const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function GateOfKronos() {
  const [activeTab, setActiveTab] = useState('lobby');
  const [cards, setCards] = useState([]);
  const [starterDecks, setStarterDecks] = useState([]);
  const [customDecks, setCustomDecks] = useState([]);

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('gok_player_name') || 'ผู้เล่น 1');
  const [playerId] = useState(() => {
    const saved = sessionStorage.getItem('gok_pid');
    if (saved) return saved;
    const id = 'P-' + uid().toUpperCase();
    sessionStorage.setItem('gok_pid', id);
    return id;
  });

  const [roomCode, setRoomCode] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [selectedDeckSource, setSelectedDeckSource] = useState('starter');
  const [selectedDeckId, setSelectedDeckId] = useState('');

  const [selectedVillainGroup, setSelectedVillainGroup] = useState('');
  const [difficulty, setDifficulty] = useState('normal');
  const [selectedSides, setSelectedSides] = useState([]);

  const [undoStack, setUndoStack] = useState([]);
  const [undoLockedReason, setUndoLockedReason] = useState('');
  const [activeTriggers, setActiveTriggers] = useState([]);
  const [inspectedCard, setInspectedCard] = useState(null);
  const [viewingPlayerId, setViewingPlayerId] = useState(null);

  useEffect(() => {
    try {
      setCards(JSON.parse(localStorage.getItem(STORAGE_KEYS.CARDS) || '[]'));
      setStarterDecks(JSON.parse(localStorage.getItem(STORAGE_KEYS.STARTERS) || '[]'));
      setCustomDecks(JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_DECKS) || '[]'));
    } catch (e) {
      console.error('Failed to load local database:', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gok_player_name', playerName);
  }, [playerName]);

  const saveCardDatabase = (updatedCards) => {
    setCards(updatedCards);
    try {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(updatedCards));
    } catch (e) {
      alert('พื้นที่จัดเก็บเบราว์เซอร์เต็ม แนะนำให้ย่อขนาดไฟล์รูปภาพหรือกด Export JSON เก็บไว้ครับ');
    }
  };

  const saveStarterDecks = (updated) => {
    setStarterDecks(updated);
    localStorage.setItem(STORAGE_KEYS.STARTERS, JSON.stringify(updated));
  };

  const saveCustomDecks = (updated) => {
    setCustomDecks(updated);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(updated));
  };

  useEffect(() => {
    if (!roomCode) return;

    if (isFirebaseConfigured && db) {
      const unsub = onSnapshot(doc(db, 'gok_rooms', roomCode), (snap) => {
        if (snap.exists()) setRoomData(snap.data());
      });
      return () => unsub();
    } else {
      const loadLocalRoom = () => {
        const rooms = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '{}');
        if (rooms[roomCode]) setRoomData(rooms[roomCode]);
      };
      loadLocalRoom();
      const onStorage = (e) => {
        if (e.key === STORAGE_KEYS.ROOMS) loadLocalRoom();
      };
      window.addEventListener('storage', onStorage);
      const interval = setInterval(loadLocalRoom, 1000);
      return () => {
        window.removeEventListener('storage', onStorage);
        clearInterval(interval);
      };
    }
  }, [roomCode]);

  const persistRoomState = async (newState, undoMeta = { type: 'reversible' }) => {
    if (roomData) {
      if (undoMeta.type === 'reversible') {
        setUndoStack((prev) => [...prev.slice(-14), JSON.parse(JSON.stringify(roomData))]);
        setUndoLockedReason('');
      } else if (undoMeta.type === 'irreversible') {
        setUndoStack([]);
        setUndoLockedReason(undoMeta.reason || 'มีการเปิดเผยข้อมูลลับหรือจั่วการ์ดแล้ว ไม่สามารถย้อนกลับได้');
      }
    }

    setRoomData(newState);
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'gok_rooms', newState.code), newState);
    } else {
      const rooms = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '{}');
      rooms[newState.code] = newState;
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    }
  };

  const handleUndo = async () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));

    const restoredState = {
      ...previousState,
      logs: [
        ...(previousState.logs || []),
        { id: uid(), time: new Date().toLocaleTimeString('th-TH'), text: `↩️ ${playerName} ย้อนกลับการกระทำล่าสุด (Fair Undo)` }
      ]
    };
    setRoomData(restoredState);
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'gok_rooms', restoredState.code), restoredState);
    } else {
      const rooms = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '{}');
      rooms[restoredState.code] = restoredState;
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    }
  };

  const fireGameEvent = (eventId, contextLabel) => {
    if (!roomData || !roomData.players) return;
    const me = roomData.players[playerId];
    if (!me) return;

    const myCardsToScan = [
      ...(me.hand || []).map((c) => ({ ...c, zone: 'มือ' })),
      ...(me.playArea || []).map((c) => ({ ...c, zone: 'สนาม' })),
      ...(me.identity ? [{ ...me.identity, zone: 'ตัวละครหลัก' }] : [])
    ];

    const matched = myCardsToScan.filter((card) => {
      const isInterruptOrResponse = ['Interrupt', 'ForcedInterrupt', 'Response', 'ForcedResponse'].includes(card.triggerTiming);
      return isInterruptOrResponse && card.triggerEvent === eventId;
    });

    if (matched.length > 0) {
      setActiveTriggers((prev) => [
        ...prev,
        ...matched.map((card) => ({ alertId: uid(), eventId, contextLabel, card }))
      ]);
    }
  };

  const createRoom = async () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const initialRoom = {
      code,
      hostId: playerId,
      status: 'waiting',
      scenario: { villainGroup: selectedVillainGroup, difficulty, sides: selectedSides },
      players: {
        [playerId]: { id: playerId, name: playerName, ready: false, deckId: '', deckSource: 'starter' }
      },
      table: null,
      logs: [{ id: uid(), time: new Date().toLocaleTimeString('th-TH'), text: `สร้างห้อง ${code} โดย ${playerName}` }]
    };
    setRoomCode(code);
    setUndoStack([]);
    setUndoLockedReason('');
    await persistRoomState(initialRoom, { type: 'none' });
  };

  const joinRoom = async () => {
    const code = joinInput.trim().toUpperCase();
    if (!code) return;

    let targetRoom = null;
    if (isFirebaseConfigured && db) {
      const snap = await getDoc(doc(db, 'gok_rooms', code));
      if (snap.exists()) targetRoom = snap.data();
    } else {
      const rooms = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '{}');
      targetRoom = rooms[code];
    }

    if (!targetRoom) {
      alert('ไม่พบห้องหมายเลขนี้ กรุณาตรวจสอบรหัสห้องอีกครั้ง');
      return;
    }

    const playerCount = Object.keys(targetRoom.players || {}).length;
    if (!targetRoom.players[playerId] && playerCount >= 4) {
      alert('ห้องนี้มีผู้เล่นครบ 4 คนแล้ว');
      return;
    }

    const updated = {
      ...targetRoom,
      players: {
        ...targetRoom.players,
        [playerId]: targetRoom.players[playerId] || {
          id: playerId,
          name: playerName,
          ready: false,
          deckId: '',
          deckSource: 'starter'
        }
      },
      logs: [
        ...(targetRoom.logs || []),
        { id: uid(), time: new Date().toLocaleTimeString('th-TH'), text: `${playerName} เข้าร่วมห้อง` }
      ]
    };
    setRoomCode(code);
    setUndoStack([]);
    await persistRoomState(updated, { type: 'none' });
  };

  const selectDeckForRoom = async (source, deckId) => {
    setSelectedDeckSource(source);
    setSelectedDeckId(deckId);
    if (!roomData) return;

    const updated = {
      ...roomData,
      players: {
        ...roomData.players,
        [playerId]: { ...roomData.players[playerId], deckSource: source, deckId, ready: Boolean(deckId) }
      }
    };
    await persistRoomState(updated, { type: 'none' });
  };

  const startGame = async () => {
    if (!roomData) return;
    const playerList = Object.values(roomData.players);
    if (playerList.some((p) => !p.deckId)) {
      alert('ผู้เล่นทุกคนต้องเลือกเด็ค (Starter Deck หรือ Custom Deck) ก่อนเริ่มเกมครับ');
      return;
    }

    const numPlayers = playerList.length;
    const villainCards = cards.filter((c) => c.category === 'Scenario' && c.setGroup === selectedVillainGroup);
    const villains = villainCards
      .filter((c) => c.type.includes('วายร้าย'))
      .sort((a, b) => Number(a.stage || 1) - Number(b.stage || 1));
    const mainSchemes = villainCards
      .filter((c) => c.type.includes('แผนการหลัก'))
      .sort((a, b) => Number(a.stage || 1) - Number(b.stage || 1));

    const activeVillainCard = villains[difficulty === 'expert' && villains.length > 1 ? 1 : 0] || villains[0];
    const activeSchemeCard = mainSchemes[0];

    const villainEncounter = villainCards.filter(
      (c) => !c.type.includes('วายร้าย') && !c.type.includes('แผนการหลัก')
    );
    const sideEncounter = cards.filter((c) => c.category === 'Side' && selectedSides.includes(c.setGroup));

    let encounterDeck = [];
    [...villainEncounter, ...sideEncounter].forEach((c) => {
      const copies = Number(c.maxCopies || 1);
      for (let i = 0; i < copies; i++) encounterDeck.push({ ...c, instanceId: uid() });
    });
    encounterDeck = shuffleArray(encounterDeck);

    const initializedPlayers = {};
    playerList.forEach((p) => {
      const deckPool = p.deckSource === 'starter' ? starterDecks : customDecks;
      const deckObj = deckPool.find((d) => d.id === p.deckId);
      const heroCard = cards.find((c) => c.id === deckObj?.heroCardId);
      const alterCard = cards.find((c) => c.id === deckObj?.alterEgoCardId) || heroCard;

      let fullDeck = [];
      (deckObj?.cardIds || []).forEach((cid) => {
        const cardData = cards.find((c) => c.id === cid);
        if (cardData) fullDeck.push({ ...cardData, instanceId: uid() });
      });
      fullDeck = shuffleArray(fullDeck);

      const handSize = Number(alterCard?.handSize || 6);
      const hand = fullDeck.slice(0, handSize);
      const drawPile = fullDeck.slice(handSize);

      initializedPlayers[p.id] = {
        ...p,
        form: 'alter-ego',
        exhausted: false,
        hp: Number(alterCard?.hp || 12),
        maxHp: Number(alterCard?.hp || 12),
        statuses: { stunned: false, confused: false, tough: false },
        heroCard,
        alterCard,
        identity: alterCard,
        deck: drawPile,
        hand,
        discard: [],
        playArea: [],
        engagedMinions: []
      };
    });

    const villainMaxHp = activeVillainCard
      ? Number(activeVillainCard.hp || 14) * (activeVillainCard.hpPerPlayer ? numPlayers : 1)
      : 15 * numPlayers;

    const schemeThreshold = activeSchemeCard
      ? Number(activeSchemeCard.threatThreshold || 6) * (activeSchemeCard.threatPerPlayer ? numPlayers : 1)
      : 8 * numPlayers;

    const startedRoom = {
      ...roomData,
      status: 'playing',
      scenario: { villainGroup: selectedVillainGroup, difficulty, sides: selectedSides },
      players: initializedPlayers,
      table: {
        round: 1,
        phase: 'player',
        firstPlayerId: playerList[0].id,
        villain: activeVillainCard
          ? {
              ...activeVillainCard,
              currentHp: villainMaxHp,
              maxHp: villainMaxHp,
              statuses: { stunned: false, confused: false, tough: false }
            }
          : {
              name: selectedVillainGroup || 'วายร้ายหลัก',
              atk: 2,
              sch: 2,
              currentHp: villainMaxHp,
              maxHp: villainMaxHp,
              statuses: { stunned: false, confused: false, tough: false }
            },
        villainStages: villains,
        currentVillainStageIdx: difficulty === 'expert' && villains.length > 1 ? 1 : 0,
        mainScheme: activeSchemeCard
          ? {
              ...activeSchemeCard,
              threat: Number(activeSchemeCard.threatBase || 0),
              threshold: schemeThreshold
            }
          : {
              name: 'แผนการหลักของวายร้าย',
              threat: 0,
              threshold: schemeThreshold
            },
        sideSchemes: [],
        encounterDeck,
        encounterDiscard: [],
        revealedEncounter: null
      },
      logs: [
        ...(roomData.logs || []),
        {
          id: uid(),
          time: new Date().toLocaleTimeString('th-TH'),
          text: `⚔️ เริ่มเกม Gate of Kronos! (${numPlayers} ผู้เล่น) ปะทะ ${selectedVillainGroup || 'วายร้าย'}`
        }
      ]
    };

    setViewingPlayerId(playerId);
    setActiveTab('tabletop');
    await persistRoomState(startedRoom, { type: 'irreversible', reason: 'เริ่มเกมและแจกไพ่เริ่มต้นแล้ว' });
  };

  const uniqueVillainGroups = [...new Set(cards.filter((c) => c.category === 'Scenario' && c.setGroup).map((c) => c.setGroup))];
  const uniqueSideGroups = [...new Set(cards.filter((c) => c.category === 'Side' && c.setGroup).map((c) => c.setGroup))];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-wide bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
              GATE OF KRONOS
            </h1>
            <p className="text-xs text-slate-400">Anime Crossover LCG • Multiplayer 1–4 Players</p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('lobby')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
              activeTab === 'lobby' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> ห้องเล่น (Lobby)
          </button>

          {roomData?.status === 'playing' && (
            <button
              onClick={() => setActiveTab('tabletop')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                activeTab === 'tabletop' ? 'bg-rose-500 text-white font-bold' : 'text-rose-300 hover:bg-slate-800'
              }`}
            >
              <Swords className="w-4 h-4" /> กระดานเล่นเกม
            </button>
          )}

          <button
            onClick={() => setActiveTab('deckbuilder')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
              activeTab === 'deckbuilder' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> จัดเด็ค (Deck)
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
              activeTab === 'admin' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" /> Admin Studio ({cards.length})
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full border ${isFirebaseConfigured ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'}`}>
            {isFirebaseConfigured ? 'Online Sync (Firebase)' : 'Local / Multi-Tab Sync'}
          </span>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-sm w-32 focus:outline-none focus:border-amber-500"
            placeholder="ชื่อผู้เล่น"
          />
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        {activeTab === 'lobby' && (
          <LobbyView
            cards={cards}
            starterDecks={starterDecks}
            customDecks={customDecks}
            roomData={roomData}
            joinInput={joinInput}
            setJoinInput={setJoinInput}
            createRoom={createRoom}
            joinRoom={joinRoom}
            playerId={playerId}
            selectedDeckSource={selectedDeckSource}
            selectedDeckId={selectedDeckId}
            selectDeckForRoom={selectDeckForRoom}
            uniqueVillainGroups={uniqueVillainGroups}
            uniqueSideGroups={uniqueSideGroups}
            selectedVillainGroup={selectedVillainGroup}
            setSelectedVillainGroup={setSelectedVillainGroup}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            selectedSides={selectedSides}
            setSelectedSides={setSelectedSides}
            startGame={startGame}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'tabletop' && roomData?.status === 'playing' && (
          <TabletopView
            roomData={roomData}
            playerId={playerId}
            viewingPlayerId={viewingPlayerId || playerId}
            setViewingPlayerId={setViewingPlayerId}
            persistRoomState={persistRoomState}
            undoStack={undoStack}
            undoLockedReason={undoLockedReason}
            handleUndo={handleUndo}
            fireGameEvent={fireGameEvent}
            activeTriggers={activeTriggers}
            setActiveTriggers={setActiveTriggers}
            setInspectedCard={setInspectedCard}
          />
        )}

        {activeTab === 'deckbuilder' && (
          <DeckBuilderView
            cards={cards}
            customDecks={customDecks}
            saveCustomDecks={saveCustomDecks}
            setInspectedCard={setInspectedCard}
          />
        )}

        {activeTab === 'admin' && (
          <AdminStudioView
            cards={cards}
            saveCardDatabase={saveCardDatabase}
            starterDecks={starterDecks}
            saveStarterDecks={saveStarterDecks}
            setInspectedCard={setInspectedCard}
          />
        )}
      </main>

      {inspectedCard && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setInspectedCard(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl flex flex-col sm:flex-row gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full sm:w-56 aspect-[63/88] bg-slate-950 rounded-xl border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {inspectedCard.imageUrl ? (
                <img src={inspectedCard.imageUrl} alt={inspectedCard.name} className="w-full h-full object-cover" />
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs">ยังไม่มีรูปการ์ด</div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {inspectedCard.series} • {inspectedCard.type}
                    </span>
                    <h3 className="text-xl font-bold mt-1 text-white">{inspectedCard.name}</h3>
                  </div>
                  <button onClick={() => setInspectedCard(null)} className="p-1 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {inspectedCard.traits && (
                  <p className="text-xs font-semibold text-amber-400 mt-2">แท็ก: {inspectedCard.traits}</p>
                )}

                <div className="grid grid-cols-3 gap-1.5 mt-3 text-center text-xs">
                  {inspectedCard.type === 'พันธมิตร (Ally)' && (
                    <>
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400">Cost / THW / ATK</div>
                        <div className="font-bold text-amber-300">
                          {inspectedCard.cost} / {inspectedCard.thw || 0} / {inspectedCard.atk || 0}
                        </div>
                      </div>
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400">HP</div>
                        <div className="font-bold text-emerald-300">{inspectedCard.hp || 0}</div>
                      </div>
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400">Consequential DMG</div>
                        <div className="font-bold text-rose-300">{inspectedCard.consequentialDamage ?? 1}</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-3 bg-slate-950/90 p-3 rounded-xl border border-slate-800 text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  {inspectedCard.text || 'ไม่มีข้อความความสามารถ'}
                </div>
              </div>

              {inspectedCard.triggerTiming !== 'None' && (
                <div className="text-xs bg-indigo-950/60 border border-indigo-500/30 rounded-lg p-2.5 text-indigo-200">
                  <strong>Trigger:</strong> [{inspectedCard.triggerTiming}] • {TRIGGER_EVENTS.find((e) => e.id === inspectedCard.triggerEvent)?.label}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 1. LOBBY VIEW
// ============================================================================
function LobbyView({
  cards, starterDecks, customDecks, roomData, joinInput, setJoinInput,
  createRoom, joinRoom, playerId, selectedDeckSource, selectedDeckId, selectDeckForRoom,
  uniqueVillainGroups, uniqueSideGroups, selectedVillainGroup, setSelectedVillainGroup,
  difficulty, setDifficulty, selectedSides, setSelectedSides, startGame, setActiveTab
}) {
  const toggleSide = (sideName) => {
    setSelectedSides((prev) =>
      prev.includes(sideName) ? prev.filter((s) => s !== sideName) : [...prev, sideName]
    );
  };

  return (
    <div className="space-y-6">
      {cards.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-300">ฐานข้อมูลการ์ดยังว่างอยู่ (Clean Database)</h3>
              <p className="text-sm text-slate-300 mt-0.5">
                กรุณาเข้าไปที่หน้า <strong>Admin Studio</strong> เพื่อนำเข้ารูปภาพและกรอกข้อมูลการ์ด Core Set ของคุณ หรือ Import ไฟล์ JSON ที่บันทึกไว้
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('admin')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm whitespace-nowrap transition"
          >
            ไปที่ Admin Studio →
          </button>
        </div>
      )}

      {!roomData ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">สร้างห้องเล่นใหม่ (1–4 คน)</h2>
            <p className="text-sm text-slate-400">
              สร้างห้องสำหรับเล่นคนเดียว (Solo) หรือส่งรหัสห้อง 5 หลักให้เพื่อนจอยเข้ามาเล่นร่วมกันสูงสุด 4 คน
            </p>
            <button
              onClick={createRoom}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-orange-500/20"
            >
              สร้างห้องเล่นทันที
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">เข้าร่วมห้องของเพื่อน</h2>
            <p className="text-sm text-slate-400">
              กรอกรหัสห้อง (Room Code) ที่ได้รับจากหัวหน้าห้องเพื่อเข้าร่วมปาร์ตี้
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                placeholder="เช่น A7K9P"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center font-mono text-lg tracking-widest uppercase focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={joinRoom}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition"
              >
                เข้าร่วม
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400">รหัสห้อง (Room Code)</span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-mono font-black tracking-widest text-amber-400">{roomData.code}</span>
                <button
                  onClick={() => navigator.clipboard?.writeText(roomData.code)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                  title="คัดลอกรหัสห้อง"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300">
                ผู้เล่นในห้อง: <strong>{Object.keys(roomData.players || {}).length} / 4 คน</strong>
              </span>
              {roomData.hostId === playerId && (
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                >
                  <Play className="w-5 h-5" /> เริ่มเกม!
                </button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-sky-300">
                <Layers className="w-5 h-5" /> 1. เลือกเด็คของคุณ (40 ใบ)
              </h3>

              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => selectDeckForRoom('starter', '')}
                  className={`py-2 rounded-lg text-xs font-bold transition ${
                    selectedDeckSource === 'starter' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Starter Deck ({starterDecks.length})
                </button>
                <button
                  onClick={() => selectDeckForRoom('custom', '')}
                  className={`py-2 rounded-lg text-xs font-bold transition ${
                    selectedDeckSource === 'custom' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Custom Deck ({customDecks.length})
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {(selectedDeckSource === 'starter' ? starterDecks : customDecks).map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => selectDeckForRoom(selectedDeckSource, deck.id)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      selectedDeckId === deck.id
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{deck.name}</div>
                      <div className="text-xs text-slate-400">
                        {deck.aspect} • {deck.cardIds?.length || 0} ใบ
                      </div>
                    </div>
                    {selectedDeckId === deck.id && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-rose-300">
                <Flame className="w-5 h-5" /> 2. เลือกวายร้าย & ชุดเสริม (Side)
              </h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">วายร้ายหลัก (Scenario)</label>
                <select
                  value={selectedVillainGroup}
                  onChange={(e) => setSelectedVillainGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm"
                >
                  <option value="">-- เลือกวายร้าย --</option>
                  {uniqueVillainGroups.map((vg) => (
                    <option key={vg} value={vg}>{vg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">ระดับความยาก</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDifficulty('normal')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      difficulty === 'normal' ? 'bg-rose-500/20 border-rose-500 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    โหมดปกติ (สเตจ I–II)
                  </button>
                  <button
                    onClick={() => setDifficulty('expert')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      difficulty === 'expert' ? 'bg-rose-500/20 border-rose-500 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    โหมดยาก (สเตจ II–III)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">ชุดเสริมกองเผชิญภัย (Modular / Side)</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {uniqueSideGroups.map((side) => (
                    <label
                      key={side}
                      className="flex items-center gap-2.5 p-2.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSides.includes(side)}
                        onChange={() => toggleSide(side)}
                        className="rounded text-rose-500"
                      />
                      <span>{side}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-300">
                <Users className="w-5 h-5" /> 3. สมาชิกในปาร์ตี้ (1–4 คน)
              </h3>
              <div className="space-y-2.5">
                {Object.values(roomData.players || {}).map((p, idx) => {
                  const deckPool = p.deckSource === 'starter' ? starterDecks : customDecks;
                  const chosenDeck = deckPool.find((d) => d.id === p.deckId);
                  return (
                    <div key={p.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-xs flex items-center justify-center text-amber-400">
                            {idx + 1}
                          </span>
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          เด็ค: {chosenDeck ? `${chosenDeck.name}` : 'ยังไม่เลือกเด็ค'}
                        </div>
                      </div>
                      {p.ready ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">พร้อม</span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">รอเลือกเด็ค</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 2. TABLETOP VIEW
// ============================================================================
function TabletopView({
  roomData, playerId, viewingPlayerId, setViewingPlayerId, persistRoomState,
  undoStack, undoLockedReason, handleUndo, fireGameEvent, activeTriggers, setActiveTriggers,
  setInspectedCard
}) {
  const table = roomData.table;
  const players = roomData.players;
  const activePlayer = players[viewingPlayerId] || players[playerId];
  const isMe = activePlayer?.id === playerId;
  const numPlayers = Object.keys(players).length;

  const addLog = (logs, text) => [
    ...(logs || []).slice(-39),
    { id: uid(), time: new Date().toLocaleTimeString('th-TH'), text }
  ];

  const adjustVillainHp = async (delta) => {
    const nextHp = Math.max(0, table.villain.currentHp + delta);
    const updated = {
      ...roomData,
      table: { ...table, villain: { ...table.villain, currentHp: nextHp } },
      logs: addLog(roomData.logs, `${activePlayer.name} ปรับ HP วายร้าย (${delta > 0 ? '+' + delta : delta}) → เหลือ ${nextHp}`)
    };
    await persistRoomState(updated, { type: 'reversible' });
    if (delta < 0) fireGameEvent('damage_taken', `วายร้ายได้รับความเสียหาย ${Math.abs(delta)} หน่วย`);
  };

  const adjustMainThreat = async (delta) => {
    const nextThreat = Math.max(0, table.mainScheme.threat + delta);
    if (delta > 0) fireGameEvent('threat_added', `กำลังจะเพิ่มแต้มภัยคุกคาม +${delta} แต้มลงบนแผนการหลัก`);
    const updated = {
      ...roomData,
      table: { ...table, mainScheme: { ...table.mainScheme, threat: nextThreat } },
      logs: addLog(roomData.logs, `${activePlayer.name} ปรับภัยคุกคามแผนการหลัก (${delta > 0 ? '+' + delta : delta}) → ${nextThreat}/${table.mainScheme.threshold}`)
    };
    await persistRoomState(updated, { type: 'reversible' });
  };

  const adjustPlayerHp = async (delta) => {
    if (!isMe) return;
    const nextHp = Math.max(0, Math.min(activePlayer.maxHp + 10, activePlayer.hp + delta));
    const updated = {
      ...roomData,
      players: { ...players, [playerId]: { ...activePlayer, hp: nextHp } },
      logs: addLog(roomData.logs, `${activePlayer.name} ปรับ HP ตัวเอง (${delta > 0 ? '+' + delta : delta}) → ${nextHp}/${activePlayer.maxHp}`)
    };
    await persistRoomState(updated, { type: 'reversible' });
  };

  const flipIdentityForm = async () => {
    if (!isMe) return;
    const nextForm = activePlayer.form === 'hero' ? 'alter-ego' : 'hero';
    const nextIdentity = nextForm === 'hero' ? activePlayer.heroCard : activePlayer.alterCard;
    const updated = {
      ...roomData,
      players: { ...players, [playerId]: { ...activePlayer, form: nextForm, identity: nextIdentity } },
      logs: addLog(roomData.logs, `🔄 ${activePlayer.name} เปลี่ยนเป็น${nextForm === 'hero' ? 'ร่างฮีโร่' : 'ร่างพลเรือน'}`)
    };
    await persistRoomState(updated, { type: 'reversible' });
    fireGameEvent(nextForm === 'hero' ? 'change_form_hero' : 'change_form_alter', `${activePlayer.name} เปลี่ยนร่าง`);
  };

  const playCardFromHand = async (instanceId) => {
    if (!isMe) return;
    const card = activePlayer.hand.find((c) => c.instanceId === instanceId);
    if (!card) return;

    const remainingHand = activePlayer.hand.filter((c) => c.instanceId !== instanceId);
    const isPermanent = ['อัปเกรด (Upgrade)', 'สนับสนุน (Support)', 'พันธมิตร (Ally)'].includes(card.type);
    const isAlly = card.type === 'พันธมิตร (Ally)';

    const nextPlayArea = isPermanent
      ? [
          ...activePlayer.playArea,
          {
            ...card,
            exhausted: false,
            counters: 0,
            allyHp: isAlly ? Number(card.hp || 3) : undefined
          }
        ]
      : activePlayer.playArea;
    const nextDiscard = !isPermanent ? [...activePlayer.discard, card] : activePlayer.discard;

    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: { ...activePlayer, hand: remainingHand, playArea: nextPlayArea, discard: nextDiscard }
      },
      logs: addLog(roomData.logs, `🃏 ${activePlayer.name} เล่นการ์ด "${card.name}"`)
    };
    await persistRoomState(updated, { type: 'reversible' });
  };

  // Ally uses ATK or THW -> takes Consequential Damage
  const useAllyAction = async (instanceId, mode) => {
    if (!isMe) return;
    const card = activePlayer.playArea.find((c) => c.instanceId === instanceId);
    if (!card || card.type !== 'พันธมิตร (Ally)') return;

    const cDamage = Number(card.consequentialDamage ?? 1);
    const nextAllyHp = (card.allyHp ?? Number(card.hp || 3)) - cDamage;

    let nextPlayArea = [...activePlayer.playArea];
    let nextDiscard = [...activePlayer.discard];
    let logMsg = `🤝 พันธมิตร "${card.name}" ใช้ค่า ${mode === 'atk' ? `ATK ${card.atk || 0}` : `THW ${card.thw || 0}`} (รับ Consequential Damage ${cDamage})`;

    if (nextAllyHp <= 0) {
      nextPlayArea = nextPlayArea.filter((c) => c.instanceId !== instanceId);
      nextDiscard = [...nextDiscard, card];
      logMsg += ` → พลังชีวิตหมดและถูกทิ้งลงกองทิ้ง!`;
    } else {
      nextPlayArea = nextPlayArea.map((c) =>
        c.instanceId === instanceId ? { ...c, exhausted: true, allyHp: nextAllyHp } : c
      );
    }

    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: { ...activePlayer, playArea: nextPlayArea, discard: nextDiscard }
      },
      logs: addLog(roomData.logs, logMsg)
    };
    await persistRoomState(updated, { type: 'reversible' });
    fireGameEvent(mode === 'atk' ? 'hero_attacks' : 'hero_thwarts', logMsg);
  };

  const drawCards = async (count = 1) => {
    if (!isMe) return;
    let deck = [...activePlayer.deck];
    let discard = [...activePlayer.discard];
    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (deck.length === 0 && discard.length > 0) {
        deck = shuffleArray(discard);
        discard = [];
      }
      if (deck.length > 0) drawn.push(deck.shift());
    }
    const updated = {
      ...roomData,
      players: { ...players, [playerId]: { ...activePlayer, deck, discard, hand: [...activePlayer.hand, ...drawn] } },
      logs: addLog(roomData.logs, `🎴 ${activePlayer.name} จั่วการ์ด ${drawn.length} ใบ (ล็อก Undo)`)
    };
    await persistRoomState(updated, { type: 'irreversible', reason: 'จั่วการ์ดขึ้นมือแล้ว ไม่สามารถย้อนกลับได้' });
  };

  const revealEncounterOrBoost = async (mode) => {
    let encDeck = [...table.encounterDeck];
    let encDiscard = [...table.encounterDiscard];
    if (encDeck.length === 0 && encDiscard.length > 0) {
      encDeck = shuffleArray(encDiscard);
      encDiscard = [];
    }
    if (encDeck.length === 0) {
      alert('กองการ์ดเผชิญภัยว่างเปล่า');
      return;
    }
    const revealed = encDeck.shift();
    const updated = {
      ...roomData,
      table: {
        ...table,
        encounterDeck: encDeck,
        encounterDiscard: [...encDiscard, revealed],
        revealedEncounter: { ...revealed, mode }
      },
      logs: addLog(roomData.logs, `👁️ เปิดการ์ด (${mode}): "${revealed.name}"`)
    };
    await persistRoomState(updated, { type: 'irreversible', reason: 'เปิดเผยการ์ดแล้ว ไม่สามารถย้อนกลับได้' });
  };

  return (
    <div className="space-y-4">
      {activeTriggers.length > 0 && (
        <div className="bg-indigo-950/90 border-2 border-amber-400 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-amber-300 font-bold text-sm">
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> แจ้งเตือน Trigger ({activeTriggers[0].contextLabel})</span>
            <button onClick={() => setActiveTriggers([])} className="text-xs underline">ปิด</button>
          </div>
          {activeTriggers.map((t) => (
            <div key={t.alertId} className="bg-slate-900 p-2.5 rounded-xl flex items-center justify-between text-xs">
              <div><strong>{t.card.name}</strong>: {t.card.text}</div>
              <button onClick={() => setActiveTriggers((p) => p.filter((x) => x.alertId !== t.alertId))} className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg">รับทราบ</button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {Object.values(players).map((p) => (
            <button
              key={p.id}
              onClick={() => setViewingPlayerId(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                activePlayer?.id === p.id ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-slate-950 text-slate-300 border-slate-800'
              }`}
            >
              {p.name} (HP {p.hp} • มือ {p.hand?.length || 0})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {undoLockedReason && (
            <span className="text-xs text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
              <Lock className="w-3.5 h-3.5" /> {undoLockedReason}
            </span>
          )}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
              undoStack.length > 0 ? 'bg-slate-800 text-emerald-300 border-emerald-500/40' : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-4 h-4" /> ย้อนกลับ ({undoStack.length})
          </button>
        </div>
      </div>

      {/* Villain & Main Scheme */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-4 flex gap-3">
          <div onClick={() => setInspectedCard(table.villain)} className="w-24 aspect-[63/88] bg-slate-950 rounded-xl overflow-hidden cursor-pointer flex-shrink-0">
            {table.villain.imageUrl && <img src={table.villain.imageUrl} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-xs text-rose-300 font-bold">วายร้าย ({numPlayers} ผู้เล่น)</div>
              <div className="font-extrabold text-base">{table.villain.name}</div>
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
              <button onClick={() => adjustVillainHp(-1)} className="w-7 h-7 bg-rose-600 rounded font-bold">-1</button>
              <span className="font-black text-rose-400">HP {table.villain.currentHp}</span>
              <button onClick={() => adjustVillainHp(1)} className="w-7 h-7 bg-slate-800 rounded font-bold">+1</button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs text-amber-300 font-bold">แผนการหลัก</div>
            <div className="font-bold text-base">{table.mainScheme.name}</div>
          </div>
          <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
            <button onClick={() => adjustMainThreat(-1)} className="w-7 h-7 bg-sky-600 rounded font-bold">-1</button>
            <span className="font-black text-amber-400">{table.mainScheme.threat} / {table.mainScheme.threshold}</span>
            <button onClick={() => adjustMainThreat(1)} className="w-7 h-7 bg-amber-600 rounded font-bold">+1</button>
          </div>
        </div>

        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-xs text-purple-300 font-bold">กองเผชิญภัย ({table.encounterDeck?.length || 0} ใบ)</div>
          {table.revealedEncounter && (
            <div onClick={() => setInspectedCard(table.revealedEncounter)} className="text-xs bg-slate-950 p-2 rounded-lg border border-purple-500/30 cursor-pointer">
              เปิดล่าสุด: <strong>{table.revealedEncounter.name}</strong>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => revealEncounterOrBoost('boost')} className="py-2 bg-amber-500/20 border border-amber-500/40 text-amber-200 rounded-xl text-xs font-bold">⚡ เปิดบูสต์</button>
            <button onClick={() => revealEncounterOrBoost('encounter')} className="py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">👁️ เปิดเผชิญภัย</button>
          </div>
        </div>
      </div>

      {/* Player Area */}
      {activePlayer && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 md:w-80 flex-shrink-0">
              <div onClick={() => setInspectedCard(activePlayer.identity)} className="w-24 aspect-[63/88] bg-slate-900 rounded-xl overflow-hidden cursor-pointer flex-shrink-0">
                {activePlayer.identity?.imageUrl && <img src={activePlayer.identity.imageUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                    {activePlayer.form === 'hero' ? 'ร่างฮีโร่' : 'ร่างพลเรือน'}
                  </span>
                  <div className="font-bold text-sm mt-1">{activePlayer.identity?.name}</div>
                </div>
                <div className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded-lg text-xs">
                  <button disabled={!isMe} onClick={() => adjustPlayerHp(-1)} className="px-1.5 bg-rose-600 rounded">-</button>
                  <span className="font-bold text-emerald-400">HP {activePlayer.hp}/{activePlayer.maxHp}</span>
                  <button disabled={!isMe} onClick={() => adjustPlayerHp(1)} className="px-1.5 bg-emerald-600 rounded">+</button>
                </div>
                {isMe && (
                  <button onClick={flipIdentityForm} className="py-1.5 bg-indigo-600 rounded-lg text-xs font-bold">🔄 พลิกร่าง</button>
                )}
              </div>
            </div>

            <div className="flex-1 bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-400">บนสนาม ({activePlayer.playArea?.length || 0} ใบ)</div>
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {(activePlayer.playArea || []).map((card) => (
                  <div key={card.instanceId} className={`w-32 flex-shrink-0 bg-slate-900 border rounded-xl p-2 space-y-1.5 ${card.exhausted ? 'opacity-65 border-amber-500/50' : 'border-slate-700'}`}>
                    <div onClick={() => setInspectedCard(card)} className="cursor-pointer">
                      <div className="text-xs font-bold truncate">{card.name}</div>
                      <div className="text-[10px] text-slate-400">{card.type.split(' ')[0]}</div>
                    </div>
                    {card.type === 'พันธมิตร (Ally)' && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-emerald-300 font-bold">
                          HP: {card.allyHp ?? card.hp} • CD: {card.consequentialDamage ?? 1}
                        </div>
                        {isMe && !card.exhausted && (
                          <div className="grid grid-cols-2 gap-1">
                            <button onClick={() => useAllyAction(card.instanceId, 'thw')} className="py-1 bg-sky-600 rounded text-[10px] font-bold">
                              THW {card.thw || 0}
                            </button>
                            <button onClick={() => useAllyAction(card.instanceId, 'atk')} className="py-1 bg-rose-600 rounded text-[10px] font-bold">
                              ATK {card.atk || 0}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {isMe && (
                <div className="flex justify-end">
                  <button onClick={() => drawCards(1)} className="px-3 py-1.5 bg-sky-500 text-slate-950 font-bold rounded-xl text-xs">
                    + จั่วการ์ด 1 ใบ
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="text-xs font-bold text-amber-300 mb-2">มือของ {activePlayer.name} ({activePlayer.hand?.length || 0} ใบ)</div>
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {(activePlayer.hand || []).map((card) =>
                isMe ? (
                  <div key={card.instanceId} className="w-32 flex-shrink-0 bg-slate-900 border border-slate-700 rounded-xl p-2 flex flex-col justify-between">
                    <div onClick={() => setInspectedCard(card)} className="cursor-pointer space-y-1">
                      <div className="aspect-[63/88] bg-slate-950 rounded overflow-hidden">
                        {card.imageUrl && <img src={card.imageUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="text-xs font-bold truncate">{card.name}</div>
                      <div className="text-[10px] text-slate-400">Cost {card.cost}</div>
                    </div>
                    <button onClick={() => playCardFromHand(card.instanceId)} className="mt-2 py-1 bg-amber-500 text-slate-950 font-bold rounded text-[11px]">
                      เล่นการ์ด
                    </button>
                  </div>
                ) : (
                  <div key={card.instanceId} className="w-20 aspect-[63/88] flex-shrink-0 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-xs font-bold text-slate-500">
                    GOK
                  </div>
                )
              )}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-32 overflow-y-auto space-y-1 text-xs">
            {[...(roomData.logs || [])].reverse().map((log) => (
              <div key={log.id} className="text-slate-300">
                <span className="text-slate-500 font-mono mr-2">[{log.time}]</span>
                {log.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. DECK BUILDER VIEW
// ============================================================================
function DeckBuilderView({ cards, customDecks, saveCustomDecks, setInspectedCard }) {
  const heroIdentities = cards.filter((c) => c.category === 'Hero' && c.type.includes('ร่างฮีโร่'));
  const [selectedHeroId, setSelectedHeroId] = useState(heroIdentities[0]?.id || '');
  const [chosenAspect, setChosenAspect] = useState('Aggression');
  const [deckName, setDeckName] = useState('');
  const [addedAspectCardIds, setAddedAspectCardIds] = useState([]);

  const selectedHero = heroIdentities.find((h) => h.id === selectedHeroId);
  const alterEgoCard = cards.find(
    (c) => c.category === 'Hero' && c.type.includes('ร่างพลเรือน') && c.heroOwner === selectedHero?.heroOwner
  );

  const heroKitCards = cards.filter(
    (c) =>
      c.category === 'Hero' &&
      c.heroOwner === selectedHero?.heroOwner &&
      !c.type.includes('ร่างฮีโร่') &&
      !c.type.includes('ร่างพลเรือน')
  );

  const heroKitExpanded = [];
  heroKitCards.forEach((c) => {
    for (let i = 0; i < Number(c.maxCopies || 1); i++) heroKitExpanded.push(c.id);
  });

  const poolCards = cards.filter(
    (c) => c.category === 'Aspect' && (c.aspect === chosenAspect || c.aspect === 'Basics')
  );
  const totalCards = heroKitExpanded.length + addedAspectCardIds.length;

  const handleSaveCustomDeck = () => {
    if (!selectedHero) return;
    if (totalCards < 40) {
      alert(`เด็คต้องมีอย่างน้อย 40 ใบ (ตอนนี้มี ${totalCards} ใบ)`);
      return;
    }
    const newDeck = {
      id: 'CD-' + uid(),
      name: deckName.trim() || `${selectedHero.name} (${chosenAspect})`,
      heroCardId: selectedHero.id,
      alterEgoCardId: alterEgoCard?.id || selectedHero.id,
      aspect: chosenAspect,
      cardIds: [...heroKitExpanded, ...addedAspectCardIds]
    };
    saveCustomDecks([...customDecks, newDeck]);
    alert('บันทึก Custom Deck เรียบร้อยแล้ว!');
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-sky-300">จัดเด็คเอง (Custom Deck Builder)</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">เลือกฮีโร่หลัก</label>
            <select
              value={selectedHeroId}
              onChange={(e) => {
                setSelectedHeroId(e.target.value);
                setAddedAspectCardIds([]);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
            >
              <option value="">-- เลือกฮีโร่ --</option>
              {heroIdentities.map((h) => (
                <option key={h.id} value={h.id}>{h.name} ({h.series})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">เลือกสายพลัง (Aspect)</label>
            <select
              value={chosenAspect}
              onChange={(e) => {
                setChosenAspect(e.target.value);
                setAddedAspectCardIds([]);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
            >
              {ASPECTS.filter((a) => !['HeroKit', 'Basics', 'Encounter'].includes(a.id)).map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto">
          {poolCards.map((card) => {
            const count = addedAspectCardIds.filter((id) => id === card.id).length;
            return (
              <div key={card.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div onClick={() => setInspectedCard(card)} className="cursor-pointer min-w-0">
                  <div className="font-bold text-sm truncate">{card.name}</div>
                  <div className="text-xs text-slate-400">Cost {card.cost} • {card.type.split(' ')[0]}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const idx = addedAspectCardIds.indexOf(card.id);
                      if (idx !== -1) {
                        const cp = [...addedAspectCardIds];
                        cp.splice(idx, 1);
                        setAddedAspectCardIds(cp);
                      }
                    }}
                    className="w-7 h-7 bg-slate-800 rounded-lg font-bold"
                  >-</button>
                  <span className="text-xs font-bold w-8 text-center">{count}/{card.maxCopies || 3}</span>
                  <button
                    onClick={() => {
                      if (count < Number(card.maxCopies || 3) && totalCards < 50) {
                        setAddedAspectCardIds([...addedAspectCardIds, card.id]);
                      }
                    }}
                    className="w-7 h-7 bg-sky-500 text-slate-950 rounded-lg font-bold"
                  >+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-5 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">เด็คของคุณ</h3>
            <span className={`font-black ${totalCards >= 40 && totalCards <= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalCards} / 40–50 ใบ
            </span>
          </div>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="ตั้งชื่อ Custom Deck..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
          />
          <div className="text-xs text-amber-300 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/30">
            ชุดประจำตัวฮีโร่: {heroKitExpanded.length} ใบ
          </div>
          <button onClick={handleSaveCustomDeck} className="w-full py-2.5 bg-sky-500 text-slate-950 font-bold rounded-xl text-sm">
            บันทึก Custom Deck
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <h3 className="font-bold text-sm">Custom Decks ที่บันทึกไว้ ({customDecks.length})</h3>
          {customDecks.map((d) => (
            <div key={d.id} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <div className="font-bold">{d.name}</div>
                <div className="text-slate-400">{d.cardIds.length} ใบ</div>
              </div>
              <button onClick={() => saveCustomDecks(customDecks.filter((x) => x.id !== d.id))} className="text-rose-400 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. ADMIN CARD STUDIO VIEW (TYPE-FIRST DYNAMIC FIELDS + ALLY CONSEQUENTIAL DMG)
// ============================================================================
function AdminStudioView({ cards, saveCardDatabase, starterDecks, saveStarterDecks, setInspectedCard }) {
  const [form, setForm] = useState(emptyCardForm);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [starterName, setStarterName] = useState('');
  const [starterHeroId, setStarterHeroId] = useState('');
  const [starterAspect, setStarterAspect] = useState('Aggression');
  const [starterCardIds, setStarterCardIds] = useState([]);

  // Determine which fields to show based on selected card type
  const fields = TYPE_FIELD_CONFIG[form.type] || TYPE_FIELD_CONFIG['เหตุการณ์ (Event)'];

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleBatchImageImport = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                ...emptyCardForm,
                id: 'CARD-' + uid(),
                name: file.name.replace(/\.[^/.]+$/, ''),
                category: form.category,
                series: form.series,
                aspect: form.aspect,
                type: form.type,
                heroOwner: form.heroOwner,
                setGroup: form.setGroup,
                imageUrl: reader.result
              });
            };
            reader.readAsDataURL(file);
          })
      )
    ).then((newCards) => {
      saveCardDatabase([...cards, ...newCards]);
      alert(`นำเข้ารูปภาพการ์ด ${newCards.length} ใบเรียบร้อย!`);
    });
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('กรุณากรอกชื่อการ์ด');
      return;
    }

    if (editingId) {
      saveCardDatabase(cards.map((c) => (c.id === editingId ? { ...form, id: editingId } : c)));
      setEditingId(null);
    } else {
      saveCardDatabase([...cards, { ...form, id: 'CARD-' + uid() }]);
    }

    setForm((prev) => ({
      ...emptyCardForm,
      series: prev.series,
      category: prev.category,
      aspect: prev.aspect,
      type: prev.type,
      heroOwner: prev.heroOwner,
      setGroup: prev.setGroup
    }));
  };

  const startEditCard = (card) => {
    setEditingId(card.id);
    setForm({ ...emptyCardForm, ...card });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCard = (id) => {
    if (!confirm('ยืนยันลบการ์ดใบนี้?')) return;
    saveCardDatabase(cards.filter((c) => c.id !== id));
  };

  const exportJson = () => {
    const payload = {
      version: '1.1',
      game: 'Gate of Kronos',
      exportedAt: new Date().toISOString(),
      cards,
      starterDecks
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gate-of-kronos-db-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (Array.isArray(parsed.cards)) saveCardDatabase(parsed.cards);
        if (Array.isArray(parsed.starterDecks)) saveStarterDecks(parsed.starterDecks);
        alert('นำเข้าฐานข้อมูลสำเร็จ!');
      } catch (err) {
        alert('ไฟล์ JSON ไม่ถูกต้อง');
      }
    };
    reader.readAsText(file);
  };

  const handleCreateStarterDeck = () => {
    const hero = cards.find((c) => c.id === starterHeroId);
    if (!hero) {
      alert('กรุณาเลือกการ์ดร่างฮีโร่สำหรับ Starter Deck');
      return;
    }
    const alter = cards.find(
      (c) => c.category === 'Hero' && c.type.includes('ร่างพลเรือน') && c.heroOwner === hero.heroOwner
    );
    const heroKit = cards.filter(
      (c) =>
        c.category === 'Hero' &&
        c.heroOwner === hero.heroOwner &&
        !c.type.includes('ร่างฮีโร่') &&
        !c.type.includes('ร่างพลเรือน')
    );
    const kitIds = [];
    heroKit.forEach((c) => {
      for (let i = 0; i < Number(c.maxCopies || 1); i++) kitIds.push(c.id);
    });

    const fullIds = [...kitIds, ...starterCardIds];
    const newStarter = {
      id: 'SD-' + uid(),
      name: starterName.trim() || `Starter: ${hero.name} (${starterAspect})`,
      heroCardId: hero.id,
      alterEgoCardId: alter?.id || hero.id,
      aspect: starterAspect,
      cardIds: fullIds
    };
    saveStarterDecks([...starterDecks, newStarter]);
    setStarterName('');
    setStarterCardIds([]);
    alert(`บันทึก Starter Deck "${newStarter.name}" (${fullIds.length} ใบ) เรียบร้อย!`);
  };

  const filteredCards = cards.filter((c) => {
    const matchCat = filterCategory === 'ALL' || c.category === filterCategory;
    const matchText =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.heroOwner || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.setGroup || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchText;
  });

  const heroIdentities = cards.filter((c) => c.category === 'Hero' && c.type.includes('ร่างฮีโร่'));

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-emerald-300 flex items-center gap-2">
            <Settings className="w-5 h-5" /> Admin Card Studio — กรอกข้อมูลการ์ดตามประเภท
          </h2>
          <p className="text-xs text-slate-400">
            เลือกประเภทการ์ดก่อน ระบบจะแสดงเฉพาะช่องที่จำเป็นสำหรับประเภทนั้นๆ (เช่น พันธมิตรจะมี Consequential Damage ให้กรอก)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5">
            <FolderOpen className="w-4 h-4" /> นำเข้ารูปหลายใบ (Batch)
            <input type="file" accept="image/*" multiple onChange={handleBatchImageImport} className="hidden" />
          </label>
          <button onClick={exportJson} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5">
            <Upload className="w-4 h-4" /> Import JSON
            <input type="file" accept=".json" onChange={importJson} className="hidden" />
          </label>
        </div>
      </div>

      <form onSubmit={handleSaveCard} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-white">
            {editingId ? `✏️ แก้ไขการ์ด: ${form.name}` : '➕ เพิ่มการ์ดใหม่'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyCardForm);
              }}
              className="text-xs text-slate-400 hover:text-white"
            >
              ยกเลิกการแก้ไข
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-5">
          {/* Image Column */}
          <div className="lg:col-span-3 flex flex-col items-center space-y-2">
            <div className="w-48 aspect-[63/88] bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl overflow-hidden flex items-center justify-center">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-slate-500 text-center px-3">อัปโหลดรูปการ์ด (.png / .jpg)</span>
              )}
            </div>
            <label className="w-48 py-2 bg-slate-800 hover:bg-slate-700 text-center rounded-xl text-xs font-bold cursor-pointer">
              เลือกรูปภาพการ์ด
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Dynamic Form Column */}
          <div className="lg:col-span-9 space-y-4">
            {/* Step 1: Select Card Type First */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-amber-300 block mb-1">1. เลือกประเภทการ์ดก่อน *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-sm font-bold text-white"
                >
                  {CARD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">หมวดโฟลเดอร์หลัก</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                >
                  {CARD_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">เรื่องอนิเมะ</label>
                <select
                  value={form.series}
                  onChange={(e) => setForm({ ...form, series: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                >
                  {ANIME_SERIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Name & Group Fields */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">ชื่อการ์ด *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ชื่อการ์ด..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">สายพลัง (Aspect)</label>
                <select
                  value={form.aspect}
                  onChange={(e) => setForm({ ...form, aspect: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                >
                  {ASPECTS.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {form.category === 'Hero' ? 'เจ้าของชุดฮีโร่ (Hero Set)' : 'ชื่อชุด Scenario / Side'}
                </label>
                <input
                  type="text"
                  value={form.category === 'Hero' ? form.heroOwner : form.setGroup}
                  onChange={(e) =>
                    form.category === 'Hero'
                      ? setForm({ ...form, heroOwner: e.target.value })
                      : setForm({ ...form, setGroup: e.target.value })
                  }
                  placeholder={form.category === 'Hero' ? 'เช่น มังกี้ ดี. ลูฟี่' : 'เช่น เพน / องค์กรแสงอุษา'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Dynamic Stats Row (Only renders fields relevant to form.type) */}
            <div className="flex flex-wrap gap-3 bg-slate-950/70 border border-slate-800 rounded-xl p-3">
              {fields.showCost && (
                <div className="w-24">
                  <label className="text-[11px] text-amber-300 font-bold block mb-1">Cost</label>
                  <input
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fields.showThw && (
                <div className="w-24">
                  <label className="text-[11px] text-sky-300 font-bold block mb-1">THW</label>
                  <input
                    type="number"
                    value={form.thw}
                    onChange={(e) => setForm({ ...form, thw: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fields.showAtk && (
                <div className="w-24">
                  <label className="text-[11px] text-rose-300 font-bold block mb-1">ATK</label>
                  <input
                    type="number"
                    value={form.atk}
                    onChange={(e) => setForm({ ...form, atk: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fields.showDef && (
                <div className="w-24">
                  <label className="text-[11px] text-emerald-300 font-bold block mb-1">DEF</label>
                  <input
                    type="number"
                    value={form.def}
                    onChange={(e) => setForm({ ...form, def: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fields.showRec && (
                <div className="w-24">
                  <label className="text-[11px] text-emerald-300 font-bold block mb-1">REC</label>
                  <input
                    type="number"
                    value={form.rec}
                    onChange={(e) => setForm({ ...form, rec: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fields.showSch && (
                <div className="w-24">
                  <label className="text-[11px] text-amber-300 font-bold block mb-1">SCH</label>
                  <input
                    type="number"
                    value={form.sch}
                    onChange={(e) => setForm({ ...form, sch: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fields.showHp && (
                <div className="w-24">
                  <label className="text-[11px] text-emerald-300 font-bold block mb-1">HP</label>
                  <input
                    type="number"
                    value={form.hp}
                    onChange={(e) => setForm({ ...form, hp: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fields.showConsequentialDamage && (
                <div className="w-36">
                  <label className="text-[11px] text-rose-400 font-bold block mb-1">Consequential Damage</label>
                  <input
                    type="number"
                    min={0}
                    value={form.consequentialDamage}
                    onChange={(e) => setForm({ ...form, consequentialDamage: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-rose-500/50 rounded-lg px-2 py-1.5 text-xs text-center font-bold text-rose-200"
                  />
                </div>
              )}

              {fields.showHandSize && (
                <div className="w-24">
                  <label className="text-[11px] text-sky-300 font-bold block mb-1">ขนาดมือ</label>
                  <input
                    type="number"
                    value={form.handSize}
                    onChange={(e) => setForm({ ...form, handSize: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fields.showMaxCopies && (
                <div className="w-24">
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">จำนวนใบ</label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxCopies}
                    onChange={(e) => setForm({ ...form, maxCopies: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fields.showBoost && (
                <div className="w-24">
                  <label className="text-[11px] text-purple-300 font-bold block mb-1">ไอคอนบูสต์</label>
                  <input
                    type="number"
                    min={0}
                    value={form.boostIcons}
                    onChange={(e) => setForm({ ...form, boostIcons: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}
            </div>

            {/* Dynamic Resources for Player Cards */}
            {fields.showResources && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">ทรัพยากรที่ให้ (เมื่อทิ้งจากมือจ่าย)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'red', label: '🔴 แดง' },
                    { key: 'blue', label: '🔵 ฟ้า' },
                    { key: 'yellow', label: '🟡 เหลือง' },
                    { key: 'wild', label: '🌈 ทั่วไป' }
                  ].map((res) => (
                    <div key={res.key} className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 flex items-center justify-between text-xs">
                      <span>{res.label}</span>
                      <input
                        type="number"
                        min={0}
                        max={3}
                        value={form.resources[res.key]}
                        onChange={(e) =>
                          setForm({ ...form, resources: { ...form.resources, [res.key]: Number(e.target.value) } })
                        }
                        className="w-9 bg-slate-900 border border-slate-700 rounded text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Scheme / Villain Fields */}
            {fields.showSchemeFields && (
              <div className="grid sm:grid-cols-4 gap-3 bg-rose-950/20 border border-rose-500/30 p-3 rounded-xl">
                <div>
                  <label className="text-xs text-rose-200 block mb-1">สเตจ</label>
                  <input
                    type="text"
                    value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-rose-200 block mb-1">ภัยคุกคามเริ่มต้น</label>
                  <input
                    type="number"
                    value={form.threatBase}
                    onChange={(e) => setForm({ ...form, threatBase: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-rose-200 block mb-1">เพดานภัยคุกคาม (ต่อคน)</label>
                  <input
                    type="number"
                    value={form.threatThreshold}
                    onChange={(e) => setForm({ ...form, threatThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div className="flex flex-col justify-center gap-1 text-xs">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={form.hpPerPlayer} onChange={(e) => setForm({ ...form, hpPerPlayer: e.target.checked })} />
                    <span>HP คูณจำนวนผู้เล่น</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={form.threatPerPlayer} onChange={(e) => setForm({ ...form, threatPerPlayer: e.target.checked })} />
                    <span>ภัยคุกคามคูณจำนวนผู้เล่น</span>
                  </label>
                </div>
              </div>
            )}

            {/* Traits & Ability Text */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">แท็ก (Traits)</label>
                <input
                  type="text"
                  value={form.traits}
                  onChange={(e) => setForm({ ...form, traits: e.target.value })}
                  placeholder="เช่น พันธมิตร, นักดาบ, การโจมตี"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 block mb-1">ข้อความความสามารถ</label>
                <textarea
                  rows={2}
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="กรอกข้อความความสามารถของการ์ด..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* 4-Step Rule Builder */}
            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3.5 space-y-2.5">
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> ตั้งค่า Trigger อัตโนมัติ (4-Step Rule Builder)
              </div>
              <div className="grid sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">1. จังหวะการทำงาน</label>
                  <select
                    value={form.triggerTiming}
                    onChange={(e) => setForm({ ...form, triggerTiming: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
                  >
                    {TRIGGER_TIMINGS.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">2. เหตุการณ์ที่กระตุ้น</label>
                  <select
                    value={form.triggerEvent}
                    onChange={(e) => setForm({ ...form, triggerEvent: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
                  >
                    {TRIGGER_EVENTS.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">3. ผลลัพธ์</label>
                  <select
                    value={form.effectAction}
                    onChange={(e) => setForm({ ...form, effectAction: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
                  >
                    {EFFECT_ACTIONS.map((ef) => (
                      <option key={ef.id} value={ef.id}>{ef.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">4. ค่าตัวเลข</label>
                  <input
                    type="number"
                    value={form.effectValue}
                    onChange={(e) => setForm({ ...form, effectValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-sm">
                {editingId ? 'บันทึกการแก้ไขการ์ด' : '+ บันทึกการ์ดเข้าฐานข้อมูล'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Starter Deck Creator */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-base text-amber-300 flex items-center gap-2">
          <Award className="w-5 h-5" /> สร้าง Starter Deck (40 ใบ) ให้ผู้เล่นเลือกใช้งานทันที
        </h3>
        <div className="grid sm:grid-cols-4 gap-3">
          <input
            type="text"
            value={starterName}
            onChange={(e) => setStarterName(e.target.value)}
            placeholder="ชื่อ Starter Deck..."
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
          />
          <select
            value={starterHeroId}
            onChange={(e) => setStarterHeroId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
          >
            <option value="">-- เลือกการ์ดร่างฮีโร่ --</option>
            {heroIdentities.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          <select
            value={starterAspect}
            onChange={(e) => setStarterAspect(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
          >
            {ASPECTS.filter((a) => !['HeroKit', 'Basics', 'Encounter'].includes(a.id)).map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
          <button type="button" onClick={handleCreateStarterDeck} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm py-2">
            + บันทึก Starter Deck ({starterCardIds.length} ใบเสริม)
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {cards
            .filter((c) => c.category === 'Aspect')
            .map((c) => {
              const cnt = starterCardIds.filter((id) => id === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setStarterCardIds((prev) => [...prev, c.id])}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs flex items-center gap-1.5"
                >
                  <span>{c.name}</span>
                  {cnt > 0 && <span className="px-1.5 bg-amber-500 text-slate-950 font-bold rounded">{cnt}</span>}
                </button>
              );
            })}
        </div>

        {starterDecks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
            {starterDecks.map((sd) => (
              <div key={sd.id} className="px-3 py-1.5 bg-slate-950 border border-amber-500/30 rounded-xl text-xs flex items-center gap-2">
                <span className="font-bold text-amber-200">{sd.name}</span>
                <span className="text-slate-400">({sd.cardIds.length} ใบ)</span>
                <button onClick={() => saveStarterDecks(starterDecks.filter((x) => x.id !== sd.id))} className="text-rose-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-base">การ์ดทั้งหมดในฐานข้อมูล ({filteredCards.length} ใบ)</h3>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อการ์ด..."
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs"
            >
              <option value="ALL">ทุกหมวดหมู่</option>
              {CARD_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {filteredCards.map((card) => (
            <div key={card.id} className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-col justify-between space-y-2">
              <div onClick={() => setInspectedCard(card)} className="cursor-pointer space-y-1">
                <div className="aspect-[63/88] bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-500 text-center p-2">{card.name}</span>
                  )}
                </div>
                <div className="font-bold text-xs truncate">{card.name}</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {card.type.split(' ')[0]} {card.type === 'พันธมิตร (Ally)' ? `• CD ${card.consequentialDamage ?? 1}` : ''}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button onClick={() => startEditCard(card)} className="py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded text-[11px] font-bold">
                  แก้ไข
                </button>
                <button onClick={() => deleteCard(card.id)} className="py-1 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded text-[11px]">
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
