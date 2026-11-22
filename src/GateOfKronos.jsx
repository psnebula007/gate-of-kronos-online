import React, { useState, useEffect } from 'react';
import {
  Shield, Swords, Sparkles, Users, Plus, Trash2, Upload, Download,
  Play, Lock, Layers, AlertTriangle, CheckCircle2,
  Settings, FolderOpen, Copy, X,
  Zap, Flame, Award, Undo2
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
  { id: 'HeroKit', label: 'ชุดประจำตัวฮีโร่', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'Aggression', label: 'Aggression (ดุดัน)', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
  { id: 'Justice', label: 'Justice (ยุติธรรม)', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  { id: 'Leadership', label: 'Leadership (ผู้นำ)', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  { id: 'Protection', label: 'Protection (ป้องกัน)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'Basics', label: 'Basics (พื้นฐาน)', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
  { id: 'Encounter', label: 'Encounter (เผชิญภัย)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' }
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

// Dynamic Field Configuration per Card Type
const TYPE_FIELD_CONFIG = {
  'ร่างฮีโร่ (Hero)': {
    showCost: false,
    showThw: true,
    showAtk: true,
    showDef: true,
    showRec: false,
    showSch: false,
    showHp: true,
    showConsequentialDamage: false,
    showHandSize: true,
    showThreatBase: false,
    showThreatThreshold: false,
    showResources: false,
    showBoostIcons: false,
    defaultMaxCopies: 1,
    hint: 'การ์ดร่างฮีโร่: กรอก THW, ATK, DEF, HP และขนาดมือ (Hand Size)'
  },
  'ร่างพลเรือน (Alter-Ego)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: true,
    showSch: false,
    showHp: true,
    showConsequentialDamage: false,
    showHandSize: true,
    showThreatBase: false,
    showThreatThreshold: false,
    showResources: false,
    showBoostIcons: false,
    defaultMaxCopies: 1,
    hint: 'การ์ดร่างพลเรือน: กรอก REC (ฟื้นฟู), HP และขนาดมือ (Hand Size)'
  },
  'พันธมิตร (Ally)': {
    showCost: true,
    showThw: true,
    showAtk: true,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: true,
    showConsequentialDamage: true,
    showHandSize: false,
    showThreatBase: false,
    showThreatThreshold: false,
    showResources: true,
    showBoostIcons: false,
    defaultMaxCopies: 1,
    hint: 'การ์ดพันธมิตร: กรอก Cost, THW, ATK, HP และ Consequential Damage (ความเสียหายต่อเนื่องเมื่อใช้ THW/ATK)'
  },
  'เหตุการณ์ (Event)': {
    showCost: true,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showConsequentialDamage: false,
    showHandSize: false,
    showThreatBase: false,
    showThreatThreshold: false,
    showResources: true,
    showBoostIcons: false,
    defaultMaxCopies: 3,
    hint: 'การ์ดเหตุการณ์: กรอก Cost, ทรัพยากรที่ให้ และจำนวนใบในเด็ค'
  },
  'อัปเกรด (Upgrade)': {
    showCost: true,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showConsequentialDamage: false,
    showHandSize: false,
    showThreatBase: false,
    showThreatThreshold: false,
    showResources: true,
    showBoostIcons: false,
    defaultMaxCopies: 2,
    hint: 'การ์ดอัปเกรด: กรอก Cost, ทรัพยากร และจำนวนใบ'
  },
  'สนับสนุน (Support)': {
    showCost: true,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showConsequentialDamage: false,
    showHandSize: false,
    showThreatBase: false,
    showThreatThreshold: false,
    showResources: true,
    showBoostIcons: false,
    defaultMaxCopies: 1,
    hint: 'การ์ดสนับสนุน: กรอก Cost, ทรัพยากร และจำนวนใบ'
  },
  'ทรัพยากร (Resource)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showConsequentialDamage: false,
    showHandSize: false,
    showThreatBase: false,
    showThreatThreshold: false,
    showResources: true,
    showBoostIcons: false,
    defaultMaxCopies: 3,
    hint: 'การ์ดทรัพยากร: ระบุจำนวนทรัพยากรสีต่างๆ ที่ให้เมื่อทิ้งจากมือ'
  },
  'ภาระผูกพัน (Obligation)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showConsequentialDamage: false,
    showHandSize: false,
    showThreatBase: false,
    showThreatThreshold: false,
    showResources: false,
    showBoostIcons: false,
    defaultMaxCopies: 1,
    hint: 'การ์ดภาระผูกพัน: กรอกข้อความเงื่อนไขและผลกระทบ'
  },
  'วายร้าย (Villain)': {
    showCost: false,
    showThw: false,
    showAtk: true,
    showDef: false,
    showRec: false,
    showSch: true,
    showHp: true,
    showConsequentialDamage: false,
    showHandSize: false,
    showThreatBase: false,
    showThreatThreshold: false,
    showResources: false,
    showBoostIcons: false,
    defaultMaxCopies: 1,
    hint: 'การ์ดวายร้าย: กรอก SCH (วางแผน), ATK, HP ต่อผู้เล่น และระบุสเตจ'
  },
  'แผนการหลัก (Main Scheme)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showConsequentialDamage: false,
    showHandSize: false,
    showThreatBase: true,
    showThreatThreshold: true,
    showResources: false,
    showBoostIcons: false,
    defaultMaxCopies: 1,
    hint: 'แผนการหลัก: กรอกแต้มภัยคุกคามเริ่มต้น และเพดานภัยคุกคามต่อผู้เล่น'
  },
  'แผนการรอง (Side Scheme)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showConsequentialDamage: false,
    showHandSize: false,
    showThreatBase: true,
    showThreatThreshold: false,
    showResources: false,
    showBoostIcons: true,
    defaultMaxCopies: 1,
    hint: 'แผนการรอง: กรอกภัยคุกคามเริ่มต้น และไอคอนบูสต์'
  },
  'ลูกสมุน (Minion)': {
    showCost: false,
    showThw: false,
    showAtk: true,
    showDef: false,
    showRec: false,
    showSch: true,
    showHp: true,
    showConsequentialDamage: false,
    showHandSize: false,
    showThreatBase: false,
    showThreatThreshold: false,
    showResources: false,
    showBoostIcons: true,
    defaultMaxCopies: 1,
    hint: 'การ์ดลูกสมุน: กรอก SCH, ATK, HP และไอคอนบูสต์'
  },
  'การทรยศ (Treachery)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showConsequentialDamage: false,
    showHandSize: false,
    showThreatBase: false,
    showThreatThreshold: false,
    showResources: false,
    showBoostIcons: true,
    defaultMaxCopies: 1,
    hint: 'การ์ดการทรยศ: กรอกผลเมื่อเปิดเผย (When Revealed) และไอคอนบูสต์'
  },
  'อุปกรณ์เสริม (Attachment)': {
    showCost: false,
    showThw: false,
    showAtk: false,
    showDef: false,
    showRec: false,
    showSch: false,
    showHp: false,
    showConsequentialDamage: false,
    showHandSize: false,
    showThreatBase: false,
    showThreatThreshold: false,
    showResources: false,
    showBoostIcons: true,
    defaultMaxCopies: 1,
    hint: 'การ์ดอุปกรณ์เสริม: กรอกเงื่อนไขการสวมใส่ ผลกระทบ และไอคอนบูสต์'
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
  hp: 1,
  consequentialAtk: 1,
  consequentialThw: 1,
  hpPerPlayer: false,
  handSize: 5,
  threatBase: 0,
  threatThreshold: 10,
  threatPerPlayer: true,
  resources: { red: 0, blue: 0, yellow: 0, wild: 0 },
  boostIcons: 0,
  traits: '',
  text: '',
  isUnique: false,
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
      const savedCards = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARDS) || '[]');
      const savedStarters = JSON.parse(localStorage.getItem(STORAGE_KEYS.STARTERS) || '[]');
      const savedCustoms = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_DECKS) || '[]');
      setCards(savedCards);
      setStarterDecks(savedStarters);
      setCustomDecks(savedCustoms);
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
        if (snap.exists()) {
          setRoomData(snap.data());
        }
      });
      return () => unsub();
    } else {
      const loadLocalRoom = () => {
        const rooms = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '{}');
        if (rooms[roomCode]) {
          setRoomData(rooms[roomCode]);
        }
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
    const nextStack = undoStack.slice(0, -1);
    setUndoStack(nextStack);

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
      const alerts = matched.map((card) => ({
        alertId: uid(),
        eventId,
        contextLabel,
        card
      }));
      setActiveTriggers((prev) => [...prev, ...alerts]);
    }
  };

  const createRoom = async () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const initialRoom = {
      code,
      hostId: playerId,
      status: 'waiting',
      scenario: {
        villainGroup: selectedVillainGroup,
        difficulty,
        sides: selectedSides
      },
      players: {
        [playerId]: {
          id: playerId,
          name: playerName,
          ready: false,
          deckId: '',
          deckSource: 'starter'
        }
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
        [playerId]: {
          ...roomData.players[playerId],
          deckSource: source,
          deckId,
          ready: Boolean(deckId)
        }
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
      encounterDeck.push({ ...c, instanceId: uid() });
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
        if (cardData) {
          fullDeck.push({ ...cardData, instanceId: uid() });
        }
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
      scenario: {
        villainGroup: selectedVillainGroup,
        difficulty,
        sides: selectedSides
      },
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
                    <h3 className="text-xl font-bold mt-1 text-white flex items-center gap-1.5">
                      {inspectedCard.isUnique && <span className="text-amber-400" title="การ์ดยูนีก (อยู่ในสนามได้เพียง 1 ใบ)">❂</span>}
                      <span>{inspectedCard.name}</span>
                    </h3>
                    {inspectedCard.subTitle && <p className="text-xs text-slate-400">{inspectedCard.subTitle}</p>}
                  </div>
                  <button onClick={() => setInspectedCard(null)} className="p-1 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {inspectedCard.traits && (
                  <p className="text-xs font-semibold text-amber-400 mt-2">แท็ก: {inspectedCard.traits}</p>
                )}

                <div className="grid grid-cols-4 gap-1.5 mt-3 text-center text-xs">
                  <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                    <div className="text-slate-400">Cost</div>
                    <div className="font-bold text-amber-300">{inspectedCard.cost ?? '-'}</div>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                    <div className="text-slate-400">THW/SCH</div>
                    <div className="font-bold text-sky-300">{inspectedCard.thw || inspectedCard.sch || 0}</div>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                    <div className="text-slate-400">ATK</div>
                    <div className="font-bold text-rose-300">{inspectedCard.atk || 0}</div>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                    <div className="text-slate-400">DEF/HP</div>
                    <div className="font-bold text-emerald-300">{inspectedCard.def || inspectedCard.hp || 0}</div>
                  </div>
                </div>

                {inspectedCard.type?.includes('พันธมิตร') && (
                  <div className="mt-2 text-xs text-rose-300 bg-rose-950/30 border border-rose-500/30 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                    <span>Consequential Damage:</span>
                    <span>
                      ATK: <strong className="text-rose-200">{inspectedCard.consequentialAtk ?? inspectedCard.consequentialDamage ?? 1}</strong> • THW: <strong className="text-sky-200">{inspectedCard.consequentialThw ?? inspectedCard.consequentialDamage ?? 1}</strong>
                    </span>
                  </div>
                )}

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
// 1. LOBBY & SCENARIO SETUP VIEW
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
                กรุณาเข้าไปที่หน้า <strong>Admin Studio</strong> เพื่อนำเข้ารูปภาพและกรอกข้อมูลการ์ด Core Set ของคุณ หรือ Import ไฟล์ JSON ที่บันทึกไว้ก่อนเริ่มจัดเด็คและตั้งห้องเล่นครับ
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

                {(selectedDeckSource === 'starter' ? starterDecks : customDecks).length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    ยังไม่มีเด็คในหมวดนี้ สามารถสร้างได้ที่หน้า{' '}
                    <button onClick={() => setActiveTab(selectedDeckSource === 'starter' ? 'admin' : 'deckbuilder')} className="text-amber-400 underline">
                      {selectedDeckSource === 'starter' ? 'Admin Studio' : 'จัดเด็ค'}
                    </button>
                  </div>
                )}
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500"
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
                        className="rounded text-rose-500 focus:ring-0"
                      />
                      <span>{side}</span>
                    </label>
                  ))}
                  {uniqueSideGroups.length === 0 && (
                    <p className="text-xs text-slate-500">ยังไม่มีชุดเสริมในฐานข้อมูล (เพิ่มได้ที่ Admin Studio หมวด Side)</p>
                  )}
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
                          {p.id === roomData.hostId && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded">หัวหน้าห้อง</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          เด็ค: {chosenDeck ? `${chosenDeck.name} (${chosenDeck.aspect})` : 'ยังไม่เลือกเด็ค'}
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
// 2. GATE OF KRONOS TABLETOP VIEW
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

  const [newSideSchemeName, setNewSideSchemeName] = useState('');
  const [newSideSchemeThreat, setNewSideSchemeThreat] = useState(3);

  const addLog = (logs, text) => [
    ...(logs || []).slice(-39),
    { id: uid(), time: new Date().toLocaleTimeString('th-TH'), text }
  ];

  const adjustVillainHp = async (delta) => {
    const nextHp = Math.max(0, table.villain.currentHp + delta);
    const updated = {
      ...roomData,
      table: {
        ...table,
        villain: { ...table.villain, currentHp: nextHp }
      },
      logs: addLog(roomData.logs, `${activePlayer.name} ปรับ HP วายร้าย (${delta > 0 ? '+' + delta : delta}) → เหลือ ${nextHp}`)
    };
    await persistRoomState(updated, { type: 'reversible' });
    if (delta < 0) fireGameEvent('damage_taken', `วายร้ายได้รับความเสียหาย ${Math.abs(delta)} หน่วย`);
  };

  const advanceVillainStage = async () => {
    const nextIdx = table.currentVillainStageIdx + 1;
    if (nextIdx >= (table.villainStages || []).length) {
      alert('🎉 ยินดีด้วย! คุณกำจัดวายร้ายสเตจสุดท้ายสำเร็จแล้ว!');
      return;
    }
    const nextStageCard = table.villainStages[nextIdx];
    const maxHp = Number(nextStageCard.hp || 18) * (nextStageCard.hpPerPlayer ? numPlayers : 1);
    const updated = {
      ...roomData,
      table: {
        ...table,
        currentVillainStageIdx: nextIdx,
        villain: {
          ...nextStageCard,
          currentHp: maxHp,
          maxHp,
          statuses: { stunned: false, confused: false, tough: nextStageCard.text?.includes('คงกระพัน') || false }
        }
      },
      logs: addLog(roomData.logs, `🔥 วายร้ายเข้าสู่สเตจถัดไป: ${nextStageCard.name} (HP ${maxHp})`)
    };
    await persistRoomState(updated, { type: 'reversible' });
  };

  const adjustMainThreat = async (delta) => {
    const nextThreat = Math.max(0, table.mainScheme.threat + delta);
    if (delta > 0) {
      fireGameEvent('threat_added', `กำลังจะเพิ่มแต้มภัยคุกคาม +${delta} แต้มลงบนแผนการหลัก`);
    }
    const updated = {
      ...roomData,
      table: {
        ...table,
        mainScheme: { ...table.mainScheme, threat: nextThreat }
      },
      logs: addLog(roomData.logs, `${activePlayer.name} ปรับภัยคุกคามแผนการหลัก (${delta > 0 ? '+' + delta : delta}) → ${nextThreat}/${table.mainScheme.threshold}`)
    };
    await persistRoomState(updated, { type: 'reversible' });
  };

  const toggleVillainStatus = async (statusKey) => {
    const current = table.villain.statuses?.[statusKey] || false;
    const updated = {
      ...roomData,
      table: {
        ...table,
        villain: {
          ...table.villain,
          statuses: { ...table.villain.statuses, [statusKey]: !current }
        }
      },
      logs: addLog(roomData.logs, `${activePlayer.name} ${!current ? 'ใส่' : 'ถอด'}สถานะ [${statusKey}] บนตัววายร้าย`)
    };
    await persistRoomState(updated, { type: 'reversible' });
  };

  const adjustPlayerHp = async (delta) => {
    if (!isMe) return;
    const nextHp = Math.max(0, Math.min(activePlayer.maxHp + 10, activePlayer.hp + delta));
    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: { ...activePlayer, hp: nextHp }
      },
      logs: addLog(roomData.logs, `${activePlayer.name} ปรับ HP ตัวเอง (${delta > 0 ? '+' + delta : delta}) → ${nextHp}/${activePlayer.maxHp}`)
    };
    await persistRoomState(updated, { type: 'reversible' });
    if (delta < 0) fireGameEvent('damage_taken', `${activePlayer.name} ได้รับความเสียหาย ${Math.abs(delta)} หน่วย`);
  };

  const flipIdentityForm = async () => {
    if (!isMe) return;
    const nextForm = activePlayer.form === 'hero' ? 'alter-ego' : 'hero';
    const nextIdentity = nextForm === 'hero' ? activePlayer.heroCard : activePlayer.alterCard;
    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: {
          ...activePlayer,
          form: nextForm,
          identity: nextIdentity
        }
      },
      logs: addLog(
        roomData.logs,
        `🔄 ${activePlayer.name} เปลี่ยนเป็น${nextForm === 'hero' ? 'ร่างฮีโร่ (Hero)' : 'ร่างพลเรือน (Alter-Ego)'}`
      )
    };
    await persistRoomState(updated, { type: 'reversible' });
    fireGameEvent(
      nextForm === 'hero' ? 'change_form_hero' : 'change_form_alter',
      `${activePlayer.name} เปลี่ยนเป็น${nextForm === 'hero' ? 'ร่างฮีโร่' : 'ร่างพลเรือน'}`
    );
  };

  const toggleIdentityExhaust = async () => {
    if (!isMe) return;
    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: { ...activePlayer, exhausted: !activePlayer.exhausted }
      },
      logs: addLog(roomData.logs, `${activePlayer.name} ${!activePlayer.exhausted ? 'ตะแคง' : 'ตั้งตรง'}การ์ดตัวละครหลัก`)
    };
    await persistRoomState(updated, { type: 'reversible' });
  };

  const togglePlayerStatus = async (statusKey) => {
    if (!isMe) return;
    const current = activePlayer.statuses?.[statusKey] || false;
    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: {
          ...activePlayer,
          statuses: { ...activePlayer.statuses, [statusKey]: !current }
        }
      },
      logs: addLog(roomData.logs, `${activePlayer.name} ${!current ? 'ได้รับ' : 'ถอด'}สถานะ [${statusKey}]`)
    };
    await persistRoomState(updated, { type: 'reversible' });
  };

  const playCardFromHand = async (instanceId) => {
    if (!isMe) return;
    const card = activePlayer.hand.find((c) => c.instanceId === instanceId);
    if (!card) return;

    if (card.isUnique) {
      const existingOwner = Object.values(players || {}).find((p) =>
        (p.playArea || []).some((pc) => pc.name === card.name)
      );
      if (existingOwner) {
        alert(
          `⚠️ การ์ดยูนีก (❂) "${card.name}" มีอยู่ในสนามแล้ว (ของ ${existingOwner.name}) ไม่สามารถลงซ้ำได้จนกว่าใบที่อยู่ในสนามจะหายไปครับ`
        );
        return;
      }
    }

    const remainingHand = activePlayer.hand.filter((c) => c.instanceId !== instanceId);
    const isPermanent = ['อัปเกรด (Upgrade)', 'สนับสนุน (Support)', 'พันธมิตร (Ally)'].includes(card.type);

    const nextPlayArea = isPermanent
      ? [...activePlayer.playArea, { ...card, exhausted: false, counters: 0, damageTaken: 0 }]
      : activePlayer.playArea;
    const nextDiscard = !isPermanent ? [...activePlayer.discard, card] : activePlayer.discard;

    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: {
          ...activePlayer,
          hand: remainingHand,
          playArea: nextPlayArea,
          discard: nextDiscard
        }
      },
      logs: addLog(roomData.logs, `🃏 ${activePlayer.name} เล่นการ์ด "${card.name}" (Cost ${card.cost})`)
    };
    await persistRoomState(updated, { type: 'reversible' });

    if (card.traits?.includes('การโจมตี')) fireGameEvent('hero_attacks', `${activePlayer.name} ใช้การโจมตี "${card.name}"`);
    if (card.traits?.includes('การขัดขวาง')) fireGameEvent('hero_thwarts', `${activePlayer.name} ใช้การขัดขวาง "${card.name}"`);
  };

  const discardCardFromHand = async (instanceId) => {
    if (!isMe) return;
    const card = activePlayer.hand.find((c) => c.instanceId === instanceId);
    if (!card) return;
    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: {
          ...activePlayer,
          hand: activePlayer.hand.filter((c) => c.instanceId !== instanceId),
          discard: [...activePlayer.discard, card]
        }
      },
      logs: addLog(roomData.logs, `🗑️ ${activePlayer.name} ทิ้งการ์ด "${card.name}" จากมือ (จ่ายทรัพยากร/ทิ้งการ์ด)`)
    };
    await persistRoomState(updated, { type: 'reversible' });
  };

  const togglePlayAreaCardExhaust = async (instanceId) => {
    if (!isMe) return;
    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: {
          ...activePlayer,
          playArea: activePlayer.playArea.map((c) =>
            c.instanceId === instanceId ? { ...c, exhausted: !c.exhausted } : c
          )
        }
      }
    };
    await persistRoomState(updated, { type: 'reversible' });
  };

  const applyAllyConsequentialDamage = async (card, mode = 'atk') => {
    if (!isMe) return;
    const cd =
      mode === 'thw'
        ? Number(card.consequentialThw ?? card.consequentialDamage ?? 1)
        : Number(card.consequentialAtk ?? card.consequentialDamage ?? 1);
    const actionLabel = mode === 'thw' ? 'ขัดขวาง (THW)' : 'โจมตี (ATK)';
    const nextDmg = (card.damageTaken || 0) + cd;
    const maxHp = Number(card.hp || 1);
    const defeated = nextDmg >= maxHp;

    const updatedPlayArea = defeated
      ? activePlayer.playArea.filter((c) => c.instanceId !== card.instanceId)
      : activePlayer.playArea.map((c) =>
          c.instanceId === card.instanceId ? { ...c, exhausted: true, damageTaken: nextDmg } : c
        );
    const updatedDiscard = defeated ? [...activePlayer.discard, card] : activePlayer.discard;

    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: {
          ...activePlayer,
          playArea: updatedPlayArea,
          discard: updatedDiscard
        }
      },
      logs: addLog(
        roomData.logs,
        defeated
          ? `💥 พันธมิตร "${card.name}" ${actionLabel} และรับ Consequential Damage ${cd} หน่วย → พลังชีวิตหมดและถูกทิ้ง!`
          : `⚔️ พันธมิตร "${card.name}" ${actionLabel} และรับ Consequential Damage ${cd} หน่วย (${nextDmg}/${maxHp})`
      )
    };
    await persistRoomState(updated, { type: 'reversible' });
  };

  const adjustPlayAreaCounter = async (instanceId, delta) => {
    if (!isMe) return;
    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: {
          ...activePlayer,
          playArea: activePlayer.playArea.map((c) =>
            c.instanceId === instanceId ? { ...c, counters: Math.max(0, (c.counters || 0) + delta) } : c
          )
        }
      }
    };
    await persistRoomState(updated, { type: 'reversible' });
  };

  const discardFromPlayArea = async (instanceId) => {
    if (!isMe) return;
    const card = activePlayer.playArea.find((c) => c.instanceId === instanceId);
    if (!card) return;
    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: {
          ...activePlayer,
          playArea: activePlayer.playArea.filter((c) => c.instanceId !== instanceId),
          discard: [...activePlayer.discard, card]
        }
      },
      logs: addLog(roomData.logs, `📤 ${activePlayer.name} นำ "${card.name}" ออกจากสนามลงกองทิ้ง`)
    };
    await persistRoomState(updated, { type: 'reversible' });
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
      if (deck.length > 0) {
        drawn.push(deck.shift());
      }
    }

    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: {
          ...activePlayer,
          deck,
          discard,
          hand: [...activePlayer.hand, ...drawn]
        }
      },
      logs: addLog(roomData.logs, `🎴 ${activePlayer.name} จั่วการ์ด ${drawn.length} ใบ (ล็อก Undo)`)
    };
    await persistRoomState(updated, {
      type: 'irreversible',
      reason: 'จั่วการ์ดขึ้นมือแล้ว ระบบล็อกการย้อนกลับเพื่อความยุติธรรม'
    });
    fireGameEvent('card_drawn', `${activePlayer.name} จั่วการ์ด ${drawn.length} ใบ`);
  };

  const endPlayerPhaseReadyUp = async () => {
    if (!isMe) return;
    const targetHandSize = Number(activePlayer.identity?.handSize || 5);
    const needToDraw = Math.max(0, targetHandSize - activePlayer.hand.length);

    let deck = [...activePlayer.deck];
    let discard = [...activePlayer.discard];
    const drawn = [];
    for (let i = 0; i < needToDraw; i++) {
      if (deck.length === 0 && discard.length > 0) {
        deck = shuffleArray(discard);
        discard = [];
      }
      if (deck.length > 0) drawn.push(deck.shift());
    }

    const updated = {
      ...roomData,
      players: {
        ...players,
        [playerId]: {
          ...activePlayer,
          exhausted: false,
          deck,
          discard,
          hand: [...activePlayer.hand, ...drawn],
          playArea: activePlayer.playArea.map((c) => ({ ...c, exhausted: false }))
        }
      },
      logs: addLog(
        roomData.logs,
        `✨ ${activePlayer.name} จบเฟสผู้เล่น: ตั้งตรงการ์ดทั้งหมด และจั่วการ์ดเพิ่ม ${drawn.length} ใบ (ครบ ${targetHandSize} ใบ)`
      )
    };
    await persistRoomState(updated, {
      type: 'irreversible',
      reason: 'จบเฟสผู้เล่นและจั่วการ์ดจนเต็มขนาดมือแล้ว'
    });
  };

  const revealEncounterOrBoost = async (mode) => {
    let encDeck = [...table.encounterDeck];
    let encDiscard = [...table.encounterDiscard];

    if (encDeck.length === 0 && encDiscard.length > 0) {
      encDeck = shuffleArray(encDiscard);
      encDiscard = [];
    }
    if (encDeck.length === 0) {
      alert('กองการ์ดเผชิญภัยว่างเปล่า (กรุณาเพิ่มการ์ด Scenario / Side ในหน้า Admin)');
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
      logs: addLog(
        roomData.logs,
        mode === 'boost'
          ? `⚡ เปิดการ์ดบูสต์: "${revealed.name}" (+${revealed.boostIcons || 0} บูสต์)`
          : `👁️ เปิดเผยการ์ดเผชิญภัย: "${revealed.name}" (${revealed.type})`
      )
    };
    await persistRoomState(updated, {
      type: 'irreversible',
      reason: 'เปิดเผยการ์ดจากกองเผชิญภัยแล้ว ไม่สามารถย้อนกลับได้'
    });

    if (mode === 'encounter') {
      fireGameEvent('treachery_revealed', `เปิดเผยการ์ดเผชิญภัย "${revealed.name}"`);
    }
  };

  const triggerVillainAttackAlert = () => {
    fireGameEvent('enemy_attacks', `${table.villain.name} กำลังจะโจมตีใส่ ${activePlayer.name}!`);
  };

  const resolveTriggerAlert = async (alertObj) => {
    const { card, alertId } = alertObj;
    const val = Number(card.effectValue || 1);

    if (card.effectAction === 'deal_damage_villain') await adjustVillainHp(-val);
    if (card.effectAction === 'remove_threat_main') await adjustMainThreat(-val);
    if (card.effectAction === 'heal_hero') await adjustPlayerHp(val);
    if (card.effectAction === 'draw_cards') await drawCards(val);
    if (card.effectAction === 'stun_villain') await toggleVillainStatus('stunned');
    if (card.effectAction === 'confuse_villain') await toggleVillainStatus('confused');
    if (card.effectAction === 'tough_hero') await togglePlayerStatus('tough');
    if (card.effectAction === 'prevent_threat') await adjustMainThreat(-1);

    setActiveTriggers((prev) => prev.filter((a) => a.alertId !== alertId));
  };

  const addSideScheme = async () => {
    if (!newSideSchemeName.trim()) return;
    const updated = {
      ...roomData,
      table: {
        ...table,
        sideSchemes: [
          ...(table.sideSchemes || []),
          { id: uid(), name: newSideSchemeName.trim(), threat: Number(newSideSchemeThreat) }
        ]
      },
      logs: addLog(roomData.logs, `📌 เพิ่มแผนการรอง "${newSideSchemeName}" (${newSideSchemeThreat} ภัยคุกคาม)`)
    };
    setNewSideSchemeName('');
    await persistRoomState(updated, { type: 'reversible' });
  };

  const adjustSideSchemeThreat = async (id, delta) => {
    const updatedSchemes = (table.sideSchemes || [])
      .map((s) => (s.id === id ? { ...s, threat: Math.max(0, s.threat + delta) } : s))
      .filter((s) => s.threat > 0);
    const updated = {
      ...roomData,
      table: { ...table, sideSchemes: updatedSchemes }
    };
    await persistRoomState(updated, { type: 'reversible' });
  };

  return (
    <div className="space-y-4">
      {activeTriggers.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border-2 border-amber-400 rounded-2xl p-4 shadow-2xl shadow-amber-500/20 space-y-3 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-extrabold">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>แจ้งเตือนจังหวะใช้งานการ์ด! ({activeTriggers[0].contextLabel})</span>
            </div>
            <button
              onClick={() => setActiveTriggers([])}
              className="text-xs text-slate-300 hover:text-white underline"
            >
              ข้ามทั้งหมด
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {activeTriggers.map((trig) => (
              <div key={trig.alertId} className="bg-slate-900/90 border border-indigo-400/40 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    {trig.card.triggerTiming} • จาก{trig.card.zone}
                  </span>
                  <div className="font-bold text-sm text-white mt-1">{trig.card.name}</div>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">{trig.card.text}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => resolveTriggerAlert(trig)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap"
                  >
                    ใช้งาน!
                  </button>
                  <button
                    onClick={() => setActiveTriggers((prev) => prev.filter((a) => a.alertId !== trig.alertId))}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                  >
                    ไม่ใช้
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">กระดานผู้เล่น:</span>
          {Object.values(players).map((p) => (
            <button
              key={p.id}
              onClick={() => setViewingPlayerId(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                activePlayer?.id === p.id
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{p.name}</span>
              <span className="px-1.5 py-0.2 bg-black/20 rounded">HP {p.hp}</span>
              <span className="px-1.5 py-0.2 bg-black/20 rounded">มือ {p.hand?.length || 0}</span>
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
              undoStack.length > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-4 h-4" /> ย้อนกลับ ({undoStack.length})
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-slate-900 border border-rose-500/30 rounded-2xl p-4 flex gap-4">
          <div
            onClick={() => setInspectedCard(table.villain)}
            className="w-32 aspect-[63/88] bg-slate-950 rounded-xl border border-slate-700 overflow-hidden flex-shrink-0 cursor-pointer hover:border-rose-400 transition flex items-center justify-center"
          >
            {table.villain.imageUrl ? (
              <img src={table.villain.imageUrl} alt={table.villain.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-slate-500 text-center p-2">{table.villain.name}</span>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                  วายร้าย • สเตจ {table.villain.stage || 1}
                </span>
                <button
                  onClick={advanceVillainStage}
                  className="text-xs px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg"
                >
                  เลื่อนสเตจ →
                </button>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-1">{table.villain.name}</h3>
              <div className="text-xs text-slate-400">
                SCH: <strong className="text-amber-300">{table.villain.sch || 0}</strong> • ATK:{' '}
                <strong className="text-rose-300">{table.villain.atk || 0}</strong>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">พลังชีวิต (HP)</span>
              <div className="flex items-center gap-2">
                <button onClick={() => adjustVillainHp(-1)} className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-500 font-bold">-1</button>
                <span className="text-xl font-black text-rose-400 w-14 text-center">{table.villain.currentHp}</span>
                <button onClick={() => adjustVillainHp(1)} className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold">+1</button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'stunned', label: 'มึนงง (Stun)' },
                { key: 'confused', label: 'สับสน (Confuse)' },
                { key: 'tough', label: 'คงกระพัน (Tough)' }
              ].map((st) => (
                <button
                  key={st.key}
                  onClick={() => toggleVillainStatus(st.key)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${
                    table.villain.statuses?.[st.key]
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {st.label}
                </button>
              ))}
              <button
                onClick={triggerVillainAttackAlert}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-600/30 border border-rose-500/50 text-rose-200 hover:bg-rose-600/50"
              >
                ⚔️ วายร้ายโจมตี!
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">แผนการหลัก (Main Scheme)</span>
            <h3 className="text-base font-bold text-white mt-1">{table.mainScheme.name}</h3>
            <div className="mt-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">แต้มภัยคุกคาม</span>
              <div className="flex items-center gap-2">
                <button onClick={() => adjustMainThreat(-1)} className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold">-1</button>
                <span className="text-lg font-black text-amber-400">
                  {table.mainScheme.threat} / {table.mainScheme.threshold}
                </span>
                <button onClick={() => adjustMainThreat(1)} className="w-7 h-7 rounded-lg bg-amber-600 hover:bg-amber-500 font-bold">+1</button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-400">แผนการรอง (Side Schemes)</div>
            {(table.sideSchemes || []).map((ss) => (
              <div key={ss.id} className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
                <span className="truncate font-medium">{ss.name}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => adjustSideSchemeThreat(ss.id, -1)} className="px-1.5 py-0.5 bg-sky-600 rounded">-1</button>
                  <span className="font-bold text-amber-300">{ss.threat}</span>
                  <button onClick={() => adjustSideSchemeThreat(ss.id, 1)} className="px-1.5 py-0.5 bg-amber-600 rounded">+1</button>
                </div>
              </div>
            ))}
            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newSideSchemeName}
                onChange={(e) => setNewSideSchemeName(e.target.value)}
                placeholder="ชื่อแผนการรอง..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs"
              />
              <input
                type="number"
                value={newSideSchemeThreat}
                onChange={(e) => setNewSideSchemeThreat(e.target.value)}
                className="w-12 bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1 text-xs text-center"
              />
              <button onClick={addSideScheme} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold">
                + เพิ่ม
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-slate-900 border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300">กองเผชิญภัย ({table.encounterDeck?.length || 0} ใบ)</span>
              <span className="text-xs text-slate-400">กองทิ้ง ({table.encounterDiscard?.length || 0})</span>
            </div>

            {table.revealedEncounter ? (
              <div
                onClick={() => setInspectedCard(table.revealedEncounter)}
                className="mt-2 p-2.5 bg-slate-950 border border-purple-500/40 rounded-xl cursor-pointer hover:border-purple-400"
              >
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                  {table.revealedEncounter.mode === 'boost' ? 'การ์ดบูสต์ (Boost)' : 'เปิดเผย (Revealed)'}
                </span>
                <div className="font-bold text-sm mt-1">{table.revealedEncounter.name}</div>
                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{table.revealedEncounter.text}</p>
              </div>
            ) : (
              <div className="mt-2 h-24 bg-slate-950 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
                ยังไม่มีการ์ดเผชิญภัยที่เปิดเผย
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => revealEncounterOrBoost('boost')}
              className="py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold rounded-xl text-xs"
            >
              ⚡ เปิดการ์ดบูสต์
            </button>
            <button
              onClick={() => revealEncounterOrBoost('encounter')}
              className="py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs"
            >
              👁️ เปิดเผชิญภัย
            </button>
          </div>
        </div>
      </div>

      {activePlayer && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 md:w-96 flex-shrink-0">
              <div
                onClick={() => setInspectedCard(activePlayer.identity)}
                className={`w-28 aspect-[63/88] bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex-shrink-0 cursor-pointer transition-transform ${
                  activePlayer.exhausted ? 'rotate-6 opacity-75 ring-2 ring-amber-500' : ''
                }`}
              >
                {activePlayer.identity?.imageUrl ? (
                  <img src={activePlayer.identity.imageUrl} alt={activePlayer.identity.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="p-2 text-center text-xs text-slate-500">{activePlayer.identity?.name}</div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    activePlayer.form === 'hero' ? 'bg-rose-500/20 text-rose-300' : 'bg-sky-500/20 text-sky-300'
                  }`}>
                    {activePlayer.form === 'hero' ? 'ร่างฮีโร่ (Hero)' : 'ร่างพลเรือน (Alter-Ego)'}
                  </span>
                  <h4 className="font-extrabold text-base mt-1">{activePlayer.identity?.name}</h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {activePlayer.form === 'hero'
                      ? `THW ${activePlayer.identity?.thw || 0} • ATK ${activePlayer.identity?.atk || 0} • DEF ${activePlayer.identity?.def || 0}`
                      : `REC ${activePlayer.identity?.rec || 0} • ขนาดมือ ${activePlayer.identity?.handSize || 6}`}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">HP</span>
                  <div className="flex items-center gap-1.5">
                    <button disabled={!isMe} onClick={() => adjustPlayerHp(-1)} className="w-6 h-6 bg-rose-600 rounded font-bold text-xs">-1</button>
                    <span className="font-black text-emerald-400 text-sm">{activePlayer.hp}/{activePlayer.maxHp}</span>
                    <button disabled={!isMe} onClick={() => adjustPlayerHp(1)} className="w-6 h-6 bg-emerald-600 rounded font-bold text-xs">+1</button>
                  </div>
                </div>

                {isMe && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={flipIdentityForm}
                      className="py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs"
                    >
                      🔄 พลิกร่าง
                    </button>
                    <button
                      onClick={toggleIdentityExhaust}
                      className="py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg text-xs"
                    >
                      {activePlayer.exhausted ? 'ตั้งตรง' : 'ตะแคง'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">
                    พื้นที่สนาม: อัปเกรด / สนับสนุน / พันธมิตร ({activePlayer.playArea?.length || 0} ใบ)
                  </span>
                  <div className="flex gap-1.5">
                    {['stunned', 'confused', 'tough'].map((st) => (
                      <button
                        key={st}
                        disabled={!isMe}
                        onClick={() => togglePlayerStatus(st)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          activePlayer.statuses?.[st]
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}
                      >
                        {st === 'stunned' ? 'มึนงง' : st === 'confused' ? 'สับสน' : 'คงกระพัน'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2.5 overflow-x-auto pb-2 min-h-[120px]">
                  {(activePlayer.playArea || []).map((card) => {
                    const isAlly = card.type?.includes('พันธมิตร');
                    const cdAtk = Number(card.consequentialAtk ?? card.consequentialDamage ?? 1);
                    const cdThw = Number(card.consequentialThw ?? card.consequentialDamage ?? 1);
                    const dmgTaken = Number(card.damageTaken || 0);
                    const maxHp = Number(card.hp || 1);
                    return (
                      <div
                        key={card.instanceId}
                        className={`w-36 flex-shrink-0 bg-slate-900 border rounded-xl p-2 flex flex-col justify-between transition ${
                          card.exhausted ? 'border-amber-500/60 opacity-75' : 'border-slate-700'
                        }`}
                      >
                        <div onClick={() => setInspectedCard(card)} className="cursor-pointer">
                          <div className="text-[11px] font-bold truncate text-white">{card.isUnique ? `❂ ${card.name}` : card.name}</div>
                          <div className="text-[10px] text-slate-400">{card.type.split(' ')[0]}</div>
                          {isAlly && (
                            <div className="text-[10px] text-rose-300 mt-0.5">
                              HP: {Math.max(0, maxHp - dmgTaken)}/{maxHp} • CD ATK:{cdAtk} / THW:{cdThw}
                            </div>
                          )}
                        </div>

                        {isAlly ? (
                          isMe && (
                            <div className="grid grid-cols-2 gap-1 my-1">
                              <button
                                onClick={() => applyAllyConsequentialDamage(card, 'atk')}
                                className="py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 rounded text-[10px] font-bold"
                              >
                                ATK -{cdAtk}
                              </button>
                              <button
                                onClick={() => applyAllyConsequentialDamage(card, 'thw')}
                                className="py-1 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 rounded text-[10px] font-bold"
                              >
                                THW -{cdThw}
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center justify-between my-1 text-xs bg-slate-950 px-1.5 py-0.5 rounded">
                            <span className="text-[10px] text-slate-400">ตัวนับ</span>
                            <div className="flex items-center gap-1">
                              <button disabled={!isMe} onClick={() => adjustPlayAreaCounter(card.instanceId, -1)} className="text-slate-400 hover:text-white">-</button>
                              <span className="font-bold text-amber-300">{card.counters || 0}</span>
                              <button disabled={!isMe} onClick={() => adjustPlayAreaCounter(card.instanceId, 1)} className="text-slate-400 hover:text-white">+</button>
                            </div>
                          </div>
                        )}

                        {isMe && (
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              onClick={() => togglePlayAreaCardExhaust(card.instanceId)}
                              className="py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-amber-300"
                            >
                              {card.exhausted ? 'ตั้งตรง' : 'ตะแคง'}
                            </button>
                            <button
                              onClick={() => discardFromPlayArea(card.instanceId)}
                              className="py-1 bg-rose-950/60 hover:bg-rose-900/60 rounded text-[10px] text-rose-300"
                            >
                              ทิ้ง
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(activePlayer.playArea || []).length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-xs text-slate-600">
                      ยังไม่มีการ์ดอัปเกรด สนับสนุน หรือพันธมิตรบนสนาม
                    </div>
                  )}
                </div>
              </div>

              {isMe && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    กองจั่ว: <strong className="text-white">{activePlayer.deck?.length || 0}</strong> • กองทิ้ง:{' '}
                    <strong className="text-white">{activePlayer.discard?.length || 0}</strong>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => drawCards(1)}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      + จั่วการ์ด 1 ใบ
                    </button>
                    <button
                      onClick={endPlayerPhaseReadyUp}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      จบเทิร์น (ตั้งตรง + จั่วเต็มมือ)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300">
                การ์ดในมือของ {activePlayer.name} ({activePlayer.hand?.length || 0} ใบ)
              </span>
              {!isMe && <span className="text-xs text-slate-500">(ซ่อนหน้าการ์ดในมือของเพื่อน)</span>}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {(activePlayer.hand || []).map((card) =>
                isMe ? (
                  <div
                    key={card.instanceId}
                    className="w-36 flex-shrink-0 bg-slate-900 border border-slate-700 hover:border-amber-400 rounded-xl p-2 flex flex-col justify-between transition"
                  >
                    <div onClick={() => setInspectedCard(card)} className="cursor-pointer space-y-1.5">
                      <div className="aspect-[63/88] bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
                        {card.imageUrl ? (
                          <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[11px] text-center p-2 text-slate-400">{card.name}</span>
                        )}
                      </div>
                      <div className="font-bold text-xs truncate text-white">{card.isUnique ? `❂ ${card.name}` : card.name}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Cost: {card.cost}</span>
                        <span>
                          {card.resources?.red ? `🔴${card.resources.red}` : ''}
                          {card.resources?.blue ? `🔵${card.resources.blue}` : ''}
                          {card.resources?.yellow ? `🟡${card.resources.yellow}` : ''}
                          {card.resources?.wild ? `🌈${card.resources.wild}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1 mt-2">
                      <button
                        onClick={() => playCardFromHand(card.instanceId)}
                        className="py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px]"
                      >
                        เล่นการ์ด
                      </button>
                      <button
                        onClick={() => discardCardFromHand(card.instanceId)}
                        className="py-1 bg-slate-800 hover:bg-rose-900/60 text-slate-300 rounded text-[11px]"
                      >
                        ทิ้ง/จ่าย
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={card.instanceId}
                    className="w-24 aspect-[63/88] flex-shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl flex items-center justify-center text-xs font-bold text-slate-500"
                  >
                    GOK
                  </div>
                )
              )}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1 text-xs">
            <div className="font-bold text-slate-400 mb-1">บันทึกเหตุการณ์ในห้อง (Game Log)</div>
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
// 3. CUSTOM DECK BUILDER VIEW
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

  const heroKitExpanded = heroKitCards.map((c) => c.id);
  const heroKitNameCounts = heroKitCards.reduce((acc, c) => {
    acc[c.name] = (acc[c.name] || 0) + 1;
    return acc;
  }, {});
  const overThreeHeroKitNames = Object.entries(heroKitNameCounts)
    .filter(([, cnt]) => cnt > 3)
    .map(([name]) => name);

  const poolCards = cards.filter(
    (c) => c.category === 'Aspect' && (c.aspect === chosenAspect || c.aspect === 'Basics')
  );

  const totalCards = heroKitExpanded.length + addedAspectCardIds.length;

  const getNonKitCountByName = (cardName) =>
    addedAspectCardIds.filter((id) => {
      const found = cards.find((c) => c.id === id);
      return found?.name === cardName;
    }).length;

  const addCardToDeck = (card) => {
    if (totalCards >= 50) {
      alert('เด็คมีจำนวนสูงสุดได้ไม่เกิน 50 ใบครับ');
      return;
    }
    const sameNameCount = getNonKitCountByName(card.name);
    if (sameNameCount >= 3) {
      alert(`⚠️ ใส่การ์ดชื่อ "${card.name}" ได้ไม่เกิน 3 ใบต่อเด็คครับ (ยกเว้นชุดประจำตัวฮีโร่)`);
      return;
    }
    setAddedAspectCardIds((prev) => [...prev, card.id]);
  };

  const removeCardFromDeck = (cardId) => {
    const idx = addedAspectCardIds.indexOf(cardId);
    if (idx === -1) return;
    const copy = [...addedAspectCardIds];
    copy.splice(idx, 1);
    setAddedAspectCardIds(copy);
  };

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
        <h2 className="text-lg font-bold text-sky-300">คลังการ์ดสำหรับจัดเด็ค (Custom Deck Builder)</h2>

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

        <div className="grid sm:grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
          {poolCards.map((card) => {
            const count = addedAspectCardIds.filter((id) => id === card.id).length;
            return (
              <div key={card.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
                <div onClick={() => setInspectedCard(card)} className="cursor-pointer min-w-0">
                  <div className="font-bold text-sm truncate">{card.isUnique ? `❂ ${card.name}` : card.name}</div>
                  <div className="text-xs text-slate-400">
                    Cost {card.cost} • {card.aspect} • {card.type.split(' ')[0]}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => removeCardFromDeck(card.id)} className="w-7 h-7 bg-slate-800 rounded-lg font-bold">-</button>
                  <span className="text-xs font-bold w-8 text-center">{getNonKitCountByName(card.name)}/3</span>
                  <button onClick={() => addCardToDeck(card)} className="w-7 h-7 bg-sky-500 text-slate-950 rounded-lg font-bold">+</button>
                </div>
              </div>
            );
          })}
          {poolCards.length === 0 && (
            <div className="col-span-2 text-center py-8 text-xs text-slate-500">
              ยังไม่มีการ์ดสาย {chosenAspect} หรือ Basics ในฐานข้อมูล (เพิ่มได้ที่หน้า Admin Studio)
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">รายการการ์ดในเด็ค</h3>
            <span className={`text-sm font-black ${totalCards >= 40 && totalCards <= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalCards} / 40–50 ใบ
            </span>
          </div>

          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="ตั้งชื่อ Custom Deck ของคุณ..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
          />

          <div className="text-xs text-amber-300 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/30 space-y-1">
            <div>ชุดการ์ดประจำตัวฮีโร่: {heroKitExpanded.length} ใบ (ดึงให้อัตโนมัติ • ยกเว้นกฎใส่ซ้ำเกิน 3 ใบ)</div>
            {overThreeHeroKitNames.length > 0 && (
              <div className="text-emerald-300">
                ✓ ชุดฮีโร่มีการ์ดซ้ำเกิน 3 ใบ: {overThreeHeroKitNames.join(', ')} (ได้รับอนุญาตตามกติกา)
              </div>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            * กติกาการจัดเด็ค: ใส่การ์ดชื่อเดียวกันได้ไม่เกิน 3 ใบ (ยกเว้นการ์ดในชุดประจำตัวฮีโร่)
          </div>

          <button
            onClick={handleSaveCustomDeck}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm"
          >
            บันทึก Custom Deck
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <h3 className="font-bold text-sm text-slate-300">Custom Decks ที่บันทึกไว้ ({customDecks.length})</h3>
          {customDecks.map((d) => (
            <div key={d.id} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <div className="font-bold">{d.name}</div>
                <div className="text-slate-400">{d.cardIds.length} ใบ</div>
              </div>
              <button
                onClick={() => saveCustomDecks(customDecks.filter((x) => x.id !== d.id))}
                className="p-1.5 text-rose-400 hover:bg-rose-950/50 rounded-lg"
              >
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

  const fieldCfg = TYPE_FIELD_CONFIG[form.type] || TYPE_FIELD_CONFIG['เหตุการณ์ (Event)'];

  const handleTypeChange = (newType) => {
    const cfg = TYPE_FIELD_CONFIG[newType] || {};
    setForm((prev) => ({
      ...prev,
      type: newType,
      maxCopies: cfg.defaultMaxCopies ?? prev.maxCopies,
      consequentialAtk: newType.includes('พันธมิตร') ? (prev.consequentialAtk ?? 1) : 0,
      consequentialThw: newType.includes('พันธมิตร') ? (prev.consequentialThw ?? 1) : 0
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, imageUrl: reader.result }));
    };
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
              const baseName = file.name.replace(/\.[^/.]+$/, '');
              resolve({
                ...emptyCardForm,
                id: 'CARD-' + uid(),
                name: baseName,
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
      alert(`นำเข้ารูปภาพการ์ด ${newCards.length} ใบเรียบร้อย! คลิกที่การ์ดแต่ละใบเพื่อกรอกค่าพลังและความสามารถต่อได้เลยครับ`);
    });
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('กรุณากรอกชื่อการ์ด');
      return;
    }

    if (editingId) {
      const updated = cards.map((c) => (c.id === editingId ? { ...form, id: editingId } : c));
      saveCardDatabase(updated);
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
        alert(`นำเข้าฐานข้อมูลสำเร็จ! (${parsed.cards?.length || 0} การ์ด, ${parsed.starterDecks?.length || 0} Starter Decks)`);
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
    const kitIds = heroKit.map((c) => c.id);

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
            <Settings className="w-5 h-5" /> Admin Card Studio — จัดการฐานข้อมูลการ์ด Gate of Kronos
          </h2>
          <p className="text-xs text-slate-400">
            เลือกประเภทการ์ดก่อน ระบบจะแสดงเฉพาะช่องที่จำเป็นสำหรับประเภทนั้นๆ อัตโนมัติ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5">
            <FolderOpen className="w-4 h-4" /> นำเข้ารูปหลายใบ (Batch)
            <input type="file" accept="image/*" multiple onChange={handleBatchImageImport} className="hidden" />
          </label>

          <button
            onClick={exportJson}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
          >
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
            {editingId ? `✏️ แก้ไขการ์ด: ${form.name}` : '➕ เพิ่มการ์ดใหม่เข้าสู่ระบบ'}
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

          <div className="lg:col-span-9 space-y-4">
            {/* Step 1: Select Card Type First + Name & Group */}
            <div className="grid sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-amber-500/30">
              <div>
                <label className="text-xs font-bold text-amber-300 block mb-1">1. ประเภทการ์ด *</label>
                <select
                  value={form.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-sm font-bold text-white"
                >
                  {CARD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300">2. ชื่อการ์ด *</label>
                  <label className="flex items-center gap-1.5 text-xs text-amber-300 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(form.isUnique)}
                      onChange={(e) => setForm({ ...form, isUnique: e.target.checked })}
                      className="rounded text-amber-500"
                    />
                    <span>❂ การ์ดยูนีก (มีในสนามได้ใบเดียว)</span>
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="เช่น นิค ฟิวรี / โซโล / บากี้"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">เรื่องอนิเมะ</label>
                <select
                  value={form.series}
                  onChange={(e) => setForm({ ...form, series: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                >
                  {ANIME_SERIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4 text-xs text-amber-200/90 pt-1">
                💡 {fieldCfg.hint}
              </div>
            </div>

            {/* Category, Aspect, Owner / Set */}
            <div className="grid sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">หมวดโฟลเดอร์หลัก</label>
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
                <label className="text-xs text-slate-400 block mb-1">เจ้าของชุดฮีโร่ (Hero Set)</label>
                <input
                  type="text"
                  value={form.heroOwner}
                  onChange={(e) => setForm({ ...form, heroOwner: e.target.value })}
                  placeholder="เช่น มังกี้ ดี. ลูฟี่"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">ชื่อชุด Scenario / Side</label>
                <input
                  type="text"
                  value={form.setGroup}
                  onChange={(e) => setForm({ ...form, setGroup: e.target.value })}
                  placeholder="เช่น เพน / องค์กรแสงอุษา"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Dynamic Stat Fields Based on Selected Card Type */}
            <div className="flex flex-wrap gap-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {fieldCfg.showCost && (
                <div className="w-20">
                  <label className="text-[11px] text-amber-300 font-bold block mb-0.5">Cost</label>
                  <input
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fieldCfg.showThw && (
                <div className="w-20">
                  <label className="text-[11px] text-sky-300 font-bold block mb-0.5">THW</label>
                  <input
                    type="number"
                    value={form.thw}
                    onChange={(e) => setForm({ ...form, thw: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fieldCfg.showAtk && (
                <div className="w-20">
                  <label className="text-[11px] text-rose-300 font-bold block mb-0.5">ATK</label>
                  <input
                    type="number"
                    value={form.atk}
                    onChange={(e) => setForm({ ...form, atk: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fieldCfg.showDef && (
                <div className="w-20">
                  <label className="text-[11px] text-emerald-300 font-bold block mb-0.5">DEF</label>
                  <input
                    type="number"
                    value={form.def}
                    onChange={(e) => setForm({ ...form, def: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fieldCfg.showRec && (
                <div className="w-20">
                  <label className="text-[11px] text-teal-300 font-bold block mb-0.5">REC</label>
                  <input
                    type="number"
                    value={form.rec}
                    onChange={(e) => setForm({ ...form, rec: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fieldCfg.showSch && (
                <div className="w-20">
                  <label className="text-[11px] text-amber-300 font-bold block mb-0.5">SCH</label>
                  <input
                    type="number"
                    value={form.sch}
                    onChange={(e) => setForm({ ...form, sch: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fieldCfg.showHp && (
                <div className="w-20">
                  <label className="text-[11px] text-emerald-300 font-bold block mb-0.5">HP</label>
                  <input
                    type="number"
                    value={form.hp}
                    onChange={(e) => setForm({ ...form, hp: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fieldCfg.showConsequentialDamage && (
                <>
                  <div className="w-24">
                    <label className="text-[11px] text-rose-400 font-extrabold block mb-0.5">CD (ATK)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.consequentialAtk}
                      onChange={(e) => setForm({ ...form, consequentialAtk: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-rose-500/60 rounded-lg px-2 py-1.5 text-xs text-center text-rose-200 font-bold"
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-[11px] text-sky-400 font-extrabold block mb-0.5">CD (THW)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.consequentialThw}
                      onChange={(e) => setForm({ ...form, consequentialThw: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-sky-500/60 rounded-lg px-2 py-1.5 text-xs text-center text-sky-200 font-bold"
                    />
                  </div>
                </>
              )}

              {fieldCfg.showHandSize && (
                <div className="w-24">
                  <label className="text-[11px] text-indigo-300 font-bold block mb-0.5">ขนาดมือ</label>
                  <input
                    type="number"
                    value={form.handSize}
                    onChange={(e) => setForm({ ...form, handSize: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fieldCfg.showThreatBase && (
                <div className="w-28">
                  <label className="text-[11px] text-amber-300 font-bold block mb-0.5">ภัยคุกคามเริ่ม</label>
                  <input
                    type="number"
                    value={form.threatBase}
                    onChange={(e) => setForm({ ...form, threatBase: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fieldCfg.showThreatThreshold && (
                <div className="w-28">
                  <label className="text-[11px] text-rose-300 font-bold block mb-0.5">เพดาน/ผู้เล่น</label>
                  <input
                    type="number"
                    value={form.threatThreshold}
                    onChange={(e) => setForm({ ...form, threatThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}

              {fieldCfg.showBoostIcons && (
                <div className="w-24">
                  <label className="text-[11px] text-purple-300 font-bold block mb-0.5">ไอคอนบูสต์</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={form.boostIcons}
                    onChange={(e) => setForm({ ...form, boostIcons: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                  />
                </div>
              )}


            </div>

            {/* Resources & Traits */}
            <div className="grid sm:grid-cols-2 gap-3">
              {fieldCfg.showResources ? (
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
                            setForm({
                              ...form,
                              resources: { ...form.resources, [res.key]: Number(e.target.value) }
                            })
                          }
                          className="w-9 bg-slate-900 border border-slate-700 rounded text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-xs text-slate-500 bg-slate-950/40 rounded-xl px-3 border border-slate-800/60">
                  การ์ดประเภทนี้ไม่ต้องกรอกทรัพยากรที่ให้
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">แท็ก (Traits)</label>
                <input
                  type="text"
                  value={form.traits}
                  onChange={(e) => setForm({ ...form, traits: e.target.value })}
                  placeholder="เช่น พันธมิตร, นักดาบ, โจรสลัด"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm"
                />
              </div>
            </div>

            {(form.category === 'Scenario' || form.category === 'Side') && (
              <div className="grid sm:grid-cols-3 gap-3 bg-rose-950/20 border border-rose-500/30 p-3 rounded-xl">
                <div>
                  <label className="text-xs text-rose-200 block mb-1">สเตจวายร้าย/แผนการ</label>
                  <input
                    type="text"
                    value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value })}
                    placeholder="1, 2, 3 หรือ 1B"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={form.hpPerPlayer}
                    onChange={(e) => setForm({ ...form, hpPerPlayer: e.target.checked })}
                  />
                  <span>HP คูณจำนวนผู้เล่น</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={form.threatPerPlayer}
                    onChange={(e) => setForm({ ...form, threatPerPlayer: e.target.checked })}
                  />
                  <span>ภัยคุกคามคูณจำนวนผู้เล่น</span>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 block mb-1">ข้อความความสามารถบนการ์ด</label>
              <textarea
                rows={3}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="กรอกข้อความความสามารถของการ์ด..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3.5 space-y-3">
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
                  <label className="text-[11px] text-slate-400 block mb-1">3. ผลลัพธ์อัตโนมัติ</label>
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
                  <label className="text-[11px] text-slate-400 block mb-1">4. ค่าตัวเลข (หน่วย/แต้ม)</label>
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
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-sm transition"
              >
                {editingId ? 'บันทึกการแก้ไขการ์ด' : '+ บันทึกการ์ดเข้าฐานข้อมูล'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* STARTER DECK BUILDER */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-base text-amber-300 flex items-center gap-2">
          <Award className="w-5 h-5" /> สร้าง Starter Deck (40 ใบ) ให้ผู้เล่นเลือกใช้งานทันที
        </h3>
        <div className="grid sm:grid-cols-4 gap-3">
          <input
            type="text"
            value={starterName}
            onChange={(e) => setStarterName(e.target.value)}
            placeholder="ชื่อ Starter Deck (เช่น ลูฟี่ Aggression)"
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
          <button
            type="button"
            onClick={handleCreateStarterDeck}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm py-2"
          >
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
                <button
                  onClick={() => saveStarterDecks(starterDecks.filter((x) => x.id !== sd.id))}
                  className="text-rose-400 hover:text-rose-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CARD DATABASE LIST */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-base">การ์ดทั้งหมดในฐานข้อมูล ({filteredCards.length} ใบ)</h3>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อการ์ด / ฮีโร่ / ชุด..."
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
                <div className="font-bold text-xs truncate">{card.isUnique ? `❂ ${card.name}` : card.name}</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {card.type.split(' ')[0]} • {card.heroOwner || card.setGroup || card.aspect}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => startEditCard(card)}
                  className="py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded text-[11px] font-bold"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => deleteCard(card.id)}
                  className="py-1 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded text-[11px]"
                >
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
