const fs = require('fs');
let code = fs.readFileSync('src/pages/Inicio2.tsx', 'utf8');

// Replace standard anchor tags with Links where appropriate
code = code.replace(/<a href="\/login"(.*?)>([\s\S]*?)<\/a>/g, '<Link to="/login"$1>$2</Link>');
code = code.replace(/<a href="\/termos"(.*?)>([\s\S]*?)<\/a>/g, '<Link to="/termos"$1>$2</Link>');
code = code.replace(/<a href="\/privacidade"(.*?)>([\s\S]*?)<\/a>/g, '<Link to="/privacidade"$1>$2</Link>');

// Fix hash links to use smooth scroll
code = code.replace(/<a href="#([^"]+)"(.*?)>/g, '<a href="#$1" onClick={(e) => { e.preventDefault(); const el = document.getElementById("$1"); if(el) el.scrollIntoView({behavior: "smooth"}); window.history.pushState(null, "", "#$1"); }}$2>');

// Ensure Link is imported from react-router-dom
if (!code.includes('Link,') && !code.includes(', Link')) {
  code = code.replace(/import {([^}]+)} from "react-router-dom"/, 'import { $1, Link } from "react-router-dom"');
}

fs.writeFileSync('src/pages/Inicio2.tsx', code);
console.log('done');
