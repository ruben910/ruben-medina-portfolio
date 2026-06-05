const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');
const target = "                            {storeStatus === 'closed' && (\r\n" +
"                               <div className=\"bg-red-100/50 rounded-xl p-2 border border-red-200 flex flex-col justify-center mt-3 animate-in slide-in-from-top-2\" onClick={(e)=>e.stopPropagation()}>\r\n" +
"                                  <span className=\"text-[9px] font-black uppercase text-red-700 mb-1\">Anuncio de Reapertura:</span>\r\n" +
"                                  <input \r\n" +
"                                     type=\"text\" \r\n" +
"                                     value={closingTimeLabel} \r\n" +
"                                     onChange={(e) => {\r\n" +
"                                        setClosingTimeLabel(e.target.value);\r\n" +
"                                        onStoreStatusChange?.('closed', 0, e.target.value);\r\n" +
"                                     }}\r\n" +
"                                     placeholder=\"Ej. Mañana a las 8am / En 30 mins\" \r\n" +
"                                     className=\"w-full bg-white border border-red-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200/50 text-red-800 font-bold transition-all placeholder:text-red-300\"\r\n" +
"                                   />\r\n" +
"                                </div>\r\n" +
"                            )}\r\n" +
"                           </div>\r\n" +
"                         )}";

const replacement = "                            {storeStatus === 'closed' && (\r\n" +
"                               <div className=\"bg-red-100/50 rounded-xl p-2 border border-red-200 flex flex-col justify-center mt-3 animate-in slide-in-from-top-2\" onClick={(e)=>e.stopPropagation()}>\r\n" +
"                                  <span className=\"text-[9px] font-black uppercase text-red-700 mb-1\">Anuncio de Reapertura:</span>\r\n" +
"                                  <input \r\n" +
"                                     type=\"text\" \r\n" +
"                                     value={closingTimeLabel} \r\n" +
"                                     onChange={(e) => {\r\n" +
"                                        setClosingTimeLabel(e.target.value);\r\n" +
"                                        onStoreStatusChange?.('closed', 0, e.target.value);\r\n" +
"                                     }}\r\n" +
"                                     placeholder=\"Ej. Mañana a las 8am / En 30 mins\" \r\n" +
"                                     className=\"w-full bg-white border border-red-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200/50 text-red-800 font-bold transition-all placeholder:text-red-300\"\r\n" +
"                                   />\r\n" +
"                                </div>\r\n" +
"                            )}";

if (content.includes(target)) {
  fs.writeFileSync('components/Navbar.tsx', content.replace(target, replacement), 'utf8');
  console.log("SUCCESS");
} else {
  const targetLF = target.replace(/\r\n/g, '\n');
  const replacementLF = replacement.replace(/\r\n/g, '\n');
  if (content.includes(targetLF)) {
    fs.writeFileSync('components/Navbar.tsx', content.replace(targetLF, replacementLF), 'utf8');
    console.log("SUCCESS (LF)");
  } else {
    console.log("FAILED to match");
  }
}
