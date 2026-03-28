const dns = require("dns").promises;

/**
 * Verifies that the email domain actually has MX records 
 * (meaning it can receive emails).
 */
const verifyEmailDomain = async (email) => {
  const domain = email.split("@")[1];
  if (!domain) return false;

  // List of obviously fake domains or common disposable providers to block
  const disposableDomains = [
    "mailinator.com", "yopmail.com", "temp-mail.org", "guerrillamail.com",
    "sharklasers.com", "10minutemail.com", "tempmail.com", "trashmail.com",
    "discard.email", "getairmail.com", "tempr.email", "moakt.com"
  ];

  if (disposableDomains.includes(domain.toLowerCase())) {
    return false;
  }

  // Reject the domain if it's one of those obviously fake TLDs
  const fakeTLDs = [".temp", ".junk", ".test", ".fake", ".example"];
  if (fakeTLDs.some(tld => domain.toLowerCase().endsWith(tld))) {
    return false;
  }

  try {
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (err) {
    // If DNS resolution fails, the domain likely doesn't exist or is not a mail server
    console.error(`DNS lookup failed for ${domain}:`, err.message);
    return false;
  }
};

/**
 * Detects if a string looks like gibberish/keyboard mash (e.g., lasjdf, faslkdfj)
 */
const isGibberish = (str) => {
  const username = str.split("@")[0].toLowerCase() || str.toLowerCase();
  const len = username.length;
  if (len < 5) return false; // Too short to accurately judge

  const vowels = username.match(/[aeiou]/gi);
  const vowelCount = vowels ? vowels.length : 0;
  
  // 1. Vowel Ratio check: Normal names usually have > 20% vowels
  // faslkdfj (8 chars, 1 vowel) = 12.5% -> Reject
  if (vowelCount / len < 0.15) return true;

  // 2. Keyboard Row Density (QWERTY)
  // Rejects strings like 'faslkdfj' (all middle row)
  const rows = [
    /[qwertyuiop]/g,
    /[asdfghjkl]/g,
    /[zxcvbnm]/g
  ];
  for (const row of rows) {
    const matches = username.match(row);
    if (matches && (matches.length / len) > 0.8) return true;
  }

  // 3. Check for specific common keyboard mash patterns
  const mashes = ["asdf", "ghjk", "zxcv", "qwer", "rtyu", "sdfg", "dfgh", "fghj", "lkdf", "kdfj", "aslk"];
  if (mashes.some(mash => username.includes(mash))) {
    return true;
  }

  return false;
};

/**
 * Checks for common "junk" prefixes
 */
const isJunkPrefix = (email) => {
  const username = email.split("@")[0].toLowerCase();
  const junkWords = ["test", "dummy", "junk", "temp", "tmp", "asdf", "qwer", "fake", "none", "support", "admin"];
  
  // If the username IS exactly a junk word or STARTS with one followed by numbers
  return junkWords.some(word => username === word || username.startsWith(word + "1") || username.startsWith(word + "2"));
};

/**
 * Checks if a string contains common "dummy" patterns or looks like gibberish
 */
const isDummyString = (str) => {
  if (!str) return true;
  const blacklist = [
    "test", "admin", "dummy", "none", "asdf", "qwer", "anonymous", "unknown", "placeholder"
  ];
  const normalized = str.toLowerCase().trim();
  
  if (blacklist.some(word => normalized.includes(word))) return true;
  if (normalized.length < 2) return true;
  if (isGibberish(normalized)) return true;

  return false;
};

module.exports = { 
  verifyEmailDomain,
  isGibberish,
  isJunkPrefix,
  isDummyString
};
