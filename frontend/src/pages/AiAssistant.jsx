import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  Send,
  Sparkles,
  Volume2,
  Square,
  Settings2,
  Activity,
  Building2,
  Users,
  CalendarDays,
  Wallet,
  CheckCircle2,
  Trash2,
  AudioLines,
  ShieldCheck,
  MessageSquare,
  Wrench,
  UserRound,
  CalendarClock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import NoBranchState from '../components/NoBranchState';
import AiMessage from '../components/AiMessage';
import { Badge, Button, Card, Select } from '../components/ui';
import api from '../services/api';
import {
  HELP_TEXT,
  SUGGESTIONS,
  extractAmount,
  extractContact,
  normalizeName,
  parseCommand,
  resolveByName,
  resolveStudent,
} from '../utils/ai';
import { cn, formatCurrency, getErrorMessage, todayIso } from '../utils/format';
import { getVoicePrefs, saveVoicePrefs } from '../utils/voicePrefs';

const RECENT_KEY_PREFIX = 'tutorflow_ai_recent';
const recentKey = (user) => `${RECENT_KEY_PREFIX}_${user?.teacherId ?? 'guest'}`;

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const timeNow = () =>
  new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

const methodLabel = (method = 'CASH') =>
  method
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const batchListSentence = (batches = []) => {
  if (batches.length === 0) {
    return 'There are no batches yet — you can create one from Batches & Schedule. ';
  }
  return `Available batches: ${batches.map((batch) => batch.name).join(', ')}. `;
};

const loadRecent = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toolList = [
  { label: 'Student registry', detail: 'Add, search and assign', icon: UserRound },
  { label: 'Batch engine', detail: 'Programmes and capacity', icon: CalendarDays },
  { label: 'Attendance ledger', detail: 'Daily registers', icon: CheckCircle2 },
  { label: 'Fee ledger', detail: 'Dues and payments', icon: Wallet },
  { label: 'Schedule sync', detail: 'Weekly timetable', icon: CalendarClock },
];

export default function AiAssistant() {
  const { user, selectedBranch } = useApp();
  const toast = useToast();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voicePrefs, setVoicePrefs] = useState(() => getVoicePrefs());
  const [followUp, setFollowUp] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [recent, setRecent] = useState(() => loadRecent(recentKey(user)));
  const [stats, setStats] = useState(null);
  const [refData, setRefData] = useState({ students: [], batches: [] });

  const recognitionRef = useRef(null);
  const feedRef = useRef(null);

  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const speechSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const welcomeMessage = useCallback(
    () => ({
      id: uid(),
      role: 'assistant',
      time: timeNow(),
      text: `Hi ${firstName}! I'm your TutorFlow assistant for ${selectedBranch?.name}. I can add students, mark attendance, record payments, and pull live branch numbers. What would you like to do?`,
      meta: null,
    }),
    [firstName, selectedBranch?.name]
  );

  const addMessage = useCallback((message) => {
    setMessages((current) => [...current, { id: uid(), time: timeNow(), ...message }]);
  }, []);

  const speak = useCallback(
    (text) => {
      if (!voicePrefs.enabled || !text || typeof window === 'undefined' || !window.speechSynthesis) {
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = voicePrefs.rate;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [voicePrefs.enabled, voicePrefs.rate]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const respond = useCallback(
    (text, extra = {}, speech) => {
      addMessage({ role: 'assistant', text, ...extra });
      speak(speech ?? text);
    },
    [addMessage, speak]
  );

  const addRecent = useCallback((label, detail) => {
    const entry = { id: uid(), label, detail, time: timeNow(), status: 'Executed' };
    setRecent((current) => {
      const next = [entry, ...current].slice(0, 8);
      localStorage.setItem(recentKey(user), JSON.stringify(next));
      return next;
    });
  }, [user]);

  const refreshRefData = useCallback(async () => {
    if (!selectedBranch) return { students: [], batches: [] };
    const [studentsRes, batchesRes] = await Promise.all([
      api.get(`/students?branchId=${selectedBranch.id}`),
      api.get(`/batches?branchId=${selectedBranch.id}`),
    ]);
    const data = { students: studentsRes.data || [], batches: batchesRes.data || [] };
    setRefData(data);
    return data;
  }, [selectedBranch]);

  const refreshStats = useCallback(async () => {
    if (!selectedBranch) return null;
    try {
      const res = await api.get(`/overview/branch/${selectedBranch.id}`);
      setStats(res.data);
      return res.data;
    } catch {
      return null;
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (!selectedBranch) return;
    setMessages([welcomeMessage()]);
    setFollowUp(null);
    setConfirmation(null);
    refreshRefData().catch(() => {});
    refreshStats();
  }, [selectedBranch?.id]);

  useEffect(() => {
    const feed = feedRef.current;
    if (feed) feed.scrollTop = feed.scrollHeight;
  }, [messages, busy]);

  useEffect(
    () => () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      recognitionRef.current?.abort?.();
    },
    []
  );

  const updateVoicePrefs = (patch) => {
    const next = { ...voicePrefs, ...patch };
    setVoicePrefs(next);
    saveVoicePrefs(next);
    if (patch.enabled === false) stopSpeaking();
  };

  const executeAddStudent = async (draft) => {
    const res = await api.post('/ai/execute', {
      intent: 'ADD_STUDENT',
      branchId: selectedBranch.id,
      parameters: {
        fullName: draft.fullName,
        contactNumber: draft.contactNumber,
        parentOrGuardianName: draft.parentOrGuardianName || null,
        batchId: draft.batchId ?? null,
      },
    });
    const student = res.data.data;
    respond(res.data.message, {
      kind: 'student',
      data: student,
      meta: 'Backend · add_student · verified',
    });
    addRecent('Student added', `${student.fullName} · ${student.batchName || 'no batch'}`);
    await refreshRefData().catch(() => {});
    refreshStats();
  };

  const processAddStudent = async (incoming) => {
    const draft = { ...incoming, fullName: normalizeName(incoming.fullName || '') };

    if (!draft.fullName) {
      setFollowUp({ type: 'add-student', missing: 'name', draft });
      respond('Who should I add to your student registry?');
      return;
    }

    if (!draft.contactNumber) {
      setFollowUp({ type: 'add-student', missing: 'contact', draft });
      respond(`What is ${draft.fullName}'s contact number?`);
      return;
    }

    const digits = draft.contactNumber.replace(/\D/g, '');
    if (digits.length < 7) {
      setFollowUp({ type: 'add-student', missing: 'contact', draft: { ...draft, contactNumber: '' } });
      respond(`That contact number looks incomplete. What is ${draft.fullName}'s full phone number?`);
      return;
    }

    const data = await refreshRefData();
    let batch = null;

    if (draft.batchName) {
      const result = resolveByName(data.batches, draft.batchName);
      if (!result.match) {
        setFollowUp({ type: 'batch-choice', draft, candidates: result.candidates });
        respond(
          result.candidates.length > 0
            ? `I found a few batches close to “${draft.batchName}”. Which one should ${draft.fullName} join? ${batchListSentence(
                result.candidates
              )}`
            : `I couldn't find a batch called “${draft.batchName}”. ${batchListSentence(
                data.batches
              )}Say “no batch” to add ${draft.fullName} without one.`
        );
        return;
      }
      batch = result.match;
    }

    const duplicate = data.students.find(
      (student) =>
        student.fullName.toLowerCase() === draft.fullName.toLowerCase() &&
        String(student.contactNumber).replace(/\D/g, '') === digits
    );

    if (duplicate) {
      const question = `${draft.fullName} is already in this branch with that contact number. Add another record anyway?`;
      setConfirmation({ type: 'duplicate-student', draft: { ...draft, batchId: batch?.id }, question });
      respond(question, {}, question);
      return;
    }

    await executeAddStudent({ ...draft, batchId: batch?.id });
  };

  const executePayment = async ({ studentId, studentName, amount, paymentMethod }) => {
    let feeRecordId = null;
    try {
      const feeRes = await api.get(`/fees/records/student/${studentId}`);
      const pending = (feeRes.data || [])
        .filter((record) => Number(record.pendingAmount) > 0)
        .sort((a, b) => String(a.dueDate || '').localeCompare(String(b.dueDate || '')));
      feeRecordId = pending[0]?.id ?? null;
    } catch {
      feeRecordId = null;
    }

    const res = await api.post('/ai/execute', {
      intent: 'RECORD_PAYMENT',
      branchId: selectedBranch.id,
      parameters: {
        studentId,
        amount,
        paymentMethod,
        feeRecordId,
        notes: feeRecordId ? 'Recorded from AI assistant' : null,
      },
    });

    respond(
      `${res.data.message}${feeRecordId ? ' Applied to the oldest pending fee.' : ''}`,
      { kind: 'payment', data: res.data.data, meta: 'Backend · record_payment · verified' }
    );
    addRecent('Payment recorded', `${formatCurrency(amount)} · ${studentName}`);
    refreshStats();
  };

  const processPayment = async (incoming) => {
    const draft = { ...incoming };

    if (!draft.studentName) {
      setFollowUp({ type: 'payment-student', draft });
      respond('Which student is making the payment?');
      return;
    }

    if (!draft.amount || Number(draft.amount) <= 0) {
      setFollowUp({ type: 'payment-amount', draft });
      respond(`How much did ${draft.studentName} pay?`);
      return;
    }

    const data = await refreshRefData();
    const result = resolveStudent(data.students, draft.studentName);

    if (!result.match) {
      if (result.candidates.length > 0) {
        setFollowUp({ type: 'payment-student', draft: { ...draft, studentName: '' } });
        respond(
          `I found several students matching “${draft.studentName}”: ${result.candidates
            .map((student) => student.fullName)
            .join(', ')}. Which one made the payment?`
        );
      } else {
        setFollowUp({ type: 'payment-student', draft: { ...draft, studentName: '' } });
        respond(`I couldn't find “${draft.studentName}” in ${selectedBranch.name}. Which student made the payment?`);
      }
      return;
    }

    const question = `Record ${formatCurrency(draft.amount)} from ${result.match.fullName} via ${methodLabel(
      draft.paymentMethod
    )}? Say “yes” to confirm.`;
    setConfirmation({
      type: 'payment',
      payload: {
        studentId: result.match.id,
        studentName: result.match.fullName,
        amount: Number(draft.amount),
        paymentMethod: draft.paymentMethod || 'CASH',
      },
      question,
    });
    respond(question, {}, question);
  };

  const processSingleAttendance = async ({ studentName, status, batchName }) => {
    const data = await refreshRefData();
    const result = resolveStudent(data.students, studentName);
    if (!result.match) {
      respond(
        result.candidates.length > 0
          ? `I found multiple students matching “${studentName}”: ${result.candidates
              .map((student) => student.fullName)
              .join(', ')}. Please be more specific.`
          : `I couldn't find “${studentName}” in ${selectedBranch.name}.`
      );
      return;
    }

    let batch = result.match.batchId
      ? data.batches.find((item) => item.id === result.match.batchId)
      : null;

    if (batchName) {
      const batchResult = resolveByName(data.batches, batchName);
      if (batchResult.match) batch = batchResult.match;
    }

    if (!batch) {
      respond(
        `${result.match.fullName} isn't assigned to a batch yet. Assign a batch from Students, then I can mark attendance.`
      );
      return;
    }

    const res = await api.post('/ai/execute', {
      intent: 'RECORD_ATTENDANCE',
      branchId: selectedBranch.id,
      parameters: {
        batchId: batch.id,
        studentId: result.match.id,
        status,
        date: todayIso(),
      },
    });

    respond(res.data.message, {
      kind: 'attendance',
      data: { batchName: batch.name, status, count: 1 },
      meta: 'Backend · record_attendance · verified',
    });
    addRecent('Attendance marked', `${result.match.fullName} · ${status}`);
    refreshStats();
  };

  const processBulkAttendance = async ({ batchName, status }) => {
    const data = await refreshRefData();
    let batch = null;

    if (batchName) {
      const result = resolveByName(data.batches, batchName);
      if (!result.match) {
        setFollowUp({ type: 'bulk-batch', draft: { status }, candidates: result.candidates });
        respond(
          result.candidates.length > 0
            ? `Which batch should I mark ${status.toLowerCase()}? ${batchListSentence(result.candidates)}`
            : `I couldn't match “${batchName}”. ${batchListSentence(data.batches)}Which batch should I mark ${status.toLowerCase()}?`
        );
        return;
      }
      batch = result.match;
    }

    if (!batch && data.batches.length === 1) batch = data.batches[0];

    if (!batch) {
      setFollowUp({ type: 'bulk-batch', draft: { status }, candidates: data.batches });
      respond(`Which batch should I mark ${status.toLowerCase()}? ${batchListSentence(data.batches)}`);
      return;
    }

    const roster = data.students.filter((student) => student.batchId === batch.id);
    if (roster.length === 0) {
      respond(`${batch.name} doesn't have any students assigned yet.`);
      return;
    }

    const res = await api.post('/attendance/bulk', {
      branchId: selectedBranch.id,
      batchId: batch.id,
      attendanceDate: todayIso(),
      records: roster.map((student) => ({ studentId: student.id, status, remarks: null })),
    });

    respond(`${res.data.length} students marked ${status.toLowerCase()} in ${batch.name} for today.`, {
      kind: 'attendance',
      data: { batchName: batch.name, status, count: res.data.length },
      meta: 'Backend · bulk_attendance · verified',
    });
    addRecent('Attendance marked', `${res.data.length} students · ${batch.name}`);
    refreshStats();
  };

  const runIntent = async (parsed, rawText) => {
    switch (parsed.intent) {
      case 'GREETING':
        respond(`Hi ${firstName}! Ask me about students, attendance, fees or today's schedule for ${selectedBranch.name}.`);
        return;

      case 'HELP':
        respond(HELP_TEXT, {}, 'I can add students, mark attendance, record payments, and pull live branch numbers. Ask me to check pending fees or show today’s classes.');
        return;

      case 'ADD_STUDENT':
        await processAddStudent(parsed.params);
        return;

      case 'MARK_ATTENDANCE':
        await processSingleAttendance(parsed.params);
        return;

      case 'BULK_ATTENDANCE':
        await processBulkAttendance(parsed.params);
        return;

      case 'RECORD_PAYMENT':
        await processPayment(parsed.params);
        return;

      case 'PENDING_FEES': {
        const res = await api.get(`/fees/records/branch/${selectedBranch.id}`);
        const pending = (res.data || [])
          .filter((record) => Number(record.pendingAmount) > 0)
          .sort((a, b) => Number(b.pendingAmount) - Number(a.pendingAmount));
        const total = pending.reduce((sum, record) => sum + Number(record.pendingAmount || 0), 0);
        if (pending.length === 0) {
          respond(`No pending fees for ${selectedBranch.name}. Every fee record is settled.`, {}, 'No pending fees for this branch. Everything is settled.');
          return;
        }
        respond(
          `${formatCurrency(total)} is pending across ${pending.length} fee records. The largest outstanding accounts are below.`,
          {
            kind: 'fees',
            data: { total, count: pending.length, records: pending.slice(0, 6) },
            meta: 'Backend · fee_ledger · verified',
          }
        );
        return;
      }

      case 'GET_TODAY_CLASSES': {
        const res = await api.post('/ai/execute', {
          intent: 'GET_UPCOMING_CLASSES',
          branchId: selectedBranch.id,
        });
        const sessions = res.data.data || [];
        if (sessions.length === 0) {
          respond(`No classes are scheduled for ${selectedBranch.name} today.`, {}, 'No classes are scheduled for today.');
          return;
        }
        respond(
          `${sessions.length} ${sessions.length === 1 ? 'class is' : 'classes are'} scheduled today. First up: ${
            sessions[0].batchName
          } at ${String(sessions[0].startTime).slice(0, 5)}.`,
          { kind: 'schedule', data: sessions, meta: 'Backend · schedule_sync · verified' }
        );
        return;
      }

      case 'GET_OVERVIEW': {
        const res = await api.post('/ai/execute', {
          intent: 'GET_OVERVIEW',
          branchId: selectedBranch.id,
        });
        const overview = res.data.data;
        setStats(overview);
        respond(
          `${overview.branchName}: ${overview.totalStudents} students, ${overview.activeBatches} batches, ${overview.todayClasses} classes today, and ${formatCurrency(
            overview.pendingFees
          )} pending fees.`,
          { kind: 'overview', data: overview, meta: 'Backend · get_overview · verified' }
        );
        return;
      }

      case 'FIND_STUDENT': {
        const query = parsed.params.query;
        const res = await api.get(
          `/students?branchId=${selectedBranch.id}&search=${encodeURIComponent(query)}`
        );
        const results = res.data || [];
        if (results.length === 0) {
          respond(`I couldn't find a student matching “${query}” in ${selectedBranch.name}.`, {}, `I couldn't find a student matching ${query}.`);
          return;
        }
        respond(
          `Found ${results.length} ${results.length === 1 ? 'student' : 'students'} matching “${query}”.`,
          { kind: 'students', data: results, meta: 'Backend · student_search · verified' }
        );
        return;
      }

      case 'LIST_BATCHES': {
        const data = await refreshRefData();
        if (data.batches.length === 0) {
          respond(`No batches exist for ${selectedBranch.name} yet. Create one from Batches & Schedule.`);
          return;
        }
        respond(
          `${data.batches.length} ${data.batches.length === 1 ? 'batch' : 'batches'} at ${selectedBranch.name}.`,
          { kind: 'batches', data: data.batches, meta: 'Backend · batch_registry · verified' }
        );
        return;
      }

      default:
        respond(
          `I didn't catch that. ${HELP_TEXT}`,
          {},
          'I didn’t catch that. Ask me to add a student, mark attendance, record a payment, or check pending fees.'
        );
    }
  };

  const handleConfirmationInput = async (text) => {
    if (/^(no|nope|cancel|stop|don't|dont|not now)\b/i.test(text)) {
      setConfirmation(null);
      respond('Cancelled — nothing was changed.');
      return;
    }
    if (!/^(yes|yeah|yep|confirm|ok|okay|sure|do it|go ahead|proceed)\b/i.test(text)) {
      respond(confirmation.question, {}, confirmation.question);
      return;
    }

    const current = confirmation;
    setConfirmation(null);

    if (current.type === 'payment') {
      await executePayment(current.payload);
      return;
    }
    if (current.type === 'duplicate-student') {
      await executeAddStudent(current.draft);
    }
  };

  const handleFollowUpInput = async (text) => {
    const state = followUp;
    setFollowUp(null);

    if (state.type === 'add-student') {
      const draft = { ...state.draft };
      if (state.missing === 'name') draft.fullName = normalizeName(text);
      if (state.missing === 'contact') {
        draft.contactNumber = extractContact(text) || text.replace(/[^\d+]/g, '');
      }
      await processAddStudent(draft);
      return;
    }

    if (state.type === 'batch-choice') {
      if (/^(no|none|skip|without)\b/i.test(text)) {
        await executeAddStudent({ ...state.draft, batchId: null });
        return;
      }
      const data = await refreshRefData();
      const pool = state.candidates?.length > 0 ? state.candidates : data.batches;
      const result = resolveByName(pool, text);
      if (result.match) {
        await executeAddStudent({ ...state.draft, batchId: result.match.id });
        return;
      }
      setFollowUp({ ...state, candidates: data.batches });
      respond(`I still couldn't match that batch. ${batchListSentence(data.batches)}You can also say “no batch”.`);
      return;
    }

    if (state.type === 'bulk-batch') {
      const data = await refreshRefData();
      const result = resolveByName(data.batches, text);
      if (!result.match) {
        setFollowUp({ ...state, candidates: data.batches });
        respond(`I couldn't match that batch. ${batchListSentence(data.batches)}`);
        return;
      }
      await processBulkAttendance({ batchName: result.match.name, status: state.draft.status });
      return;
    }

    if (state.type === 'payment-student') {
      await processPayment({ ...state.draft, studentName: normalizeName(text) });
      return;
    }

    if (state.type === 'payment-amount') {
      const amount = extractAmount(text) || Number(String(text).replace(/[^\d.]/g, ''));
      if (!amount || Number.isNaN(amount) || amount <= 0) {
        setFollowUp(state);
        respond('Enter a payment amount in rupees, for example 5000.');
        return;
      }
      await processPayment({ ...state.draft, amount });
    }
  };

  const handleSend = async (raw, source = 'text') => {
    const text = (raw ?? input).trim();
    if (!text || busy) return;

    setInput('');
    setBusy(true);
    addMessage({ role: 'user', text, source });
    stopSpeaking();

    try {
      if (confirmation) await handleConfirmationInput(text);
      else if (followUp) await handleFollowUpInput(text);
      else await runIntent(parseCommand(text), text);
    } catch (err) {
      addMessage({ role: 'assistant', kind: 'error', text: getErrorMessage(err) });
      toast.error('The assistant could not complete that action.');
    } finally {
      setBusy(false);
    }
  };

  const startListening = () => {
    if (busy) {
      toast.info('Give me a moment to finish the current action.');
      return;
    }
    if (!speechSupported) {
      toast.error('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    stopSpeaking();

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let finalText = '';

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      let interim = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript;
        if (event.results[index].isFinal) finalText += transcript;
        else interim += transcript;
      }
      setInput(interim || finalText);
    };
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === 'not-allowed') toast.error('Microphone permission was denied.');
      else if (event.error !== 'aborted') toast.error(`Voice input error: ${event.error}`);
    };
    recognition.onend = () => {
      setListening(false);
      const transcript = finalText.trim();
      setInput('');
      if (transcript) handleSend(transcript, 'voice');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const resetConversation = () => {
    stopSpeaking();
    stopListening();
    setFollowUp(null);
    setConfirmation(null);
    setMessages([welcomeMessage()]);
  };

  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem(recentKey(user));
    toast.success('Recent activity cleared.');
  };

  if (!selectedBranch) return <NoBranchState />;

  const waveformActive = listening || speaking;

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-2.5">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold',
                  listening
                    ? 'bg-rose-50 text-rose-600'
                    : speaking
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'bg-emerald-50 text-emerald-700'
                )}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                {listening ? 'Listening…' : speaking ? 'Speaking…' : 'Voice ready'}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                Backend-verified actions
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                English (India)
              </span>
              {busy && (
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600">
                  <Activity className="h-3 w-3 animate-pulse" />
                  Processing
                </span>
              )}
              <div className="ml-auto flex items-center gap-2">
                {speaking && (
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-100"
                  >
                    <Square className="h-2.5 w-2.5" />
                    Stop playback
                  </button>
                )}
                <span className="hidden items-center gap-1 text-[10px] font-semibold text-slate-400 sm:flex">
                  <AudioLines className="h-3 w-3" />
                  {voicePrefs.enabled ? 'Output active' : 'Output muted'}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-emerald-50/70 px-4 py-7">
              <div className="mx-auto flex max-w-2xl flex-col items-center">
                <div
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 transition-transform',
                    listening && 'recording-pulse scale-105'
                  )}
                >
                  {listening ? (
                    <Mic className="h-7 w-7" />
                  ) : speaking ? (
                    <Volume2 className="h-7 w-7" />
                  ) : (
                    <Sparkles className="h-7 w-7" />
                  )}
                </div>

                <div className="mt-4 flex h-10 items-end justify-center gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                    <span
                      key={index}
                      className={cn(
                        'w-1.5 rounded-full bg-indigo-500 transition-all',
                        waveformActive ? 'wave-bar h-8' : 'h-2 bg-indigo-200'
                      )}
                      style={waveformActive ? { animationDelay: `${index * 0.09}s` } : undefined}
                    />
                  ))}
                </div>

                <p className="mt-3 text-center text-sm font-bold tracking-tight text-slate-900">
                  {listening
                    ? `Listening… ${input ? `“${input}”` : 'speak now'}`
                    : speaking
                      ? 'Speaking the response…'
                      : 'Ask or command your branch operations'}
                </p>
                <p className="mt-1 text-center text-[11px] text-slate-500">
                  {selectedBranch.name} · changes go through the backend and appear on the dashboard
                </p>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSend();
                  }}
                  className="mt-5 flex w-full items-center gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Try “Add student Rahul, contact 9876543210”"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-12 text-xs font-medium text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={listening ? stopListening : startListening}
                      title={listening ? 'Stop listening' : 'Speak'}
                      className={cn(
                        'absolute right-1.5 top-1.5 rounded-lg p-2 transition-colors',
                        listening
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                      )}
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!input.trim() || busy}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                    title="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

                {!speechSupported && (
                  <p className="mt-2 text-center text-[10px] font-semibold text-amber-600">
                    Voice input needs Chrome or Edge. Text commands work everywhere.
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={busy}
                      onClick={() => handleSend(suggestion)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold text-slate-600 shadow-2xs transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-60"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Active conversation</h2>
                  <p className="text-[10px] text-slate-400">
                    {followUp
                      ? 'Waiting for your answer to continue the action'
                      : confirmation
                        ? 'Waiting for confirmation'
                        : `Session with ${selectedBranch.name}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetConversation}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              >
                <Trash2 className="h-3 w-3" />
                Reset
              </button>
            </div>

            <div ref={feedRef} className="max-h-[620px] space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <AiMessage key={message.id} message={message} userName={user?.fullName} />
              ))}

              {busy && (
                <div className="flex animate-fade-in gap-2.5">
                  <div className="mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400"
                          style={{ animationDelay: `${index * 0.12}s` }}
                        />
                      ))}
                      <span className="ml-2 text-[10px] font-semibold text-slate-400">
                        Running backend action…
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Settings2 className="h-3.5 w-3.5 text-indigo-500" />
                Voice preferences
              </span>
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  voicePrefs.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                )}
              />
            </div>

            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-800">Speak responses</p>
                  <p className="text-[10px] text-slate-400">Play replies as audio</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateVoicePrefs({ enabled: !voicePrefs.enabled })}
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-colors',
                    voicePrefs.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                  )}
                  aria-pressed={voicePrefs.enabled}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                      voicePrefs.enabled ? 'left-[18px]' : 'left-0.5'
                    )}
                  />
                </button>
              </div>

              <Select
                value={String(voicePrefs.rate)}
                onChange={(event) => updateVoicePrefs({ rate: Number(event.target.value) })}
                className="py-2 text-[11px]"
              >
                <option value="0.8">Pace: Slower (0.8×)</option>
                <option value="1">Pace: Standard (1×)</option>
                <option value="1.2">Pace: Faster (1.2×)</option>
              </Select>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                  <Mic className="h-3 w-3" />
                  {speechSupported ? 'Microphone ready' : 'Voice input unsupported'}
                </span>
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="text-[10px] font-bold text-indigo-600 hover:underline disabled:text-slate-300"
                  disabled={!speaking}
                >
                  Stop audio
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Wrench className="h-3.5 w-3.5 text-indigo-500" />
                Connected tools
              </span>
              <Badge tone="emerald">All active</Badge>
            </div>

            <div className="mt-2 space-y-1">
              {toolList.map(({ label, detail, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="rounded-md bg-indigo-50 p-1 text-indigo-600">
                      <Icon className="h-3 w-3" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[10.5px] font-bold text-slate-700">{label}</p>
                      <p className="truncate text-[9px] text-slate-400">{detail}</p>
                    </div>
                  </div>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Activity className="h-3.5 w-3.5 text-indigo-500" />
                Recent activity
              </span>
              {recent.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-[10px] font-bold text-slate-400 hover:text-rose-600"
                >
                  Clear
                </button>
              )}
            </div>

            {recent.length === 0 ? (
              <p className="py-4 text-center text-[10px] text-slate-400">
                Actions you run through the assistant appear here.
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {recent.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[10.5px] font-bold text-slate-700">{item.label}</p>
                      <p className="truncate text-[9.5px] text-slate-400">{item.detail}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[9px] font-semibold text-slate-400">{item.time}</p>
                      <p className="text-[9px] font-bold text-emerald-600">{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 text-white">
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-indigo-200">
                <Building2 className="h-3 w-3" />
                Active branch
              </span>
              <p className="mt-1 text-sm font-extrabold tracking-tight">{selectedBranch.name}</p>
              <p className="mt-0.5 text-[10px] text-indigo-100">
                {selectedBranch.address || 'Address not set'}
              </p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-100 text-center">
              <div className="px-2 py-2.5">
                <Users className="mx-auto h-3 w-3 text-slate-400" />
                <p className="mt-0.5 text-xs font-black text-slate-900">{stats?.totalStudents ?? '—'}</p>
                <p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400">Students</p>
              </div>
              <div className="px-2 py-2.5">
                <CalendarDays className="mx-auto h-3 w-3 text-slate-400" />
                <p className="mt-0.5 text-xs font-black text-slate-900">{stats?.todayClasses ?? '—'}</p>
                <p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400">Today</p>
              </div>
              <div className="px-2 py-2.5">
                <Wallet className="mx-auto h-3 w-3 text-slate-400" />
                <p className="mt-0.5 truncate text-xs font-black text-rose-600">
                  {stats ? formatCurrency(stats.pendingFees) : '—'}
                </p>
                <p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400">Pending</p>
              </div>
            </div>
            <Link
              to="/overview"
              className="flex items-center justify-center gap-1 border-t border-slate-100 bg-slate-50 py-2 text-[10px] font-bold text-indigo-600 hover:bg-slate-100"
            >
              Open branch dashboard
            </Link>
          </Card>

          <div className="flex items-start gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-[9.5px] font-medium leading-relaxed text-emerald-700">
            <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" />
            Assistant actions use your authenticated session and the selected branch only. The backend is the
            source of truth.
          </div>

          <p className="text-center text-[9px] text-slate-400">
            {refData.students.length} students · {refData.batches.length} batches in context
          </p>
        </aside>
      </div>
    </div>
  );
}
