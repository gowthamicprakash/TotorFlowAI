const STATUS_WORDS = ['present', 'absent', 'late', 'excused'];

export function normalizeName(value = '') {
  return value
    .replace(/[.,!?;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractContact(text = '') {
  const match = text.match(
    /(?:contact(?:\s+number)?|phone(?:\s+number)?|mobile(?:\s+number)?|number)\s*(?:is|:|=)?\s*(\+?[\d][\d\s-]{5,})/i
  );
  if (!match) return null;
  return match[1].replace(/[\s-]/g, '').trim();
}

export function extractAmount(text = '') {
  const currencyMatch = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)/i);
  if (currencyMatch) return Number(currencyMatch[1].replace(/,/g, ''));
  const plainMatch = text.match(/\b([\d,]{3,}(?:\.\d+)?)\b/);
  if (plainMatch) return Number(plainMatch[1].replace(/,/g, ''));
  return null;
}

function cleanBatchName(value = '') {
  return normalizeName(value)
    .replace(/\b(batch|class|group|today|now)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMethod(text = '') {
  const match = text.match(/\b(?:via|using|through|by)\s+(cash|upi|bank\s*transfer|card|other)\b/i);
  if (!match) return 'CASH';
  const method = match[1].toLowerCase().replace(/\s+/g, '_');
  return method === 'bank_transfer' ? 'BANK_TRANSFER' : method.toUpperCase();
}

function extractStudentNameAfterAmount(text = '') {
  const match = text.match(
    /(?:from|for|by)\s+([A-Za-z][A-Za-z .'-]+?)(?:\s+(?:via|using|through|by)\s+[A-Za-z _-]+)?$/i
  );
  return match ? normalizeName(match[1]) : '';
}

function parseAddStudent(text) {
  const rest = text.replace(/^.*?\bstudent\b/i, ' ');

  const contactNumber = extractContact(rest);
  const parentMatch = rest.match(
    /(?:parent|guardian)(?:\s+name)?\s*(?:is|:)?\s*([A-Za-z][A-Za-z .'-]*)/i
  );
  let batchName = '';
  const batchMatch =
    rest.match(/(?:to|into|in|for)\s+(?:the\s+)?([A-Za-z0-9][\w &'.\-]*?)\s+(?:batch|class|group)\b/i) ||
    rest.match(/\b(?:batch|class|group)\s+([A-Za-z0-9][\w &'.\-]+)/i);
  if (batchMatch) batchName = cleanBatchName(batchMatch[1]);

  let namePart = rest;
  [
    /(?:contact(?:\s+number)?|phone(?:\s+number)?|mobile(?:\s+number)?|number)\s*(?:is|:|=)?\s*([+]?[\d][\d\s-]{5,})/i,
    /(?:parent|guardian)(?:\s+name)?\s*(?:is|:)?\s*([A-Za-z][A-Za-z .'-]*)/i,
    /(?:to|into|in|for)\s+(?:the\s+)?([A-Za-z0-9][\w &'.\-]*?)\s+(?:batch|class|group)\b/i,
    /\b(?:batch|class|group)\s+([A-Za-z0-9][\w &'.\-]+)/i,
  ].forEach((pattern) => {
    namePart = namePart.replace(pattern, ' ');
  });

  const fullName = normalizeName(
    namePart
      .replace(/^(?:named|called|name|is)\s+/i, '')
      .split(/\b(?:with|to|in|into|for|batch|parent|guardian)\b/i)[0]
  );

  return {
    intent: 'ADD_STUDENT',
    params: {
      fullName,
      contactNumber,
      parentOrGuardianName: parentMatch ? normalizeName(parentMatch[1]) : null,
      batchName,
    },
  };
}

function parseAttendance(text) {
  const statusMatch = text.match(/\b(present|absent|late|excused)\b/i);
  const status = statusMatch ? statusMatch[1].toUpperCase() : 'PRESENT';

  if (/\bmark\b/i.test(text) && /\battendance\b/i.test(text)) {
    const match = text.match(
      /mark\s+(?:the\s+)?attendance(?:\s+(?:for|of))?\s*(?:the\s+)?(.+?)(?:\s+batch)?(?:\s+(?:today|now))?(?:[,\s]+(?:all\s+)?(present|absent|late|excused))?$/i
    );
    const batchName = match ? cleanBatchName(match[1]) : '';
    return { intent: 'BULK_ATTENDANCE', params: { batchName, status } };
  }

  const single = text.match(
    /^mark\s+(?!attendance)(.+?)\s+(?:as\s+)?(present|absent|late|excused)\b(?:\s+(?:in|for|from)\s+(?:the\s+)?(.+?)(?:\s+batch)?)?$/i
  );
  if (single) {
    return {
      intent: 'MARK_ATTENDANCE',
      params: {
        studentName: normalizeName(single[1]),
        status: single[2].toUpperCase(),
        batchName: single[3] ? cleanBatchName(single[3]) : '',
      },
    };
  }

  return null;
}

export function parseCommand(raw) {
  const text = normalizeName(raw);
  const lower = text.toLowerCase();

  if (!text) return { intent: 'EMPTY' };

  if (/^(hi|hello|hey|namaste|good (morning|afternoon|evening))\b/.test(lower)) {
    return { intent: 'GREETING' };
  }

  if (/\b(help|what can you do|commands?|how do i)\b/.test(lower)) {
    return { intent: 'HELP' };
  }

  if (/\b(add|create|enroll|register)\b.*\bstudent\b/.test(lower)) {
    return parseAddStudent(text);
  }

  if (/\bmark\b/.test(lower) && STATUS_WORDS.some((word) => lower.includes(word))) {
    const attendance = parseAttendance(text);
    if (attendance) return attendance;
  }

  if (/\bmark\b/.test(lower) && /\battendance\b/.test(lower)) {
    const attendance = parseAttendance(text);
    if (attendance) return attendance;
  }

  const hasAmount = /(?:₹|rs\.?|inr)\s*[\d,]|\b\d[\d,]{2,}\b/i.test(text);
  if (/\bpayment\b/.test(lower) || /\bpaid\b/.test(lower)) {
    if (hasAmount) {
      const amount = extractAmount(text);
      const paidPattern = text.match(
        /([A-Za-z][A-Za-z .'-]+?)\s+(?:has\s+|just\s+)?paid\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)/i
      );
      if (paidPattern) {
        return {
          intent: 'RECORD_PAYMENT',
          params: {
            studentName: normalizeName(paidPattern[1]),
            amount: Number(paidPattern[2].replace(/,/g, '')),
            paymentMethod: extractMethod(text),
          },
        };
      }
      return {
        intent: 'RECORD_PAYMENT',
        params: {
          studentName: extractStudentNameAfterAmount(text),
          amount,
          paymentMethod: extractMethod(text),
        },
      };
    }
  }

  if (
    /\b(pending|outstanding|overdue|unpaid|dues?)\b/.test(lower) &&
    /\b(fees?|payments?|students?)\b/.test(lower)
  ) {
    return { intent: 'PENDING_FEES' };
  }

  if (/\bwho\s+owes\b/.test(lower)) return { intent: 'PENDING_FEES' };

  const findMatch = text.match(
    /\b(?:find|search|look\s*up|show|get|view)\s+(?:me\s+)?(?:the\s+)?student\s+(.+)$/i
  );
  if (findMatch) {
    return { intent: 'FIND_STUDENT', params: { query: normalizeName(findMatch[1]) } };
  }
  if (/^(find|search)\s+/i.test(text)) {
    return { intent: 'FIND_STUDENT', params: { query: normalizeName(text.replace(/^(find|search)\s+/i, '')) } };
  }

  if (/(today'?s?\s+(classes|schedule|timetable)|classes today|upcoming class|next class|timetable)/i.test(text)) {
    return { intent: 'GET_TODAY_CLASSES' };
  }

  if (/(overview|summary|snapshot|branch status|business status|how('| i)?s my (branch|academy))/i.test(text)) {
    return { intent: 'GET_OVERVIEW' };
  }

  if (/\b(show|list|view|what|which)\b.*\bbatches\b/i.test(text) || /^batches$/i.test(text)) {
    return { intent: 'LIST_BATCHES' };
  }

  return { intent: 'UNKNOWN' };
}

export function resolveByName(items = [], query = '') {
  const needle = query.trim().toLowerCase();
  if (!needle) return { match: null, candidates: [] };
  const exact = items.filter((item) => (item.name || '').toLowerCase() === needle);
  if (exact.length === 1) return { match: exact[0], candidates: [] };
  const partial = items.filter((item) => (item.name || '').toLowerCase().includes(needle));
  if (partial.length === 1) return { match: partial[0], candidates: [] };
  return { match: null, candidates: partial };
}

export function resolveStudent(students = [], query = '') {
  const needle = query.trim().toLowerCase();
  if (!needle) return { match: null, candidates: [] };
  const exact = students.filter((student) => student.fullName.toLowerCase() === needle);
  if (exact.length === 1) return { match: exact[0], candidates: [] };
  const partial = students.filter((student) => student.fullName.toLowerCase().includes(needle));
  if (partial.length === 1) return { match: partial[0], candidates: [] };
  return { match: null, candidates: partial };
}

export const HELP_TEXT =
  'I can work with your live branch data. Try: “Add student Rahul Verma, contact 9876543210”, “mark attendance for Kathak Beginners”, “mark Rahul present”, “record payment of 5000 from Rahul via UPI”, “check pending fees”, “show today’s classes”, “find student Rahul”, “list batches”, or “give me the branch overview”.';

export const SUGGESTIONS = [
  'Add student Rahul, contact 9876543210',
  'Mark attendance for Kathak Beginners',
  'Check pending fees',
  "What's today's schedule?",
];
