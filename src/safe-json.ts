// Safe JSON.parse override to prevent uncaught SyntaxError when parsing "undefined" or malformed values
(function() {
  if (typeof window !== "undefined") {
    const originalParse = JSON.parse;
    JSON.parse = function(text: any, reviver?: any) {
      if (text === undefined || text === null || text === "undefined" || text === "null" || text === "") {
        return null;
      }
      try {
        return originalParse(text, reviver);
      } catch (e) {
        if (typeof text === 'string') {
          const trimmed = text.trim();
          if (trimmed === 'undefined' || trimmed === 'null' || trimmed === '') {
            return null;
          }
        }
        console.warn("JSON.parse failed for value:", text, e);
        return null; // Return null instead of throwing to prevent app crash
      }
    };
  }
})();
export {};
